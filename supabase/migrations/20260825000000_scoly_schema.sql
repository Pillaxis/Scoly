-- ==============================================================================
-- SCOLY SAAS V1 - DATABASE SCHEMA (POSTGRESQL 16 & SUPABASE RLS)
-- ==============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 1. ÉCOLES (TENANTS MULTI-ÉTABLISSEMENTS)
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,      -- Ex: "CS-LUMIERE-LOME"
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Lomé',
    country VARCHAR(100) DEFAULT 'Togo',
    currency VARCHAR(10) DEFAULT 'FCFA',
    receipt_prefix VARCHAR(10) DEFAULT 'REC-',
    receipt_counter INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ANNÉES SCOLAIRES
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,            -- Ex: "2025-2026"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEMBRES DE L'ÉCOLE ET RÔLES (RBAC)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'director', 'accountant', 'secretary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS school_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'secretary',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, user_id)
);

-- 4. CLASSES
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,            -- Ex: "6ème A", "CM2", "Terminale D"
    level VARCHAR(50) DEFAULT 'Secondaire',-- "Primaire", "Collège", "Lycée"
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. GRILLES TARIFAIRES DE SCOLARITÉ
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

-- 6. ÉCHÉANCES PRÉVUES PAR GRILLE
CREATE TABLE IF NOT EXISTS tuition_installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tuition_plan_id UUID NOT NULL REFERENCES tuition_plans(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,           -- Ex: "1ère Tranche (Rentrée)", "2ème Tranche"
    due_date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    installment_order INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PARENTS / TUTEURS
CREATE TABLE IF NOT EXISTS parents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    full_name VARCHAR(200) NOT NULL,
    relationship VARCHAR(50) DEFAULT 'Parent', -- 'Père', 'Mère', 'Tuteur'
    phone_primary VARCHAR(50) NOT NULL,
    phone_whatsapp VARCHAR(50),
    email VARCHAR(255),
    profession VARCHAR(100),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ÉLÈVES
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(school_id, academic_year_id, matricule)
);

-- 9. LIAISON ÉLÈVES <-> PARENTS
CREATE TABLE IF NOT EXISTS student_parents (
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    is_primary_contact BOOLEAN DEFAULT true,
    PRIMARY KEY (student_id, parent_id)
);

-- 10. PAIEMENTS
DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'tmoney', 'flooz', 'bank_transfer', 'cheque', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method payment_method NOT NULL DEFAULT 'cash',
    transaction_ref VARCHAR(100),
    receipt_number VARCHAR(50) NOT NULL,
    notes TEXT,
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. HISTORIQUE DES RELANCES
DO $$ BEGIN
    CREATE TYPE reminder_channel AS ENUM ('whatsapp', 'sms', 'phone_call', 'email');
    CREATE TYPE reminder_status AS ENUM ('prepared', 'sent', 'delivered', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

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

-- 12. LOGS D'AUDIT
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

-- INDEXES POUR ACCÉLÉRATION REQUÊTES
CREATE INDEX IF NOT EXISTS idx_students_school_class ON students(school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_students_search_trgm ON students USING gin ((first_name || ' ' || last_name || ' ' || matricule) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_school_date ON payments(school_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_parents_phone ON parents(school_id, phone_primary);
CREATE INDEX IF NOT EXISTS idx_tuition_plans_class ON tuition_plans(school_id, class_id);

-- ROW LEVEL SECURITY (RLS)
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
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper pour retrouver le tenant courant
CREATE OR REPLACE FUNCTION current_user_school_id()
RETURNS UUID AS $$
    SELECT school_id FROM school_members 
    WHERE user_id = auth.uid() AND is_active = true 
    LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Exemples de politiques RLS d'isolation par établissement
DROP POLICY IF EXISTS tenant_schools_isolation ON schools;
CREATE POLICY tenant_schools_isolation ON schools
    FOR SELECT USING (id = current_user_school_id());

DROP POLICY IF EXISTS tenant_students_isolation ON students;
CREATE POLICY tenant_students_isolation ON students
    FOR ALL USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

DROP POLICY IF EXISTS tenant_payments_isolation ON payments;
CREATE POLICY tenant_payments_isolation ON payments
    FOR ALL USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

DROP POLICY IF EXISTS tenant_parents_isolation ON parents;
CREATE POLICY tenant_parents_isolation ON parents
    FOR ALL USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

DROP POLICY IF EXISTS tenant_tuition_isolation ON tuition_plans;
CREATE POLICY tenant_tuition_isolation ON tuition_plans
    FOR ALL USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());
