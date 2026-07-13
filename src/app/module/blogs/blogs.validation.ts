import { z } from "zod";

const createBlogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(20, "Content must be at least 20 characters"),
  category: z.string().min(1, "Category is required"),
  readingTime: z.string().min(1, "Reading time is required"),
});

const updateBlogSchema = z.object({
  title: z.string().min(3).optional(),
  excerpt: z.string().min(10).optional(),
  content: z.string().min(20).optional(),
  category: z.string().optional(),
  readingTime: z.string().optional(),
});

const createCommentSchema = z.object({
  comment: z.string().min(1, "Comment cannot be empty"),
});

const reactBlogSchema = z.object({
  type: z.string().optional().default("LIKE"),
});

export const BlogValidations = {
  createBlogSchema,
  updateBlogSchema,
  createCommentSchema,
  reactBlogSchema,
};
