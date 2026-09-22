import React, { useState } from 'react';
import { UserRole } from '../../types';
import { useAppStore } from '../../store/appStore';
import { soundAlerts } from '../../utils/soundAlerts';
import { 
  ShoppingCart, 
  Bell, 
  Volume2, 
  VolumeX, 
  Truck, 
  Package, 
  Users, 
  ShieldCheck, 
  Sparkles,
  Layers,
  MapPin
} from 'lucide-react';

interface Props {
  onOpenCart: () => void;
  onOpenOrderTracking?: () => void;
}

export const Navbar: React.FC<Props> = ({ onOpenCart, onOpenOrderTracking }) => {
  const { role, setRole, cart, orders } = useAppStore();
  const [soundActive, setSoundActive] = useState(soundAlerts.isSoundEnabled());

  const pendingOrdersCount = orders.filter((o) => o.status === 'pendiente').length;
  const inTransitCount = orders.filter((o) => o.status === 'en_camino').length;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const toggleSound = () => {
    const newState = !soundActive;
    soundAlerts.setSoundEnabled(newState);
    setSoundActive(newState);
    if (newState) soundAlerts.playSuccessTone();
  };

  const rolesConfig: Array<{ role: UserRole; label: string; icon: React.ReactNode; badge?: number }> = [
    { role: 'cliente', label: 'Tienda / Cliente', icon: <ShoppingCart className="w-4 h-4" /> },
    { 
      role: 'jefe_almacen', 
      label: 'Jefe de Almacén', 
      icon: <Package className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined 
    },
    { 
      role: 'repartidor', 
      label: 'Repartidor (GPS)', 
      icon: <Truck className="w-4 h-4" />,
      badge: inTransitCount > 0 ? inTransitCount : undefined
    },
    { role: 'trabajador', label: 'Operario (Picking)', icon: <Layers className="w-4 h-4" /> },
    { role: 'proveedor', label: 'Proveedor', icon: <Users className="w-4 h-4" /> },
    { role: 'admin', label: 'Administrador', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Bar institucional Sol Clean */}
      <div className="bg-[#0066cc] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#ffcc33] text-slate-900 font-extrabold px-1.5 py-0.5 rounded text-[10px] tracking-wide">
              SOL CLEAN PERÚ
            </span>
            <span className="hidden sm:inline text-blue-100">
              Productos de limpieza, desinfección y mantenimiento institucional e industrial
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-blue-100 text-[11px]">
            <span className="hidden md:inline">📍 Planta de Producción y Almacén Central Lima</span>
            <span className="flex items-center gap-1 font-semibold text-[#ffcc33]">
              ⚡ Entregas Programadas con Monitoreo Satelital
            </span>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo Sol Clean Perú */}
        <div 
          onClick={() => setRole('cliente')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0066cc] to-sky-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
            <Sparkles className="w-6 h-6 text-[#ffcc33]" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-black tracking-tight text-[#0066cc] font-serif">
                SOL<span className="text-[#ffcc33]">CLEAN</span>
              </span>
              <span className="text-[10px] font-black uppercase text-slate-600 bg-slate-100 px-1 py-0.5 rounded border border-slate-300">
                PERÚ
              </span>
            </div>
            <p className="text-[11px] text-slate-600 -mt-1 font-medium">
              Ecosistema Logístico & Despachos en Vivo
            </p>
          </div>
        </div>

        {/* Acciones principales de cabecera */}
        <div className="flex items-center gap-2.5">
          {/* Botón de Alerta Sonora (Campana) */}
          <button
            onClick={toggleSound}
            title={soundActive ? 'Silenciar alertas de almacén' : 'Activar sonido de campana de pedidos'}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
              soundActive
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {soundActive ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden lg:inline">{soundActive ? 'Alerta Sonora Activa' : 'Sonido Silenciado'}</span>
          </button>

          {/* Botón Rastreo de Pedido para Clientes */}
          {onOpenOrderTracking && (
            <button
              onClick={onOpenOrderTracking}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition border border-slate-200"
            >
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Rastrear Pedido</span>
            </button>
          )}

          {/* Carrito de compras */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 bg-[#ffcc33] hover:bg-[#e6b800] text-slate-900 font-bold px-3.5 py-2 rounded-lg transition shadow-sm active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-extrabold uppercase">Carrito</span>
            {totalCartCount > 0 && (
              <span className="w-5 h-5 bg-[#0066cc] text-white text-[11px] font-black rounded-full flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Selector de Roles / Barra de Simulador de Ecosistema */}
      <div className="bg-slate-100 border-t border-slate-200 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold shrink-0">
            <span className="uppercase text-[10px] text-slate-600 tracking-wider">Modo Activo:</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {rolesConfig.map((item) => {
              const isActive = role === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => setRole(item.role)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap relative ${
                    isActive
                      ? 'bg-[#0066cc] text-white shadow-sm ring-2 ring-blue-300'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-[#ffcc33] text-slate-950' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
