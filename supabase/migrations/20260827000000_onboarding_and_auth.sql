-- ==============================================================================
-- SCOLY SAAS V1 — ONBOARDING & EXTENDED SCHOOL PROFILE MIGRATION
-- ==============================================================================

-- 1. Ajouter les colonnes nécessaires à l'onboarding sur la table schools
ALTER TABLE schools ADD COLUMN IF NOT EXISTS education_types TEXT[] DEFAULT '{}';
ALTER TABLE schools ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS onboarding_current_step INT DEFAULT 1;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"unpaid_alerts": true, "upcoming_deadlines": true, "payment_received": true, "reminders_due": true}';

-- 2. Mettre à jour la fonction handle_new_user() pour initialiser proprement l'onboarding
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_school_id UUID := gen_random_uuid();
    v_year_id UUID := gen_random_uuid();
    v_school_name TEXT := COALESCE(NEW.raw_user_meta_data->>'school_name', 'Mon Établissement Scolaire');
    v_user_name TEXT := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
BEGIN
    -- 1. Création de l'école avec onboarding_completed = false
    INSERT INTO public.schools (
        id, 
        name, 
        code, 
        slug, 
        phone, 
        email, 
        address, 
        city, 
        country, 
        currency, 
        receipt_prefix, 
        receipt_counter,
        onboarding_completed,
        onboarding_current_step,
        notification_preferences
    )
    VALUES (
        v_school_id,
        v_school_name,
        'ECOLE-' || SUBSTRING(v_school_id::text FROM 1 FOR 6),
        'ecole-' || SUBSTRING(v_school_id::text FROM 1 FOR 6),
        COALESCE(NEW.raw_user_meta_data->>'phone', '+228 90 00 00 00'),
        NEW.email,
        'Quartier Administratif',
        'Lomé',
        'Togo',
        'FCFA',
        'REC-25-',
        0,
        false,
        1,
        '{"unpaid_alerts": true, "upcoming_deadlines": true, "payment_received": true, "reminders_due": true}'::jsonb
    );

    -- 2. Association du membre comme Directeur
    INSERT INTO public.school_members (school_id, user_id, role, first_name, last_name, phone, is_active)
    VALUES (
        v_school_id,
        NEW.id,
        'director',
        v_user_name,
        'Direction',
        COALESCE(NEW.raw_user_meta_data->>'phone', NEW.phone),
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

    -- 4. Création des moyens de paiement par défaut
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
