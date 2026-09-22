import L from 'leaflet';

export function createWarehouseIcon() {
  return L.divIcon({
    className: 'custom-warehouse-marker',
    html: `
      <div style="
        background: #0066cc;
        color: white;
        border: 3px solid #ffcc33;
        border-radius: 50%;
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,102,204,0.45);
        font-size: 20px;
        cursor: pointer;
        position: relative;
      ">
        🏭
        <span style="
          position: absolute;
          bottom: -18px;
          background: #0066cc;
          color: #ffcc33;
          font-size: 9px;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 4px;
          white-space: nowrap;
          border: 1px solid #ffcc33;
        ">Almacén Central</span>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}

export function createCustomerIcon(status: string = 'pendiente') {
  const isDelivered = status === 'entregado';
  const color = isDelivered ? '#10b981' : '#f59e0b';
  const iconEmoji = isDelivered ? '✅' : '📍';

  return L.divIcon({
    className: 'custom-customer-marker',
    html: `
      <div style="
        background: ${color};
        color: white;
        border: 2px solid white;
        border-radius: 50%;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        font-size: 18px;
        cursor: pointer;
      ">
        ${iconEmoji}
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
}

export function createDriverVehicleIcon(plate: string = '', isMoving: boolean = true) {
  return L.divIcon({
    className: 'custom-driver-vehicle-marker',
    html: `
      <div style="position: relative; cursor: pointer;">
        <div class="${isMoving ? 'driver-pulse-pin' : ''}" style="
          background: #0066cc;
          color: white;
          border: 3px solid #ffcc33;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0,102,204,0.5);
          font-size: 24px;
        ">
          🚚
        </div>
        ${plate ? `
          <div style="
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: #1e293b;
            color: #ffcc33;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 6px;
            border-radius: 4px;
            white-space: nowrap;
            letter-spacing: 0.5px;
            border: 1px solid #475569;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          ">
            ${plate}
          </div>
        ` : ''}
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
}
