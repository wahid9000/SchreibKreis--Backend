import { Prisma } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";

type CreatePostInput = {
  title: string;
  content: string;
  authorId: string;
  thumbnail?: string | null;
  isFeatured?: boolean;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags?: string[];
};

const createPost = async (data: CreatePostInput) => {
  const result = await prisma.post.create({
    data: {
      title: data.title,
      content: data.content,
      authorId: data.authorId,
      thumbnail: data.thumbnail ?? null,
      isFeatured: data.isFeatured ?? false,
      status: data.status ?? "DRAFT",
      tags: data.tags ?? [],
    },
  });

  return result;
};

const getPosts = async () => {
  const result = await prisma.post.findMany();
  return result;
};

export const postService = {
  createPost,
  getPosts,
};
