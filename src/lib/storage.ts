import { openDB, type IDBPDatabase } from 'idb';
import type { HeadacheEntry } from './types';

const DB_NAME = 'kopfschmerzTagebuch';
const STORE_NAME = 'entries';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('date', 'date', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveEntry(entry: HeadacheEntry): Promise<void> {
  const db = await getDB();
  await db.put(STORE_NAME, entry);
}

export async function getEntry(id: string): Promise<HeadacheEntry | undefined> {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function getEntryByDate(date: string): Promise<HeadacheEntry | undefined> {
  const db = await getDB();
  const entries = await db.getAllFromIndex(STORE_NAME, 'date', date);
  return entries[0];
}

export async function getAllEntries(): Promise<HeadacheEntry[]> {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function getEntriesInRange(startDate: string, endDate: string): Promise<HeadacheEntry[]> {
  const db = await getDB();
  const allEntries = await db.getAll(STORE_NAME);
  return allEntries.filter(entry => entry.date >= startDate && entry.date <= endDate);
}
