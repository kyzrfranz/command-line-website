import { z, defineCollection } from "astro:content";

const gigSchema = z.object({
    title: z.string(),
    role: z.string(),
    description: z.string(),
    startDate: z.string().transform((str) => new Date(str)),
    endDate: z.string().transform((str) => new Date(str)),
    highlightTech: z.array(z.string()),
    tech: z.array(z.string()),
    heroImage: z.string().optional(),
});

export type GigSchema = z.infer<typeof gigSchema>;
const gigCollection = defineCollection({ schema: gigSchema });

export const collections = {
    'gig': gigCollection
}