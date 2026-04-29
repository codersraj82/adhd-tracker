import { openDB } from "idb";

const DB_NAME = "adhd-task-db";
const STORE_NAME = "app-data";

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

export async function saveData(key, value) {
  const db = await getDB();
  return db.put(STORE_NAME, value, key);
}

export async function loadData(key) {
  const db = await getDB();
  return db.get(STORE_NAME, key);
}
