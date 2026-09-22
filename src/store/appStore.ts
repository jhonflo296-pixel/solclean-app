import { useState, useEffect } from 'react';
import { 
  UserRole, 
  Product, 
  Order, 
  CartItem, 
  OrderStatus, 
  SupplierOrder, 
  WarehouseWorker, 
  DeliveryLocation,
  GeoCoordinate
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_ORDERS, 
  INITIAL_SUPPLIER_ORDERS, 
  WAREHOUSE_WORKERS 
} from '../data/mockData';
import { soundAlerts } from '../utils/soundAlerts';
import { 
  WAREHOUSE_LOCATION, 
  calculateDistanceKm, 
  calculateEtaMinutes, 
  generateRouteWaypoints 
} from '../utils/geoUtils';

const STORAGE_KEYS = {
  ROLE: 'solclean_current_role',
  PRODUCTS: 'solclean_products',
  ORDERS: 'solclean_orders',
  SUPPLIER_ORDERS: 'solclean_supplier_orders',
  WORKERS: 'solclean_workers',
  CART: 'solclean_cart',
};

// Singleton in-memory state with subscribers
class StoreManager {
  private currentRole: UserRole = 'cliente';
  private products: Product[] = [];
  private orders: Order[] = [];
  private supplierOrders: SupplierOrder[] = [];
  private workers: WarehouseWorker[] = [];
  private cart: CartItem[] = [];
  private activeSimulations: Map<string, number> = new Map(); // orderId -> intervalId
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedRole = localStorage.getItem(STORAGE_KEYS.ROLE);
      if (storedRole) this.currentRole = storedRole as UserRole;

      const storedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      this.products = storedProducts ? JSON.parse(storedProducts) : INITIAL_PRODUCTS;

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS);
      this.orders = storedOrders ? JSON.parse(storedOrders) : INITIAL_ORDERS;

      const storedSuppliers = localStorage.getItem(STORAGE_KEYS.SUPPLIER_ORDERS);
      this.supplierOrders = storedSuppliers ? JSON.parse(storedSuppliers) : INITIAL_SUPPLIER_ORDERS;

      const storedWorkers = localStorage.getItem(STORAGE_KEYS.WORKERS);
      this.workers = storedWorkers ? JSON.parse(storedWorkers) : WAREHOUSE_WORKERS;

      const storedCart = localStorage.getItem(STORAGE_KEYS.CART);
      this.cart = storedCart ? JSON.parse(storedCart) : [];
    } catch {
      this.products = INITIAL_PRODUCTS;
      this.orders = INITIAL_ORDERS;
      this.supplierOrders = INITIAL_SUPPLIER_ORDERS;
      this.workers = WAREHOUSE_WORKERS;
      this.cart = [];
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLE, this.currentRole);
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(this.orders));
      localStorage.setItem(STORAGE_KEYS.SUPPLIER_ORDERS, JSON.stringify(this.supplierOrders));
      localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(this.workers));
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(this.cart));
    } catch {
      // storage limit fallback
    }
  }

  public subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify() {
    this.saveState();
    this.subscribers.forEach((cb) => cb());
  }

  // Getters
  public getRole() { return this.currentRole; }
  public getProducts() { return this.products; }
  public getOrders() { return this.orders; }
  public getSupplierOrders() { return this.supplierOrders; }
  public getWorkers() { return this.workers; }
  public getCart() { return this.cart; }

  // Setters & Actions
  public setRole(role: UserRole) {
    this.currentRole = role;
    this.notify();
  }

  // Cart actions
  public addToCart(item: CartItem) {
    const existingIndex = this.cart.findIndex(
      (c) => c.product.id === item.product.id && c.presentation.size === item.presentation.size
    );

    if (existingIndex >= 0) {
      this.cart[existingIndex].quantity += item.quantity;
    } else {
      this.cart.push(item);
    }
    this.notify();
  }

  public updateCartQuantity(productId: string, size: string, quantity: number) {
    if (quantity <= 0) {
      this.cart = this.cart.filter(
        (c) => !(c.product.id === productId && c.presentation.size === size)
      );
    } else {
      const item = this.cart.find(
        (c) => c.product.id === productId && c.presentation.size === size
      );
      if (item) item.quantity = quantity;
    }
    this.notify();
  }

  public clearCart() {
    this.cart = [];
    this.notify();
  }

  // Orders Actions
  public createOrder(orderData: {
    customer: { name: string; email: string; phone: string; dniRuc?: string };
    deliveryLocation: DeliveryLocation;
    paymentMethod: 'yape' | 'plin' | 'transferencia' | 'contraentrega';
    scheduledDate: string;
    scheduledTimeWindow: string;
    notes?: string;
  }): Order {
    const subtotal = this.cart.reduce(
      (sum, item) => sum + item.presentation.price * item.quantity,
      0
    );
    const igv = subtotal * 0.18;
    const distance = calculateDistanceKm(WAREHOUSE_LOCATION, orderData.deliveryLocation);
    const deliveryFee = distance > 15 ? 20 : distance > 8 ? 15 : 10;
    const total = subtotal + igv + deliveryFee;

    const orderNumber = `SC-2026-${String(this.orders.length + 1).padStart(3, '0')}`;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      scheduledDate: orderData.scheduledDate,
      scheduledTimeWindow: orderData.scheduledTimeWindow,
      customer: orderData.customer,
      deliveryLocation: orderData.deliveryLocation,
      items: this.cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        productImage: c.product.image,
        presentation: c.presentation.size,
        unitPrice: c.presentation.price,
        quantity: c.quantity,
        picked: false,
      })),
      subtotal: Math.round(subtotal * 100) / 100,
      igv: Math.round(igv * 100) / 100,
      deliveryFee,
      total: Math.round(total * 100) / 100,
      paymentMethod: orderData.paymentMethod,
      status: 'pendiente',
      notes: orderData.notes,
    };

    this.orders = [newOrder, ...this.orders];
    this.clearCart();

    // Reducir stock
    newOrder.items.forEach((item) => {
      const prod = this.products.find((p) => p.id === item.productId);
      if (prod) {
        prod.totalStock = Math.max(0, prod.totalStock - item.quantity);
        const pres = prod.presentations.find((pr) => pr.size === item.presentation);
        if (pres) pres.stock = Math.max(0, pres.stock - item.quantity);
      }
    });

    // 🔔 ¡Alerta sonora y visual inmediata para el Jefe de Almacén!
    soundAlerts.playNewOrderAlert();

    this.notify();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    order.status = status;

    if (status === 'entregado') {
      this.stopSimulation(orderId);
      if (order.telemetry) {
        order.telemetry.isMoving = false;
        order.telemetry.etaMinutes = 0;
        order.telemetry.distanceRemainingKm = 0;
      }
      soundAlerts.playSuccessTone();
    }

    this.notify();
  }

  public toggleItemPicked(orderId: string, productId: string, presentation: string) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    const item = order.items.find(
      (i) => i.productId === productId && i.presentation === presentation
    );
    if (item) {
      item.picked = !item.picked;
      // Si todos los items están recogidos, sugerir listo_despacho
      const allPicked = order.items.every((i) => i.picked);
      if (allPicked && order.status === 'en_preparacion') {
        order.status = 'listo_despacho';
        soundAlerts.playSuccessTone();
      }
      this.notify();
    }
  }

  public assignWorker(orderId: string, workerId: string) {
    const order = this.orders.find((o) => o.id === orderId);
    const worker = this.workers.find((w) => w.id === workerId);
    if (!order || !worker) return;

    if (worker.role === 'operario') {
      order.assignedWorkerId = worker.id;
      order.assignedWorkerName = worker.name;
      if (order.status === 'pendiente') {
        order.status = 'en_preparacion';
      }
    } else if (worker.role === 'repartidor') {
      order.assignedDriverId = worker.id;
      order.assignedDriverName = worker.name;
    }

    this.notify();
  }

  // Iniciar ruta de despacho con GPS en tiempo real
  public startDriverRoute(orderId: string, driverId: string) {
    const order = this.orders.find((o) => o.id === orderId);
    const driver = this.workers.find((w) => w.id === driverId);
    if (!order || !driver) return;

    order.status = 'en_camino';
    order.assignedDriverId = driver.id;
    order.assignedDriverName = driver.name;

    const totalDist = calculateDistanceKm(WAREHOUSE_LOCATION, order.deliveryLocation);
    const eta = calculateEtaMinutes(totalDist);

    order.telemetry = {
      driverId: driver.id,
      driverName: driver.name,
      vehiclePlate: driver.vehiclePlate || 'SC-TRUCK-01',
      vehicleModel: 'Camioneta Sol Clean Reparto Rápido',
      phone: driver.phone,
      currentPosition: { ...WAREHOUSE_LOCATION },
      pathTraveled: [
        {
          lat: WAREHOUSE_LOCATION.lat,
          lng: WAREHOUSE_LOCATION.lng,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          speed: 0,
        },
      ],
      etaMinutes: eta,
      speedKmh: 30,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lastUpdated: 'Recién iniciado',
      isMoving: true,
      distanceRemainingKm: totalDist,
    };

    driver.status = 'en_ruta';
    driver.currentActiveOrderId = order.id;

    soundAlerts.playSuccessTone();
    this.notify();

    // Iniciar simulación de recorrido automático
    this.startSimulation(orderId);
  }

  // Motor de simulación de GPS en tiempo real para repartidores
  public startSimulation(orderId: string) {
    this.stopSimulation(orderId);

    const order = this.orders.find((o) => o.id === orderId);
    if (!order || !order.telemetry) return;

    const waypoints = generateRouteWaypoints(
      WAREHOUSE_LOCATION,
      order.deliveryLocation,
      25 // 25 pasos progresivos
    );

    let currentStep = 0;

    const interval = window.setInterval(() => {
      const liveOrder = this.orders.find((o) => o.id === orderId);
      if (!liveOrder || liveOrder.status !== 'en_camino' || !liveOrder.telemetry) {
        this.stopSimulation(orderId);
        return;
      }

      currentStep++;

      if (currentStep >= waypoints.length) {
        // Llegó al destino
        liveOrder.telemetry.currentPosition = { ...liveOrder.deliveryLocation };
        liveOrder.telemetry.distanceRemainingKm = 0;
        liveOrder.telemetry.etaMinutes = 1;
        liveOrder.telemetry.isMoving = false;
        liveOrder.telemetry.speedKmh = 0;
        liveOrder.telemetry.lastUpdated = 'En puerta del cliente';
        liveOrder.telemetry.pathTraveled.push({
          lat: liveOrder.deliveryLocation.lat,
          lng: liveOrder.deliveryLocation.lng,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          speed: 0,
        });

        this.stopSimulation(orderId);
        this.notify();
        return;
      }

      const nextPoint = waypoints[currentStep];
      const remainingDist = calculateDistanceKm(nextPoint, liveOrder.deliveryLocation);
      const currentSpeed = Math.floor(Math.random() * 15) + 25; // 25-40 km/h

      liveOrder.telemetry.currentPosition = nextPoint;
      liveOrder.telemetry.distanceRemainingKm = remainingDist;
      liveOrder.telemetry.etaMinutes = calculateEtaMinutes(remainingDist, currentSpeed);
      liveOrder.telemetry.speedKmh = currentSpeed;
      liveOrder.telemetry.isMoving = true;
      liveOrder.telemetry.lastUpdated = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Trazado de ruta recorrida (seguridad anti-desvíos)
      liveOrder.telemetry.pathTraveled.push({
        lat: nextPoint.lat,
        lng: nextPoint.lng,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        speed: currentSpeed,
      });

      this.notify();
    }, 3500); // Avanza cada 3.5 segundos para mostrar animación fluida

    this.activeSimulations.set(orderId, interval);
  }

  public stopSimulation(orderId: string) {
    const interval = this.activeSimulations.get(orderId);
    if (interval) {
      clearInterval(interval);
      this.activeSimulations.delete(orderId);
    }
  }

  // Actualización manual de GPS por parte del conductor (usando GPS nativo del móvil)
  public updateDriverLocation(orderId: string, coord: GeoCoordinate, speedKmh: number = 30) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order || !order.telemetry) return;

    const remainingDist = calculateDistanceKm(coord, order.deliveryLocation);
    const eta = calculateEtaMinutes(remainingDist, speedKmh);

    order.telemetry.currentPosition = coord;
    order.telemetry.speedKmh = speedKmh;
    order.telemetry.distanceRemainingKm = remainingDist;
    order.telemetry.etaMinutes = eta;
    order.telemetry.lastUpdated = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    order.telemetry.pathTraveled.push({
      lat: coord.lat,
      lng: coord.lng,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      speed: speedKmh,
    });

    this.notify();
  }

  public confirmDelivery(orderId: string, proof: { receivedBy: string; notes?: string }) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    this.stopSimulation(orderId);
    order.status = 'entregado';
    order.deliveryProof = {
      receivedBy: proof.receivedBy,
      deliveredAt: new Date().toISOString(),
      notes: proof.notes,
    };

    if (order.telemetry) {
      order.telemetry.isMoving = false;
      order.telemetry.etaMinutes = 0;
      order.telemetry.distanceRemainingKm = 0;
    }

    if (order.assignedDriverId) {
      const driver = this.workers.find((w) => w.id === order.assignedDriverId);
      if (driver) {
        driver.status = 'disponible';
        driver.currentActiveOrderId = undefined;
      }
    }

    soundAlerts.playSuccessTone();
    this.notify();
  }

  // Proveedores
  public createSupplierOrder(data: {
    supplierName: string;
    supplierRuc: string;
    items: Array<{ rawMaterial: string; quantity: number; unit: string; cost: number }>;
    expectedDate: string;
    notes?: string;
  }) {
    const totalCost = data.items.reduce((sum, item) => sum + item.cost, 0);
    const newPO: SupplierOrder = {
      id: `sup-${Date.now()}`,
      code: `OC-2026-${String(this.supplierOrders.length + 1).padStart(3, '0')}`,
      supplierName: data.supplierName,
      supplierRuc: data.supplierRuc,
      createdAt: new Date().toISOString(),
      expectedDate: data.expectedDate,
      items: data.items,
      totalCost,
      status: 'solicitado',
      notes: data.notes,
    };

    this.supplierOrders = [newPO, ...this.supplierOrders];
    this.notify();
    return newPO;
  }

  public updateSupplierOrderStatus(orderId: string, status: 'solicitado' | 'en_transito' | 'recibido_almacen') {
    const po = this.supplierOrders.find((s) => s.id === orderId);
    if (!po) return;

    po.status = status;
    soundAlerts.playSuccessTone();
    this.notify();
  }

  // Inventario & Productos
  public updateProductStock(productId: string, newTotalStock: number) {
    const prod = this.products.find((p) => p.id === productId);
    if (prod) {
      prod.totalStock = newTotalStock;
      this.notify();
    }
  }

  public addProduct(product: Omit<Product, 'id'>) {
    const newProd: Product = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    this.products.push(newProd);
    this.notify();
  }

  public updateProduct(productId: string, updates: Partial<Product>) {
    const prod = this.products.find((p) => p.id === productId);
    if (prod) {
      Object.assign(prod, updates);
      this.notify();
    }
  }

  public stepSimulationForward(orderId: string) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order || !order.telemetry) return;

    const waypoints = generateRouteWaypoints(
      WAREHOUSE_LOCATION,
      order.deliveryLocation,
      25
    );

    const currentLen = order.telemetry.pathTraveled.length;
    if (currentLen >= waypoints.length) {
      this.fastForwardSimulation(orderId);
      return;
    }

    const nextPoint = waypoints[currentLen];
    const remainingDist = calculateDistanceKm(nextPoint, order.deliveryLocation);
    const speed = Math.floor(Math.random() * 15) + 25;

    order.telemetry.currentPosition = nextPoint;
    order.telemetry.distanceRemainingKm = remainingDist;
    order.telemetry.etaMinutes = calculateEtaMinutes(remainingDist, speed);
    order.telemetry.speedKmh = speed;
    order.telemetry.lastUpdated = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    order.telemetry.pathTraveled.push({
      lat: nextPoint.lat,
      lng: nextPoint.lng,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      speed,
    });

    this.notify();
  }

  public fastForwardSimulation(orderId: string) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order || !order.telemetry) return;

    this.stopSimulation(orderId);
    order.telemetry.currentPosition = { ...order.deliveryLocation };
    order.telemetry.distanceRemainingKm = 0;
    order.telemetry.etaMinutes = 1;
    order.telemetry.speedKmh = 0;
    order.telemetry.isMoving = false;
    order.telemetry.lastUpdated = 'En puerta del cliente (Listo para entrega)';
    order.telemetry.pathTraveled.push({
      lat: order.deliveryLocation.lat,
      lng: order.deliveryLocation.lng,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      speed: 0,
    });

    soundAlerts.playSuccessTone();
    this.notify();
  }

  public createDemoOrder(): Order {
    const demoCustomers = [
      { name: 'Hotel & Suites Miraflores Park', district: 'Miraflores', lat: -12.1298, lng: -77.0264, addr: 'Av. Malecón de la Reserva 1035' },
      { name: 'Clínica San Borja Salud', district: 'San Borja', lat: -12.0886, lng: -76.9995, addr: 'Av. Guardia Civil 337' },
      { name: 'Restaurante Central Cevichero', district: 'San Isidro', lat: -12.0975, lng: -77.0345, addr: 'Av. Camino Real 456' },
      { name: 'Colegio Mayor San Fernando', district: 'Surco (Santiago de Surco)', lat: -12.1384, lng: -76.9942, addr: 'Calle Las Camelias 240' },
      { name: 'Sede Corporativa Los Olivos', district: 'Los Olivos', lat: -11.9682, lng: -77.0658, addr: 'Av. Carlos Izaguirre 880' },
    ];

    const pick = demoCustomers[Math.floor(Math.random() * demoCustomers.length)];
    const randProd1 = this.products[0] || INITIAL_PRODUCTS[0];
    const randProd2 = this.products[1] || INITIAL_PRODUCTS[1];

    const subtotal = (randProd1.basePrice * 2) + (randProd2.basePrice * 3);
    const igv = subtotal * 0.18;
    const distance = calculateDistanceKm(WAREHOUSE_LOCATION, { lat: pick.lat, lng: pick.lng });
    const deliveryFee = distance > 15 ? 20 : distance > 8 ? 15 : 10;
    const total = subtotal + igv + deliveryFee;

    const orderNumber = `SC-2026-${String(this.orders.length + 1).padStart(3, '0')}`;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTimeWindow: 'Urgente Express',
      customer: {
        name: pick.name,
        email: 'contacto@cliente-demo.pe',
        phone: '9' + Math.floor(10000000 + Math.random() * 90000000),
        dniRuc: '20' + Math.floor(100000000 + Math.random() * 900000000),
      },
      deliveryLocation: {
        lat: pick.lat,
        lng: pick.lng,
        address: pick.addr,
        reference: 'Frente a puerta principal',
        district: pick.district,
        city: 'Lima',
      },
      items: [
        {
          productId: randProd1.id,
          productName: randProd1.name,
          productImage: randProd1.image,
          presentation: randProd1.presentations[0]?.size || '1 Galón',
          unitPrice: randProd1.basePrice,
          quantity: 2,
          picked: false,
        },
        {
          productId: randProd2.id,
          productName: randProd2.name,
          productImage: randProd2.image,
          presentation: randProd2.presentations[0]?.size || '1 Galón',
          unitPrice: randProd2.basePrice,
          quantity: 3,
          picked: false,
        },
      ],
      subtotal: Math.round(subtotal * 100) / 100,
      igv: Math.round(igv * 100) / 100,
      deliveryFee,
      total: Math.round(total * 100) / 100,
      paymentMethod: 'yape',
      status: 'pendiente',
      notes: 'Pedido de prueba express con geolocalización satelital.',
    };

    this.orders = [newOrder, ...this.orders];

    // 🔔 ¡Alerta sonora instantánea para el Jefe de Almacén!
    soundAlerts.playNewOrderAlert();

    this.notify();
    return newOrder;
  }

  public resetToDefaultData() {
    this.products = INITIAL_PRODUCTS;
    this.orders = INITIAL_ORDERS;
    this.supplierOrders = INITIAL_SUPPLIER_ORDERS;
    this.workers = WAREHOUSE_WORKERS;
    this.cart = [];
    localStorage.clear();
    this.notify();
  }
}

export const store = new StoreManager();

/**
 * Hook de React para conectar componentes al estado central reactivo
 */
export function useAppStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    role: store.getRole(),
    products: store.getProducts(),
    orders: store.getOrders(),
    supplierOrders: store.getSupplierOrders(),
    workers: store.getWorkers(),
    cart: store.getCart(),
    setRole: (r: UserRole) => store.setRole(r),
    addToCart: (item: CartItem) => store.addToCart(item),
    updateCartQuantity: (id: string, size: string, q: number) => store.updateCartQuantity(id, size, q),
    clearCart: () => store.clearCart(),
    createOrder: (data: Parameters<typeof store.createOrder>[0]) => store.createOrder(data),
    updateOrderStatus: (id: string, s: OrderStatus) => store.updateOrderStatus(id, s),
    toggleItemPicked: (oId: string, pId: string, pres: string) => store.toggleItemPicked(oId, pId, pres),
    assignWorker: (oId: string, wId: string) => store.assignWorker(oId, wId),
    startDriverRoute: (oId: string, dId: string) => store.startDriverRoute(oId, dId),
    confirmDelivery: (oId: string, p: Parameters<typeof store.confirmDelivery>[1]) => store.confirmDelivery(oId, p),
    updateDriverLocation: (oId: string, c: GeoCoordinate, s?: number) => store.updateDriverLocation(oId, c, s),
    createSupplierOrder: (d: Parameters<typeof store.createSupplierOrder>[0]) => store.createSupplierOrder(d),
    updateSupplierOrderStatus: (id: string, s: Parameters<typeof store.updateSupplierOrderStatus>[1]) => store.updateSupplierOrderStatus(id, s),
    updateProductStock: (id: string, s: number) => store.updateProductStock(id, s),
    addProduct: (p: Parameters<typeof store.addProduct>[0]) => store.addProduct(p),
    updateProduct: (id: string, u: Parameters<typeof store.updateProduct>[1]) => store.updateProduct(id, u),
    createDemoOrder: () => store.createDemoOrder(),
    stepSimulationForward: (oId: string) => store.stepSimulationForward(oId),
    fastForwardSimulation: (oId: string) => store.fastForwardSimulation(oId),
    resetToDefaultData: () => store.resetToDefaultData(),
  };
}
