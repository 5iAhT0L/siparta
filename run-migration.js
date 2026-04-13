#!/usr/bin/env node
require("dotenv").config({ path: ".env.local" });
const { spawn } = require("child_process");

async function runMigration() {
  console.log("DatabaseURL:", process.env.DATABASE_URL ? "Set" : "Not set");

  // First: resolve the failed migration
  console.log("\n1. Resolving failed migration...");
  await new Promise((resolve, reject) => {
    const migrate = spawn(
      "npx",
      [
        "prisma",
        "migrate",
        "resolve",
        "--rolled-back",
        "20260413_add_missing_columns",
      ],
      {
        stdio: "inherit",
        shell: true,
        cwd: process.cwd(),
      },
    );
    migrate.on("close", (code) => {
      if (code === 0) {
        console.log("Migration resolution successful");
        resolve();
      } else {
        console.error("Migration resolution failed");
        reject(new Error(`Migration resolve failed with code ${code}`));
      }
    });
  });

  // Second: deploy migrations
  console.log("\n2. Deploying migrations...");
  await new Promise((resolve, reject) => {
    const deploy = spawn("npx", ["prisma", "migrate", "deploy"], {
      stdio: "inherit",
      shell: true,
      cwd: process.cwd(),
    });
    deploy.on("close", (code) => {
      if (code === 0) {
        console.log("Migration deploy successful");
        resolve();
      } else {
        console.error("Migration deploy failed");
        reject(new Error(`Migration deploy failed with code ${code}`));
      }
    });
  });

  console.log("\n✅ All migrations completed successfully!");
}

runMigration().catch((err) => {
  console.error("❌ Migration failed:", err.message);
  process.exit(1);
});
