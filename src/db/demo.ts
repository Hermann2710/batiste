import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  blocks,
  blogPosts,
  featureFlags,
  pages,
  products,
  siteMembers,
  sites,
  themes,
  users,
} from "@/db/schema";
import { DEFAULT_THEMES } from "@/lib/themes";
import { BLOCK_REGISTRY } from "@/lib/blocks";

const EMAIL = "demo@batiste.app";
const PASSWORD = "batiste2026";
const SUBDOMAIN = "atelier-no17";

async function main() {
  await db
    .insert(themes)
    .values(
      DEFAULT_THEMES.map((theme) => ({
        id: theme.id,
        name: theme.name,
        description: theme.description,
        colors: theme.colors,
        fonts: theme.fonts,
        borderRadius: theme.borderRadius,
        isActive: true,
      }))
    )
    .onConflictDoNothing({ target: themes.id });

  const existingSite = await db.select().from(sites).where(eq(sites.subdomain, SUBDOMAIN)).limit(1);
  if (existingSite.length) {
    console.log("Demo site already present:", SUBDOMAIN);
    return;
  }

  let [user] = await db.select().from(users).where(eq(users.email, EMAIL)).limit(1);
  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        email: EMAIL,
        passwordHash: await bcrypt.hash(PASSWORD, 12),
        firstName: "Camille",
        lastName: "Durand",
      })
      .returning();
  }

  const [site] = await db
    .insert(sites)
    .values({
      ownerId: user.id,
      name: "Atelier No17",
      subdomain: SUBDOMAIN,
      themeId: "warm",
      defaultLanguage: "fr",
      supportedLanguages: ["fr", "en"],
      status: "published",
      seoTitle: "Atelier No17 — Ébénisterie sur mesure",
      seoDescription: "Mobilier sur mesure conçu et fabriqué à la main à Lyon.",
    })
    .returning();

  await db.insert(siteMembers).values({ siteId: site.id, userId: user.id, role: "owner" });
  await db.insert(featureFlags).values(
    (["blog", "catalog", "quote", "booking"] as const).map((feature) => ({
      siteId: site.id,
      feature,
      isEnabled: true,
    }))
  );

  const [homeFr] = await db
    .insert(pages)
    .values({
      siteId: site.id,
      slug: "",
      language: "fr",
      title: "Accueil",
      status: "published",
      isHomepage: true,
      sortOrder: 0,
      seoTitle: "Atelier No17",
    })
    .returning();

  const [contactFr] = await db
    .insert(pages)
    .values({
      siteId: site.id,
      slug: "contact",
      language: "fr",
      title: "Contact",
      status: "published",
      sortOrder: 1,
    })
    .returning();

  await db.insert(pages).values({
    siteId: site.id,
    slug: "",
    language: "en",
    title: "Home",
    status: "published",
    isHomepage: true,
    sortOrder: 0,
  });

  await db.insert(blocks).values([
    {
      pageId: homeFr.id,
      type: "hero",
      position: 0,
      isVisible: true,
      content: {
        title: "L'ébénisterie sur mesure, à Lyon",
        subtitle:
          "Nous dessinons et fabriquons du mobilier unique, en bois massif, pour les particuliers et les architectes.",
        imageUrl: "",
        buttonText: "Demander un devis",
        buttonUrl: "/contact",
        alignment: "center",
        overlay: true,
      },
    },
    {
      pageId: homeFr.id,
      type: "card_grid",
      position: 1,
      isVisible: true,
      content: {
        title: "Nos savoir-faire",
        columns: "3",
        cards: [
          { title: "Mobilier sur mesure", description: "Bibliothèques, tables, dressings adaptés à votre espace.", imageUrl: "", buttonUrl: "" },
          { title: "Agencement", description: "Cuisines et aménagements complets, du plan à la pose.", imageUrl: "", buttonUrl: "" },
          { title: "Restauration", description: "Remise en état de pièces anciennes dans les règles de l'art.", imageUrl: "", buttonUrl: "" },
        ],
      },
    },
    {
      pageId: homeFr.id,
      type: "product_grid",
      position: 2,
      isVisible: true,
      content: { title: "Pièces disponibles", category: "", limit: 6, showPrice: true, columns: "3" },
    },
    {
      pageId: homeFr.id,
      type: "testimonials",
      position: 3,
      isVisible: true,
      content: BLOCK_REGISTRY.testimonials.defaults,
    },
    {
      pageId: homeFr.id,
      type: "cta",
      position: 4,
      isVisible: true,
      content: {
        title: "Un projet en tête ?",
        description: "Nous répondons sous 48 heures avec une première estimation.",
        buttonText: "Nous écrire",
        buttonUrl: "/contact",
      },
    },
    {
      pageId: contactFr.id,
      type: "contact_form",
      position: 0,
      isVisible: true,
      content: {
        title: "Nous contacter",
        description: "Décrivez votre projet, nous revenons vers vous rapidement.",
        email: "bonjour@atelier-no17.fr",
        phone: "+33 4 78 00 00 17",
        address: "17 rue des Charpentiers, Lyon",
      },
    },
  ]);

  await db.insert(products).values([
    {
      siteId: site.id,
      name: "Table Lignes",
      description: "Table de salle à manger en chêne massif, piètement acier noir.",
      price: 189000,
      currency: "EUR",
      category: "Tables",
      images: [],
      customAttributes: { Essence: "Chêne", Dimensions: "220 × 90 cm", Finition: "Huile naturelle" },
      status: "published",
      sortOrder: 0,
    },
    {
      siteId: site.id,
      name: "Étagère Onze",
      description: "Bibliothèque modulaire en frêne, montage sans vis apparentes.",
      price: 124000,
      currency: "EUR",
      category: "Rangements",
      images: [],
      customAttributes: { Essence: "Frêne", Modules: "5" },
      status: "published",
      sortOrder: 1,
    },
    {
      siteId: site.id,
      name: "Banc Atelier",
      description: "Banc d'entrée compact, assise cannée.",
      price: 62000,
      currency: "EUR",
      category: "Assises",
      images: [],
      customAttributes: { Essence: "Noyer" },
      status: "published",
      sortOrder: 2,
    },
  ]);

  await db.insert(blogPosts).values({
    siteId: site.id,
    slug: "choisir-son-essence-de-bois",
    language: "fr",
    title: "Choisir son essence de bois",
    excerpt: "Chêne, frêne ou noyer : comment décider selon l'usage et la lumière de la pièce.",
    content:
      "Le choix de l'essence détermine la teinte, la dureté et le vieillissement de votre meuble.\nLe chêne offre une grande stabilité et une teinte claire qui fonce avec le temps.\nLe frêne, plus nerveux, convient aux pièces fines et aux structures légères.\nLe noyer, enfin, apporte une profondeur chaude que l'on réserve aux pièces maîtresses.",
    category: "Matériaux",
    tags: [],
    authorId: user.id,
    status: "published",
    publishedAt: new Date(),
  });

  console.log("Demo ready →", { email: EMAIL, password: PASSWORD, subdomain: SUBDOMAIN });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
