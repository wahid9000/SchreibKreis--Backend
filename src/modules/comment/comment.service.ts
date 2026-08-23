import { prisma } from "../../lib/prisma";
import { createAppError } from "../../utils/AppError";

type CommentStatus = "APPROVED" | "REJECTED";

type CreateCommentInput = {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string | null;
};

const createComment = async (data: CreateCommentInput) => {
  if (data.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: data.parentId, status: "APPROVED" as CommentStatus },
      select: { postId: true },
    });

    if (!parent) throw createAppError(404, "Parent comment not found");
    if (parent.postId !== data.postId) {
      throw createAppError(400, "Parent comment must belong to the same post");
    }
  }

  return prisma.comment.create({
    data: {
      postId: data.postId,
      authorId: data.authorId,
      content: data.content,
      parentId: data.parentId ?? null,
    },
  });
};

const getCommentsByPost = async (
  postId: string,
  isUserAdmin: boolean,
  page = 1,
  limit = 20,
) => {
  const where = {
    postId,
    ...(isUserAdmin ? {} : { status: "APPROVED" as CommentStatus }),
  };
  const [comments, totalItems] = await Promise.all([
    prisma.comment.findMany({
      where,
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    comments,
    pagination: {
      page,
      limit,
      returnedCount: comments.length,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
};

const getCommentById = async (commentId: string, isUserAdmin: boolean) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
      ...(isUserAdmin ? {} : { status: "APPROVED" as CommentStatus }),
    },
    include: {
      post: {
        select: { id: true, title: true },
      },
    },
  });

  if (!comment) {
    throw createAppError(404, "Comment not found");
  }

  return comment;
};

const updateComment = async (
  commentId: string,
  authorId: string,
  isUserAdmin: boolean,
  data: { content?: string; status?: CommentStatus },
) => {
  if (!isUserAdmin && data.status !== undefined) {
    throw createAppError(403, "Only admins can change comment status");
  }

  const updateData = {
    ...(data.content === undefined ? {} : { content: data.content }),
    ...(isUserAdmin && data.status !== undefined
      ? { status: data.status }
      : {}),
  };
  const result = await prisma.comment.updateMany({
    where: {
      id: commentId,
      ...(isUserAdmin ? {} : { authorId }),
    },
    data: updateData,
  });

  if (result.count === 0) {
    throw createAppError(
      404,
      "Comment not found or you are not authorized to update it",
    );
  }

  return { success: true };
};

const deleteComment = async (
  commentId: string,
  authorId: string,
  isUserAdmin: boolean,
) => {
  const result = await prisma.comment.deleteMany({
    where: {
      id: commentId,
      ...(isUserAdmin ? {} : { authorId }),
    },
  });

  if (result.count === 0) {
    throw createAppError(
      404,
      "Comment not found or you are not authorized to delete it",
    );
  }

  return { success: true };
};

export const commentService = {
  createComment,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment,
};
