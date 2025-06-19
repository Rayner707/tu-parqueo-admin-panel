import React, { useState, useEffect } from 'react';
import './parqueos.css';
import { ParqueosService } from '../firebase/parqueosService';
import type { ParqueoInput, Parqueo } from '../firebase/parqueosService';

interface ParqueosPanelProps {
  onBack: () => void;
}

const ParqueosPanel: React.FC<ParqueosPanelProps> = ({ onBack }) => {
  const [parqueos, setParqueos] = useState<Parqueo[]>([]);
  const [selectedParqueo, setSelectedParqueo] = useState<Parqueo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const getInitialFormData = (): ParqueoInput => ({
    direccion: '',
    disponibles: 0,
    etiqueta: '',
    horarios: [{ dia: 'Lunes', inicio: '', fin: '' }],
    metodosPago: [{ nombre: 'Efectivo'}],
    nombre: '',
    planes: [{ label: '', precio: 0 }],
    precioPorHora: 0,
    servicios: [{ nombre: '', precio: 0 }],
    ubicacion: { lat: 0, lng: 0 }
  });

  const [formData, setFormData] = useState<ParqueoInput>(getInitialFormData());

  useEffect(() => {
    const unsuscribe = ParqueosService.suscribirseAParqueos((data) => {
      setParqueos(data);
    });

    return () => unsuscribe();
  }, []);

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHorarioChange = (index: number, field: keyof Parqueo['horarios'][0], value: string) => {
    setFormData(prev => ({
      ...prev,
      horarios: prev.horarios.map((h, i) => i === index ? { ...h, [field]: value } : h)
    }));
  };

  const addHorario = () => setFormData(prev => ({ ...prev, horarios: [...prev.horarios, { dia: '', inicio: '', fin: '' }] }));
  const removeHorario = (index: number) => setFormData(prev => ({ ...prev, horarios: prev.horarios.filter((_, i) => i !== index) }));

  const handleMetodoPagoChange = (index: number, field: keyof Parqueo['metodosPago'][0], value: string) => {
    setFormData(prev => ({
      ...prev,
      metodosPago: prev.metodosPago.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }));
  };

  const addMetodoPago = () => setFormData(prev => ({ ...prev, metodosPago: [...prev.metodosPago, { nombre: '' }] }));
  const removeMetodoPago = (index: number) => setFormData(prev => ({ ...prev, metodosPago: prev.metodosPago.filter((_, i) => i !== index) }));

  const handlePlanChange = (index: number, field: keyof Parqueo['planes'][0], value: string | number) => {
    setFormData(prev => ({
      ...prev,
      planes: prev.planes.map((p, i) => i === index ? { ...p, [field]: value } : p)
    }));
  };

  const addPlan = () => setFormData(prev => ({ ...prev, planes: [...prev.planes, { label: '', precio: 0 }] }));
  const removePlan = (index: number) => setFormData(prev => ({ ...prev, planes: prev.planes.filter((_, i) => i !== index) }));

  const handleServicioChange = (index: number, field: keyof Parqueo['servicios'][0], value: string | number) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios.map((s, i) => i === index ? { ...s, [field]: value } : s)
    }));
  };

  const addServicio = () => setFormData(prev => ({ ...prev, servicios: [...prev.servicios, { nombre: '', precio: 0 }] }));
  const removeServicio = (index: number) => setFormData(prev => ({ ...prev, servicios: prev.servicios.filter((_, i) => i !== index) }));

  const resetForm = () => {
    setFormData(getInitialFormData());
    setSelectedParqueo(null);
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { valido, errores } = ParqueosService.validarParqueo(formData);
    if (!valido) return alert(errores.join(''));

    try {
      const horariosAgrupados: Record<string, { inicio: string; fin: string }> = {};
      formData.horarios.forEach(({ dia, inicio, fin }) => {
        if (dia?.trim()) horariosAgrupados[dia] = { inicio, fin };
      });
      if (isEditing && selectedParqueo) {
        const horariosAgrupados: Record<string, { inicio: string; fin: string }> = {};
        formData.horarios.forEach(({ dia, inicio, fin }) => {
          if (dia) horariosAgrupados[dia] = { inicio, fin };
        });
        const payload = { ...formData, horarios: horariosAgrupados };
        await ParqueosService.actualizarParqueo(selectedParqueo.id, payload as unknown as ParqueoInput);
      } else {
        const horariosAgrupados: Record<string, { inicio: string; fin: string }> = {};
      formData.horarios.forEach(({ dia, inicio, fin }) => {
        if (dia) horariosAgrupados[dia] = { inicio, fin };
      });
      const payload = { ...formData, horarios: horariosAgrupados };
        await ParqueosService.crearParqueo(payload as unknown as ParqueoInput);
      }
      resetForm();
    } catch (error) {
      console.error('Error al guardar parqueo:', error);
      alert('Ocurrió un error al guardar el parqueo.');
    }
  };

  const handleEdit = (parqueo: Parqueo) => {
    setSelectedParqueo(parqueo);
    const ubicacionValida = typeof parqueo.ubicacion === 'object' && parqueo.ubicacion !== null && 'lat' in parqueo.ubicacion && 'lng' in parqueo.ubicacion;
    setFormData({
      direccion: parqueo.direccion || '',
      disponibles: parqueo.disponibles || 0,
      etiqueta: parqueo.etiqueta || '',
      horarios: Array.isArray(parqueo.horarios) ? parqueo.horarios : [],
      metodosPago: Array.isArray(parqueo.metodosPago) ? parqueo.metodosPago : [],
      nombre: parqueo.nombre || '',
      planes: Array.isArray(parqueo.planes) ? parqueo.planes : [],
      precioPorHora: parqueo.precioPorHora || 0,
      servicios: Array.isArray(parqueo.servicios) ? parqueo.servicios : [],
      ubicacion: ubicacionValida ? parqueo.ubicacion : { lat: 0, lng: 0 }
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este parqueo?')) return;
    try {
      await ParqueosService.eliminarParqueo(id);
      if (selectedParqueo?.id === id) resetForm();
    } catch (error) {
      console.error('Error al eliminar parqueo:', error);
      alert('Ocurrió un error al eliminar el parqueo.');
    }
  };

  const toggleExpanded = (id: string) => {
  const parqueo = parqueos.find(p => p.id === id);
  if (!parqueo) return;

  // Normalizar campos si están incompletos (prevención de errores visuales)
    if (typeof parqueo.horarios === 'object' && !Array.isArray(parqueo.horarios)) {
      const diasOrdenados = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
      const horariosObj = parqueo.horarios as Record<string, { inicio: string; fin: string }>;
      parqueo.horarios = diasOrdenados
        .filter(dia => Object.prototype.hasOwnProperty.call(horariosObj, dia))
        .map(dia => {
          const entry = horariosObj[dia];
          return { dia, ...entry };
        });
    } else if (!Array.isArray(parqueo.horarios)) {
      parqueo.horarios = [];
    }
    parqueo.metodosPago = Array.isArray(parqueo.metodosPago) ? parqueo.metodosPago : [];
    parqueo.planes = Array.isArray(parqueo.planes) ? parqueo.planes : [];
    parqueo.servicios = Array.isArray(parqueo.servicios) ? parqueo.servicios : [];


  setParqueos(prev =>
  prev.map(p => (p.id === id ? { ...parqueo } : p))
  );

  setExpandedItems(prev => {
    const newSet = new Set(prev);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    return newSet;
  });
};


  const handleGoBack = () => onBack();

  return (
    <div>
      {
        <div className="parqueos-panel">
      <div className="header">
        <button className="back-button" onClick={handleGoBack}>
          ← Volver
        </button>
        <h1>Bienvenido al Panel de Parqueos</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }} className='content'>
        <div className="form-section">
          <h2>{isEditing ? 'Actualizar Parqueo' : 'Crear Nuevo Parqueo'}</h2>
          
          <div onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nombre:</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Dirección:</label>
              <input
                type="text"
                value={formData.direccion}
                onChange={(e) => handleInputChange('direccion', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Latitud:</label>
  <input
    type="text"
    value={`${Math.abs(formData.ubicacion.lat).toFixed(8)}° ${formData.ubicacion.lat < 0 ? 'S' : 'N'}`}
    onChange={(e) => {
      const parsed = parseFloat(e.target.value);
      setFormData(prev => ({
        ...prev,
        ubicacion: {
          ...prev.ubicacion,
          lat: isNaN(parsed) ? prev.ubicacion.lat : parsed
        }
      }));
    }}
    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
  />
</div>

<div>
  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Longitud:</label>
  <input
    type="text"
    value={`${Math.abs(formData.ubicacion.lng).toFixed(8)}° ${formData.ubicacion.lng < 0 ? 'W' : 'E'}`}
    onChange={(e) => {
      const parsed = parseFloat(e.target.value);
      setFormData(prev => ({
        ...prev,
        ubicacion: {
          ...prev.ubicacion,
          lng: isNaN(parsed) ? prev.ubicacion.lng : parsed
        }
      }));
    }}
    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
  />
</div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Disponibles:</label>
              <input
                type="number"
                value={formData.disponibles}
                onChange={(e) => handleInputChange('disponibles', parseInt(e.target.value) || 0)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Etiqueta:</label>
              <input
                type="text"
                value={formData.etiqueta}
                onChange={(e) => handleInputChange('etiqueta', e.target.value)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Precio por Hora:</label>
              <input
                type="number"
                value={formData.precioPorHora}
                onChange={(e) => handleInputChange('precioPorHora', parseFloat(e.target.value) || 0)}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            </div>

            {/* Sección de Horarios */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }} className="horarios-grid">
                <h3 style={{ margin: 0, color: '#495057' }} className="form-section-title">Horarios:</h3>
                <button
                  type="button"
                  onClick={addHorario}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  + Agregar Horario
                </button>
              </div>
              {formData.horarios.map((horario, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  alignItems: 'center', 
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <input
                    type="text"
                    placeholder="Día"
                    value={horario.dia}
                    onChange={(e) => handleHorarioChange(index, 'dia', e.target.value)}
                    style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="time"
                    value={horario.inicio}
                    onChange={(e) => handleHorarioChange(index, 'inicio', e.target.value)}
                    style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="time"
                    value={horario.fin}
                    onChange={(e) => handleHorarioChange(index, 'fin', e.target.value)}
                    style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  {formData.horarios.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeHorario(index)}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Sección de Métodos de Pago */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }} className="metodos-pago">
                <h3 style={{ margin: 0, color: '#495057' }} className="form-section-title">Métodos de Pago:</h3>
                <button
                  type="button"
                  onClick={addMetodoPago}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  + Agregar Método
                </button>
              </div>
              {formData.metodosPago.map((metodo, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  alignItems: 'center', 
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <input
                    type="text"
                    placeholder="Nombre del método"
                    value={metodo.nombre}
                    onChange={(e) => handleMetodoPagoChange(index, 'nombre', e.target.value)}
                    style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  {formData.metodosPago.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMetodoPago(index)}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Sección de Planes */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }} className="plan-group">
                <h3 style={{ margin: 0, color: '#495057' }} className="form-section-title">Planes:</h3>
                <button
                  type="button"
                  onClick={addPlan}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  + Agregar Plan
                </button>
              </div>
              {formData.planes.map((plan, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  alignItems: 'center', 
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <input
                    type="text"
                    placeholder="Rango"
                    value={plan.label}
                    onChange={(e) => handlePlanChange(index, 'label', e.target.value)}
                    style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={plan.precio}
                    onChange={(e) => handlePlanChange(index, 'precio', parseFloat(e.target.value) || 0)}
                    style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  {formData.planes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlan(index)}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Sección de Servicios */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }} className="servicio-group">
                <h3 style={{ margin: 0, color: '#495057' }} className="form-section-title">Servicios:</h3>
                <button
                  type="button"
                  onClick={addServicio}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  + Agregar Servicio
                </button>
              </div>
              {formData.servicios.map((servicio, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  alignItems: 'center', 
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={servicio.nombre}
                    onChange={(e) => handleServicioChange(index, 'nombre', e.target.value)}
                    style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  <input
                    type="number"
                    placeholder="Precio"
                    value={servicio.precio}
                    onChange={(e) => handleServicioChange(index, 'precio', parseFloat(e.target.value) || 0)}
                    style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                  {formData.servicios.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeServicio(index)}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
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
                {isEditing ? 'Actualizar' : 'Crear'} Parqueo
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
          <h2>Parqueos Registrados</h2>
          <div className="parqueos-list">
            {parqueos.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
                No hay parqueos registrados
              </p>
            ) : (
              parqueos.map(parqueo => (
                <div key={parqueo.id} style={{ 
                  border: '1px solid #ddd', 
                  borderRadius: '8px', 
                  marginBottom: '15px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div 
                    onClick={() => toggleExpanded(parqueo.id)}
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
                    <h3 style={{ margin: 0, color: '#333' }}>{parqueo.nombre}</h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(parqueo); }}
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
                        onClick={(e) => { e.stopPropagation(); handleDelete(parqueo.id); }}
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
                        {expandedItems.has(parqueo.id) ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  
                  {expandedItems.has(parqueo.id) && (
                    <div style={{ padding: '15px' }}>
  <p><strong>Dirección:</strong> {parqueo.direccion}</p>

  <p>
  <strong>Ubicación (GeoPoint):</strong><br />
  <span style={{ display: 'inline-block', marginLeft: '10px' }}>
    {`${Math.abs(parqueo.ubicacion.lat).toFixed(6)}° ${parqueo.ubicacion.lat >= 0 ? 'N' : 'S'}, `}
    {`${Math.abs(parqueo.ubicacion.lng).toFixed(6)}° ${parqueo.ubicacion.lng >= 0 ? 'E' : 'W'}`}
    <br />
    <a
      href={`https://www.google.com/maps?q=${parqueo.ubicacion.lat},${parqueo.ubicacion.lng}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-block',
        marginTop: '8px',
        padding: '6px 12px',
        backgroundColor: '#4285F4',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        fontSize: '14px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'background-color 0.3s ease'
      }}
      onMouseOver={e => (e.currentTarget.style.backgroundColor = '#357ae8')}
      onMouseOut={e => (e.currentTarget.style.backgroundColor = '#4285F4')}
    >
      📍 Ver en Google Maps
    </a>
  </span>
</p>

  <p><strong>Disponibles:</strong> {parqueo.disponibles}</p>
  <p><strong>Etiqueta:</strong> {parqueo.etiqueta}</p>
  <p><strong>Precio por Hora:</strong> Bs{parqueo.precioPorHora}</p>

  <div style={{ marginTop: '15px' }}>
    <strong>Horarios:</strong>
    <ul>
      {(Array.isArray(parqueo.horarios)
        ? parqueo.horarios
          : Object.entries(parqueo.horarios || {}).map(([dia, data]) => ({
        dia,
          inicio: (data as { inicio: string; fin: string }).inicio,
          fin: (data as { inicio: string; fin: string }).fin,
        }))
        ).map((h, index) => (
        <li key={index}>
          {h.dia}: {h.inicio} - {h.fin}
        </li>
      ))}
    </ul>
  </div>

  <div style={{ marginTop: '15px' }}>
    <strong>Métodos de Pago:</strong>
    <ul style={{ marginTop: '5px' }}>
      {parqueo.metodosPago.map((metodo, index) => (
        <li key={index}>{metodo.nombre}</li>
      ))}
    </ul>
  </div>

  <div style={{ marginTop: '15px' }}>
    <strong>Planes:</strong>
    <ul style={{ marginTop: '5px' }}>
      {parqueo.planes.map((plan, index) => (
        <li key={index}>{plan.label}: Bs{plan.precio}</li>
      ))}
    </ul>
  </div>

  <div style={{ marginTop: '15px' }}>
    <strong>Servicios:</strong>
    <ul style={{ marginTop: '5px' }}>
      {parqueo.servicios.map((servicio, index) => (
        <li key={index}>{servicio.nombre}: Bs{servicio.precio}</li>
      ))}
    </ul>
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
      }
    </div>
  );
};

export default ParqueosPanel;
