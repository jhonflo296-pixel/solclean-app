import React, { useState } from 'react';
import { useAppStore } from './store/appStore';
import { Order } from './types';
import { Navbar } from './components/common/Navbar';
import { ClientStorefront } from './components/client/ClientStorefront';
import { CartDrawer } from './components/client/CartDrawer';
import { CheckoutModal } from './components/client/CheckoutModal';
import { OrderTrackingModal } from './components/client/OrderTrackingModal';
import { WarehouseDashboard } from './components/warehouse/WarehouseDashboard';
import { DriverAppView } from './components/delivery/DriverAppView';
import { WorkerPortal } from './components/worker/WorkerPortal';
import { SupplierPortal } from './components/supplier/SupplierPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Truck, 
  Package 
} from 'lucide-react';

export function App() {
  const { role, setRole, orders } = useAppStore();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  // Abrir modal de rastreo
  const handleOpenTracking = (order?: Order) => {
    if (order) {
      setTrackingOrder(order);
    } else {
      // Buscar pedido en camino o el más reciente
      const activeOrder = orders.find((o) => o.status === 'en_camino') || orders[0];
      setTrackingOrder(activeOrder || null);
    }
    setIsTrackingOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setTrackingOrder(order);
    setIsTrackingOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-[#0066cc] selection:text-white">
      {/* Barra de navegación superior con selector de roles */}
      <Navbar
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrderTracking={() => handleOpenTracking()}
      />

      {/* Contenido Principal según el Rol Seleccionado */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {role === 'cliente' && <ClientStorefront />}

        {role === 'jefe_almacen' && (
          <WarehouseDashboard onOpenOrderDetails={(ord) => handleOpenTracking(ord)} />
        )}

        {role === 'repartidor' && <DriverAppView />}

        {role === 'trabajador' && <WorkerPortal />}

        {role === 'proveedor' && <SupplierPortal />}

        {role === 'admin' && <AdminDashboard />}
      </main>

      {/* Drawer de Carrito */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Modal de Checkout con Selección GPS y Fecha */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Modal de Rastreo en Vivo con Telemetría Satelital */}
      <OrderTrackingModal
        isOpen={isTrackingOpen}
        order={trackingOrder}
        onClose={() => setIsTrackingOpen(false)}
      />

      {/* Footer Institucional Sol Clean Perú */}
      <footer className="bg-[#0066cc] text-white border-t border-blue-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
            {/* Columna 1: Identidad Sol Clean */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#ffcc33] text-slate-900 flex items-center justify-center font-black">
                  SC
                </div>
                <span className="text-xl font-black text-white font-serif">
                  SOL<span className="text-[#ffcc33]">CLEAN</span> PERÚ
                </span>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Fabricación y distribución de insumos químicos para la limpieza, desinfección y mantenimiento preventivo institucional e industrial en todo el Perú.
              </p>
              <div className="flex items-center gap-1.5 text-[#ffcc33] font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Registro Sanitario DIGESA Vigente</span>
              </div>
            </div>

            {/* Columna 2: Logística y Almacén */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-xs border-b border-blue-400/40 pb-1.5">
                Almacén & Distribución
              </h4>
              <ul className="space-y-1.5 text-blue-100">
                <li className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#ffcc33]" />
                  <span>Planta Central: Ate / Separadora Industrial, Lima</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#ffcc33]" />
                  <span>Flota propia con telemetría satelital</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#ffcc33]" />
                  <span>Turnos: Lun a Sáb 8:00 AM - 6:00 PM</span>
                </li>
              </ul>
            </div>

            {/* Columna 3: Accesos Rápidos por Rol */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-xs border-b border-blue-400/40 pb-1.5">
                Plataforma Logística
              </h4>
              <div className="flex flex-col space-y-1.5 text-blue-100 font-semibold">
                <button
                  onClick={() => setRole('cliente')}
                  className="text-left hover:text-[#ffcc33] transition"
                >
                  🛒 Tienda en Línea y Catálogo
                </button>
                <button
                  onClick={() => setRole('jefe_almacen')}
                  className="text-left hover:text-[#ffcc33] transition"
                >
                  📦 Panel Jefe de Almacén (Alertas)
                </button>
                <button
                  onClick={() => setRole('repartidor')}
                  className="text-left hover:text-[#ffcc33] transition"
                >
                  🚚 App Repartidor (GPS en Vivo)
                </button>
                <button
                  onClick={() => setRole('trabajador')}
                  className="text-left hover:text-[#ffcc33] transition"
                >
                  👷 Operario de Picking
                </button>
                <button
                  onClick={() => setRole('proveedor')}
                  className="text-left hover:text-[#ffcc33] transition"
                >
                  🏢 Portal Proveedores
                </button>
                <button
                  onClick={() => setRole('admin')}
                  className="text-left hover:text-[#ffcc33] transition"
                >
                  👑 Panel Administrador
                </button>
              </div>
            </div>

            {/* Columna 4: Contacto */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-white uppercase tracking-wider text-xs border-b border-blue-400/40 pb-1.5">
                Atención al Cliente
              </h4>
              <p className="text-blue-100">
                Línea Directa Lima: <strong>(01) 719-5400</strong>
              </p>
              <p className="text-blue-100">
                Ventas Corporativas: <strong>ventas@solcleanperu.com</strong>
              </p>
              <div className="pt-2">
                <span className="inline-block bg-[#03519e] text-white px-2.5 py-1 rounded text-[10px] font-mono border border-blue-400/30">
                  RUC: 20601894211 • SOL CLEAN PERÚ S.A.C.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-blue-500/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-blue-200">
            <span>© 2026 Sol Clean Perú. Todos los derechos reservados.</span>
            <span>Sistema Web Logístico Anti-Cuellos de Botella con Geolocalización Satelital</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
