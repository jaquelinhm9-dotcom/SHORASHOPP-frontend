import { useEffect, useMemo, useState } from "react";
import {
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
   Marketplace
   ========================================================= */

const CART_KEY = "vanidaxi_cart";
const FAVORITES_KEY = "vanidaxi_favorites";

const WHATSAPP_NUMBER = "5210000000000";

/* =========================================================
   CATEGORÍAS
   Imágenes reales, tarjetas compactas.
   ========================================================= */

const categories = [
  {
    name: "Moda",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Hogar",
    image:
      "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Belleza",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Autos y Motos",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Comida",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Juguetes",
    image:
      "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?auto=format&fit=crop&w=900&q=88",
  },
  {
    name: "Deportes",
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=88",
  },
];

/* =========================================================
   PRODUCTOS DEMO
   ========================================================= */

const initialProducts = [
  {
    id: "1",
    name: "Smartwatch Pro",
    price: 899,
    oldPrice: 1299,
    rating: 4.8,
    reviews: 124,
    discount: 31,
    category: "Tecnología",
    type: "Oferta",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=90",
    description:
      "Smartwatch moderno con pantalla táctil, monitoreo de actividad y diseño elegante.",
    specifications: [
      "Pantalla táctil",
      "Monitoreo de actividad",
      "Bluetooth",
      "Resistente a salpicaduras",
    ],
  },
  {
    id: "2",
    name: "Licuadora Profesional",
    price: 749,
    oldPrice: 999,
    rating: 4.7,
    reviews: 86,
    discount: 25,
    category: "Hogar",
    type: "Oferta",
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1000&q=90",
    description:
      "Licuadora de alta potencia ideal para preparar bebidas, salsas y alimentos.",
    specifications: [
      "Alta potencia",
      "Vaso de gran capacidad",
      "Cuchillas de acero",
      "Varias velocidades",
    ],
  },
  {
    id: "3",
    name: "Tenis Urbanos",
    price: 599,
    oldPrice: 799,
    rating: 4.9,
    reviews: 213,
    discount: 25,
    category: "Moda",
    type: "Popular",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=90",
    description:
      "Tenis urbanos cómodos y versátiles para uso diario.",
    specifications: [
      "Diseño urbano",
      "Suela antiderrapante",
      "Material ligero",
      "Uso diario",
    ],
  },
  {
    id: "4",
    name: "Audífonos Bluetooth",
    price: 449,
    oldPrice: 699,
    rating: 4.8,
    reviews: 176,
    discount: 36,
    category: "Tecnología",
    type: "Oferta",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=90",
    description:
      "Audífonos inalámbricos con sonido envolvente y batería de larga duración.",
    specifications: [
      "Bluetooth",
      "Micrófono integrado",
      "Batería de larga duración",
      "Estuche de carga",
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
  } catch {}
}

/* =========================================================
   ICONOS
   ========================================================= */

function Icon({ name, size = 21, stroke = 2 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const icons = {
    menu: (
      <>
        <path d="M4 6h16" />
        <path d="M4 12h16" />
        <path d="M4 18h16" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    cart: (
      <>
        <path d="M3 4h2l2.5 11a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 1.9-1.4L21 8H6" />
        <circle cx="10" cy="20" r="1.2" />
        <circle cx="18" cy="20" r="1.2" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c.8-4 3.5-6 8-6s7.2 2 8 6" />
      </>
    ),
    heart: (
      <path d="M20.8 8.8c0 5.3-8.8 10.3-8.8 10.3S3.2 14.1 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z" />
    ),
    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M9 20v-6h6v6" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l1 13H4L5 8Z" />
        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1-1.9 1.9-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1.1 1.7v.2h-2.7v-.2a1.8 1.8 0 0 0-1.1-1.7 1.8 1.8 0 0 0-2 .4l-.1.1L7 17.1l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.7-1.1h-.2v-2.7h.2a1.8 1.8 0 0 0 1.7-1.1 1.8 1.8 0 0 0-.4-2L7 8l1.9-1.9.1.1a1.8 1.8 0 0 0 2 .4 1.8 1.8 0 0 0 1.1-1.7v-.2h2.7v.2a1.8 1.8 0 0 0 1.1 1.7 1.8 1.8 0 0 0 2-.4l.1-.1L19.9 8l-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.7 1.1h.2v2.7h-.2a1.8 1.8 0 0 0-1.7 1.1Z" />
      </>
    ),
    message: (
      <>
        <path d="M4 5h16v11H8l-4 4V5Z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    arrow: <path d="m9 18 6-6-6-6" />,
    back: <path d="m15 18-6-6 6-6" />,
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    trash: (
      <>
        <path d="M5 7h14" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 7V4h6v3" />
        <path d="m7 7 1 14h8l1-14" />
      </>
    ),
    star: (
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.4 2.4 0 0 1 4.6 1c0 1.7-2.3 2-2.3 3.4" />
        <path d="M12 17h.01" />
      </>
    ),
  };

  return <svg {...common}>{icons[name] || icons.help}</svg>;
}

/* =========================================================
   LOGO
   Concepto elegido:
   círculo + carrito + bolsa interior.
   ========================================================= */

function VaniLogo({ compact = false }) {
  return (
    <Link
      to="/"
      className={`vani-logo ${compact ? "vani-logo-compact" : ""}`}
      aria-label="VaniDaxi"
    >
      <span className="logo-circle">
        <span className="logo-bag">V</span>
        <span className="logo-wheel wheel-one" />
        <span className="logo-wheel wheel-two" />
      </span>

      {!compact && (
        <span className="logo-word">
          <strong>Vani</strong>
          <strong>Daxi</strong>
        </span>
      )}
    </Link>
  );
}

/* =========================================================
   ESTILOS
   ========================================================= */

function GlobalStyles() {
  return (
    <style>{`
      :root {
        --red: #a91635;
        --red-dark: #7d1029;
        --fuchsia: #a61b66;
        --purple: #52205f;
        --purple-dark: #35163f;
        --ink: #211c24;
        --muted: #756d76;
        --line: #eee8ed;
        --soft: #faf8fa;
        --white: #ffffff;
        --shadow: 0 10px 30px rgba(53,22,63,.10);
        --shadow-soft: 0 5px 18px rgba(53,22,63,.08);
      }

      * {
        box-sizing: border-box;
      }

      html {
        scroll-behavior: smooth;
      }

      body {
        margin: 0;
        background: #fff;
        color: var(--ink);
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }

      button,
      input,
      textarea,
      select {
        font: inherit;
      }

      button {
        cursor: pointer;
      }

      a {
        color: inherit;
        text-decoration: none;
      }

      .app {
        min-height: 100vh;
        background: #fff;
      }

      .page-shell {
        width: min(1180px, calc(100% - 32px));
        margin: 0 auto;
      }

      /* ---------- HEADER ---------- */

      .top-header {
        position: sticky;
        top: 0;
        z-index: 50;
        background: rgba(255,255,255,.96);
        backdrop-filter: blur(16px);
        border-bottom: 1px solid var(--line);
      }

      .header-inner {
        min-height: 76px;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 22px;
        align-items: center;
      }

      .vani-logo {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        flex-shrink: 0;
      }

      .logo-circle {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        position: relative;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, var(--red), var(--fuchsia), var(--purple));
        box-shadow: 0 6px 16px rgba(82,32,95,.24);
      }

      .logo-bag {
        width: 23px;
        height: 21px;
        border: 2px solid white;
        border-radius: 5px;
        color: white;
        display: grid;
        place-items: center;
        font-weight: 900;
        font-size: 12px;
        transform: translateY(-1px);
      }

      .logo-bag::before {
        content: "";
        position: absolute;
        width: 10px;
        height: 7px;
        border: 2px solid white;
        border-bottom: 0;
        border-radius: 7px 7px 0 0;
        top: 8px;
      }

      .logo-wheel {
        position: absolute;
        width: 4px;
        height: 4px;
        background: white;
        border-radius: 50%;
        bottom: 8px;
      }

      .wheel-one {
        left: 13px;
      }

      .wheel-two {
        right: 13px;
      }

      .logo-word {
        display: flex;
        gap: 2px;
        font-size: 20px;
        letter-spacing: -.7px;
      }

      .logo-word strong:first-child {
        color: var(--red);
      }

      .logo-word strong:last-child {
        color: var(--purple);
      }

      .header-search {
        max-width: 610px;
        width: 100%;
        justify-self: center;
        position: relative;
      }

      .header-search input {
        width: 100%;
        height: 44px;
        border-radius: 14px;
        border: 1px solid #e5dfe5;
        outline: none;
        padding: 0 48px 0 17px;
        color: var(--ink);
        background: #faf9fa;
      }

      .header-search input:focus {
        border-color: var(--fuchsia);
        box-shadow: 0 0 0 3px rgba(166,27,102,.08);
      }

      .search-button {
        position: absolute;
        right: 5px;
        top: 5px;
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 10px;
        color: white;
        background: linear-gradient(135deg, var(--red), var(--purple));
        display: grid;
        place-items: center;
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .icon-button {
        width: 42px;
        height: 42px;
        border: 0;
        background: transparent;
        color: var(--purple-dark);
        border-radius: 12px;
        display: grid;
        place-items: center;
        position: relative;
      }

      .icon-button:hover {
        background: #f6f0f6;
      }

      .cart-count {
        position: absolute;
        top: 2px;
        right: 1px;
        min-width: 18px;
        height: 18px;
        border-radius: 999px;
        padding: 0 5px;
        display: grid;
        place-items: center;
        background: var(--red);
        color: white;
        font-size: 10px;
        font-weight: 800;
      }

      /* ---------- NAV ---------- */

      .category-nav {
        border-bottom: 1px solid var(--line);
        background: white;
      }

      .category-nav-inner {
        min-height: 46px;
        display: flex;
        align-items: center;
        gap: 8px;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .category-nav-inner::-webkit-scrollbar {
        display: none;
      }

      .category-link {
        white-space: nowrap;
        border: 0;
        background: transparent;
        padding: 9px 12px;
        border-radius: 10px;
        font-size: 13px;
        color: #665e68;
        transition: .2s ease;
      }

      .category-link:hover,
      .category-link.active {
        color: var(--purple);
        background: #f7eff6;
        font-weight: 700;
      }

      /* ---------- HERO ---------- */

      .hero {
        margin-top: 20px;
        border-radius: 24px;
        min-height: 280px;
        padding: 42px;
        overflow: hidden;
        position: relative;
        background:
          radial-gradient(circle at 88% 15%, rgba(255,255,255,.17), transparent 26%),
          linear-gradient(120deg, #8e1833 0%, #9c1b59 48%, #492052 100%);
        color: white;
        box-shadow: var(--shadow);
      }

      .hero::after {
        content: "";
        position: absolute;
        width: 330px;
        height: 330px;
        right: -90px;
        bottom: -170px;
        border-radius: 50%;
        border: 55px solid rgba(255,255,255,.07);
      }

      .hero-content {
        position: relative;
        z-index: 1;
        max-width: 620px;
      }

      .hero-kicker {
        display: inline-flex;
        padding: 7px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,.12);
        border: 1px solid rgba(255,255,255,.18);
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 13px;
      }

      .hero h1 {
        margin: 0;
        font-size: clamp(30px, 5vw, 50px);
        line-height: 1.03;
        letter-spacing: -1.8px;
      }

      .hero p {
        margin: 14px 0 22px;
        color: rgba(255,255,255,.84);
        max-width: 510px;
        line-height: 1.6;
      }

      .hero-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .primary-button,
      .secondary-button {
        min-height: 44px;
        border-radius: 12px;
        padding: 0 17px;
        font-weight: 800;
        border: 0;
      }

      .primary-button {
        color: white;
        background: linear-gradient(135deg, var(--red), var(--purple));
        box-shadow: 0 7px 18px rgba(82,32,95,.18);
      }

      .secondary-button {
        background: white;
        color: var(--purple-dark);
        border: 1px solid #e7e0e7;
      }

      .hero .primary-button {
        background: white;
        color: var(--purple-dark);
      }

      .hero .secondary-button {
        color: white;
        border-color: rgba(255,255,255,.22);
        background: rgba(255,255,255,.09);
      }

      /* ---------- SECTIONS ---------- */

      .section {
        padding: 34px 0;
      }

      .section-heading {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 15px;
        margin-bottom: 17px;
      }

      .section-heading h2 {
        margin: 0;
        font-size: 23px;
        letter-spacing: -.5px;
      }

      .section-heading p {
        margin: 5px 0 0;
        color: var(--muted);
        font-size: 13px;
      }

      .text-link {
        color: var(--purple);
        font-size: 13px;
        font-weight: 800;
      }

      /* ---------- CATEGORY CARDS ---------- */

      .categories-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 10px;
      }

      .category-card {
        border: 1px solid var(--line);
        background: white;
        border-radius: 15px;
        overflow: hidden;
        padding: 0;
        box-shadow: var(--shadow-soft);
        transition: transform .18s ease, box-shadow .18s ease;
      }

      .category-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 24px rgba(53,22,63,.13);
      }

      .category-image {
        width: 100%;
        aspect-ratio: 1 / 1;
        display: block;
        object-fit: cover;
      }

      .category-name {
        padding: 8px 5px 10px;
        text-align: center;
        font-size: 11px;
        line-height: 1.15;
        font-weight: 800;
        color: #433b45;
      }

      /* ---------- PRODUCTS ---------- */

      .product-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 15px;
      }

      .product-card {
        min-width: 0;
        background: white;
        border: 1px solid var(--line);
        border-radius: 18px;
        overflow: hidden;
        box-shadow: var(--shadow-soft);
      }

      .product-image-wrap {
        position: relative;
        background: #f5f3f5;
        aspect-ratio: 1 / .9;
      }

      .product-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .discount {
        position: absolute;
        left: 9px;
        top: 9px;
        padding: 5px 7px;
        border-radius: 8px;
        color: white;
        background: var(--red);
        font-size: 10px;
        font-weight: 900;
      }

      .favorite-button {
        position: absolute;
        right: 8px;
        top: 8px;
        width: 34px;
        height: 34px;
        border: 0;
        border-radius: 50%;
        background: rgba(255,255,255,.92);
        display: grid;
        place-items: center;
        color: var(--purple);
      }

      .favorite-button.active {
        color: var(--red);
      }

      .product-info {
        padding: 13px;
      }

      .product-category {
        color: var(--fuchsia);
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .5px;
      }

      .product-name {
        margin: 5px 0 6px;
        font-size: 14px;
        font-weight: 800;
      }

      .rating {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #8a6877;
        font-size: 11px;
      }

      .rating svg {
        color: #b5822c;
      }

      .price-row {
        display: flex;
        align-items: baseline;
        gap: 7px;
        margin: 9px 0 11px;
      }

      .price {
        font-size: 18px;
        font-weight: 900;
        color: var(--purple-dark);
      }

      .old-price {
        color: #9b939b;
        font-size: 11px;
        text-decoration: line-through;
      }

      .product-actions {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 7px;
      }

      .add-button {
        height: 38px;
        border: 0;
        border-radius: 10px;
        color: white;
        background: linear-gradient(135deg, var(--red), var(--purple));
        font-size: 12px;
        font-weight: 800;
      }

      .view-button {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        border: 1px solid var(--line);
        background: white;
        color: var(--purple);
        display: grid;
        place-items: center;
      }

      /* ---------- PROMO ---------- */

      .promo {
        display: grid;
        grid-template-columns: 1.3fr .7fr;
        gap: 20px;
        border-radius: 20px;
        padding: 25px;
        background: #faf7fa;
        border: 1px solid #eee4ed;
      }

      .promo h2 {
        margin: 0 0 7px;
        font-size: 23px;
      }

      .promo p {
        margin: 0 0 16px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.6;
      }

      .promo-box {
        min-height: 130px;
        border-radius: 17px;
        display: grid;
        place-items: center;
        color: white;
        text-align: center;
        background: linear-gradient(135deg, #7d1029, #52205f);
      }

      .promo-box strong {
        font-size: 29px;
      }

      /* ---------- GENERIC PAGE ---------- */

      .inner-page {
        padding: 30px 0 60px;
      }

      .page-title {
        margin: 0;
        font-size: clamp(27px, 4vw, 39px);
        letter-spacing: -1px;
      }

      .page-subtitle {
        color: var(--muted);
        margin: 8px 0 25px;
        line-height: 1.6;
      }

      .page-card {
        background: white;
        border: 1px solid var(--line);
        border-radius: 18px;
        box-shadow: var(--shadow-soft);
        padding: 22px;
      }

      .options-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }

      .option-card {
        display: flex;
        align-items: center;
        gap: 13px;
        min-height: 84px;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 15px;
        background: white;
        box-shadow: var(--shadow-soft);
      }

      .option-icon {
        width: 43px;
        height: 43px;
        border-radius: 13px;
        flex-shrink: 0;
        color: white;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, var(--red), var(--purple));
      }

      .option-card strong {
        display: block;
        font-size: 13px;
      }

      .option-card span {
        display: block;
        margin-top: 3px;
        color: var(--muted);
        font-size: 11px;
      }

      /* ---------- PRODUCT DETAIL ---------- */

      .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 28px;
        align-items: start;
      }

      .detail-image {
        width: 100%;
        aspect-ratio: 1 / .9;
        object-fit: cover;
        border-radius: 22px;
        background: #f5f3f5;
      }

      .detail-category {
        color: var(--fuchsia);
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
      }

      .detail-title {
        margin: 7px 0 8px;
        font-size: clamp(28px, 4vw, 42px);
        line-height: 1.05;
      }

      .detail-description {
        color: var(--muted);
        line-height: 1.7;
      }

      .spec-list {
        list-style: none;
        padding: 0;
        margin: 20px 0;
        display: grid;
        gap: 9px;
      }

      .spec-list li {
        display: flex;
        gap: 8px;
        align-items: center;
        color: #5f5660;
        font-size: 13px;
      }

      .spec-list svg {
        color: var(--fuchsia);
      }

      .quantity-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 17px 0;
      }

      .quantity {
        height: 40px;
        display: flex;
        align-items: center;
        border: 1px solid var(--line);
        border-radius: 11px;
        overflow: hidden;
      }

      .quantity button {
        width: 38px;
        height: 40px;
        border: 0;
        background: #faf8fa;
      }

      .quantity span {
        width: 34px;
        text-align: center;
        font-weight: 800;
      }

      /* ---------- CART ---------- */

      .cart-list {
        display: grid;
        gap: 12px;
      }

      .cart-item {
        display: grid;
        grid-template-columns: 80px 1fr auto;
        gap: 14px;
        align-items: center;
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: 15px;
      }

      .cart-item img {
        width: 80px;
        height: 70px;
        object-fit: cover;
        border-radius: 11px;
      }

      .cart-item h3 {
        margin: 0 0 5px;
        font-size: 14px;
      }

      .cart-item p {
        margin: 0;
        color: var(--muted);
        font-size: 12px;
      }

      .cart-total {
        margin-top: 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 18px;
        border-top: 1px solid var(--line);
      }

      .cart-total strong {
        font-size: 22px;
        color: var(--purple-dark);
      }

      /* ---------- FORMS ---------- */

      .form {
        display: grid;
        gap: 13px;
      }

      .form label {
        display: grid;
        gap: 6px;
        color: #514951;
        font-size: 12px;
        font-weight: 800;
      }

      .form input,
      .form textarea,
      .form select {
        width: 100%;
        border: 1px solid #e4dde4;
        border-radius: 11px;
        padding: 12px 13px;
        outline: none;
        background: #fff;
      }

      .form textarea {
        min-height: 100px;
        resize: vertical;
      }

      .form input:focus,
      .form textarea:focus,
      .form select:focus {
        border-color: var(--fuchsia);
        box-shadow: 0 0 0 3px rgba(166,27,102,.08);
      }

      .form-actions {
        display: flex;
        gap: 9px;
        flex-wrap: wrap;
        margin-top: 4px;
      }

      /* ---------- OVERLAY ---------- */

      .overlay {
        position: fixed;
        inset: 0;
        z-index: 100;
        background: rgba(28,18,30,.45);
        backdrop-filter: blur(3px);
      }

      .side-panel {
        width: min(390px, 92vw);
        height: 100%;
        background: white;
        box-shadow: 20px 0 60px rgba(0,0,0,.15);
        padding: 20px;
        overflow-y: auto;
      }

      .menu-header,
      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      }

      .menu-header strong,
      .panel-header strong {
        font-size: 19px;
      }

      .menu-list {
        display: grid;
        gap: 5px;
      }

      .menu-item {
        min-height: 49px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 13px;
        border-radius: 12px;
        color: #4e4650;
        font-size: 13px;
        font-weight: 700;
      }

      .menu-item:hover {
        background: #f8f2f7;
        color: var(--purple);
      }

      .menu-item svg {
        color: var(--fuchsia);
      }

      .modal-center {
        position: fixed;
        inset: 0;
        z-index: 110;
        display: grid;
        place-items: center;
        padding: 16px;
      }

      .modal {
        width: min(510px, 100%);
        max-height: 90vh;
        overflow-y: auto;
        background: white;
        border-radius: 22px;
        padding: 23px;
        box-shadow: 0 25px 80px rgba(0,0,0,.2);
      }

      /* ---------- EMPTY ---------- */

      .empty {
        padding: 50px 20px;
        text-align: center;
        border: 1px dashed #ddd3dc;
        border-radius: 18px;
        color: var(--muted);
      }

      .empty-icon {
        width: 56px;
        height: 56px;
        margin: 0 auto 12px;
        border-radius: 17px;
        display: grid;
        place-items: center;
        color: white;
        background: linear-gradient(135deg, var(--red), var(--purple));
      }

      /* ---------- FOOTER ---------- */

      .footer {
        margin-top: 30px;
        padding: 38px 0;
        background: #211722;
        color: white;
      }

      .footer-grid {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr 1fr;
        gap: 30px;
      }

      .footer h3 {
        margin: 0 0 10px;
        font-size: 13px;
      }

      .footer p,
      .footer a {
        color: rgba(255,255,255,.65);
        font-size: 12px;
        line-height: 1.8;
      }

      .footer-links {
        display: grid;
        gap: 3px;
      }

      /* ---------- MOBILE ---------- */

      .mobile-bottom {
        display: none;
      }

      @media (max-width: 980px) {
        .categories-grid {
          grid-template-columns: repeat(4, 1fr);
        }

        .product-grid {
          grid-template-columns: repeat(3, 1fr);
        }

        .options-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 720px) {
        .page-shell {
          width: min(100% - 22px, 1180px);
        }

        .header-inner {
          min-height: 64px;
          grid-template-columns: auto 1fr auto;
          gap: 7px;
        }

        .logo-word {
          font-size: 17px;
        }

        .logo-circle {
          width: 38px;
          height: 38px;
        }

        .header-search {
          order: 4;
          grid-column: 1 / -1;
          margin-bottom: 9px;
        }

        .top-header {
          position: sticky;
        }

        .header-actions .hide-mobile {
          display: none;
        }

        .category-nav-inner {
          min-height: 42px;
        }

        .category-link {
          font-size: 11px;
          padding: 7px 9px;
        }

        .hero {
          min-height: 330px;
          padding: 29px 23px;
          border-radius: 20px;
        }

        .hero h1 {
          font-size: 34px;
        }

        .section {
          padding: 27px 0;
        }

        .categories-grid {
          grid-template-columns: repeat(4, 1fr);
          gap: 7px;
        }

        .category-card {
          border-radius: 12px;
        }

        .category-name {
          font-size: 9px;
          padding: 7px 2px 8px;
        }

        .product-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .product-info {
          padding: 10px;
        }

        .product-name {
          font-size: 12px;
        }

        .price {
          font-size: 16px;
        }

        .promo {
          grid-template-columns: 1fr;
        }

        .detail-grid {
          grid-template-columns: 1fr;
          gap: 18px;
        }

        .options-grid {
          grid-template-columns: 1fr;
        }

        .footer-grid {
          grid-template-columns: 1fr 1fr;
        }

        .mobile-bottom {
          position: fixed;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          bottom: 0;
          left: 0;
          right: 0;
          height: 63px;
          background: rgba(255,255,255,.96);
          backdrop-filter: blur(14px);
          border-top: 1px solid var(--line);
          z-index: 45;
          padding-bottom: env(safe-area-inset-bottom);
        }

        .mobile-bottom a {
          display: grid;
          place-items: center;
          align-content: center;
          gap: 3px;
          color: #766d76;
          font-size: 9px;
          font-weight: 700;
        }

        .mobile-bottom a.active {
          color: var(--purple);
        }

        .mobile-bottom svg {
          width: 20px;
          height: 20px;
        }

        .footer {
          padding-bottom: 90px;
        }
      }

      @media (max-width: 430px) {
        .page-shell {
          width: calc(100% - 18px);
        }

        .categories-grid {
          gap: 6px;
        }

        .category-name {
          font-size: 8.5px;
        }

        .product-grid {
          gap: 8px;
        }

        .product-actions {
          grid-template-columns: 1fr;
        }

        .view-button {
          display: none;
        }

        .cart-item {
          grid-template-columns: 65px 1fr;
        }

        .cart-item > :last-child {
          grid-column: 2;
        }

        .footer-grid {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
  );
}

/* =========================================================
   HEADER
   ========================================================= */

function Header({
  cartCount,
  search,
  setSearch,
  onMenu,
  onCart,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  function submitSearch(event) {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      navigate("/");
      return;
    }

    navigate(`/buscar?q=${encodeURIComponent(value)}`);
  }

  return (
    <>
      <header className="top-header">
        <div className="page-shell header-inner">
          <button
            className="icon-button"
            onClick={onMenu}
            aria-label="Abrir menú"
          >
            <Icon name="menu" />
          </button>

          <VaniLogo />

          <form className="header-search" onSubmit={submitSearch}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="¿Qué estás buscando?"
              aria-label="Buscar"
            />
            <button className="search-button" type="submit">
              <Icon name="search" size={18} stroke={2.2} />
            </button>
          </form>

          <div className="header-actions">
            <button
              className="icon-button hide-mobile"
              onClick={() => navigate("/cuenta")}
              aria-label="Cuenta"
            >
              <Icon name="user" />
            </button>

            <button
              className="icon-button"
              onClick={onCart}
              aria-label="Carrito"
            >
              <Icon name="cart" />
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      <nav className="category-nav">
        <div className="page-shell category-nav-inner">
          <button
            className={`category-link ${
              location.pathname === "/" ? "active" : ""
            }`}
            onClick={() => navigate("/")}
          >
            Inicio
          </button>

          {categories.map((category) => (
            <button
              key={category.name}
              className="category-link"
              onClick={() =>
                navigate(
                  `/categoria/${encodeURIComponent(
                    category.name
                  )}`
                )
              }
            >
              {category.name}
            </button>
          ))}

          <button
            className="category-link"
            onClick={() => navigate("/ofertas")}
          >
            Ofertas
          </button>
        </div>
      </nav>
    </>
  );
}

/* =========================================================
   PRODUCT CARD
   ========================================================= */

function ProductCard({
  product,
  favorite,
  onFavorite,
  onAdd,
}) {
  const navigate = useNavigate();

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          className="product-image"
          src={product.image}
          alt={product.name}
          loading="lazy"
        />

        {product.discount > 0 && (
          <span className="discount">
            -{product.discount}%
          </span>
        )}

        <button
          className={`favorite-button ${
            favorite ? "active" : ""
          }`}
          onClick={() => onFavorite(product.id)}
          aria-label="Favorito"
        >
          <Icon name="heart" size={18} />
        </button>
      </div>

      <div className="product-info">
        <div className="product-category">
          {product.category}
        </div>

        <div className="product-name">
          {product.name}
        </div>

        <div className="rating">
          <Icon name="star" size={12} />
          <strong>{product.rating}</strong>
          <span>({product.reviews})</span>
        </div>

        <div className="price-row">
          <span className="price">
            {formatPrice(product.price)}
          </span>

          {product.oldPrice && (
            <span className="old-price">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="product-actions">
          <button
            className="add-button"
            onClick={() => onAdd(product)}
          >
            Agregar al carrito
          </button>

          <button
            className="view-button"
            onClick={() =>
              navigate(`/producto/${product.id}`)
            }
            aria-label="Ver producto"
          >
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   HOME
   ========================================================= */

function HomePage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  const navigate = useNavigate();

  return (
    <>
      <main className="page-shell">
        <section className="hero">
          <div className="hero-content">
            <span className="hero-kicker">
              Todo en un solo lugar
            </span>

            <h1>
              Compra, vende y descubre
              <br />
              con VaniDaxi.
            </h1>

            <p>
              Un espacio para encontrar productos,
              descubrir ofertas y conectar compradores
              y vendedores.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => navigate("/categoria/Moda")}
              >
                Explorar productos
              </button>

              <button
                className="secondary-button"
                onClick={() => navigate("/publicar")}
              >
                Vender en VaniDaxi
              </button>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Categorías</h2>
              <p>
                Encuentra exactamente lo que buscas.
              </p>
            </div>

            <button
              className="text-link"
              onClick={() => navigate("/categorias")}
            >
              Ver todas
            </button>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.name}
                className="category-card"
                onClick={() =>
                  navigate(
                    `/categoria/${encodeURIComponent(
                      category.name
                    )}`
                  )
                }
              >
                <img
                  className="category-image"
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                />

                <div className="category-name">
                  {category.name}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="promo">
            <div>
              <h2>Vende lo que ya no necesitas.</h2>
              <p>
                Publica tus productos y llega a compradores
                desde VaniDaxi.
              </p>

              <button
                className="primary-button"
                onClick={() => navigate("/publicar")}
              >
                Publicar producto
              </button>
            </div>

            <div className="promo-box">
              <div>
                <strong>VaniDaxi</strong>
                <br />
                <span>Todo en un solo lugar</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Destacados</h2>
              <p>
                Productos que podrían interesarte.
              </p>
            </div>

            <button
              className="text-link"
              onClick={() => navigate("/productos")}
            >
              Ver todos
            </button>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorite={favorites.includes(product.id)}
                onFavorite={onFavorite}
                onAdd={onAdd}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

/* =========================================================
   CATEGORÍAS
   ========================================================= */

function CategoriesPage() {
  const navigate = useNavigate();

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">Categorías</h1>
      <p className="page-subtitle">
        Explora todas las categorías disponibles en VaniDaxi.
      </p>

      <div className="categories-grid">
        {categories.map((category) => (
          <button
            key={category.name}
            className="category-card"
            onClick={() =>
              navigate(
                `/categoria/${encodeURIComponent(
                  category.name
                )}`
              )
            }
          >
            <img
              className="category-image"
              src={category.image}
              alt={category.name}
            />

            <div className="category-name">
              {category.name}
            </div>
          </button>
        ))}
      </div>
    </main>
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
}) {
  const { name } = useParams();

  const categoryName = decodeURIComponent(name || "");

  const category = categories.find(
    (item) =>
      item.name.toLowerCase() ===
      categoryName.toLowerCase()
  );

  const filtered = products.filter(
    (product) =>
      product.category.toLowerCase() ===
      categoryName.toLowerCase()
  );

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        {category?.name || categoryName}
      </h1>

      <p className="page-subtitle">
        Productos disponibles en esta categoría.
      </p>

      {filtered.length > 0 ? (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite={favorites.includes(product.id)}
              onFavorite={onFavorite}
              onAdd={onAdd}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">
            <Icon name="bag" />
          </div>

          <strong>
            Todavía no hay productos aquí.
          </strong>

          <p>
            Pronto encontrarás nuevos productos en esta
            categoría.
          </p>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   PRODUCTS PAGE
   ========================================================= */

function ProductsPage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Todos los productos
      </h1>

      <p className="page-subtitle">
        Explora el catálogo completo de VaniDaxi.
      </p>

      <div className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            favorite={favorites.includes(product.id)}
            onFavorite={onFavorite}
            onAdd={onAdd}
          />
        ))}
      </div>
    </main>
  );
}

/* =========================================================
   OFFERS
   ========================================================= */

function OffersPage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  const offers = products.filter(
    (product) => Number(product.discount) > 0
  );

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">Ofertas</h1>

      <p className="page-subtitle">
        Aprovecha los productos con descuento.
      </p>

      <div className="product-grid">
        {offers.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            favorite={favorites.includes(product.id)}
            onFavorite={onFavorite}
            onAdd={onAdd}
          />
        ))}
      </div>
    </main>
  );
}

/* =========================================================
   SEARCH
   ========================================================= */

function SearchPage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const query = params.get("q") || "";

  const results = products.filter((product) => {
    const text = `
      ${product.name}
      ${product.category}
      ${product.description}
    `.toLowerCase();

    return text.includes(query.toLowerCase());
  });

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Resultados
      </h1>

      <p className="page-subtitle">
        Buscando: <strong>{query}</strong>
      </p>

      {results.length ? (
        <div className="product-grid">
          {results.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite={favorites.includes(product.id)}
              onFavorite={onFavorite}
              onAdd={onAdd}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">
            <Icon name="search" />
          </div>

          <strong>
            No encontramos resultados.
          </strong>

          <p>
            Intenta buscar con otro término.
          </p>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   PRODUCT DETAIL
   ========================================================= */

function ProductPage({
  products,
  onAdd,
  favorites,
  onFavorite,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = products.find(
    (item) => String(item.id) === String(id)
  );

  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <main className="page-shell inner-page">
        <div className="empty">
          <strong>
            Producto no encontrado.
          </strong>

          <br />

          <button
            className="primary-button"
            onClick={() => navigate("/productos")}
            style={{ marginTop: 15 }}
          >
            Ver productos
          </button>
        </div>
      </main>
    );
  }

  function add() {
    for (let i = 0; i < quantity; i += 1) {
      onAdd(product);
    }
  }

  return (
    <main className="page-shell inner-page">
      <button
        className="text-link"
        onClick={() => navigate(-1)}
        style={{
          border: 0,
          background: "transparent",
          marginBottom: 18,
          padding: 0,
        }}
      >
        ← Volver
      </button>

      <div className="detail-grid">
        <img
          className="detail-image"
          src={product.image}
          alt={product.name}
        />

        <div>
          <div className="detail-category">
            {product.category}
          </div>

          <h1 className="detail-title">
            {product.name}
          </h1>

          <div className="rating">
            <Icon name="star" size={14} />
            <strong>{product.rating}</strong>
            <span>
              {product.reviews} reseñas
            </span>
          </div>

          <div className="price-row">
            <span className="price">
              {formatPrice(product.price)}
            </span>

            {product.oldPrice && (
              <span className="old-price">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <p className="detail-description">
            {product.description}
          </p>

          <ul className="spec-list">
            {product.specifications?.map((spec) => (
              <li key={spec}>
                <Icon name="check" size={16} />
                {spec}
              </li>
            ))}
          </ul>

          <div className="quantity-row">
            <div className="quantity">
              <button
                onClick={() =>
                  setQuantity((value) =>
                    Math.max(1, value - 1)
                  )
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                onClick={() =>
                  setQuantity((value) => value + 1)
                }
              >
                +
              </button>
            </div>

            <button
              className={`favorite-button ${
                favorites.includes(product.id)
                  ? "active"
                  : ""
              }`}
              onClick={() => onFavorite(product.id)}
              style={{
                position: "static",
                border: "1px solid #eee",
              }}
            >
              <Icon name="heart" />
            </button>
          </div>

          <div className="form-actions">
            <button
              className="primary-button"
              onClick={add}
            >
              Agregar al carrito
            </button>

            <button
              className="secondary-button"
              onClick={() => {
                add();
                navigate("/carrito");
              }}
            >
              Comprar ahora
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   CART PAGE
   ========================================================= */

function CartPage({ cart, onRemove, onQuantity }) {
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  if (!cart.length) {
    return (
      <main className="page-shell inner-page">
        <h1 className="page-title">Tu carrito</h1>

        <div className="empty" style={{ marginTop: 20 }}>
          <div className="empty-icon">
            <Icon name="cart" />
          </div>

          <strong>
            Tu carrito está vacío.
          </strong>

          <p>
            Agrega productos para comenzar tu compra.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/productos")}
            style={{ marginTop: 12 }}
          >
            Explorar productos
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">Tu carrito</h1>

      <p className="page-subtitle">
        Revisa tus productos antes de continuar.
      </p>

      <div className="page-card">
        <div className="cart-list">
          {cart.map((item) => (
            <div
              className="cart-item"
              key={item.id}
            >
              <img
                src={item.image}
                alt={item.name}
              />

              <div>
                <h3>{item.name}</h3>

                <p>
                  {formatPrice(item.price)}
                </p>

                <div
                  className="quantity"
                  style={{
                    marginTop: 7,
                    width: "fit-content",
                  }}
                >
                  <button
                    onClick={() =>
                      onQuantity(
                        item.id,
                        Math.max(
                          1,
                          item.quantity - 1
                        )
                      )
                    }
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

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
                className="icon-button"
                onClick={() => onRemove(item.id)}
                aria-label="Eliminar"
              >
                <Icon name="trash" size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-total">
          <div>
            <span>Total</span>
          </div>

          <strong>{formatPrice(total)}</strong>
        </div>

        <button
          className="primary-button"
          style={{
            width: "100%",
            marginTop: 16,
          }}
          onClick={() => navigate("/checkout")}
        >
          Continuar al pago
        </button>
      </div>
    </main>
  );
}

/* =========================================================
   CHECKOUT
   ========================================================= */

function CheckoutPage({ cart }) {
  const navigate = useNavigate();

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  );

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    reference: "",
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function submit(event) {
    event.preventDefault();

    alert(
      "Pedido preparado. La integración de pago se conectará aquí."
    );
  }

  if (!cart.length) {
    return (
      <main className="page-shell inner-page">
        <div className="empty">
          <strong>
            No hay productos para pagar.
          </strong>

          <button
            className="primary-button"
            style={{ marginTop: 14 }}
            onClick={() => navigate("/productos")}
          >
            Ir a productos
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Finalizar compra
      </h1>

      <p className="page-subtitle">
        Completa tus datos para continuar.
      </p>

      <div className="detail-grid">
        <div className="page-card">
          <form
            className="form"
            onSubmit={submit}
          >
            <label>
              Nombre completo
              <input
                value={form.name}
                onChange={(e) =>
                  update("name", e.target.value)
                }
                required
              />
            </label>

            <label>
              Teléfono
              <input
                value={form.phone}
                onChange={(e) =>
                  update("phone", e.target.value)
                }
                required
              />
            </label>

            <label>
              Dirección
              <input
                value={form.address}
                onChange={(e) =>
                  update("address", e.target.value)
                }
                required
              />
            </label>

            <label>
              Ciudad
              <input
                value={form.city}
                onChange={(e) =>
                  update("city", e.target.value)
                }
                required
              />
            </label>

            <label>
              Referencia
              <textarea
                value={form.reference}
                onChange={(e) =>
                  update(
                    "reference",
                    e.target.value
                  )
                }
              />
            </label>

            <button
              className="primary-button"
              type="submit"
            >
              Confirmar pedido
            </button>
          </form>
        </div>

        <div className="page-card">
          <h2 style={{ marginTop: 0 }}>
            Resumen
          </h2>

          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: 10,
                padding: "9px 0",
                borderBottom:
                  "1px solid var(--line)",
                fontSize: 13,
              }}
            >
              <span>
                {item.name} × {item.quantity}
              </span>

              <strong>
                {formatPrice(
                  item.price * item.quantity
                )}
              </strong>
            </div>
          ))}

          <div className="cart-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   ACCOUNT
   ========================================================= */

function AccountPage({ user, onLogin, onLogout }) {
  const navigate = useNavigate();

  if (!user) {
    return (
      <main className="page-shell inner-page">
        <h1 className="page-title">Mi cuenta</h1>

        <p className="page-subtitle">
          Inicia sesión para acceder a todas las
          funciones de tu cuenta.
        </p>

        <div className="page-card">
          <div className="options-grid">
            <button
              className="option-card"
              onClick={onLogin}
            >
              <span className="option-icon">
                <Icon name="user" />
              </span>

              <span>
                <strong>Iniciar sesión</strong>
                <span>
                  Accede a tu cuenta.
                </span>
              </span>
            </button>

            <button
              className="option-card"
              onClick={onLogin}
            >
              <span className="option-icon">
                <Icon name="plus" />
              </span>

              <span>
                <strong>Crear cuenta</strong>
                <span>
                  Regístrate en VaniDaxi.
                </span>
              </span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Mi cuenta
      </h1>

      <p className="page-subtitle">
        Administra tu cuenta y tus actividades.
      </p>

      <div className="options-grid">
        <AccountOption
          icon="user"
          title="Mi perfil"
          text="Información personal"
          to="/perfil"
        />

        <AccountOption
          icon="bag"
          title="Mis pedidos"
          text="Consulta tus compras"
          to="/pedidos"
        />

        <AccountOption
          icon="heart"
          title="Favoritos"
          text="Productos guardados"
          to="/favoritos"
        />

        <AccountOption
          icon="message"
          title="Mensajes"
          text="Comunícate con vendedores"
          to="/mensajes"
        />

        <AccountOption
          icon="settings"
          title="Configuración"
          text="Preferencias de cuenta"
          to="/configuracion"
        />

        <AccountOption
          icon="help"
          title="Ayuda"
          text="Centro de ayuda"
          to="/ayuda"
        />
      </div>

      <button
        className="secondary-button"
        onClick={onLogout}
        style={{ marginTop: 20 }}
      >
        Cerrar sesión
      </button>
    </main>
  );
}

/* =========================================================
   ACCOUNT OPTION
   ========================================================= */

function AccountOption({
  icon,
  title,
  text,
  to,
}) {
  return (
    <Link className="option-card" to={to}>
      <span className="option-icon">
        <Icon name={icon} />
      </span>

      <span>
        <strong>{title}</strong>
        <span>{text}</span>
      </span>

      <Icon
        name="arrow"
        size={17}
        style={{ marginLeft: "auto" }}
      />
    </Link>
  );
}

/* =========================================================
   PROFILE
   ========================================================= */

function ProfilePage({ user }) {
  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Mi perfil
      </h1>

      <p className="page-subtitle">
        Información de tu cuenta VaniDaxi.
      </p>

      <div className="page-card">
        <div className="form">
          <label>
            Correo electrónico
            <input
              value={user?.email || ""}
              readOnly
            />
          </label>

          <label>
            Nombre
            <input
              placeholder="Tu nombre"
            />
          </label>

          <label>
            Teléfono
            <input
              placeholder="Tu teléfono"
            />
          </label>

          <button className="primary-button">
            Guardar cambios
          </button>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   FAVORITES
   ========================================================= */

function FavoritesPage({
  products,
  favorites,
  onFavorite,
  onAdd,
}) {
  const saved = products.filter((product) =>
    favorites.includes(product.id)
  );

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Favoritos
      </h1>

      <p className="page-subtitle">
        Tus productos guardados.
      </p>

      {saved.length ? (
        <div className="product-grid">
          {saved.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorite
              onFavorite={onFavorite}
              onAdd={onAdd}
            />
          ))}
        </div>
      ) : (
        <div className="empty">
          <div className="empty-icon">
            <Icon name="heart" />
          </div>

          <strong>
            Todavía no tienes favoritos.
          </strong>

          <p>
            Toca el corazón de un producto para guardarlo.
          </p>
        </div>
      )}
    </main>
  );
}

/* =========================================================
   ORDERS
   ========================================================= */

function OrdersPage() {
  return (
    <SimpleSectionPage
      title="Mis pedidos"
      subtitle="Aquí aparecerá el historial de tus compras."
      icon="bag"
      items={[
        [
          "Pedidos recientes",
          "Consulta el estado de tus compras.",
        ],
        [
          "Pedidos entregados",
          "Revisa tus compras anteriores.",
        ],
        [
          "Devoluciones",
          "Gestiona devoluciones y aclaraciones.",
        ],
      ]}
    />
  );
}

/* =========================================================
   MESSAGES
   ========================================================= */

function MessagesPage() {
  return (
    <SimpleSectionPage
      title="Mensajes"
      subtitle="Todas tus conversaciones estarán aquí."
      icon="message"
      items={[
        [
          "Vendedores",
          "Consulta tus conversaciones con vendedores.",
        ],
        [
          "Compradores",
          "Responde a compradores interesados.",
        ],
        [
          "Soporte VaniDaxi",
          "Contacta al equipo de atención.",
        ],
      ]}
    />
  );
}

/* =========================================================
   SETTINGS
   ========================================================= */

function SettingsPage() {
  return (
    <SimpleSectionPage
      title="Configuración"
      subtitle="Personaliza tu experiencia en VaniDaxi."
      icon="settings"
      items={[
        [
          "Datos personales",
          "Administra tu información.",
        ],
        [
          "Notificaciones",
          "Controla qué avisos quieres recibir.",
        ],
        [
          "Privacidad",
          "Administra tus preferencias de privacidad.",
        ],
        [
          "Seguridad",
          "Protege tu cuenta.",
        ],
      ]}
    />
  );
}

/* =========================================================
   HELP
   ========================================================= */

function HelpPage() {
  return (
    <SimpleSectionPage
      title="Centro de ayuda"
      subtitle="Encuentra respuestas y formas de contactarnos."
      icon="help"
      items={[
        [
          "Preguntas frecuentes",
          "Respuestas a las preguntas más comunes.",
        ],
        [
          "Compras",
          "Ayuda con pedidos y pagos.",
        ],
        [
          "Ventas",
          "Ayuda para publicar y vender.",
        ],
        [
          "Contactar soporte",
          "Habla con nuestro equipo.",
        ],
      ]}
    />
  );
}

/* =========================================================
   SIMPLE SECTION
   ========================================================= */

function SimpleSectionPage({
  title,
  subtitle,
  icon,
  items,
}) {
  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        {title}
      </h1>

      <p className="page-subtitle">
        {subtitle}
      </p>

      <div className="options-grid">
        {items.map(([itemTitle, text]) => (
          <Link
            key={itemTitle}
            to={`/seccion/${encodeURIComponent(
              itemTitle
            )}`}
            className="option-card"
          >
            <span className="option-icon">
              <Icon name={icon} />
            </span>

            <span>
              <strong>{itemTitle}</strong>
              <span>{text}</span>
            </span>

            <Icon name="arrow" size={17} />
          </Link>
        ))}
      </div>
    </main>
  );
}

/* =========================================================
   GENERIC SUBSECTION
   ========================================================= */

function SubSectionPage() {
  const { name } = useParams();

  const title = decodeURIComponent(name || "");

  return (
    <main className="page-shell inner-page">
      <button
        className="text-link"
        onClick={() => window.history.back()}
        style={{
          border: 0,
          background: "transparent",
          padding: 0,
          marginBottom: 18,
        }}
      >
        ← Volver
      </button>

      <div className="page-card">
        <div
          className="empty"
          style={{ border: 0 }}
        >
          <div className="empty-icon">
            <Icon name="check" />
          </div>

          <h1
            style={{
              margin: "0 0 8px",
              fontSize: 25,
            }}
          >
            {title}
          </h1>

          <p>
            Esta sección ya tiene su propia página
            dentro de VaniDaxi.
          </p>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   SELL / PUBLISH
   ========================================================= */

function PublishPage({ onPublish }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Moda",
    image: "",
    description: "",
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function submit(event) {
    event.preventDefault();

    onPublish({
      ...form,
      price: Number(form.price),
      image:
        form.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=90",
    });

    navigate("/productos");
  }

  return (
    <main className="page-shell inner-page">
      <h1 className="page-title">
        Publicar producto
      </h1>

      <p className="page-subtitle">
        Crea una publicación para vender en VaniDaxi.
      </p>

      <div className="page-card">
        <form
          className="form"
          onSubmit={submit}
        >
          <label>
            Nombre del producto
            <input
              value={form.name}
              onChange={(e) =>
                update("name", e.target.value)
              }
              required
            />
          </label>

          <label>
            Precio
            <input
              type="number"
              min="1"
              value={form.price}
              onChange={(e) =>
                update("price", e.target.value)
              }
              required
            />
          </label>

          <label>
            Categoría
            <select
              value={form.category}
              onChange={(e) =>
                update("category", e.target.value)
              }
            >
              {categories.map((category) => (
                <option
                  key={category.name}
                  value={category.name}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Imagen
            <input
              value={form.image}
              onChange={(e) =>
                update("image", e.target.value)
              }
              placeholder="URL de la imagen"
            />
          </label>

          <label>
            Descripción
            <textarea
              value={form.description}
              onChange={(e) =>
                update(
                  "description",
                  e.target.value
                )
              }
              required
            />
          </label>

          <button
            className="primary-button"
            type="submit"
          >
            Publicar
          </button>
        </form>
      </div>
    </main>
  );
}

/* =========================================================
   LOGIN / REGISTER
   ========================================================= */

function AuthPage({ onSuccess }) {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        const { data, error: signUpError } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
              },
            },
          });

        if (signUpError) {
          throw signUpError;
        }

        if (data?.session) {
          onSuccess(data.session.user);
          navigate("/cuenta");
        } else {
          alert(
            "Cuenta creada. Revisa tu correo si se solicita confirmación."
          );
          setMode("login");
        }
      } else {
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (signInError) {
          throw signInError;
        }

        onSuccess(data.user);
        navigate("/cuenta");
      }
    } catch (authError) {
      setError(
        authError?.message ||
          "No fue posible completar la operación."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-shell inner-page">
      <div
        style={{
          maxWidth: 500,
          margin: "0 auto",
        }}
      >
        <div className="page-card">
          <div
            style={{
              textAlign: "center",
              marginBottom: 22,
            }}
          >
            <VaniLogo />

            <h1
              className="page-title"
              style={{
                fontSize: 28,
                marginTop: 20,
              }}
            >
              {mode === "login"
                ? "Bienvenido"
                : "Crear cuenta"}
            </h1>
          </div>

          <form
            className="form"
            onSubmit={submit}
          >
            {mode === "register" && (
              <label>
                Nombre
                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              </label>
            )}

            <label>
              Correo electrónico
              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </label>

            <label>
              Contraseña
              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                minLength={6}
              />
            </label>

            {error && (
              <div
                style={{
                  padding: 11,
                  borderRadius: 10,
                  background: "#fff1f3",
                  color: "#9c1b38",
                  fontSize: 12,
                }}
              >
                {error}
              </div>
            )}

            <button
              className="primary-button"
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
            className="secondary-button"
            style={{
              width: "100%",
              marginTop: 10,
            }}
            onClick={() =>
              setMode((current) =>
                current === "login"
                  ? "register"
                  : "login"
              )
            }
          >
            {mode === "login"
              ? "Crear una cuenta"
              : "Ya tengo una cuenta"}
          </button>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   MENU LATERAL
   ========================================================= */

function SideMenu({ onClose, user }) {
  return (
    <div
      className="overlay"
      onClick={onClose}
    >
      <aside
        className="side-panel"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="menu-header">
          <strong>VaniDaxi</strong>

          <button
            className="icon-button"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="menu-list">
          <MenuLink
            to="/"
            icon="home"
            text="Inicio"
            onClose={onClose}
          />

          <MenuLink
            to="/categorias"
            icon="bag"
            text="Categorías"
            onClose={onClose}
          />

          <MenuLink
            to="/ofertas"
            icon="star"
            text="Ofertas"
            onClose={onClose}
          />

          <MenuLink
            to="/productos"
            icon="bag"
            text="Productos"
            onClose={onClose}
          />

          <MenuLink
            to="/publicar"
            icon="plus"
            text="Vender en VaniDaxi"
            onClose={onClose}
          />

          <MenuLink
            to="/favoritos"
            icon="heart"
            text="Favoritos"
            onClose={onClose}
          />

          <MenuLink
            to="/pedidos"
            icon="bag"
            text="Mis pedidos"
            onClose={onClose}
          />

          <MenuLink
            to="/mensajes"
            icon="message"
            text="Mensajes"
            onClose={onClose}
          />

          <MenuLink
            to="/cuenta"
            icon="user"
            text={user ? "Mi cuenta" : "Iniciar sesión"}
            onClose={onClose}
          />

          <MenuLink
            to="/configuracion"
            icon="settings"
            text="Configuración"
            onClose={onClose}
          />

          <MenuLink
            to="/ayuda"
            icon="help"
            text="Ayuda"
            onClose={onClose}
          />
        </div>
      </aside>
    </div>
  );
}

function MenuLink({
  to,
  icon,
  text,
  onClose,
}) {
  return (
    <Link
      to={to}
      className="menu-item"
      onClick={onClose}
    >
      <Icon name={icon} size={19} />
      <span>{text}</span>
    </Link>
  );
}

/* =========================================================
   FOOTER
   ========================================================= */

function Footer() {
  return (
    <footer className="footer">
      <div className="page-shell footer-grid">
        <div>
          <VaniLogo />

          <p>
            VaniDaxi: todo en un solo lugar.
          </p>
        </div>

        <div>
          <h3>Comprar</h3>

          <div className="footer-links">
            <Link to="/productos">
              Productos
            </Link>

            <Link to="/categorias">
              Categorías
            </Link>

            <Link to="/ofertas">
              Ofertas
            </Link>
          </div>
        </div>

        <div>
          <h3>Vender</h3>

          <div className="footer-links">
            <Link to="/publicar">
              Publicar producto
            </Link>

            <Link to="/cuenta">
              Mi cuenta
            </Link>
          </div>
        </div>

        <div>
          <h3>Ayuda</h3>

          <div className="footer-links">
            <Link to="/ayuda">
              Centro de ayuda
            </Link>

            <Link to="/mensajes">
              Contacto
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* =========================================================
   MOBILE NAV
   ========================================================= */

function MobileBottomNav({ cartCount }) {
  return (
    <nav className="mobile-bottom">
      <NavLink to="/">
        <Icon name="home" />
        <span>Inicio</span>
      </NavLink>

      <NavLink to="/categorias">
        <Icon name="bag" />
        <span>Categorías</span>
      </NavLink>

      <NavLink to="/favoritos">
        <Icon name="heart" />
        <span>Favoritos</span>
      </NavLink>

      <NavLink to="/carrito">
        <span style={{ position: "relative" }}>
          <Icon name="cart" />

          {cartCount > 0 && (
            <span
              className="cart-count"
              style={{
                top: -7,
                right: -9,
              }}
            >
              {cartCount}
            </span>
          )}
        </span>

        <span>Carrito</span>
      </NavLink>
    </nav>
  );
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  const navigate = useNavigate();

  const [products, setProducts] =
    useState(initialProducts);

  const [cart, setCart] = useState(() =>
    readStorage(CART_KEY, [])
  );

  const [favorites, setFavorites] =
    useState(() =>
      readStorage(FAVORITES_KEY, [])
    );

  const [user, setUser] = useState(null);

  const [search, setSearch] = useState("");

  const [showMenu, setShowMenu] =
    useState(false);

  useEffect(() => {
    saveStorage(CART_KEY, cart);
  }, [cart]);

  useEffect(() => {
    saveStorage(FAVORITES_KEY, favorites);
  }, [favorites]);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          setUser(
            data?.session?.user || null
          );
        }
      });

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (mounted) {
            setUser(
              session?.user || null
            );
          }
        }
      );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  function addToCart(product) {
    setCart((current) => {
      const exists = current.find(
        (item) => item.id === product.id
      );

      if (exists) {
        return current.map((item) =>
          item.id === product.id
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
  }

  function removeFromCart(id) {
    setCart((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  }

  function changeQuantity(id, quantity) {
    setCart((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  }

  function toggleFavorite(id) {
    setFavorites((current) =>
      current.includes(id)
        ? current.filter(
            (item) => item !== id
          )
        : [...current, id]
    );
  }

  function publishProduct(data) {
    const newItem = {
      id: `local-${Date.now()}`,
      name:
        data.name || "Nuevo producto",
      price: Number(data.price) || 0,
      oldPrice: null,
      rating: 5,
      reviews: 0,
      discount: 0,
      category:
        data.category || "Moda",
      type: "Nuevo",
      image: data.image,
      description:
        data.description || "",
      specifications: [],
    };

    setProducts((current) => [
      newItem,
      ...current,
    ]);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  }

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.quantity),
        0
      ),
    [cart]
  );

  return (
    <div className="app">
      <GlobalStyles />

      <Header
        cartCount={cartCount}
        search={search}
        setSearch={setSearch}
        onMenu={() => setShowMenu(true)}
        onCart={() => navigate("/carrito")}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/categorias"
          element={<CategoriesPage />}
        />

        <Route
          path="/categoria/:name"
          element={
            <CategoryPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/productos"
          element={
            <ProductsPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/ofertas"
          element={
            <OffersPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/buscar"
          element={
            <SearchPage
              products={products}
              favorites={favorites}
              onFavorite={toggleFavorite}
              onAdd={addToCart}
            />
          }
        />

        <Route
          path="/producto/:id"
          element={
            <ProductPage
              products={products}
              onAdd={addToCart}
              favorites={favorites}
              onFavorite={toggleFavorite}
            />
          }
        />

        <Route
          path="/carrito"
          element={
            <CartPage
              cart={cart}
              onRemove={removeFromCart}
              onQuantity={changeQuantity}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <CheckoutPage cart={cart} />
          }
        />

        <Route
          path="/cuenta"
          element={
            <AccountPage
              user={user}
              onLogin={() =>
                navigate("/login")
              }
              onLogout={logout}
            />
          }
        />

        <Route
          path="/login"
          element={
            <AuthPage
              onSuccess={setUser}
            />
          }
        />

        <Route
          path="/perfil"
          element={
            <ProfilePage user={user} />
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
            />
          }
        />

        <Route
          path="/pedidos"
          element={<OrdersPage />}
        />

        <Route
          path="/mensajes"
          element={<MessagesPage />}
        />

        <Route
          path="/configuracion"
          element={<SettingsPage />}
        />

        <Route
          path="/ayuda"
          element={<HelpPage />}
        />

        <Route
          path="/publicar"
          element={
            <PublishPage
              onPublish={publishProduct}
            />
          }
        />

        <Route
          path="/seccion/:name"
          element={<SubSectionPage />}
        />

        <Route
          path="*"
          element={
            <main className="page-shell inner-page">
              <div className="empty">
                <div className="empty-icon">
                  <Icon name="help" />
                </div>

                <strong>
                  Página no encontrada.
                </strong>

                <p>
                  La opción que buscas no existe.
                </p>

                <button
                  className="primary-button"
                  onClick={() => navigate("/")}
                  style={{ marginTop: 12 }}
                >
                  Volver al inicio
                </button>
              </div>
            </main>
          }
        />
      </Routes>

      <Footer />

      <MobileBottomNav
        cartCount={cartCount}
      />

      {showMenu && (
        <SideMenu
          user={user}
          onClose={() =>
            setShowMenu(false)
          }
        />
      )}
    </div>
  );
}

export default App;
