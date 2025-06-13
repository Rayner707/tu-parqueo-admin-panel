import React, { useState } from 'react';
import './reservations.css';

interface Reservacion {
  id: string;
  creadoEn: string;
  direccion: string;
  estado: string;
  fecha: string;
  horaFin: string;
  horaInicio: string;
  metodoPago: string;
  parqueoId: string;
  parqueoNombre: string;
  servicioExtra: string | null;
  total: number;
}

interface ReservationsPanelProps {
  onBack: () => void;
}

const ReservationsPanel: React.FC<ReservationsPanelProps> = ({ onBack }) => {
  const [reservaciones, setReservaciones] = useState<Reservacion[]>([]);
  const [selectedReservacion, setSelectedReservacion] = useState<Reservacion | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const getInitialFormData = (): Omit<Reservacion, 'id'> => ({
    creadoEn: new Date().toISOString(),
    direccion: '',
    estado: 'pendiente',
    fecha: '',
    horaFin: '',
    horaInicio: '',
    metodoPago: 'Efectivo',
    parqueoId: '',
    parqueoNombre: '',
    servicioExtra: null,
    total: 0
  });

  const [formData, setFormData] = useState<Omit<Reservacion, 'id'>>(getInitialFormData());

  const handleGoBack = () => {
    onBack();
  };

  const handleInputChange = (field: string, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setSelectedReservacion(null);
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && selectedReservacion) {
      setReservaciones(prev => prev.map(r => 
        r.id === selectedReservacion.id 
          ? { 
              ...formData, 
              id: selectedReservacion.id,
              parqueoId: selectedReservacion.parqueoId // Mantener parqueoId original
            }
          : r
      ));
    } else {
      const newReservacion: Reservacion = {
        ...formData,
        id: Date.now().toString(),
        creadoEn: new Date().toISOString()
      };
      setReservaciones(prev => [...prev, newReservacion]);
    }
    
    resetForm();
  };

  const handleEdit = (reservacion: Reservacion) => {
    setSelectedReservacion(reservacion);
    setFormData({
      creadoEn: reservacion.creadoEn,
      direccion: reservacion.direccion,
      estado: reservacion.estado,
      fecha: reservacion.fecha,
      horaFin: reservacion.horaFin,
      horaInicio: reservacion.horaInicio,
      metodoPago: reservacion.metodoPago,
      parqueoId: reservacion.parqueoId,
      parqueoNombre: reservacion.parqueoNombre,
      servicioExtra: reservacion.servicioExtra,
      total: reservacion.total
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setReservaciones(prev => prev.filter(r => r.id !== id));
    if (selectedReservacion?.id === id) {
      resetForm();
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return '#28a745';
      case 'cancelada': return '#dc3545';
      case 'completada': return '#6f42c1';
      case 'reservado': return '#17a2b8';
      default: return '#ffc107';
    }
  };

  return (
    <div className="reservations-panel">
      <div className="header">
        <button className="back-button" onClick={handleGoBack}>
          ← Volver
        </button>
        <h1>Panel de Reservaciones</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className='content'>
        <div className="form-section">
          <h2>{isEditing ? 'Actualizar Reservación' : 'Crear Nueva Reservación'}</h2>
          
          <div onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {!isEditing && (
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Parqueo ID:</label>
                <input
                  type="text"
                  value={formData.parqueoId}
                  onChange={(e) => handleInputChange('parqueoId', e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px'
                  }}
                  placeholder="ID del parqueo"
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre del Parqueo:</label>
              <input
                type="text"
                value={formData.parqueoNombre}
                onChange={(e) => handleInputChange('parqueoNombre', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                placeholder="Nombre del parqueo"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Dirección:</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                placeholder="Dirección del parqueo"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Estado:</label>
              <select
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="reservado">Reservado</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha:</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => handleInputChange('fecha', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora Inicio:</label>
                <input
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => handleInputChange('horaInicio', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora Fin:</label>
                <input
                  type="time"
                  value={formData.horaFin}
                  onChange={(e) => handleInputChange('horaFin', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Método de Pago:</label>
              <select
                value={formData.metodoPago}
                onChange={(e) => handleInputChange('metodoPago', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="QR">QR</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Servicio Extra:</label>
              <input
                type="text"
                value={formData.servicioExtra || ''}
                onChange={(e) => handleInputChange('servicioExtra', e.target.value || null)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                placeholder="Servicio adicional (opcional)"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Total (Bs):</label>
              <input
                type="number"
                step="0.01"
                value={formData.total}
                onChange={(e) => handleInputChange('total', parseFloat(e.target.value) || 0)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                placeholder="0.00"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={handleSubmit}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                {isEditing ? 'Actualizar' : 'Crear'} Reservación
              </button>
              {isEditing && (
                <button 
                  onClick={resetForm}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="list-section">
          <h2>Reservaciones Registradas</h2>
          <div className="reservations-list">
            {reservaciones.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
                No hay reservaciones registradas
              </p>
            ) : (
              reservaciones.map(reservacion => (
                <div key={reservacion.id} style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  marginBottom: '15px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div 
                    onClick={() => toggleExpanded(reservacion.id)}
                    style={{
                      padding: '15px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px 8px 0 0'
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, color: '#333' }}>{reservacion.parqueoNombre}</h3>
                      <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#666' }}>
                        {reservacion.fecha} - {reservacion.horaInicio} a {reservacion.horaFin}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span 
                        style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          color: 'white',
                          backgroundColor: getEstadoColor(reservacion.estado)
                        }}
                      >
                        {reservacion.estado.toUpperCase()}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(reservacion); }}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(reservacion.id); }}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Eliminar
                      </button>
                      <span style={{ fontSize: '14px', color: '#666' }}>
                        {expandedItems.has(reservacion.id) ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  
                  {expandedItems.has(reservacion.id) && (
                    <div style={{ padding: '15px' }}>
                      <p><strong>ID:</strong> {reservacion.id}</p>
                      <p><strong>Dirección:</strong> {reservacion.direccion}</p>
                      <p><strong>Método de Pago:</strong> {reservacion.metodoPago}</p>
                      <p><strong>Total:</strong> Bs{reservacion.total.toFixed(2)}</p>
                      <p><strong>Creado:</strong> {formatDate(reservacion.creadoEn)}</p>
                      {reservacion.servicioExtra && (
                        <p><strong>Servicio Extra:</strong> {reservacion.servicioExtra}</p>
                      )}
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

const ReservationsModule = ReservationsPanel;
export default ReservationsModule;