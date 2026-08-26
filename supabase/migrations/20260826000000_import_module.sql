-- ==============================================================================
-- SCOLY SAAS V1 - MODULE D'IMPORT INTELLIGENT DES DONNÉES
-- ==============================================================================

-- 1. TABLE DES LOTS D'IMPORTATION (AUDIT & TRAÇABILITÉ MULTI-TENANT)
CREATE TABLE IF NOT EXISTS import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    user_name VARCHAR(255) DEFAULT 'Direction',
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('excel', 'csv', 'google_sheets', 'photo_ocr')),
    file_name VARCHAR(255),
    total_rows INT NOT NULL DEFAULT 0,
    imported_students_count INT NOT NULL DEFAULT 0,
    imported_payments_count INT NOT NULL DEFAULT 0,
    errors_count INT NOT NULL DEFAULT 0,
    duplicates_count INT NOT NULL DEFAULT 0,
    payload_summary JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES POUR TRAÇABILITÉ RAPIDE PAR ÉCOLE
CREATE INDEX IF NOT EXISTS idx_import_batches_school ON import_batches(school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_batches_year ON import_batches(academic_year_id);

-- ROW LEVEL SECURITY (RLS) SUR LES BATCHES D'IMPORT
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tenant_import_batches_isolation ON import_batches;
CREATE POLICY tenant_import_batches_isolation ON import_batches
    FOR ALL USING (school_id = current_user_school_id())
    WITH CHECK (school_id = current_user_school_id());
