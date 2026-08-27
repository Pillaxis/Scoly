-- ==============================================================================
-- SCOLY SAAS V1 — INTELLIGENT REAL-TIME NOTIFICATIONS SYSTEM MIGRATION
-- ==============================================================================

-- 1. Table des notifications contextuelles, temps réel et persistées
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Optionnel (NULL = accessible à tous les membres de l'école selon target_roles)
    target_roles TEXT[] DEFAULT '{}',                        -- ['owner', 'director', 'accountant', 'secretary'] (vide = tous)
    type VARCHAR(50) NOT NULL,                               -- 'payment_recorded', 'debt_critical', 'due_upcoming', etc.
    priority VARCHAR(20) NOT NULL DEFAULT 'info' CHECK (priority IN ('info', 'success', 'warning', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,                                         -- '/payments', '/debts?filter=critical', etc.
    action_label VARCHAR(100),                               -- 'Voir le reçu', 'Relancer', etc.
    entity_type VARCHAR(50),                                 -- 'payment', 'student', 'class', 'import_batch', 'system', 'debt'
    entity_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    read_by UUID[] DEFAULT '{}',                             -- Identifiants des utilisateurs ayant lu la notification
    dedup_key VARCHAR(150),                                  -- Clé unique de déduplication anti-spam (ex: upcoming_2026-08-27_sch-01)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes de performance pour accélérer les requêtes du centre de notifications
CREATE INDEX IF NOT EXISTS idx_notifications_school_date ON notifications(school_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_school_unread ON notifications(school_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_school_type ON notifications(school_id, type);
CREATE INDEX IF NOT EXISTS idx_notifications_entity ON notifications(school_id, entity_type, entity_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedup_unique ON notifications(school_id, dedup_key) WHERE dedup_key IS NOT NULL;

-- 3. Sécurité Row Level Security (RLS) & Cloisonnement Multi-Tenant
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

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

-- 4. Publication Realtime pour synchronisation instantanée multi-appareils
DO $$ BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
EXCEPTION
    WHEN duplicate_object THEN null;
    WHEN undefined_object THEN null;
END $$;
