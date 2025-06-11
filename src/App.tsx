import { useState } from 'react';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  Users,
  Car,
  ArrowRight
} from 'lucide-react';

function App() {
  const [selectedModule, setSelectedModule] = useState('');

  const modules = [
    {
      id: 'favorites',
      title: 'Favorites',
      description: 'Gestionar parqueos favoritos de usuarios',
      icon: Heart,
      color: 'from-red-400 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      hoverBorder: 'hover:border-red-400'
    },
    {
      id: 'parqueos',
      title: 'Parqueos',
      description: 'Administrar espacios de estacionamiento',
      icon: MapPin,
      color: 'from-blue-400 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBorder: 'hover:border-blue-400'
    },
    {
      id: 'reservations',
      title: 'Reservations',
      description: 'Control de reservas y horarios',
      icon: Calendar,
      color: 'from-green-400 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverBorder: 'hover:border-green-400'
    },
    {
      id: 'users',
      title: 'Users',
      description: 'Gestión de usuarios del sistema',
      icon: Users,
      color: 'from-purple-400 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverBorder: 'hover:border-purple-400'
    }
  ];

  const handleModuleClick = (moduleId: string) => {
    setSelectedModule(moduleId);
    console.log(`Navegando a: ${moduleId}`);
    // Aquí puedes agregar la lógica de navegación
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con título */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Car className="h-10 w-10 text-blue-600 mr-3 animate-bounce" />
              <h1 className="text-4xl font-bold text-blue-600">
                Bienvenido al panel Tu Parqueo 🚗
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Administra tu sistema de parqueos de manera eficiente. Selecciona un módulo para comenzar.
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal con grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Grid de módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <div
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className={`
                  relative bg-white rounded-xl shadow-md border-2 transition-all duration-300 cursor-pointer
                  ${module.borderColor} ${module.hoverBorder} hover:shadow-xl hover:scale-105
                  ${selectedModule === module.id ? 'ring-4 ring-blue-200 scale-105' : ''}
                `}
              >
                {/* Indicador de selección */}
                {selectedModule === module.id && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}

                <div className="p-6">
                  {/* Icono con gradiente */}
                  <div className={`${module.bgColor} rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto`}>
                    <div className={`bg-gradient-to-r ${module.color} rounded-full p-3`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Título */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                    {module.title}
                  </h3>

                  {/* Descripción */}
                  <p className="text-gray-600 text-sm text-center leading-relaxed">
                    {module.description}
                  </p>

                  {/* Indicador hover */}
                  <div className="mt-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-100 rounded-full px-3 py-1">
                      <span className="text-xs text-gray-600">Hacer clic para acceder</span>
                    </div>
                  </div>
                </div>

                {/* Efecto hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent hover:from-white/10 hover:to-transparent rounded-xl transition-all duration-300"></div>
              </div>
            );
          })}
        </div>

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Panel de Administración
            </h3>
            <p className="text-gray-600 text-sm">
              Desde aquí puedes gestionar todos los aspectos de tu sistema de parqueos: 
              usuarios, reservas, espacios disponibles y configuraciones favoritas.
            </p>
            {selectedModule && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm font-medium">
                  Módulo seleccionado: <span className="capitalize">{selectedModule}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats rápidas */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-600">248</div>
            <div className="text-xs text-gray-600">Favoritos Activos</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">156</div>
            <div className="text-xs text-gray-600">Parqueos Disponibles</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">89</div>
            <div className="text-xs text-gray-600">Reservas Hoy</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">1,247</div>
            <div className="text-xs text-gray-600">Usuarios Registrados</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;