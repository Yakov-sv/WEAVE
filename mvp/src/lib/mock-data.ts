import { User, Post, Conversation, Message, ChannelPost, Repository, FileNode, Listing, SubscriptionPlan, Transaction, Notification } from "./types";

export const currentUser: User = {
  id: "u1",
  username: "you",
  displayName: "You",
  bio: "Building the future at WEAVE. Full-stack developer & creator.",
  avatar: "🧑‍💻",
  verified: false,
  role: "creator",
  followers: 1247,
  following: 342,
  reputation: 8900,
  location: "Remote",
  website: "weave.app/you",
};

export const users: User[] = [
  currentUser,
  {
    id: "u2",
    username: "alexdev",
    displayName: "Alex Chen",
    bio: "Open source maintainer. Rust enthusiast. Building dev tools.",
    avatar: "👨‍🦰",
    verified: true,
    role: "creator",
    followers: 45200,
    following: 180,
    reputation: 52000,
    location: "San Francisco",
    website: "weave.app/alexdev",
  },
  {
    id: "u3",
    username: "maria_designs",
    displayName: "Maria Silva",
    bio: "UI/UX designer turned creator. Selling design templates & courses.",
    avatar: "👩‍🎨",
    verified: true,
    role: "creator",
    followers: 28900,
    following: 95,
    reputation: 34000,
    location: "Lisbon",
    website: "weave.app/maria_designs",
  },
  {
    id: "u4",
    username: "codeforge",
    displayName: "CodeForge Team",
    bio: "We build tools for developers. Open source first.",
    avatar: "🔧",
    verified: true,
    role: "team",
    followers: 89300,
    following: 12,
    reputation: 120000,
    location: "Worldwide",
    website: "codeforge.dev",
  },
  {
    id: "u5",
    username: "techblogger",
    displayName: "Jane Tech",
    bio: "Writing about software architecture, AI, and the future of work.",
    avatar: "👩‍💼",
    verified: false,
    role: "creator",
    followers: 12400,
    following: 567,
    reputation: 18000,
    location: "Berlin",
  },
  {
    id: "u6",
    username: "indiedev",
    displayName: "Sam Park",
    bio: "Indie game developer. Making games and selling assets.",
    avatar: "🎮",
    verified: false,
    role: "creator",
    followers: 5600,
    following: 234,
    reputation: 9200,
    location: "Seoul",
  },
];

export const posts: Post[] = [
  {
    id: "p1",
    author: users[1],
    type: "code",
    content: "Just shipped a new Rust crate for blazing-fast JSON parsing! 🦀\n\nBenchmark: 3x faster than serde_json on large payloads. The trick is zero-copy parsing with memory-mapped buffers.",
    codeRef: { repo: "alexdev/fast-json", file: "src/parser.rs", language: "rust", lines: [1, 20] },
    createdAt: "2026-09-30T10:30:00Z",
    likes: 342,
    replies: 47,
    reposts: 89,
    bookmarks: 156,
    topics: ["rust", "performance", "json"],
  },
  {
    id: "p2",
    author: users[2],
    type: "media",
    content: "New design system drop! 🎨\n\n120+ components, fully responsive, dark mode ready. Available now on WEAVE Market.",
    media: ["🎨", "🧩", "📱"],
    createdAt: "2026-09-30T09:15:00Z",
    likes: 892,
    replies: 123,
    reposts: 234,
    bookmarks: 445,
    topics: ["design", "ui", "components"],
  },
  {
    id: "p3",
    author: users[3],
    type: "text",
    content: "We're open-sourcing our CI/CD pipeline tool! 🔥\n\nAfter 2 years of internal use at CodeForge, we're releasing it to the community. Stars and feedback welcome!\n\nFeatures:\n• Parallel job execution\n• Docker-native\n• YAML-based config\n• Built-in secret management\n\nRepo is now public on WEAVE →",
    createdAt: "2026-09-30T08:00:00Z",
    likes: 1203,
    replies: 234,
    reposts: 567,
    bookmarks: 890,
    topics: ["opensource", "ci-cd", "devtools"],
  },
  {
    id: "p4",
    author: users[4],
    type: "text",
    content: "Hot take: The future of social platforms is modular.\n\nWhy use 5 different apps when one profile can do it all?\n\nFeed like X. Chat like Telegram. Code like GitHub. Monetize like Patreon. All woven together. 🧵",
    createdAt: "2026-09-30T07:45:00Z",
    likes: 567,
    replies: 89,
    reposts: 234,
    bookmarks: 178,
    topics: ["weave", "social", "future"],
  },
  {
    id: "p5",
    author: users[5],
    type: "media",
    content: "My new pixel art asset pack is live! 🎮\n\n500+ sprites, animated characters, tilesets, and UI elements. Perfect for indie games.\n\nOnly $19 on WEAVE Market ↓",
    media: ["👾", "🎨", "⚔️"],
    createdAt: "2026-09-29T22:30:00Z",
    likes: 234,
    replies: 45,
    reposts: 67,
    bookmarks: 123,
    topics: ["gamedev", "pixelart", "assets"],
  },
  {
    id: "p6",
    author: users[1],
    type: "link",
    content: "Wrote a deep dive on zero-copy parsing in Rust. If you're building high-performance systems, this is worth a read.",
    linkUrl: "blog.alexdev.rs/zero-copy-parsing",
    linkPreview: {
      title: "Zero-Copy Parsing in Rust: A Deep Dive",
      description: "Learn how to parse JSON 3x faster using memory-mapped buffers and zero-copy techniques in Rust.",
      image: "📖",
    },
    createdAt: "2026-09-29T18:00:00Z",
    likes: 456,
    replies: 67,
    reposts: 123,
    bookmarks: 289,
    topics: ["rust", "performance", "blog"],
  },
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    type: "channel",
    title: "WEAVE Dev Updates",
    description: "Official channel for WEAVE platform development updates",
    avatar: "🧵",
    ownerId: "u1",
    isPaid: false,
    memberCount: 1,
    subscriberCount: 12400,
    lastMessage: "New beta build is live! Changelog inside 👇",
    lastMessageAt: "2026-09-30T11:00:00Z",
    unread: 2,
    verified: true,
  },
  {
    id: "c2",
    type: "channel",
    title: "Alex Chen — Premium",
    description: "Exclusive Rust tips, code reviews, and early access to my crates",
    avatar: "👨‍🦰",
    ownerId: "u2",
    isPaid: true,
    subscriptionPrice: 10,
    memberCount: 1,
    subscriberCount: 890,
    lastMessage: "New video: Debugging async Rust like a pro",
    lastMessageAt: "2026-09-30T09:30:00Z",
    unread: 0,
    verified: true,
  },
  {
    id: "c3",
    type: "dm",
    title: "Maria Silva",
    avatar: "👩‍🎨",
    ownerId: "u3",
    isPaid: false,
    memberCount: 2,
    lastMessage: "Hey! Love the WEAVE concept. Let's collaborate!",
    lastMessageAt: "2026-09-30T08:45:00Z",
    unread: 1,
  },
  {
    id: "c4",
    type: "group",
    title: "WEAVE Founders",
    avatar: "🚀",
    ownerId: "u1",
    isPaid: false,
    memberCount: 5,
    lastMessage: "Sam: Pushed the new design, check it out",
    lastMessageAt: "2026-09-29T20:00:00Z",
    unread: 0,
  },
  {
    id: "c5",
    type: "channel",
    title: "CodeForge Community",
    description: "Open source community for CodeForge tools",
    avatar: "🔧",
    ownerId: "u4",
    isPaid: false,
    memberCount: 1,
    subscriberCount: 45600,
    lastMessage: "v2.0 release is coming next week! 🎉",
    lastMessageAt: "2026-09-29T16:00:00Z",
    unread: 0,
    verified: true,
  },
];

export const messages: Record<string, Message[]> = {
  c1: [
    { id: "m1", conversationId: "c1", senderId: "u1", content: "Welcome to WEAVE Dev Updates! 🧵", createdAt: "2026-09-29T12:00:00Z" },
    { id: "m2", conversationId: "c1", senderId: "u1", content: "New beta build is live! Changelog:\n\n• Feed now supports code posts with syntax highlighting\n• Real-time messaging is 2x faster\n• Git import from GitHub now works for private repos\n• Paid channels are fully operational\n\nTry it out and report bugs! 🐛", createdAt: "2026-09-30T11:00:00Z", reactions: [{ emoji: "🔥", count: 47, reacted: true }, { emoji: "🚀", count: 23 }] },
  ],
  c2: [
    { id: "m3", conversationId: "c2", senderId: "u2", content: "New video: Debugging async Rust like a pro 🦀", createdAt: "2026-09-30T09:30:00Z", reactions: [{ emoji: "👍", count: 34 }] },
    { id: "m4", conversationId: "c2", senderId: "u2", content: "Also, I just pushed a new commit to the fast-json repo. Subscribers get early access to the benchmark results!", createdAt: "2026-09-30T09:35:00Z" },
  ],
  c3: [
    { id: "m5", conversationId: "c3", senderId: "u3", content: "Hey! Love the WEAVE concept. Let's collaborate!", createdAt: "2026-09-30T08:45:00Z" },
  ],
  c4: [
    { id: "m6", conversationId: "c4", senderId: "u5", content: "Just published a new article about WEAVE on my blog!", createdAt: "2026-09-29T19:30:00Z" },
    { id: "m7", conversationId: "c4", senderId: "u6", content: "Pushed the new design, check it out", createdAt: "2026-09-29T20:00:00Z" },
  ],
};

export const channelPosts: Record<string, ChannelPost[]> = {
  c1: [
    {
      id: "cp1",
      channelId: "c1",
      authorId: "u1",
      content: "🧵 **WEAVE Beta Update v0.3.0**\n\nMajor milestones this week:\n\n1. **Feed Module** — Now supports code posts with inline syntax highlighting from your repos\n2. **Messaging** — Real-time WebSocket delivery, 50% latency reduction\n3. **Git Module** — Import from GitHub now supports private repos with OAuth\n4. **Market** — Paid channels and subscriptions are live with Stripe Connect\n\nNext up: Stories, algorithmic feed, and mobile PWA.\n\nStar the repo and join the community! ⭐",
      createdAt: "2026-09-30T11:00:00Z",
      views: 8900,
      reactions: 342,
    },
    {
      id: "cp2",
      channelId: "c1",
      authorId: "u1",
      content: "📈 **WEAVE Growth Update**\n\nWe just hit 5,000 waitlist signups! 🎉\n\nThank you all for the support. Alpha invitations going out next week.\n\nIf you want early access, refer 3 friends using your unique link in Settings → Referrals.",
      createdAt: "2026-09-28T15:00:00Z",
      views: 6700,
      reactions: 189,
    },
  ],
  c2: [
    {
      id: "cp3",
      channelId: "c2",
      authorId: "u2",
      content: "🦀 **Rust async debugging masterclass**\n\nNew video is up for premium subscribers! In this 45-minute deep dive:\n\n• Common async Rust pitfalls\n• tokio::spawn vs async blocks\n• Debugging deadlocks with tokio-console\n• Real-world case studies\n\nVideo link in comments 👇",
      createdAt: "2026-09-30T09:30:00Z",
      views: 456,
      reactions: 89,
    },
    {
      id: "cp4",
      channelId: "c2",
      authorId: "u2",
      content: "📊 **fast-json benchmark results (early access)**\n\nPremium subscribers get exclusive early access to benchmark data:\n\n| Dataset | serde_json | fast-json | Speedup |\n|---|---|---|---|\n| 1MB | 12ms | 4ms | 3x |\n| 10MB | 145ms | 48ms | 3x |\n| 100MB | 1.8s | 520ms | 3.5x |\n\nFull report coming to the blog next week.",
      createdAt: "2026-09-29T14:00:00Z",
      views: 312,
      reactions: 67,
      isPaywall: false,
    },
  ],
};

export const repositories: Repository[] = [
  {
    id: "r1",
    owner: users[1],
    name: "fast-json",
    description: "⚡ Blazing-fast JSON parser for Rust. 3x faster than serde_json.",
    visibility: "public",
    language: "Rust",
    stars: 4521,
    forks: 234,
    watchers: 189,
    topics: ["rust", "json", "parser", "performance", "zero-copy"],
    updatedAt: "2026-09-30T10:30:00Z",
    license: "MIT",
  },
  {
    id: "r2",
    owner: users[3],
    name: "forge-ci",
    description: "🔥 Modern CI/CD pipeline tool. Docker-native, YAML-based, parallel jobs.",
    visibility: "public",
    language: "Go",
    stars: 12300,
    forks: 890,
    watchers: 456,
    topics: ["ci-cd", "docker", "devops", "opensource"],
    updatedAt: "2026-09-30T08:00:00Z",
    license: "Apache-2.0",
  },
  {
    id: "r3",
    owner: users[2],
    name: "design-system-pro",
    description: "🎨 120+ responsive components. Dark mode ready. Tailwind CSS.",
    visibility: "paid",
    language: "TypeScript",
    stars: 890,
    forks: 0,
    watchers: 234,
    topics: ["design-system", "react", "tailwind", "components"],
    updatedAt: "2026-09-30T09:15:00Z",
    subscriptionPrice: 49,
  },
  {
    id: "r4",
    owner: users[1],
    name: "weave-sdk",
    description: "Official WEAVE SDK for JavaScript/TypeScript. Build plugins and integrations.",
    visibility: "public",
    language: "TypeScript",
    stars: 678,
    forks: 45,
    watchers: 89,
    topics: ["sdk", "weave", "api", "typescript"],
    updatedAt: "2026-09-29T18:00:00Z",
    license: "MIT",
    isTemplate: true,
  },
  {
    id: "r5",
    owner: users[5],
    name: "pixel-assets-pack",
    description: "👾 500+ pixel art sprites. Animated characters, tilesets, UI elements.",
    visibility: "paid",
    language: "Lua",
    stars: 234,
    forks: 0,
    watchers: 67,
    topics: ["gamedev", "pixelart", "sprites", "assets"],
    updatedAt: "2026-09-29T22:30:00Z",
    subscriptionPrice: 19,
  },
];

export const repoFiles: Record<string, FileNode[]> = {
  "alexdev/fast-json": [
    {
      name: "src",
      type: "dir",
      path: "src",
      children: [
        {
          name: "parser.rs",
          type: "file",
          path: "src/parser.rs",
          language: "rust",
          content: `use std::io::Cursor;
use memmap2::Mmap;

/// Zero-copy JSON parser using memory-mapped buffers.
/// 3x faster than serde_json on large payloads.
pub struct FastJsonParser<'a> {
    data: &'a [u8],
    pos: usize,
}

impl<'a> FastJsonParser<'a> {
    /// Create a new parser from a memory-mapped buffer.
    pub fn new(data: &'a [u8]) -> Self {
        Self { data, pos: 0 }
    }

    /// Parse the JSON data into a JsonValue.
    pub fn parse(&mut self) -> Result<JsonValue, ParseError> {
        self.skip_whitespace();
        self.parse_value()
    }

    fn parse_value(&mut self) -> Result<JsonValue, ParseError> {
        match self.peek_byte() {
            Some(b'{') => self.parse_object(),
            Some(b'[') => self.parse_array(),
            Some(b'"') => self.parse_string().map(JsonValue::String),
            Some(b't') | Some(b'f') => self.parse_bool(),
            Some(b'n') => self.parse_null(),
            Some(c) if c.is_ascii_digit() || c == b'-' => self.parse_number(),
            _ => Err(ParseError::UnexpectedToken),
        }
    }

    fn skip_whitespace(&mut self) {
        while self.pos < self.data.len() {
            match self.data[self.pos] {
                b' ' | b'\\n' | b'\\r' | b'\\t' => self.pos += 1,
                _ => break,
            }
        }
    }

    fn peek_byte(&self) -> Option<u8> {
        self.data.get(self.pos).copied()
    }
}`,
        },
        {
          name: "lib.rs",
          type: "file",
          path: "src/lib.rs",
          language: "rust",
          content: "pub mod parser;\npub mod value;\npub mod error;\n\npub use parser::FastJsonParser;\npub use value::JsonValue;\npub use error::ParseError;",
        },
      ],
    },
    {
      name: "Cargo.toml",
      type: "file",
      path: "Cargo.toml",
      language: "toml",
      content: "[package]\nname = \"fast-json\"\nversion = \"0.3.0\"\nedition = \"2021\"\nlicense = \"MIT\"\n\n[dependencies]\nmemmap2 = \"0.9\"\n\n[dev-dependencies]\ncriterion = \"0.5\"\nserde_json = \"1.0\"\n\n[[bench]]\nname = \"parse\"\nharness = false",
    },
    {
      name: "README.md",
      type: "file",
      path: "README.md",
      language: "markdown",
      content: "# fast-json ⚡\n\nBlazing-fast JSON parser for Rust. 3x faster than serde_json.\n\n## Features\n\n- Zero-copy parsing with memory-mapped buffers\n- 3x faster than serde_json on large payloads\n- Minimal allocations\n- Full JSON spec compliance\n\n## Usage\n\n```rust\nuse fast_json::FastJsonParser;\n\nlet data = b'{\"name\": \"WEAVE\", \"version\": \"0.3.0\"}';\nlet mut parser = FastJsonParser::new(data);\nlet value = parser.parse().unwrap();\n```\n\n## Benchmarks\n\n| Dataset | serde_json | fast-json | Speedup |\n|---|---|---|---|\n| 1MB | 12ms | 4ms | 3x |\n| 10MB | 145ms | 48ms | 3x |\n| 100MB | 1.8s | 520ms | 3.5x |",
    },
  ],
};

export const listings: Listing[] = [
  {
    id: "l1",
    seller: users[2],
    type: "template",
    title: "Design System Pro — 120+ Components",
    description: "Complete responsive design system with 120+ components, dark mode, Tailwind CSS, and Figma source files.",
    price: 49,
    compareAt: 99,
    coverImage: "🎨",
    rating: 4.9,
    ratingCount: 234,
    salesCount: 1890,
    tags: ["design", "react", "tailwind", "figma"],
    linkedRepo: "maria_designs/design-system-pro",
    featured: true,
  },
  {
    id: "l2",
    seller: users[5],
    type: "media",
    title: "Pixel Art Asset Pack — 500+ Sprites",
    description: "Animated characters, tilesets, UI elements. Perfect for indie games. Includes Lua/LÖVE integration.",
    price: 19,
    coverImage: "👾",
    rating: 4.8,
    ratingCount: 89,
    salesCount: 456,
    tags: ["gamedev", "pixelart", "sprites", "assets"],
    linkedRepo: "indiedev/pixel-assets-pack",
    featured: true,
  },
  {
    id: "l3",
    seller: users[1],
    type: "course",
    title: "Mastering Rust: From Zero to Production",
    description: "40+ video lessons, hands-on projects, code reviews. Learn systems programming the right way.",
    price: 99,
    compareAt: 199,
    coverImage: "🦀",
    rating: 5.0,
    ratingCount: 178,
    salesCount: 890,
    tags: ["rust", "course", "systems", "programming"],
    featured: true,
  },
  {
    id: "l4",
    seller: users[1],
    type: "code",
    title: "fast-json — Premium License",
    description: "Commercial license for fast-json. Includes priority support and custom benchmarks for your use case.",
    price: 299,
    coverImage: "⚡",
    rating: 4.9,
    ratingCount: 45,
    salesCount: 78,
    tags: ["rust", "json", "license", "commercial"],
    linkedRepo: "alexdev/fast-json",
  },
  {
    id: "l5",
    seller: users[4],
    type: "service",
    title: "Architecture Review & Consulting",
    description: "1-hour deep architecture review of your project. Includes written report and follow-up call.",
    price: 500,
    coverImage: "🏗️",
    rating: 5.0,
    ratingCount: 23,
    salesCount: 23,
    tags: ["consulting", "architecture", "review"],
  },
  {
    id: "l6",
    seller: users[3],
    type: "template",
    title: "CI/CD Pipeline Templates Pack",
    description: "20+ ready-to-use YAML pipeline templates for Docker, Kubernetes, monorepos, and more.",
    price: 29,
    coverImage: "🔥",
    rating: 4.7,
    ratingCount: 67,
    salesCount: 234,
    tags: ["ci-cd", "docker", "kubernetes", "yaml"],
    linkedRepo: "codeforge/forge-ci",
  },
];

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "sp1",
    creator: users[1],
    name: "Premium Access",
    description: "Exclusive Rust content, code reviews, and early access to crates",
    price: 10,
    interval: "monthly",
    features: ["Early access to new crates", "Exclusive benchmark data", "Code review requests", "Private Q&A channel"],
    subscriberCount: 890,
    linkedChannel: "c2",
  },
  {
    id: "sp2",
    creator: users[2],
    name: "Designer Pro",
    description: "Premium design resources, templates, and monthly design reviews",
    price: 15,
    interval: "monthly",
    features: ["Monthly new template drops", "Design review sessions", "Figma source files", "Private design community"],
    subscriberCount: 567,
    linkedChannel: "c5",
  },
  {
    id: "sp3",
    creator: users[4],
    name: "CodeForge Insider",
    description: "Behind-the-scenes, early releases, and direct input on roadmap",
    price: 25,
    interval: "monthly",
    features: ["Early access to releases", "Roadmap voting", "Direct team access", "Exclusive tutorials"],
    subscriberCount: 1234,
    linkedRepo: "r2",
  },
];

export const transactions: Transaction[] = [
  { id: "t1", type: "subscription", amount: 1000, fee: 100, status: "completed", description: "Alex Chen — Premium Access (monthly)", date: "2026-09-30T10:00:00Z" },
  { id: "t2", type: "purchase", amount: 4900, fee: 490, status: "completed", description: "Design System Pro — 120+ Components", date: "2026-09-28T14:30:00Z" },
  { id: "t3", type: "tip", amount: 500, fee: 25, status: "completed", description: "Tip to @codeforge", date: "2026-09-27T09:15:00Z" },
  { id: "t4", type: "payout", amount: 24500, fee: 0, status: "pending", description: "Payout to bank account ••••4521", date: "2026-09-26T16:00:00Z" },
  { id: "t5", type: "purchase", amount: 1900, fee: 190, status: "completed", description: "Pixel Art Asset Pack — 500+ Sprites", date: "2026-09-25T20:45:00Z" },
];

export const notifications: Notification[] = [
  { id: "n1", type: "like", user: users[1], text: "liked your post about WEAVE messaging", createdAt: "2026-09-30T11:30:00Z", read: false },
  { id: "n2", type: "subscribe", user: users[2], text: "subscribed to your Premium channel ($10/mo)", createdAt: "2026-09-30T10:45:00Z", read: false },
  { id: "n3", type: "tip", user: users[4], text: "sent you a $5 tip for weave-core", createdAt: "2026-09-30T09:15:00Z", read: false },
  { id: "n4", type: "follow", user: users[3], text: "started following you", createdAt: "2026-09-29T18:20:00Z", read: false },
  { id: "n5", type: "purchase", user: users[5], text: "purchased Design System Pro ($49)", createdAt: "2026-09-29T14:00:00Z", read: true },
];

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date("2026-09-30T12:00:00Z");
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}
