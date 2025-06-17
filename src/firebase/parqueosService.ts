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
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";

// Interfaces (copiadas de parqueos.tsx)
export interface Horario {
  dia: string;
  inicio: string;
  fin: string;
}

export interface MetodoPago {
  nombre: string;
  activo: boolean;
}

export interface Plan {
  rango: string;
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

const COLLECTION_NAME = 'parqueos';

export class ParqueosService {
  // Crear un nuevo parqueo
  static async crearParqueo(parqueoData: ParqueoInput): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...parqueoData,
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

  // Obtener todos los parqueos
  static async obtenerParqueos(): Promise<Parqueo[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        orderBy('fechaCreacion', 'desc')
      );
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

  // Actualizar un parqueo
  static async actualizarParqueo(id: string, parqueoData: Partial<ParqueoInput>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(docRef, {
        ...parqueoData,
        fechaActualizacion: Timestamp.now()
      });
      console.log('Parqueo actualizado:', id);
    } catch (error) {
      console.error('Error al actualizar parqueo:', error);
      throw new Error('Error al actualizar el parqueo');
    }
  }

  // Eliminar un parqueo
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

  // Suscribirse a cambios en tiempo real (opcional)
  static suscribirseAParqueos(callback: (parqueos: Parqueo[]) => void): () => void {
  const ref = collection(db, COLLECTION_NAME);

  return onSnapshot(ref, (querySnapshot) => {
    const parqueos: Parqueo[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();

      const parqueo: Parqueo = {
        id: docSnap.id,
        direccion: data.direccion || '',
        disponibles: data.disponibles || 0,
        etiqueta: data.etiqueta || '',
        nombre: data.nombre || '',
        precioPorHora: data.precioPorHora || 0,
        ubicacion: (typeof data.ubicacion === 'object' && 'lat' in data.ubicacion && 'lng' in data.ubicacion)
  ? data.ubicacion
  : { lat: 0, lng: 0 },
        horarios: Array.isArray(data.horarios) ? data.horarios : [],
        metodosPago: Array.isArray(data.metodosPago) ? data.metodosPago : [],
        planes: Array.isArray(data.planes) ? data.planes : [],
        servicios: Array.isArray(data.servicios) ? data.servicios : [],
        fechaCreacion: data.fechaCreacion,
        fechaActualizacion: data.fechaActualizacion
      };

      parqueos.push(parqueo);
    });

    // Ordenar por fechaCreacion si está disponible
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


  // Validar datos antes de enviar
  static validarParqueo(parqueo: ParqueoInput): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!parqueo.nombre?.trim()) {
      errores.push('El nombre es requerido');
    }

    if (!parqueo.direccion?.trim()) {
      errores.push('La dirección es requerida');
    }

    if (
  !parqueo.ubicacion ||
  typeof parqueo.ubicacion.lat !== 'number' ||
  typeof parqueo.ubicacion.lng !== 'number'
) {
  errores.push('La ubicación debe tener latitud y longitud válidas');
}

    if (parqueo.disponibles < 0) {
      errores.push('Los espacios disponibles no pueden ser negativos');
    }

    if (parqueo.precioPorHora < 0) {
      errores.push('El precio por hora no puede ser negativo');
    }

    // Validar horarios
    if (!parqueo.horarios || parqueo.horarios.length === 0) {
      errores.push('Debe agregar al menos un horario');
    } else {
      parqueo.horarios.forEach((horario, index) => {
        if (!horario.dia?.trim()) {
          errores.push(`El día del horario ${index + 1} es requerido`);
        }
        if (!horario.inicio?.trim()) {
          errores.push(`La hora de inicio del horario ${index + 1} es requerida`);
        }
        if (!horario.fin?.trim()) {
          errores.push(`La hora de fin del horario ${index + 1} es requerida`);
        }
      });
    }

    // Validar métodos de pago
    if (!parqueo.metodosPago || parqueo.metodosPago.length === 0) {
      errores.push('Debe agregar al menos un método de pago');
    } else {
      const metodosActivos = parqueo.metodosPago.filter(m => m.activo);
      if (metodosActivos.length === 0) {
        errores.push('Debe tener al menos un método de pago activo');
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }
}