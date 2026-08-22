import { Request, Response } from "express";
import { commentService } from "./comment.service";

const isAdmin = (req: Request) => req.user!.role === "ADMIN";

const createComment = async (req: Request, res: Response) => {
  const comment = await commentService.createComment({
    ...req.body,
    authorId: req.user!.id,
  });

  res.status(201).json({
    success: true,
    status: "success",
    statusCode: 201,
    data: comment,
  });
};

const getCommentsByPost = async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const result = await commentService.getCommentsByPost(
    req.params.postId as string,
    isAdmin(req),
    page,
    limit,
  );

  res.status(200).json({
    success: true,
    status: "success",
    statusCode: 200,
    data: result.comments,
    pagination: result.pagination,
  });
};

const getCommentById = async (req: Request, res: Response) => {
  const comment = await commentService.getCommentById(
    req.params.id as string,
    isAdmin(req),
  );

  res.status(200).json({
    success: true,
    status: "success",
    statusCode: 200,
    data: comment,
  });
};

const updateComment = async (req: Request, res: Response) => {
  const comment = await commentService.updateComment(
    req.params.id as string,
    req.user!.id,
    isAdmin(req),
    req.body,
  );

  res.status(200).json({
    success: true,
    status: "success",
    statusCode: 200,
    message: "Comment updated successfully",
  });
};

const deleteComment = async (req: Request, res: Response) => {
  await commentService.deleteComment(
    req.params.id as string,
    req.user!.id,
    isAdmin(req),
  );

  res.status(200).json({
    success: true,
    status: "success",
    statusCode: 200,
    message: "Comment deleted successfully",
  });
};

export const commentController = {
  createComment,
  getCommentsByPost,
  getCommentById,
  updateComment,
  deleteComment,
};
