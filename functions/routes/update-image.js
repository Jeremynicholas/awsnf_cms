// functions/routes/update-image.js
import { Router } from 'express';
import { clearImageCache } from './images.js';
import { getDb } from '../lib/db.js';
import cloudinary from '../lib/cloudinary.js';

const router = Router();

router.post('/', async (req, res) => {
    const db = getDb();

    const { public_id, alt, caption, location } = req.body;

    if (!public_id) {
        return res.status(400).json({ message: 'Missing required parameter - public_id' });
    }
    try {
        const result = await cloudinary.api.update(public_id, {
            context: {
                alt: alt || '',
                caption: caption || '',
                location: location || ''
            }
        });

        await db.collection('images').doc(public_id).set({
            alt: alt || '',
            caption: caption || '',
            name: caption || public_id,
            location: location || ''
        }, { merge: true })

        clearImageCache();

        if (result) {
        return res.json({ message: 'Image metadata updated successfully', data: result })
        }
        return res.status(400).json({ message: 'Failed to update image metadata' })
    } catch (error) {
        console.error('Error updating image metadata:', error)
        return res.status(500).json({ message: 'Server error', error: error.message })
    }
})

export default router;