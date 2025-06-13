import React, { useState } from 'react';
import './parqueos.css';

interface Horario {
  dia: string;
  inicio: string;
  fin: string;
}

interface MetodoPago {
  nombre: string;
  activo: boolean;
}

interface Plan {
  rango: string;
  precio: number;
}

interface Servicio {
  nombre: string;
  precio: number;
}

interface Parqueo {
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
  ubicacion: string;
}

interface ParqueosPanelProps {
  onBack: () => void;
}

const ParqueosPanel: React.FC<ParqueosPanelProps> = ({ onBack }) => {
  const [parqueos, setParqueos] = useState<Parqueo[]>([]);
  const [selectedParqueo, setSelectedParqueo] = useState<Parqueo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const getInitialFormData = (): Omit<Parqueo, 'id'> => ({
    direccion: '',
    disponibles: 0,
    etiqueta: '',
    horarios: [
      { dia: 'Lunes', inicio: '', fin: '' }
    ],
    metodosPago: [
      { nombre: 'Efectivo', activo: false }
    ],
    nombre: '',
    planes: [
      { rango: '', precio: 0 }
    ],
    precioPorHora: 0,
    servicios: [
      { nombre: '', precio: 0 }
    ],
    ubicacion: ''
  });

  const [formData, setFormData] = useState<Omit<Parqueo, 'id'>>(getInitialFormData());

  const handleGoBack = () => {
    onBack();
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funciones para manejar horarios
  const handleHorarioChange = (index: number, field: keyof Horario, value: string) => {
    setFormData(prev => ({
      ...prev,
      horarios: prev.horarios.map((horario, i) => 
        i === index ? { ...horario, [field]: value } : horario
      )
    }));
  };

  const addHorario = () => {
    setFormData(prev => ({
      ...prev,
      horarios: [...prev.horarios, { dia: '', inicio: '', fin: '' }]
    }));
  };

  const removeHorario = (index: number) => {
    setFormData(prev => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== index)
    }));
  };

  // Funciones para manejar métodos de pago
  const handleMetodoPagoChange = (index: number, field: keyof MetodoPago, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      metodosPago: prev.metodosPago.map((metodo, i) => 
        i === index ? { ...metodo, [field]: value } : metodo
      )
    }));
  };

  const addMetodoPago = () => {
    setFormData(prev => ({
      ...prev,
      metodosPago: [...prev.metodosPago, { nombre: '', activo: false }]
    }));
  };

  const removeMetodoPago = (index: number) => {
    setFormData(prev => ({
      ...prev,
      metodosPago: prev.metodosPago.filter((_, i) => i !== index)
    }));
  };

  // Funciones para manejar planes
  const handlePlanChange = (index: number, field: keyof Plan, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      planes: prev.planes.map((plan, i) => 
        i === index ? { ...plan, [field]: value } : plan
      )
    }));
  };

  const addPlan = () => {
    setFormData(prev => ({
      ...prev,
      planes: [...prev.planes, { rango: '', precio: 0 }]
    }));
  };

  const removePlan = (index: number) => {
    setFormData(prev => ({
      ...prev,
      planes: prev.planes.filter((_, i) => i !== index)
    }));
  };

  // Funciones para manejar servicios
  const handleServicioChange = (index: number, field: keyof Servicio, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios.map((servicio, i) => 
        i === index ? { ...servicio, [field]: value } : servicio
      )
    }));
  };

  const addServicio = () => {
    setFormData(prev => ({
      ...prev,
      servicios: [...prev.servicios, { nombre: '', precio: 0 }]
    }));
  };

  const removeServicio = (index: number) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData(getInitialFormData());
    setSelectedParqueo(null);
    setIsEditing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && selectedParqueo) {
      setParqueos(prev => prev.map(p => 
        p.id === selectedParqueo.id 
          ? { ...formData, id: selectedParqueo.id }
          : p
      ));
    } else {
      const newParqueo: Parqueo = {
        ...formData,
        id: Date.now().toString()
      };
      setParqueos(prev => [...prev, newParqueo]);
    }
    
    resetForm();
  };

  const handleEdit = (parqueo: Parqueo) => {
    setSelectedParqueo(parqueo);
    setFormData({
      direccion: parqueo.direccion,
      disponibles: parqueo.disponibles,
      etiqueta: parqueo.etiqueta,
      horarios: parqueo.horarios,
      metodosPago: parqueo.metodosPago,
      nombre: parqueo.nombre,
      planes: parqueo.planes,
      precioPorHora: parqueo.precioPorHora,
      servicios: parqueo.servicios,
      ubicacion: parqueo.ubicacion
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setParqueos(prev => prev.filter(p => p.id !== id));
    if (selectedParqueo?.id === id) {
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

  return (
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
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Ubicación:</label>
              <input
                type="text"
                value={formData.ubicacion}
                onChange={(e) => handleInputChange('ubicacion', e.target.value)}
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
                  <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input
                      type="checkbox"
                      checked={metodo.activo}
                      onChange={(e) => handleMetodoPagoChange(index, 'activo', e.target.checked)}
                    />
                    Activo
                  </label>
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
                    value={plan.rango}
                    onChange={(e) => handlePlanChange(index, 'rango', e.target.value)}
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
                      <p><strong>Ubicación:</strong> {parqueo.ubicacion}</p>
                      <p><strong>Disponibles:</strong> {parqueo.disponibles}</p>
                      <p><strong>Etiqueta:</strong> {parqueo.etiqueta}</p>
                      <p><strong>Precio por Hora:</strong> Bs{parqueo.precioPorHora}</p>
                      
                      <div style={{ marginTop: '15px' }}>
                        <strong>Horarios:</strong>
                        <ul style={{ marginTop: '5px' }}>
                          {parqueo.horarios.map((horario, index) => (
                            <li key={index}>
                              {horario.dia}: {horario.inicio} - {horario.fin}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div style={{ marginTop: '15px' }}>
                        <strong>Métodos de Pago:</strong>
                        <ul style={{ marginTop: '5px' }}>
                          {parqueo.metodosPago.filter(m => m.activo).map((metodo, index) => (
                            <li key={index}>{metodo.nombre}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div style={{ marginTop: '15px' }}>
                        <strong>Planes:</strong>
                        <ul style={{ marginTop: '5px' }}>
                          {parqueo.planes.map((plan, index) => (
                            <li key={index}>{plan.rango}: Bs{plan.precio}</li>
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
  );
};

const ParqueosModule = ParqueosPanel;
export default ParqueosModule;