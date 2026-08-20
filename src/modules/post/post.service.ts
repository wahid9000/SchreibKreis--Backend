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

const getPosts = async ({
  search,
  tags,
  isFeatured,
  status,
}: {
  search?: string | undefined;
  tags?: string[] | [];
  isFeatured?: boolean | undefined;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
}) => {
  const andConditions: Prisma.PostWhereInput[] = [];

  if (search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: search as string,
          },
        },
      ],
    });
  }

  if (tags && tags.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: tags as string[],
      },
    });
  }

  if (isFeatured !== undefined) {
    andConditions.push({ isFeatured });
  }

  if (status) {
    andConditions.push({ status });
  }

  const result = await prisma.post.findMany({
    where: {
      AND: andConditions,
    },
  });

  return result;
};

export const postService = {
  createPost,
  getPosts,
};
