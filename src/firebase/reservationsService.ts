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
  where,
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";

// Interfaces
export interface Reservation {
  id: string;
  creadoEn: Timestamp;
  direccion: string;
  estado: string;
  fecha: Timestamp;
  horaFin: string;
  horaInicio: string;
  metodoPago: string;
  parqueoId: string;
  parqueoNombre: string;
  servicioExtra?: string;
  total: number;
  uid: string;
  vehiculoId: string;
}

export interface ReservationInput {
  direccion: string;
  estado: string;
  fecha: Timestamp;
  horaFin: string;
  horaInicio: string;
  metodoPago: string;
  parqueoId: string;
  parqueoNombre: string;
  servicioExtra?: string;
  total: number;
  uid: string;
  vehiculoId: string;
}

export interface User {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  vehicles?: Vehicle[];
}

export interface Vehicle {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
  color: string;
  tipo: string;
}

export interface Parqueo {
  id: string;
  nombre: string;
  direccion: string;
  precioPorHora: number;
  metodosPago: { nombre: string }[];
  servicios: { nombre: string; precio: number }[];
}

const RESERVATIONS_COLLECTION = 'reservations';
const USERS_COLLECTION = 'users';
const PARQUEOS_COLLECTION = 'parqueos';
const VEHICLES_SUBCOLLECTION = 'vehicles';

export class ReservationsService {
  // CRUD Operations
  static async crearReservacion(reservationData: ReservationInput): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, RESERVATIONS_COLLECTION), {
        ...reservationData,
        creadoEn: Timestamp.now()
      });

      console.log('Reservación creada con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error al crear reservación:', error);
      throw new Error('Error al crear la reservación');
    }
  }

  static async obtenerReservaciones(): Promise<Reservation[]> {
    try {
      const q = query(collection(db, RESERVATIONS_COLLECTION), orderBy('creadoEn', 'desc'));
      const querySnapshot = await getDocs(q);

      const reservations: Reservation[] = [];
      querySnapshot.forEach((doc) => {
        reservations.push({
          id: doc.id,
          ...doc.data()
        } as Reservation);
      });

      return reservations;
    } catch (error) {
      console.error('Error al obtener reservaciones:', error);
      throw new Error('Error al obtener las reservaciones');
    }
  }

  static async obtenerReservacionPorId(id: string): Promise<Reservation | null> {
    try {
      const docRef = doc(db, RESERVATIONS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Reservation;
      }
      return null;
    } catch (error) {
      console.error('Error al obtener reservación:', error);
      throw new Error('Error al obtener la reservación');
    }
  }

  static async actualizarReservacion(id: string, reservationData: Partial<ReservationInput>): Promise<void> {
    try {
      const docRef = doc(db, RESERVATIONS_COLLECTION, id);
      await updateDoc(docRef, reservationData);
      console.log('Reservación actualizada:', id);
    } catch (error) {
      console.error('Error al actualizar reservación:', error);
      throw new Error('Error al actualizar la reservación');
    }
  }

  static async eliminarReservacion(id: string): Promise<void> {
    try {
      const docRef = doc(db, RESERVATIONS_COLLECTION, id);
      await deleteDoc(docRef);
      console.log('Reservación eliminada:', id);
    } catch (error) {
      console.error('Error al eliminar reservación:', error);
      throw new Error('Error al eliminar la reservación');
    }
  }

  static suscribirseAReservaciones(callback: (reservations: Reservation[]) => void): () => void {
    const ref = collection(db, RESERVATIONS_COLLECTION);
    const q = query(ref, orderBy('creadoEn', 'desc'));

    return onSnapshot(q, (querySnapshot) => {
      const reservations: Reservation[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const reservation: Reservation = {
          id: docSnap.id,
          creadoEn: data.creadoEn,
          direccion: data.direccion || '',
          estado: data.estado || 'reservado',
          fecha: data.fecha,
          horaFin: data.horaFin || '',
          horaInicio: data.horaInicio || '',
          metodoPago: data.metodoPago || '',
          parqueoId: data.parqueoId || '',
          parqueoNombre: data.parqueoNombre || '',
          servicioExtra: data.servicioExtra,
          total: data.total || 0,
          uid: data.uid || '',
          vehiculoId: data.vehiculoId || ''
        };

        reservations.push(reservation);
      });

      callback(reservations);
    }, (error) => {
      console.error('Error en la suscripción:', error);
    });
  }

  // Helper methods para obtener datos relacionados
  static async obtenerUsuarios(): Promise<User[]> {
    try {
      const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
      const users: User[] = [];
      
      for (const userDoc of querySnapshot.docs) {
        const userData = userDoc.data();
        
        // Obtener vehículos de la subcolección
        const vehiclesSnapshot = await getDocs(
          collection(db, USERS_COLLECTION, userDoc.id, VEHICLES_SUBCOLLECTION)
        );
        
        const vehicles: Vehicle[] = [];
        vehiclesSnapshot.forEach((vehicleDoc) => {
          const vehicleData = vehicleDoc.data();
          vehicles.push({
            id: vehicleDoc.id,
            marca: vehicleData.marca || '',
            modelo: vehicleData.modelo || '',
            placa: vehicleData.placa || '',
            color: vehicleData.color || '',
            tipo: vehicleData.tipo || ''
          });
        });

        users.push({
          id: userDoc.id,
          nombres: userData.nombres || '',
          apellidos: userData.apellidos || '',
          email: userData.email || '',
          telefono: userData.telefono,
          vehicles: vehicles
        });
      }

      return users;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw new Error('Error al obtener usuarios');
    }
  }

  static async obtenerParqueos(): Promise<Parqueo[]> {
    try {
      const querySnapshot = await getDocs(collection(db, PARQUEOS_COLLECTION));
      const parqueos: Parqueo[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        parqueos.push({
          id: doc.id,
          nombre: data.nombre || '',
          direccion: data.direccion || '',
          precioPorHora: data.precioPorHora || 0,
          metodosPago: Array.isArray(data.metodosPago) ? data.metodosPago : [],
          servicios: Array.isArray(data.servicios) ? data.servicios : []
        });
      });

      return parqueos;
    } catch (error) {
      console.error('Error al obtener parqueos:', error);
      throw new Error('Error al obtener parqueos');
    }
  }

  static async obtenerUsuarioPorId(uid: string): Promise<User | null> {
    try {
      const docRef = doc(db, USERS_COLLECTION, uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        // Obtener vehículos de la subcolección
        const vehiclesSnapshot = await getDocs(
          collection(db, USERS_COLLECTION, uid, VEHICLES_SUBCOLLECTION)
        );
        
        const vehicles: Vehicle[] = [];
        vehiclesSnapshot.forEach((vehicleDoc) => {
          const vehicleData = vehicleDoc.data();
          vehicles.push({
            id: vehicleDoc.id,
            marca: vehicleData.marca || '',
            modelo: vehicleData.modelo || '',
            placa: vehicleData.placa || '',
            color: vehicleData.color || '',
            tipo: vehicleData.tipo || ''
          });
        });

        return {
          id: docSnap.id,
          nombres: userData.nombres || '',
          apellidos: userData.apellidos || '',
          email: userData.email || '',
          telefono: userData.telefono,
          vehicles: vehicles
        };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  static async obtenerParqueoPorId(parqueoId: string): Promise<Parqueo | null> {
    try {
      const docRef = doc(db, PARQUEOS_COLLECTION, parqueoId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          nombre: data.nombre || '',
          direccion: data.direccion || '',
          precioPorHora: data.precioPorHora || 0,
          metodosPago: Array.isArray(data.metodosPago) ? data.metodosPago : [],
          servicios: Array.isArray(data.servicios) ? data.servicios : []
        };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener parqueo:', error);
      return null;
    }
  }

  // Nuevo método para obtener vehículo específico por ID de usuario y vehículo
  static async obtenerVehiculoPorId(userId: string, vehicleId: string): Promise<Vehicle | null> {
    try {
      const vehicleRef = doc(db, USERS_COLLECTION, userId, VEHICLES_SUBCOLLECTION, vehicleId);
      const vehicleSnap = await getDoc(vehicleRef);

      if (vehicleSnap.exists()) {
        const vehicleData = vehicleSnap.data();
        return {
          id: vehicleSnap.id,
          marca: vehicleData.marca || '',
          modelo: vehicleData.modelo || '',
          placa: vehicleData.placa || '',
          color: vehicleData.color || '',
          tipo: vehicleData.tipo || ''
        };
      }
      return null;
    } catch (error) {
      console.error('Error al obtener vehículo:', error);
      return null;
    }
  }

  // Nuevo método para obtener vehículos de un usuario específico
  static async obtenerVehiculosDeUsuario(userId: string): Promise<Vehicle[]> {
    try {
      const vehiclesSnapshot = await getDocs(
        collection(db, USERS_COLLECTION, userId, VEHICLES_SUBCOLLECTION)
      );
      
      const vehicles: Vehicle[] = [];
      vehiclesSnapshot.forEach((vehicleDoc) => {
        const vehicleData = vehicleDoc.data();
        vehicles.push({
          id: vehicleDoc.id,
          marca: vehicleData.marca || '',
          modelo: vehicleData.modelo || '',
          placa: vehicleData.placa || '',
          color: vehicleData.color || '',
          tipo: vehicleData.tipo || ''
        });
      });

      return vehicles;
    } catch (error) {
      console.error('Error al obtener vehículos del usuario:', error);
      return [];
    }
  }

  // Método para calcular el total
  static calcularTotal(
    precioPorHora: number, 
    horaInicio: string, 
    horaFin: string, 
    servicioExtraPrice: number = 0
  ): number {
    try {
      const [inicioHora, inicioMinuto] = horaInicio.split(':').map(Number);
      const [finHora, finMinuto] = horaFin.split(':').map(Number);

      const inicioEnMinutos = inicioHora * 60 + inicioMinuto;
      const finEnMinutos = finHora * 60 + finMinuto;

      let diferenciaMinutos = finEnMinutos - inicioEnMinutos;
      
      // Si la hora de fin es menor, significa que cruza medianoche
      if (diferenciaMinutos < 0) {
        diferenciaMinutos += 24 * 60; // Añadir 24 horas en minutos
      }

      const horas = diferenciaMinutos / 60;
      const costoEstacionamiento = precioPorHora * horas;

      return costoEstacionamiento + servicioExtraPrice;
    } catch (error) {
      console.error('Error al calcular total:', error);
      return 0;
    }
  }

  // Validación
  static validarReservacion(reservation: ReservationInput): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!reservation.parqueoId?.trim()) errores.push('Debe seleccionar un parqueo');
    if (!reservation.uid?.trim()) errores.push('Debe seleccionar un usuario');
    if (!reservation.vehiculoId?.trim()) errores.push('Debe seleccionar un vehículo');
    if (!reservation.fecha) errores.push('La fecha es requerida');
    if (!reservation.horaInicio?.trim()) errores.push('La hora de inicio es requerida');
    if (!reservation.horaFin?.trim()) errores.push('La hora de fin es requerida');
    if (!reservation.metodoPago?.trim()) errores.push('El método de pago es requerido');
    if (reservation.total < 0) errores.push('El total no puede ser negativo');

    // Validar que la hora de fin sea posterior a la de inicio
    if (reservation.horaInicio && reservation.horaFin) {
      const [inicioHora, inicioMinuto] = reservation.horaInicio.split(':').map(Number);
      const [finHora, finMinuto] = reservation.horaFin.split(':').map(Number);
      
      const inicioEnMinutos = inicioHora * 60 + inicioMinuto;
      const finEnMinutos = finHora * 60 + finMinuto;
      
      if (finEnMinutos <= inicioEnMinutos && finEnMinutos !== inicioEnMinutos) {
        // Permitir reservas que crucen medianoche, pero no la misma hora
        if (!(finEnMinutos < inicioEnMinutos)) {
          errores.push('La hora de fin debe ser posterior a la hora de inicio');
        }
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  // Filtros adicionales
  static async obtenerReservacionesPorUsuario(uid: string): Promise<Reservation[]> {
    try {
      const q = query(
        collection(db, RESERVATIONS_COLLECTION), 
        where('uid', '==', uid),
        orderBy('fecha', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const reservations: Reservation[] = [];
      querySnapshot.forEach((doc) => {
        reservations.push({
          id: doc.id,
          ...doc.data()
        } as Reservation);
      });

      return reservations;
    } catch (error) {
      console.error('Error al obtener reservaciones por usuario:', error);
      throw new Error('Error al obtener reservaciones del usuario');
    }
  }

  static async obtenerReservacionesPorParqueo(parqueoId: string): Promise<Reservation[]> {
    try {
      const q = query(
        collection(db, RESERVATIONS_COLLECTION), 
        where('parqueoId', '==', parqueoId),
        orderBy('fecha', 'desc')
      );
      const querySnapshot = await getDocs(q);

      const reservations: Reservation[] = [];
      querySnapshot.forEach((doc) => {
        reservations.push({
          id: doc.id,
          ...doc.data()
        } as Reservation);
      });

      return reservations;
    } catch (error) {
      console.error('Error al obtener reservaciones por parqueo:', error);
      throw new Error('Error al obtener reservaciones del parqueo');
    }
  }
}