import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { db } from "../db/db.js";
import { user } from "../db/schema/auth.js";

export const router = express.Router();

// get all users with optional filtering and pagination
router.get("/", async (req, res) => {
  try {
    const { search, role, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
    const limitPerPage = Math.min(
      Math.max(1, parseInt(String(limit), 10) || 10),
      100,
    );

    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions = [];
    const allowedRoles = ["student", "teacher", "admin"] as const;
    type UserRole = (typeof allowedRoles)[number];

    if (search) {
      filterConditions.push(
        ilike(user.name, `%${String(search)}%`),
        ilike(user.email, `%${String(search)}%`),
      );
    }

    if (role) {
      const roleValue = String(role) as UserRole;
      if (allowedRoles.includes(roleValue)) {
        filterConditions.push(eq(user.role, roleValue));
      }
    }

    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    const usersList = await db
      .select({ ...getTableColumns(user) })
      .from(user)
      .where(whereClause)
      .orderBy(desc(user.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: usersList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (error) {
    console.error(`GET /users: ${error}`);
    res.status(500).json({ error: "Failed to get users" });
  }
});

export default router;
