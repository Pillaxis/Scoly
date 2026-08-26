-- ==============================================================================
-- SCOLY SAAS V1 - TUITION PLANS & INSTALLMENTS ENGINE ENFORCEMENT
-- ==============================================================================

-- 1. Trigger function to enforce that total installments cannot exceed total tuition amount
CREATE OR REPLACE FUNCTION check_tuition_installments_sum()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_plan_amount NUMERIC(12, 2);
    v_installments_sum NUMERIC(12, 2);
BEGIN
    -- Obtenir le montant total de la scolarité annuelle
    SELECT total_amount INTO v_total_plan_amount
    FROM tuition_plans
    WHERE id = NEW.tuition_plan_id;

    IF v_total_plan_amount IS NULL THEN
        RETURN NEW;
    END IF;

    -- Obtenir la somme de toutes les tranches (y compris la nouvelle / modifiée)
    SELECT COALESCE(SUM(amount), 0) INTO v_installments_sum
    FROM tuition_installments
    WHERE tuition_plan_id = NEW.tuition_plan_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

    v_installments_sum := v_installments_sum + NEW.amount;

    IF v_installments_sum > v_total_plan_amount THEN
        RAISE EXCEPTION 'Le total des tranches (%) ne peut pas dépasser le montant total de la scolarité annuelle (%). Dépassement: % FCFA.',
            v_installments_sum, v_total_plan_amount, (v_installments_sum - v_total_plan_amount);
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_tuition_installments_sum ON tuition_installments;
CREATE TRIGGER trg_check_tuition_installments_sum
BEFORE INSERT OR UPDATE ON tuition_installments
FOR EACH ROW
EXECUTE FUNCTION check_tuition_installments_sum();

-- 2. Fonction transactionnelle atomique d'enregistrement d'une grille tarifaire
CREATE OR REPLACE FUNCTION save_tuition_plan_v1(
    p_school_id UUID,
    p_academic_year_id UUID,
    p_class_id UUID,
    p_total_amount NUMERIC(12, 2),
    p_description TEXT,
    p_installments JSONB,
    p_user_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_plan_id UUID;
    v_installment RECORD;
    v_sum_installments NUMERIC(12, 2) := 0;
    v_item JSONB;
    v_title VARCHAR(100);
    v_due_date DATE;
    v_amount NUMERIC(12, 2);
    v_order INT := 1;
BEGIN
    -- 1. Validation du montant global
    IF p_total_amount <= 0 THEN
        RAISE EXCEPTION 'Le montant total de la scolarité annuelle doit être strictement supérieur à 0 FCFA.';
    END IF;

    -- 2. Validation de la présence d'au moins une tranche
    IF jsonb_array_length(p_installments) = 0 THEN
        RAISE EXCEPTION 'Au moins une tranche d''échéance doit être définie pour la grille tarifaire.';
    END IF;

    -- 3. Pré-calcul et validation de chaque tranche
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_installments)
    LOOP
        v_title := trim(v_item->>'title');
        v_due_date := (v_item->>'due_date')::DATE;
        v_amount := (v_item->>'amount')::NUMERIC(12, 2);

        IF v_title IS NULL OR v_title = '' THEN
            RAISE EXCEPTION 'Chaque tranche doit posséder un libellé valide.';
        END IF;

        IF v_due_date IS NULL THEN
            RAISE EXCEPTION 'Chaque tranche doit posséder une date d''échéance valide.';
        END IF;

        IF v_amount IS NULL OR v_amount <= 0 THEN
            RAISE EXCEPTION 'Le montant de chaque tranche doit être strictement supérieur à 0 FCFA.';
        END IF;

        v_sum_installments := v_sum_installments + v_amount;
    END LOOP;

    -- 4. Règle absolue : Somme des tranches <= Montant de la scolarité
    IF v_sum_installments > p_total_amount THEN
        RAISE EXCEPTION 'Le montant total des tranches (%) dépasse la scolarité annuelle (%). Dépassement: % FCFA.',
            v_sum_installments, p_total_amount, (v_sum_installments - p_total_amount);
    END IF;

    -- 5. Upsert atomique de la grille tarifaire
    INSERT INTO tuition_plans (
        school_id,
        academic_year_id,
        class_id,
        total_amount,
        description
    ) VALUES (
        p_school_id,
        p_academic_year_id,
        p_class_id,
        p_total_amount,
        p_description
    )
    ON CONFLICT (school_id, academic_year_id, class_id)
    DO UPDATE SET
        total_amount = EXCLUDED.total_amount,
        description = EXCLUDED.description,
        created_at = NOW()
    RETURNING id INTO v_plan_id;

    -- 6. Remplacement atomique des tranches
    DELETE FROM tuition_installments WHERE tuition_plan_id = v_plan_id;

    v_order := 1;
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_installments)
    LOOP
        INSERT INTO tuition_installments (
            tuition_plan_id,
            title,
            due_date,
            amount,
            installment_order
        ) VALUES (
            v_plan_id,
            trim(v_item->>'title'),
            (v_item->>'due_date')::DATE,
            (v_item->>'amount')::NUMERIC(12, 2),
            v_order
        );
        v_order := v_order + 1;
    END LOOP;

    -- 7. Audit Log
    INSERT INTO audit_logs (
        school_id,
        user_id,
        action,
        entity_type,
        entity_id,
        payload
    ) VALUES (
        p_school_id,
        p_user_id,
        'SAVE_TUITION_PLAN',
        'tuition_plan',
        v_plan_id,
        jsonb_build_object(
            'class_id', p_class_id,
            'total_amount', p_total_amount,
            'installments_count', jsonb_array_length(p_installments),
            'sum_installments', v_sum_installments
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'plan_id', v_plan_id,
        'total_amount', p_total_amount,
        'sum_installments', v_sum_installments,
        'remaining_amount', (p_total_amount - v_sum_installments)
    );
END;
$$;
