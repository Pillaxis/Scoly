-- ==============================================================================
-- SCOLY SAAS V1 - CONFIGURABLE PAYMENT METHODS
-- ==============================================================================

-- Table pour stocker les moyens de paiement configurables par école
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

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_payment_methods_school ON payment_methods_config(school_id, order_index);

-- RLS
ALTER TABLE payment_methods_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_payment_methods_isolation ON payment_methods_config;
CREATE POLICY tenant_payment_methods_isolation ON payment_methods_config
    FOR ALL USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());

-- Données par défaut (insérées par l'application au premier lancement)
-- Les moyens de paiement sont gérés dynamiquement via l'interface /settings
