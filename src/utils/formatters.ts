import { OrderStatus } from '../types';

export function formatPEN(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function getStatusDetails(status: OrderStatus): {
  label: string;
  badgeClass: string;
  stepNumber: number;
} {
  switch (status) {
    case 'pendiente':
      return {
        label: 'Pendiente Almacén',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
        stepNumber: 1,
      };
    case 'en_preparacion':
      return {
        label: 'En Armado (Picking)',
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
        stepNumber: 2,
      };
    case 'listo_despacho':
      return {
        label: 'Listo para Despacho',
        badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
        stepNumber: 3,
      };
    case 'en_camino':
      return {
        label: 'En Camino (GPS en Vivo)',
        badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse',
        stepNumber: 4,
      };
    case 'entregado':
      return {
        label: 'Entregado con Éxito',
        badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        stepNumber: 5,
      };
    case 'cancelado':
      return {
        label: 'Cancelado',
        badgeClass: 'bg-red-100 text-red-800 border-red-300',
        stepNumber: 0,
      };
    default:
      return {
        label: status,
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        stepNumber: 0,
      };
  }
}
