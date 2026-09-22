# 🧼 Sol Clean Perú - Sistema Web Integral de Pedidos, Almacén y Rastreo GPS en Vivo

Aplicativo web completo desarrollado para **Sol Clean Perú** (empresa líder en productos de limpieza, mantenimiento y desinfección institucional e industrial).

Diseñado específicamente para **eliminar los cuellos de botella generados por el modelo tradicional de WhatsApp**, conectando de forma directa y automatizada a los participantes de la cadena logística:
1. **🛒 Cliente**: Tienda con catálogo fiel a Sol Clean Perú, carrito con cálculo de impuestos y **checkout con mapa de geolocalización GPS** (OpenStreetMap/Leaflet).
2. **📦 Jefe de Almacén**: Centro neurálgico con **alerta sonora y visual inmediata** de nuevos pedidos, organización de despachos por fecha y torre de control satelital.
3. **🚚 Repartidor (Delivery GPS)**: Aplicativo móvil con lista de entregas, navegación satelital, **trazado de la ruta recorrida en tiempo real (auditoría de seguridad anti-robo y anti-desvíos)** y cálculo de ETA en minutos para el cliente.
4. **👷 Operario de Almacén**: Checklist interactivo de verificación (picking) producto por producto antes de despacho.
5. **🏢 Proveedor**: Portal de abastecimiento de materia prima (hipoclorito, tensoactivos, envases PEAD, bidones 20L).
6. **👑 Administrador**: Dashboard ejecutivo de ventas, auditoría de rutas y gestión de inventario.

---

## 🚀 Tecnologías Utilizadas

- **Frontend & Core**: React 19, TypeScript, Vite.
- **Estilos & UI**: Tailwind CSS v4, Lucide Icons.
- **Mapas & Geolocalización**: Leaflet, OpenStreetMap (100% interactivo, sin dependencia de API keys de pago, soporte para Lima y distritos de Perú).
- **Audio & Notificaciones**: Web Audio API para alertas sonoras del jefe de almacén.
- **Persistencia**: LocalStorage reactivo con sincronización multi-rol.

---

## 🛠️ Instalación y Ejecución Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/jhonflo296-pixel/solclean-app.git
   cd solclean-app
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Iniciar en modo desarrollo**:
   ```bash
   npm run dev
   ```

4. **Compilar para producción**:
   ```bash
   npm run build
   ```

---

## 📌 Roles y Flujo de Trabajo

- **Barra de Roles Rápida**: En la cabecera puedes alternar instantáneamente entre los 6 roles para probar todo el flujo en segundos.
- **Flujo de Prueba**:
  1. Como **Cliente**, agrega productos al carrito, abre el checkout y ubica tu pin en el mapa de Lima.
  2. Como **Jefe de Almacén**, escucha la alerta sonora y visual del nuevo pedido en la torre satelital. Asigna operario y chofer.
  3. Como **Operario**, haz el picking de productos y marca *"Listo para Despacho"*.
  4. Como **Repartidor**, inicia la ruta: el vehículo comenzará a moverse por el mapa trazando el camino recorrido y recalculando el tiempo de llegada (ETA) para el cliente.
  5. Como **Cliente**, observa tu pedido acercándose en tiempo real.

---

© 2026 Sol Clean Perú S.A.C. - Todos los derechos reservados.
