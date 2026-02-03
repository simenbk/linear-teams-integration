-- PostgreSQL initialization script for Linear-Teams Integration
-- This creates the basic schema for local development

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    azure_tenant_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    linear_organization_id VARCHAR(255),
    linear_api_key_encrypted TEXT,
    linear_webhook_secret_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Channel configurations table
CREATE TABLE IF NOT EXISTS channel_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    teams_channel_id VARCHAR(255) NOT NULL,
    teams_team_id VARCHAR(255) NOT NULL,
    linear_team_id VARCHAR(255) NOT NULL,
    linear_team_key VARCHAR(50) NOT NULL,
    sync_teams_to_linear BOOLEAN DEFAULT true,
    sync_linear_to_teams BOOLEAN DEFAULT true,
    sync_comments BOOLEAN DEFAULT true,
    sync_status_changes BOOLEAN DEFAULT true,
    default_priority INTEGER DEFAULT 3 CHECK (default_priority BETWEEN 1 AND 4),
    default_label_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, teams_channel_id)
);

-- Sync mappings table
CREATE TABLE IF NOT EXISTS sync_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    teams_message_id VARCHAR(255) NOT NULL,
    teams_conversation_id VARCHAR(255) NOT NULL,
    linear_issue_id VARCHAR(255) NOT NULL,
    linear_issue_identifier VARCHAR(50) NOT NULL,
    direction VARCHAR(50) NOT NULL CHECK (direction IN ('teams_to_linear', 'linear_to_teams')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, teams_message_id),
    UNIQUE(tenant_id, linear_issue_id)
);

-- Conversation references table (for proactive messaging)
CREATE TABLE IF NOT EXISTS conversation_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    teams_conversation_id VARCHAR(255) NOT NULL,
    bot_id VARCHAR(255) NOT NULL,
    service_url TEXT NOT NULL,
    channel_id VARCHAR(255),
    reference_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, teams_conversation_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tenants_azure_tenant_id ON tenants(azure_tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenants_linear_org_id ON tenants(linear_organization_id);
CREATE INDEX IF NOT EXISTS idx_channel_configs_tenant_id ON channel_configs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_channel_configs_teams_channel ON channel_configs(teams_channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_configs_linear_team ON channel_configs(linear_team_id);
CREATE INDEX IF NOT EXISTS idx_sync_mappings_tenant_id ON sync_mappings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sync_mappings_teams_message ON sync_mappings(teams_message_id);
CREATE INDEX IF NOT EXISTS idx_sync_mappings_linear_issue ON sync_mappings(linear_issue_id);
CREATE INDEX IF NOT EXISTS idx_conversation_refs_tenant ON conversation_references(tenant_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
CREATE TRIGGER update_tenants_updated_at
    BEFORE UPDATE ON tenants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_channel_configs_updated_at ON channel_configs;
CREATE TRIGGER update_channel_configs_updated_at
    BEFORE UPDATE ON channel_configs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversation_refs_updated_at ON conversation_references;
CREATE TRIGGER update_conversation_refs_updated_at
    BEFORE UPDATE ON conversation_references
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert a test tenant for local development
INSERT INTO tenants (azure_tenant_id, name, is_active)
VALUES ('00000000-0000-0000-0000-000000000000', 'Local Development Tenant', true)
ON CONFLICT (azure_tenant_id) DO NOTHING;
