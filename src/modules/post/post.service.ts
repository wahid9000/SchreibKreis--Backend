import { is } from "zod/locales";
import { Prisma } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { createAppError } from "../../utils/AppError";

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

const getPostById = async (postId: string) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw createAppError(404, "Post not found");
  }

  prisma.post
    .update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    })
    .catch((err) => console.error("Failed to increment views", err));

  return post;
};

type UpdatePostInput = {
  title?: string;
  content?: string;
  thumbnail?: string | null;
  isFeatured?: boolean;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags?: string[];
};

const updatePost = async (
  postId: string,
  authorId: string,
  isUserAdmin: boolean,
  data: UpdatePostInput,
) => {
  if (!isUserAdmin) {
    delete data.isFeatured;
  }
  const result = await prisma.post.updateMany({
    where: {
      id: postId,
      ...(isUserAdmin ? {} : { authorId }),
    },
    data,
  });

  if (result.count === 0) {
    throw createAppError(
      404,
      "Post not found or you are not authorized to update it",
    );
  }
};

const deletePost = async (
  postId: string,
  authorId: string,
  isUserAdmin: boolean,
) => {
  const result = await prisma.post.deleteMany({
    where: {
      id: postId,
      ...(isUserAdmin ? {} : { authorId }),
    },
  });

  if (result.count === 0) {
    throw createAppError(
      404,
      "Post not found or you are not authorized to delete it",
    );
  }

  return { success: true };
};

export const postService = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};
