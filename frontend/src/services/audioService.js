import { storage, db } from './firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Upload an audio Blob to Firebase Storage and save metadata to Firestore
export async function uploadAudioBlob(blob, userId = 'anonymous', meta = {}) {
  if (!storage || !db) throw new Error('Firebase not initialized');
  const ts = Date.now();
  const path = `audio/${userId}/${ts}.webm`;
  const ref = storageRef(storage, path);

  await uploadBytes(ref, blob);
  const url = await getDownloadURL(ref);

  const docId = `${userId}_${ts}`;
  const docRef = doc(db, 'audios', docId);
  await setDoc(docRef, {
    userId,
    path,
    url,
    meta: meta || {},
    createdAt: serverTimestamp(),
  });

  return { path, url };
}
