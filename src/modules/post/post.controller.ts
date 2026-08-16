import { Request, Response } from "express";
import { postService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await postService.createPost(data);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: "Failed to create post" });
  }
};

const getPosts = async (req: Request, res: Response) => {
  try {
    const posts = await postService.getPosts();
    res.status(200).json(posts);
  } catch (error) {
    res.status(400).json({ error: "Failed to create post" });
  }
};

export const postController = {
  createPost,
  getPosts,
};
