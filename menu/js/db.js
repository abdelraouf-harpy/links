// ═══════════════════════════════════════════════════════════
// db.js — Database helpers (Firestore + LocalStorage fallback)
// ═══════════════════════════════════════════════════════════
import { db, storage, imgbbApiKey } from './firebase.js';
import {
  collection, doc, getDocs, getDoc, addDoc, setDoc,
  updateDoc, deleteDoc, query, orderBy, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ── Image Upload ───────────────────────────────────────────
export async function uploadImage(file, path) {
  if (!file) return null;
  
  // إذا تم توفير مفتاح ImgBB، نقوم بالرفع عليه مباشرة لتجنب التكاليف والفيزا كارد
  if (imgbbApiKey) {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (result.success) {
        return result.data.url; // إرجاع رابط الصورة المباشر
      } else {
        console.error('ImgBB upload error:', result);
      }
    } catch (e) {
      console.error('Failed to upload to ImgBB:', e);
    }
  }

  // Fallback to Firebase Storage
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// ── Restaurants ────────────────────────────────────────────
export async function getRestaurants() {
  const snap = await getDocs(query(collection(db, 'restaurants'), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getRestaurantBySlug(slug) {
  const q = query(collection(db, 'restaurants'), where('slug', '==', slug), where('isActive', '==', true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export async function getRestaurantById(id) {
  const snap = await getDoc(doc(db, 'restaurants', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function createRestaurant(data) {
  return await addDoc(collection(db, 'restaurants'), {
    ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
  });
}

export async function updateRestaurant(id, data) {
  await updateDoc(doc(db, 'restaurants', id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteRestaurant(id) {
  await deleteDoc(doc(db, 'restaurants', id));
}

// ── Categories ─────────────────────────────────────────────
export async function getCategories(restaurantId) {
  const q = query(
    collection(db, 'restaurants', restaurantId, 'categories'),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createCategory(restaurantId, data) {
  return await addDoc(collection(db, 'restaurants', restaurantId, 'categories'), {
    ...data, createdAt: serverTimestamp()
  });
}

export async function updateCategory(restaurantId, catId, data) {
  await updateDoc(doc(db, 'restaurants', restaurantId, 'categories', catId), data);
}

export async function deleteCategory(restaurantId, catId) {
  // Delete all items first
  const items = await getItems(restaurantId, catId);
  for (const item of items) {
    await deleteItem(restaurantId, catId, item.id);
  }
  await deleteDoc(doc(db, 'restaurants', restaurantId, 'categories', catId));
}

// ── Items ──────────────────────────────────────────────────
export async function getItems(restaurantId, catId) {
  const q = query(
    collection(db, 'restaurants', restaurantId, 'categories', catId, 'items'),
    orderBy('order', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getAllItems(restaurantId) {
  const cats = await getCategories(restaurantId);
  const all = [];
  for (const cat of cats) {
    const items = await getItems(restaurantId, cat.id);
    items.forEach(item => all.push({ ...item, categoryId: cat.id, categoryName: cat.nameAr }));
  }
  return all;
}

export async function createItem(restaurantId, catId, data) {
  return await addDoc(
    collection(db, 'restaurants', restaurantId, 'categories', catId, 'items'),
    { ...data, extras: data.extras || [], createdAt: serverTimestamp() }
  );
}

export async function updateItem(restaurantId, catId, itemId, data) {
  await updateDoc(
    doc(db, 'restaurants', restaurantId, 'categories', catId, 'items', itemId),
    data
  );
}

export async function deleteItem(restaurantId, catId, itemId) {
  await deleteDoc(doc(db, 'restaurants', restaurantId, 'categories', catId, 'items', itemId));
}

// ── Users ──────────────────────────────────────────────────
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function setUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), data, { merge: true });
}

// ── Full Menu (for customer view) ──────────────────────────
export async function getFullMenu(slug) {
  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) return null;

  const cats = await getCategories(restaurant.id);
  const menu = [];
  for (const cat of cats) {
    if (!cat.isActive) continue;
    const items = await getItems(restaurant.id, cat.id);
    menu.push({ ...cat, items: items.filter(i => i.isAvailable !== false) });
  }
  return { restaurant, categories: menu };
}
