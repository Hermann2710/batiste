"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { assertSiteAccess } from "@/lib/guards";
import type { ActionResult } from "./sites";

const testimonialSchema = z.object({
  siteId: z.string().uuid(),
  authorName: z.string().trim().min(1).max(120),
  role: z.string().trim().max(120).optional(),
  quote: z.string().trim().min(1).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
});

export async function createTestimonialAction(
  input: z.infer<typeof testimonialSchema>
): Promise<ActionResult<{ id: string }>> {
  const parsed = testimonialSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "validation" };

  try {
    await assertSiteAccess(parsed.data.siteId);
    const [row] = await db
      .insert(testimonials)
      .values({
        siteId: parsed.data.siteId,
        authorName: parsed.data.authorName,
        role: parsed.data.role ?? null,
        quote: parsed.data.quote,
        rating: parsed.data.rating,
        status: "approved",
        source: "dashboard",
      })
      .returning({ id: testimonials.id });

    revalidatePath(`/`);
    return { ok: true, data: { id: row.id } };
  } catch {
    return { ok: false, error: "forbidden" };
  }
}

export async function updateTestimonialAction(
  id: string,
  siteId: string,
  input: Partial<z.infer<typeof testimonialSchema>>
): Promise<ActionResult> {
  try {
    await assertSiteAccess(siteId);
    await db
      .update(testimonials)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(testimonials.id, id), eq(testimonials.siteId, siteId)));
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "forbidden" };
  }
}

export async function moderateTestimonialAction(
  id: string,
  siteId: string,
  status: "approved" | "rejected" | "pending"
): Promise<ActionResult> {
  try {
    await assertSiteAccess(siteId);
    await db
      .update(testimonials)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(testimonials.id, id), eq(testimonials.siteId, siteId)));
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "forbidden" };
  }
}

export async function deleteTestimonialAction(
  id: string,
  siteId: string
): Promise<ActionResult> {
  try {
    await assertSiteAccess(siteId);
    await db
      .delete(testimonials)
      .where(and(eq(testimonials.id, id), eq(testimonials.siteId, siteId)));
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "forbidden" };
  }
}

export async function getTestimonials(siteId: string) {
  await assertSiteAccess(siteId);
  return db
    .select()
    .from(testimonials)
    .where(eq(testimonials.siteId, siteId))
    .orderBy(desc(testimonials.createdAt));
}
