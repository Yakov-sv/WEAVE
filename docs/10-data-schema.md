# WEAVE — Схема базы данных

## Обзор

База данных: **PostgreSQL 16** с расширениями:
- `pgvector` — векторный поиск (семантический поиск контента)
- `pg_trgm` — нечёткий поиск
- `uuid-ossp` — генерация UUID
- `citext` — case-insensitive текст (для email/username)

## Identity Module

### users
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username        VARCHAR(30) UNIQUE NOT NULL,
    display_name    VARCHAR(100),
    bio             TEXT DEFAULT '',
    avatar_url      VARCHAR(500),
    banner_url      VARCHAR(500),
    verified        BOOLEAN DEFAULT FALSE,
    role            VARCHAR(20) DEFAULT 'user', -- user, creator, team, admin
    reputation_score INT DEFAULT 0,
    location        VARCHAR(100),
    website_url     VARCHAR(500),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]{3,30}$')
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);
```

### identities (linked accounts)
```sql
CREATE TABLE identities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider        VARCHAR(20) NOT NULL, -- github, telegram, google, email, passkey
    external_id     VARCHAR(200) NOT NULL,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(provider, external_id)
);

CREATE INDEX idx_identities_user ON identities(user_id);
CREATE INDEX idx_identities_provider ON identities(provider, external_id);
```

### auth_credentials
```sql
CREATE TABLE auth_credentials (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL, -- password, passkey, oauth
    credential_data JSONB NOT NULL, -- hashed_password, public_key, etc.
    created_at      TIMESTAMP DEFAULT NOW(),
    last_used_at    TIMESTAMP
);

CREATE INDEX idx_auth_user ON auth_credentials(user_id);
```

### sessions
```sql
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      VARCHAR(64) NOT NULL,
    device_info     JSONB DEFAULT '{}',
    ip_address      INET,
    expires_at      TIMESTAMP NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    revoked_at      TIMESTAMP
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
```

### subscriptions (follow relationships)
```sql
CREATE TABLE subscriptions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(follower_id, following_id),
    CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

CREATE INDEX idx_subscriptions_follower ON subscriptions(follower_id);
CREATE INDEX idx_subscriptions_following ON subscriptions(following_id);
```

### user_blocks
```sql
CREATE TABLE user_blocks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blocker_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(blocker_id, blocked_id)
);
```

### user_settings
```sql
CREATE TABLE user_settings (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    is_private      BOOLEAN DEFAULT FALSE,
    show_online     BOOLEAN DEFAULT TRUE,
    allow_dms       VARCHAR(20) DEFAULT 'everyone', -- everyone, followers, none
    enabled_modules JSONB DEFAULT '["feed","messaging","git"]',
    notification_prefs JSONB DEFAULT '{}',
    theme           VARCHAR(20) DEFAULT 'system',
    updated_at      TIMESTAMP DEFAULT NOW()
);
```

## Feed Module

### posts
```sql
CREATE TABLE posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL, -- text, media, story, code, link
    content         TEXT DEFAULT '', -- markdown
    content_html    TEXT DEFAULT '', -- pre-rendered HTML
    media_assets    JSONB DEFAULT '[]', -- array of {asset_id, type, url, meta}
    code_ref        JSONB, -- {repo_id, commit, file, lines} — nullable
    link_url        VARCHAR(500),
    link_preview    JSONB, -- {title, description, image}
    parent_post_id  UUID REFERENCES posts(id) ON DELETE CASCADE,
    repost_of_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
    quote_of_id     UUID REFERENCES posts(id) ON DELETE SET NULL,
    visibility      VARCHAR(20) DEFAULT 'public', -- public, followers, paid
    paywall_config  JSONB, -- {price_cents, currency, preview_text}
    reply_count     INT DEFAULT 0,
    reaction_count  INT DEFAULT 0,
    repost_count    INT DEFAULT 0,
    bookmark_count  INT DEFAULT 0,
    view_count      INT DEFAULT 0,
    pinned          BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_posts_author ON posts(author_id, created_at DESC);
CREATE INDEX idx_posts_type ON posts(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_visibility ON posts(visibility) WHERE deleted_at IS NULL;
CREATE INDEX idx_posts_parent ON posts(parent_post_id) WHERE parent_post_id IS NOT NULL;
CREATE INDEX idx_posts_repost ON posts(repost_of_id) WHERE repost_of_id IS NOT NULL;
CREATE INDEX idx_posts_created ON posts(created_at DESC) WHERE deleted_at IS NULL;
```

### media_assets
```sql
CREATE TABLE media_assets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id         UUID REFERENCES posts(id) ON DELETE SET NULL,
    type            VARCHAR(20) NOT NULL, -- image, video, stream, audio
    cdn_url         VARCHAR(500) NOT NULL,
    thumbnail_url   VARCHAR(500),
    metadata        JSONB DEFAULT '{}', -- width, height, duration, format, size
    alt_text        TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_media_post ON media_assets(post_id);
CREATE INDEX idx_media_uploader ON media_assets(uploader_id);
```

### reactions
```sql
CREATE TABLE reactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL, -- like, boost, bookmark
    created_at      TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, post_id, type)
);

CREATE INDEX idx_reactions_post ON reactions(post_id, type);
CREATE INDEX idx_reactions_user ON reactions(user_id, type);
```

### topics
```sql
CREATE TABLE topics (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(50) UNIQUE NOT NULL,
    description     TEXT,
    post_count      INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE post_topics (
    post_id         UUID REFERENCES posts(id) ON DELETE CASCADE,
    topic_id        UUID REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY(post_id, topic_id)
);

CREATE INDEX idx_post_topics_topic ON post_topics(topic_id);
```

### feed_items (денормормализованная лента)
```sql
CREATE TABLE feed_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL, -- target user (feed owner)
    post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    reason          VARCHAR(20) NOT NULL, -- following, algorithmic, subscribed_channel, reposted_by
    score           FLOAT DEFAULT 0, -- algorithmic score
    created_at      TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, post_id)
);

CREATE INDEX idx_feed_user ON feed_items(user_id, created_at DESC);
CREATE INDEX idx_feed_user_score ON feed_items(user_id, score DESC);
```

## Messaging Module

### conversations
```sql
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type            VARCHAR(20) NOT NULL, -- dm, group, channel
    title           VARCHAR(200),
    description     TEXT,
    avatar_url      VARCHAR(500),
    owner_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_paid         BOOLEAN DEFAULT FALSE,
    subscription_plan_id UUID, -- FK to subscription_plans
    is_verified     BOOLEAN DEFAULT FALSE,
    member_count    INT DEFAULT 0,
    subscriber_count INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversations_owner ON conversations(owner_id);
```

### memberships
```sql
CREATE TABLE memberships (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL, -- owner, admin, member, subscriber
    joined_at       TIMESTAMP DEFAULT NOW(),
    last_read_at    TIMESTAMP,
    muted           BOOLEAN DEFAULT FALSE,
    pinned          BOOLEAN DEFAULT FALSE,
    
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_memberships_user ON memberships(user_id);
CREATE INDEX idx_memberships_conv ON memberships(conversation_id);
```

### messages
```sql
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT DEFAULT '',
    content_html    TEXT DEFAULT '',
    media_assets    JSONB DEFAULT '[]',
    reply_to_id     UUID REFERENCES messages(id) ON DELETE SET NULL,
    edited_at       TIMESTAMP,
    deleted_at      TIMESTAMP,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_conv ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
```

### channel_posts (broadcast posts in channels)
```sql
CREATE TABLE channel_posts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    channel_id      UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    author_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT DEFAULT '',
    content_html    TEXT DEFAULT '',
    media_assets    JSONB DEFAULT '[]',
    is_paywall      BOOLEAN DEFAULT FALSE,
    paywall_preview TEXT,
    paywall_config  JSONB,
    view_count      INT DEFAULT 0,
    reaction_count  INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW(),
    deleted_at      TIMESTAMP
);

CREATE INDEX idx_channel_posts_channel ON channel_posts(channel_id, created_at DESC);
```

### message_reactions
```sql
CREATE TABLE message_reactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_id      UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    emoji           VARCHAR(10) NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, message_id, emoji)
);
```

## Git Module

### repositories (WEAVE-level metadata)
```sql
CREATE TABLE repositories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gitea_repo_id   INT NOT NULL, -- ID in Gitea
    gitea_full_name VARCHAR(200) NOT NULL, -- owner/name in Gitea
    name            VARCHAR(100) NOT NULL,
    description     TEXT DEFAULT '',
    visibility      VARCHAR(20) DEFAULT 'public', -- public, private, paid
    subscription_plan_id UUID, -- FK to subscription_plans (for paid repos)
    default_branch  VARCHAR(100) DEFAULT 'main',
    language        VARCHAR(50),
    stars_count     INT DEFAULT 0,
    forks_count     INT DEFAULT 0,
    watchers_count  INT DEFAULT 0,
    is_template     BOOLEAN DEFAULT FALSE,
    topics          JSONB DEFAULT '[]',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_repos_user ON repositories(user_id);
CREATE INDEX idx_repos_visibility ON repositories(visibility);
CREATE INDEX idx_repos_stars ON repositories(stars_count DESC);
CREATE INDEX idx_repos_name ON repositories(name);
```

### repo_access
```sql
CREATE TABLE repo_access (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    repo_id         UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_type     VARCHAR(20) NOT NULL, -- owner, collaborator, subscriber
    permissions     JSONB DEFAULT '{}', -- read, write, admin
    expires_at      TIMESTAMP, -- for subscribers
    created_at      TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(repo_id, user_id)
);

CREATE INDEX idx_repo_access_user ON repo_access(user_id);
CREATE INDEX idx_repo_access_repo ON repo_access(repo_id);
```

### repo_stars
```sql
CREATE TABLE repo_stars (
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    repo_id         UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    created_at      TIMESTAMP DEFAULT NOW(),
    
    PRIMARY KEY(user_id, repo_id)
);
```

### import_jobs
```sql
CREATE TABLE import_jobs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source          VARCHAR(20) NOT NULL, -- github, gitlab, telegram
    source_url      VARCHAR(500) NOT NULL,
    target_type     VARCHAR(20) NOT NULL, -- repo, channel
    target_id       UUID,
    status          VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, failed
    progress        INT DEFAULT 0, -- 0-100
    error_message   TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMP DEFAULT NOW(),
    completed_at    TIMESTAMP
);

CREATE INDEX idx_import_jobs_user ON import_jobs(user_id);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
```

## Market + Payments Module

### listings
```sql
CREATE TABLE listings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL, -- code, template, course, media, service
    title           VARCHAR(200) NOT NULL,
    description     TEXT DEFAULT '',
    price_cents     INT NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    compare_at_cents INT, -- original price for discounts
    linked_repo_id  UUID REFERENCES repositories(id) ON DELETE SET NULL,
    linked_channel_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    linked_post_id  UUID REFERENCES posts(id) ON DELETE SET NULL,
    cover_image_url VARCHAR(500),
    preview_content TEXT,
    download_url    VARCHAR(500), -- for digital goods
    tags            JSONB DEFAULT '[]',
    is_active       BOOLEAN DEFAULT TRUE,
    featured        BOOLEAN DEFAULT FALSE,
    sales_count     INT DEFAULT 0,
    rating_avg      FLOAT DEFAULT 0,
    rating_count    INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_type ON listings(type) WHERE is_active = TRUE;
CREATE INDEX idx_listings_featured ON listings(featured) WHERE is_active = TRUE;
CREATE INDEX idx_listings_price ON listings(price_cents);
```

### subscription_plans
```sql
CREATE TABLE subscription_plans (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    price_cents     INT NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    interval        VARCHAR(20) NOT NULL, -- monthly, yearly
    trial_days      INT DEFAULT 0,
    linked_channel_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    linked_repo_id  UUID REFERENCES repositories(id) ON DELETE SET NULL,
    linked_user_id  UUID REFERENCES users(id) ON DELETE SET NULL, -- profile-level sub
    features        JSONB DEFAULT '[]',
    is_active       BOOLEAN DEFAULT TRUE,
    subscriber_count INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plans_creator ON subscription_plans(creator_id);
```

### purchases
```sql
CREATE TABLE purchases (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id      UUID NOT NULL REFERENCES listings(id) ON DELETE RESTRICT,
    buyer_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_cents    INT NOT NULL,
    platform_fee_cents INT NOT NULL,
    seller_revenue_cents INT NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending', -- pending, completed, refunded, disputed
    escrow_release_at TIMESTAMP,
    stripe_payment_id VARCHAR(200),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMP DEFAULT NOW(),
    completed_at    TIMESTAMP
);

CREATE INDEX idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX idx_purchases_listing ON purchases(listing_id);
CREATE INDEX idx_purchases_status ON purchases(status);
```

### active_subscriptions
```sql
CREATE TABLE active_subscriptions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- subscriber
    plan_id         UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE RESTRICT,
    status          VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired, past_due
    stripe_subscription_id VARCHAR(200),
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW(),
    cancelled_at    TIMESTAMP
);

CREATE INDEX idx_active_subs_user ON active_subscriptions(user_id);
CREATE INDEX idx_active_subs_plan ON active_subscriptions(plan_id);
CREATE INDEX idx_active_subs_status ON active_subscriptions(status);
```

### transactions
```sql
CREATE TABLE transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type            VARCHAR(20) NOT NULL, -- purchase, subscription, tip, payout, refund, fee
    payer_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    payee_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    amount_cents    INT NOT NULL,
    fee_cents       INT DEFAULT 0,
    currency        VARCHAR(3) DEFAULT 'USD',
    reference_type  VARCHAR(20), -- listing, plan, channel, repo, tip
    reference_id    UUID,
    stripe_id       VARCHAR(200),
    status          VARCHAR(20) NOT NULL, -- pending, completed, failed, refunded
    description     TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_payer ON transactions(payer_id);
CREATE INDEX idx_transactions_payee ON transactions(payee_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
```

### reviews
```sql
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id      UUID REFERENCES listings(id) ON DELETE CASCADE,
    seller_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    rating          INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content         TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(reviewer_id, listing_id)
);

CREATE INDEX idx_reviews_listing ON reviews(listing_id);
CREATE INDEX idx_reviews_seller ON reviews(seller_id);
```

### creator_balances
```sql
CREATE TABLE creator_balances (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    available_cents INT DEFAULT 0,
    pending_cents   INT DEFAULT 0,
    lifetime_cents  INT DEFAULT 0,
    updated_at      TIMESTAMP DEFAULT NOW()
);
```

### payouts
```sql
CREATE TABLE payouts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_cents    INT NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    status          VARCHAR(20) DEFAULT 'pending', -- pending, in_transit, paid, failed
    stripe_payout_id VARCHAR(200),
    created_at      TIMESTAMP DEFAULT NOW(),
    completed_at    TIMESTAMP
);

CREATE INDEX idx_payouts_user ON payouts(user_id);
```

## Notifications

### notifications
```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(50) NOT NULL, -- follow, like, reply, repost, message, payment, subscription, mention
    actor_id        UUID REFERENCES users(id) ON DELETE CASCADE,
    reference_type  VARCHAR(20),
    reference_id    UUID,
    content         JSONB DEFAULT '{}',
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
```

## Audit Log

### audit_log
```sql
CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(50) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       UUID,
    metadata        JSONB DEFAULT '{}',
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
```
