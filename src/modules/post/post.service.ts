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
  cursor,
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  sortOrder = "desc",
}: {
  search?: string | undefined;
  tags?: string[] | [];
  isFeatured?: boolean | undefined;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
  cursor?: string | undefined;
  page?: number | undefined;
  limit?: number | undefined;
  sortBy?: "createdAt" | "title" | "views" | undefined;
  sortOrder?: "asc" | "desc" | undefined;
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

  const orderBy: Prisma.PostOrderByWithRelationInput[] = [
    sortBy && sortOrder
      ? { [sortBy as keyof Prisma.PostOrderByWithRelationInput]: sortOrder }
      : { createdAt: "desc" },
    { id: sortOrder ?? "desc" },
  ];

  const where = {
    AND: andConditions,
  };

  const [result, totalItems] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      ...(cursor
        ? { cursor: { id: cursor }, skip: 1 }
        : { skip: (page - 1) * limit }),
      take: limit + 1,
    }),
    prisma.post.count({ where }),
  ]);

  const hasNextPage = result.length > limit;
  const posts = hasNextPage ? result.slice(0, limit) : result;
  const nextCursor = hasNextPage ? (posts[posts.length - 1]?.id ?? null) : null;

  return {
    posts,
    pagination: {
      page: cursor ? null : page,
      limit,
      returnedCount: posts.length,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentCursor: cursor ?? null,
      hasNextPage,
      nextCursor,
      sortBy,
      sortOrder,
    },
  };
};

export const postService = {
  createPost,
  getPosts,
};
