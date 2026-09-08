// functions/routes/upload.js
import { Router } from 'express';
import multer from 'multer';
import { clearImageCache } from './images.js';
import { getDb } from '../lib/db.js';
import cloudinary from '../lib/cloudinary.js';

const router = Router();
const parser = multer({ storage: multer.memoryStorage() });

router.post('/', parser.single('file'), async (req, res) => {
    const db = getDb();

    if (!req.file) {
        console.error('No file received');
        return res.status(400).send('No file uploaded');
    }


    try {
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    public_id: req.file.originalname.split('.').slice(0, -1).join('.'),
                    display_name: req.file.originalname.split('.').slice(0, -1).join('.'),
                    resource_type: 'auto'
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );

            // Write the file buffer to the Cloudinary upload stream
            uploadStream.end(req.file.buffer);
        });

        await db.collection('images').doc(result.public_id).set({
            public_id: result.public_id,
            url: result.secure_url,
            name: result.original_filename || result.public_id,
            created_at: new Date().toISOString(),
            alt: '',
            caption: '',
            location: '',
        }, { merge: true })

        clearImageCache()

        res.json({
            message: 'Upload successful',
            url: result.secure_url,
            public_id: result.public_id,
            display_name: result.public_id,
        });

    } catch (error) {
        console.error('Upload failed:', error);
        res.status(500).json({ message: 'Failed to upload image', error });
    }
});

export default router;