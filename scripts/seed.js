"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/seed.ts
// Usage: pnpm db:seed
require("dotenv/config");
var bcryptjs_1 = require("bcryptjs");
var drizzle_orm_1 = require("drizzle-orm");
var schema_1 = require("../src/db/schema");
// ── Thèmes ─────────────────────────────────────────────────────────────────
var DEFAULT_THEMES = [
    {
        id: "minimal",
        name: "Minimal",
        description: "Épuré, typographique, beaucoup d'air.",
        colors: {
            primary: "#111111", onPrimary: "#FFFFFF", background: "#FFFFFF",
            surface: "#F6F6F5", text: "#111111", muted: "#6B7280",
            border: "#E5E5E3", accent: "#111111",
        },
        fonts: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
        borderRadius: "0.5rem",
    },
    {
        id: "warm",
        name: "Chaleureux",
        description: "Tons terre et serif élégante, artisanat et restauration.",
        colors: {
            primary: "#9A3412", onPrimary: "#FFF7ED", background: "#FFFBF5",
            surface: "#FDF0E2", text: "#3B1E10", muted: "#8A6A55",
            border: "#EEDCC8", accent: "#C2410C",
        },
        fonts: { heading: "'Playfair Display', serif", body: "'Lora', serif" },
        borderRadius: "1rem",
    },
    {
        id: "corporate",
        name: "Corporate",
        description: "Sérieux et lisible, pour les services aux entreprises.",
        colors: {
            primary: "#1D4ED8", onPrimary: "#FFFFFF", background: "#FFFFFF",
            surface: "#F1F5F9", text: "#0F172A", muted: "#64748B",
            border: "#E2E8F0", accent: "#0EA5E9",
        },
        fonts: { heading: "'Inter', sans-serif", body: "'Inter', sans-serif" },
        borderRadius: "0.375rem",
    },
    {
        id: "bold",
        name: "Audacieux",
        description: "Fond sombre, contraste fort, accents lumineux.",
        colors: {
            primary: "#A78BFA", onPrimary: "#12101E", background: "#0E0D16",
            surface: "#1A1826", text: "#F5F3FF", muted: "#A5A0BC",
            border: "#2A2740", accent: "#FBBF24",
        },
        fonts: { heading: "'Space Grotesk', sans-serif", body: "'DM Sans', sans-serif" },
        borderRadius: "0.875rem",
    },
];
// ── Config demo ────────────────────────────────────────────────────────────
var EMAIL = "demo@batiste.app";
var PASSWORD = "batiste2026";
var SUBDOMAIN = "maison-ndoumbe";
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var existingSite, user, _a, _b, site, homeFr, contactFr, menuFr;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: 
                // 1. Seed des thèmes (toujours, idempotent)
                return [4 /*yield*/, db
                        .insert(schema_1.themes)
                        .values(DEFAULT_THEMES.map(function (t) { return ({
                        id: t.id,
                        name: t.name,
                        description: t.description,
                        colors: t.colors,
                        fonts: t.fonts,
                        borderRadius: t.borderRadius,
                        isActive: true,
                    }); }))
                        .onConflictDoNothing({ target: schema_1.themes.id })];
                case 1:
                    // 1. Seed des thèmes (toujours, idempotent)
                    _d.sent();
                    console.log("✓ Thèmes seedés");
                    return [4 /*yield*/, db
                            .select()
                            .from(schema_1.sites)
                            .where((0, drizzle_orm_1.eq)(schema_1.sites.subdomain, SUBDOMAIN))
                            .limit(1)];
                case 2:
                    existingSite = _d.sent();
                    if (!existingSite.length) return [3 /*break*/, 4];
                    console.log("Site demo déjà présent :", SUBDOMAIN);
                    return [4 /*yield*/, pool.end()];
                case 3:
                    _d.sent();
                    return [2 /*return*/];
                case 4: return [4 /*yield*/, db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, EMAIL)).limit(1)];
                case 5:
                    user = (_d.sent())[0];
                    if (!!user) return [3 /*break*/, 8];
                    _b = (_a = db
                        .insert(schema_1.users))
                        .values;
                    _c = {
                        email: EMAIL
                    };
                    return [4 /*yield*/, bcryptjs_1.default.hash(PASSWORD, 12)];
                case 6: return [4 /*yield*/, _b.apply(_a, [(_c.passwordHash = _d.sent(),
                            _c.firstName = "Serge",
                            _c.lastName = "Ndoumbe",
                            _c.name = "Serge Ndoumbe",
                            _c)])
                        .returning()];
                case 7:
                    user = (_d.sent())[0];
                    console.log("✓ Utilisateur demo créé");
                    _d.label = 8;
                case 8: return [4 /*yield*/, db
                        .insert(schema_1.sites)
                        .values({
                        ownerId: user.id,
                        name: "Maison Ndoumbe",
                        subdomain: SUBDOMAIN,
                        themeId: "warm",
                        defaultLanguage: "fr",
                        supportedLanguages: ["fr"],
                        status: "published",
                        seoTitle: "Maison Ndoumbe — Traiteur & Événements à Douala",
                        seoDescription: "Cuisine camerounaise authentique pour vos mariages, baptêmes et événements d'entreprise à Douala et Yaoundé.",
                    })
                        .returning()];
                case 9:
                    site = (_d.sent())[0];
                    return [4 /*yield*/, db.insert(schema_1.siteMembers).values({ siteId: site.id, userId: user.id, role: "owner" })];
                case 10:
                    _d.sent();
                    return [4 /*yield*/, db.insert(schema_1.featureFlags).values(["blog", "catalog", "quote", "booking"].map(function (feature) { return ({
                            siteId: site.id,
                            feature: feature,
                            isEnabled: true,
                        }); }))];
                case 11:
                    _d.sent();
                    console.log("✓ Site créé :", SUBDOMAIN);
                    return [4 /*yield*/, db
                            .insert(schema_1.pages)
                            .values({
                            siteId: site.id,
                            slug: "",
                            language: "fr",
                            title: "Accueil",
                            status: "published",
                            isHomepage: true,
                            sortOrder: 0,
                            seoTitle: "Maison Ndoumbe — Traiteur à Douala",
                        })
                            .returning()];
                case 12:
                    homeFr = (_d.sent())[0];
                    return [4 /*yield*/, db
                            .insert(schema_1.pages)
                            .values({
                            siteId: site.id,
                            slug: "contact",
                            language: "fr",
                            title: "Contact",
                            status: "published",
                            sortOrder: 1,
                        })
                            .returning()];
                case 13:
                    contactFr = (_d.sent())[0];
                    return [4 /*yield*/, db
                            .insert(schema_1.pages)
                            .values({
                            siteId: site.id,
                            slug: "menu",
                            language: "fr",
                            title: "Notre menu",
                            status: "published",
                            sortOrder: 2,
                        })
                            .returning()];
                case 14:
                    menuFr = (_d.sent())[0];
                    console.log("✓ Pages créées");
                    // 6. Blocs
                    return [4 /*yield*/, db.insert(schema_1.blocks).values([
                            // Accueil — Hero
                            {
                                pageId: homeFr.id,
                                type: "hero",
                                position: 0,
                                isVisible: true,
                                content: {
                                    title: "La cuisine camerounaise, au coeur de vos événements",
                                    subtitle: "Mariages, baptêmes, anniversaires et réceptions d'entreprise. Maison Ndoumbe prend en charge votre buffet de A à Z à Douala et Yaoundé.",
                                    imageUrl: "",
                                    buttonText: "Demander un devis",
                                    buttonUrl: "/contact",
                                    alignment: "center",
                                    overlay: true,
                                },
                            },
                            // Accueil — Services
                            {
                                pageId: homeFr.id,
                                type: "card_grid",
                                position: 1,
                                isVisible: true,
                                content: {
                                    title: "Nos prestations",
                                    columns: "3",
                                    cards: [
                                        {
                                            title: "Mariages & Cérémonies",
                                            description: "Menu complet, service à table ou buffet, décoration de table incluse sur demande.",
                                            imageUrl: "",
                                            buttonUrl: "/contact",
                                        },
                                        {
                                            title: "Événements d'entreprise",
                                            description: "Cocktails, déjeuners de travail, séminaires. Livraison sur site à Douala.",
                                            imageUrl: "",
                                            buttonUrl: "/contact",
                                        },
                                        {
                                            title: "Commandes à emporter",
                                            description: "Ndolé, poulet DG, eru, koki — commandez 48h à l'avance pour vos réceptions privées.",
                                            imageUrl: "",
                                            buttonUrl: "/menu",
                                        },
                                    ],
                                },
                            },
                            // Accueil — Produits phares
                            {
                                pageId: homeFr.id,
                                type: "product_grid",
                                position: 2,
                                isVisible: true,
                                content: {
                                    title: "Nos plats signature",
                                    category: "",
                                    limit: 6,
                                    showPrice: true,
                                    columns: "3",
                                },
                            },
                            // Accueil — Témoignages
                            {
                                pageId: homeFr.id,
                                type: "testimonials",
                                position: 3,
                                isVisible: true,
                                content: {
                                    title: "Ils nous ont fait confiance",
                                    items: [
                                        {
                                            quote: "Le ndolé était exactement comme celui de ma grand-mère. Tous nos invités ont redemandé la recette !",
                                            name: "Christelle Mbarga",
                                            role: "Mariée, Douala",
                                            avatarUrl: "",
                                        },
                                        {
                                            quote: "Service impeccable pour notre séminaire de 80 personnes. Ponctuel, propre et délicieux.",
                                            name: "Patrick Essomba",
                                            role: "DRH, Société Générale Cameroun",
                                            avatarUrl: "",
                                        },
                                        {
                                            quote: "Le poulet DG et le bâton de manioc ont fait l'unanimité. On refera appel à vous sans hésiter.",
                                            name: "Armelle Nkoa",
                                            role: "Organisatrice d'événements, Yaoundé",
                                            avatarUrl: "",
                                        },
                                    ],
                                },
                            },
                            // Accueil — CTA
                            {
                                pageId: homeFr.id,
                                type: "cta",
                                position: 4,
                                isVisible: true,
                                content: {
                                    title: "Un événement en préparation ?",
                                    description: "Contactez-nous au moins 5 jours à l'avance. Nous établissons un devis gratuit sous 24h.",
                                    buttonText: "Obtenir un devis",
                                    buttonUrl: "/contact",
                                },
                            },
                            // Contact
                            {
                                pageId: contactFr.id,
                                type: "contact_form",
                                position: 0,
                                isVisible: true,
                                content: {
                                    title: "Contactez-nous",
                                    description: "Décrivez votre événement (date, nombre de personnes, type de menu) et nous revenons vers vous rapidement.",
                                    email: "contact@maison-ndoumbe.cm",
                                    phone: "+237 6 99 00 11 22",
                                    address: "Akwa, Douala, Cameroun",
                                },
                            },
                            // Menu — Texte intro
                            {
                                pageId: menuFr.id,
                                type: "rich_text",
                                position: 0,
                                isVisible: true,
                                content: {
                                    title: "Notre carte",
                                    content: "Tous nos plats sont préparés le jour même avec des ingrédients frais du marché de Douala.\n\nNous proposons des menus sur mesure selon vos préférences et votre budget. Contactez-nous pour un devis personnalisé.",
                                    alignment: "left",
                                },
                            },
                            // Menu — Grille produits
                            {
                                pageId: menuFr.id,
                                type: "product_grid",
                                position: 1,
                                isVisible: true,
                                content: {
                                    title: "Tous nos plats",
                                    category: "",
                                    limit: 12,
                                    showPrice: true,
                                    columns: "3",
                                },
                            },
                        ])];
                case 15:
                    // 6. Blocs
                    _d.sent();
                    console.log("✓ Blocs créés");
                    // 7. Catalogue — plats camerounais
                    return [4 /*yield*/, db.insert(schema_1.products).values([
                            {
                                siteId: site.id,
                                name: "Ndolé",
                                description: "Plat national camerounais à base de feuilles de ndolé, crevettes séchées et arachides. Servi avec du bâton de manioc ou du plantain.",
                                price: 350000, // 3 500 FCFA en centimes
                                currency: "XAF",
                                category: "Plats traditionnels",
                                images: [],
                                customAttributes: {
                                    Portions: "Pour 2 personnes",
                                    Allergènes: "Arachides, crustacés",
                                    Délai: "Commande 48h à l'avance",
                                },
                                status: "published",
                                sortOrder: 0,
                            },
                            {
                                siteId: site.id,
                                name: "Poulet DG",
                                description: "Poulet braisé sauté avec plantains mûrs, carottes et poivrons. Un classique des grandes occasions.",
                                price: 450000,
                                currency: "XAF",
                                category: "Plats traditionnels",
                                images: [],
                                customAttributes: {
                                    Portions: "Pour 2 personnes",
                                    Cuisson: "Braisé puis sauté",
                                    Délai: "Commande 48h à l'avance",
                                },
                                status: "published",
                                sortOrder: 1,
                            },
                            {
                                siteId: site.id,
                                name: "Eru",
                                description: "Légumes eru mijotés avec huile de palme, waterleaf et viande fumée. Spécialité du Sud-Ouest.",
                                price: 300000,
                                currency: "XAF",
                                category: "Plats traditionnels",
                                images: [],
                                customAttributes: {
                                    Portions: "Pour 2 personnes",
                                    Région: "Sud-Ouest Cameroun",
                                    Délai: "Commande 48h à l'avance",
                                },
                                status: "published",
                                sortOrder: 2,
                            },
                            {
                                siteId: site.id,
                                name: "Koki",
                                description: "Gâteau de haricots à la vapeur enveloppé dans des feuilles de bananier. Idéal en entrée ou accompagnement.",
                                price: 150000,
                                currency: "XAF",
                                category: "Entrées & accompagnements",
                                images: [],
                                customAttributes: {
                                    Portions: "4 pièces",
                                    Végétarien: "Oui",
                                    Délai: "Commande 48h à l'avance",
                                },
                                status: "published",
                                sortOrder: 3,
                            },
                            {
                                siteId: site.id,
                                name: "Buffet Mariage (par personne)",
                                description: "Formule complète : entrées, 3 plats chauds au choix, accompagnements, desserts et boissons. Service à table inclus.",
                                price: 1500000,
                                currency: "XAF",
                                category: "Formules événements",
                                images: [],
                                customAttributes: {
                                    "Minimum de personnes": "30",
                                    "Service inclus": "Oui",
                                    "Délai de réservation": "7 jours minimum",
                                },
                                status: "published",
                                sortOrder: 4,
                            },
                            {
                                siteId: site.id,
                                name: "Cocktail Entreprise (par personne)",
                                description: "Petits fours chauds et froids, brochettes, jus de fruits locaux. Idéal pour 20 à 200 personnes.",
                                price: 800000,
                                currency: "XAF",
                                category: "Formules événements",
                                images: [],
                                customAttributes: {
                                    "Minimum de personnes": "20",
                                    Livraison: "Douala et Yaoundé",
                                    "Délai de réservation": "5 jours minimum",
                                },
                                status: "published",
                                sortOrder: 5,
                            },
                        ])];
                case 16:
                    // 7. Catalogue — plats camerounais
                    _d.sent();
                    console.log("✓ Produits créés");
                    // 8. Articles de blog
                    return [4 /*yield*/, db.insert(schema_1.blogPosts).values([
                            {
                                siteId: site.id,
                                slug: "comment-reussir-son-ndole",
                                language: "fr",
                                title: "Comment réussir son ndolé : les secrets de Maison Ndoumbe",
                                excerpt: "Le ndolé est bien plus qu'un plat — c'est un symbole. Voici les étapes clés pour le préparer comme il se doit.",
                                content: "Le ndolé est le plat national du Cameroun, et pour cause : il réunit toutes les saveurs du terroir en une seule assiette.\n\n## Les ingrédients essentiels\n\nLa qualité des feuilles de ndolé est primordiale. Choisissez-les fraîches au marché, jamais surgelées. Les crevettes séchées doivent être bien parfumées — c'est elles qui donnent le fond de goût.\n\n## La technique de désamertume\n\nFaites bouillir les feuilles trois fois en changeant l'eau à chaque fois. C'est l'étape que beaucoup sautent, et c'est une erreur.\n\n## Le secret de la texture\n\nLes arachides doivent être moulues grossièrement, pas en pâte fine. Elles apportent du corps sans alourdir le plat.",
                                category: "Recettes",
                                tags: ["ndolé", "recette", "cuisine camerounaise"],
                                authorId: user.id,
                                status: "published",
                                publishedAt: new Date(),
                            },
                            {
                                siteId: site.id,
                                slug: "organiser-mariage-douala-2025",
                                language: "fr",
                                title: "Organiser un mariage à Douala en 2025 : notre guide traiteur",
                                excerpt: "Budget, délais, choix du menu, nombre de personnes — tout ce qu'il faut savoir avant de contacter un traiteur.",
                                content: "Organiser un mariage à Douala demande une planification rigoureuse, surtout côté restauration.\n\n## Combien de temps à l'avance réserver ?\n\nNous recommandons de contacter votre traiteur au minimum 3 semaines avant la date. Pour les mariages de plus de 100 personnes, comptez 6 semaines.\n\n## Quel budget prévoir ?\n\nPour un buffet complet avec service, comptez entre 10 000 et 25 000 FCFA par personne selon les plats choisis.\n\n## Les plats incontournables\n\nNdolé, poulet DG et eru sont les trois piliers d'un mariage camerounais réussi. Ajoutez du bâton de manioc et du plantain braisé pour les accompagnements.",
                                category: "Conseils",
                                tags: ["mariage", "Douala", "organisation", "traiteur"],
                                authorId: user.id,
                                status: "published",
                                publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                            },
                        ])];
                case 17:
                    // 8. Articles de blog
                    _d.sent();
                    console.log("✓ Articles de blog créés");
                    // 9. Témoignages
                    return [4 /*yield*/, db.insert(schema_1.testimonials).values([
                            {
                                siteId: site.id,
                                authorName: "Christelle Mbarga",
                                role: "Mariée, Douala",
                                quote: "Le ndolé était exactement comme celui de ma grand-mère. Tous nos invités ont redemandé la recette !",
                                rating: 5,
                                status: "approved",
                                source: "public",
                            },
                            {
                                siteId: site.id,
                                authorName: "Patrick Essomba",
                                role: "DRH, Société Générale Cameroun",
                                quote: "Service impeccable pour notre séminaire de 80 personnes. Ponctuel, propre et délicieux.",
                                rating: 5,
                                status: "approved",
                                source: "public",
                            },
                            {
                                siteId: site.id,
                                authorName: "Armelle Nkoa",
                                role: "Organisatrice d'événements, Yaoundé",
                                quote: "Le poulet DG et le bâton de manioc ont fait l'unanimité. On refera appel à vous sans hésiter.",
                                rating: 5,
                                status: "approved",
                                source: "public",
                            },
                            {
                                siteId: site.id,
                                authorName: "Jean-Baptiste Fotso",
                                role: "Directeur, Hôtel Akwa Palace",
                                quote: "Nous faisons appel à Maison Ndoumbe pour tous nos événements privés. Professionnalisme et qualité constante.",
                                rating: 5,
                                status: "approved",
                                source: "dashboard",
                            },
                        ])];
                case 18:
                    // 9. Témoignages
                    _d.sent();
                    console.log("✓ Témoignages créés");
                    console.log("\n--- Seed terminé ---");
                    console.log("Email    :", EMAIL);
                    console.log("Mot de passe :", PASSWORD);
                    console.log("Site     :", "http://localhost:3000/s/".concat(SUBDOMAIN));
                    console.log("Dashboard:", "http://localhost:3000/fr/dashboard");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (error) {
    console.error(error);
    process.exit(1);
})
    .finally(function () { return pool.end(); });
