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
  const { search, tags, isFeatured, status } = req.query;
  const searchQuery = typeof search === "string" ? search : undefined;
  const tagsQuery = tags ? (tags as string).split(",") : [];
  const isFeaturedQuery =
    isFeatured === "true" ? true : isFeatured === "false" ? false : undefined;
  const statusQuery =
    status === "DRAFT" || status === "PUBLISHED" || status === "ARCHIVED"
      ? status
      : undefined;

  const posts = await postService.getPosts({
    search: searchQuery,
    tags: tagsQuery,
    isFeatured: isFeaturedQuery,
    status: statusQuery,
  });

  res.status(200).json({
    success: true,
    status: "success",
    statusCode: 200,
    data: posts,
  });
};

export const postController = {
  createPost,
  getPosts,
};
