import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Users,
  Car,
  ArrowRight,
  type LucideIcon
} from 'lucide-react';

// Definir tipos para TypeScript
type ModuleId = 'dashboard' | 'parqueos' | 'reservations' | 'users';

interface Module {
  id: ModuleId;
  title: string;
  description: string;
  icon: LucideIcon; // Componente de Lucide React
  color: string;
  bgColor: string;
  borderColor: string;
  hoverBorder: string;
}

// Componente Dashboard (Panel Principal)
const Dashboard = ({ onModuleSelect }: { onModuleSelect: (moduleId: ModuleId) => void }) => {
  const [selectedModule, setSelectedModule] = useState<string>('');

  const modules: Module[] = [
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

  const handleModuleClick = (moduleId: ModuleId) => {
    if (!moduleId) {
      console.error('moduleId no está definido');
      return;
    }

    setSelectedModule(moduleId);
    console.log(`Navegando a: ${moduleId}`);
    onModuleSelect(moduleId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header con título */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center justify-items-center">
            <div className="flex items-center justify-center mb-4">
              <Car className="h-10 w-10 text-blue-600 mr-3 animate-bounce" />
              <h1 className="text-4xl font-bold text-blue-600">
                Bienvenido al panel Tu Parqueo
              </h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto text-center justify-center">
              Administra tu sistema de parqueos de manera eficiente. Selecciona un módulo para comenzar.
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal con grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Grid de módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <div
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className={`
                  relative bg-white rounded-xl shadow-md border-2 transition-all duration-300 cursor-pointer
                  transform hover:scale-105 hover:shadow-xl w-full max-w-sm
                  ${module.borderColor} ${module.hoverBorder}
                  ${selectedModule === module.id ? 'ring-4 ring-blue-200 scale-105' : ''}
                  focus:outline-none focus:ring-4 focus:ring-blue-200
                  active:scale-95
                `}
                role="button"
                tabIndex={0}
                aria-label={`Acceder al módulo ${module.title}`}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleModuleClick(module.id);
                  }
                }}
              >
                {/* Indicador de selección */}
                {selectedModule === module.id && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 animate-pulse">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}

                <div className="p-6">
                  {/* Icono con gradiente */}
                  <div className={`${module.bgColor} rounded-full w-16 h-16 flex items-center justify-center mb-4 mx-auto transition-transform duration-300 hover:scale-110`}>
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

                  {/* Botón de acción */}
                  <div className="mt-4 flex justify-center">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-4 py-2 text-xs font-medium opacity-0 hover:opacity-100 transition-opacity duration-300">
                      Acceder →
                    </div>
                  </div>
                </div>

                {/* Efecto hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent hover:from-white/10 hover:to-transparent rounded-xl transition-all duration-300 pointer-events-none"></div>
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
};

// Importar los módulos desde tus archivos
import ParqueosModule from './module/parqueos';
import ReservationsModule from './module/reservations';
/*import UsersModule from './module/users';*/

// Componente principal de la aplicación
function App() {
  const [currentModule, setCurrentModule] = useState<ModuleId>('dashboard');

  const handleModuleSelect = (moduleId: ModuleId) => {
    setCurrentModule(moduleId);
  };

  const handleBackToDashboard = () => {
    setCurrentModule('dashboard');
  };

  const renderCurrentModule = () => {
    switch (currentModule) {
      case 'parqueos':
        return <ParqueosModule onBack={handleBackToDashboard} />;
      case 'reservations':
        return <ReservationsModule onBack={handleBackToDashboard} />;
      /*case 'users':
        return <UsersModule onBack={handleBackToDashboard} />;*/
      default:
        return <Dashboard onModuleSelect={handleModuleSelect} />;
    }
  };

  return <div>{renderCurrentModule()}</div>;
}

export default App;