import { eq } from "drizzle-orm";
import { db } from "./db";
import { demoUsers } from "./schema";

async function main() {
  try {
    console.log("Performing CRUD operations...");

    const [newUser] = await db
      .insert(demoUsers)
      .values({ name: "Admin User", email: "admin@example.com" })
      .returning();

    if (!newUser) throw new Error("Failed to create user");
    console.log("✅ CREATE:", newUser);

    const found = await db
      .select()
      .from(demoUsers)
      .where(eq(demoUsers.id, newUser.id));
    console.log("✅ READ:", found[0]);

    const [updated] = await db
      .update(demoUsers)
      .set({ name: "Super Admin" })
      .where(eq(demoUsers.id, newUser.id))
      .returning();

    if (!updated) throw new Error("Failed to update user");
    console.log("✅ UPDATE:", updated);

    await db.delete(demoUsers).where(eq(demoUsers.id, newUser.id));
    console.log("✅ DELETE: Deleted user");

    console.log("\nCRUD operations completed successfully.");
  } catch (err) {
    console.error("❌ Error performing CRUD operations:", err);
    process.exit(1);
  }
}

main();
