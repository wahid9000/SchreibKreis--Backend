import { Post } from "../../../prisma/generated/prisma/client";
import { prisma } from "../../lib/prisma";

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt">,
) => {
  const result = await prisma.post.create({
    data,
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
