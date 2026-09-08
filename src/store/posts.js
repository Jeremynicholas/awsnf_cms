// store/posts.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { firestore } from '../firebase/firebase'
import { collection, query, getDocs, orderBy, where, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore'
import { useLookupStore } from '../store/lookups'

export const usePostsStore = defineStore('posts', () => {
  
  const posts = ref({})
  const { lookupMaps } = useLookupStore()

  const fetchPosts = async (postType = '', filters = {}, force = false) => {

  const filterKey = Object.entries(filters)
    .filter(([_, value]) => value === true)
    .map(([key]) => key)
    .sort()
    .join('_') || 'all'

  const cacheKey = `${postType}_${filterKey}`

  if (!force && posts.value[cacheKey]) return // Already fetched & no force

  const baseRef = collection(firestore, postType)
  const constraints = [orderBy('createdAt', 'desc')]

  if (filters.specialOffer === true) {
    constraints.push(where('specialOffer', '==', true))
  }
  if (filters.groupTour === true) {
    constraints.push(where('groupTour', '==', true))
  }

  const q = query(baseRef, ...constraints)
  const snapshot = await getDocs(q)

  posts.value[cacheKey] = snapshot.docs.map(doc => {
    const data = doc.data()
    const countriesArray = Array.isArray(data.countries) ? data.countries : []
    const regionArray = Array.isArray(data.regions) ? data.regions : []
    const holidayTypeArray = Array.isArray(data.holidayTypes) ? data.holidayTypes : []
    const accommodationArray = Array.isArray(data.accommodation) ? data.accommodation : []

    return {
      id: doc.id,
      ...data,
      featureImageData: lookupMaps.images[data.featureImage] || null,
      featureImage2Data: lookupMaps.images[data.featureImage2] || null,
      countryNames: countriesArray.map(cid => lookupMaps.countries[cid]?.name || 'Unknown'),
      regionNames: regionArray.map(rid => lookupMaps.regions[rid]?.name || 'Unknown'),
      holidayTypeNames: holidayTypeArray.map(hid => lookupMaps.holidayTypes[hid]?.name || 'Unknown'),
      accommodationItems: accommodationArray.map(aid => {
        const accom = lookupMaps.accommodation[aid]
        return accom
          ? { name: accom.name, vueSlug: accom.vueSlug, id: aid }
          : { name: 'Unknown', vueSlug: '', id: aid }
      }),
      createdAt: data.createdAt?.toDate().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: '2-digit'
      }), 
    }
  })
}

// GET POST BY SLUG
const getPostBySlug = (type, slug) => {
  const allKeys = Object.keys(posts.value).filter(key => key.startsWith(type))
  for (const key of allKeys) {
    const match = posts.value[key]?.find(post => post.vueSlug === slug)
    if (match) return match
  }
  return null
}


  // UPDATE POST
  const updatePost = async (postType, postId, updatedData) => {
    const postRef = doc(firestore, postType, postId)
    await updateDoc(postRef, updatedData)
  }



  // ITINERARYS
  const itinerary = ref({})  // key: tripId, value: array of items

  const fetchItinerary = async (tripId) => {
    try {
      if (itinerary.value[tripId]) return

      const itineraryRef = collection(firestore, 'trips', tripId, 'itinerary')
      const q = query(itineraryRef, orderBy('createdAt', 'asc'));
      const snapshot = await getDocs(q);

      itinerary.value[tripId] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Failed to fetch itinerary:', error)
    }
  }


  async function addItineraryDay(tripId, data) {
    const { id, ...rest } = data; // exclude any id field

    const colRef = collection(firestore, 'trips', tripId, 'itinerary');
    const docRef = await addDoc(colRef, {
      ...rest,
      createdAt: serverTimestamp()
    });

    // Make sure the local store is reactive
    if (!itinerary.value[tripId]) {
      itinerary.value[tripId] = [];
    }

    // Push the new day into local store
    itinerary.value[tripId].push({
      ...rest,
      createdAt: new Date(),  // approximate createdAt locally
      // No id field saved
    });
    return docRef;
  }

  async function updateItineraryDay(tripId, docId, data) {
    const ref = doc(firestore, 'trips', tripId, 'itinerary', docId);
    await updateDoc(ref, data);

    // Update local store
    if (itinerary.value[tripId]) {
      const index = itinerary.value[tripId].findIndex(item => item.id === docId);
      if (index !== -1) {
        itinerary.value[tripId][index] = { ...itinerary.value[tripId][index], ...data };
      }
    }
  }


  async function deleteItineraryDay(tripId, docId) {
    const ref = doc(firestore, 'trips', tripId, 'itinerary', docId);
    await deleteDoc(ref);

    // Remove from local store
    if (itinerary.value[tripId]) {
      itinerary.value[tripId] = itinerary.value[tripId].filter(item => item.id !== docId);
    }
  }


 
  // BLOGS
    const blogs = ref({})

  const fetchBlogs = async (blogId, force = false) => {
    try {
        if (!force && blogs.value[blogId]) return
        const blogsRef = collection(firestore, 'blogs', blogId, 'blogDetails')
        const q = query(blogsRef, orderBy('order', 'asc'), orderBy('createdAt', 'asc'))
        const snapshot = await getDocs(q)
        blogs.value[blogId] = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            blogImageData: lookupMaps.images[data.blogImage] || null,
          }
        })
      } catch (error) {
        console.error('Failed to fetch blogs:', error)
      }
    }

    async function updateBlogBlock(blogId, blockId, updatedData) {
      const ref = doc(firestore, 'blogs', blogId, 'blogDetails', blockId)
      await updateDoc(ref, updatedData)

      if (blogs.value[blogId]) {
      const index = blogs.value[blogId].findIndex((b) => b.id === blockId)
      if (index !== -1) {
        const current = blogs.value[blogId][index]
        
          blogs.value[blogId][index] = {
          ...current,
          ...updatedData,
          // ✅ immediately hydrate blogImageData when image changes
          blogImageData:
            updatedData.blogImage
              ? lookupMaps.images[updatedData.blogImage] || null
              : current.blogImageData,
        }
      }
    }
    }

    async function addBlogBlock(blogId, data) {
    const colRef = collection(firestore, 'blogs', blogId, 'blogDetails');
    const order = blogs.value[blogId]?.length || 0

    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      order,
    })

      if (!blogs.value[blogId]) blogs.value[blogId] = [];

      blogs.value[blogId].push({
        id: docRef.id,
        ...data,
        order,
        createdAt: new Date(),
        // ✅ hydrate immediately
        blogImageData: data.blogImage
          ? lookupMaps.images[data.blogImage] || null
          : null,
      });

      return docRef;
}


  async function deleteBlogBlock(blogId, blockId) {
  const ref = doc(firestore, 'blogs', blogId, 'blogDetails', blockId);
  await deleteDoc(ref);

  if (blogs.value[blogId]) {
    blogs.value[blogId] = blogs.value[blogId].filter(b => b.id !== blockId);
  }
}



// DELETE POST
 const deletePost = async (postType, postId) => {
  for (const key in posts.value) {
    if (key.startsWith(postType) && Array.isArray(posts.value[key])) {
      posts.value[key] = posts.value[key].filter(p => p.id !== postId)
    }
  }

  try {
    const postRef = doc(firestore, postType, postId)
    await deleteDoc(postRef)
  } catch (err) {
    console.error("Error deleting post:", err)
  }
}


  
const getPreviousSlug = (type, currentSlug) => {
  const allKeys = Object.keys(posts.value).filter(key => key.startsWith(type))
  for (const key of allKeys) {
    const allPosts = posts.value[key]
    if (!allPosts) continue

  const index = allPosts.findIndex(post => post.vueSlug === currentSlug)
      if (index > 0) {
        return allPosts[index - 1].vueSlug
      }
    }

    return null
  }

const getNextSlug = (type, currentSlug) => {
  const allKeys = Object.keys(posts.value).filter(key => key.startsWith(type))
  for (const key of allKeys) {
    const allPosts = posts.value[key]
    if (!allPosts) continue

    const index = allPosts.findIndex(post => post.vueSlug === currentSlug)
    if (index >= 0 && index < allPosts.length - 1) {
      return allPosts[index + 1].vueSlug
    }
  }

  return null
}


  return {
    posts,
    fetchPosts,
    getPostBySlug,
    updatePost,
    deletePost,
    getPreviousSlug,
    getNextSlug,

    itinerary,
    fetchItinerary,
    updateItineraryDay,
    addItineraryDay,
    deleteItineraryDay,

    blogs,
    fetchBlogs,
    updateBlogBlock,
    addBlogBlock,
    deleteBlogBlock,
  }
})
