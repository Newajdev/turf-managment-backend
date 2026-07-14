/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { IBlogCreatePayload, IBlogUpdatePayload } from "./blogs.interface";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";

const createBlog = async (userId: string, payload: IBlogCreatePayload) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User profile not found!");
  }

  const result = await prisma.blog.create({
    data: {
      ...payload,
      image: payload.image || "",
      authorId: userId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return result;
};

const getAllBlogs = async (query: IQueryParams) => {
  const blogQuery = new QueryBuilder<any>(prisma.blog as any, query, {
    searchableFields: ["title", "excerpt", "content", "category"],
    filterableFields: ["category", "authorId"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ isDeleted: false })
    .include({
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    });

  const result = await blogQuery.execute();
  return result;
};

const getMyBlogs = async (userId: string, role: string, query: IQueryParams) => {
  const filter: any = { isDeleted: false };
  
  if (role !== "SYSTEM_ADMIN") {
    filter.authorId = userId;
  }

  const blogQuery = new QueryBuilder<any>(prisma.blog as any, query, {
    searchableFields: ["title", "excerpt", "content", "category"],
    filterableFields: ["category"],
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .where(filter)
    .include({
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    });

  const result = await blogQuery.execute();
  return result;
};

const getSingleBlog = async (id: string) => {
  const blog = await prisma.blog.findFirst({
    where: { id, isDeleted: false },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      comments: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              profilePhoto: true,
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
      reactions: {
        include: {
          player: {
            select: {
              id: true,
              name: true,
              userId: true,
            },
          },
        },
      },
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
  });

  if (!blog) {
    throw new AppError(status.NOT_FOUND, "Blog insight not found!");
  }



  return {
    ...blog,
  };
};

const updateBlog = async (
  id: string,
  userId: string,
  role: string,
  payload: IBlogUpdatePayload
) => {
  const blog = await prisma.blog.findFirst({
    where: { id, isDeleted: false },
  });

  if (!blog) {
    throw new AppError(status.NOT_FOUND, "Blog insight not found!");
  }

  if (role !== "SYSTEM_ADMIN" && blog.authorId !== userId) {
    throw new AppError(status.FORBIDDEN, "You do not have permission to edit this blog!");
  }

  const result = await prisma.blog.update({
    where: { id },
    data: payload,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  return result;
};

const deleteBlog = async (id: string, userId: string, role: string) => {
  const blog = await prisma.blog.findFirst({
    where: { id, isDeleted: false },
  });

  if (!blog) {
    throw new AppError(status.NOT_FOUND, "Blog insight not found!");
  }

  if (role !== "SYSTEM_ADMIN" && blog.authorId !== userId) {
    throw new AppError(status.FORBIDDEN, "You do not have permission to delete this blog!");
  }

  await prisma.blog.update({
    where: { id },
    data: {
      isDeleted: true,
    },
  });

  return null;
};

const addComment = async (blogId: string, userId: string, commentText: string) => {
  const blog = await prisma.blog.findFirst({
    where: { id: blogId, isDeleted: false },
  });

  if (!blog) {
    throw new AppError(status.NOT_FOUND, "Blog insight not found!");
  }

  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found! Only players can comment.");
  }

  const result = await prisma.blogComment.create({
    data: {
      comment: commentText,
      blogId,
      playerId: player.id,
    },
    include: {
      player: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          userId: true,
        },
      },
    },
  });

  return result;
};

const deleteComment = async (commentId: string, userId: string, role: string) => {
  const comment = await prisma.blogComment.findUnique({
    where: { id: commentId },
    include: {
      blog: true,
      player: true,
    },
  });

  if (!comment) {
    throw new AppError(status.NOT_FOUND, "Comment not found!");
  }

  const isOwner = comment.player.userId === userId;
  const isBlogAuthor = comment.blog.authorId === userId;
  const isAdmin = role === "SYSTEM_ADMIN";

  if (!isOwner && !isBlogAuthor && !isAdmin) {
    throw new AppError(status.FORBIDDEN, "You do not have permission to delete this comment!");
  }

  await prisma.blogComment.delete({
    where: { id: commentId },
  });

  return null;
};

const toggleReaction = async (blogId: string, userId: string, type: string) => {
  const blog = await prisma.blog.findFirst({
    where: { id: blogId, isDeleted: false },
  });

  if (!blog) {
    throw new AppError(status.NOT_FOUND, "Blog insight not found!");
  }

  const player = await prisma.player.findUnique({
    where: { userId },
  });

  if (!player) {
    throw new AppError(status.NOT_FOUND, "Player profile not found! Only players can react.");
  }

  const existingReact = await prisma.blogReact.findUnique({
    where: {
      blog_player_react_unique: {
        blogId,
        playerId: player.id,
      },
    },
  });

  if (existingReact) {
    if (existingReact.type === type) {
      await prisma.blogReact.delete({
        where: { id: existingReact.id },
      });
      return { reacted: false, action: "REMOVED" };
    } else {
      const result = await prisma.blogReact.update({
        where: { id: existingReact.id },
        data: { type },
      });
      return { reacted: true, action: "UPDATED", data: result };
    }
  } else {
    const result = await prisma.blogReact.create({
      data: {
        type,
        blogId,
        playerId: player.id,
      },
    });
    return { reacted: true, action: "ADDED", data: result };
  }
};

export const BlogService = {
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
