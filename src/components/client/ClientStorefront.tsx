import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/appStore';
import { ProductCategory, Product } from '../../types';
import { ProductCard } from './ProductCard';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Filter
} from 'lucide-react';

export const ClientStorefront: React.FC = () => {
  const { products } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  const categories: Array<string> = [
    'Todos',
    'Hogar',
    'Ropa',
    'Cocina',
    'Baño',
    'Hoteles',
    'Auto',
    'Accesorios',
    'Papelería',
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Banner Sol Clean */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0066cc] via-[#0052a3] to-sky-800 text-white shadow-lg">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-6xl mx-auto p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffcc33] text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nuevo Sistema de Despachos Digital 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Limpieza profesional directa de planta a tu puerta
            </h1>

            <p className="text-sm sm:text-base text-blue-100">
              Ahora tus pedidos se conectan directamente con nuestro <strong>Almacén Central</strong> mediante 
              geolocalización satelital. Programa tu fecha y monitorea tu entrega en vivo sin esperas en WhatsApp.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-blue-100">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#ffcc33]" />
                Fórmulas Concentradas
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#ffcc33]" />
                Geolocalización GPS Exacta
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-[#ffcc33]" />
                Flota con Rastreo Satelital
              </span>
            </div>
          </div>

          <div className="w-full md:w-auto flex justify-center">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-xl max-w-xs text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#ffcc33] text-slate-900 flex items-center justify-center font-black text-2xl shadow-lg">
                📍
              </div>
              <h3 className="font-bold text-sm text-white">
                Evita Cuellos de Botella
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                Selecciona tu ubicación en el mapa al comprar. Nuestro jefe de almacén recibe la orden al instante con tus coordenadas exactas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Categorías */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0066cc] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Buscador de texto */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar lejía, suavizante, desengrasante..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid de productos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-slate-900">
            Catálogo Institucional Sol Clean ({filteredProducts.length} productos)
          </h2>
          <span className="text-xs text-slate-500">
            Precios en Soles (PEN) con IGV desglosado
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <p className="text-slate-500 text-sm font-semibold">
              No se encontraron productos que coincidan con "{searchTerm}" en la categoría seleccionada.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
