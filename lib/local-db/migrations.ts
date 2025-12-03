import Dexie from "dexie";
import { SCHEMA_VERSION } from "./schema";

// Migration helpers for IndexedDB schema changes

export interface Migration {
  version: number;
  upgrade: (db: Dexie) => Promise<void>;
}

export const migrations: Migration[] = [
  // Initial schema - no migration needed
  {
    version: 1,
    upgrade: async () => {
      // Version 1 is the initial schema, no migration needed
    },
  },
  // Future migrations can be added here
  // {
  //   version: 2,
  //   upgrade: async (db) => {
  //     // Migration logic for version 2
  //   },
  // },
];

export function getCurrentVersion(): number {
  return SCHEMA_VERSION;
}

export async function runMigrations(db: Dexie): Promise<void> {
  // Dexie handles schema migrations automatically based on version numbers
  // This function is here for any additional data migrations that might be needed

  const currentVersion = db.verno;

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      console.log(`Running migration to version ${migration.version}`);
      await migration.upgrade(db);
    }
  }
}

// Helper to check if the database needs initialization
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const databases = await Dexie.getDatabaseNames();
    return databases.includes("ideaforge");
  } catch {
    return false;
  }
}

// Helper to delete the database (for development/testing)
export async function deleteDatabase(): Promise<void> {
  await Dexie.delete("ideaforge");
}
