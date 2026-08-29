import { useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "./supabaseClient";

/* =========================================================
   VaniDaxi
   App.jsx — interfaz principal
   ========================================================= */

const CART_KEY = "vanidaxi_cart";
const FAVORITES_KEY = "vanidaxi_favorites";

const WHATSAPP_NUMBER = "5210000000000";

/* =========================================================
   CATEGORÍAS
   Las imágenes sustituyen los iconos de la referencia,
   conservando el tamaño compacto de las tarjetas.
   ========================================================= */

const categories = [
  {
    id: "ropa",
    name: "Ropa y Moda",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: "hogar",
    name: "Hogar y Vida",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: "belleza",
    name: "Belleza",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: "autos",
    name: "Autos y Motos",
    image:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: "comida",
    name: "Comida",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: "juguetes",
    name: "Juguetes",
    image:
      "https://images.unsplash.com/photo-1594784055417-7a4c1b1a1e4b?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: "deportes",
    name: "Deportes",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=85",
  },
];

/* =========================================================
   PRODUCTOS DE DEMOSTRACIÓN
   ========================================================= */

const initialProducts = [
  {
    id: "p1",
    name: "Smartwatch Pro",
    price: 799,
    oldPrice: 1199,
    rating: 4.8,
    reviews: 126,
    discount: 33,
    category: "tecnologia",
    type: "Destacado",
    image:
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?auto=format&fit=crop&w=700&q=85",
    description:
      "Smartwatch moderno con funciones para actividad física, llamadas y notificaciones.",
    specifications: [
      "Pantalla táctil",
      "Monitoreo deportivo",
      "Notificaciones",
      "Resistente a salpicaduras",
    ],
  },
  {
    id: "p2",
    name: "Licuadora Profesional",
    price: 1299,
    oldPrice: 1799,
    rating: 4.7,
    reviews: 84,
    discount: 28,
    category: "hogar",
    type: "Oferta",
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=700&q=85",
    description:
      "Licuadora de alto rendimiento ideal para smoothies, bebidas y preparaciones.",
    specifications: [
      "Motor de alta potencia",
      "Vaso de gran capacidad",
      "Varias velocidades",
      "Cuchillas de acero",
    ],
  },
  {
    id: "p3",
    name: "Tenis Urbanos",
    price: 899,
    oldPrice: 1299,
    rating: 4.9,
    reviews: 203,
    discount: 31,
    category: "ropa",
    type: "Popular",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=85",
    description:
      "Tenis urbanos cómodos y versátiles para uso diario.",
    specifications: [
      "Suela antiderrapante",
      "Diseño urbano",
      "Material transpirable",
      "Uso diario",
    ],
  },
  {
    id: "p4",
    name: "Audífonos Bluetooth",
    price: 549,
    oldPrice: 799,
    rating: 4.6,
    reviews: 178,
    discount: 31,
    category: "tecnologia",
    type: "Oferta",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=85",
    description:
      "Audífonos inalámbricos con sonido envolvente y estuche de carga.",
    specifications: [
      "Bluetooth",
      "Micrófono integrado",
      "Estuche de carga",
      "Controles táctiles",
    ],
  },
];

/* =========================================================
   UTILIDADES
   ========================================================= */

function formatPrice(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Evita que un error de almacenamiento rompa la aplicación.
  }
}

/* =========================================================
   ESTILOS
   Se mantienen dentro del archivo para que el diseño sea
   independiente de App.css.
   ========================================================= */

const styles = `
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  background: #f7f7f9;
  color: #202124;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, Helvetica, Arial, sans-serif;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

a {
  color: inherit;
  text-decoration: none;
}

.vd-app {
  min-height: 100vh;
  background: #f7f7f9;
  padding-bottom: 82px;
}

.vd-shell {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
}

/* ================= HEADER ================= */

.vd-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255,255,255,.97);
  border-bottom: 1px solid #ededf2;
  backdrop-filter: blur(14px);
}

.vd-header-inner {
  min-height: 64px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 9px 18px;
}

.vd-menu-button,
.vd-cart-button {
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 13px;
  background: #fff;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  box-shadow: 0 3px 12px rgba(40,20,80,.08);
}

.vd-menu-button span {
  width: 20px;
  height: 2px;
  background: #7b178e;
  position: relative;
  display: block;
}

.vd-menu-button span::before,
.vd-menu-button span::after {
  content: "";
  width: 20px;
  height: 2px;
  background: #7b178e;
  position: absolute;
  left: 0;
}

.vd-menu-button span::before {
  top: -7px;
}

.vd-menu-button span::after {
  top: 7px;
}

.vd-logo {
  min-width: 126px;
  font-size: 22px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1px;
  background: linear-gradient(90deg,#ef1f35,#d91591,#7219bd);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.vd-search {
  flex: 1;
  height: 42px;
  min-width: 100px;
  border-radius: 14px;
  border: 1px solid #e5e2eb;
  background: #f7f6f9;
  padding: 0 15px 0 42px;
  outline: none;
  color: #333;
}

.vd-search-wrap {
  position: relative;
  flex: 1;
}

.vd-search-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 17px;
  opacity: .65;
}

.vd-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.vd-cart-button {
  position: relative;
  background: linear-gradient(135deg,#ef233c,#d4148e,#7117bd);
  color: #fff;
  box-shadow: 0 5px 15px rgba(191,30,150,.22);
}

.vd-cart-count {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  border-radius: 20px;
  background: #ff3048;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: grid;
  place-items: center;
  border: 2px solid #fff;
}

/* ================= HERO ================= */

.vd-main {
  padding: 14px 18px 0;
}

.vd-hero {
  background: linear-gradient(120deg,#ef233c 0%,#db168b 52%,#7219bd 100%);
  border-radius: 22px;
  min-height: 192px;
  color: white;
  padding: 24px 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 28px rgba(160,20,130,.17);
}

.vd-hero::after {
  content: "";
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  right: -80px;
  top: -110px;
  background: rgba(255,255,255,.09);
}

.vd-hero-content {
  position: relative;
  z-index: 2;
  max-width: 610px;
}

.vd-hero-kicker {
  font-size: 12px;
  font-weight: 800;
  opacity: .9;
  margin-bottom: 7px;
}

.vd-hero h1 {
  margin: 0;
  font-size: clamp(27px,4vw,42px);
  line-height: 1.02;
  letter-spacing: -1.4px;
}

.vd-hero p {
  margin: 10px 0 17px;
  font-size: 14px;
  line-height: 1.45;
  opacity: .94;
}

.vd-hero-button {
  border: 0;
  background: #fff;
  color: #8b157f;
  font-weight: 800;
  border-radius: 12px;
  padding: 10px 17px;
  font-size: 13px;
  box-shadow: 0 5px 14px rgba(0,0,0,.1);
}

/* ================= QUICK CARDS ================= */

.vd-quick-grid {
  display: grid;
  grid-template-columns: repeat(2,1fr);
  gap: 12px;
  margin: 14px 0;
}

.vd-quick-card {
  background: #fff;
  border-radius: 17px;
  padding: 14px;
  min-height: 86px;
  border: 1px solid #eeeef3;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 14px rgba(30,20,70,.045);
}

.vd-quick-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  font-size: 22px;
  background: linear-gradient(135deg,#fff0f2,#fce8f7);
}

.vd-quick-card h3 {
  margin: 0 0 4px;
  font-size: 14px;
}

.vd-quick-card p {
  margin: 0;
  font-size: 11px;
  color: #777;
}

/* ================= SECTIONS ================= */

.vd-section {
  margin-top: 20px;
}

.vd-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.vd-section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -.4px;
}

.vd-section-link {
  border: 0;
  background: transparent;
  font-size: 12px;
  color: #a018a1;
  font-weight: 800;
}

/* ================= CATEGORIES ================= */

.vd-category-scroll {
  display: grid;
  grid-template-columns: repeat(8,minmax(86px,1fr));
  gap: 9px;
}

.vd-category-card {
  background: #fff;
  border: 1px solid #eeeeF3;
  border-radius: 14px;
  overflow: hidden;
  padding: 0;
  min-width: 0;
  box-shadow: 0 3px 11px rgba(40,20,80,.045);
  transition: transform .15s ease, box-shadow .15s ease;
}

.vd-category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 7px 18px rgba(40,20,80,.09);
}

.vd-category-image {
  width: 100%;
  aspect-ratio: 1 / .82;
  object-fit: cover;
  display: block;
}

.vd-category-name {
  min-height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  text-align: center;
  font-size: 10px;
  line-height: 1.1;
  font-weight: 800;
}

/* ================= PROMO ================= */

.vd-promo {
  margin-top: 18px;
  border-radius: 18px;
  padding: 18px 20px;
  color: #fff;
  background: linear-gradient(100deg,#e91e38,#d8168f,#7218bc);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  overflow: hidden;
}

.vd-promo h2 {
  margin: 0 0 4px;
  font-size: 19px;
}

.vd-promo p {
  margin: 0;
  font-size: 11px;
  opacity: .9;
}

.vd-promo-button {
  flex: 0 0 auto;
  border: 0;
  background: #fff;
  color: #8d157e;
  border-radius: 11px;
  padding: 9px 14px;
  font-size: 11px;
  font-weight: 900;
}

/* ================= PRODUCTS ================= */

.vd-product-grid {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 12px;
}

.vd-product-card {
  background: #fff;
  border: 1px solid #eeeef3;
  border-radius: 16px;
  overflow: hidden;
  min-width: 0;
  position: relative;
  box-shadow: 0 4px 13px rgba(30,20,70,.045);
}

.vd-product-image-wrap {
  aspect-ratio: 1 / .92;
  background: #f4f4f6;
  position: relative;
  overflow: hidden;
}

.vd-product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.vd-discount {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #ef2944;
  color: #fff;
  border-radius: 7px;
  padding: 4px 6px;
  font-size: 9px;
  font-weight: 900;
}

.vd-favorite {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: rgba(255,255,255,.92);
  display: grid;
  place-items: center;
  font-size: 15px;
}

.vd-product-info {
  padding: 10px;
}

.vd-product-name {
  margin: 0;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vd-rating {
  margin-top: 5px;
  font-size: 10px;
  color: #7b7b80;
}

.vd-price-row {
  margin-top: 7px;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.vd-price {
  font-size: 15px;
  font-weight: 900;
  color: #202124;
}

.vd-old-price {
  color: #999;
  text-decoration: line-through;
  font-size: 9px;
}

.vd-add {
  margin-top: 8px;
  width: 100%;
  height: 31px;
  border: 0;
  border-radius: 9px;
  color: #fff;
  background: linear-gradient(90deg,#ef233c,#d61791,#7218bd);
  font-size: 10px;
  font-weight: 900;
}

/* ================= BENEFITS ================= */

.vd-benefits {
  display: grid;
  grid-template-columns: repeat(3,1fr);
  gap: 10px;
  margin: 20px 0;
}

.vd-benefit {
  background: #fff;
  border: 1px solid #eeeeF3;
  border-radius: 15px;
  padding: 13px;
  text-align: center;
}

.vd-benefit-icon {
  font-size: 19px;
  margin-bottom: 5px;
}

.vd-benefit strong {
  display: block;
  font-size: 11px;
}

.vd-benefit span {
  display: block;
  color: #888;
  font-size: 9px;
  margin-top: 3px;
}

/* ================= BOTTOM NAV ================= */

.vd-bottom {
  position: fixed;
  z-index: 110;
  left: 0;
  right: 0;
  bottom: 0;
  height: 68px;
  background: rgba(255,255,255,.98);
  border-top: 1px solid #e9e7ee;
  box-shadow: 0 -5px 18px rgba(30,20,60,.07);
}

.vd-bottom-inner {
  max-width: 600px;
  height: 100%;
  margin: auto;
  display: grid;
  grid-template-columns: repeat(5,1fr);
  align-items: center;
}

.vd-bottom-link {
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: #85838a;
  font-size: 9px;
  font-weight: 700;
}

.vd-bottom-link.active {
  color: #9b178f;
}

.vd-bottom-icon {
  font-size: 19px;
}

.vd-sell-button {
  width: 52px;
  height: 52px;
  margin-top: -25px;
  border-radius: 50%;
  border: 5px solid #f7f7f9;
  background: linear-gradient(135deg,#ef233c,#d61791,#7218bd);
  color: white;
  display: grid;
  place-items: center;
  font-size: 22px;
  box-shadow: 0 7px 18px rgba(160,20,130,.25);
}

/* ================= DRAWER ================= */

.vd-overlay {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(15,10,25,.42);
  backdrop-filter: blur(2px);
}

.vd-drawer {
  width: min(340px,88vw);
  height: 100%;
  background: #fff;
  padding: 20px;
  box-shadow: 8px 0 30px rgba(0,0,0,.14);
  animation: vd-slide .2s ease;
}

@keyframes vd-slide {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.vd-drawer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
}

.vd-close {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 10px;
  background: #f5f4f7;
}

.vd-menu-item {
  width: 100%;
  min-height: 47px;
  border: 0;
  border-bottom: 1px solid #f0eef3;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 13px;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
}

/* ================= MODALS ================= */

.vd-modal-wrap {
  position: fixed;
  inset: 0;
  z-index: 400;
  background: rgba(15,10,25,.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.vd-modal {
  width: min(620px,100%);
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 24px 24px 0 0;
  padding: 20px;
  animation: vd-up .2s ease;
}

@keyframes vd-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.vd-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.vd-modal h2 {
  margin: 0;
  font-size: 20px;
}

.vd-field {
  width: 100%;
  height: 44px;
  border: 1px solid #dedbe4;
  border-radius: 11px;
  outline: none;
  padding: 0 12px;
  margin-bottom: 10px;
  background: #fafafd;
}

textarea.vd-field {
  min-height: 100px;
  padding: 12px;
  resize: vertical;
}

.vd-primary {
  width: 100%;
  min-height: 45px;
  border: 0;
  border-radius: 12px;
  background: linear-gradient(90deg,#ef233c,#d61791,#7218bd);
  color: #fff;
  font-weight: 900;
}

.vd-secondary {
  width: 100%;
  min-height: 43px;
  border: 1px solid #dedbe4;
  border-radius: 12px;
  background: #fff;
  font-weight: 800;
}

/* ================= CART ================= */

.vd-cart-item {
  display: grid;
  grid-template-columns: 66px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 11px 0;
  border-bottom: 1px solid #eeeef2;
}

.vd-cart-item img {
  width: 66px;
  height: 66px;
  object-fit: cover;
  border-radius: 11px;
}

.vd-cart-name {
  font-size: 12px;
  font-weight: 800;
}

.vd-cart-price {
  font-size: 12px;
  margin-top: 4px;
}

.vd-quantity {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 7px;
}

.vd-quantity button {
  width: 24px;
  height: 24px;
  border: 1px solid #ddd9e3;
  border-radius: 7px;
  background: #fff;
}

.vd-cart-total {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  font-size: 17px;
  font-weight: 900;
}

/* ================= PRODUCT PAGE ================= */

.vd-detail {
  padding: 18px;
}

.vd-detail-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #eeeef3;
}

.vd-detail-image {
  width: 100%;
  max-height: 430px;
  object-fit: cover;
  display: block;
}

.vd-detail-info {
  padding: 18px;
}

.vd-detail-title {
  font-size: 24px;
  margin: 0;
  letter-spacing: -.7px;
}

.vd-detail-price {
  font-size: 26px;
  font-weight: 900;
  margin: 9px 0;
}

.vd-spec {
  padding: 8px 0;
  border-bottom: 1px solid #f0eef3;
  font-size: 12px;
}

/* ================= RESPONSIVE ================= */

@media (max-width: 900px) {
  .vd-category-scroll {
    grid-template-columns: repeat(4,1fr);
  }

  .vd-product-grid {
    grid-template-columns: repeat(3,1fr);
  }
}

@media (max-width: 650px) {
  .vd-header-inner {
    padding: 8px 12px;
    gap: 8px;
  }

  .vd-logo {
    min-width: 88px;
    font-size: 18px;
  }

  .vd-menu-button,
  .vd-cart-button {
    width: 38px;
    height: 38px;
    border-radius: 11px;
  }

  .vd-main {
    padding: 10px 11px 0;
  }

  .vd-hero {
    min-height: 175px;
    border-radius: 18px;
    padding: 20px;
  }

  .vd-hero h1 {
    font-size: 27px;
  }

  .vd-quick-grid {
    gap: 8px;
  }

  .vd-quick-card {
    padding: 10px;
    min-height: 74px;
    gap: 8px;
  }

  .vd-quick-icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    font-size: 18px;
  }

  .vd-category-scroll {
    display: flex;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 2px;
  }

  .vd-category-scroll::-webkit-scrollbar {
    display: none;
  }

  .vd-category-card {
    min-width: 79px;
    width: 79px;
  }

  .vd-category-name {
    font-size: 9px;
  }

  .vd-product-grid {
    grid-template-columns: repeat(2,1fr);
    gap: 9px;
  }

  .vd-benefits {
    grid-template-columns: 1fr;
  }

  .vd-promo {
    padding: 15px;
  }

  .vd-promo h2 {
    font-size: 16px;
  }

  .vd-search {
    height: 38px;
  }
}

@media (min-width: 1000px) {
  .vd-bottom {
    width: min(600px,100%);
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    border-radius: 18px 18px 0 0;
  }

  .vd-modal-wrap {
    align-items: center;
  }

  .vd-modal {
    border-radius: 22px;
  }
}
`;

/* =========================================================
   PRODUCT CARD
   ========================================================= */

function ProductCard({
  product,
  favorite,
  onFavorite,
  onAdd,
  onOpen,
}) {
  return (
    <article className="vd-product-card">
      <Link to={`/producto/${product.id}`}>
        <div className="vd-product-image-wrap">
          <img
            className="vd-product-image"
            src={product.image}
            alt={product.name}
            loading="lazy"
          />

          {product.discount ? (
            <span className="vd-discount">-{product.discount}%</span>
          ) : null}

          <button
            className="vd-favorite"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onFavorite(product.id);
            }}
            aria-label="Favorito"
          >
            {favorite ? "❤️" : "♡"}
          </button>
        </div>
      </Link>

      <div className="vd-product-info">
        <button
          onClick={() => onOpen(product)}
          style={{
            border: 0,
            padding: 0,
            margin: 0,
            background: "transparent",
            textAlign: "left",
            width: "100%",
          }}
        >
          <h3 className="vd-product-name">{product.name}</h3>
        </button>

        <div className="vd-rating">
          ⭐ {product.rating} · {product.reviews} reseñas
        </div>

        <div className="vd-price-row">
          <span className="vd-price">{formatPrice(product.price)}</span>

          {product.oldPrice ? (
            <span className="vd-old-price">
              {formatPrice(product.oldPrice)}
            </span>
          ) : null}
        </div>

        <button className="vd-add" onClick={() => onAdd(product)}>
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   HOME
   ========================================================= */

function Home({
  products,
  favorites,
  onFavorite,
  onAdd,
  onOpenProduct,
  onSearch,
  onPublish,
}) {
  const navigate = useNavigate();

  return (
    <>
      <style>{styles}</style>

      <div className="vd-app">
        <main className="vd-shell vd-main">
          <section className="vd-hero">
            <div className="vd-hero-content">
              <div className="vd-hero-kicker">VaniDaxi</div>

              <h1>Todo en un solo lugar</h1>

              <p>
                Compra, vende y descubre productos de personas y negocios
                cerca de ti.
              </p>

              <button
                className="vd-hero-button"
                onClick={() =>
                  document
                    .getElementById("productos")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Comprar ahora
              </button>
            </div>
          </section>

          <section className="vd-quick-grid">
            <div className="vd-quick-card">
              <div className="vd-quick-icon">🛍️</div>
              <div>
                <h3>Compra fácil</h3>
                <p>Encuentra todo en un mismo lugar.</p>
              </div>
            </div>

            <button
              className="vd-quick-card"
              onClick={onPublish}
              style={{ border: "1px solid #eeeef3", textAlign: "left" }}
            >
              <div className="vd-quick-icon">💰</div>
              <div>
                <h3>Vende tus productos</h3>
                <p>Publica y llega a nuevos clientes.</p>
              </div>
            </button>
          </section>

          <section className="vd-section">
            <div className="vd-section-head">
              <h2 className="vd-section-title">Categorías</h2>

              <button
                className="vd-section-link"
                onClick={() => navigate("/categorias")}
              >
                Ver todas
              </button>
            </div>

            <div className="vd-category-scroll">
              {categories.map((category) => (
                <button
                  className="vd-category-card"
                  key={category.id}
                  onClick={() =>
                    navigate(`/categoria/${category.id}`)
                  }
                >
                  <img
                    className="vd-category-image"
                    src={category.image}
                    alt={category.name}
                    loading="lazy"
                  />

                  <span className="vd-category-name">
                    {category.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="vd-promo">
            <div>
              <h2>Ofertas todos los días</h2>
              <p>Encuentra precios especiales en productos seleccionados.</p>
            </div>

            <button
              className="vd-promo-button"
              onClick={() => onSearch("oferta")}
            >
              Ver ofertas
            </button>
          </section>

          <section className="vd-section" id="productos">
            <div className="vd-section-head">
              <h2 className="vd-section-title">Productos destacados</h2>

              <button
                className="vd-section-link"
                onClick={() => navigate("/productos")}
              >
                Ver todos
              </button>
            </div>

            <div className="vd-product-grid">
              {products.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  favorite={favorites.includes(product.id)}
                  onFavorite={onFavorite}
                  onAdd={onAdd}
                  onOpen={onOpenProduct}
                />
              ))}
            </div>
          </section>

          <section className="vd-benefits">
            <div className="vd-benefit">
              <div className="vd-benefit-icon">🚚</div>
              <strong>Compra local</strong>
              <span>Encuentra productos cerca de ti.</span>
            </div>

            <div className="vd-benefit">
              <div className="vd-benefit-icon">🔒</div>
              <strong>Compra segura</strong>
              <span>Tu experiencia es nuestra prioridad.</span>
            </div>

            <div className="vd-benefit">
              <div className="vd-benefit-icon">💬</div>
              <strong>Atención</strong>
              <span>Estamos para ayudarte.</span>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

/* =========================================================
   HEADER
   ========================================================= */

function Header({
  cartCount,
  onMenu,
  onCart,
  search,
  setSearch,
}) {
  const navigate = useNavigate();

  return (
    <header className="vd-header">
      <div className="vd-shell vd-header-inner">
        <button
          className="vd-menu-button"
          onClick={onMenu}
          aria-label="Abrir menú"
        >
          <span />
        </button>

        <button
          className="vd-logo"
          onClick={() => navigate("/")}
          style={{
            border: 0,
            background: "transparent",
            padding: 0,
          }}
        >
          VaniDaxi
        </button>

        <div className="vd-search-wrap">
          <span className="vd-search-icon">⌕</span>

          <input
            className="vd-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                navigate(
                  search.trim()
                    ? `/buscar?q=${encodeURIComponent(search.trim())}`
                    : "/productos"
                );
              }
            }}
            placeholder="¿Qué estás buscando?"
            aria-label="Buscar"
          />
        </div>

        <div className="vd-header-actions">
          <button
            className="vd-cart-button"
            onClick={onCart}
            aria-label="Carrito"
          >
            🛒

            {cartCount > 0 ? (
              <span className="vd-cart-count">{cartCount}</span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  );
}

/* =========================================================
   BOTTOM NAV
   ========================================================= */

function BottomNavigation({ onPublish, cartCount }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";
  const isFavorites = location.pathname === "/favoritos";
  const isOrders = location.pathname === "/pedidos";

  return (
    <nav className="vd-bottom">
      <div className="vd-bottom-inner">
        <button
          className={`vd-bottom-link ${isHome ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          <span className="vd-bottom-icon">⌂</span>
          Inicio
        </button>

        <button
          className="vd-bottom-link"
          onClick={() => navigate("/categorias")}
        >
          <span className="vd-bottom-icon">▦</span>
          Categorías
        </button>

        <button
          className="vd-bottom-link"
          onClick={onPublish}
          aria-label="Vender"
        >
          <span className="vd-sell-button">＋</span>
          Vender
        </button>

        <button
          className={`vd-bottom-link ${isFavorites ? "active" : ""}`}
          onClick={() => navigate("/favoritos")}
        >
          <span className="vd-bottom-icon">♡</span>
          Favoritos
        </button>

        <button
          className={`vd-bottom-link ${isOrders ? "active" : ""}`}
          onClick={() => navigate("/pedidos")}
        >
          <span className="vd-bottom-icon">▤</span>
          Pedidos
        </button>
      </div>
    </nav>
  );
}

/* =========================================================
   MENU
   ========================================================= */

function MenuDrawer({
  user,
  onClose,
  onAuth,
  onPublish,
}) {
  const navigate = useNavigate();

  function go(path) {
    onClose();
    navigate(path);
  }

  return (
    <div className="vd-overlay" onClick={onClose}>
      <aside
        className="vd-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vd-drawer-top">
          <div>
            <div className="vd-logo">VaniDaxi</div>

            <div
              style={{
                fontSize: 11,
                color: "#888",
                marginTop: 5,
              }}
            >
              Todo en un solo lugar
            </div>
          </div>

          <button className="vd-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <button className="vd-menu-item" onClick={() => go("/")}>
          🏠 Inicio
        </button>

        <button
          className="vd-menu-item"
          onClick={() => go("/categorias")}
        >
          🛍️ Categorías
        </button>

        <button
          className="vd-menu-item"
          onClick={() => {
            onClose();
            onPublish();
          }}
        >
          ➕ Publicar producto
        </button>

        <button
          className="vd-menu-item"
          onClick={() => go("/favoritos")}
        >
          ❤️ Favoritos
        </button>

        <button
          className="vd-menu-item"
          onClick={() => go("/pedidos")}
        >
          📦 Mis pedidos
        </button>

        <button
          className="vd-menu-item"
          onClick={() => {
            onClose();
            onAuth();
          }}
        >
          ✨ {user ? "Mi cuenta" : "Iniciar sesión"}
        </button>

        <button
          className="vd-menu-item"
          onClick={() => go("/ayuda")}
        >
          💬 Ayuda y soporte
        </button>
      </aside>
    </div>
  );
}

/* =========================================================
   AUTH
   ========================================================= */

function AuthModal({ onClose, user, onUser }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;

        onUser(data.user);
        setMessage("Sesión iniciada correctamente.");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          onUser(data.user);
        }

        setMessage(
          "Cuenta creada. Revisa tu correo si Supabase solicita confirmación."
        );
      }
    } catch (error) {
      setMessage(
        error?.message ||
          "No fue posible completar la operación."
      );
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    onUser(null);
    onClose();
  }

  return (
    <div
      className="vd-modal-wrap"
      onClick={onClose}
    >
      <div
        className="vd-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vd-modal-head">
          <h2>{user ? "Mi cuenta" : mode === "login" ? "Bienvenido" : "Crear cuenta"}</h2>

          <button className="vd-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {user ? (
          <>
            <div
              style={{
                background: "#f7f5f9",
                borderRadius: 14,
                padding: 15,
                marginBottom: 14,
              }}
            >
              <strong>{user.user_metadata?.full_name || "Usuario VaniDaxi"}</strong>
              <div
                style={{
                  color: "#777",
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {user.email}
              </div>
            </div>

            <button
              className="vd-primary"
              onClick={logout}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleAuth}>
              {mode === "register" ? (
                <input
                  className="vd-field"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Nombre"
                  required
                />
              ) : null}

              <input
                className="vd-field"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Correo electrónico"
                required
              />

              <input
                className="vd-field"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Contraseña"
                minLength={6}
                required
              />

              <button
                className="vd-primary"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : mode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
              </button>
            </form>

            <button
              className="vd-secondary"
              style={{ marginTop: 10 }}
              onClick={() =>
                setMode(
                  mode === "login"
                    ? "register"
                    : "login"
                )
              }
            >
              {mode === "login"
                ? "Crear una cuenta"
                : "Ya tengo una cuenta"}
            </button>

            {message ? (
              <div
                style={{
                  marginTop: 12,
                  padding: 11,
                  background: "#faf5fb",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "#74127d",
                }}
              >
                {message}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   CART
   ========================================================= */

function CartModal({
  cart,
  onClose,
  onRemove,
  onQuantity,
  onCheckout,
}) {
  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  return (
    <div
      className="vd-modal-wrap"
      onClick={onClose}
    >
      <div
        className="vd-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vd-modal-head">
          <h2>Mi carrito</h2>

          <button className="vd-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {cart.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "35px 10px",
              color: "#777",
            }}
          >
            <div style={{ fontSize: 42 }}>🛒</div>
            <strong>Tu carrito está vacío</strong>
            <p style={{ fontSize: 12 }}>
              Agrega productos para comenzar.
            </p>
          </div>
        ) : (
          <>
            {cart.map((item) => (
              <div
                className="vd-cart-item"
                key={item.id}
              >
                <img
                  src={item.image}
                  alt={item.name}
                />

                <div>
                  <div className="vd-cart-name">
                    {item.name}
                  </div>

                  <div className="vd-cart-price">
                    {formatPrice(item.price)}
                  </div>

                  <div className="vd-quantity">
                    <button
                      onClick={() =>
                        onQuantity(
                          item.id,
                          item.quantity - 1
                        )
                      }
                    >
                      −
                    </button>

                    <strong>{item.quantity}</strong>

                    <button
                      onClick={() =>
                        onQuantity(
                          item.id,
                          item.quantity + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  className="vd-close"
                  onClick={() =>
                    onRemove(item.id)
                  }
                >
                  🗑️
                </button>
              </div>
            ))}

            <div className="vd-cart-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <button
              className="vd-primary"
              onClick={onCheckout}
            >
              Continuar al checkout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   PUBLISH MODAL
   ========================================================= */

function PublishModal({
  onClose,
  user,
  onPublished,
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(
    categories[0].id
  );
  const [image, setImage] = useState("");
  const [description, setDescription] =
    useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function publish(event) {
    event.preventDefault();

    if (!user) {
      setMessage(
        "Necesitas iniciar sesión para publicar un producto."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const product = {
        name,
        price: Number(price),
        category,
        image:
          image ||
          categories.find(
            (item) => item.id === category
          )?.image,
        description,
        seller_id: user.id,
      };

      const { error } = await supabase
        .from("products")
        .insert(product);

      if (error) throw error;

      setMessage(
        "Producto publicado correctamente."
      );

      setTimeout(() => {
        onPublished();
      }, 700);
    } catch (error) {
      setMessage(
        error?.message ||
          "No fue posible publicar el producto."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="vd-modal-wrap"
      onClick={onClose}
    >
      <div
        className="vd-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="vd-modal-head">
          <h2>Publicar producto</h2>

          <button className="vd-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={publish}>
          <input
            className="vd-field"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Nombre del producto"
            required
          />

          <input
            className="vd-field"
            type="number"
            min="1"
            value={price}
            onChange={(event) =>
              setPrice(event.target.value)
            }
            placeholder="Precio"
            required
          />

          <select
            className="vd-field"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
          >
            {categories.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>

          <input
            className="vd-field"
            value={image}
            onChange={(event) =>
              setImage(event.target.value)
            }
            placeholder="URL de imagen"
          />

          <textarea
            className="vd-field"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Describe tu producto"
          />

          <button
            className="vd-primary"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Publicando..."
              : "Publicar producto"}
          </button>
        </form>

        {message ? (
          <div
            style={{
              marginTop: 12,
              fontSize: 12,
              color: "#76127f",
            }}
          >
            {message}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* =========================================================
   CATEGORÍAS PAGE
   ========================================================= */

function CategoriesPage() {
  const navigate = useNavigate();

  return (
    <div className="vd-app">
      <style>{styles}</style>

      <main className="vd-shell vd-main">
        <div className="vd-section-head">
          <h1 className="vd-section-title">
            Categorías
          </h1>
        </div>

        <div
          className="vd-category-scroll"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill,minmax(100px,1fr))",
          }}
        >
          {categories.map((category) => (
            <button
              className="vd-category-card"
              key={category.id}
              onClick={() =>
                navigate(
                  `/categoria/${category.id}`
                )
              }
            >
              <img
                className="vd-category-image"
                src={category.image}
                alt={category.name}
              />

              <span className="vd-category-name">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   PRODUCT LIST PAGE
   ========================================================= */

function ProductListPage({
  products,
  favorites,
  onFavorite,
  onAdd,
  onOpen,
  searchTerm = "",
}) {
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const query = searchTerm.toLowerCase();

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description
          ?.toLowerCase()
          .includes(query)
    );
  }, [products, searchTerm]);

  return (
    <div className="vd-app">
      <style>{styles}</style>

      <main className="vd-shell vd-main">
        <section className="vd-section">
          <div className="vd-section-head">
            <h1 className="vd-section-title">
              {searchTerm
                ? `Resultados para "${searchTerm}"`
                : "Todos los productos"}
            </h1>
          </div>

          {filtered.length === 0 ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: 35,
                textAlign: "center",
              }}
            >
              No encontramos productos.
            </div>
          ) : (
            <div className="vd-product-grid">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  favorite={favorites.includes(
                    product.id
                  )}
                  onFavorite={onFavorite}
                  onAdd={onAdd}
                  onOpen={onOpen}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   CATEGORY PAGE
   ========================================================= */

function CategoryPage({
  products,
  favorites,
  onFavorite,
  onAdd,
  onOpen,
}) {
  const { categoryId } = useParams();

  const category = categories.find(
    (item) => item.id === categoryId
  );

  const categoryProducts = products.filter(
    (product) =>
      product.category === categoryId
  );

  return (
    <div className="vd-app">
      <style>{styles}</style>

      <main className="vd-shell vd-main">
        <section className="vd-section">
          <div className="vd-section-head">
            <h1 className="vd-section-title">
              {category?.name || "Categoría"}
            </h1>
          </div>

          {categoryProducts.length === 0 ? (
            <div
              style={{
                background: "#fff",
                padding: 35,
                borderRadius: 18,
                textAlign: "center",
              }}
            >
              Todavía no hay productos en esta
              categoría.
            </div>
          ) : (
            <div className="vd-product-grid">
              {categoryProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  favorite={favorites.includes(
                    product.id
                  )}
                  onFavorite={onFavorite}
                  onAdd={onAdd}
                  onOpen={onOpen}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   PRODUCT DETAIL
   ========================================================= */

function ProductPage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  const { productId } = useParams();
  const navigate = useNavigate();

  const product = products.find(
    (item) => item.id === productId
  );

  if (!product) {
    return (
      <div className="vd-app">
        <style>{styles}</style>

        <main className="vd-shell vd-main">
          <div
            style={{
              background: "#fff",
              borderRadius: 18,
              padding: 30,
              textAlign: "center",
            }}
          >
            Producto no encontrado.
          </div>
        </main>
      </div>
    );
  }

  const favorite = favorites.includes(product.id);

  function buyNow() {
    onAdd(product, true);
  }

  function shareWhatsApp() {
    const text = `Hola, me interesa ${product.name} de VaniDaxi.`;
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        text
      )}`,
      "_blank"
    );
  }

  return (
    <div className="vd-app">
      <style>{styles}</style>

      <main className="vd-shell vd-detail">
        <div className="vd-detail-card">
          <img
            className="vd-detail-image"
            src={product.image}
            alt={product.name}
          />

          <div className="vd-detail-info">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <h1 className="vd-detail-title">
                {product.name}
              </h1>

              <button
                className="vd-close"
                onClick={() =>
                  onFavorite(product.id)
                }
              >
                {favorite ? "❤️" : "♡"}
              </button>
            </div>

            <div className="vd-rating">
              ⭐ {product.rating} ·{" "}
              {product.reviews} reseñas
            </div>

            <div className="vd-detail-price">
              {formatPrice(product.price)}
            </div>

            {product.oldPrice ? (
              <div
                style={{
                  textDecoration: "line-through",
                  color: "#999",
                  fontSize: 12,
                }}
              >
                {formatPrice(product.oldPrice)}
              </div>
            ) : null}

            <p
              style={{
                fontSize: 13,
                lineHeight: 1.55,
                color: "#666",
              }}
            >
              {product.description}
            </p>

            <h3
              style={{
                fontSize: 15,
                marginTop: 20,
              }}
            >
              Características
            </h3>

            {product.specifications?.map(
              (specification, index) => (
                <div
                  className="vd-spec"
                  key={index}
                >
                  ✓ {specification}
                </div>
              )
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 9,
                marginTop: 18,
              }}
            >
              <button
                className="vd-secondary"
                onClick={shareWhatsApp}
              >
                WhatsApp
              </button>

              <button
                className="vd-primary"
                onClick={buyNow}
              >
                Comprar ahora
              </button>
            </div>

            <button
              className="vd-secondary"
              style={{ marginTop: 9 }}
              onClick={() => {
                onAdd(product);
                navigate("/");
              }}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   SIMPLE PAGES
   ========================================================= */

function SimplePage({ title, children }) {
  return (
    <div className="vd-app">
      <style>{styles}</style>

      <main className="vd-shell vd-main">
        <section
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 22,
            marginTop: 5,
          }}
        >
          <h1
            style={{
              marginTop: 0,
              fontSize: 22,
            }}
          >
            {title}
          </h1>

          {children}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   APP PRINCIPAL
   ========================================================= */

export default function App() {
  const [products, setProducts] =
    useState(initialProducts);

  const [favorites, setFavorites] =
    useState(() =>
      readStorage(FAVORITES_KEY, [])
    );

  const [cart, setCart] =
    useState(() =>
      readStorage(CART_KEY, [])
    );

  const [search, setSearch] =
    useState("");

  const [showMenu, setShowMenu] =
    useState(false);

  const [showAuth, setShowAuth] =
    useState(false);

  const [showPublish, setShowPublish] =
    useState(false);

  const [showCart, setShowCart] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  /* ================= AUTH ================= */

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } =
        await supabase.auth.getUser();

      if (mounted) {
        setUser(data?.user || null);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  /* ================= PRODUCTS ================= */

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const { data, error } =
          await supabase
            .from("products")
            .select("*")
            .order("created_at", {
              ascending: false,
            });

        if (
          !error &&
          Array.isArray(data) &&
          data.length > 0 &&
          mounted
        ) {
          setProducts((current) => {
            const databaseProducts =
              data.map((item) => ({
                ...item,
                id: String(item.id),
                price: Number(item.price) || 0,
                category:
                  item.category || "hogar",
                image:
                  item.image ||
                  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=85",
                rating:
                  Number(item.rating) || 5,
                reviews:
                  Number(item.reviews) || 0,
              }));

            const databaseIds = new Set(
              databaseProducts.map((item) =>
                String(item.id)
              )
            );

            const fallbackProducts =
              current.filter(
                (item) =>
                  !databaseIds.has(
                    String(item.id)
                  )
              );

            return [
              ...databaseProducts,
              ...fallbackProducts,
            ];
          });
        }
      } catch {
        // Los productos iniciales permanecen disponibles.
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /* ================= STORAGE ================= */

  useEffect(() => {
    saveStorage(CART_KEY, cart);
  }, [cart]);

  useEffect(() => {
    saveStorage(
      FAVORITES_KEY,
      favorites
    );
  }, [favorites]);

  /* ================= CART ================= */

  function addToCart(product, goCheckout = false) {
    setCart((current) => {
      const existing = current.find(
        (item) =>
          String(item.id) ===
          String(product.id)
      );

      if (existing) {
        return current.map((item) =>
          String(item.id) ===
          String(product.id)
            ? {
                ...item,
                quantity:
                  Number(item.quantity) + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    if (goCheckout) {
      setShowCart(true);
    }
  }

  function removeFromCart(productId) {
    setCart((current) =>
      current.filter(
        (item) =>
          String(item.id) !==
          String(productId)
      )
    );
  }

  function changeQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((current) =>
      current.map((item) =>
        String(item.id) ===
        String(productId)
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  /* ================= FAVORITES ================= */

  function toggleFavorite(productId) {
    setFavorites((current) => {
      const exists = current.includes(
        productId
      );

      return exists
        ? current.filter(
            (id) => id !== productId
          )
        : [...current, productId];
    });
  }

  /* ================= SEARCH ================= */

  function runSearch(value) {
    setSearch(value);

    navigate(
      value
        ? `/buscar?q=${encodeURIComponent(value)}`
        : "/productos"
    );
  }

  /* ================= CHECKOUT ================= */

  function checkout() {
    if (!cart.length) return;

    if (!user) {
      setShowCart(false);
      setShowAuth(true);
      return;
    }

    setShowCart(false);
    navigate("/checkout");
  }

  const cartCount = cart.reduce(
    (total, item) =>
      total + Number(item.quantity || 0),
    0
  );

  return (
    <>
      <style>{styles}</style>

      <Header
        cartCount={cartCount}
        onMenu={() => setShowMenu(true)}
        onCart={() => setShowCart(true)}
        search={search}
        setSearch={setSearch}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
              onOpenProduct={
                setSelectedProduct
              }
              onSearch={runSearch}
              onPublish={() =>
                setShowPublish(true)
              }
            />
          }
        />

        <Route
          path="/categorias"
          element={<CategoriesPage />}
        />

        <Route
          path="/productos"
          element={
            <ProductListPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
              onOpen={setSelectedProduct}
            />
          }
        />

        <Route
          path="/buscar"
          element={
            <SearchRoute
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
              onOpen={setSelectedProduct}
            />
          }
        />

        <Route
          path="/categoria/:categoryId"
          element={
            <CategoryPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
              onOpen={setSelectedProduct}
            />
          }
        />

        <Route
          path="/producto/:productId"
          element={
            <ProductPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/favoritos"
          element={
            <FavoritesPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
              onOpen={setSelectedProduct}
            />
          }
        />

        <Route
          path="/pedidos"
          element={
            <SimplePage title="Mis pedidos">
              <p style={{ color: "#777" }}>
                Aquí aparecerán tus pedidos y su
                seguimiento.
              </p>
            </SimplePage>
          }
        />

        <Route
          path="/checkout"
          element={
            <CheckoutPage
              cart={cart}
              user={user}
              onBack={() => setShowCart(true)}
              onComplete={() => {
                setCart([]);
                navigate("/");
              }}
            />
          }
        />

        <Route
          path="/ayuda"
          element={
            <SimplePage title="Ayuda y soporte">
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.6,
                }}
              >
                Si necesitas ayuda con una compra,
                una publicación o tu cuenta,
                puedes comunicarte con atención
                VaniDaxi.
              </p>

              <button
                className="vd-primary"
                onClick={() => {
                  const text =
                    "Hola, necesito ayuda con VaniDaxi.";
                  window.open(
                    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                      text
                    )}`,
                    "_blank"
                  );
                }}
              >
                Contactar por WhatsApp
              </button>
            </SimplePage>
          }
        />
      </Routes>

      <BottomNavigation
        onPublish={() => setShowPublish(true)}
        cartCount={cartCount}
      />

      {showMenu ? (
        <MenuDrawer
          user={user}
          onClose={() => setShowMenu(false)}
          onAuth={() => setShowAuth(true)}
          onPublish={() => setShowPublish(true)}
        />
      ) : null}

      {showAuth ? (
        <AuthModal
          user={user}
          onClose={() => setShowAuth(false)}
          onUser={setUser}
        />
      ) : null}

      {showPublish ? (
        <PublishModal
          user={user}
          onClose={() => setShowPublish(false)}
          onPublished={() => {
            setShowPublish(false);
            window.location.reload();
          }}
        />
      ) : null}

      {showCart ? (
        <CartModal
          cart={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onQuantity={changeQuantity}
          onCheckout={checkout}
        />
      ) : null}

      {selectedProduct ? (
        <div
          className="vd-modal-wrap"
          onClick={() =>
            setSelectedProduct(null)
          }
        >
          <div
            className="vd-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="vd-modal-head">
              <h2>
                {selectedProduct.name}
              </h2>

              <button
                className="vd-close"
                onClick={() =>
                  setSelectedProduct(null)
                }
              >
                ✕
              </button>
            </div>

            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              style={{
                width: "100%",
                height: 230,
                objectFit: "cover",
                borderRadius: 15,
              }}
            />

            <div
              style={{
                fontSize: 23,
                fontWeight: 900,
                marginTop: 13,
              }}
            >
              {formatPrice(
                selectedProduct.price
              )}
            </div>

            <p
              style={{
                color: "#777",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {selectedProduct.description}
            </p>

            <button
              className="vd-primary"
              onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
                setShowCart(true);
              }}
            >
              Agregar al carrito
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/* =========================================================
   SEARCH ROUTE
   ========================================================= */

function SearchRoute(props) {
  const location = useLocation();

  const query =
    new URLSearchParams(location.search).get(
      "q"
    ) || "";

  return (
    <ProductListPage
      {...props}
      searchTerm={query}
    />
  );
}

/* =========================================================
   FAVORITES PAGE
   ========================================================= */

function FavoritesPage({
  products,
  favorites,
  onFavorite,
  onAdd,
  onOpen,
}) {
  const favoriteProducts = products.filter(
    (product) =>
      favorites.includes(product.id)
  );

  return (
    <div className="vd-app">
      <style>{styles}</style>

      <main className="vd-shell vd-main">
        <section className="vd-section">
          <div className="vd-section-head">
            <h1 className="vd-section-title">
              Mis favoritos
            </h1>
          </div>

          {favoriteProducts.length === 0 ? (
            <div
              style={{
                background: "#fff",
                borderRadius: 18,
                padding: 35,
                textAlign: "center",
                color: "#777",
              }}
            >
              <div
                style={{
                  fontSize: 42,
                  marginBottom: 8,
                }}
              >
                ♡
              </div>

              Todavía no tienes favoritos.
            </div>
          ) : (
            <div className="vd-product-grid">
              {favoriteProducts.map(
                (product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    favorite
                    onFavorite={onFavorite}
                    onAdd={onAdd}
                    onOpen={onOpen}
                  />
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

/* =========================================================
   CHECKOUT
   ========================================================= */

function CheckoutPage({
  cart,
  user,
  onBack,
  onComplete,
}) {
  const [name, setName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [phone, setPhone] = useState("");
  const [address, setAddress] =
    useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] =
    useState("");

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity),
    0
  );

  function finishOrder(event) {
    event.preventDefault();

    if (!cart.length) {
      setMessage(
        "No hay productos en el carrito."
      );
      return;
    }

    const lines = cart
      .map(
        (item) =>
          `${item.name} x${item.quantity} — ${formatPrice(
            item.price * item.quantity
          )}`
      )
      .join("\n");

    const text =
      `Hola, quiero realizar un pedido en VaniDaxi.\n\n` +
      `${lines}\n\n` +
      `Total: ${formatPrice(total)}\n` +
      `Nombre: ${name}\n` +
      `Teléfono: ${phone}\n` +
      `Dirección: ${address}\n` +
      `Notas: ${notes}`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        text
      )}`,
      "_blank"
    );

    setMessage(
      "Pedido preparado. Puedes continuar la conversación por WhatsApp."
    );
  }

  return (
    <div className="vd-app">
      <style>{styles}</style>

      <main className="vd-shell vd-main">
        <section
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: 20,
          }}
        >
          <div className="vd-section-head">
            <h1 className="vd-section-title">
              Checkout
            </h1>

            <button
              className="vd-close"
              onClick={onBack}
            >
              ✕
            </button>
          </div>

          <form onSubmit={finishOrder}>
            <input
              className="vd-field"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Nombre completo"
              required
            />

            <input
              className="vd-field"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              placeholder="Teléfono"
              required
            />

            <textarea
              className="vd-field"
              value={address}
              onChange={(event) =>
                setAddress(event.target.value)
              }
              placeholder="Dirección de entrega"
              required
            />

            <textarea
              className="vd-field"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              placeholder="Notas del pedido"
            />

            <div className="vd-cart-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <button
              className="vd-primary"
              type="submit"
            >
              Enviar pedido
            </button>
          </form>

          {message ? (
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "#79157e",
              }}
            >
              {message}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

export default App;
