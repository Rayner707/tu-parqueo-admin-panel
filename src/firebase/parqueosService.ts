import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  GeoPoint
} from "firebase/firestore";
import { db } from "./firebase";

// Interfaces
export interface Horario {
  dia: string;
  inicio: string;
  fin: string;
}

export interface MetodoPago {
  nombre: string;
}

export interface Plan {
  label: string;
  precio: number;
}

export interface Servicio {
  nombre: string;
  precio: number;
}

export interface Parqueo {
  id: string;
  direccion: string;
  disponibles: number;
  etiqueta: string;
  horarios: Horario[];
  metodosPago: MetodoPago[];
  nombre: string;
  planes: Plan[];
  precioPorHora: number;
  servicios: Servicio[];
  ubicacion: { lat: number; lng: number };
  fechaCreacion?: Timestamp;
  fechaActualizacion?: Timestamp;
}

export type ParqueoInput = Omit<Parqueo, 'id' | 'fechaCreacion' | 'fechaActualizacion'>;

type ParqueoUpdatePayload = Partial<Omit<ParqueoInput, 'ubicacion'>> & {
  ubicacion?: GeoPoint;
  fechaActualizacion: Timestamp;
};

const COLLECTION_NAME = 'parqueos';

export class ParqueosService {
  static async crearParqueo(parqueoData: ParqueoInput): Promise<string> {
    try {
      const geopoint = new GeoPoint(parqueoData.ubicacion.lat, parqueoData.ubicacion.lng);

      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...parqueoData,
        ubicacion: geopoint,
        fechaCreacion: Timestamp.now(),
        fechaActualizacion: Timestamp.now()
      });

      console.log('Parqueo creado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error al crear parqueo:', error);
      throw new Error('Error al crear el parqueo');
    }
  }

  static async obtenerParqueos(): Promise<Parqueo[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('fechaCreacion', 'desc'));
      const querySnapshot = await getDocs(q);

      const parqueos: Parqueo[] = [];
      querySnapshot.forEach((doc) => {
        parqueos.push({
          id: doc.id,
          ...doc.data()
        } as Parqueo);
      });

      return parqueos;
    } catch (error) {
      console.error('Error al obtener parqueos:', error);
      throw new Error('Error al obtener los parqueos');
    }
  }

  static async actualizarParqueo(id: string, parqueoData: Partial<ParqueoInput>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);

      const { ubicacion, ...rest } = parqueoData;
      const baseData: Partial<Omit<ParqueoInput, 'ubicacion'>> = rest;

      const dataToUpdate: ParqueoUpdatePayload = {
        ...baseData,
        fechaActualizacion: Timestamp.now(),
        ...(ubicacion && {
          ubicacion: new GeoPoint(ubicacion.lat, ubicacion.lng)
        })
      };

      await updateDoc(docRef, dataToUpdate);
      console.log('Parqueo actualizado:', id);
    } catch (error) {
      console.error('Error al actualizar parqueo:', error);
      throw new Error('Error al actualizar el parqueo');
    }
  }

  static async eliminarParqueo(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      console.log('Parqueo eliminado:', id);
    } catch (error) {
      console.error('Error al eliminar parqueo:', error);
      throw new Error('Error al eliminar el parqueo');
    }
  }

  static suscribirseAParqueos(callback: (parqueos: Parqueo[]) => void): () => void {
    const ref = collection(db, COLLECTION_NAME);

    return onSnapshot(ref, (querySnapshot) => {
      const parqueos: Parqueo[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();

        // Convertir ubicación GeoPoint a { lat, lng }
        const ubicacionFormateada = data.ubicacion instanceof GeoPoint
          ? { lat: data.ubicacion.latitude, lng: data.ubicacion.longitude }
          : { lat: 0, lng: 0 };

        // Formatear horarios si vienen como objeto o ya como array
        let horariosFormateados: Horario[] = [];
        if (Array.isArray(data.horarios)) {
          horariosFormateados = data.horarios;
        } else if (typeof data.horarios === 'object' && data.horarios !== null) {
          horariosFormateados = Object.entries(data.horarios).map(([dia, val]) => ({
            dia,
            inicio: (val as { inicio: string }).inicio,
            fin: (val as { fin: string }).fin
          }));
        }

        // Métodos de pago: normalizar string o objeto
        const metodosPagoFormateados: MetodoPago[] = Array.isArray(data.metodosPago)
          ? data.metodosPago.map((m: unknown) =>
              typeof m === 'string' ? { nombre: m } : (m as MetodoPago)
            )
          : [];

        const parqueo: Parqueo = {
          id: docSnap.id,
          direccion: data.direccion || '',
          disponibles: data.disponibles || 0,
          etiqueta: data.etiqueta || '',
          nombre: data.nombre || '',
          precioPorHora: data.precioPorHora || 0,
          horarios: horariosFormateados,
          metodosPago: metodosPagoFormateados,
          planes: Array.isArray(data.planes) ? data.planes : [],
          servicios: Array.isArray(data.servicios) ? data.servicios : [],
          ubicacion: ubicacionFormateada,
          fechaCreacion: data.fechaCreacion,
          fechaActualizacion: data.fechaActualizacion
        };

        parqueos.push(parqueo);
      });

      parqueos.sort((a, b) => {
        const tA = a.fechaCreacion?.toMillis?.() || 0;
        const tB = b.fechaCreacion?.toMillis?.() || 0;
        return tB - tA;
      });

      callback(parqueos);
    }, (error) => {
      console.error('Error en la suscripción:', error);
    });
  }

  static validarParqueo(parqueo: ParqueoInput): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!parqueo.nombre?.trim()) errores.push('El nombre es requerido');
    if (!parqueo.direccion?.trim()) errores.push('La dirección es requerida');

    if (!parqueo.ubicacion || typeof parqueo.ubicacion.lat !== 'number' || typeof parqueo.ubicacion.lng !== 'number') {
      errores.push('La ubicación debe tener latitud y longitud válidas');
    }

    if (parqueo.disponibles < 0) errores.push('Los espacios disponibles no pueden ser negativos');
    if (parqueo.precioPorHora < 0) errores.push('El precio por hora no puede ser negativo');

    if (!parqueo.horarios || parqueo.horarios.length === 0) {
      errores.push('Debe agregar al menos un horario');
    } else {
      parqueo.horarios.forEach((h, i) => {
        if (!h.dia?.trim()) errores.push(`El día del horario ${i + 1} es requerido`);
        if (!h.inicio?.trim()) errores.push(`La hora de inicio del horario ${i + 1} es requerida`);
        if (!h.fin?.trim()) errores.push(`La hora de fin del horario ${i + 1} es requerida`);
      });
    }

    if (!parqueo.metodosPago || parqueo.metodosPago.length === 0) {
      errores.push('Debe agregar al menos un método de pago');
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }
}
