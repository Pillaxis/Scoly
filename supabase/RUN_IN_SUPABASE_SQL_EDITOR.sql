-- ==============================================================================
-- SCOLY SAAS — SCRIPT SQL D'ACTIVATION FINALE PRODUCTION (À EXÉCUTER SUR SUPABASE)
-- ==============================================================================
-- Projet Supabase : https://plwzzbtwovoxbaocijnz.supabase.co
-- Instructions : 
-- 1. Rendez-vous sur https://supabase.com/dashboard/project/plwzzbtwovoxbaocijnz/sql
-- 2. Cliquez sur "New query"
-- 3. Collez l'intégralité de ce script et cliquez sur "Run"
-- ==============================================================================

-- ─── 1. TYPES ÉNUMÉRÉS POUR ABONNEMENTS ET ROLES ──────────────────────────────
DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('start', 'pro', 'premium');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_billing_period AS ENUM ('monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 2. TABLE NOTIFICATIONS (CONTEXTUELLE ET ANTI-SPAM) ───────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    target_roles TEXT[] DEFAULT '{}',
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (priority IN ('info', 'success', 'warning', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    action_label VARCHAR(100),
    entity_type VARCHAR(50),
    entity_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    read_by UUID[] DEFAULT '{}',
    dedup_key VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_school_date ON public.notifications(school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_school_unread ON public.notifications(school_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_school_type ON public.notifications(school_id, type);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON public.notifications(school_id, entity_type, entity_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedup_unique ON public.notifications(school_id, dedup_key) WHERE dedup_key IS NOT NULL;

-- ─── 3. TABLE ABONNEMENTS SCOLY (START 100, PRO 500, PREMIUM 1500, ESSAI 30J) ───
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    plan subscription_plan NOT NULL DEFAULT 'start',
    billing_period subscription_billing_period NOT NULL DEFAULT 'monthly',
    status subscription_status NOT NULL DEFAULT 'trialing',
    price_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'FCFA',
    trial_start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_end_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    subscription_start_at TIMESTAMPTZ,
    subscription_end_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    last_payment_reference VARCHAR(150),
    last_payment_method VARCHAR(50),
    payment_provider VARCHAR(50) DEFAULT 'fedapay',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_school_subscription UNIQUE(school_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_school ON public.subscriptions(school_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_at ON public.subscriptions(subscription_end_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON public.subscriptions(trial_end_at);

-- ─── 4. PROCÉDURE TRANSACTIONNELLE ANTI-SURPAIEMENT (V3 STRICTE) ───────────────
CREATE OR REPLACE FUNCTION public.record_payment_v3(
    p_school_id UUID,
    p_academic_year_id UUID,
    p_student_id UUID,
    p_amount NUMERIC(12, 2),
    p_payment_method VARCHAR(50),
    p_transaction_ref VARCHAR(100),
    p_notes TEXT,
    p_recorded_by UUID,
    p_idempotency_key VARCHAR(150)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_due NUMERIC(12, 2) := 0;
    v_total_paid NUMERIC(12, 2) := 0;
    v_current_balance NUMERIC(12, 2) := 0;
    v_receipt_counter INT;
    v_receipt_prefix VARCHAR(10);
    v_receipt_number VARCHAR(50);
    v_new_payment_id UUID;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Le montant du versement doit être strictement supérieur à 0 FCFA.';
    END IF;

    IF p_idempotency_key IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.payments 
        WHERE school_id = p_school_id AND idempotency_key = p_idempotency_key
    ) THEN
        RAISE EXCEPTION 'Ce paiement a déjà été traité (protection anti-doublon idempotence).';
    END IF;

    -- 1. Montant total attendu pour cet élève
    SELECT COALESCE(s.custom_tuition, COALESCE(tp.total_amount, 150000) - COALESCE(s.discount_amount, 0))
    INTO v_total_due
    FROM public.students s
    LEFT JOIN public.tuition_plans tp ON tp.class_id = s.class_id AND tp.academic_year_id = p_academic_year_id
    WHERE s.id = p_student_id;

    -- 2. Montants déjà payés et validés
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM public.payments
    WHERE student_id = p_student_id 
      AND academic_year_id = p_academic_year_id 
      AND status = 'completed';

    v_current_balance := GREATEST(0, v_total_due - v_total_paid);

    -- 3. RÈGLE FINANCIÈRE IMPÉRATIVE : ZÉRO SURPAIEMENT
    IF v_current_balance <= 0 THEN
        RAISE EXCEPTION 'OVERPAYMENT_FORBIDDEN: La scolarité de cet élève est déjà intégralement soldée (0 FCFA restant dû). Aucun nouveau paiement ne peut être encaissé.';
    END IF;

    IF p_amount > v_current_balance THEN
        RAISE EXCEPTION 'OVERPAYMENT_FORBIDDEN: Montant trop élevé. Le solde restant dû est de % FCFA. Vous ne pouvez pas enregistrer un montant supérieur au solde restant.', v_current_balance;
    END IF;

    -- 4. Incrémentation atomique du reçu séquentiel
    UPDATE public.schools 
    SET receipt_counter = COALESCE(receipt_counter, 0) + 1
    WHERE id = p_school_id
    RETURNING receipt_prefix, receipt_counter INTO v_receipt_prefix, v_receipt_counter;

    v_receipt_number := COALESCE(v_receipt_prefix, 'REC-25-') || LPAD(v_receipt_counter::TEXT, 5, '0');

    -- 5. Insertion du paiement avec zéro crédit et aucune avance
    INSERT INTO public.payments (
        school_id,
        academic_year_id,
        student_id,
        amount,
        allocated_amount,
        credit_amount,
        is_advance,
        payment_method,
        transaction_ref,
        receipt_number,
        notes,
        recorded_by,
        status,
        idempotency_key
    ) VALUES (
        p_school_id,
        p_academic_year_id,
        p_student_id,
        p_amount,
        p_amount,
        0,
        false,
        p_payment_method,
        p_transaction_ref,
        v_receipt_number,
        p_notes,
        p_recorded_by,
        'completed',
        p_idempotency_key
    ) RETURNING id INTO v_new_payment_id;

    RETURN jsonb_build_object(
        'payment_id', v_new_payment_id,
        'receipt_number', v_receipt_number,
        'allocated_amount', p_amount,
        'credit_amount', 0,
        'is_advance', false,
        'new_balance', v_current_balance - p_amount
    );
END;
$$;

-- Alias pour compatibilité ascendante
CREATE OR REPLACE FUNCTION public.record_payment_v2(
    p_school_id UUID,
    p_academic_year_id UUID,
    p_student_id UUID,
    p_amount NUMERIC(12, 2),
    p_payment_method VARCHAR(50),
    p_transaction_ref VARCHAR(100),
    p_notes TEXT,
    p_recorded_by UUID,
    p_idempotency_key VARCHAR(150)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN public.record_payment_v3(
        p_school_id,
        p_academic_year_id,
        p_student_id,
        p_amount,
        p_payment_method,
        p_transaction_ref,
        p_notes,
        p_recorded_by,
        p_idempotency_key
    );
END;
$$;

-- ─── 5. ROW LEVEL SECURITY (RLS) SUR LES NOUVELLES TABLES ─────────────────────
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.current_user_school_id()
RETURNS UUID AS $$
    SELECT school_id FROM public.school_members 
    WHERE user_id = auth.uid() AND is_active = true 
    LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

DROP POLICY IF EXISTS tenant_notifications_isolation ON public.notifications;
CREATE POLICY tenant_notifications_isolation ON public.notifications
    FOR ALL TO authenticated
    USING (
        school_id = public.current_user_school_id() 
        OR school_id IN (SELECT sm.school_id FROM public.school_members sm WHERE sm.user_id = auth.uid())
    )
    WITH CHECK (
        school_id = public.current_user_school_id() 
        OR school_id IN (SELECT sm.school_id FROM public.school_members sm WHERE sm.user_id = auth.uid())
    );

DROP POLICY IF EXISTS tenant_subscriptions_isolation ON public.subscriptions;
CREATE POLICY tenant_subscriptions_isolation ON public.subscriptions
    FOR ALL TO authenticated
    USING (
        school_id = public.current_user_school_id() 
        OR school_id IN (SELECT sm.school_id FROM public.school_members sm WHERE sm.user_id = auth.uid())
    )
    WITH CHECK (
        school_id = public.current_user_school_id() 
        OR school_id IN (SELECT sm.school_id FROM public.school_members sm WHERE sm.user_id = auth.uid())
    );

-- ─── 6. PUBLICATION REALTIME POSTGRESQL MULTI-POSTES ──────────────────────────
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tuition_plans;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tuition_installments;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_object THEN null; END $$;

DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
EXCEPTION WHEN duplicate_object THEN null; WHEN undefined_object THEN null; END $$;
