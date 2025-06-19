import React, { useState, useEffect, useRef } from "react";
import { Timestamp } from "firebase/firestore";
import { ReservationsService } from "../firebase/reservationsService";
import type {
  Reservation,
  ReservationInput,
  User,
  Parqueo,
  Vehicle,
} from "../firebase/reservationsService";
import "./reservations.css";

interface ReservationsProps {
  onBack: () => void;
}

const ReservationsPanel: React.FC<ReservationsProps> = ({ onBack }) => {
  // Estados principales
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [parqueos, setParqueos] = useState<Parqueo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  // Estados del formulario
  const [formData, setFormData] = useState<ReservationInput>({
    direccion: "",
    estado: "reservado",
    fecha: Timestamp.now(),
    horaFin: "",
    horaInicio: "",
    metodoPago: "",
    parqueoId: "",
    parqueoNombre: "",
    servicioExtra: "",
    total: 0,
    uid: "",
    vehiculoId: "",
  });

  // Estados para mostrar información adicional
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedParqueo, setSelectedParqueo] = useState<Parqueo | null>(null);
  const [selectedServicio, setSelectedServicio] = useState<{
    nombre: string;
    precio: number;
  } | null>(null);

  // Estados de validación y errores
  const [errors, setErrors] = useState<string[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [reservationsData, usersData, parqueosData] = await Promise.all([
          ReservationsService.obtenerReservaciones(),
          ReservationsService.obtenerUsuarios(),
          ReservationsService.obtenerParqueos(),
        ]);

        setReservations(reservationsData);
        setUsers(usersData);
        setParqueos(parqueosData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Suscribirse a cambios en tiempo real
    const unsubscribe = ReservationsService.suscribirseAReservaciones(
      (newReservations) => {
        setReservations(newReservations);
      }
    );

    return () => unsubscribe();
  }, []);

  // Actualizar información del usuario cuando cambia uid
  useEffect(() => {
    if (formData.uid) {
      const user = users.find((u) => u.id === formData.uid);
      setSelectedUser(user || null);

      // Limpiar vehículo seleccionado cuando cambia el usuario
      setSelectedVehicle(null);
      setFormData((prev) => ({ ...prev, vehiculoId: "" })); // ✅ CORREGIDO: vehiculoId en lugar de vehicleId
    } else {
      setSelectedUser(null);
      setSelectedVehicle(null);
    }
  }, [formData.uid, users]);

  // Actualizar información del vehículo cuando cambia vehiculoId
  useEffect(() => {
    if (formData.vehiculoId && selectedUser) {
      const vehicle = selectedUser.vehicles?.find(
        (v) => v.id === formData.vehiculoId
      );
      setSelectedVehicle(vehicle || null);
    } else {
      setSelectedVehicle(null);
    }
  }, [formData.vehiculoId, selectedUser]); // ✅ CORREGIDO: dependencias correctas

  // Actualizar información del parqueo cuando cambia parqueoId
  useEffect(() => {
    if (formData.parqueoId) {
      const parqueo = parqueos.find((p) => p.id === formData.parqueoId);
      setSelectedParqueo(parqueo || null);

      if (parqueo) {
        setFormData((prev) => ({
          ...prev,
          parqueoNombre: parqueo.nombre,
          direccion: parqueo.direccion,
        }));
      }

      // Limpiar servicio extra cuando cambia el parqueo
      setSelectedServicio(null);
      setFormData((prev) => ({ ...prev, servicioExtra: "" }));
    } else {
      setSelectedParqueo(null);
      setSelectedServicio(null);
    }
  }, [formData.parqueoId, parqueos]);

  // Actualizar servicio extra cuando cambia la selección
  useEffect(() => {
    if (formData.servicioExtra && selectedParqueo) {
      const servicio = selectedParqueo.servicios.find(
        (s) => s.nombre === formData.servicioExtra
      );
      setSelectedServicio(servicio || null);
    } else {
      setSelectedServicio(null);
    }
  }, [formData.servicioExtra, selectedParqueo]); // ✅ CORREGIDO: dependencias correctas

  // Calcular total automáticamente
  useEffect(() => {
    if (selectedParqueo && formData.horaInicio && formData.horaFin) {
      const servicioPrice = selectedServicio ? selectedServicio.precio : 0;
      const total = ReservationsService.calcularTotal(
        selectedParqueo.precioPorHora,
        formData.horaInicio,
        formData.horaFin,
        servicioPrice
      );

      setFormData((prev) => ({ ...prev, total }));
    }
  }, [
    selectedParqueo,
    formData.horaInicio,
    formData.horaFin,
    selectedServicio,
  ]);

  // Manejar cambios en el formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "fecha") {
      const dateValue = new Date(value);
      setFormData((prev) => ({
        ...prev,
        [name]: Timestamp.fromDate(dateValue),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Calcular desglose de costos
  const getCostBreakdown = () => {
    if (!selectedParqueo || !formData.horaInicio || !formData.horaFin) {
      return null;
    }

    const [inicioHora, inicioMinuto] = formData.horaInicio
      .split(":")
      .map(Number);
    const [finHora, finMinuto] = formData.horaFin.split(":").map(Number);

    const inicioEnMinutos = inicioHora * 60 + inicioMinuto;
    const finEnMinutos = finHora * 60 + finMinuto;

    let diferenciaMinutos = finEnMinutos - inicioEnMinutos;
    if (diferenciaMinutos < 0) {
      diferenciaMinutos += 24 * 60;
    }

    const horas = diferenciaMinutos / 60;
    const costoEstacionamiento = selectedParqueo.precioPorHora * horas;
    const servicioExtraPrice = selectedServicio ? selectedServicio.precio : 0;

    return {
      horas: horas.toFixed(2),
      precioPorHora: selectedParqueo.precioPorHora,
      costoEstacionamiento,
      servicioExtra: selectedServicio ? selectedServicio.nombre : null,
      servicioExtraPrice,
      total: costoEstacionamiento + servicioExtraPrice,
    };
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar formulario
    const validation = ReservationsService.validarReservacion(formData);
    if (!validation.valido) {
      setErrors(validation.errores);
      return;
    }

    setErrors([]);
    setSubmitting(true);

    try {
      if (editingId) {
        await ReservationsService.actualizarReservacion(editingId, formData);
        setEditingId(null);
      } else {
        await ReservationsService.crearReservacion(formData);
      }

      // Limpiar formulario
      resetForm();
    } catch (error) {
      console.error("Error:", error);
      setErrors(["Error al guardar la reservación"]);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditingRef = useRef(false);

  // Efecto para manejar cambios en uid (usuario)
  useEffect(() => {
    if (formData.uid) {
      const user = users.find((u) => u.id === formData.uid);
      setSelectedUser(user || null);

      // ✅ Evitar limpiar si se está editando
      if (!isEditingRef.current) {
        setSelectedVehicle(null);
        setFormData((prev) => ({ ...prev, vehiculoId: "" }));
      }
    } else {
      setSelectedUser(null);
      setSelectedVehicle(null);
    }
  }, [formData.uid, users, isEditingRef]);

  // Efecto para manejar cambios en vehiculoId (vehículo)
  useEffect(() => {
    if (formData.vehiculoId && selectedUser) {
      const vehicle = selectedUser.vehicles?.find(
        (v) => v.id === formData.vehiculoId
      );
      setSelectedVehicle(vehicle || null);
      if (!isEditingRef.current) {
        setSelectedVehicle(null);
        setFormData((prev) => ({ ...prev, vehiculoId: "" }));
      }
    } else if (!formData.vehiculoId) {
      setSelectedVehicle(null);
    }
  }, [formData.vehiculoId, isEditingRef, selectedUser]);

  // Efecto para manejar cambios en parqueoId (parqueo)
  useEffect(() => {
    if (formData.parqueoId) {
      const parqueo = parqueos.find((p) => p.id === formData.parqueoId);
      setSelectedParqueo(parqueo || null);

      if (parqueo) {
        setFormData((prev) => ({
          ...prev,
          parqueoNombre: prev.parqueoNombre || parqueo.nombre,
          direccion: prev.direccion || parqueo.direccion,
        }));
      }
      if (!isEditingRef.current) {
        setSelectedServicio(null);
        setFormData((prev) => ({ ...prev, servicioExtra: "" }));
      }
    } else {
      setSelectedParqueo(null);
      setSelectedServicio(null);
    }
  }, [formData.parqueoId, parqueos, isEditingRef]);

  // Efecto para manejar cambios en servicioExtra
  useEffect(() => {
    if (formData.servicioExtra && selectedParqueo) {
      const servicio = selectedParqueo.servicios.find(
        (s) => s.nombre === formData.servicioExtra
      );
      setSelectedServicio(servicio || null);
      if (!isEditingRef.current) {
        setSelectedServicio(null);
        setFormData((prev) => ({ ...prev, servicioExtra: "" }));
      }
    } else if (!formData.servicioExtra) {
      setSelectedServicio(null);
    }
  }, [formData.servicioExtra, isEditingRef, selectedParqueo]);

  // Efecto para calcular total automáticamente
  useEffect(() => {
    if (selectedParqueo && formData.horaInicio && formData.horaFin) {
      const servicioPrice = selectedServicio ? selectedServicio.precio : 0;
      const total = ReservationsService.calcularTotal(
        selectedParqueo.precioPorHora,
        formData.horaInicio,
        formData.horaFin,
        servicioPrice
      );

      setFormData((prev) => ({ ...prev, total }));
    }
  }, [
    selectedParqueo,
    formData.horaInicio,
    formData.horaFin,
    selectedServicio,
  ]);

  // 2. Función handleEdit completamente reescrita:
  const handleEdit = async (id: string) => {
    try {
      const reservation = await ReservationsService.obtenerReservacionPorId(id);
      if (!reservation) return;

      isEditingRef.current = true;
      setEditingId(id);
      setErrors([]);

      const user = users.find((u) => u.id === reservation.uid);
      const parqueo = parqueos.find((p) => p.id === reservation.parqueoId);

      setFormData({
        direccion: reservation.direccion || "",
        estado: reservation.estado || "reservado",
        fecha: reservation.fecha,
        horaFin: reservation.horaFin || "",
        horaInicio: reservation.horaInicio || "",
        metodoPago: reservation.metodoPago || "",
        parqueoId: reservation.parqueoId || "",
        parqueoNombre: reservation.parqueoNombre || "",
        servicioExtra: reservation.servicioExtra || "",
        total: reservation.total || 0,
        uid: reservation.uid || "",
        vehiculoId: reservation.vehiculoId || "",
      });

      // 1. Aseguramos usuario seleccionado
      if (user) {
        setSelectedUser(user);
        const vehicle = user.vehicles?.find(
          (v) => v.id === reservation.vehiculoId
        );
        setSelectedVehicle(vehicle || null);
      }

      // 2. Aseguramos parqueo seleccionado
      if (parqueo) {
        setSelectedParqueo(parqueo);
        const servicio = parqueo.servicios.find(
          (s) => s.nombre === reservation.servicioExtra
        );
        setSelectedServicio(servicio || null);
      }
    } catch (error) {
      console.error("Error al cargar reservación:", error);
      setErrors(["Error al cargar la reservación para editar"]);
    }
  };

  // 3. Función resetForm actualizada:
  const resetForm = () => {
    isEditingRef.current = false;
    setEditingId(null);
    setFormData({
      direccion: "",
      estado: "reservado",
      fecha: Timestamp.now(),
      horaFin: "",
      horaInicio: "",
      metodoPago: "",
      parqueoId: "",
      parqueoNombre: "",
      servicioExtra: "",
      total: 0,
      uid: "",
      vehiculoId: "",
    });
    setSelectedUser(null);
    setSelectedVehicle(null);
    setSelectedParqueo(null);
    setSelectedServicio(null);
    setErrors([]);
  };
  // Manejar eliminación
  const handleDelete = async (id: string) => {
    if (window.confirm("¿Está seguro de eliminar esta reservación?")) {
      try {
        await ReservationsService.eliminarReservacion(id);
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  // Toggle expansión de elementos
  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Formatear fecha para input
  const formatDateForInput = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toISOString().split("T")[0];
  };

  // Obtener vehículos del usuario seleccionado
  const getAvailableVehicles = (): Vehicle[] => {
    return selectedUser?.vehicles || [];
  };

  // Obtener métodos de pago del parqueo seleccionado
  const getAvailablePaymentMethods = (): string[] => {
    return selectedParqueo?.metodosPago.map((m) => m.nombre) || [];
  };

  // Obtener servicios extra del parqueo seleccionado
  const getAvailableServices = (): { nombre: string; precio: number }[] => {
    return selectedParqueo?.servicios || [];
  };

  const costBreakdown = getCostBreakdown();

  if (loading) {
    return (
      <div className="reservations-panel">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="reservations-panel">
      <div className="header">
        <button className="back-button" onClick={onBack}>
          ← Volver
        </button>
        <h1>Gestión de Reservaciones</h1>
      </div>

      <div className="content">
        {/* Formulario */}
        <div className="form-section">
          <h2>{editingId ? "Editar Reservación" : "Nueva Reservación"}</h2>

          {errors.length > 0 && (
            <div className="error-message">
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form className="reservation-form" onSubmit={handleSubmit}>
            {/* Selección de Usuario */}
            <div className="form-group">
              <label htmlFor="uid">Usuario</label>
              <select
                id="uid"
                name="uid"
                value={formData.uid}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar usuario</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.nombres} {user.apellidos} - {user.email}
                  </option>
                ))}
              </select>
              {selectedUser && (
                <div className="user-info-display">
                  <strong>Usuario:</strong> {selectedUser.nombres}{" "}
                  {selectedUser.apellidos}
                  <br />
                  <strong>Email:</strong> {selectedUser.email}
                  <br />
                  {selectedUser.telefono && (
                    <>
                      <strong>Teléfono:</strong> {selectedUser.telefono}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Selección de Vehículo */}
            <div className="form-group">
              <label htmlFor="vehiculoId">Vehículo</label>
              <select
                id="vehiculoId"
                name="vehiculoId"
                value={formData.vehiculoId}
                onChange={handleInputChange}
                required
                disabled={!selectedUser}
              >
                <option value="">Seleccionar vehículo</option>
                {getAvailableVehicles().map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.marca} {vehicle.modelo} - {vehicle.placa}
                  </option>
                ))}
              </select>
              {selectedVehicle && (
                <div className="vehicle-info-display">
                  <strong>Vehículo:</strong> {selectedVehicle.marca}{" "}
                  {selectedVehicle.modelo}
                  <br />
                  <strong>Placa:</strong> {selectedVehicle.placa}
                  <br />
                  <strong>Color:</strong> {selectedVehicle.color}
                  <br />
                  <strong>Tipo:</strong> {selectedVehicle.tipo}
                </div>
              )}
            </div>

            {/* Selección de Parqueo */}
            <div className="form-group">
              <label htmlFor="parqueoId">Parqueo</label>
              <select
                id="parqueoId"
                name="parqueoId"
                value={formData.parqueoId}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar parqueo</option>
                {parqueos.map((parqueo) => (
                  <option key={parqueo.id} value={parqueo.id}>
                    {parqueo.nombre} - Bs{parqueo.precioPorHora}/hora
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha y Horarios */}
            <div className="form-group">
              <label htmlFor="fecha">Fecha</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formatDateForInput(formData.fecha)}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="horaInicio">Hora Inicio</label>
                <input
                  type="time"
                  id="horaInicio"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="horaFin">Hora Fin</label>
                <input
                  type="time"
                  id="horaFin"
                  name="horaFin"
                  value={formData.horaFin}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Servicio Extra */}
            <div className="form-group">
              <label htmlFor="servicioExtra">Servicio Extra (Opcional)</label>
              <select
                id="servicioExtra"
                name="servicioExtra"
                value={formData.servicioExtra}
                onChange={handleInputChange}
                disabled={!selectedParqueo}
              >
                <option value="">Sin servicio extra</option>
                {getAvailableServices().map((servicio, index) => (
                  <option key={index} value={servicio.nombre}>
                    {servicio.nombre} - Bs{servicio.precio}
                  </option>
                ))}
              </select>
            </div>

            {/* Método de Pago */}
            <div className="form-group">
              <label htmlFor="metodoPago">Método de Pago</label>
              <select
                id="metodoPago"
                name="metodoPago"
                value={formData.metodoPago}
                onChange={handleInputChange}
                required
                disabled={!selectedParqueo}
              >
                <option value="">Seleccionar método</option>
                {getAvailablePaymentMethods().map((metodo, index) => (
                  <option key={index} value={metodo}>
                    {metodo}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
                required
              >
                <option value="reservado">Reservado</option>
                <option value="confirmada">Confirmada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            {/* Desglose de Costos */}
            {costBreakdown && (
              <div className="total-breakdown">
                <div>
                  <span>Horas de estacionamiento:</span>
                  <span>{costBreakdown.horas}h</span>
                </div>
                <div>
                  <span>Precio por hora:</span>
                  <span>Bs{costBreakdown.precioPorHora}</span>
                </div>
                <div>
                  <span>Subtotal estacionamiento:</span>
                  <span>Bs{costBreakdown.costoEstacionamiento.toFixed(2)}</span>
                </div>
                {costBreakdown.servicioExtra && (
                  <div>
                    <span>Servicio extra ({costBreakdown.servicioExtra}):</span>
                    <span>Bs{costBreakdown.servicioExtraPrice}</span>
                  </div>
                )}
                <div className="total-line">
                  <span>Total:</span>
                  <span>Bs{costBreakdown.total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Total Display */}
            <div className="total-display">
              Total: Bs{formData.total.toFixed(2)}
            </div>

            {/* Botones */}
            <div className="form-buttons">
              <button
                type="submit"
                className="submit-btn"
                disabled={submitting}
              >
                {submitting
                  ? "Guardando..."
                  : editingId
                  ? "Actualizar"
                  : "Crear Reservación"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetForm}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de Reservaciones */}
        <div className="list-section">
          <h2>Reservaciones Existentes</h2>

          <div className="reservations-list">
            {reservations.length === 0 ? (
              <div className="no-data">No hay reservaciones registradas</div>
            ) : (
              reservations.map((reservation) => (
                <div key={reservation.id} className="reservation-item">
                  <div
                    className="reservation-header"
                    onClick={() => toggleExpand(reservation.id)}
                  >
                    <div>
                      <h3>{reservation.parqueoNombre}</h3>
                      <div className="reservation-date">
                        {reservation.fecha.toDate().toLocaleDateString()} -{" "}
                        {reservation.horaInicio} a {reservation.horaFin}
                      </div>
                      <span
                        className={`estado-badge estado-${reservation.estado}`}
                      >
                        {reservation.estado}
                      </span>
                    </div>
                    <div className="reservation-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(reservation.id);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(reservation.id);
                        }}
                      >
                        Eliminar
                      </button>
                      <span className="expand-icon">
                        {expandedItems.has(reservation.id) ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>

                  {expandedItems.has(reservation.id) && (
                    <div className="reservation-details">
                      <div className="detail-section">
                        <h4>Información General</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="label">Total</span>
                            <span className="value">
                              Bs{reservation.total.toFixed(2)}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Método de Pago</span>
                            <span className="value">
                              {reservation.metodoPago}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Dirección</span>
                            <span className="value">
                              {reservation.direccion}
                            </span>
                          </div>
                          {reservation.servicioExtra && (
                            <div className="detail-item">
                              <span className="label">Servicio Extra</span>
                              <span className="value">
                                {reservation.servicioExtra}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="detail-section">
                        <h4>Usuario y Vehículo</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="label">ID Usuario</span>
                            <span className="value">{reservation.uid}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">ID Vehículo</span>
                            <span className="value">
                              {reservation.vehiculoId}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="detail-section">
                        <h4>Fechas</h4>
                        <div className="detail-grid">
                          <div className="detail-item">
                            <span className="label">Creado</span>
                            <span className="value">
                              {reservation.creadoEn.toDate().toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationsPanel;
