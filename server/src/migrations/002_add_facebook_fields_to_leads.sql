-- Add Facebook-specific fields to leads table if they don't exist
ALTER TABLE leads ADD COLUMN IF NOT EXISTS facebook_lead_id VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS facebook_page_id VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS facebook_form_id VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS raw_data JSONB;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(50) DEFAULT 'nuevo';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_facebook_lead_id ON leads(facebook_lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON leads(pipeline_stage);
