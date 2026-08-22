import { Request, Response } from "express";
import { postService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  const authorId = req.user!.id;
  const { title, content, thumbnail, isFeatured, status, tags } = req.body;

  const result = await postService.createPost({
    title,
    content,
    authorId,
    thumbnail,
    isFeatured,
    status,
    tags,
  });

  res.status(201).json({
    success: true,
    status: "success",
    statusCode: 201,
    data: result,
  });
};

const getPosts = async (req: Request, res: Response) => {
  const {
    search,
    tags,
    isFeatured,
    status,
    cursor,
    page,
    limit,
    sortBy,
    sortOrder,
  } = req.query;
  const searchQuery = typeof search === "string" ? search : undefined;
  const tagsQuery = tags ? (tags as string).split(",") : [];
  const isFeaturedQuery =
    isFeatured === "true" ? true : isFeatured === "false" ? false : undefined;
  const statusQuery = status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
  const pageQuery = typeof page === "string" ? Number(page) : 1;
  const limitQuery = typeof limit === "string" ? Number(limit) : 10;
  const cursorQuery = typeof cursor === "string" ? cursor : undefined;
  const sortByQuery = sortBy as "createdAt" | "title" | "views" | undefined;
  const sortOrderQuery = sortOrder as "asc" | "desc" | undefined;

  const posts = await postService.getPosts({
    search: searchQuery,
    tags: tagsQuery,
    isFeatured: isFeaturedQuery,
    status: statusQuery,
    cursor: cursorQuery,
    page: pageQuery,
    limit: limitQuery,
    sortBy: sortByQuery,
    sortOrder: sortOrderQuery,
  });

  res.status(200).json({
    success: true,
    status: "success",
    statusCode: 200,
    data: posts.posts,
    pagination: posts.pagination,
  });
};

const getPostById = async (req: Request, res: Response) => {
  const postId = req.params.id as string;
  const post = await postService.getPostById(postId);

  res.status(200).json({
    success: true,
    status: "success",
    statusCode: 200,
    data: post,
  });
};
const updatePost = async (req: Request, res: Response) => {
  const userRole = req.user!.role;
  let isUserAdmin = false;
  if (userRole === "ADMIN") {
    isUserAdmin = true;
  }
  const post = await postService.updatePost(
    req.params.id as string,
    req.user!.id,
    isUserAdmin,
    req.body,
  );

  res.status(200).json({
    success: true,
    status: "success",
    statusCode: 200,
     message: "Post updated successfully",
  });
};

const deletePost = async (req: Request, res: Response) => {
  const userRole = req.user!.role;
  let isUserAdmin = false;
  if (userRole === "ADMIN") {
    isUserAdmin = true;
  }
  await postService.deletePost(
    req.params.id as string,
    req.user!.id,
    isUserAdmin,
  );

  res.status(200).json({
    success: true,
    status: "success",
    statusCode: 200,
    message: "Post deleted successfully",
  });
};

export const postController = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
};
