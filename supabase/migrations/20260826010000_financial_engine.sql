-- ==============================================================================
-- SCOLY SAAS V1 - REINFORCED FINANCIAL ENGINE MIGRATION
-- ==============================================================================

-- 1. Ajout des colonnes de gestion des avances, allocations et annulations sur la table payments
ALTER TABLE payments 
    ADD COLUMN IF NOT EXISTS allocated_amount NUMERIC(12, 2) CHECK (allocated_amount >= 0),
    ADD COLUMN IF NOT EXISTS credit_amount NUMERIC(12, 2) DEFAULT 0 CHECK (credit_amount >= 0),
    ADD COLUMN IF NOT EXISTS is_advance BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
    ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(150);

-- Index pour accélérer la détection des doublons de référence et d'idempotence
CREATE INDEX IF NOT EXISTS idx_payments_school_trans_ref ON payments(school_id, transaction_ref) WHERE transaction_ref IS NOT NULL AND status != 'cancelled';
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency_unique ON payments(school_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

-- 2. Fonction transactionnelle PostgreSQL d'enregistrement d'un paiement sécurisé
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
    -- Refuser montant <= 0
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Le montant du paiement doit être strictement supérieur à 0 FCFA.';
    END IF;

    -- Vérifier doublon d'idempotence
    IF p_idempotency_key IS NOT NULL AND EXISTS (
        SELECT 1 FROM payments 
        WHERE school_id = p_school_id 
          AND idempotency_key = p_idempotency_key
    ) THEN
        RAISE EXCEPTION 'Ce paiement a déjà été traité (clé idempotence dupliquée).';
    END IF;

    -- Vérifier doublon de référence mobile money / banque si renseignée
    IF p_transaction_ref IS NOT NULL AND trim(p_transaction_ref) != '' AND EXISTS (
        SELECT 1 FROM payments 
        WHERE school_id = p_school_id 
          AND transaction_ref = trim(p_transaction_ref)
          AND status = 'completed'
    ) THEN
        RAISE EXCEPTION 'Un paiement avec la référence de transaction % a déjà été enregistré.', p_transaction_ref;
    END IF;

    -- Calcul du total dû par l'élève (scolarité nette)
    SELECT COALESCE(s.discount_amount, 0) INTO v_total_due
    FROM students s WHERE s.id = p_student_id;

    -- Récupérer la grille tarifaire de la classe
    SELECT COALESCE(tp.total_amount, 150000) - COALESCE(s.discount_amount, 0)
    INTO v_total_due
    FROM students s
    LEFT JOIN tuition_plans tp ON tp.class_id = s.class_id AND tp.academic_year_id = p_academic_year_id
    WHERE s.id = p_student_id;

    -- Calcul du total déjà payé non annulé
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_paid
    FROM payments
    WHERE student_id = p_student_id 
      AND academic_year_id = p_academic_year_id 
      AND status = 'completed';

    -- Solde actuel
    v_current_balance := GREATEST(0, v_total_due - v_total_paid);

    -- Répartition montant affecté à la dette vs avance/crédit
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
        p_payment_method::payment_method,
        p_transaction_ref,
        v_receipt_number,
        p_notes,
        p_recorded_by,
        'completed',
        p_idempotency_key
    ) RETURNING id INTO v_new_payment_id;

    -- Journal d'audit
    INSERT INTO audit_logs (
        school_id,
        user_id,
        action,
        entity_type,
        entity_id,
        payload
    ) VALUES (
        p_school_id,
        p_recorded_by,
        'RECORD_PAYMENT',
        'payment',
        v_new_payment_id,
        jsonb_build_object(
            'student_id', p_student_id,
            'amount', p_amount,
            'allocated_amount', v_allocated_amount,
            'credit_amount', v_credit_amount,
            'is_advance', v_is_advance,
            'previous_balance', v_current_balance,
            'new_balance', GREATEST(0, v_current_balance - p_amount),
            'receipt_number', v_receipt_number,
            'transaction_ref', p_transaction_ref
        )
    );

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
