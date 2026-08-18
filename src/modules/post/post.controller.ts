import { Request, Response } from "express";
import { postService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  const authorId = "1"; // Assuming you have user authentication and the user ID is available in req.user
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
  const posts = await postService.getPosts();

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
