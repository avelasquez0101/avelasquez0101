-- ChGaming Platform Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id) DEFAULT 2,
    xp BIGINT DEFAULT 0,
    chcoins BIGINT DEFAULT 0,
    balance_usd DECIMAL(10, 2) DEFAULT 0.00,
    vip_level INTEGER DEFAULT 0,
    vip_expires_at TIMESTAMP WITH TIME ZONE,
    streak_count INTEGER DEFAULT 0,
    last_streak_date DATE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    profile_data JSONB DEFAULT '{}'::jsonb,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Games table
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tournaments table
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id INTEGER REFERENCES games(id) NOT NULL,
    organizer_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    format VARCHAR(50) NOT NULL, -- single_elimination, double_elimination, round_robin
    max_teams INTEGER NOT NULL,
    min_teams INTEGER DEFAULT 2,
    registration_fee_chcoins INTEGER DEFAULT 0,
    registration_fee_usd DECIMAL(10, 2) DEFAULT 0.00,
    prize_pool_chcoins INTEGER DEFAULT 0,
    prize_pool_usd DECIMAL(10, 2) DEFAULT 0.00,
    prize_distribution JSONB DEFAULT '{"1": 0.6, "2": 0.3, "3": 0.1}'::jsonb,
    status VARCHAR(50) DEFAULT 'registration', -- registration, in_progress, completed, cancelled
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    rules TEXT,
    bracket_data JSONB DEFAULT '{}'::jsonb,
    results JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    captain_id UUID REFERENCES users(id) NOT NULL,
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    members JSONB DEFAULT '[]'::jsonb, -- Array of user IDs
    seed INTEGER,
    status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, eliminated, winner
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tournament Participants (for individual tournaments)
CREATE TABLE tournament_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) NOT NULL,
    team_id UUID REFERENCES teams(id),
    status VARCHAR(50) DEFAULT 'registered', -- registered, checked_in, eliminated, winner
    seed INTEGER,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tournament_id, user_id)
);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    round INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    team1_id UUID REFERENCES teams(id),
    team2_id UUID REFERENCES teams(id),
    participant1_id UUID REFERENCES tournament_participants(id),
    participant2_id UUID REFERENCES tournament_participants(id),
    winner_id UUID, -- Can be team_id or participant_id
    score1 INTEGER DEFAULT 0,
    score2 INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    proof_images JSONB DEFAULT '[]'::jsonb,
    validated_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- physical, virtual
    game_id INTEGER REFERENCES games(id),
    price_chcoins INTEGER DEFAULT 0,
    price_usd DECIMAL(10, 2) DEFAULT 0.00,
    allows_mixed_payment BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    total_chcoins INTEGER DEFAULT 0,
    total_usd DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL, -- chcoins, paypal, mixed
    paypal_order_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- pending, paid, processing, shipped, delivered, cancelled, refunded
    shipping_address JSONB,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    transaction_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table (for audit)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    type VARCHAR(50) NOT NULL, -- purchase, reward, tournament_prize, deposit, withdrawal, refund
    amount_chcoins INTEGER DEFAULT 0,
    amount_usd DECIMAL(10, 2) DEFAULT 0.00,
    balance_before_chcoins INTEGER,
    balance_after_chcoins INTEGER,
    balance_before_usd DECIMAL(10, 2),
    balance_after_usd DECIMAL(10, 2),
    xp_earned INTEGER DEFAULT 0,
    reference_type VARCHAR(50), -- order, tournament, etc.
    reference_id UUID,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Tournament History
CREATE TABLE user_tournament_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    tournament_id UUID REFERENCES tournaments(id),
    team_id UUID REFERENCES teams(id),
    placement INTEGER, -- 1, 2, 3, etc.
    xp_earned INTEGER DEFAULT 0,
    chcoins_earned INTEGER DEFAULT 0,
    usd_earned DECIMAL(10, 2) DEFAULT 0.00,
    participated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tournament_id)
);

-- Refresh Tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP WITH TIME ZONE
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    type VARCHAR(50) NOT NULL, -- tournament_alert, promotion, system, etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Advertisements table
CREATE TABLE advertisements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    image_url TEXT,
    target_url TEXT,
    placement VARCHAR(50) NOT NULL, -- feed, sidebar, banner, etc.
    game_id INTEGER REFERENCES games(id),
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_xp ON users(xp DESC);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_game_id ON tournaments(game_id);
CREATE INDEX idx_tournaments_starts_at ON tournaments(starts_at);
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON advertisements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
('admin', 'Administrator with full access', 
 '["users:read", "users:write", "users:delete", "tournaments:read", "tournaments:write", "tournaments:delete", "products:read", "products:write", "products:delete", "orders:read", "orders:write", "transactions:read", "ads:read", "ads:write"]'::jsonb),
('user', 'Regular user', 
 '["users:read_own", "tournaments:read", "tournaments:participate", "products:read", "products:purchase", "orders:read_own"]'::jsonb),
('moderator', 'Moderator with limited admin access', 
 '["users:read", "tournaments:read", "tournaments:write", "matches:validate", "orders:read"]'::jsonb);

-- Insert default games
INSERT INTO games (name, slug, icon_url) VALUES
('Free Fire', 'free-fire', '/images/games/free-fire.png'),
('COD Mobile', 'cod-mobile', '/images/games/cod-mobile.png'),
('Mobile Legends', 'mobile-legends', '/images/games/mobile-legends.png'),
('Wild Rift', 'wild-rift', '/images/games/wild-rift.png');
