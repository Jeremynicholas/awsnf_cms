// functions/lib/db.js
import { getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp()
}

const db = getFirestore()

export function getDb() {
  return db
}