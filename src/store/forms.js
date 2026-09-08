// store/forms.js
import { defineStore } from 'pinia'
import { firestore } from '../firebase/firebase'
import { collection, getDocs, getDoc, doc } from 'firebase/firestore'

export const useFormsStore = defineStore('forms', {
  state: () => ({
    formsList: [],
    formsMap: {}, // { id: { ...data } }
  }),

  actions: {
    async fetchFormsList() {
      if (this.formsList.length) return this.formsList
      const snap = await getDocs(collection(firestore, 'forms'))
      this.formsList = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      return this.formsList
    },

    async getForm(id) {
      if (this.formsMap[id]) return this.formsMap[id]
      const ref = doc(firestore, 'forms', id)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        this.formsMap[id] = { id: snap.id, ...snap.data() }
        return this.formsMap[id]
      }
      return null
    },

    clearCache() {
      this.formsList = []
      this.formsMap = {}
    }
  }
})
