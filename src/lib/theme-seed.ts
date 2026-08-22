import "server-only";
import { db } from "@/db";
import { themes } from "@/db/schema";
import { DEFAULT_THEMES } from "@/lib/themes";

const globalForSeed = globalThis as typeof globalThis & { __batisteThemesSeeded?: boolean };

/** Idempotent theme seeding so a fresh database is always usable. */
export async function ensureThemesSeeded() {
  if (globalForSeed.__batisteThemesSeeded) return;
  try {
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
    globalForSeed.__batisteThemesSeeded = true;
  } catch {
    // database not ready yet — retry on the next request
  }
}
