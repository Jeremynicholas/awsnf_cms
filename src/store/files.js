import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { storage } from '../firebase/firebase'
import { ref as sRef, listAll, getDownloadURL, getMetadata, uploadBytesResumable } from 'firebase/storage'

export const useFileStore = defineStore('files', () => {
  const files = ref([])
  const selectedFile = ref(null)
  const searchQuery = ref('')
  const isLoading = ref(false)
  const isUploading = ref(false)
  const uploadProgress = ref(0)

  const FOLDER = 'brochures' // change if you want

  // Optional cache like images
  const CACHE_KEY = 'cloudinary_file_cache'
  const CACHE_EXPIRY_KEY = 'cloudinary_file_cache_expiry'
  const FETCH_INTERVAL = 10 * 60 * 1000

  const getCached = () => {
    const expiry = localStorage.getItem(CACHE_EXPIRY_KEY)
    if (expiry && Date.now() < parseInt(expiry)) {
      try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
        return Array.isArray(cached) ? cached : []
      } catch {
        return []
      }
    }
    return []
  }

  const setCached = (items) => {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items))
    localStorage.setItem(CACHE_EXPIRY_KEY, Date.now() + FETCH_INTERVAL)
  }

  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY)
    localStorage.removeItem(CACHE_EXPIRY_KEY)
  }

  const fetchFiles = async (force = false) => {
    const cached = getCached()
    if (!force && cached.length) {
      files.value = cached
      return
    }

    isLoading.value = true
    try {
      const folderRef = sRef(storage, FOLDER)
      const res = await listAll(folderRef)
      const items = await Promise.all(
        res.items.map(async (itemRef) => {
          const [url, meta] = await Promise.all([
            getDownloadURL(itemRef),
            getMetadata(itemRef),
          ])

          return {
            storagePath: itemRef.fullPath,
            filename: itemRef.name,
            url,
            bytes: meta.size || null,
            contentType: meta.contentType || '',
            updatedAt: meta.updated || null,
          }
        })
      )
      
      files.value = items.sort((a, b) => {
        const da = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const db = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return db - da
      })

      setCached(files.value)
    } catch (e) {
      console.error('Error fetching files:', e)
    } finally {
      isLoading.value = false
    }
  }

  const filteredFiles = computed(() => {
    const terms = searchQuery.value.toLowerCase().split(/\s+/).filter(Boolean)
    return files.value
      .filter(f => terms.every(t => (f.filename || '').toLowerCase().includes(t)))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  })

  const uploadPdf = async (file, opts = {}) => {
    if (!file) return null
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.')
      return null
    }

    isUploading.value = true
    uploadProgress.value = 0

    const targetName = opts.filename || file.name
    const path = `${FOLDER}/${targetName}`
    const fileRef = sRef(storage, path)

    const task = uploadBytesResumable(fileRef, file, {
      contentType: file.type,
      // optional: cache control for PDFs
      // cacheControl: 'public,max-age=31536000',
    })

    await new Promise((resolve, reject) => {
      task.on(
        'state_changed',
        (snap) => {
          uploadProgress.value = Math.round((snap.bytesTransferred * 100) / snap.totalBytes)
        },
        reject,
        resolve
      )
    })

    const [url, meta] = await Promise.all([getDownloadURL(fileRef), getMetadata(fileRef)])

    const uploaded = {
      storagePath: path,
      filename: targetName,
      url,
      bytes: meta.size || file.size,
      contentType: meta.contentType || file.type,
      updatedAt: meta.updated || new Date().toISOString(),
    }

    // refresh list (cheap enough for brochure folder)
    await fetchFiles(true)

    isUploading.value = false
    uploadProgress.value = 0

    return uploaded
  }

  const selectFile = (fileObj) => {
    selectedFile.value = fileObj
  }

  return {
    files,
    selectedFile,
    searchQuery,
    isLoading,
    isUploading,
    uploadProgress,
    fetchFiles,
    filteredFiles,
    uploadPdf,
    selectFile,
  }
})