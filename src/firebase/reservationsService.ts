import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";

export interface Reservacion {
  id: string;
  creadoEn: string;
  direccion: string;
  estado: string;
  fecha: string;
  horaFin: string;
  horaInicio: string;
  metodoPago: string;
  parqueoNombre: string;
  servicioExtra: string | null;
  total: number;
}

export type ReservacionInput = Omit<Reservacion, 'id'>;

const COLLECTION_NAME = 'reservations';

// Crear una nueva reservación
export const createReservation = async (reservacionData: ReservacionInput): Promise<Reservacion> => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), reservacionData);
    return {
      id: docRef.id,
      ...reservacionData
    };
  } catch (error) {
    console.error("Error creando reservación:", error);
    throw new Error("Error al crear la reservación");
  }
};

// Obtener todas las reservaciones
export const getAllReservations = async (): Promise<Reservacion[]> => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('creadoEn', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const reservaciones: Reservacion[] = [];
    querySnapshot.forEach((doc) => {
      reservaciones.push({
        id: doc.id,
        ...doc.data()
      } as Reservacion);
    });
    
    return reservaciones;
  } catch (error) {
    console.error("Error obteniendo reservaciones:", error);
    throw new Error("Error al obtener las reservaciones");
  }
};

// Actualizar una reservación existente
export const updateReservation = async (id: string, reservacionData: Partial<ReservacionInput>): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, reservacionData);
  } catch (error) {
    console.error("Error actualizando reservación:", error);
    throw new Error("Error al actualizar la reservación");
  }
};

// Eliminar una reservación
export const deleteReservation = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error eliminando reservación:", error);
    throw new Error("Error al eliminar la reservación");
  }
};

// Obtener una reservación por ID
export const getReservationById = async (id: string): Promise<Reservacion | null> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDocs(query(collection(db, COLLECTION_NAME)));
    
    let foundReservation: Reservacion | null = null;
    docSnap.forEach((doc) => {
      if (doc.id === id) {
        foundReservation = {
          id: doc.id,
          ...doc.data()
        } as Reservacion;
      }
    });
    
    return foundReservation;
  } catch (error) {
    console.error("Error obteniendo reservación por ID:", error);
    throw new Error("Error al obtener la reservación");
  }
};