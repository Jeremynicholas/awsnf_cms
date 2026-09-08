// functions/routes/images.js
import { Router } from 'express';
import { getDb } from '../lib/db.js';
import cloudinary from '../lib/cloudinary.js';

const router = Router();

let imageCache = null;
let imageCacheExpiry = 0;
const CACHE_DURATION = 10 * 60 * 1000;

export function clearImageCache() {
  imageCache = null;
  imageCacheExpiry = 0;
}

router.get('/', async (req, res) => {
  const db = getDb();

  try {
    const limit = Math.min(parseInt(req.query.limit || '60', 10), 200)
    const cursor = req.query.cursor || null

    let q = db.collection('images')
      .orderBy('created_at', 'desc')
      .limit(limit)

    if (cursor) {
      // cursor is the last doc id from previous page
      const cursorDoc = await db.collection('images').doc(cursor).get()
      if (cursorDoc.exists) {
        q = q.startAfter(cursorDoc)
      }
    }

    const snap = await q.get()
    const images = snap.docs.map(d => ({ docId: d.id, ...d.data() }))
    const next_cursor = snap.size === limit ? snap.docs[snap.docs.length - 1].id : null

    return res.json({ images, next_cursor })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Failed to fetch images' })
  }
})

router.post('/sync', async (req, res) => {
  const db = getDb()
  
  try {
    let cursor = null
    let totalWrites = 0
    let safety = 0

    while (safety < 20) {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: '',
        delimiter: '/',
        max_results: 200,
        next_cursor: cursor,
        context: true,
        tags: true
      })

      const items = (result.resources || [])
        .filter(r => r.bytes > 0)
        .filter(r => !r.public_id.includes('_static'))
        .map(r => ({
          public_id: r.public_id,
          url: r.secure_url,
          name: r.context?.custom?.caption || r.public_id,
          created_at: r.created_at || new Date().toISOString(),
          alt: r.context?.custom?.alt || '',
          caption: r.context?.custom?.caption || '',
          location: r.context?.custom?.location || '',
          tags: r.tags || [],
          size: r.bytes || 0
        }))

      if (!items.length) break

      const batch = db.batch()
      for (const img of items) {
        const ref = db.collection('images').doc(img.public_id)
        batch.set(ref, img, { merge: true })
      }
      await batch.commit()
      totalWrites += items.length

      cursor = result.next_cursor || null
      if (!cursor) break
      safety++
    }

    return res.json({ ok: true, totalWrites })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ message: 'Sync failed' })
  }
})

export default router;