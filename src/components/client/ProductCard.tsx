import React, { useState } from 'react';
import { Product, ProductPresentation } from '../../types';
import { useAppStore } from '../../store/appStore';
import { formatPEN } from '../../utils/formatters';
import { ShoppingCart, Check, ShieldAlert } from 'lucide-react';

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const { addToCart } = useAppStore();
  const [selectedPresentation, setSelectedPresentation] = useState<ProductPresentation>(
    product.presentations[0] || { size: '1 Unidad', price: product.basePrice, stock: product.totalStock }
  );
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      product,
      presentation: selectedPresentation,
      quantity: 1,
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  const isLowStock = selectedPresentation.stock <= 5;
  const isOutOfStock = selectedPresentation.stock === 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col overflow-hidden group">
      {/* Imagen del producto */}
      <div className="relative w-full h-48 bg-slate-50 flex items-center justify-center p-4 overflow-hidden border-b border-slate-100">
        <img
          src={product.image}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
          loading="lazy"
        />

        {/* Badge de categoría */}
        <span className="absolute top-2.5 left-2.5 bg-[#0066cc] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
          {product.category}
        </span>

        {product.isPopular && (
          <span className="absolute top-2.5 right-2.5 bg-[#ffcc33] text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            Top Ventas
          </span>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[11px] font-mono text-slate-600 block mb-1">SKU: {product.sku}</span>
        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 min-h-[40px] group-hover:text-[#0066cc] transition">
          {product.name}
        </h3>
        <p className="text-xs text-slate-600 line-clamp-2 mt-1 mb-3">
          {product.description}
        </p>

        {/* Selector de Presentación (Volumen / Tamaño) */}
        <div className="mt-auto">
          <label className="text-[11px] font-semibold text-slate-600 block mb-1">
            Presentación:
          </label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.presentations.map((pres) => {
              const isSelected = selectedPresentation.size === pres.size;
              return (
                <button
                  key={pres.size}
                  type="button"
                  onClick={() => setSelectedPresentation(pres)}
                  className={`text-[11px] px-2.5 py-1 rounded-md font-semibold transition border ${
                    isSelected
                      ? 'bg-blue-50 text-[#0066cc] border-[#0066cc] ring-1 ring-[#0066cc]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pres.size}
                </button>
              );
            })}
          </div>

          {/* Precio y Stock */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs text-slate-600 block">Precio Unitario:</span>
              <span className="text-xl font-black text-[#0066cc]">
                {formatPEN(selectedPresentation.price)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-600 block">Stock Disponible:</span>
              <span className={`text-xs font-bold ${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'}`}>
                {isOutOfStock ? 'Agotado' : `${selectedPresentation.stock} unid.`}
              </span>
            </div>
          </div>

          {/* Botón de compra */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm active:scale-95 ${
              addedAnimation
                ? 'bg-emerald-600 text-white'
                : isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#0066cc] hover:bg-[#004d99] text-white'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Agregado al Carrito!</span>
              </>
            ) : isOutOfStock ? (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Sin Stock</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Agregar al Carrito</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
