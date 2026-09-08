//stores/images.js
import { api } from '../lib/api'

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { doc, collection, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { firestore } from '../firebase/firebase'
import { useLookupStore } from '../store/lookups'

export const useImageStore = defineStore('images', () => {

  const lookupStore = useLookupStore()
  const storage = getStorage()

  const images = ref([]);
  const selectedImage = ref(null);
  const selectedImages = ref([]);
  const searchQuery = ref('');
  const isLoading = ref(false);

  const nextCursor = ref(null)
  const hasMore = computed(() => !!nextCursor.value)
  const isLoadingMore = ref(false)
  const CACHE_CURSOR_KEY = 'cloudinary_image_cache_cursor'
  const CACHE_KEY = 'cloudinary_image_cache';
  const CACHE_EXPIRY_KEY = 'cloudinary_image_cache_expiry';
  const FETCH_INTERVAL = 10 * 60 * 1000; // 10 minutes

  const getCachedImages = () => {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    if (expiry && Date.now() < parseInt(expiry)) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
        return Array.isArray(cached) ? cached : []
      } catch (e) {
        console.error("❌ Failed to parse cached images", e)
      }
    }
    return []
  }

const getCachedCursor = () => {
  const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
  if (expiry && Date.now() < parseInt(expiry)) {
    const c = localStorage.getItem(CACHE_CURSOR_KEY)
    if (!c || c === 'null' || c === 'undefined') return null
    return c
  }
  return null
}

const setCachedImages = (imgs, cursor) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(imgs))
  if (cursor) localStorage.setItem(CACHE_CURSOR_KEY, cursor)
  else localStorage.removeItem(CACHE_CURSOR_KEY)
  localStorage.setItem(CACHE_EXPIRY_KEY, Date.now() + FETCH_INTERVAL)
}

const clearImageCache = () => {
  localStorage.removeItem(CACHE_KEY)
  localStorage.removeItem(CACHE_CURSOR_KEY)
  localStorage.removeItem(CACHE_EXPIRY_KEY)
}
  
// FETCH IMAGES
let firestoreMapCache = null
const getFirestoreMap = async () => {
  if (firestoreMapCache) return firestoreMapCache
  const snapshot = await getDocs(collection(firestore, 'images'))
  const map = {}
  snapshot.forEach(docSnap => {
    const data = docSnap.data()
    map[data.public_id] = { ...data, docId: docSnap.id }
  })
  firestoreMapCache = map
  return map
}

const fetchImages = async (force = false, cursor = null) => {
  const isLoadMore = !!cursor
  const isReset = !!force && !cursor

   // Serve from local cache only on initial load (not load more)
  if (!force && !cursor) {
    const cached = getCachedImages()
    const cachedCursor = getCachedCursor()
    if (cached.length > 0) {
      console.log("✅ Loaded images from localStorage", cached.length)
      images.value = cached
      nextCursor.value = cachedCursor
      return
    }
  }
  
   if (isReset) {
    images.value = []
    nextCursor.value = null
  }

  if (isLoadMore) isLoadingMore.value = true
  else isLoading.value = true

  try {
    const response = await api.get('/images', { params: { cursor }})

    const rawImages = Array.isArray(response.data.images) ? response.data.images : []
    const newCursorRaw = response.data.next_cursor
    const newCursor =
      typeof newCursorRaw === 'string' && newCursorRaw.trim() && newCursorRaw !== 'null' && newCursorRaw !== 'undefined'
        ? newCursorRaw
        : null

    // set cursor from server first
    nextCursor.value = newCursor
    const firestoreData = await getFirestoreMap()
          
    const beforeCount = images.value.filter(i => i.public_id).length

    const mergedIncoming = rawImages.map(img => {
      const fbData = firestoreData[img.public_id] || {}
      return {
        ...img,
        ...fbData,
        docId: fbData.docId || null,
        url: img.url?.replace(/^http:\/\//, 'https://')
      }
    })

    const existingById = new Map(
      images.value
        .filter(i => i.public_id) // placeholders have no public_id
        .map(i => [i.public_id, i])
    )

    for (const incoming of mergedIncoming) {
      existingById.set(incoming.public_id, {
        ...(existingById.get(incoming.public_id) || {}),
        ...incoming
      })
    }

    const placeholders = images.value.filter(i => !i.public_id)
    images.value = [...placeholders, ...Array.from(existingById.values())]
        
    if (!lookupStore.lookupMaps.images) {
      lookupStore.lookupMaps.images = {}
    }

    for (const img of images.value) {
      if (img.public_id) {
        lookupStore.lookupMaps.images[img.public_id] = img
      }
    }

    setCachedImages(images.value.filter(i => i.public_id), nextCursor.value)
  } catch (error) {
    console.error('Error fetching images:', error)
  } finally {
    if (isLoadMore) isLoadingMore.value = false
    else isLoading.value = false
  }
}

const loadMoreImages = async () => {
  if (!nextCursor.value || isLoadingMore.value || isLoading.value) return
  await fetchImages(false, nextCursor.value)
}

 // FILTER IMAGES
  const filteredImages = computed(() => {
    const terms = searchQuery.value.toLowerCase().split(/\s+/);
    return images.value.filter(img =>
      terms.every(term =>
        (img.name || '').toLowerCase().includes(term) ||
        (img.location || '').toLowerCase().includes(term)
      )
    ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  });   
  
  
// UPLOAD IMAGES
const uploadSingleImage = async (event) => {
  const file = event.target.files[0];
  await uploadImage(file);
};

const uploadMultipleImages = async (event) => {
  const files = event.target.files;
  if (!files || files.length === 0) {
    console.error('No files selected');
    return;
  }

  const fileArray = Array.from(files);
  const uploadedImages = [];

  for (const file of fileArray) {
    const result = await uploadImage(file); // Modify uploadImage to return the final image
    if (result) {
      uploadedImages.push(result);
    }
  }

  selectedImages.value = [];
  selectedImages.value.push(...uploadedImages);
};


const uploadImage = async (file) => {
  if (!file) return

  const isPdf = file.type === 'application/pdf'

  if (isPdf) {
    return await uploadPdfToFirebase(file)
  }

    const formData = new FormData();
    formData.append('file', file);
      
    const newImage = {
        url: '',
        name: file.name,
        isUploading: true,
        progress: 0,
        created_at: new Date().toISOString()
      };
  
    images.value.push(newImage); 
  
    try {
      const response = await api.post(`/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: function(progressEvent) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress for ${file.name}: ${percentCompleted}%`);
          const imgIndex = images.value.findIndex(img => img.name === file.name);
          if (imgIndex !== -1) {
            images.value[imgIndex].progress = percentCompleted;
          }
        }
      });

      const { url, public_id } = response.data;
  
      const imgIndex = images.value.findIndex(img => img.name === file.name);
      if (imgIndex !== -1) {
        const finalImage = {
          ...images.value[imgIndex],
          url,
          isUploading: false,
          progress: 100,
          public_id,
          docId: public_id,
        }

        images.value.splice(imgIndex, 1, finalImage)

        if (!lookupStore.lookupMaps.images) {
          lookupStore.lookupMaps.images = {}
        }

        lookupStore.lookupMaps.images[public_id] = finalImage
      }

      await setDoc(doc(firestore, 'images', public_id), {
        public_id,
        url,
        name: file.name,
        created_at: new Date().toISOString(),
        alt: '',
        caption: '',
        location: ''
      });
    
    clearImageCache()
      if (firestoreMapCache) {
        firestoreMapCache[public_id] = {
          public_id, url, name: file.name,
          created_at: new Date().toISOString(),
          alt: '', caption: '', location: '',
          docId: public_id
        }
      }

    const finalImage = {
      ...images.value[imgIndex],
      docId: public_id 
    };

    images.value[imgIndex] = finalImage;
      
    } catch (error) {
      console.error('Error uploading image:', error);
      images.value = images.value.filter(img => img.name !== file.name);
    }
  };

// UPLOAD FILE TO STORAGE
const uploadPdfToFirebase = async (file) => {
  const publicId = file.name.split('.').slice(0, -1).join('.')
  const filePath = `pdfs/${Date.now()}_${file.name}`
  const docId = `pdf_${Date.now()}_${publicId}`  // generate ONCE up front

  const placeholder = {
    url: '',
    name: file.name,
    isUploading: true,
    progress: 0,
    created_at: new Date().toISOString(),
    _uploadKey: docId,  // unique key to find this placeholder reliably
  }
  images.value.push(placeholder)

  try {
    const fileRef = storageRef(storage, filePath)
    const uploadTask = uploadBytesResumable(fileRef, file)

    await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          const idx = images.value.findIndex(img => img._uploadKey === docId)
          if (idx !== -1) images.value[idx].progress = percent
        },
        reject,
        resolve
      )
    })

    const url = await getDownloadURL(uploadTask.snapshot.ref)

    const finalImage = {
      public_id: docId,
      url,
      name: file.name,
      isUploading: false,
      progress: 100,
      created_at: new Date().toISOString(),
      alt: '',
      caption: '',
      location: '',
      storagePath: filePath,
      resource_type: 'raw',
      format: 'pdf',
      docId,
    }

    // Replace placeholder using the reliable _uploadKey
    const idx = images.value.findIndex(img => img._uploadKey === docId)
    if (idx !== -1) {
      images.value.splice(idx, 1, finalImage)
    } else {
      images.value.push(finalImage)  // fallback if placeholder was lost
    }

    // Write to Firestore
    await setDoc(doc(firestore, 'images', docId), finalImage)
    console.log('✅ PDF saved to Firestore:', docId)

    // Update caches
    clearImageCache()
    if (firestoreMapCache) firestoreMapCache[docId] = { ...finalImage, docId }

    // Update lookup store
    if (!lookupStore.lookupMaps.images) lookupStore.lookupMaps.images = {}
    lookupStore.lookupMaps.images[docId] = finalImage

    return finalImage

  } catch (error) {
    console.error('PDF upload failed:', error)
    images.value = images.value.filter(img => img._uploadKey !== docId)
  }
}

// UPDATE IMAGES
const handleImageUpdate = async (image) => {
    try {
      const response = await api.post(`/update-image`, image);
      const updatedImage = response.data.data;
        
        const index = images.value.findIndex(img => img.public_id === updatedImage.public_id);
        if (index !== -1) {
            images.value[index] = { 
                ...images.value[index], 
                ...updatedImage,
                name: updatedImage.context.custom.caption  // Update name with new caption
            };
        }

        if (selectedImage.value && selectedImage.value.public_id === updatedImage.public_id) {
        console.log("Updating cloudinary image data:", updatedImage);
    }

      await setDoc(doc(firestore, 'images', updatedImage.public_id), {
        public_id: updatedImage.public_id,
        url: updatedImage.secure_url,
        name: (updatedImage.context?.custom?.caption ?? '') || '',
        created_at: updatedImage.created_at || new Date().toISOString(),
        alt: updatedImage.context?.custom?.alt ?? '',
        location: updatedImage.context?.custom?.location ?? '',
      },
      { merge: true }
    );

    clearImageCache()
    if (firestoreMapCache) {
      firestoreMapCache[updatedImage.public_id] = {
        ...(firestoreMapCache[updatedImage.public_id] || {}),
        public_id: updatedImage.public_id,
        url: updatedImage.secure_url,
        name: (updatedImage.context?.custom?.caption ?? '') || '',
        alt: updatedImage.context?.custom?.alt ?? '',
        location: updatedImage.context?.custom?.location ?? '',
      }
    }

    } catch (error) {
        console.error('Failed to update image:', error);
    }
};
  
// DELETE IMAGE
  const handleImageDelete = async (publicId) => {
    try {
      console.log("Deleting image with public ID:", publicId);

      await api.post(`/delete-image`, { public_id: publicId });
      await deleteDoc(doc(firestore, 'images', publicId));

      images.value = images.value.filter(img => img.public_id !== publicId);
      if (selectedImage.value?.public_id === publicId) {
        selectedImage.value = null;
      }

      clearImageCache()
      if (firestoreMapCache) {
        delete firestoreMapCache[publicId]
      }

      console.log("✅ Image deleted:", publicId);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

// SELECT IMAGE
const selectImage = (image) => {
  selectedImage.value = image;
};

// SELECT MULTIPLE IMAGES
const selectImages = (imageOrArray) => {
  if (Array.isArray(imageOrArray)) {
    selectedImages.value = imageOrArray;
  } else if (imageOrArray && !selectedImages.value.some(img => img.docId === imageOrArray.docId)) {
    selectedImages.value.push(imageOrArray);
  }
};


// SYNC IMAGES FROM CLOUDINARY THAT DONT EXIST IN FIREBASE
const syncCloudinaryImages = async () => {
  isLoading.value = true

  try {
    await api.post('/images/sync')

    clearImageCache()
    firestoreMapCache = null

    await fetchImages(true)
  } catch (error) {
    console.error('Failed to sync Cloudinary images:', error)
  } finally {
    isLoading.value = false
  }
}

  return {
    images,
    selectedImage,
    selectedImages,
    searchQuery,
    isLoading,
    isLoadingMore,
    nextCursor,
    hasMore,
    filteredImages,
    fetchImages,
    loadMoreImages,
    syncCloudinaryImages,
    uploadImage,
    uploadSingleImage,
    uploadMultipleImages,
    handleImageUpdate,
    handleImageDelete,
    selectImage,
    selectImages
  };
});


