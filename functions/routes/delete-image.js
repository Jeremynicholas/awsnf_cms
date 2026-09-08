//functions/routes/delete-images.js
import { Router } from 'express';
import { clearImageCache } from './images.js';
import { getDb } from '../lib/db.js';
import cloudinary from '../lib/cloudinary.js';

const router = Router();

router.post('/', async (req, res) => {
  const db = getDb();

  const { public_id } = req.body
  if (!public_id) return res.status(400).json({ message: 'Missing public_id' })

  try {
    const result = await cloudinary.uploader.destroy(public_id, { invalidate: true })

    if (result.result === 'ok') {
      await db.collection('images').doc(public_id).delete()
      clearImageCache()
      return res.json({ message: 'Image deleted successfully' })
    }

    return res.status(400).json({ message: 'Failed to delete image', details: result })
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error })
  }
})
export default router;