-- Create facebook_connections table
CREATE TABLE IF NOT EXISTS facebook_connections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    name VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL,
    business_id VARCHAR(255),
    business_name VARCHAR(255),
    ad_account_id VARCHAR(255),
    ad_account_name VARCHAR(255),
    page_id VARCHAR(255) NOT NULL,
    page_name VARCHAR(255),
    page_picture_url TEXT,
    form_id VARCHAR(255),
    form_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_facebook_connections_user_id ON facebook_connections(user_id);

-- Create index on page_id for webhook lookups
CREATE INDEX IF NOT EXISTS idx_facebook_connections_page_id ON facebook_connections(page_id);

-- Create index on status for filtering active connections
CREATE INDEX IF NOT EXISTS idx_facebook_connections_status ON facebook_connections(status);
