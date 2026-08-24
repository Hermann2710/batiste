"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogPosts = exports.testimonials = exports.analyticsEvents = exports.featureFlags = exports.media = exports.formSubmissions = exports.products = exports.blocks = exports.pages = exports.siteMembers = exports.sites = exports.themes = exports.verificationTokens = exports.sessions = exports.accounts = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
// ============================================================================
// Phase 1 : Base de données - Schéma complet
// ============================================================================
// 1. USERS - Les comptes qui se connectent à Batiste
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    // Champs requis par l'adaptateur Auth.js.
    name: (0, pg_core_1.varchar)("name", { length: 200 }),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    emailVerified: (0, pg_core_1.timestamp)("email_verified"),
    image: (0, pg_core_1.text)("image"),
    // Profil métier Batiste conservé en complément du modèle Auth.js.
    passwordHash: (0, pg_core_1.varchar)("password_hash", { length: 255 }),
    firstName: (0, pg_core_1.varchar)("first_name", { length: 100 }),
    lastName: (0, pg_core_1.varchar)("last_name", { length: 100 }),
    avatarUrl: (0, pg_core_1.text)("avatar_url"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Modèle officiel Auth.js, avec des noms SQL explicites et cohérents avec le reste du projet.
exports.accounts = (0, pg_core_1.pgTable)("accounts", {
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }, { onDelete: "cascade" }),
    type: (0, pg_core_1.varchar)("type", { length: 50 }).notNull(),
    provider: (0, pg_core_1.varchar)("provider", { length: 100 }).notNull(),
    providerAccountId: (0, pg_core_1.varchar)("provider_account_id", { length: 255 }).notNull(),
    refresh_token: (0, pg_core_1.text)("refresh_token"), access_token: (0, pg_core_1.text)("access_token"), expires_at: (0, pg_core_1.integer)("expires_at"),
    token_type: (0, pg_core_1.varchar)("token_type", { length: 50 }), scope: (0, pg_core_1.text)("scope"), id_token: (0, pg_core_1.text)("id_token"), session_state: (0, pg_core_1.text)("session_state"),
}, function (table) { return [(0, pg_core_1.primaryKey)({ columns: [table.provider, table.providerAccountId] }), (0, pg_core_1.index)("accounts_user_idx").on(table.userId)]; });
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    sessionToken: (0, pg_core_1.varchar)("session_token", { length: 255 }).primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull().references(function () { return exports.users.id; }, { onDelete: "cascade" }),
    expires: (0, pg_core_1.timestamp)("expires").notNull(),
}, function (table) { return [(0, pg_core_1.index)("sessions_user_idx").on(table.userId)]; });
exports.verificationTokens = (0, pg_core_1.pgTable)("verification_tokens", {
    identifier: (0, pg_core_1.varchar)("identifier", { length: 255 }).notNull(), token: (0, pg_core_1.varchar)("token", { length: 255 }).notNull(), expires: (0, pg_core_1.timestamp)("expires").notNull(),
}, function (table) { return [(0, pg_core_1.primaryKey)({ columns: [table.identifier, table.token] })]; });
// 2. THEMES - Liste des thèmes disponibles
exports.themes = (0, pg_core_1.pgTable)("themes", {
    id: (0, pg_core_1.varchar)("id", { length: 50 }).primaryKey(), // ex: "minimal", "warm", "corporate", "bold"
    name: (0, pg_core_1.varchar)("name", { length: 100 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    colors: (0, pg_core_1.jsonb)("colors").notNull(), // { primary, secondary, background, surface, text, muted }
    fonts: (0, pg_core_1.jsonb)("fonts").notNull(), // { heading, body }
    borderRadius: (0, pg_core_1.varchar)("border_radius", { length: 20 }).default("0.5rem"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    previewImage: (0, pg_core_1.text)("preview_image"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// 3. SITES - Chaque site client
exports.sites = (0, pg_core_1.pgTable)("sites", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    ownerId: (0, pg_core_1.uuid)("owner_id")
        .notNull()
        .references(function () { return exports.users.id; }, { onDelete: "cascade" }),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    subdomain: (0, pg_core_1.varchar)("subdomain", { length: 100 }).notNull().unique(),
    themeId: (0, pg_core_1.varchar)("theme_id", { length: 50 })
        .notNull()
        .references(function () { return exports.themes.id; }, { onDelete: "restrict" }),
    defaultLanguage: (0, pg_core_1.varchar)("default_language", { length: 10 })
        .notNull()
        .default("fr"),
    supportedLanguages: (0, pg_core_1.jsonb)("supported_languages").notNull(), // ["fr", "en"]
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("draft").notNull(), // draft, published
    customDomain: (0, pg_core_1.varchar)("custom_domain", { length: 255 }),
    logoUrl: (0, pg_core_1.text)("logo_url"),
    faviconUrl: (0, pg_core_1.text)("favicon_url"),
    seoTitle: (0, pg_core_1.varchar)("seo_title", { length: 200 }),
    seoDescription: (0, pg_core_1.text)("seo_description"),
    seoImage: (0, pg_core_1.text)("seo_image"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("sites_subdomain_idx").on(table.subdomain),
    (0, pg_core_1.index)("sites_owner_idx").on(table.ownerId),
]; });
// 4. SITE_MEMBERS - Qui a accès à quel site
exports.siteMembers = (0, pg_core_1.pgTable)("site_members", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    siteId: (0, pg_core_1.uuid)("site_id")
        .notNull()
        .references(function () { return exports.sites.id; }, { onDelete: "cascade" }),
    userId: (0, pg_core_1.uuid)("user_id")
        .notNull()
        .references(function () { return exports.users.id; }, { onDelete: "cascade" }),
    role: (0, pg_core_1.varchar)("role", { length: 20 }).notNull(), // owner, admin, editor
    invitedAt: (0, pg_core_1.timestamp)("invited_at").defaultNow().notNull(),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)("site_members_site_user_unique").on(table.siteId, table.userId),
    (0, pg_core_1.index)("site_members_site_idx").on(table.siteId),
    (0, pg_core_1.index)("site_members_user_idx").on(table.userId),
]; });
// 5. PAGES - Les pages d'un site
exports.pages = (0, pg_core_1.pgTable)("pages", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    siteId: (0, pg_core_1.uuid)("site_id")
        .notNull()
        .references(function () { return exports.sites.id; }, { onDelete: "cascade" }),
    slug: (0, pg_core_1.varchar)("slug", { length: 200 }).notNull(),
    language: (0, pg_core_1.varchar)("language", { length: 10 }).notNull().default("fr"),
    title: (0, pg_core_1.varchar)("title", { length: 200 }).notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("draft").notNull(), // draft, published
    seoTitle: (0, pg_core_1.varchar)("seo_title", { length: 200 }),
    seoDescription: (0, pg_core_1.text)("seo_description"),
    seoKeywords: (0, pg_core_1.text)("seo_keywords"),
    isHomepage: (0, pg_core_1.boolean)("is_homepage").default(false),
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, function (table) { return [
    (0, pg_core_1.uniqueIndex)("pages_site_slug_language_unique").on(table.siteId, table.slug, table.language),
    (0, pg_core_1.index)("pages_site_idx").on(table.siteId),
]; });
// 6. BLOCKS - Le contenu de chaque page
exports.blocks = (0, pg_core_1.pgTable)("blocks", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    pageId: (0, pg_core_1.uuid)("page_id")
        .notNull()
        .references(function () { return exports.pages.id; }, { onDelete: "cascade" }),
    type: (0, pg_core_1.varchar)("type", { length: 50 }).notNull(), // hero, carousel, card_grid, cta, form, testimonials, rich_text, product_grid, contact_form, booking_form
    position: (0, pg_core_1.integer)("position").notNull(),
    content: (0, pg_core_1.jsonb)("content").notNull(),
    isVisible: (0, pg_core_1.boolean)("is_visible").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("blocks_page_idx").on(table.pageId),
    (0, pg_core_1.uniqueIndex)("blocks_page_position_unique").on(table.pageId, table.position),
]; });
// 7. PRODUCTS - Le catalogue universel d'un site
exports.products = (0, pg_core_1.pgTable)("products", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    siteId: (0, pg_core_1.uuid)("site_id")
        .notNull()
        .references(function () { return exports.sites.id; }, { onDelete: "cascade" }),
    name: (0, pg_core_1.varchar)("name", { length: 200 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    price: (0, pg_core_1.integer)("price"), // en centimes
    currency: (0, pg_core_1.varchar)("currency", { length: 3 }).default("EUR"),
    images: (0, pg_core_1.jsonb)("images"), // array of URLs
    category: (0, pg_core_1.varchar)("category", { length: 100 }),
    customAttributes: (0, pg_core_1.jsonb)("custom_attributes"), // { taille: "M", couleur: "Rouge", ... }
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("draft").notNull(), // draft, published
    sortOrder: (0, pg_core_1.integer)("sort_order").default(0),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("products_site_idx").on(table.siteId),
    (0, pg_core_1.index)("products_site_status_idx").on(table.siteId, table.status),
]; });
// 8. FORM_SUBMISSIONS - Réponses aux formulaires
exports.formSubmissions = (0, pg_core_1.pgTable)("form_submissions", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    siteId: (0, pg_core_1.uuid)("site_id")
        .notNull()
        .references(function () { return exports.sites.id; }, { onDelete: "cascade" }),
    formType: (0, pg_core_1.varchar)("form_type", { length: 50 }).notNull(), // contact, quote, booking, custom
    pageId: (0, pg_core_1.uuid)("page_id").references(function () { return exports.pages.id; }, { onDelete: "set null" }),
    data: (0, pg_core_1.jsonb)("data").notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("new").notNull(), // new, read, archived
    ipAddress: (0, pg_core_1.varchar)("ip_address", { length: 45 }),
    userAgent: (0, pg_core_1.text)("user_agent"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("form_submissions_site_idx").on(table.siteId),
    (0, pg_core_1.index)("form_submissions_site_status_idx").on(table.siteId, table.status),
]; });
// 9. MEDIA - Fichiers uploadés
exports.media = (0, pg_core_1.pgTable)("media", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    siteId: (0, pg_core_1.uuid)("site_id")
        .notNull()
        .references(function () { return exports.sites.id; }, { onDelete: "cascade" }),
    url: (0, pg_core_1.text)("url").notNull(),
    provider: (0, pg_core_1.varchar)("provider", { length: 30 }).notNull().default("cloudinary"),
    providerAssetId: (0, pg_core_1.varchar)("provider_asset_id", { length: 500 }),
    filename: (0, pg_core_1.varchar)("filename", { length: 255 }).notNull(),
    mimeType: (0, pg_core_1.varchar)("mime_type", { length: 100 }).notNull(),
    size: (0, pg_core_1.integer)("size").notNull(), // en bytes
    width: (0, pg_core_1.integer)("width"),
    height: (0, pg_core_1.integer)("height"),
    alt: (0, pg_core_1.varchar)("alt", { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, function (table) { return [(0, pg_core_1.index)("media_site_idx").on(table.siteId)]; });
// 10. FEATURE_FLAGS - Modules activés par site
exports.featureFlags = (0, pg_core_1.pgTable)("feature_flags", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    siteId: (0, pg_core_1.uuid)("site_id")
        .notNull()
        .references(function () { return exports.sites.id; }, { onDelete: "cascade" }),
    feature: (0, pg_core_1.varchar)("feature", { length: 50 }).notNull(), // blog, catalog, quote, booking
    isEnabled: (0, pg_core_1.boolean)("is_enabled").default(false),
    config: (0, pg_core_1.jsonb)("config"), // config spécifique au module
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("feature_flags_site_idx").on(table.siteId),
    (0, pg_core_1.uniqueIndex)("feature_flags_site_feature_unique").on(table.siteId, table.feature),
]; });
// 11. ANALYTICS EVENTS - Visites légères par site
exports.analyticsEvents = (0, pg_core_1.pgTable)("analytics_events", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    siteId: (0, pg_core_1.uuid)("site_id")
        .notNull()
        .references(function () { return exports.sites.id; }, { onDelete: "cascade" }),
    path: (0, pg_core_1.varchar)("path", { length: 500 }).notNull(),
    visitorId: (0, pg_core_1.varchar)("visitor_id", { length: 100 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("analytics_events_site_created_idx").on(table.siteId, table.createdAt),
    (0, pg_core_1.index)("analytics_events_site_visitor_idx").on(table.siteId, table.visitorId),
]; });
// 12. TESTIMONIALS - Avis clients avec modération
exports.testimonials = (0, pg_core_1.pgTable)("testimonials", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    siteId: (0, pg_core_1.uuid)("site_id")
        .notNull()
        .references(function () { return exports.sites.id; }, { onDelete: "cascade" }),
    authorName: (0, pg_core_1.varchar)("author_name", { length: 120 }).notNull(),
    role: (0, pg_core_1.varchar)("role", { length: 120 }),
    quote: (0, pg_core_1.text)("quote").notNull(),
    rating: (0, pg_core_1.integer)("rating").default(5).notNull(),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("pending").notNull(), // pending, approved, rejected
    source: (0, pg_core_1.varchar)("source", { length: 20 }).default("dashboard").notNull(), // dashboard, public
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("testimonials_site_status_idx").on(table.siteId, table.status),
]; });
// Blog posts (module Blog)
exports.blogPosts = (0, pg_core_1.pgTable)("blog_posts", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    siteId: (0, pg_core_1.uuid)("site_id")
        .notNull()
        .references(function () { return exports.sites.id; }, { onDelete: "cascade" }),
    slug: (0, pg_core_1.varchar)("slug", { length: 200 }).notNull(),
    language: (0, pg_core_1.varchar)("language", { length: 10 }).notNull().default("fr"),
    title: (0, pg_core_1.varchar)("title", { length: 300 }).notNull(),
    content: (0, pg_core_1.text)("content").notNull(), // contenu riche HTML/Markdown
    excerpt: (0, pg_core_1.text)("excerpt"),
    coverImage: (0, pg_core_1.text)("cover_image"),
    category: (0, pg_core_1.varchar)("category", { length: 100 }),
    tags: (0, pg_core_1.jsonb)("tags"), // array de strings
    authorId: (0, pg_core_1.uuid)("author_id").references(function () { return exports.users.id; }, { onDelete: "set null" }),
    status: (0, pg_core_1.varchar)("status", { length: 20 }).default("draft").notNull(), // draft, published
    publishedAt: (0, pg_core_1.timestamp)("published_at"),
    seoTitle: (0, pg_core_1.varchar)("seo_title", { length: 200 }),
    seoDescription: (0, pg_core_1.text)("seo_description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, function (table) { return [
    (0, pg_core_1.index)("blog_posts_site_idx").on(table.siteId),
    (0, pg_core_1.index)("blog_posts_site_status_idx").on(table.siteId, table.status),
    (0, pg_core_1.uniqueIndex)("blog_posts_site_slug_language_unique").on(table.siteId, table.slug, table.language),
]; });
