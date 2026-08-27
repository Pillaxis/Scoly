-- ==============================================================================
-- SCOLY SAAS V1 — SCHÉMA COMPLET ET DÉPLOIEMENT SUPABASE POSTGRESQL (STRICT RLS)
-- ==============================================================================
-- 1. Tables multi-établissements (écoles, années, classes, élèves, paiements...)
-- 2. Procédures transactionnelles (enregistrement de paiement, grilles tarifaires)
-- 3. RLS (Row Level Security) pour isolation stricte par école
-- 4. Trigger automatique à la création de compte utilisateur
-- 5. Données initiales et structure par défaut
-- ==============================================================================

-- ─── 0. EXTENSIONS POSTGRESQL ─────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─── 1. TYPES ÉNUMÉRÉS ────────────────────────────────────────────────────────
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'director', 'accountant', 'secretary');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'tmoney', 'flooz', 'bank_transfer', 'cheque', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE reminder_channel AS ENUM ('whatsapp', 'sms', 'phone_call', 'email');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE reminder_status AS ENUM ('prepared', 'sent', 'delivered', 'failed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_plan AS ENUM ('start', 'pro');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_billing_period AS ENUM ('monthly', 'yearly');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'expired', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 2. TABLES FONDAMENTALES ──────────────────────────────────────────────────


-- 2.1 ÉCOLES (TENANTS MULTI-ÉTABLISSEMENTS)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Lomé',
    country VARCHAR(100) DEFAULT 'Togo',
    currency VARCHAR(10) DEFAULT 'FCFA',
    receipt_prefix VARCHAR(10) DEFAULT 'REC-25-',
    receipt_counter INT DEFAULT 0,
    education_types TEXT[] DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_current_step INT DEFAULT 1,
    notification_preferences JSONB DEFAULT '{"unpaid_alerts": true, "upcoming_deadlines": true, "payment_received": true, "reminders_due": true}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 ANNÉES SCOLAIRES
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 MEMBRES DE L'ÉCOLE (RBAC)
CREATE TABLE IF NOT EXISTS school_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'director',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, user_id)
);

-- 2.4 CLASSES
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    level VARCHAR(50) DEFAULT 'Secondaire',
    series VARCHAR(50),
    cycle_year VARCHAR(50),
    branch VARCHAR(100),
    is_custom BOOLEAN DEFAULT false,
    description TEXT,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 GRILLES TARIFAIRES
CREATE TABLE IF NOT EXISTS tuition_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, academic_year_id, class_id)
);

-- 2.6 TRANCHES / ÉCHÉANCES PAR GRILLE
CREATE TABLE IF NOT EXISTS tuition_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tuition_plan_id UUID NOT NULL REFERENCES tuition_plans(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    installment_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 PARENTS / TUTEURS
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    relationship VARCHAR(50) DEFAULT 'Parent',
    phone_primary VARCHAR(50) NOT NULL,
    phone_whatsapp VARCHAR(50),
    email VARCHAR(255),
    profession VARCHAR(100),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 ÉLÈVES
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    matricule VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('M', 'F')),
    birth_date DATE,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    discount_amount NUMERIC(12, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    discount_reason VARCHAR(255),
    custom_tuition NUMERIC(12, 2) CHECK (custom_tuition >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, academic_year_id, matricule)
);

-- 2.9 LIAISON ÉLÈVE <-> PARENT
CREATE TABLE IF NOT EXISTS student_parents (
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    is_primary_contact BOOLEAN DEFAULT true,
    PRIMARY KEY (student_id, parent_id)
);

-- 2.10 PAIEMENTS & REÇUS SÉCURISÉS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    allocated_amount NUMERIC(12, 2) CHECK (allocated_amount >= 0),
    credit_amount NUMERIC(12, 2) DEFAULT 0 CHECK (credit_amount >= 0),
    is_advance BOOLEAN DEFAULT false,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
    transaction_ref VARCHAR(100),
    receipt_number VARCHAR(50) NOT NULL,
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES auth.users(id),
    idempotency_key VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.11 MOYENS DE PAIEMENT CONFIGURABLES
CREATE TABLE IF NOT EXISTS payment_methods_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, key)
);

-- 2.12 HISTORIQUE DES RELANCES
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    channel reminder_channel NOT NULL DEFAULT 'whatsapp',
    message_content TEXT NOT NULL,
    amount_due NUMERIC(12, 2) NOT NULL,
    days_late INT DEFAULT 0,
    status reminder_status DEFAULT 'sent',
    sent_by UUID REFERENCES auth.users(id),
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.13 BATCHES D'IMPORTATION
CREATE TABLE IF NOT EXISTS import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    user_name VARCHAR(255) DEFAULT 'Direction',
    source_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255),
    total_rows INT NOT NULL DEFAULT 0,
    imported_students_count INT NOT NULL DEFAULT 0,
    imported_payments_count INT NOT NULL DEFAULT 0,
    errors_count INT NOT NULL DEFAULT 0,
    duplicates_count INT NOT NULL DEFAULT 0,
    payload_summary JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.14 LOGS D'AUDIT
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.15 NOTIFICATIONS (SYSTÈME INTELLIGENT ET CONTEXTUEL)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
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

-- 2.16 ABONNEMENTS SCOLY (SAAS SUBSCRIPTIONS)
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
CREATE INDEX IF NOT EXISTS idx_students_school_class ON students(school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_school_date ON payments(school_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_parents_school_phone ON parents(school_id, phone_primary);
CREATE INDEX IF NOT EXISTS idx_tuition_plans_class ON tuition_plans(school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_school ON payment_methods_config(school_id, order_index);
CREATE INDEX IF NOT EXISTS idx_import_batches_school ON import_batches(school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_school_date ON notifications(school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_school_unread ON notifications(school_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_school_type ON notifications(school_id, type);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(school_id, entity_type, entity_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedup_unique ON notifications(school_id, dedup_key) WHERE dedup_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_school ON public.subscriptions(school_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_end_at ON public.subscriptions(subscription_end_at);
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end ON public.subscriptions(trial_end_at);



-- ─── 4. PROCÉDURE TRANSACTIONNELLE DE PAIEMENT SÉCURISÉ ────────────────────────
CREATE OR REPLACE FUNCTION record_payment_v2(
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
    v_allocated_amount NUMERIC(12, 2) := 0;
    v_credit_amount NUMERIC(12, 2) := 0;
    v_is_advance BOOLEAN := false;
    v_receipt_counter INT;
    v_receipt_prefix VARCHAR(10);
    v_receipt_number VARCHAR(50);
    v_new_payment_id UUID;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Le montant du paiement doit être strictement supérieur à 0 FCFA.';
    END IF;

    IF p_idempotency_key IS NOT NULL AND EXISTS (
        SELECT 1 FROM payments 
        WHERE school_id = p_school_id AND idempotency_key = p_idempotency_key
    ) THEN
        RAISE EXCEPTION 'Ce paiement a déjà été traité (idempotence).';
    END IF;

    -- Récupération scolarité due
    SELECT COALESCE(s.custom_tuition, COALESCE(tp.total_amount, 150000) - COALESCE(s.discount_amount, 0))
    INTO v_total_due
    FROM students s
    LEFT JOIN tuition_plans tp ON tp.class_id = s.class_id AND tp.academic_year_id = p_academic_year_id
    WHERE s.id = p_student_id;

    -- Total déjà payé
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM payments
    WHERE student_id = p_student_id 
      AND academic_year_id = p_academic_year_id 
      AND status = 'completed';

    v_current_balance := GREATEST(0, v_total_due - v_total_paid);
    v_allocated_amount := LEAST(p_amount, v_current_balance);
    v_credit_amount := GREATEST(0, p_amount - v_current_balance);
    v_is_advance := (v_credit_amount > 0);

    -- Incrémentation atomique du numéro de reçu
    UPDATE schools 
    SET receipt_counter = COALESCE(receipt_counter, 0) + 1
    WHERE id = p_school_id
    RETURNING receipt_prefix, receipt_counter INTO v_receipt_prefix, v_receipt_counter;

    v_receipt_number := COALESCE(v_receipt_prefix, 'REC-25-') || LPAD(v_receipt_counter::TEXT, 5, '0');

    -- Insertion du paiement
    INSERT INTO payments (
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
        v_allocated_amount,
        v_credit_amount,
        v_is_advance,
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
        'allocated_amount', v_allocated_amount,
        'credit_amount', v_credit_amount,
        'is_advance', v_is_advance,
        'new_balance', GREATEST(0, v_current_balance - p_amount)
    );
END;
$$;

-- ─── 5. ROW LEVEL SECURITY (RLS) & ISOLATION MULTI-TENANT STRICTE ─────────────
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tuition_installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


-- Helper pour identifier l'école de l'utilisateur connecté
CREATE OR REPLACE FUNCTION current_user_school_id()
RETURNS UUID AS $$
    SELECT school_id FROM public.school_members 
    WHERE user_id = auth.uid() AND is_active = true 
    LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 5.1 Politiques Écoles
DROP POLICY IF EXISTS tenant_schools_isolation ON schools;
CREATE POLICY tenant_schools_isolation ON schools
    FOR ALL TO authenticated
    USING (id = current_user_school_id() OR id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()))
    WITH CHECK (id = current_user_school_id() OR id IN (SELECT school_id FROM public.school_members WHERE user_id = auth.uid()));

-- 5.2 Politiques Membres
DROP POLICY IF EXISTS tenant_school_members_isolation ON school_members;
CREATE POLICY tenant_school_members_isolation ON school_members
    FOR ALL TO authenticated
    USING (user_id = auth.uid() OR school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

-- 5.3 Politiques Années Scolaires
DROP POLICY IF EXISTS tenant_academic_years_isolation ON academic_years;
CREATE POLICY tenant_academic_years_isolation ON academic_years
    FOR ALL TO authenticated
    USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

-- 5.4 Politiques Classes
DROP POLICY IF EXISTS tenant_classes_isolation ON classes;
CREATE POLICY tenant_classes_isolation ON classes
    FOR ALL TO authenticated
    USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

-- 5.5 Politiques Grilles Tarifaires
DROP POLICY IF EXISTS tenant_tuition_plans_isolation ON tuition_plans;
CREATE POLICY tenant_tuition_plans_isolation ON tuition_plans
    FOR ALL TO authenticated
    USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

-- 5.6 Politiques Échéances
DROP POLICY IF EXISTS tenant_tuition_installments_isolation ON tuition_installments;
CREATE POLICY tenant_tuition_installments_isolation ON tuition_installments
    FOR ALL TO authenticated
    USING (tuition_plan_id IN (SELECT id FROM tuition_plans WHERE school_id = current_user_school_id()))
    WITH CHECK (tuition_plan_id IN (SELECT id FROM tuition_plans WHERE school_id = current_user_school_id()));

-- 5.7 Politiques Parents
DROP POLICY IF EXISTS tenant_parents_isolation ON parents;
CREATE POLICY tenant_parents_isolation ON parents
    FOR ALL TO authenticated
    USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

-- 5.8 Politiques Élèves
DROP POLICY IF EXISTS tenant_students_isolation ON students;
CREATE POLICY tenant_students_isolation ON students
    FOR ALL TO authenticated
    USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

-- 5.9 Politiques Liaisons Élèves-Parents
DROP POLICY IF EXISTS tenant_student_parents_isolation ON student_parents;
CREATE POLICY tenant_student_parents_isolation ON student_parents
    FOR ALL TO authenticated
    USING (student_id IN (SELECT id FROM students WHERE school_id = current_user_school_id()))
    WITH CHECK (student_id IN (SELECT id FROM students WHERE school_id = current_user_school_id()));

-- 5.10 Politiques Paiements
DROP POLICY IF EXISTS tenant_payments_isolation ON payments;
CREATE POLICY tenant_payments_isolation ON payments
    FOR ALL TO authenticated
    USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

-- 5.11 Politiques Moyens de Paiement
DROP POLICY IF EXISTS tenant_payment_methods_isolation ON payment_methods_config;
CREATE POLICY tenant_payment_methods_isolation ON payment_methods_config
    FOR ALL TO authenticated
    USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

-- 5.12 Politiques Relances
DROP POLICY IF EXISTS tenant_reminders_isolation ON reminders;
CREATE POLICY tenant_reminders_isolation ON reminders
    FOR ALL TO authenticated
    USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

-- 5.13 Politiques Import Batches
DROP POLICY IF EXISTS tenant_import_batches_isolation ON import_batches;
CREATE POLICY tenant_import_batches_isolation ON import_batches
    FOR ALL TO authenticated
    USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

-- 5.14 Politiques Audit Logs
DROP POLICY IF EXISTS tenant_audit_logs_isolation ON audit_logs;
CREATE POLICY tenant_audit_logs_isolation ON audit_logs
    FOR ALL TO authenticated
    USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

-- 5.15 Politiques Notifications
DROP POLICY IF EXISTS tenant_notifications_isolation ON notifications;
CREATE POLICY tenant_notifications_isolation ON notifications
    FOR ALL TO authenticated
    USING (
        school_id = current_user_school_id() 
        OR school_id IN (SELECT sm.school_id FROM public.school_members sm WHERE sm.user_id = auth.uid())
    )
    WITH CHECK (
        school_id = current_user_school_id() 
        OR school_id IN (SELECT sm.school_id FROM public.school_members sm WHERE sm.user_id = auth.uid())
    );

-- 5.16 Politiques Abonnements (Subscriptions)
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

-- 5.17 Publication Realtime
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_object THEN null;
END $$;


-- ─── 6. TRIGGER AUTOMATIQUE POUR TOUT NOUVEAU COMPTE UTILISATEUR ──────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_school_id UUID := gen_random_uuid();
    v_year_id UUID := gen_random_uuid();
    v_school_name TEXT := COALESCE(NEW.raw_user_meta_data->>'school_name', 'Mon Établissement Scolaire');
    v_user_name TEXT := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
BEGIN
    -- 1. Création de l'école
    INSERT INTO public.schools (id, name, code, slug, phone, email, address, city, country, currency, receipt_prefix, receipt_counter, onboarding_completed, onboarding_current_step)
    VALUES (
        v_school_id,
        v_school_name,
        'ECOLE-' || SUBSTRING(v_school_id::text FROM 1 FOR 6),
        'ecole-' || SUBSTRING(v_school_id::text FROM 1 FOR 6),
        '+228 90 00 00 00',
        NEW.email,
        'Quartier Administratif',
        'Lomé',
        'Togo',
        'FCFA',
        'REC-25-',
        0,
        false,
        1
    );

    -- 2. Association du membre comme Directeur/Propriétaire
    INSERT INTO public.school_members (school_id, user_id, role, first_name, last_name, phone, is_active)
    VALUES (
        v_school_id,
        NEW.id,
        'director',
        v_user_name,
        'Direction',
        NEW.phone,
        true
    );

    -- 3. Création de l'année scolaire courante
    INSERT INTO public.academic_years (id, school_id, name, start_date, end_date, is_current)
    VALUES (
        v_year_id,
        v_school_id,
        '2025-2026',
        '2025-09-15',
        '2026-06-30',
        true
    );

    -- 4. Création des classes par défaut
    INSERT INTO public.classes (school_id, academic_year_id, name, level, order_index) VALUES
        (v_school_id, v_year_id, 'CI', 'Primaire', 1),
        (v_school_id, v_year_id, 'CP', 'Primaire', 2),
        (v_school_id, v_year_id, 'CE1', 'Primaire', 3),
        (v_school_id, v_year_id, 'CE2', 'Primaire', 4),
        (v_school_id, v_year_id, 'CM1', 'Primaire', 5),
        (v_school_id, v_year_id, 'CM2', 'Primaire', 6),
        (v_school_id, v_year_id, '6ème A', 'Collège', 7),
        (v_school_id, v_year_id, '5ème A', 'Collège', 8),
        (v_school_id, v_year_id, '4ème A', 'Collège', 9),
        (v_school_id, v_year_id, '3ème A', 'Collège', 10),
        (v_school_id, v_year_id, '2nde CD', 'Lycée', 11),
        (v_school_id, v_year_id, '1ère D', 'Lycée', 12),
        (v_school_id, v_year_id, 'Terminale D', 'Lycée', 13);

    -- 5. Création des moyens de paiement par défaut
    INSERT INTO public.payment_methods_config (school_id, key, label, is_active, order_index) VALUES
        (v_school_id, 'cash', 'Espèces', true, 0),
        (v_school_id, 'tmoney', 'TMoney', true, 1),
        (v_school_id, 'flooz', 'Flooz', true, 2),
        (v_school_id, 'bank_transfer', 'Virement bancaire', true, 3),
        (v_school_id, 'cheque', 'Chèque', true, 4),
        (v_school_id, 'other', 'Autre', true, 5);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
