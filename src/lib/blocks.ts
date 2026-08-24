import type { Messages } from "@/i18n/messages";

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "number"
  | "boolean"
  | "select"
  | "list";

export interface FieldDef {
  key: string;
  /** key inside messages.fields */
  labelKey: keyof Messages["fields"];
  type: FieldType;
  options?: string[];
  itemFields?: FieldDef[];
  placeholder?: string;
}

export const BLOCK_TYPES = [
  "hero",
  "card_grid",
  "rich_text",
  "cta",
  "testimonials",
  "carousel",
  "form",
  "contact_form",
  "product_grid",
  "booking_form",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

export interface BlockDef {
  type: BlockType;
  icon: string;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
}

export const BLOCK_REGISTRY: Record<BlockType, BlockDef> = {
  hero: {
    type: "hero",
    icon: "▤",
    fields: [
      { key: "title", labelKey: "title", type: "text" },
      { key: "subtitle", labelKey: "subtitle", type: "textarea" },
      { key: "imageUrl", labelKey: "imageUrl", type: "url" },
      { key: "buttonText", labelKey: "buttonText", type: "text" },
      { key: "buttonUrl", labelKey: "buttonUrl", type: "text" },
      {
        key: "alignment",
        labelKey: "alignment",
        type: "select",
        options: ["center", "left"],
      },
      { key: "overlay", labelKey: "overlay", type: "boolean" },
    ],
    defaults: {
      title: "Un titre qui donne envie",
      subtitle: "Décrivez votre activité en une phrase claire et concrète.",
      imageUrl: "",
      buttonText: "Nous contacter",
      buttonUrl: "/contact",
      alignment: "center",
      overlay: true,
    },
  },
  card_grid: {
    type: "card_grid",
    icon: "▦",
    fields: [
      { key: "title", labelKey: "title", type: "text" },
      {
        key: "columns",
        labelKey: "columns",
        type: "select",
        options: ["2", "3", "4"],
      },
      {
        key: "cards",
        labelKey: "cards",
        type: "list",
        itemFields: [
          { key: "title", labelKey: "title", type: "text" },
          { key: "description", labelKey: "description", type: "textarea" },
          { key: "imageUrl", labelKey: "imageUrl", type: "url" },
          { key: "buttonUrl", labelKey: "link", type: "text" },
        ],
      },
    ],
    defaults: {
      title: "Nos services",
      columns: "3",
      cards: [
        {
          title: "Service 1",
          description: "Décrivez cette prestation.",
          imageUrl: "",
          buttonUrl: "",
        },
        {
          title: "Service 2",
          description: "Décrivez cette prestation.",
          imageUrl: "",
          buttonUrl: "",
        },
        {
          title: "Service 3",
          description: "Décrivez cette prestation.",
          imageUrl: "",
          buttonUrl: "",
        },
      ],
    },
  },
  rich_text: {
    type: "rich_text",
    icon: "¶",
    fields: [
      { key: "title", labelKey: "title", type: "text" },
      { key: "content", labelKey: "content", type: "textarea" },
      {
        key: "alignment",
        labelKey: "alignment",
        type: "select",
        options: ["left", "center"],
      },
    ],
    defaults: {
      title: "À propos",
      content:
        "Racontez votre histoire, votre méthode et ce qui vous distingue.\n\nChaque paragraphe est séparé par une ligne vide.",
      alignment: "left",
    },
  },
  cta: {
    type: "cta",
    icon: "◉",
    fields: [
      { key: "title", labelKey: "title", type: "text" },
      { key: "description", labelKey: "description", type: "textarea" },
      { key: "buttonText", labelKey: "buttonText", type: "text" },
      { key: "buttonUrl", labelKey: "buttonUrl", type: "text" },
    ],
    defaults: {
      title: "Parlons de votre projet",
      description: "Réponse sous 24 heures ouvrées.",
      buttonText: "Demander un devis",
      buttonUrl: "/contact",
    },
  },
  testimonials: {
    type: "testimonials",
    icon: "❝",
    fields: [
      { key: "title", labelKey: "title", type: "text" },
      {
        key: "items",
        labelKey: "testimonials",
        type: "list",
        itemFields: [
          { key: "quote", labelKey: "quote", type: "textarea" },
          { key: "name", labelKey: "name", type: "text" },
          { key: "role", labelKey: "role", type: "text" },
          { key: "avatarUrl", labelKey: "avatarUrl", type: "url" },
        ],
      },
    ],
    defaults: {
      title: "Ils nous font confiance",
      items: [
        {
          quote: "Un travail soigné et des délais tenus.",
          name: "Camille D.",
          role: "Cliente",
          avatarUrl: "",
        },
        {
          quote: "Une équipe à l'écoute du début à la fin.",
          name: "Marc L.",
          role: "Client",
          avatarUrl: "",
        },
      ],
    },
  },
  carousel: {
    type: "carousel",
    icon: "◧",
    fields: [
      { key: "title", labelKey: "title", type: "text" },
      {
        key: "slides",
        labelKey: "slides",
        type: "list",
        itemFields: [
          { key: "imageUrl", labelKey: "imageUrl", type: "url" },
          { key: "title", labelKey: "title", type: "text" },
          { key: "description", labelKey: "description", type: "text" },
        ],
      },
    ],
    defaults: {
      title: "Réalisations",
      slides: [
        { imageUrl: "", title: "Projet", description: "Courte description." },
      ],
    },
  },
  form: {
    type: "form",
    icon: "✎",
    fields: [
      { key: "title", labelKey: "title", type: "text" },
      { key: "description", labelKey: "description", type: "textarea" },
      { key: "submitText", labelKey: "submitText", type: "text" },
      { key: "successMessage", labelKey: "successMessage", type: "text" },
      {
        key: "fields",
        labelKey: "formFields",
        type: "list",
        itemFields: [
          { key: "label", labelKey: "label", type: "text" },
          {
            key: "type",
            labelKey: "type",
            type: "select",
            options: ["text", "email", "tel", "textarea", "select"],
          },
          { key: "options", labelKey: "options", type: "text" },
          { key: "required", labelKey: "required", type: "boolean" },
        ],
      },
    ],
    defaults: {
      title: "Demande de devis",
      description: "Décrivez votre besoin, nous revenons vers vous rapidement.",
      submitText: "Envoyer",
      successMessage: "Merci, votre demande a bien été transmise.",
      fields: [
        { label: "Nom", type: "text", options: "", required: true },
        { label: "Email", type: "email", options: "", required: true },
        {
          label: "Votre besoin",
          type: "textarea",
          options: "",
          required: true,
        },
      ],
    },
  },
  contact_form: {
    type: "contact_form",
    icon: "✉",
    fields: [
      { key: "title", labelKey: "title", type: "text" },
      { key: "description", labelKey: "description", type: "textarea" },
      { key: "email", labelKey: "email", type: "text" },
      { key: "phone", labelKey: "phone", type: "text" },
      { key: "address", labelKey: "address", type: "text" },
    ],
    defaults: {
      title: "Nous contacter",
      description: "Une question ? Écrivez-nous.",
      email: "",
      phone: "",
      address: "",
    },
  },
  product_grid: {
    type: "product_grid",
    icon: "▩",
    fields: [
      { key: "title", labelKey: "title", type: "text" },
      { key: "category", labelKey: "category", type: "text" },
      { key: "limit", labelKey: "limit", type: "number" },
      { key: "showPrice", labelKey: "showPrice", type: "boolean" },
      {
        key: "columns",
        labelKey: "columns",
        type: "select",
        options: ["2", "3", "4"],
      },
    ],
    defaults: {
      title: "Notre catalogue",
      category: "",
      limit: 6,
      showPrice: true,
      columns: "3",
    },
  },
  booking_form: {
    type: "booking_form",
    icon: "◷",
    fields: [
      { key: "title", labelKey: "title", type: "text" },
      { key: "description", labelKey: "description", type: "textarea" },
      { key: "duration", labelKey: "duration", type: "number" },
    ],
    defaults: {
      title: "Prendre rendez-vous",
      description: "Choisissez une date, nous confirmons par email.",
      duration: 60,
    },
  },
};

export function getBlockDef(type: string): BlockDef | undefined {
  return BLOCK_REGISTRY[type as BlockType];
}

/** Blocks that require a feature flag to be usable. */
export const BLOCK_FEATURE_REQUIREMENT: Partial<
  Record<BlockType, "catalog" | "booking" | "quote" | "blog">
> = {
  product_grid: "catalog",
  booking_form: "booking",
};
