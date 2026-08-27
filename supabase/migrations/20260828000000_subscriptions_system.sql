-- ==============================================================================
-- SCOLY SAAS V1 — SYSTÈME COMPLET D'ABONNEMENT (ESSAI 15J + START + PRO)
-- ==============================================================================
-- 1. Types énumérés (plans, périodes de facturation, statuts d'abonnement)
-- 2. Table `subscriptions` multi-tenant
-- 3. Index de performance et unicité par école
-- 4. Politiques RLS (Row Level Security) strictes
-- 5. Publication Realtime pour synchronisation multi-appareils
-- ==============================================================================

-- ─── 1. TYPES ÉNUMÉRÉS ────────────────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('start', 'pro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_billing_period AS ENUM ('monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 2. TABLE DES ABONNEMENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    plan subscription_plan NOT NULL DEFAULT 'start',
    billing_period subscription_billing_period NOT NULL DEFAULT 'monthly',
    status subscription_status NOT NULL DEFAULT 'trialing',
    price_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'FCFA',
    trial_start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_end_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '15 days'),
    subscription_start_at TIMESTAMPTZ,
    subscription_end_at TIMESTAMPTZ,
    refund_eligible_until TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    last_payment_reference VARCHAR(150),
    last_payment_method VARCHAR(50),
    payment_provider VARCHAR(50) DEFAULT 'fedapay',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_school_subscription UNIQUE(school_id)
);

-- ─── 3. INDEXES DE PERFORMANCE ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_school ON public.subscriptions(school_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_at ON public.subscriptions(subscription_end_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON public.subscriptions(trial_end_at);

-- ─── 4. SÉCURITÉ ROW LEVEL SECURITY (RLS) ─────────────────────────────────────
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_subscriptions_isolation ON public.subscriptions;
CREATE POLICY tenant_subscriptions_isolation ON public.subscriptions
    FOR ALL TO authenticated
    USING (
        school_id = current_user_school_id() 
        OR school_id IN (SELECT sm.school_id FROM public.school_members sm WHERE sm.user_id = auth.uid())
    )
    WITH CHECK (
        school_id = current_user_school_id() 
        OR school_id IN (SELECT sm.school_id FROM public.school_members sm WHERE sm.user_id = auth.uid())
    );

-- ─── 5. SYNCHRONISATION REALTIME ──────────────────────────────────────────────
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_object THEN null;
END $$;
