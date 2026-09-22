export type UserRole = 
  | 'cliente' 
  | 'jefe_almacen' 
  | 'repartidor' 
  | 'trabajador' 
  | 'proveedor' 
  | 'admin';

export type ProductCategory = 
  | 'Hogar' 
  | 'Ropa' 
  | 'Cocina' 
  | 'Baño' 
  | 'Hoteles' 
  | 'Auto' 
  | 'Accesorios' 
  | 'Papelería';

export interface ProductPresentation {
  size: string; // '1 Litro' | '1 Galón (3.8L)' | 'Bidón 20L'
  price: number; // in S/ PEN
  stock: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  description: string;
  image: string;
  presentations: ProductPresentation[];
  basePrice: number;
  totalStock: number;
  minStockAlert: number;
  isPopular?: boolean;
}

export interface CartItem {
  product: Product;
  presentation: ProductPresentation;
  quantity: number;
}

export type OrderStatus = 
  | 'pendiente'        // Recién ingresado por el cliente
  | 'en_preparacion'   // Operario en almacén haciendo picking
  | 'listo_despacho'   // Empacado listo para que el repartidor cargue
  | 'en_camino'        // Repartidor en ruta con GPS activo
  | 'entregado'        // Cliente recibió el pedido
  | 'cancelado';

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface DeliveryLocation extends GeoCoordinate {
  address: string;
  reference: string;
  district: string;
  city: string;
}

export interface DriverTelemetry {
  driverId: string;
  driverName: string;
  vehiclePlate: string;
  vehicleModel: string;
  phone: string;
  currentPosition: GeoCoordinate;
  pathTraveled: Array<GeoCoordinate & { timestamp: string; speed?: number }>;
  etaMinutes: number;
  speedKmh: number;
  startedAt?: string;
  lastUpdated: string;
  isMoving: boolean;
  distanceRemainingKm: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  presentation: string;
  unitPrice: number;
  quantity: number;
  picked?: boolean; // Para checklist de operario
}

export interface Order {
  id: string;
  orderNumber: string; // ej: SC-2026-0842
  createdAt: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTimeWindow: string; // ej: '09:00 - 13:00' o '14:00 - 18:00'
  customer: {
    id?: string;
    name: string;
    email: string;
    phone: string;
    dniRuc?: string;
    companyName?: string;
  };
  deliveryLocation: DeliveryLocation;
  items: OrderItem[];
  subtotal: number;
  igv: number; // 18%
  deliveryFee: number;
  total: number;
  paymentMethod: 'yape' | 'plin' | 'transferencia' | 'contraentrega';
  status: OrderStatus;
  notes?: string;
  assignedWorkerId?: string; // Operario de picking
  assignedWorkerName?: string;
  assignedDriverId?: string; // Conductor repartidor
  assignedDriverName?: string;
  telemetry?: DriverTelemetry;
  deliveryProof?: {
    receivedBy: string;
    deliveredAt: string;
    notes?: string;
  };
}

export interface SupplierOrder {
  id: string;
  code: string;
  supplierName: string;
  supplierRuc: string;
  createdAt: string;
  expectedDate: string;
  items: Array<{
    rawMaterial: string;
    quantity: number;
    unit: string;
    cost: number;
  }>;
  totalCost: number;
  status: 'solicitado' | 'en_transito' | 'recibido_almacen';
  notes?: string;
}

export interface WarehouseWorker {
  id: string;
  name: string;
  role: 'operario' | 'repartidor';
  phone: string;
  vehiclePlate?: string;
  status: 'disponible' | 'en_ruta' | 'en_picking' | 'inactivo';
  currentActiveOrderId?: string;
}
