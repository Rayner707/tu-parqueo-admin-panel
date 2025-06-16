import React, { useState } from 'react';
import './users.css';

interface Vehicle {
  id: string;
  color: string;
  marca: string;
  modelo: string;
  placa: string;
  tipo: string;
}

interface Usuario {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  role: string;
  telefono: string;
  vehicles: Vehicle[];
  creadoEn: string;
}

interface UsersPanelProps {
  onBack: () => void;
}

const UsersPanel: React.FC<UsersPanelProps> = ({ onBack }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const getInitialUserData = (): Omit<Usuario, 'id' | 'creadoEn'> => ({
    nombres: '',
    apellidos: '',
    email: '',
    role: 'usuario',
    telefono: '',
    vehicles: []
  });

  const getInitialVehicleData = (): Omit<Vehicle, 'id'> => ({
    color: '',
    marca: '',
    modelo: '',
    placa: '',
    tipo: 'automovil'
  });

  const [formData, setFormData] = useState<Omit<Usuario, 'id' | 'creadoEn'>>(getInitialUserData());
  const [vehicleFormData, setVehicleFormData] = useState<Omit<Vehicle, 'id'>>(getInitialVehicleData());
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  const handleGoBack = () => {
    onBack();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVehicleInputChange = (field: string, value: string) => {
    setVehicleFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData(getInitialUserData());
    setSelectedUsuario(null);
    setIsEditing(false);
    resetVehicleForm();
  };

  const resetVehicleForm = () => {
    setVehicleFormData(getInitialVehicleData());
    setIsEditingVehicle(false);
    setEditingVehicleId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && selectedUsuario) {
      setUsuarios(prev => prev.map(u => 
        u.id === selectedUsuario.id 
          ? { 
              ...formData, 
              id: selectedUsuario.id,
              creadoEn: selectedUsuario.creadoEn
            }
          : u
      ));
    } else {
      const newUsuario: Usuario = {
        ...formData,
        id: Date.now().toString(),
        creadoEn: new Date().toISOString()
      };
      setUsuarios(prev => [...prev, newUsuario]);
    }
    
    resetForm();
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setFormData({
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      role: usuario.role,
      telefono: usuario.telefono,
      vehicles: usuario.vehicles
    });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    setUsuarios(prev => prev.filter(u => u.id !== id));
    if (selectedUsuario?.id === id) {
      resetForm();
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleFormData({
      color: vehicle.color,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      placa: vehicle.placa,
      tipo: vehicle.tipo
    });
    setIsEditingVehicle(true);
    setEditingVehicleId(vehicle.id);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setFormData(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter(v => v.id !== vehicleId)
    }));
  };

  // Nueva función para manejar el click del botón de agregar vehículo
  const handleAddVehicleClick = () => {
    // Validar que al menos marca y modelo estén llenos
    if (!vehicleFormData.marca.trim() || !vehicleFormData.modelo.trim()) {
      alert('Por favor, complete al menos la marca y el modelo del vehículo');
      return;
    }
    
    if (isEditingVehicle && editingVehicleId) {
      setFormData(prev => ({
        ...prev,
        vehicles: prev.vehicles.map(v => 
          v.id === editingVehicleId 
            ? {
                ...vehicleFormData,
                id: editingVehicleId
              }
            : v
        )
      }));
    } else {
      const newVehicle: Vehicle = {
        ...vehicleFormData,
        id: Date.now().toString()
      };
      setFormData(prev => ({
        ...prev,
        vehicles: [...prev.vehicles, newVehicle]
      }));
    }
    
    resetVehicleForm();
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#dc3545';
      case 'cliente': return '#28a745';
      case 'operador': return '#17a2b8';
      case 'supervisor': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  return (
    <div className="users-panel">
      <div className="header">
        <button className="back-button" onClick={handleGoBack}>
          ← Volver
        </button>
        <h1>Panel de Usuarios</h1>
      </div>

      <div className="content">
        <div className="form-section">
          <h2>{isEditing ? 'Actualizar Usuario' : 'Crear Nuevo Usuario'}</h2>
          
          <form onSubmit={handleSubmit} className="user-form">
            <div className="name-group">
              <div className="form-group">
                <label>Nombres:</label>
                <input
                  type="text"
                  value={formData.nombres}
                  onChange={(e) => handleInputChange('nombres', e.target.value)}
                  placeholder="Nombres del usuario"
                  required
                />
              </div>

              <div className="form-group">
                <label>Apellidos:</label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => handleInputChange('apellidos', e.target.value)}
                  placeholder="Apellidos del usuario"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                placeholder="Número de teléfono"
                required
              />
            </div>

            <div className="form-group">
              <label>Rol:</label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="role-select"
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
                <option value="operador">Operador</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>

            <div className="vehicles-section">
              <h3>Vehículos</h3>
              
              {/* Cambiado de form a div para evitar formularios anidados */}
              <div className="vehicle-form">
                <div className="form-group">
                  <label>Marca: *</label>
                  <input
                    type="text"
                    value={vehicleFormData.marca}
                    onChange={(e) => handleVehicleInputChange('marca', e.target.value)}
                    placeholder="Toyota, Honda, etc."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Modelo: *</label>
                  <input
                    type="text"
                    value={vehicleFormData.modelo}
                    onChange={(e) => handleVehicleInputChange('modelo', e.target.value)}
                    placeholder="Corolla, Civic, etc."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Placa:</label>
                  <input
                    type="text"
                    value={vehicleFormData.placa}
                    onChange={(e) => handleVehicleInputChange('placa', e.target.value)}
                    placeholder="ABC-123"
                  />
                </div>

                <div className="form-group">
                  <label>Color:</label>
                  <input
                    type="text"
                    value={vehicleFormData.color}
                    onChange={(e) => handleVehicleInputChange('color', e.target.value)}
                    placeholder="Rojo, Azul, etc."
                  />
                </div>

                <div className="form-group">
                  <label>Tipo:</label>
                  <select
                    value={vehicleFormData.tipo}
                    onChange={(e) => handleVehicleInputChange('tipo', e.target.value)}
                  >
                    <option value="automovil">Automóvil</option>
                    <option value="motocicleta">Motocicleta</option>
                    <option value="camioneta">Camioneta</option>
                    <option value="suv">SUV</option>
                    <option value="pickup">Pickup</option>
                  </select>
                </div>

                <button 
                  type="button" 
                  onClick={handleAddVehicleClick}
                  className="add-vehicle-btn"
                >
                  {isEditingVehicle ? 'Actualizar Vehículo' : 'Agregar Vehículo'}
                </button>
              </div>

              {isEditingVehicle && (
                <button 
                  type="button"
                  onClick={resetVehicleForm}
                  style={{
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '10px',
                    width: '100%'
                  }}
                >
                  Cancelar Edición
                </button>
              )}

              <div style={{ marginTop: '15px' }}>
                {formData.vehicles.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
                    No hay vehículos registrados
                  </p>
                ) : (
                  formData.vehicles.map(vehicle => (
                    <div key={vehicle.id} className="vehicle-item">
                      <div className="vehicle-info">
                        <h4>{vehicle.marca} {vehicle.modelo}</h4>
                        <p><strong>Placa:</strong> {vehicle.placa}</p>
                        <p><strong>Color:</strong> {vehicle.color} | <strong>Tipo:</strong> {vehicle.tipo}</p>
                      </div>
                      <div className="vehicle-actions">
                        <button 
                          onClick={() => handleEditVehicle(vehicle)}
                          className="edit-vehicle-btn"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="delete-vehicle-btn"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="form-buttons">
              <button type="submit" className="submit-btn">
                {isEditing ? 'Actualizar' : 'Crear'} Usuario
              </button>
              {isEditing && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="cancel-btn"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="list-section">
          <h2>Usuarios Registrados</h2>
          <div className="users-list">
            {usuarios.length === 0 ? (
              <div className="no-data">
                No hay usuarios registrados
              </div>
            ) : (
              usuarios.map(usuario => (
                <div key={usuario.id} className="user-item">
                  <div 
                    onClick={() => toggleExpanded(usuario.id)}
                    className="user-header"
                  >
                    <div className="user-info">
                      <h3>{usuario.nombres} {usuario.apellidos}</h3>
                      <p>{usuario.email} • {usuario.telefono}</p>
                    </div>
                    <div className="user-actions">
                      <span 
                        className={`role-badge ${usuario.role}`}
                        style={{ backgroundColor: getRoleColor(usuario.role) }}
                      >
                        {usuario.role.toUpperCase()}
                      </span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(usuario); }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(usuario.id); }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Eliminar
                      </button>
                      <span className="expand-icon">
                        {expandedItems.has(usuario.id) ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  
                  {expandedItems.has(usuario.id) && (
                    <div className="user-details">
                      <div className="detail-grid">
                        <div className="detail-item">
                          <strong>ID</strong>
                          <span>{usuario.id}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Email</strong>
                          <span>{usuario.email}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Teléfono</strong>
                          <span>{usuario.telefono}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Rol</strong>
                          <span>{usuario.role}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Fecha Creación</strong>
                          <span>{formatDate(usuario.creadoEn)}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Total Vehículos</strong>
                          <span>{usuario.vehicles.length}</span>
                        </div>
                      </div>

                      <div className="vehicles-list">
                        <h4>Vehículos Registrados</h4>
                        {usuario.vehicles.length === 0 ? (
                          <div className="no-vehicles">
                            Este usuario no tiene vehículos registrados
                          </div>
                        ) : (
                          usuario.vehicles.map(vehicle => (
                            <div key={vehicle.id} className="vehicle-card">
                              <h5>{vehicle.marca} {vehicle.modelo}</h5>
                              <div className="vehicle-details">
                                <span><strong>Placa:</strong> {vehicle.placa}</span>
                                <span><strong>Color:</strong> {vehicle.color}</span>
                                <span><strong>Tipo:</strong> {vehicle.tipo}</span>
                                <span><strong>ID:</strong> {vehicle.id}</span>
                              </div>
                            </div>
                          ))
                        )}
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

const UsersModule = UsersPanel;
export default UsersModule;