import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  jsonb,
  index,
  uniqueIndex,
  primaryKey,
} from "drizzle-orm/pg-core";

// ============================================================================
// Phase 1 : Base de données - Schéma complet
// ============================================================================

// 1. USERS - Les comptes qui se connectent à Batiste
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Champs requis par l'adaptateur Auth.js.
  name: varchar("name", { length: 200 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  // Profil métier Batiste conservé en complément du modèle Auth.js.
  passwordHash: varchar("password_hash", { length: 255 }),
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Modèle officiel Auth.js, avec des noms SQL explicites et cohérents avec le reste du projet.
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(),
    provider: varchar("provider", { length: 100 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 50 }),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    index("accounts_user_idx").on(table.userId),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: varchar("session_token", { length: 255 }).primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires").notNull(),
  },
  (table) => [index("sessions_user_idx").on(table.userId)],
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires").notNull(),
  },
  (table) => [primaryKey({ columns: [table.identifier, table.token] })],
);

// 2. THEMES - Liste des thèmes disponibles
export const themes = pgTable("themes", {
  id: varchar("id", { length: 50 }).primaryKey(), // ex: "minimal", "warm", "corporate", "bold"
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  colors: jsonb("colors").notNull(), // { primary, secondary, background, surface, text, muted }
  fonts: jsonb("fonts").notNull(), // { heading, body }
  borderRadius: varchar("border_radius", { length: 20 }).default("0.5rem"),
  isActive: boolean("is_active").default(true),
  previewImage: text("preview_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. SITES - Chaque site client
export const sites = pgTable(
  "sites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    subdomain: varchar("subdomain", { length: 100 }).notNull().unique(),
    themeId: varchar("theme_id", { length: 50 })
      .notNull()
      .references(() => themes.id, { onDelete: "restrict" }),
    defaultLanguage: varchar("default_language", { length: 10 })
      .notNull()
      .default("fr"),
    supportedLanguages: jsonb("supported_languages").notNull(), // ["fr", "en"]
    status: varchar("status", { length: 20 }).default("draft").notNull(), // draft, published
    customDomain: varchar("custom_domain", { length: 255 }),
    logoUrl: text("logo_url"),
    faviconUrl: text("favicon_url"),
    seoTitle: varchar("seo_title", { length: 200 }),
    seoDescription: text("seo_description"),
    seoImage: text("seo_image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("sites_subdomain_idx").on(table.subdomain),
    index("sites_owner_idx").on(table.ownerId),
  ],
);

// 4. SITE_MEMBERS - Qui a accès à quel site
export const siteMembers = pgTable(
  "site_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).notNull(), // owner, admin, editor
    invitedAt: timestamp("invited_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("site_members_site_user_unique").on(table.siteId, table.userId),
    index("site_members_site_idx").on(table.siteId),
    index("site_members_user_idx").on(table.userId),
  ],
);

// 5. PAGES - Les pages d'un site
export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 200 }).notNull(),
    language: varchar("language", { length: 10 }).notNull().default("fr"),
    title: varchar("title", { length: 200 }).notNull(),
    status: varchar("status", { length: 20 }).default("draft").notNull(), // draft, published
    seoTitle: varchar("seo_title", { length: 200 }),
    seoDescription: text("seo_description"),
    seoKeywords: text("seo_keywords"),
    isHomepage: boolean("is_homepage").default(false),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("pages_site_slug_language_unique").on(
      table.siteId,
      table.slug,
      table.language,
    ),
    index("pages_site_idx").on(table.siteId),
  ],
);

// 6. BLOCKS - Le contenu de chaque page
export const blocks = pgTable(
  "blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pageId: uuid("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(), // hero, carousel, card_grid, cta, form, testimonials, rich_text, product_grid, contact_form, booking_form
    position: integer("position").notNull(),
    content: jsonb("content").notNull(),
    isVisible: boolean("is_visible").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("blocks_page_idx").on(table.pageId),
    uniqueIndex("blocks_page_position_unique").on(table.pageId, table.position),
  ],
);

// 7. PRODUCTS - Le catalogue universel d'un site
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    price: integer("price"), // en centimes
    currency: varchar("currency", { length: 3 }).default("EUR"),
    images: jsonb("images"), // array of URLs
    category: varchar("category", { length: 100 }),
    customAttributes: jsonb("custom_attributes"), // { taille: "M", couleur: "Rouge", ... }
    status: varchar("status", { length: 20 }).default("draft").notNull(), // draft, published
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("products_site_idx").on(table.siteId),
    index("products_site_status_idx").on(table.siteId, table.status),
  ],
);

// 8. FORM_SUBMISSIONS - Réponses aux formulaires
export const formSubmissions = pgTable(
  "form_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    formType: varchar("form_type", { length: 50 }).notNull(), // contact, quote, booking, custom
    pageId: uuid("page_id").references(() => pages.id, {
      onDelete: "set null",
    }),
    data: jsonb("data").notNull(),
    status: varchar("status", { length: 20 }).default("new").notNull(), // new, read, archived
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("form_submissions_site_idx").on(table.siteId),
    index("form_submissions_site_status_idx").on(table.siteId, table.status),
  ],
);

// 9. MEDIA - Fichiers uploadés
export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    provider: varchar("provider", { length: 30 })
      .notNull()
      .default("cloudinary"),
    providerAssetId: varchar("provider_asset_id", { length: 500 }),
    filename: varchar("filename", { length: 255 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }).notNull(),
    size: integer("size").notNull(), // en bytes
    width: integer("width"),
    height: integer("height"),
    alt: varchar("alt", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("media_site_idx").on(table.siteId)],
);

// 10. FEATURE_FLAGS - Modules activés par site
export const featureFlags = pgTable(
  "feature_flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    feature: varchar("feature", { length: 50 }).notNull(), // blog, catalog, quote, booking
    isEnabled: boolean("is_enabled").default(false),
    config: jsonb("config"), // config spécifique au module
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("feature_flags_site_idx").on(table.siteId),
    uniqueIndex("feature_flags_site_feature_unique").on(
      table.siteId,
      table.feature,
    ),
  ],
);

// 11. ANALYTICS EVENTS - Visites légères par site
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    path: varchar("path", { length: 500 }).notNull(),
    visitorId: varchar("visitor_id", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("analytics_events_site_created_idx").on(
      table.siteId,
      table.createdAt,
    ),
    index("analytics_events_site_visitor_idx").on(
      table.siteId,
      table.visitorId,
    ),
  ],
);

// 12. TESTIMONIALS - Avis clients avec modération
export const testimonials = pgTable(
  "testimonials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    authorName: varchar("author_name", { length: 120 }).notNull(),
    role: varchar("role", { length: 120 }),
    quote: text("quote").notNull(),
    rating: integer("rating").default(5).notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, approved, rejected
    source: varchar("source", { length: 20 }).default("dashboard").notNull(), // dashboard, public
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("testimonials_site_status_idx").on(table.siteId, table.status),
  ],
);

// Blog posts (module Blog)
export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 200 }).notNull(),
    language: varchar("language", { length: 10 }).notNull().default("fr"),
    title: varchar("title", { length: 300 }).notNull(),
    content: text("content").notNull(), // contenu riche HTML/Markdown
    excerpt: text("excerpt"),
    coverImage: text("cover_image"),
    category: varchar("category", { length: 100 }),
    tags: jsonb("tags"), // array de strings
    authorId: uuid("author_id").references(() => users.id, {
      onDelete: "set null",
    }),
    status: varchar("status", { length: 20 }).default("draft").notNull(), // draft, published
    publishedAt: timestamp("published_at"),
    seoTitle: varchar("seo_title", { length: 200 }),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("blog_posts_site_idx").on(table.siteId),
    index("blog_posts_site_status_idx").on(table.siteId, table.status),
    uniqueIndex("blog_posts_site_slug_language_unique").on(
      table.siteId,
      table.slug,
      table.language,
    ),
  ],
);

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Theme = typeof themes.$inferSelect;
export type NewTheme = typeof themes.$inferInsert;
export type Site = typeof sites.$inferSelect;
export type NewSite = typeof sites.$inferInsert;
export type SiteMember = typeof siteMembers.$inferSelect;
export type NewSiteMember = typeof siteMembers.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type Block = typeof blocks.$inferSelect;
export type NewBlock = typeof blocks.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type NewFormSubmission = typeof formSubmissions.$inferInsert;
export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
export type FeatureFlag = typeof featureFlags.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type NewAnalyticsEvent = typeof analyticsEvents.$inferInsert;
export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
