-- ==============================================================================
-- MIGRATION : RÈGLE FINANCIÈRE STRICTE ANTI-SURPAIEMENT & REALTIME MULTI-POSTES
-- ==============================================================================

-- 1. PROCÉDURE TRANSACTIONNELLE record_payment_v3 (ET MISE À JOUR record_payment_v2)
CREATE OR REPLACE FUNCTION record_payment_v3(
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
    -- Règle 1 : Montant strictement positif
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Le montant du paiement doit être strictement supérieur à 0 FCFA.';
    END IF;

    -- Règle 2 : Vérification de l'idempotence
    IF p_idempotency_key IS NOT NULL AND EXISTS (
        SELECT 1 FROM payments 
        WHERE school_id = p_school_id AND idempotency_key = p_idempotency_key
    ) THEN
        RAISE EXCEPTION 'Ce paiement a déjà été traité (idempotence).';
    END IF;

    -- Récupération scolarité due nette pour cet élève
    SELECT COALESCE(s.custom_tuition, COALESCE(tp.total_amount, 150000) - COALESCE(s.discount_amount, 0))
    INTO v_total_due
    FROM students s
    LEFT JOIN tuition_plans tp ON tp.class_id = s.class_id AND tp.academic_year_id = p_academic_year_id
    WHERE s.id = p_student_id;

    -- Total déjà payé (hors paiements annulés)
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM payments
    WHERE student_id = p_student_id 
      AND academic_year_id = p_academic_year_id 
      AND status = 'completed';

    v_current_balance := GREATEST(0, v_total_due - v_total_paid);

    -- RÈGLE FINANCIÈRE ABSOLUE : ZÉRO SURPAIEMENT
    IF p_amount > v_current_balance THEN
        RAISE EXCEPTION 'OVERPAYMENT_FORBIDDEN: Le montant saisi (%.0f FCFA) dépasse le solde restant dû (%.0f FCFA). Aucun surpaiement ou avance automatique n''est autorisé.', p_amount, v_current_balance;
    END IF;

    -- Incrémentation atomique du compteur de reçu
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

-- Remplacer également record_payment_v2 pour assurer la sécurité sur les anciens appels
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
BEGIN
    RETURN record_payment_v3(
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

-- 2. PUBLICATION SUPABASE REALTIME (Synchronisation Multi-Postes)
DO $$
BEGIN
    -- Active la publication realtime pour toutes les tables clés si elle existe
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE payments;
        ALTER PUBLICATION supabase_realtime ADD TABLE students;
        ALTER PUBLICATION supabase_realtime ADD TABLE tuition_plans;
        ALTER PUBLICATION supabase_realtime ADD TABLE classes;
        ALTER PUBLICATION supabase_realtime ADD TABLE subscriptions;
    END IF;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN OTHERS THEN NULL;
END $$;
