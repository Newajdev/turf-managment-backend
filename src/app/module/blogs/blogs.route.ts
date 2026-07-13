import express from "express";
import { BlogController } from "./blogs.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { BlogValidations } from "./blogs.validation";
import { checkAuth } from "../../middleware/AuthUser";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

// Public Routes
router.get("/", BlogController.getAllBlogs);
router.get("/:id", BlogController.getSingleBlog);

// Auth protected routes (Admins & Turf Owners)
router.post(
  "/",
  checkAuth(Role.SYSTEM_ADMIN, Role.TURF_OWNER),
  multerUpload.single("image"),
  validateRequest(BlogValidations.createBlogSchema),
  BlogController.createBlog,
);

router.get(
  "/my-blogs/all",
  checkAuth(Role.SYSTEM_ADMIN, Role.TURF_OWNER),
  BlogController.getMyBlogs,
);

router.patch(
  "/:id",
  checkAuth(Role.SYSTEM_ADMIN, Role.TURF_OWNER),
  multerUpload.single("image"),
  validateRequest(BlogValidations.updateBlogSchema),
  BlogController.updateBlog,
);

router.delete(
  "/:id",
  checkAuth(Role.SYSTEM_ADMIN, Role.TURF_OWNER),
  BlogController.deleteBlog,
);

// Player Interaction Routes (React & Comments)
router.post(
  "/:id/comments",
  checkAuth(Role.PLAYER),
  validateRequest(BlogValidations.createCommentSchema),
  BlogController.addComment,
);

router.delete(
  "/comments/:commentId",
  checkAuth(Role.PLAYER, Role.SYSTEM_ADMIN, Role.TURF_OWNER),
  BlogController.deleteComment,
);

router.post(
  "/:id/react",
  checkAuth(Role.PLAYER),
  validateRequest(BlogValidations.reactBlogSchema),
  BlogController.toggleReaction,
);

export const BlogRoutes = router;
