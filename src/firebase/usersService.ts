import { db } from '../firebase/firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc
} from 'firebase/firestore';
import type { Usuario, Vehicle } from '../module/users';

const usersCollection = collection(db, 'users');

export const getAllUsers = async (): Promise<Usuario[]> => {
  const snapshot = await getDocs(usersCollection);

  const usuarios: Usuario[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const userId = docSnap.id;

    // Obtener vehículos desde la subcolección
    const vehiclesSnapshot = await getDocs(collection(db, `users/${userId}/vehicles`));
    const vehicles: Vehicle[] = vehiclesSnapshot.docs.map(v => ({
      id: v.id,
      ...v.data()
    })) as Vehicle[];

    usuarios.push({
      id: userId,
      nombres: data.nombres,
      apellidos: data.apellidos,
      email: data.email,
      role: data.role ?? 'cliente',
      telefono: data.telefono,
      creadoEn: data.creadoEn ?? new Date().toISOString(),
      vehicles
    });
  }

  return usuarios;
};

export const createUser = async (
  usuario: Omit<Usuario, 'id' | 'vehicles'>,
  vehicles: Vehicle[]
): Promise<void> => {
  const userRef = await addDoc(usersCollection, usuario);

  // Crear vehículos en la subcolección
  for (const vehicle of vehicles) {
    const vehicleRef = doc(db, `users/${userRef.id}/vehicles/${vehicle.id}`);
    await setDoc(vehicleRef, vehicle);
  }
};

export const updateUser = async (
  id: string,
  usuario: Omit<Usuario, 'id' | 'vehicles'>,
  vehicles: Vehicle[]
): Promise<void> => {
  const userRef = doc(db, 'users', id);
  await updateDoc(userRef, usuario);

  // Eliminar todos los vehículos anteriores
  const vehiclesCollectionRef = collection(db, `users/${id}/vehicles`);
  const existing = await getDocs(vehiclesCollectionRef);
  for (const docSnap of existing.docs) {
    await deleteDoc(doc(db, `users/${id}/vehicles/${docSnap.id}`));
  }

  // Agregar los nuevos vehículos
  for (const vehicle of vehicles) {
    const vehicleRef = doc(db, `users/${id}/vehicles/${vehicle.id}`);
    await setDoc(vehicleRef, vehicle);
  }
};

export const deleteUser = async (id: string): Promise<void> => {
  const vehiclesCollectionRef = collection(db, `users/${id}/vehicles`);
  const vehiclesSnapshot = await getDocs(vehiclesCollectionRef);

  // Eliminar todos los vehículos en paralelo
  await Promise.all(
    vehiclesSnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, `users/${id}/vehicles/${docSnap.id}`))
    )
  );

  // Luego eliminar el usuario
  await deleteDoc(doc(db, 'users', id));
};