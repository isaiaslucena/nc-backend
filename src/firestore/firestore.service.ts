import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { initializeApp } from 'firebase/app'
import {
  collection,
  getDocs,
  doc,
  getDoc,
  getFirestore,
  query,
  where,
  QuerySnapshot,
  DocumentData,
  setDoc,
  deleteDoc,
} from 'firebase/firestore'
import firebaseConfig from './firebase-config'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class FirestoreService {
  private logger = new Logger('FirestoreService')
  private app = initializeApp(firebaseConfig)
  private db = getFirestore(this.app)

  constructor() {
    if (process.env.NODE_ENV === 'development') {
      this.logger.log('New instance created')
    }
  }

  private createDocObject(querySnapshot: QuerySnapshot<DocumentData>) {
    const docs = []
    querySnapshot.forEach((currentDoc) => {
      docs.push({ id: currentDoc.id, ...currentDoc.data() })
    })

    return docs
  }

  async getDocs(collectionName: string): Promise<Record<string, any>[]> {
    const querySnapshot = await getDocs(collection(this.db, collectionName))

    return this.createDocObject(querySnapshot)
  }

  async getDocById(collectionName: string, docId: string) {
    const docRef = doc(this.db, collectionName, docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      console.log('Document data:', docSnap.data())
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      // doc.data() will be undefined in this case
      throw new NotFoundException(`Doc with ID ${docId} not found!`)
    }
  }

  async getDocsByField(
    collectionName: string,
    fieldName: string,
    fieldValue: string,
  ) {
    const collectionRef = collection(this.db, collectionName)
    const queryToExecute = query(
      collectionRef,
      where(fieldName, '==', fieldValue),
    )
    const querySnapshot = await getDocs(queryToExecute)

    const docsResult = this.createDocObject(querySnapshot)

    if (docsResult.length === 0) {
      throw new NotFoundException(
        `Docs with ${fieldName} ${fieldValue} not found!`,
      )
    }

    return docsResult
  }

  private generateUuid(): string {
    return uuidv4()
  }

  private addIdToNewDoc(docData: Record<string, any>) {
    return { id: this.generateUuid(), ...docData }
  }

  async createDoc(collectionName: string, data: Record<string, any>) {
    const newDocData = this.addIdToNewDoc(data)
    await setDoc(doc(this.db, collectionName, newDocData.id), data)
    return newDocData
  }

  async deleteDocById(collectionName: string, id: string) {
    try {
      await deleteDoc(doc(this.db, collectionName, id))
    } catch (error) {
      console.log(error)
    }
  }

  async deleteDocByField(
    collectionName: string,
    fieldName: string,
    fieldValue: string,
  ) {
    const [{ id }] = await this.getDocsByField(
      collectionName,
      fieldName,
      fieldValue,
    )

    await this.deleteDocById(collectionName, id)
  }
}
