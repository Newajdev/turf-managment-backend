import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BlogService } from "./blogs.service";
import status from "http-status";


const createBlog = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const payload = {
    ...req.body,
    image: req.file?.path,
  };

  const result = await BlogService.createBlog(userId, payload);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Blog insight created successfully",
    data: result,
  });
});

const getAllBlogs = catchAsync(async (req: Request, res: Response) => {
  const result = await BlogService.getAllBlogs(req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Blog insights retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getMyBlogs = catchAsync(async (req: Request, res: Response) => {
  const { userId, role } = req.user;
  const result = await BlogService.getMyBlogs(userId, role, req.query);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Your blog insights retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleBlog = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await BlogService.getSingleBlog(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Blog insight retrieved successfully",
    data: result,
  });
});

const updateBlog = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { userId, role } = req.user;
  const payload = {
    ...req.body,
  };

  if (req.file?.path) {
    payload.image = req.file.path;
  }

  const result = await BlogService.updateBlog(id, userId, role, payload);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Blog insight updated successfully",
    data: result,
  });
});

const deleteBlog = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { userId, role } = req.user;

  await BlogService.deleteBlog(id, userId, role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Blog insight deleted successfully",
    data: null,
  });
});

const addComment = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string; // blogId
  const { userId } = req.user;
  const { comment } = req.body;

  const result = await BlogService.addComment(id, userId, comment);

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Comment added successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const commentId = req.params.commentId as string;
  const { userId, role } = req.user;

  await BlogService.deleteComment(commentId, userId, role);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Comment deleted successfully",
    data: null,
  });
});

const toggleReaction = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id as string; // blogId
  const { userId } = req.user;
  const { type } = req.body;

  const result = await BlogService.toggleReaction(id, userId, type);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: result.action === "REMOVED" ? "Reaction removed" : "Reaction saved successfully",
    data: result,
  });
});

export const BlogController = {
  createBlog,
  getAllBlogs,
  getMyBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  addComment,
  deleteComment,
  toggleReaction,
};
