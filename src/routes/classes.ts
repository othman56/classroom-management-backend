import express from "express";
import { db } from "../db/db.js";
import { classes } from "../db/schema/index.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      name,
      teacherId,
      subjectId,
      capacity,
      description,
      status,
      bannerUrl,
      bannerCldPubId,
    } = req.body;

    const [createdClass] = await db
      .insert(classes)
      .values({
        ...req.body,
        inviteCode: Math.random().toString(36).substring(2, 9),
        schedules: [],
      })
      .returning({ id: classes.id });

    if (!createdClass) throw Error;

    res.status(201).json({ data: createdClass });
  } catch (error) {
    console.error(`POST /classes: ${error}`);
    res.status(500).json({ error: error });
  }
});

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const [classesList, total] = await Promise.all([
      db.select().from(classes).offset(offset).limit(Number(limit)),
      db.select().from(classes).execute(),
    ]);

    res.json({
      data: classesList,
      total: total.length,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error(`GET /classes: ${error}`);
    res.status(500).json({ error: error });
  }
});

export default router;
