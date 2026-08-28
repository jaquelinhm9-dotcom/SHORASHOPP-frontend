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

const CART_KEY = "vanidaxi_cart";
const FAVORITES_KEY = "vanidaxi_favorites";

/* =========================================================
   CATEGORÍAS
   ========================================================= */

const categories = [
  {
    name: "Ropa y Moda",
    image:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=90",
    color: "pink",
  },
  {
    name: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=90",
    color: "purple",
  },
  {
    name: "Hogar y Vida",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=90",
    color: "rose",
  },
  {
    name: "Belleza y Salud",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=90",
    color: "magenta",
  },
  {
    name: "Accesorios",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=90",
    color: "violet",
  },
  {
    name: "Juguetes y Más",
    image:
      "https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&w=600&q=90",
    color: "fuchsia",
  },
];

/* =========================================================
   PRODUCTOS
   ========================================================= */

const products = [
  {
    id: 1,
    name: "Audífonos Inalámbricos",
    price: 399,
    oldPrice: 499,
    discount: "-20%",
    badgeType: "discount",
    rating: "4.8",
    sales: "120 ventas",
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=700&q=90",
    description:
      "Audífonos inalámbricos compactos, cómodos y perfectos para uso diario.",
    specifications: [
      "Bluetooth inalámbrico",
      "Estuche de carga incluido",
      "Micrófono integrado",
      "Diseño compacto",
    ],
  },
  {
    id: 2,
    name: "Bolsa de Hombro Elegante",
    price: 599,
    oldPrice: null,
    discount: "Nuevo",
    badgeType: "new",
    rating: "4.9",
    sales: "85 ventas",
    category: "Ropa y Moda",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=90",
    description:
      "Bolsa elegante para uso diario, con diseño moderno y gran versatilidad.",
    specifications: [
      "Diseño elegante",
      "Correa ajustable",
      "Interior espacioso",
      "Uso diario",
    ],
  },
  {
    id: 3,
    name: "Smartwatch Series 9",
    price: 1699,
    oldPrice: 1999,
    discount: "-15%",
    badgeType: "discount",
    rating: "4.7",
    sales: "64 ventas",
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=90",
    description:
      "Smartwatch moderno para monitorear actividad y mantenerte conectado.",
    specifications: [
      "Pantalla táctil",
      "Monitoreo de actividad",
      "Notificaciones",
      "Diseño deportivo",
    ],
  },
  {
    id: 4,
    name: "Licuadora Profesional",
    price: 899,
    oldPrice: null,
    discount: "Nuevo",
    badgeType: "new",
    rating: "4.6",
    sales: "45 ventas",
    category: "Hogar y Vida",
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=700&q=90",
    description:
      "Licuadora de alto rendimiento para preparar bebidas y alimentos fácilmente.",
    specifications: [
      "Motor potente",
      "Vaso de gran capacidad",
      "Cuchillas reforzadas",
      "Fácil limpieza",
    ],
  },
  {
    id: 5,
    name: "Tenis Urbanos",
    price: 749,
    oldPrice: 999,
    discount: "-25%",
    badgeType: "discount",
    rating: "4.8",
    sales: "92 ventas",
    category: "Ropa y Moda",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=90",
    description:
      "Tenis urbanos cómodos para combinar con cualquier estilo.",
    specifications: [
      "Suela cómoda",
      "Diseño urbano",
      "Material resistente",
      "Uso diario",
    ],
  },
  {
    id: 6,
    name: "Cámara Instantánea",
    price: 1199,
    oldPrice: 1399,
    discount: "-14%",
    badgeType: "discount",
    rating: "4.7",
    sales: "51 ventas",
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=700&q=90",
    description:
      "Cámara instantánea para capturar y conservar tus mejores momentos.",
    specifications: [
      "Fotografía instantánea",
      "Diseño compacto",
      "Flash integrado",
      "Ideal para viajes",
    ],
  },
  {
    id: 7,
    name: "Set de Cuidado Facial",
    price: 459,
    oldPrice: 599,
    discount: "-23%",
    badgeType: "discount",
    rating: "4.9",
    sales: "73 ventas",
    category: "Belleza y Salud",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=90",
    description:
      "Set de cuidado facial para complementar tu rutina diaria.",
    specifications: [
      "Cuidado diario",
      "Presentación completa",
      "Texturas ligeras",
      "Ideal para regalar",
    ],
  },
  {
    id: 8,
    name: "Lámpara Decorativa",
    price: 549,
    oldPrice: null,
    discount: "Nuevo",
    badgeType: "new",
    rating: "4.6",
    sales: "38 ventas",
    category: "Hogar y Vida",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=90",
    description:
      "Lámpara decorativa moderna para darle personalidad a cualquier espacio.",
    specifications: [
      "Diseño moderno",
      "Luz ambiental",
      "Ideal para interiores",
      "Fácil instalación",
    ],
  },
];

/* =========================================================
   UTILIDADES
   ========================================================= */

function getCart() {
  try {
    const value = JSON.parse(
      localStorage.getItem(CART_KEY) || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

  window.dispatchEvent(
    new CustomEvent("vanidaxi-cart-change")
  );
}

function getFavorites() {
  try {
    const value = JSON.parse(
      localStorage.getItem(FAVORITES_KEY) || "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(
    FAVORITES_KEY,
    JSON.stringify(favorites)
  );

  window.dispatchEvent(
    new CustomEvent("vanidaxi-favorites-change")
  );
}

function addProductToCart(product) {
  const cart = getCart();

  const existing = cart.find(
    (item) =>
      Number(item.id) === Number(product.id)
  );

  if (existing) {
    existing.quantity =
      Number(existing.quantity || 1) + 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  saveCart(cart);
}

function removeProductFromCart(productId) {
  const cart = getCart().filter(
    (item) =>
      Number(item.id) !== Number(productId)
  );

  saveCart(cart);
}

function updateCartQuantity(
  productId,
  quantity
) {
  const cart = getCart();

  const item = cart.find(
    (entry) =>
      Number(entry.id) ===
      Number(productId)
  );

  if (!item) return;

  item.quantity = Math.max(
    1,
    Number(quantity) || 1
  );

  saveCart(cart);
}

function formatPrice(value) {
  return `$${Number(value).toLocaleString(
    "es-MX"
  )}.00`;
}

/* =========================================================
   ICONOS
   ========================================================= */

function Icon({
  name,
  size = 24,
  stroke = 1.8,
  fill = "none",
}) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill,
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  switch (name) {
    case "menu":
      return (
        <svg {...props}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      );

    case "search":
      return (
        <svg {...props}>
          <circle
            cx="10.8"
            cy="10.8"
            r="6.2"
          />
          <path d="m15.5 15.5 5 5" />
        </svg>
      );

    case "bell":
      return (
        <svg {...props}>
          <path d="M18 9a6 6 0 0 0-12 0c0 5.5-2.2 7-2.2 8.2h16.4C20.2 16 18 14.5 18 9Z" />
          <path d="M10 20.2h4" />
        </svg>
      );

    case "cart":
      return (
        <svg {...props}>
          <path d="M3.5 5h2l2 10h10l3-7H6.2" />
          <circle
            cx="9.3"
            cy="19"
            r="1.4"
          />
          <circle
            cx="17.2"
            cy="19"
            r="1.4"
          />
        </svg>
      );

    case "store":
      return (
        <svg {...props}>
          <path d="M4 10.3h16" />
          <path d="m5 10.3 1.4-5.1h11.2l1.4 5.1" />
          <path d="M6.5 10.3v9.2h11v-9.2" />
          <path d="M9.2 19.5v-4.8h5.6v4.8" />
        </svg>
      );

    case "user":
      return (
        <svg {...props}>
          <circle
            cx="12"
            cy="8.1"
            r="3.5"
          />
          <path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" />
        </svg>
      );

    case "heart":
      return (
        <svg {...props}>
          <path d="M20.8 8.6c0 5-8.8 10.2-8.8 10.2S3.2 13.6 3.2 8.6A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.6Z" />
        </svg>
      );

    case "grid":
      return (
        <svg {...props}>
          <rect
            x="4"
            y="4"
            width="6"
            height="6"
            rx="1"
          />
          <rect
            x="14"
            y="4"
            width="6"
            height="6"
            rx="1"
          />
          <rect
            x="4"
            y="14"
            width="6"
            height="6"
            rx="1"
          />
          <rect
            x="14"
            y="14"
            width="6"
            height="6"
            rx="1"
          />
        </svg>
      );

    case "shield":
      return (
        <svg {...props}>
          <path d="M12 3 19 6v5c0 4.7-3 7.4-7 10-4-2.6-7-5.3-7-10V6l7-3Z" />
          <path d="m8.8 12 2.1 2.1 4.5-4.5" />
        </svg>
      );

    case "truck":
      return (
        <svg {...props}>
          <path d="M3 6h11v10H3z" />
          <path d="M14 10h4l3 3v3h-7" />
          <circle
            cx="7"
            cy="18"
            r="1.5"
          />
          <circle
            cx="18"
            cy="18"
            r="1.5"
          />
        </svg>
      );

    case "badge":
      return (
        <svg {...props}>
          <circle
            cx="12"
            cy="10"
            r="5.5"
          />
          <path d="m8.5 14.5-1 6 4.5-2.5 4.5 2.5-1-6" />
          <path d="m10 10 1.5 1.5L14.5 8.5" />
        </svg>
      );

    case "chat":
      return (
        <svg {...props}>
          <path d="M20 11a8 8 0 0 1-8 8 8.8 8.8 0 0 1-3.6-.8L4 20l1.8-3.7A8 8 0 1 1 20 11Z" />
          <path d="M8.5 11h.01" />
          <path d="M12 11h.01" />
          <path d="M15.5 11h.01" />
        </svg>
      );

    case "close":
      return (
        <svg {...props}>
          <path d="m6 6 12 12" />
          <path d="m18 6-12 12" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...props}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case "spark":
      return (
        <svg {...props}>
          <path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" />
        </svg>
      );

    case "fire":
      return (
        <svg {...props}>
          <path d="M12 21c4.2 0 7-2.7 7-6.6 0-3.2-1.8-5.1-4.3-7.4.1 2-1 3.4-2.1 4.1.1-3.2-1.4-5.9-4.3-8.1.2 3.8-3.3 5.5-3.3 9.2C5 17.8 7.8 21 12 21Z" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   HEADER
   ========================================================= */

function Header({
  cartCount,
  onOpenMenu,
  hidden,
  onAccount,
}) {
  return (
    <header
      className={`vd-header ${
        hidden
          ? "vd-header-hidden"
          : ""
      }`}
    >
      <button
        type="button"
        className="vd-menu-button"
        onClick={onOpenMenu}
        aria-label="Abrir menú"
      >
        <Icon
          name="menu"
          size={25}
          stroke={1.9}
        />
      </button>

      <Link
        to="/"
        className="vd-brand"
      >
        <span>Vani</span>
        <strong>Daxi</strong>
      </Link>

      <div className="vd-header-right">
        <button
          type="button"
          className="vd-header-icon"
          onClick={onAccount}
          aria-label="Cuenta"
        >
          <Icon
            name="bell"
            size={23}
          />
          <i>3</i>
        </button>

        <Link
          to="/carrito"
          className="vd-header-icon"
          aria-label="Carrito"
        >
          <Icon
            name="cart"
            size={24}
          />
          <i>{cartCount}</i>
        </Link>
      </div>
    </header>
  );
}

/* =========================================================
   BUSCADOR
   ========================================================= */

function SearchBox({
  value,
  onChange,
}) {
  return (
    <div className="vd-search-box">
      <Icon
        name="search"
        size={21}
        stroke={1.7}
      />

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder="¿Qué estás buscando hoy?"
        aria-label="Buscar productos"
      />

      <button
        type="button"
        aria-label="Buscar"
      >
        <Icon
          name="search"
          size={19}
          stroke={1.9}
        />
      </button>
    </div>
  );
}

/* =========================================================
   TARJETAS PRINCIPALES
   ========================================================= */

function MainPromoCards({
  onSell,
  onAccount,
}) {
  return (
    <section className="vd-main-cards">
      <button
        type="button"
        className="vd-main-card vd-sell-card"
        onClick={onSell}
      >
        <span className="vd-main-icon">
          <Icon
            name="store"
            size={27}
          />
        </span>

        <span className="vd-main-copy">
          <strong>
            Vende en
            <br />
            VaniDaxi
          </strong>

          <small>
            Únete y comienza
            <br />
            a vender hoy
          </small>
        </span>

        <span className="vd-card-arrow">
          <Icon
            name="arrow"
            size={13}
          />
        </span>
      </button>

      <button
        type="button"
        className="vd-main-card vd-account-card"
        onClick={onAccount}
      >
        <span className="vd-main-icon vd-account-icon-main">
          <Icon
            name="user"
            size={27}
          />
        </span>

        <span className="vd-main-copy">
          <strong>
            Mi cuenta
          </strong>

          <small>
            Inicia sesión o regístrate
            <br />
            como comprador o vendedor
          </small>
        </span>

        <span className="vd-card-arrow">
          <Icon
            name="arrow"
            size={13}
          />
        </span>
      </button>
    </section>
  );
}

/* =========================================================
   CATEGORÍAS
   ========================================================= */

function CategoriesSection() {
  return (
    <section className="vd-section">
      <div className="vd-section-title">
        <h2>Categorías</h2>

        <Link to="/catalogo">
          Ver todas
          <span>›</span>
        </Link>
      </div>

      <div className="vd-category-row">
        {categories.map((category) => (
          <Link
            key={category.name}
            to={`/catalogo?categoria=${encodeURIComponent(
              category.name
            )}`}
            className="vd-category"
          >
            <div
              className={`vd-category-icon vd-category-${category.color}`}
            >
              <img
                src={category.image}
                alt={category.name}
                loading="lazy"
              />

              <span className="vd-category-overlay" />
            </div>

            <span className="vd-category-label">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   BANNER
   ========================================================= */

function OfferBanner() {
  return (
    <>
      <section className="vd-offer">
        <div className="vd-offer-text">
          <div className="vd-offer-mini">
            SOLO POR HOY
          </div>

          <h2>
            OFERTAS
            <br />
            EXCLUSIVAS
          </h2>

          <p>
            Descuentos increíbles
            <br />
            por tiempo limitado
          </p>

          <Link
            to="/catalogo"
            className="vd-offer-button"
          >
            Ver ofertas
            <span>›</span>
          </Link>
        </div>

        <div className="vd-offer-art">
          <div className="vd-sale-circle vd-sale-one" />
          <div className="vd-sale-circle vd-sale-two" />
          <div className="vd-sale-circle vd-sale-three" />

          <div className="vd-offer-watch">
            <img
              src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=450&q=90"
              alt="Smartwatch"
            />
          </div>

          <div className="vd-offer-shoe">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=550&q=90"
              alt="Tenis"
            />
          </div>

          <div className="vd-percent-bubble">
            %
          </div>
        </div>
      </section>

      <div className="vd-dots">
        <span className="active" />
        <span />
        <span />
        <span />
      </div>
    </>
  );
}

/* =========================================================
   PRODUCT CARD
   ========================================================= */

function ProductCard({
  product,
  favorites,
  onToggleFavorite,
}) {
  const favorite =
    favorites.includes(
      Number(product.id)
    );

  return (
    <article className="vd-product-card">
      <div className="vd-product-top">
        <span
          className={`vd-product-badge ${
            product.badgeType === "new"
              ? "vd-new"
              : ""
          }`}
        >
          {product.discount}
        </span>

        <button
          type="button"
          className={`vd-favorite ${
            favorite
              ? "vd-favorite-active"
              : ""
          }`}
          onClick={() =>
            onToggleFavorite(
              Number(product.id)
            )
          }
          aria-label={
            favorite
              ? "Quitar de favoritos"
              : "Agregar a favoritos"
          }
        >
          <Icon
            name="heart"
            size={18}
            stroke={1.65}
          />
        </button>
      </div>

      <Link
        to={`/producto/${product.id}`}
        className="vd-product-image"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
      </Link>

      <div className="vd-product-info">
        <h3>{product.name}</h3>

        <div className="vd-price">
          <strong>
            {formatPrice(
              product.price
            )}
          </strong>

          {product.oldPrice && (
            <del>
              {formatPrice(
                product.oldPrice
              )}
            </del>
          )}
        </div>

        <div className="vd-rating">
          <span>★</span>
          {product.rating}
          <b>•</b>
          {product.sales}
        </div>

        <button
          type="button"
          className="vd-add-button"
          onClick={() =>
            addProductToCart(product)
          }
        >
          Agregar
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   NUEVO: CARRUSEL DE PRODUCTOS
   ========================================================= */

function ProductCarousel({
  title,
  subtitle,
  items,
  favorites,
  onToggleFavorite,
  icon,
}) {
  return (
    <section className="vd-carousel-section">
      <div className="vd-section-title vd-carousel-title">
        <div>
          <h2>
            {icon && (
              <span className="vd-title-icon">
                <Icon
                  name={icon}
                  size={17}
                  stroke={1.8}
                />
              </span>
            )}

            {title}
          </h2>

          {subtitle && (
            <p>{subtitle}</p>
          )}
        </div>

        <Link to="/catalogo">
          Ver todos
          <span>›</span>
        </Link>
      </div>

      <div className="vd-horizontal-products">
        {items.map((product) => (
          <div
            className="vd-carousel-item"
            key={`${title}-${product.id}`}
          >
            <ProductCard
              product={product}
              favorites={favorites}
              onToggleFavorite={
                onToggleFavorite
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   SECCIÓN DE CATEGORÍAS DESTACADAS
   ========================================================= */

function FeaturedCategoryStrip() {
  const featured = [
    {
      name: "Moda",
      text: "Nuevos estilos",
      image:
        "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=90",
    },
    {
      name: "Tecnología",
      text: "Lo más nuevo",
      image:
        "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=800&q=90",
    },
    {
      name: "Hogar",
      text: "Hazlo especial",
      image:
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=90",
    },
    {
      name: "Belleza",
      text: "Cuida de ti",
      image:
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=90",
    },
  ];

  return (
    <section className="vd-featured-categories">
      <div className="vd-section-title">
        <h2>Descubre más</h2>

        <Link to="/catalogo">
          Explorar
          <span>›</span>
        </Link>
      </div>

      <div className="vd-featured-row">
        {featured.map((item) => (
          <Link
            key={item.name}
            to="/catalogo"
            className="vd-featured-card"
          >
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
            />

            <div>
              <small>
                {item.text}
              </small>

              <strong>
                {item.name}
              </strong>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   BENEFICIOS
   ========================================================= */

function Benefits() {
  return (
    <section className="vd-benefits">
      <div className="vd-benefit">
        <span>
          <Icon
            name="shield"
            size={24}
            stroke={1.55}
          />
        </span>

        <strong>
          Compra segura
        </strong>

        <small>
          Protegemos tus
          <br />
          compras
        </small>
      </div>

      <div className="vd-benefit">
        <span className="vd-purple-benefit">
          <Icon
            name="truck"
            size={24}
            stroke={1.55}
          />
        </span>

        <strong>
          Envíos rápidos
        </strong>

        <small>
          Recibe tus productos
          <br />
          rápidamente
        </small>
      </div>

      <div className="vd-benefit">
        <span>
          <Icon
            name="badge"
            size={24}
            stroke={1.55}
          />
        </span>

        <strong>
          Vendedores
        </strong>

        <small>
          Más confianza
          <br />
          para ti
        </small>
      </div>

      <div className="vd-benefit">
        <span className="vd-purple-benefit">
          <Icon
            name="chat"
            size={24}
            stroke={1.55}
          />
        </span>

        <strong>
          Soporte 24/7
        </strong>

        <small>
          Estamos aquí
          <br />
          para ayudarte
        </small>
      </div>
    </section>
  );
}

/* =========================================================
   INICIO
   ========================================================= */

function Home({
  onAccount,
  onSell,
  favorites,
  onToggleFavorite,
}) {
  const [search, setSearch] =
    useState("");

  const visibleProducts =
    useMemo(() => {
      if (!search.trim()) {
        return products;
      }

      return products.filter(
        (product) =>
          [
            product.name,
            product.category,
            product.description,
          ]
            .join(" ")
            .toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [search]);

  const discountProducts =
    products.filter(
      (product) =>
        product.oldPrice
    );

  const newProducts =
    products.filter(
      (product) =>
        product.badgeType === "new"
    );

  const techProducts =
    products.filter(
      (product) =>
        product.category ===
        "Tecnología"
    );

  const fashionProducts =
    products.filter(
      (product) =>
        product.category ===
        "Ropa y Moda"
    );

  return (
    <main className="vd-home">
      <section className="vd-search-section">
        <SearchBox
          value={search}
          onChange={setSearch}
        />
      </section>

      <MainPromoCards
        onSell={onSell}
        onAccount={onAccount}
      />

      <CategoriesSection />

      <OfferBanner />

      {search.trim() ? (
        <section className="vd-section vd-products-section">
          <div className="vd-section-title">
            <h2>Resultados</h2>

            <Link to="/catalogo">
              Ver todos
              <span>›</span>
            </Link>
          </div>

          <div className="vd-product-grid">
            {visibleProducts.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  favorites={favorites}
                  onToggleFavorite={
                    onToggleFavorite
                  }
                />
              )
            )}
          </div>

          {visibleProducts.length ===
            0 && (
            <div className="vd-no-results">
              <span>🔎</span>

              <strong>
                No encontramos productos
              </strong>

              <small>
                Prueba con otra búsqueda.
              </small>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* =================================================
              NUEVAS SECCIONES DESLIZABLES
              ================================================= */}

          <ProductCarousel
            title="Ofertas del día"
            subtitle="Aprovecha precios especiales"
            items={discountProducts}
            favorites={favorites}
            onToggleFavorite={
              onToggleFavorite
            }
            icon="fire"
          />

          <ProductCarousel
            title="Lo más vendido"
            subtitle="Lo que otros compradores están eligiendo"
            items={[
              products[0],
              products[1],
              products[4],
              products[2],
            ]}
            favorites={favorites}
            onToggleFavorite={
              onToggleFavorite
            }
            icon="spark"
          />

          <FeaturedCategoryStrip />

          <ProductCarousel
            title="Novedades"
            subtitle="Productos que acaban de llegar"
            items={newProducts}
            favorites={favorites}
            onToggleFavorite={
              onToggleFavorite
            }
            icon="spark"
          />

          <ProductCarousel
            title="Tecnología para ti"
            subtitle="Descubre tus próximos gadgets"
            items={techProducts}
            favorites={favorites}
            onToggleFavorite={
              onToggleFavorite
            }
            icon="spark"
          />

          <ProductCarousel
            title="Moda y estilo"
            subtitle="Encuentra tu próximo look"
            items={fashionProducts}
            favorites={favorites}
            onToggleFavorite={
              onToggleFavorite
            }
            icon="spark"
          />

          <ProductCarousel
            title="Recomendados para ti"
            subtitle="Una selección de VaniDaxi"
            items={[
              products[3],
              products[6],
              products[7],
              products[5],
            ]}
            favorites={favorites}
            onToggleFavorite={
              onToggleFavorite
            }
            icon="spark"
          />

          <section className="vd-final-promo">
            <div>
              <span>
                ✨ VaniDaxi
              </span>

              <h2>
                Todo en
                <br />
                un solo lugar
              </h2>

              <p>
                Compra, descubre y encuentra
                algo que te encante.
              </p>

              <Link
                to="/catalogo"
                className="vd-final-button"
              >
                Explorar productos
              </Link>
            </div>

            <div className="vd-final-art">
              <div>🛍️</div>
              <div>✨</div>
              <div>💜</div>
            </div>
          </section>
        </>
      )}

      <Benefits />

      <div className="vd-bottom-space" />
    </main>
  );
}

/* =========================================================
   CATÁLOGO
   ========================================================= */

function Catalog({
  favorites,
  onToggleFavorite,
}) {
  const [search, setSearch] =
    useState("");

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("Todos");

  const location =
    useLocation();

  useEffect(() => {
    const params =
      new URLSearchParams(
        location.search
      );

    const category =
      params.get("categoria");

    if (category) {
      setActiveCategory(category);
    }
  }, [location.search]);

  const filtered =
    useMemo(() => {
      return products.filter(
        (product) => {
          const matchesCategory =
            activeCategory ===
              "Todos" ||
            product.category ===
              activeCategory;

          const matchesSearch =
            !search.trim() ||
            [
              product.name,
              product.category,
              product.description,
            ]
              .join(" ")
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      search,
      activeCategory,
    ]);

  return (
    <main className="vd-page">
      <div className="vd-page-title">
        <p>EXPLORA</p>

        <h1>
          Todos los productos
        </h1>
      </div>

      <div className="vd-catalog-search">
        <Icon
          name="search"
          size={20}
        />

        <input
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
          placeholder="Buscar productos..."
        />
      </div>

      <div className="vd-filters">
        {[
          "Todos",
          ...categories.map(
            (category) =>
              category.name
          ),
        ].map((category) => (
          <button
            key={category}
            type="button"
            className={
              activeCategory ===
              category
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveCategory(
                category
              )
            }
          >
            {category}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="vd-no-results vd-no-results-large">
          <span>🔎</span>

          <strong>
            No hay productos en esta
            categoría
          </strong>

          <small>
            Prueba otra categoría o
            búsqueda.
          </small>
        </div>
      ) : (
        <div className="vd-product-grid vd-catalog-grid">
          {filtered.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorites={favorites}
                onToggleFavorite={
                  onToggleFavorite
                }
              />
            )
          )}
        </div>
      )}
    </main>
  );
}

/* =========================================================
   PRODUCTO
   ========================================================= */

function ProductPage({
  onToggleFavorite,
  favorites,
}) {
  const { id } = useParams();

  const product =
    products.find(
      (item) =>
        Number(item.id) ===
        Number(id)
    ) || products[0];

  const favorite =
    favorites.includes(
      Number(product.id)
    );

  return (
    <main className="vd-page">
      <div className="vd-detail-back">
        <Link to="/catalogo">
          <span>‹</span>
          Volver
        </Link>
      </div>

      <div className="vd-product-detail">
        <div className="vd-detail-image">
          <img
            src={product.image}
            alt={product.name}
          />

          <span
            className={`vd-detail-badge ${
              product.badgeType ===
              "new"
                ? "vd-new"
                : ""
            }`}
          >
            {product.discount}
          </span>
        </div>

        <div className="vd-detail-info">
          <small>
            {product.category}
          </small>

          <h1>{product.name}</h1>

          <div className="vd-detail-rating">
            ★ {product.rating}
            <span>•</span>
            {product.sales}
          </div>

          <div className="vd-detail-price">
            <strong>
              {formatPrice(
                product.price
              )}
            </strong>

            {product.oldPrice && (
              <del>
                {formatPrice(
                  product.oldPrice
                )}
              </del>
            )}
          </div>

          <p>
            {product.description}
          </p>

          <div className="vd-detail-actions">
            <button
              type="button"
              className="vd-gradient-button"
              onClick={() =>
                addProductToCart(
                  product
                )
              }
            >
              Agregar al carrito
            </button>

            <button
              type="button"
              className={`vd-detail-favorite ${
                favorite
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onToggleFavorite(
                  Number(product.id)
                )
              }
            >
              <Icon
                name="heart"
                size={22}
              />
            </button>
          </div>

          <div className="vd-specifications">
            <h2>
              Características
            </h2>

            {product.specifications.map(
              (specification) => (
                <div
                  key={specification}
                  className="vd-spec-row"
                >
                  <span>✓</span>
                  {specification}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

/* =========================================================
   CARRITO
   ========================================================= */

function Cart() {
  const navigate =
    useNavigate();

  const [items, setItems] =
    useState(getCart);

  useEffect(() => {
    const update = () =>
      setItems(getCart());

    window.addEventListener(
      "vanidaxi-cart-change",
      update
    );

    return () =>
      window.removeEventListener(
        "vanidaxi-cart-change",
        update
      );
  }, []);

  const total =
    items.reduce(
      (sum, item) =>
        sum +
        Number(item.price) *
          Number(
            item.quantity || 1
          ),
      0
    );

  return (
    <main className="vd-page">
      <div className="vd-page-title">
        <p>MI COMPRA</p>
        <h1>Tu carrito</h1>
      </div>

      {items.length === 0 ? (
        <div className="vd-empty">
          <div className="vd-empty-icon">
            <Icon
              name="cart"
              size={44}
            />
          </div>

          <h2>
            Tu carrito está vacío
          </h2>

          <p>
            Agrega productos y
            aparecerán aquí.
          </p>

          <Link
            to="/catalogo"
            className="vd-gradient-button"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <>
          <div className="vd-cart-list">
            {items.map((item) => (
              <div
                key={item.id}
                className="vd-cart-item"
              >
                <Link
                  to={`/producto/${item.id}`}
                  className="vd-cart-image"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                  />
                </Link>

                <div className="vd-cart-content">
                  <strong>
                    {item.name}
                  </strong>

                  <span className="vd-cart-price">
                    {formatPrice(
                      item.price
                    )}
                  </span>

                  <div className="vd-cart-actions">
                    <div className="vd-quantity">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(
                            item.id,
                            Math.max(
                              1,
                              Number(
                                item.quantity ||
                                  1
                              ) - 1
                            )
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {item.quantity ||
                          1}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(
                            item.id,
                            Number(
                              item.quantity ||
                                1
                            ) + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="vd-remove"
                      onClick={() =>
                        removeProductFromCart(
                          item.id
                        )
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="vd-cart-total">
            <span>Total</span>

            <strong>
              {formatPrice(total)}
            </strong>
          </div>

          <button
            type="button"
            className="vd-checkout-button"
            onClick={() =>
              alert(
                "El siguiente paso será conectar el pago seguro."
              )
            }
          >
            Continuar con la compra
          </button>

          <button
            type="button"
            className="vd-continue-shopping"
            onClick={() =>
              navigate("/catalogo")
            }
          >
            Seguir comprando
          </button>
        </>
      )}
    </main>
  );
}

/* =========================================================
   CUENTA
   ========================================================= */

function AccountPage({
  user,
  onOpenAuth,
  onSignOut,
}) {
  return (
    <main className="vd-page">
      <div className="vd-account-page">
        <div className="vd-account-icon">
          <Icon
            name="user"
            size={42}
          />
        </div>

        <p>MI CUENTA</p>

        <h1>
          Compra y vende en VaniDaxi
        </h1>

        {user ? (
          <>
            <span>
              Sesión iniciada como
              <br />
              <strong>
                {user.email}
              </strong>
            </span>

            <button
              type="button"
              className="vd-gradient-button"
              onClick={onSignOut}
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <span>
              Inicia sesión o regístrate
              para continuar.
            </span>

            <button
              type="button"
              className="vd-gradient-button"
              onClick={onOpenAuth}
            >
              Iniciar sesión
            </button>
          </>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   VENDEDOR
   ========================================================= */

function SellerPage({
  onOpenAuth,
  user,
}) {
  return (
    <main className="vd-page">
      <div className="vd-seller-page">
        <div className="vd-account-icon">
          <Icon
            name="store"
            size={42}
          />
        </div>

        <p>VENDE EN VANIDAXI</p>

        <h1>
          Comienza a vender tus
          productos
        </h1>

        <span>
          Publica tus productos y llega
          a nuevos compradores.
        </span>

        <button
          type="button"
          className="vd-gradient-button"
          onClick={() => {
            if (!user) {
              onOpenAuth();
              return;
            }

            alert(
              "El módulo de publicación de productos está preparado para conectarse."
            );
          }}
        >
          Publicar producto
        </button>
      </div>
    </main>
  );
}

/* =========================================================
   FAVORITOS
   ========================================================= */

function FavoritesPage({
  favorites,
  onToggleFavorite,
}) {
  const favoriteProducts =
    products.filter((product) =>
      favorites.includes(
        Number(product.id)
      )
    );

  return (
    <main className="vd-page">
      <div className="vd-page-title">
        <p>MIS FAVORITOS</p>
        <h1>Favoritos</h1>
      </div>

      {favoriteProducts.length ===
      0 ? (
        <div className="vd-empty">
          <div className="vd-empty-icon">
            <Icon
              name="heart"
              size={44}
            />
          </div>

          <h2>
            Aún no tienes favoritos
          </h2>

          <p>
            Toca el corazón de un
            producto para guardarlo.
          </p>

          <Link
            to="/catalogo"
            className="vd-gradient-button"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <div className="vd-product-grid vd-catalog-grid">
          {favoriteProducts.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
                favorites={favorites}
                onToggleFavorite={
                  onToggleFavorite
                }
              />
            )
          )}
        </div>
      )}
    </main>
  );
}

/* =========================================================
   NAVEGACIÓN INFERIOR
   ========================================================= */

function BottomNavigation({
  onAccount,
  onSell,
}) {
  return (
    <nav className="vd-bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive
            ? "vd-nav-item vd-nav-active"
            : "vd-nav-item"
        }
      >
        <span className="vd-home-symbol">
          ⌂
        </span>
        <small>Inicio</small>
      </NavLink>

      <NavLink
        to="/catalogo"
        className={({ isActive }) =>
          isActive
            ? "vd-nav-item vd-nav-active"
            : "vd-nav-item"
        }
      >
        <Icon
          name="grid"
          size={22}
          stroke={1.55}
        />
        <small>Categorías</small>
      </NavLink>

      <button
        type="button"
        className="vd-sell-nav"
        onClick={onSell}
      >
        <span>
          <Icon
            name="store"
            size={24}
            stroke={1.7}
          />
        </span>
        <small>Vender</small>
      </button>

      <NavLink
        to="/favoritos"
        className={({ isActive }) =>
          isActive
            ? "vd-nav-item vd-nav-active"
            : "vd-nav-item"
        }
      >
        <Icon
          name="heart"
          size={22}
          stroke={1.55}
        />
        <small>Favoritos</small>
      </NavLink>

      <button
        type="button"
        className="vd-nav-item"
        onClick={onAccount}
      >
        <Icon
          name="user"
          size={22}
          stroke={1.6}
        />
        <small>Cuenta</small>
      </button>
    </nav>
  );
}

/* =========================================================
   MENÚ
   ========================================================= */

function MenuOverlay({
  onClose,
  onAccount,
  onSell,
  user,
  onSignOut,
}) {
  const location =
    useLocation();

  return (
    <div
      className="vd-overlay"
      onClick={onClose}
    >
      <aside
        className="vd-side-menu"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="vd-menu-head">
          <div>
            <Link
              to="/"
              className="vd-menu-brand"
              onClick={onClose}
            >
              <span>Vani</span>
              <strong>Daxi</strong>
            </Link>

            <small>
              Todo en un solo lugar
            </small>
          </div>

          <button
            type="button"
            className="vd-menu-close"
            onClick={onClose}
          >
            <Icon
              name="close"
              size={22}
            />
          </button>
        </div>

        <Link
          to="/"
          className={
            location.pathname === "/"
              ? "vd-menu-link vd-menu-link-active"
              : "vd-menu-link"
          }
          onClick={onClose}
        >
          <span>⌂</span>
          Inicio
        </Link>

        <Link
          to="/catalogo"
          className="vd-menu-link"
          onClick={onClose}
        >
          <Icon
            name="grid"
            size={19}
          />
          Categorías
        </Link>

        <Link
          to="/carrito"
          className="vd-menu-link"
          onClick={onClose}
        >
          <Icon
            name="cart"
            size={19}
          />
          Carrito
        </Link>

        <Link
          to="/favoritos"
          className="vd-menu-link"
          onClick={onClose}
        >
          <Icon
            name="heart"
            size={19}
          />
          Favoritos
        </Link>

        <button
          type="button"
          className="vd-menu-link"
          onClick={() => {
            onClose();
            onAccount();
          }}
        >
          <Icon
            name="user"
            size={19}
          />
          Mi cuenta
        </button>

        <button
          type="button"
          className="vd-menu-link"
          onClick={() => {
            onClose();
            onSell();
          }}
        >
          <Icon
            name="store"
            size={19}
          />
          Vender
        </button>

        {user && (
          <button
            type="button"
            className="vd-menu-link vd-menu-signout"
            onClick={onSignOut}
          >
            Cerrar sesión
          </button>
        )}
      </aside>
    </div>
  );
}

/* =========================================================
   AUTENTICACIÓN
   ========================================================= */

function AuthModal({
  onClose,
}) {
  const [mode, setMode] =
    useState("login");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (!email || !password) {
        setMessage(
          "Completa tu correo y contraseña."
        );
        return;
      }

      if (mode === "login") {
        const { error } =
          await supabase.auth.signInWithPassword(
            {
              email: email.trim(),
              password,
            }
          );

        if (error) {
          setMessage(
            error.message ||
              "No fue posible iniciar sesión."
          );
          return;
        }

        onClose();
      } else {
        const { error } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
          });

        if (error) {
          setMessage(
            error.message ||
              "No fue posible crear la cuenta."
          );
          return;
        }

        setMessage(
          "Cuenta creada. Revisa tu correo si Supabase solicita confirmación."
        );
      }
    } catch (error) {
      setMessage(
        error?.message ||
          "Ocurrió un error inesperado."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="vd-overlay vd-centered"
      onClick={onClose}
    >
      <div
        className="vd-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className="vd-modal-close"
          onClick={onClose}
        >
          <Icon
            name="close"
            size={20}
          />
        </button>

        <div className="vd-modal-icon">
          <Icon
            name="user"
            size={34}
          />
        </div>

        <h2>
          {mode === "login"
            ? "Mi cuenta"
            : "Crear cuenta"}
        </h2>

        <p>
          {mode === "login"
            ? "Inicia sesión para comprar y vender en VaniDaxi."
            : "Crea tu cuenta para comenzar a usar VaniDaxi."}
        </p>

        <form
          onSubmit={handleSubmit}
          className="vd-auth-form"
        >
          <label>
            Correo electrónico

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
          </label>

          <label>
            Contraseña

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="Tu contraseña"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
            />
          </label>

          {message && (
            <div className="vd-auth-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="vd-gradient-button vd-full-button"
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
          type="button"
          className="vd-light-button"
          onClick={() => {
            setMode(
              mode === "login"
                ? "register"
                : "login"
            );
            setMessage("");
          }}
        >
          {mode === "login"
            ? "Crear cuenta"
            : "Ya tengo una cuenta"}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   APP
   ========================================================= */

function App() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [sellOpen, setSellOpen] =
    useState(false);

  const [
    headerHidden,
    setHeaderHidden,
  ] = useState(false);

  const [user, setUser] =
    useState(null);

  const [cartCount, setCartCount] =
    useState(() =>
      getCart().reduce(
        (sum, item) =>
          sum +
          Number(
            item.quantity || 1
          ),
        0
      )
    );

  const [favorites, setFavorites] =
    useState(getFavorites);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;

        setUser(
          data?.session?.user ||
            null
        );
      })
      .catch(() => {});

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(
            session?.user || null
          );
        }
      );

    return () => {
      mounted = false;

      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const updateCart = () => {
      const count =
        getCart().reduce(
          (sum, item) =>
            sum +
            Number(
              item.quantity || 1
            ),
          0
        );

      setCartCount(count);
    };

    const updateFavorites = () => {
      setFavorites(
        getFavorites()
      );
    };

    window.addEventListener(
      "vanidaxi-cart-change",
      updateCart
    );

    window.addEventListener(
      "vanidaxi-favorites-change",
      updateFavorites
    );

    updateCart();
    updateFavorites();

    return () => {
      window.removeEventListener(
        "vanidaxi-cart-change",
        updateCart
      );

      window.removeEventListener(
        "vanidaxi-favorites-change",
        updateFavorites
      );
    };
  }, []);

  useEffect(() => {
    let lastScroll =
      window.scrollY || 0;

    const handleScroll = () => {
      const current =
        window.scrollY || 0;

      if (current < 16) {
        setHeaderHidden(false);
      } else if (
        current >
        lastScroll + 5
      ) {
        setHeaderHidden(true);
      } else if (
        current <
        lastScroll - 5
      ) {
        setHeaderHidden(false);
      }

      lastScroll = current;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      menuOpen ||
      accountOpen ||
      sellOpen
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [
    menuOpen,
    accountOpen,
    sellOpen,
  ]);

  function toggleFavorite(
    productId
  ) {
    const current =
      getFavorites();

    const next =
      current.includes(
        Number(productId)
      )
        ? current.filter(
            (id) =>
              Number(id) !==
              Number(productId)
          )
        : [
            ...current,
            Number(productId),
          ];

    saveFavorites(next);
    setFavorites(next);
  }

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
    } finally {
      setMenuOpen(false);
      setAccountOpen(false);
    }
  }

  return (
    <div className="vd-app">
      <Header
        cartCount={cartCount}
        onOpenMenu={() =>
          setMenuOpen(true)
        }
        hidden={headerHidden}
        onAccount={() =>
          setAccountOpen(true)
        }
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              onAccount={() =>
                setAccountOpen(true)
              }
              onSell={() =>
                setSellOpen(true)
              }
              favorites={favorites}
              onToggleFavorite={
                toggleFavorite
              }
            />
          }
        />

        <Route
          path="/catalogo"
          element={
            <Catalog
              favorites={favorites}
              onToggleFavorite={
                toggleFavorite
              }
            />
          }
        />

        <Route
          path="/producto/:id"
          element={
            <ProductPage
              favorites={favorites}
              onToggleFavorite={
                toggleFavorite
              }
            />
          }
        />

        <Route
          path="/carrito"
          element={<Cart />}
        />

        <Route
          path="/cuenta"
          element={
            <AccountPage
              user={user}
              onOpenAuth={() =>
                setAccountOpen(true)
              }
              onSignOut={
                handleSignOut
              }
            />
          }
        />

        <Route
          path="/vender"
          element={
            <SellerPage
              user={user}
              onOpenAuth={() =>
                setAccountOpen(true)
              }
            />
          }
        />

        <Route
          path="/favoritos"
          element={
            <FavoritesPage
              favorites={favorites}
              onToggleFavorite={
                toggleFavorite
              }
            />
          }
        />

        <Route
          path="*"
          element={
            <Home
              onAccount={() =>
                setAccountOpen(true)
              }
              onSell={() =>
                setSellOpen(true)
              }
              favorites={favorites}
              onToggleFavorite={
                toggleFavorite
              }
            />
          }
        />
      </Routes>

      <button
        type="button"
        className="vd-chat"
        onClick={() =>
          alert("Soporte VaniDaxi")
        }
        aria-label="Soporte VaniDaxi"
      >
        <Icon
          name="chat"
          size={25}
          stroke={1.75}
        />
      </button>

      <BottomNavigation
        onAccount={() =>
          setAccountOpen(true)
        }
        onSell={() =>
          setSellOpen(true)
        }
      />

      {menuOpen && (
        <MenuOverlay
          onClose={() =>
            setMenuOpen(false)
          }
          onAccount={() =>
            setAccountOpen(true)
          }
          onSell={() =>
            setSellOpen(true)
          }
          user={user}
          onSignOut={
            handleSignOut
          }
        />
      )}

      {accountOpen && (
        <AuthModal
          onClose={() =>
            setAccountOpen(false)
          }
        />
      )}

      {sellOpen && (
        <div
          className="vd-overlay vd-centered"
          onClick={() =>
            setSellOpen(false)
          }
        >
          <div
            className="vd-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="vd-modal-close"
              onClick={() =>
                setSellOpen(false)
              }
            >
              <Icon
                name="close"
                size={20}
              />
            </button>

            <div className="vd-modal-icon">
              <Icon
                name="store"
                size={34}
              />
            </div>

            <h2>
              Vende en VaniDaxi
            </h2>

            <p>
              Publica tus productos,
              llega a nuevos compradores
              y comienza a vender.
            </p>

            <button
              type="button"
              className="vd-gradient-button vd-full-button"
              onClick={() => {
                setSellOpen(false);

                if (!user) {
                  setAccountOpen(true);
                  return;
                }

                alert(
                  "El módulo de publicación está preparado para el siguiente paso."
                );
              }}
            >
              Publicar producto
            </button>
          </div>
        </div>
      )}

      <style>{`
        * {
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          background: #ffffff;
        }

        body {
          min-width: 320px;
          color: #27262d;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
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
          position: relative;
          width: 100%;
          max-width: 560px;
          min-height: 100vh;
          margin: 0 auto;
          padding-bottom: 74px;
          overflow-x: hidden;
          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #ffffff 84%,
              #faf8fc 100%
            );
        }

        /* HEADER */

        .vd-header {
          position: sticky;
          top: 0;
          z-index: 70;
          display: grid;
          grid-template-columns: 44px 1fr 84px;
          align-items: center;
          width: 100%;
          height: 64px;
          padding: 7px 13px;
          background: rgba(255,255,255,.97);
          border-bottom: 1px solid #efedf0;
          backdrop-filter: blur(15px);
          transition:
            transform .25s ease,
            opacity .25s ease;
        }

        .vd-header-hidden {
          transform: translateY(-110%);
        }

        .vd-menu-button,
        .vd-header-icon {
          border: 0;
          background: transparent;
          color: #2b2930;
        }

        .vd-menu-button {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vd-brand {
          justify-self: center;
          font-size: 25px;
          line-height: 1;
          letter-spacing: -1.3px;
          font-weight: 900;
        }

        .vd-brand span {
          color: #7a179e;
        }

        .vd-brand strong {
          color: #ed1451;
        }

        .vd-header-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 2px;
        }

        .vd-header-icon {
          position: relative;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vd-header-icon i {
          position: absolute;
          top: -1px;
          right: -1px;
          min-width: 15px;
          height: 15px;
          padding: 0 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #eb1550;
          color: #fff;
          font-size: 8px;
          font-style: normal;
          font-weight: 900;
        }

        /* HOME */

        .vd-home {
          width: 100%;
          padding: 10px 15px 18px;
        }

        .vd-search-section {
          margin-bottom: 10px;
        }

        .vd-search-box {
          width: 100%;
          height: 39px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding-left: 11px;
          border: 1px solid #ece8ee;
          border-radius: 11px;
          background: #fff;
          color: #77737d;
          box-shadow: 0 4px 13px rgba(48,29,67,.04);
        }

        .vd-search-box input {
          flex: 1;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          color: #39373e;
          background: transparent;
          font-size: 10px;
        }

        .vd-search-box input::placeholder {
          color: #88838d;
        }

        .vd-search-box button {
          width: 39px;
          height: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 0 11px 11px 0;
          background:
            linear-gradient(
              135deg,
              #ee1451,
              #7a179e
            );
          color: #fff;
        }

        /* TARJETAS */

        .vd-main-cards {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 8px;
          margin-bottom: 17px;
        }

        .vd-main-card {
          position: relative;
          width: 100%;
          height: 69px;
          display: grid;
          grid-template-columns: 37px 1fr;
          align-items: center;
          gap: 7px;
          padding: 8px 9px;
          overflow: hidden;
          border: 0;
          border-radius: 9px;
          text-align: left;
          color: #fff;
          box-shadow: 0 5px 12px rgba(83,16,99,.10);
        }

        .vd-sell-card {
          background:
            linear-gradient(
              135deg,
              #f31750,
              #e71671
            );
        }

        .vd-account-card {
          background:
            linear-gradient(
              135deg,
              #b91c97,
              #6b1aa7
            );
        }

        .vd-main-icon {
          width: 37px;
          height: 37px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: rgba(255,255,255,.97);
          color: #df174f;
        }

        .vd-account-icon-main {
          color: #721b9f;
        }

        .vd-main-copy {
          min-width: 0;
          padding-right: 17px;
        }

        .vd-main-copy strong {
          display: block;
          font-size: 10px;
          line-height: 1.03;
          font-weight: 900;
        }

        .vd-main-copy small {
          display: block;
          margin-top: 3px;
          color: rgba(255,255,255,.91);
          font-size: 7px;
          line-height: 1.18;
        }

        .vd-card-arrow {
          position: absolute;
          right: 7px;
          bottom: 7px;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,.96);
          color: #742091;
        }

        /* SECCIONES */

        .vd-section {
          margin-bottom: 17px;
        }

        .vd-section-title {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 9px;
        }

        .vd-section-title h2 {
          margin: 0;
          color: #332d37;
          font-size: 14px;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: -.3px;
        }

        .vd-section-title a {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 3px;
          color: #7a179e;
          font-size: 8px;
          font-weight: 800;
        }

        .vd-section-title a span {
          font-size: 16px;
          line-height: 8px;
        }

        /* CATEGORÍAS */

        .vd-category-row {
          display: flex;
          gap: 9px;
          overflow-x: auto;
          padding: 1px 2px 7px;
          scrollbar-width: none;
          overscroll-behavior-x: contain;
        }

        .vd-category-row::-webkit-scrollbar,
        .vd-horizontal-products::-webkit-scrollbar,
        .vd-featured-row::-webkit-scrollbar {
          display: none;
        }

        .vd-category {
          flex: 0 0 66px;
          text-align: center;
        }

        .vd-category-icon {
          position: relative;
          width: 58px;
          height: 58px;
          margin: 0 auto 5px;
          overflow: hidden;
          border-radius: 18px;
          padding: 3px;
          background:
            linear-gradient(
              135deg,
              #f31a55,
              #a118a0,
              #65189b
            );
          box-shadow: 0 5px 12px rgba(89,23,119,.13);
        }

        .vd-category-icon img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          border-radius: 15px;
        }

        .vd-category-overlay {
          position: absolute;
          inset: 3px;
          border-radius: 15px;
          background:
            linear-gradient(
              180deg,
              rgba(255,255,255,.05),
              rgba(99,17,139,.22)
            );
          pointer-events: none;
        }

        .vd-category-pink {
          background:
            linear-gradient(
              135deg,
              #ff315d,
              #bd1a96
            );
        }

        .vd-category-purple {
          background:
            linear-gradient(
              135deg,
              #c01fa5,
              #671aa2
            );
        }

        .vd-category-rose {
          background:
            linear-gradient(
              135deg,
              #f54a72,
              #8d1a9d
            );
        }

        .vd-category-magenta {
          background:
            linear-gradient(
              135deg,
              #f12283,
              #7a179e
            );
        }

        .vd-category-violet {
          background:
            linear-gradient(
              135deg,
              #a721d0,
              #5b189a
            );
        }

        .vd-category-fuchsia {
          background:
            linear-gradient(
              135deg,
              #f11a9c,
              #79189e
            );
        }

        .vd-category-label {
          display: block;
          color: #4d4851;
          font-size: 7px;
          line-height: 1.2;
          font-weight: 800;
        }

        /* OFERTA */

        .vd-offer {
          position: relative;
          min-height: 145px;
          margin: 4px 0 5px;
          overflow: hidden;
          border-radius: 15px;
          background:
            linear-gradient(
              115deg,
              #ee1651,
              #bd1a91 55%,
              #711a9e
            );
          color: #fff;
          box-shadow: 0 8px 18px rgba(113,20,115,.15);
        }

        .vd-offer-text {
          position: relative;
          z-index: 3;
          padding: 17px 0 16px 18px;
        }

        .vd-offer-mini {
          margin-bottom: 4px;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.1px;
          opacity: .88;
        }

        .vd-offer h2 {
          margin: 0;
          font-size: 20px;
          line-height: .95;
          letter-spacing: -.8px;
          font-weight: 950;
        }

        .vd-offer p {
          margin: 7px 0 10px;
          font-size: 8px;
          line-height: 1.25;
          color: rgba(255,255,255,.88);
        }

        .vd-offer-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          border-radius: 999px;
          background: #fff;
          color: #8a1b99;
          font-size: 8px;
          font-weight: 900;
        }

        .vd-offer-button span {
          font-size: 15px;
          line-height: 8px;
        }

        .vd-offer-art {
          position: absolute;
          right: -4px;
          top: 0;
          width: 53%;
          height: 100%;
        }

        .vd-sale-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,.10);
        }

        .vd-sale-one {
          width: 110px;
          height: 110px;
          right: -18px;
          top: -20px;
        }

        .vd-sale-two {
          width: 72px;
          height: 72px;
          right: 65px;
          bottom: -26px;
        }

        .vd-sale-three {
          width: 42px;
          height: 42px;
          right: 105px;
          top: 18px;
          background: rgba(255,255,255,.15);
        }

        .vd-offer-watch {
          position: absolute;
          width: 83px;
          height: 83px;
          right: 35px;
          top: 15px;
          transform: rotate(9deg);
          filter: drop-shadow(0 9px 8px rgba(45,0,54,.24));
        }

        .vd-offer-watch img,
        .vd-offer-shoe img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 18px;
        }

        .vd-offer-shoe {
          position: absolute;
          width: 104px;
          height: 74px;
          right: -2px;
          bottom: 6px;
          transform: rotate(-8deg);
          filter: drop-shadow(0 9px 8px rgba(45,0,54,.24));
        }

        .vd-percent-bubble {
          position: absolute;
          right: 96px;
          bottom: 17px;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #fff;
          color: #e61556;
          font-size: 16px;
          font-weight: 950;
          box-shadow: 0 5px 12px rgba(47,0,54,.2);
        }

        .vd-dots {
          display: flex;
          justify-content: center;
          gap: 4px;
          margin: 7px 0 16px;
        }

        .vd-dots span {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #ddd5e2;
        }

        .vd-dots span.active {
          width: 16px;
          border-radius: 999px;
          background:
            linear-gradient(
              90deg,
              #ed1550,
              #7b179e
            );
        }

        /* =================================================
           NUEVOS CARRUSELES
           ================================================= */

        .vd-carousel-section {
          margin: 0 -15px 19px;
          padding: 0 15px;
        }

        .vd-carousel-title {
          align-items: center;
          margin-bottom: 8px;
        }

        .vd-carousel-title > div:first-child {
          min-width: 0;
        }

        .vd-carousel-title h2 {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .vd-carousel-title p {
          margin: 3px 0 0;
          color: #89838d;
          font-size: 7px;
          line-height: 1.2;
        }

        .vd-title-icon {
          width: 23px;
          height: 23px;
          flex: 0 0 23px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          background:
            linear-gradient(
              135deg,
              #f31a55,
              #7b179e
            );
          color: #fff;
        }

        .vd-horizontal-products {
          display: flex;
          gap: 9px;
          overflow-x: auto;
          padding: 1px 2px 8px;
          scrollbar-width: none;
          scroll-snap-type: x proximity;
          overscroll-behavior-x: contain;
        }

        .vd-carousel-item {
          flex: 0 0 145px;
          scroll-snap-align: start;
        }

        .vd-carousel-item .vd-product-card {
          width: 145px;
        }

        .vd-carousel-item .vd-product-image {
          height: 126px;
        }

        .vd-carousel-item .vd-product-info {
          padding: 8px 8px 9px;
        }

        .vd-carousel-item .vd-product-info h3 {
          min-height: 25px;
          font-size: 8px;
        }

        .vd-carousel-item .vd-price strong {
          font-size: 11px;
        }

        .vd-carousel-item .vd-price del {
          font-size: 7px;
        }

        .vd-carousel-item .vd-rating {
          font-size: 6.5px;
        }

        .vd-carousel-item .vd-add-button {
          height: 27px;
          font-size: 7px;
        }

        /* DESCUBRE */

        .vd-featured-categories {
          margin: 0 -15px 19px;
          padding: 0 15px;
        }

        .vd-featured-row {
          display: flex;
          gap: 9px;
          overflow-x: auto;
          padding: 1px 2px 7px;
          scrollbar-width: none;
        }

        .vd-featured-card {
          position: relative;
          flex: 0 0 136px;
          height: 102px;
          overflow: hidden;
          border-radius: 13px;
          box-shadow: 0 6px 14px rgba(50,20,70,.11);
        }

        .vd-featured-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .vd-featured-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              180deg,
              rgba(0,0,0,0) 25%,
              rgba(48,10,56,.76) 100%
            );
        }

        .vd-featured-card div {
          position: absolute;
          z-index: 2;
          left: 9px;
          right: 8px;
          bottom: 8px;
          color: #fff;
        }

        .vd-featured-card small {
          display: block;
          margin-bottom: 2px;
          font-size: 6px;
          opacity: .88;
        }

        .vd-featured-card strong {
          font-size: 12px;
          font-weight: 900;
        }

        /* PRODUCTOS */

        .vd-product-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 9px;
        }

        .vd-product-card {
          min-width: 0;
          overflow: hidden;
          border: 1px solid #eee9ef;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 5px 14px rgba(51,24,66,.055);
        }

        .vd-product-top {
          position: absolute;
          z-index: 3;
          left: 7px;
          right: 7px;
          top: 7px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          pointer-events: none;
        }

        .vd-product-card {
          position: relative;
        }

        .vd-product-badge {
          padding: 4px 6px;
          border-radius: 999px;
          background: #ed1550;
          color: #fff;
          font-size: 6px;
          font-weight: 900;
        }

        .vd-product-badge.vd-new {
          background: #77199e;
        }

        .vd-favorite {
          width: 27px;
          height: 27px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.93);
          color: #7a737d;
          pointer-events: auto;
          box-shadow: 0 3px 8px rgba(0,0,0,.08);
        }

        .vd-favorite-active {
          color: #e81755;
        }

        .vd-product-image {
          display: block;
          width: 100%;
          height: 164px;
          overflow: hidden;
          background: #f8f6f9;
        }

        .vd-product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform .3s ease;
        }

        .vd-product-card:hover .vd-product-image img {
          transform: scale(1.035);
        }

        .vd-product-info {
          padding: 9px 9px 10px;
        }

        .vd-product-info h3 {
          margin: 0 0 5px;
          min-height: 28px;
          color: #39343c;
          font-size: 9px;
          line-height: 1.25;
          font-weight: 850;
        }

        .vd-price {
          display: flex;
          align-items: baseline;
          gap: 5px;
        }

        .vd-price strong {
          color: #74199d;
          font-size: 13px;
          font-weight: 950;
        }

        .vd-price del {
          color: #a19ba4;
          font-size: 7px;
        }

        .vd-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          margin-top: 3px;
          color: #817b85;
          font-size: 7px;
        }

        .vd-rating span {
          color: #f5a900;
        }

        .vd-rating b {
          color: #c2bbc5;
          font-weight: 500;
        }

        .vd-add-button {
          width: 100%;
          height: 29px;
          margin-top: 8px;
          border: 0;
          border-radius: 8px;
          background:
            linear-gradient(
              135deg,
              #ed1550,
              #77199f
            );
          color: #fff;
          font-size: 7px;
          font-weight: 900;
        }

        /* PROMOCIÓN FINAL */

        .vd-final-promo {
          position: relative;
          min-height: 150px;
          margin: 4px 0 20px;
          padding: 18px;
          overflow: hidden;
          border-radius: 16px;
          color: #fff;
          background:
            linear-gradient(
              135deg,
              #ef1753,
              #8a1a9e
            );
          box-shadow: 0 8px 18px rgba(106,21,120,.14);
        }

        .vd-final-promo span {
          font-size: 7px;
          font-weight: 900;
          letter-spacing: .8px;
        }

        .vd-final-promo h2 {
          margin: 5px 0;
          font-size: 21px;
          line-height: .95;
          letter-spacing: -.7px;
        }

        .vd-final-promo p {
          max-width: 210px;
          margin: 0 0 12px;
          color: rgba(255,255,255,.88);
          font-size: 8px;
          line-height: 1.3;
        }

        .vd-final-button {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff;
          color: #78199d;
          font-size: 7px;
          font-weight: 900;
        }

        .vd-final-art {
          position: absolute;
          right: 9px;
          top: 12px;
          width: 130px;
          height: 125px;
        }

        .vd-final-art div {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,.15);
        }

        .vd-final-art div:nth-child(1) {
          right: 5px;
          top: 8px;
          width: 75px;
          height: 75px;
          font-size: 38px;
        }

        .vd-final-art div:nth-child(2) {
          left: 3px;
          top: 28px;
          width: 42px;
          height: 42px;
          font-size: 20px;
        }

        .vd-final-art div:nth-child(3) {
          right: 32px;
          bottom: 3px;
          width: 43px;
          height: 43px;
          font-size: 20px;
        }

        /* BENEFICIOS */

        .vd-benefits {
          display: grid;
          grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 5px;
          margin: 20px 0 0;
          padding: 13px 4px;
          border-top: 1px solid #eee9ef;
          border-bottom: 1px solid #eee9ef;
        }

        .vd-benefit {
          min-width: 0;
          text-align: center;
        }

        .vd-benefit > span {
          width: 34px;
          height: 34px;
          margin: 0 auto 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #fff0f4;
          color: #e81755;
        }

        .vd-benefit .vd-purple-benefit {
          background: #f3eafe;
          color: #75199d;
        }

        .vd-benefit strong {
          display: block;
          color: #4a444d;
          font-size: 6px;
          font-weight: 900;
        }

        .vd-benefit small {
          display: block;
          margin-top: 3px;
          color: #98919b;
          font-size: 5px;
          line-height: 1.2;
        }

        .vd-bottom-space {
          height: 10px;
        }

        /* PÁGINAS */

        .vd-page {
          width: 100%;
          min-height: calc(100vh - 64px);
          padding: 20px 15px 25px;
        }

        .vd-page-title p {
          margin: 0 0 4px;
          color: #9b179c;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .vd-page-title h1 {
          margin: 0 0 15px;
          color: #302b33;
          font-size: 23px;
          line-height: 1;
          letter-spacing: -.8px;
        }

        .vd-catalog-search {
          height: 42px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 12px;
          margin-bottom: 11px;
          border: 1px solid #ebe6ed;
          border-radius: 11px;
          color: #817b84;
          background: #fff;
        }

        .vd-catalog-search input {
          flex: 1;
          border: 0;
          outline: 0;
          font-size: 11px;
        }

        .vd-filters {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 10px;
          scrollbar-width: none;
        }

        .vd-filters::-webkit-scrollbar {
          display: none;
        }

        .vd-filters button {
          flex-shrink: 0;
          padding: 7px 10px;
          border: 1px solid #ebe5ee;
          border-radius: 999px;
          background: #fff;
          color: #77717b;
          font-size: 7px;
          font-weight: 800;
        }

        .vd-filters button.active {
          border-color: transparent;
          background:
            linear-gradient(
              135deg,
              #ed1550,
              #75199d
            );
          color: #fff;
        }

        .vd-catalog-grid {
          margin-top: 5px;
        }

        /* PRODUCTO */

        .vd-detail-back {
          margin-bottom: 12px;
        }

        .vd-detail-back a {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: #75199d;
          font-size: 10px;
          font-weight: 800;
        }

        .vd-detail-back span {
          font-size: 18px;
        }

        .vd-product-detail {
          display: grid;
          gap: 15px;
        }

        .vd-detail-image {
          position: relative;
          height: 330px;
          overflow: hidden;
          border-radius: 18px;
          background: #f7f5f8;
        }

        .vd-detail-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vd-detail-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 6px 9px;
          border-radius: 999px;
          background: #ed1550;
          color: #fff;
          font-size: 8px;
          font-weight: 900;
        }

        .vd-detail-badge.vd-new {
          background: #75199d;
        }

        .vd-detail-info > small {
          color: #9a169b;
          font-size: 8px;
          font-weight: 900;
        }

        .vd-detail-info h1 {
          margin: 5px 0;
          font-size: 25px;
          line-height: 1;
        }

        .vd-detail-rating {
          color: #77717a;
          font-size: 9px;
        }

        .vd-detail-rating:first-letter {
          color: #f5a900;
        }

        .vd-detail-rating span {
          margin: 0 5px;
          color: #c4bdc7;
        }

        .vd-detail-price {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 12px 0;
        }

        .vd-detail-price strong {
          color: #75199d;
          font-size: 23px;
        }

        .vd-detail-price del {
          color: #99939c;
          font-size: 10px;
        }

        .vd-detail-info > p {
          color: #69636d;
          font-size: 11px;
          line-height: 1.5;
        }

        .vd-detail-actions {
          display: grid;
          grid-template-columns: 1fr 48px;
          gap: 8px;
          margin: 16px 0;
        }

        .vd-gradient-button {
          min-height: 43px;
          padding: 0 18px;
          border: 0;
          border-radius: 11px;
          background:
            linear-gradient(
              135deg,
              #ed1550,
              #75199d
            );
          color: #fff;
          font-size: 9px;
          font-weight: 900;
          box-shadow: 0 5px 13px rgba(113,20,130,.15);
        }

        .vd-detail-favorite {
          border: 1px solid #ece7ee;
          border-radius: 11px;
          background: #fff;
          color: #77717b;
        }

        .vd-detail-favorite.active {
          color: #ed1550;
        }

        .vd-specifications {
          padding-top: 13px;
          border-top: 1px solid #eee9ef;
        }

        .vd-specifications h2 {
          margin: 0 0 10px;
          font-size: 13px;
        }

        .vd-spec-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 0;
          border-bottom: 1px solid #f0edf1;
          color: #69636d;
          font-size: 9px;
        }

        .vd-spec-row span {
          color: #ed1550;
          font-weight: 900;
        }

        /* VACÍOS */

        .vd-empty {
          padding: 45px 20px;
          text-align: center;
          border: 1px dashed #ddd5e1;
          border-radius: 18px;
          background: #fcfbfd;
        }

        .vd-empty-icon,
        .vd-account-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 22px;
          background:
            linear-gradient(
              135deg,
              #fbe9ef,
              #f0e5f8
            );
          color: #76199e;
        }

        .vd-empty h2 {
          margin: 0 0 7px;
          font-size: 17px;
        }

        .vd-empty p {
          margin: 0 0 17px;
          color: #817b84;
          font-size: 9px;
        }

        .vd-no-results {
          padding: 30px 10px;
          text-align: center;
        }

        .vd-no-results span {
          display: block;
          margin-bottom: 8px;
          font-size: 28px;
        }

        .vd-no-results strong {
          display: block;
          font-size: 12px;
        }

        .vd-no-results small {
          display: block;
          margin-top: 4px;
          color: #8e8791;
          font-size: 8px;
        }

        /* CUENTA */

        .vd-account-page,
        .vd-seller-page {
          max-width: 430px;
          margin: 30px auto;
          padding: 25px 20px;
          text-align: center;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 8px 25px rgba(51,24,66,.07);
        }

        .vd-account-page > p,
        .vd-seller-page > p {
          margin: 0 0 6px;
          color: #9a169b;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .vd-account-page h1,
        .vd-seller-page h1 {
          margin: 0 0 12px;
          font-size: 21px;
        }

        .vd-account-page > span,
        .vd-seller-page > span {
          display: block;
          margin-bottom: 17px;
          color: #77717b;
          font-size: 9px;
          line-height: 1.5;
        }

        /* CARRITO */

        .vd-cart-list {
          display: grid;
          gap: 9px;
        }

        .vd-cart-item {
          display: grid;
          grid-template-columns: 76px 1fr;
          gap: 10px;
          padding: 8px;
          border: 1px solid #eee9ef;
          border-radius: 12px;
          background: #fff;
        }

        .vd-cart-image {
          width: 76px;
          height: 76px;
          overflow: hidden;
          border-radius: 9px;
          background: #f8f6f9;
        }

        .vd-cart-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vd-cart-content {
          min-width: 0;
        }

        .vd-cart-content > strong {
          display: block;
          margin-bottom: 4px;
          font-size: 10px;
        }

        .vd-cart-price {
          color: #75199d;
          font-size: 11px;
          font-weight: 900;
        }

        .vd-cart-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
        }

        .vd-quantity {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #ece7ee;
          border-radius: 8px;
          padding: 3px;
        }

        .vd-quantity button {
          width: 22px;
          height: 22px;
          border: 0;
          border-radius: 5px;
          background: #f6f1f8;
          color: #75199d;
        }

        .vd-quantity span {
          min-width: 12px;
          text-align: center;
          font-size: 9px;
          font-weight: 800;
        }

        .vd-remove {
          border: 0;
          background: transparent;
          color: #e21751;
          font-size: 7px;
          font-weight: 800;
        }

        .vd-cart-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 16px 0 10px;
          padding: 13px 0;
          border-top: 1px solid #eee9ef;
          border-bottom: 1px solid #eee9ef;
        }

        .vd-cart-total span {
          color: #77717b;
          font-size: 10px;
        }

        .vd-cart-total strong {
          color: #75199d;
          font-size: 17px;
        }

        .vd-checkout-button {
          width: 100%;
          height: 45px;
          border: 0;
          border-radius: 11px;
          background:
            linear-gradient(
              135deg,
              #ed1550,
              #75199d
            );
          color: #fff;
          font-size: 9px;
          font-weight: 900;
        }

        .vd-continue-shopping {
          width: 100%;
          height: 42px;
          margin-top: 8px;
          border: 1px solid #e9e3eb;
          border-radius: 11px;
          background: #fff;
          color: #75199d;
          font-size: 9px;
          font-weight: 900;
        }

        /* MENÚ */

        .vd-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(30,16,35,.38);
          backdrop-filter: blur(3px);
        }

        .vd-centered {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }

        .vd-side-menu {
          width: min(315px,88vw);
          height: 100%;
          padding: 19px 14px;
          background: #fff;
          box-shadow: 10px 0 30px rgba(39,10,48,.18);
          animation: vd-menu-in .22s ease;
        }

        @keyframes vd-menu-in {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .vd-menu-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee9ef;
        }

        .vd-menu-brand {
          display: block;
          font-size: 23px;
          line-height: 1;
          font-weight: 950;
        }

        .vd-menu-brand span {
          color: #75199d;
        }

        .vd-menu-brand strong {
          color: #ed1550;
        }

        .vd-menu-head small {
          display: block;
          margin-top: 5px;
          color: #948d97;
          font-size: 7px;
        }

        .vd-menu-close,
        .vd-modal-close {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 50%;
          background: #f7f3f8;
          color: #4a444d;
        }

        .vd-menu-link {
          width: 100%;
          min-height: 44px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 10px;
          border: 0;
          border-radius: 10px;
          background: transparent;
          color: #514b55;
          font-size: 10px;
          font-weight: 750;
          text-align: left;
        }

        .vd-menu-link-active {
          background:
            linear-gradient(
              135deg,
              #fff0f4,
              #f5eafd
            );
          color: #75199d;
        }

        .vd-menu-signout {
          margin-top: 12px;
          color: #e21751;
        }

        /* MODAL */

        .vd-modal {
          position: relative;
          width: min(390px,100%);
          padding: 25px 20px;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 20px 55px rgba(39,10,48,.2);
          animation: vd-modal-in .2s ease;
        }

        @keyframes vd-modal-in {
          from {
            transform: translateY(12px) scale(.98);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        .vd-modal-close {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .vd-modal-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background:
            linear-gradient(
              135deg,
              #ffe9ef,
              #eee2f8
            );
          color: #75199d;
        }

        .vd-modal h2 {
          margin: 0;
          text-align: center;
          font-size: 20px;
        }

        .vd-modal > p {
          margin: 8px 0 17px;
          color: #807984;
          text-align: center;
          font-size: 9px;
          line-height: 1.45;
        }

        .vd-auth-form {
          display: grid;
          gap: 11px;
        }

        .vd-auth-form label {
          display: grid;
          gap: 5px;
          color: #554e58;
          font-size: 8px;
          font-weight: 800;
        }

        .vd-auth-form input {
          width: 100%;
          height: 41px;
          padding: 0 11px;
          border: 1px solid #e8e3ea;
          border-radius: 9px;
          outline: 0;
          background: #fff;
          font-size: 10px;
        }

        .vd-auth-form input:focus {
          border-color: #9b31b1;
          box-shadow: 0 0 0 3px rgba(155,49,177,.08);
        }

        .vd-auth-message {
          padding: 9px;
          border-radius: 8px;
          background: #faf4fb;
          color: #75199d;
          font-size: 8px;
          line-height: 1.4;
        }

        .vd-full-button {
          width: 100%;
          margin-top: 3px;
        }

        .vd-light-button {
          width: 100%;
          height: 40px;
          margin-top: 9px;
          border: 1px solid #e9e3eb;
          border-radius: 10px;
          background: #fff;
          color: #75199d;
          font-size: 8px;
          font-weight: 900;
        }

        /* BARRA INFERIOR */

        .vd-bottom-nav {
          position: fixed;
          left: 50%;
          bottom: 0;
          z-index: 80;
          width: min(560px,100%);
          height: 66px;
          transform: translateX(-50%);
          display: grid;
          grid-template-columns: repeat(5,1fr);
          align-items: end;
          padding: 5px 8px 7px;
          border-top: 1px solid #ece7ee;
          background: rgba(255,255,255,.98);
          box-shadow: 0 -5px 18px rgba(45,17,58,.07);
          backdrop-filter: blur(15px);
        }

        .vd-nav-item,
        .vd-sell-nav {
          min-width: 0;
          height: 51px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          border: 0;
          background: transparent;
          color: #8d8790;
          font-size: 7px;
        }

        .vd-nav-item small,
        .vd-sell-nav small {
          font-size: 7px;
          font-weight: 800;
        }

        .vd-nav-active {
          color: #75199d;
        }

        .vd-home-symbol {
          font-size: 24px;
          line-height: 20px;
        }

        .vd-sell-nav > span {
          width: 43px;
          height: 43px;
          margin-top: -16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid #fff;
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              #ed1550,
              #75199d
            );
          color: #fff;
          box-shadow: 0 5px 14px rgba(105,18,126,.24);
        }

        .vd-sell-nav small {
          margin-top: 2px;
          color: #75199d;
        }

        /* SOPORTE */

        .vd-chat {
          position: fixed;
          right: max(17px, calc((100vw - 560px) / 2 + 14px));
          bottom: 76px;
          z-index: 75;
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              #ed1550,
              #75199d
            );
          color: #fff;
          box-shadow: 0 7px 17px rgba(93,16,113,.25);
        }

        @media (min-width: 561px) {
          .vd-app {
            box-shadow:
              0 0 35px rgba(50,20,70,.07);
          }
        }

        @media (max-width: 360px) {
          .vd-home {
            padding-left: 12px;
            padding-right: 12px;
          }

          .vd-carousel-item {
            flex-basis: 137px;
          }

          .vd-carousel-item .vd-product-card {
            width: 137px;
          }

          .vd-product-image {
            height: 145px;
          }

          .vd-benefits {
            gap: 2px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
