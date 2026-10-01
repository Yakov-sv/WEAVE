export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  banner?: string;
  verified: boolean;
  role: "user" | "creator" | "team" | "admin";
  followers: number;
  following: number;
  reputation: number;
  location?: string;
  website?: string;
}

export interface Post {
  id: string;
  author: User;
  type: "text" | "media" | "code" | "link";
  content: string;
  media?: string[];
  codeRef?: { repo: string; file: string; language: string; lines: [number, number] };
  linkUrl?: string;
  linkPreview?: { title: string; description: string; image: string };
  createdAt: string;
  likes: number;
  replies: number;
  reposts: number;
  bookmarks: number;
  liked?: boolean;
  bookmarked?: boolean;
  topics: string[];
}

export interface Conversation {
  id: string;
  type: "dm" | "group" | "channel";
  title: string;
  description?: string;
  avatar: string;
  ownerId: string;
  isPaid: boolean;
  subscriptionPrice?: number;
  memberCount: number;
  subscriberCount?: number;
  lastMessage?: string;
  lastMessageAt?: string;
  unread?: number;
  verified?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  reactions?: { emoji: string; count: number; reacted?: boolean }[];
}

export interface ChannelPost {
  id: string;
  channelId: string;
  authorId: string;
  content: string;
  createdAt: string;
  views: number;
  reactions: number;
  isPaywall?: boolean;
  paywallPreview?: string;
}

export interface Repository {
  id: string;
  owner: User;
  name: string;
  description: string;
  visibility: "public" | "private" | "paid";
  language: string;
  stars: number;
  forks: number;
  watchers: number;
  topics: string[];
  updatedAt: string;
  license?: string;
  subscriptionPrice?: number;
  isTemplate?: boolean;
}

export interface FileNode {
  name: string;
  type: "file" | "dir";
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

export interface Listing {
  id: string;
  seller: User;
  type: "code" | "template" | "course" | "media" | "service";
  title: string;
  description: string;
  price: number;
  compareAt?: number;
  coverImage: string;
  rating: number;
  ratingCount: number;
  salesCount: number;
  tags: string[];
  linkedRepo?: string;
  featured?: boolean;
}

export interface SubscriptionPlan {
  id: string;
  creator: User;
  name: string;
  description: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  subscriberCount: number;
  linkedChannel?: string;
  linkedRepo?: string;
}

export interface Transaction {
  id: string;
  type: "purchase" | "subscription" | "tip" | "payout";
  amount: number;
  fee: number;
  status: "completed" | "pending" | "failed";
  description: string;
  date: string;
}

export interface Notification {
  id: string;
  type: "like" | "reply" | "follow" | "subscribe" | "purchase" | "tip" | "repo" | "mention";
  user: User;
  text: string;
  createdAt: string;
  read: boolean;
}
