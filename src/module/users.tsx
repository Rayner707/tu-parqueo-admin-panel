import React, { useState, useEffect } from 'react';
import './users.css';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from '../firebase/usersService';

export interface Vehicle {
  id: string;
  color: string;
  marca: string;
  modelo: string;
  placa: string;
  tipo: string;
  foto?: string;
}

export interface Usuario {
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

  // Removemos vehicles de formData inicial
  const getInitialUserData = (): Omit<Usuario, 'id' | 'vehicles'> => ({
    nombres: '',
    apellidos: '',
    email: '',
    role: 'cliente', // Cambiado de 'usuario' a 'cliente' para consistencia
    telefono: '',
    creadoEn: new Date().toISOString()
  });

  const getInitialVehicleData = (): Omit<Vehicle, 'id'> => ({
    color: '',
    marca: '',
    modelo: '',
    placa: '',
    tipo: 'automovil',
    foto: ''
  });

  // Cambiamos el tipo de formData para no incluir vehicles
  const [formData, setFormData] = useState<Omit<Usuario, 'id' | 'vehicles'>>(getInitialUserData());
  const [vehicleFormData, setVehicleFormData] = useState<Omit<Vehicle, 'id'>>(getInitialVehicleData());
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [vehiclesTemp, setVehiclesTemp] = useState<Vehicle[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersFromDB = await getAllUsers();
      setUsuarios(usersFromDB);
    };
    fetchUsers();
  }, []);

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

  const handleVehicleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Por favor, seleccione una imagen válida (JPG, PNG, GIF, WEBP)');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('La imagen es demasiado grande. El tamaño máximo es 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setVehicleFormData(prev => ({
          ...prev,
          foto: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData(getInitialUserData());
    setSelectedUsuario(null);
    setIsEditing(false);
    resetVehicleForm();
    setVehiclesTemp([]);
  };

  const resetVehicleForm = () => {
    setVehicleFormData(getInitialVehicleData());
    setIsEditingVehicle(false);
    setEditingVehicleId(null);
  };

  const handleCancelVehicleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    resetVehicleForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing && selectedUsuario) {
      await updateUser(selectedUsuario.id, formData, vehiclesTemp);
    } else {
      await createUser(formData, vehiclesTemp);
    }

    const updatedUsers = await getAllUsers();
    setUsuarios(updatedUsers);
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
      creadoEn: usuario.creadoEn
    });
    setVehiclesTemp(usuario.vehicles ?? []);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      await deleteUser(id);
      const updatedUsers = await getAllUsers();
      setUsuarios(updatedUsers);
      if (selectedUsuario?.id === id) resetForm();
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setVehicleFormData({
      color: vehicle.color,
      marca: vehicle.marca,
      modelo: vehicle.modelo,
      placa: vehicle.placa,
      tipo: vehicle.tipo,
      foto: vehicle.foto || ''
    });
    setIsEditingVehicle(true);
    setEditingVehicleId(vehicle.id);
  };

  const handleDeleteVehicle = (e: React.MouseEvent<HTMLButtonElement>, vehicleId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setVehiclesTemp(prev => prev.filter(v => v.id !== vehicleId));
  };

  const handleAddVehicleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isEditingVehicle && editingVehicleId) {
      setVehiclesTemp(prev =>
        prev.map(v =>
          v.id === editingVehicleId ? { ...vehicleFormData, id: editingVehicleId } : v
        )
      );
    } else {
      const newVehicle: Vehicle = {
        ...vehicleFormData,
        id: Date.now().toString()
      };
      setVehiclesTemp(prev => [...prev, newVehicle]);
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

  // Mejorada la función getRoleColor y agregada getRoleLabel
  const getRoleColor = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'admin':
      case 'administrador': return '#dc3545';
      case 'cliente': return '#28a745';
      case 'operador': return '#17a2b8';
      case 'supervisor': return '#6f42c1';
      default: return '#6c757d';
    }
  };

  const getRoleLabel = (role: string): string => {
    switch (role.toLowerCase()) {
      case 'admin': return 'Administrador';
      case 'cliente': return 'Cliente';
      case 'operador': return 'Operador';
      case 'supervisor': return 'Supervisor';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const handleGoBack = () => {
    onBack();
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
                required
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
                <option value="operador">Operador</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>

            <div className="vehicles-section">
              <h3>Vehículos</h3>
              
              <div className="vehicle-form">
                <div className="form-group">
                  <label>Marca:</label>
                  <input
                    type="text"
                    value={vehicleFormData.marca}
                    onChange={(e) => handleVehicleInputChange('marca', e.target.value)}
                    placeholder="Ej: Toyota"
                  />
                </div>
                <div className="form-group">
                  <label>Modelo:</label>
                  <input
                    type="text"
                    value={vehicleFormData.modelo}
                    onChange={(e) => handleVehicleInputChange('modelo', e.target.value)}
                    placeholder="Ej: Corolla"
                  />
                </div>
                <div className="form-group">
                  <label>Placa:</label>
                  <input
                    type="text"
                    value={vehicleFormData.placa}
                    onChange={(e) => handleVehicleInputChange('placa', e.target.value)}
                    placeholder="Ej: ABC-123"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="form-group">
                  <label>Color:</label>
                  <input
                    type="text"
                    value={vehicleFormData.color}
                    onChange={(e) => handleVehicleInputChange('color', e.target.value)}
                    placeholder="Ej: Blanco"
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
                <div className="form-group">
                  <label>Foto:</label>
                  <input type="file" accept="image/*" onChange={handleVehicleImageChange} />
                  {vehicleFormData.foto && (
                    <img src={vehicleFormData.foto} alt="Vista previa" style={{ width: '100px', marginTop: '10px' }} />
                  )}
                </div>
                <button type="button" onClick={handleAddVehicleClick} className="add-vehicle-btn">
                  {isEditingVehicle ? 'Actualizar Vehículo' : 'Agregar Vehículo'}
                </button>
                {isEditingVehicle && (
                  <button type="button" onClick={handleCancelVehicleEdit} className="cancel-btn">
                    Cancelar Edición
                  </button>
                )}
              </div>

              {/* Lista de vehículos temporales */}
              <div style={{ marginTop: '15px' }}>
                {vehiclesTemp.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#6c757d', fontStyle: 'italic' }}>
                    No hay vehículos registrados
                  </p>
                ) : (
                  vehiclesTemp.map(vehicle => (
                    <div key={vehicle.id} className="vehicle-item">
                      <div className="vehicle-info" style={{ display: 'flex', alignItems: 'center' }}>
                        {vehicle.foto && (
                          <img
                            src={vehicle.foto}
                            alt={`${vehicle.marca} ${vehicle.modelo}`}
                            style={{
                              width: '80px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px',
                              marginRight: '10px',
                              border: '1px solid #ddd'
                            }}
                          />
                        )}
                        <div>
                          <h4>{vehicle.marca} {vehicle.modelo}</h4>
                          <p><strong>Placa:</strong> {vehicle.placa}</p>
                          <p><strong>Color:</strong> {vehicle.color} | <strong>Tipo:</strong> {vehicle.tipo}</p>
                        </div>
                      </div>
                      <div className="vehicle-actions">
                        <button 
                          type="button"
                          onClick={() => handleEditVehicle(vehicle)}
                          className="edit-vehicle-btn"
                        >
                          Editar
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleDeleteVehicle(e, vehicle.id)}
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
          <h2>Usuarios Registrados ({usuarios.length})</h2>
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
                      {/* Agregamos el rol también en la información básica */}
                      <p className="user-role-text">
                        <strong>Rol:</strong> {getRoleLabel(usuario.role)}
                      </p>
                    </div>
                    <div className="user-actions">
                      <span 
                        className={`role-badge ${usuario.role}`}
                        style={{ 
                          backgroundColor: getRoleColor(usuario.role),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          marginRight: '8px'
                        }}
                      >
                        {getRoleLabel(usuario.role)}
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
                          fontSize: '14px',
                          marginRight: '5px'
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
                          fontSize: '14px',
                          marginRight: '8px'
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
                          <span 
                            style={{ 
                              color: getRoleColor(usuario.role),
                              fontWeight: 'bold'
                            }}
                          >
                            {getRoleLabel(usuario.role)}
                          </span>
                        </div>
                        <div className="detail-item">
                          <strong>Fecha Creación</strong>
                          <span>{formatDate(usuario.creadoEn)}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Total Vehículos</strong>
                          <span>{usuario.vehicles?.length || 0}</span>
                        </div>
                      </div>

                      <div className="vehicles-list">
                        <h4>Vehículos Registrados</h4>
                        {!usuario.vehicles || usuario.vehicles.length === 0 ? (
                          <div className="no-vehicles">
                            Este usuario no tiene vehículos registrados
                          </div>
                        ) : (
                          usuario.vehicles.map(vehicle => (
                            <div key={vehicle.id} className="vehicle-card">
                              {vehicle.foto && (
                                <img
                                  src={vehicle.foto}
                                  alt={`${vehicle.marca} ${vehicle.modelo}`}
                                  style={{
                                    width: '100%',
                                    maxWidth: '150px',
                                    height: '100px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    border: '1px solid #ddd'
                                  }}
                                />
                              )}
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