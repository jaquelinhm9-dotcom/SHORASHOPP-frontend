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

const categories = [
  { name: "Ropa y Moda", icon: "shirt" },
  { name: "Tecnología", icon: "phone" },
  { name: "Hogar y Vida", icon: "home" },
  { name: "Belleza y Salud", icon: "beauty" },
  { name: "Accesorios", icon: "headphones" },
  { name: "Juguetes y Más", icon: "game" },
];

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
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=700&q=85",
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
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=85",
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
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=85",
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
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=700&q=85",
    description:
      "Licuadora de alto rendimiento para preparar bebidas y alimentos fácilmente.",
    specifications: [
      "Motor potente",
      "Vaso de gran capacidad",
      "Cuchillas reforzadas",
      "Fácil limpieza",
    ],
  },
];

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

  const existingIndex = cart.findIndex(
    (item) =>
      Number(item.id) === Number(product.id)
  );

  if (existingIndex >= 0) {
    const current = cart[existingIndex];

    cart[existingIndex] = {
      ...current,
      quantity:
        Number(current.quantity || 1) + 1,
    };
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

  const index = cart.findIndex(
    (item) =>
      Number(item.id) === Number(productId)
  );

  if (index === -1) return;

  const nextQuantity = Number(quantity);

  if (nextQuantity <= 0) {
    cart.splice(index, 1);
  } else {
    cart[index] = {
      ...cart[index],
      quantity: nextQuantity,
    };
  }

  saveCart(cart);
}

function clearCart() {
  saveCart([]);
}

function getCartCount() {
  return getCart().reduce(
    (total, item) =>
      total + Number(item.quantity || 1),
    0
  );
}

function formatPrice(value) {
  return `$${Number(value || 0).toLocaleString(
    "es-MX"
  )}.00`;
}

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
          <circle cx="9.3" cy="19" r="1.4" />
          <circle cx="17.2" cy="19" r="1.4" />
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
          <circle cx="12" cy="8.1" r="3.5" />
          <path d="M5 20c.7-4 3-6 7-6s6.3 2 7 6" />
        </svg>
      );

    case "shirt":
      return (
        <svg {...props}>
          <path d="m8 5 4 2 4-2 4 4-3 2.2V20H7v-8.8L4 9l4-4Z" />
        </svg>
      );

    case "phone":
      return (
        <svg {...props}>
          <rect
            x="7"
            y="2.7"
            width="10"
            height="18.6"
            rx="2"
          />
          <path d="M10.5 5h3" />
          <circle
            cx="12"
            cy="18.2"
            r=".8"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      );

    case "home":
      return (
        <svg {...props}>
          <path d="m3 10 9-7 9 7" />
          <path d="M5 9.5V20h14V9.5" />
          <path d="M9.5 20v-5h5v5" />
        </svg>
      );

    case "beauty":
      return (
        <svg {...props}>
          <path d="M8 10c0-3 1.8-5 4-5s4 2 4 5c0 4-1.7 7-4 7s-4-3-4-7Z" />
          <path d="M6 7c1.3-2.2 3-3.5 6-3.5S16.7 4.8 18 7" />
          <path d="M9.5 11h.01" />
          <path d="M14.5 11h.01" />
          <path d="M10 14c1.3 1 2.7 1 4 0" />
        </svg>
      );

    case "headphones":
      return (
        <svg {...props}>
          <path d="M4 13a8 8 0 0 1 16 0" />
          <path d="M4 13v3.5A2.5 2.5 0 0 0 6.5 19H7v-7h-.5A2.5 2.5 0 0 0 4 14.5" />
          <path d="M20 13v3.5a2.5 2.5 0 0 1-2.5 2.5H17v-7h.5A2.5 2.5 0 0 1 20 14.5" />
        </svg>
      );

    case "game":
      return (
        <svg {...props}>
          <path d="M7 8h10a5 5 0 0 1 5 5v2.5a2.5 2.5 0 0 1-4.3 1.8L15 15H9l-2.7 2.3A2.5 2.5 0 0 1 2 15.5V13a5 5 0 0 1 5-5Z" />
          <path d="M7 11v4" />
          <path d="M5 13h4" />
          <circle
            cx="17"
            cy="12"
            r=".8"
            fill="currentColor"
            stroke="none"
          />
          <circle
            cx="19"
            cy="14"
            r=".8"
            fill="currentColor"
            stroke="none"
          />
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
          <circle cx="7" cy="18" r="1.5" />
          <circle cx="18" cy="18" r="1.5" />
        </svg>
      );

    case "badge":
      return (
        <svg {...props}>
          <circle cx="12" cy="10" r="5.5" />
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

    default:
      return null;
  }
}

function Header({
  cartCount,
  onOpenMenu,
  hidden,
  onAccount,
}) {
  return (
    <header
      className={`vd-header ${
        hidden ? "vd-header-hidden" : ""
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
        aria-label="VaniDaxi"
      >
        <span>Vani</span>
        <strong>Daxi</strong>
      </Link>

      <div className="vd-header-right">
        <button
          type="button"
          className="vd-header-icon"
          onClick={onAccount}
          aria-label="Notificaciones"
        >
          <Icon name="bell" size={23} />
          <i>3</i>
        </button>

        <Link
          to="/carrito"
          className="vd-header-icon"
          aria-label="Carrito"
        >
          <Icon name="cart" size={24} />

          {cartCount > 0 && (
            <i>{cartCount}</i>
          )}
        </Link>
      </div>
    </header>
  );
}

function SearchBox({ value, onChange }) {
  return (
    <div className="vd-search-box">
      <Icon
        name="search"
        size={22}
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
          size={20}
          stroke={1.9}
        />
      </button>
    </div>
  );
}

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
          <Icon name="store" size={27} />
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
            stroke={2}
          />
        </span>
      </button>

      <button
        type="button"
        className="vd-main-card vd-account-card"
        onClick={onAccount}
      >
        <span className="vd-main-icon vd-account-icon-main">
          <Icon name="user" size={27} />
        </span>

        <span className="vd-main-copy">
          <strong>Mi cuenta</strong>

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
            stroke={2}
          />
        </span>
      </button>
    </section>
  );
}

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
        {categories.map((category, index) => (
          <Link
            key={category.name}
            to={`/catalogo?categoria=${encodeURIComponent(
              category.name
            )}`}
            className="vd-category"
          >
            <div
              className={`vd-category-icon ${
                index % 2 === 1
                  ? "vd-category-purple"
                  : ""
              }`}
            >
              <Icon
                name={category.icon}
                size={30}
                stroke={1.45}
              />
            </div>

            <span>{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function OfferBanner() {
  return (
    <>
      <section className="vd-offer">
        <div className="vd-offer-text">
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

          <div className="vd-offer-bag">
            <div className="vd-bag-handle" />
          </div>

          <div className="vd-offer-watch">
            <img
              src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=450&q=85"
              alt="Smartwatch"
            />
          </div>

          <div className="vd-offer-shoe">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=550&q=85"
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

function ProductCard({
  product,
  favorites,
  onToggleFavorite,
}) {
  const favorite = favorites.includes(
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
        />
      </Link>

      <div className="vd-product-info">
        <h3>{product.name}</h3>

        <div className="vd-price">
          <strong>
            {formatPrice(product.price)}
          </strong>

          {product.oldPrice && (
            <del>
              {formatPrice(product.oldPrice)}
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

function Benefits() {
  const benefits = [
    [
      "shield",
      "Compra segura",
      "Protegemos tus compras",
    ],
    [
      "truck",
      "Envíos rápidos",
      "Recibe tus productos rápidamente",
    ],
    [
      "badge",
      "Vendedores",
      "Más confianza para ti",
    ],
    [
      "chat",
      "Soporte 24/7",
      "Estamos aquí para ayudarte",
    ],
  ];

  return (
    <section className="vd-benefits">
      {benefits.map(
        ([icon, title, text], index) => (
          <div
            className="vd-benefit"
            key={title}
          >
            <span
              className={
                index % 2
                  ? "vd-purple-benefit"
                  : ""
              }
            >
              <Icon
                name={icon}
                size={24}
                stroke={1.55}
              />
            </span>

            <strong>{title}</strong>

            <small>
              {text}
            </small>
          </div>
        )
      )}
    </section>
  );
}

function Home({
  onAccount,
  onSell,
  favorites,
  onToggleFavorite,
}) {
  const [search, setSearch] = useState("");

  const visibleProducts = useMemo(() => {
    if (!search.trim()) return products;

    const query = search
      .toLowerCase()
      .trim();

    return products.filter((product) =>
      [
        product.name,
        product.category,
        product.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

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

      <section className="vd-section vd-products-section">
        <div className="vd-section-title">
          <h2>
            {search.trim()
              ? "Resultados"
              : "Productos destacados"}
          </h2>

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

        {visibleProducts.length === 0 && (
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

      <Benefits />

      <div className="vd-bottom-space" />
    </main>
  );
}

function Catalog({
  favorites,
  onToggleFavorite,
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState("Todos");

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(
      location.search
    );

    const category =
      params.get("categoria");

    if (category) {
      setActiveCategory(category);
    } else {
      setActiveCategory("Todos");
    }
  }, [location.search]);

  const filtered = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "Todos" ||
        product.category === activeCategory;

      const matchesSearch =
        !query ||
        [
          product.name,
          product.category,
          product.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [search, activeCategory]);

  return (
    <main className="vd-page">
      <div className="vd-page-title">
        <p>EXPLORA</p>
        <h1>Todos los productos</h1>
      </div>

      <div className="vd-catalog-search">
        <Icon name="search" size={20} />

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar productos..."
        />
      </div>

      <div className="vd-filters">
        {[
          "Todos",
          ...categories.map(
            (category) => category.name
          ),
        ].map((category) => (
          <button
            key={category}
            type="button"
            className={
              activeCategory === category
                ? "active"
                : ""
            }
            onClick={() =>
              setActiveCategory(category)
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
            No hay productos en esta categoría
          </strong>
          <small>
            Prueba otra categoría o búsqueda.
          </small>
        </div>
      ) : (
        <div className="vd-product-grid vd-catalog-grid">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorites={favorites}
              onToggleFavorite={
                onToggleFavorite
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}

function ProductPage({
  onToggleFavorite,
  favorites,
}) {
  const { id } = useParams();

  const product =
    products.find(
      (item) =>
        Number(item.id) === Number(id)
    ) || products[0];

  const favorite = favorites.includes(
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
              product.badgeType === "new"
                ? "vd-new"
                : ""
            }`}
          >
            {product.discount}
          </span>
        </div>

        <div className="vd-detail-info">
          <small>{product.category}</small>

          <h1>{product.name}</h1>

          <div className="vd-detail-rating">
            ★ {product.rating}
            <span>•</span>
            {product.sales}
          </div>

          <div className="vd-detail-price">
            <strong>
              {formatPrice(product.price)}
            </strong>

            {product.oldPrice && (
              <del>
                {formatPrice(product.oldPrice)}
              </del>
            )}
          </div>

          <p>{product.description}</p>

          <div className="vd-detail-actions">
            <button
              type="button"
              className="vd-gradient-button"
              onClick={() =>
                addProductToCart(product)
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
              aria-label="Favoritos"
            >
              <Icon
                name="heart"
                size={22}
              />
            </button>
          </div>

          <div className="vd-specifications">
            <h2>Características</h2>

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

function Cart() {
  const navigate = useNavigate();

  const [items, setItems] = useState(
    getCart
  );

  useEffect(() => {
    const update = () => {
      setItems(getCart());
    };

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

  const totalItems = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 1),
    0
  );

  const total = items.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  function changeQuantity(
    id,
    quantity
  ) {
    updateCartQuantity(id, quantity);
  }

  function removeItem(id) {
    removeProductFromCart(id);
  }

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
            Agrega productos y aparecerán
            aquí.
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
          <div className="vd-cart-count-title">
            {totalItems}{" "}
            {totalItems === 1
              ? "producto"
              : "productos"}
          </div>

          <div className="vd-cart-list">
            {items.map((item) => {
              const quantity = Number(
                item.quantity || 1
              );

              const itemTotal =
                Number(item.price || 0) *
                quantity;

              return (
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
                    <Link
                      to={`/producto/${item.id}`}
                      className="vd-cart-name"
                    >
                      {item.name}
                    </Link>

                    <span className="vd-cart-price">
                      {formatPrice(
                        item.price
                      )}
                    </span>

                    <strong className="vd-cart-line-total">
                      {formatPrice(itemTotal)}
                    </strong>

                    <div className="vd-cart-actions">
                      <div className="vd-quantity">
                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item.id,
                              quantity - 1
                            )
                          }
                          aria-label="Disminuir cantidad"
                        >
                          −
                        </button>

                        <span>
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item.id,
                              quantity + 1
                            )
                          }
                          aria-label="Aumentar cantidad"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        className="vd-remove"
                        onClick={() =>
                          removeItem(
                            item.id
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
              navigate("/checkout")
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

function CheckoutPage() {
  const navigate = useNavigate();

  const [items, setItems] = useState(
    getCart
  );

  const [step, setStep] =
    useState(1);

  const [completed, setCompleted] =
    useState(false);

  const [shipping, setShipping] =
    useState({
      name: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    });

  const [payment, setPayment] =
    useState("card");

  useEffect(() => {
    const update = () => {
      setItems(getCart());
    };

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

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  const shippingCost =
    subtotal >= 999 ? 0 : 99;

  const total =
    subtotal + shippingCost;

  function updateShipping(
    field,
    value
  ) {
    setShipping((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function canContinueShipping() {
    return Object.values(
      shipping
    ).every((value) =>
      String(value).trim()
    );
  }

  function finishPurchase() {
    clearCart();
    setItems([]);
    setCompleted(true);
  }

  if (completed) {
    return (
      <main className="vd-page">
        <div className="vd-checkout-success">
          <div className="vd-success-icon">
            ✓
          </div>

          <p>COMPRA REALIZADA</p>

          <h1>
            ¡Gracias por tu compra!
          </h1>

          <span>
            Tu pedido ha sido registrado.
            Te mantendremos informado sobre
            el estado de tu compra.
          </span>

          <div className="vd-success-summary">
            <span>Total pagado</span>

            <strong>
              {formatPrice(total)}
            </strong>
          </div>

          <button
            type="button"
            className="vd-gradient-button"
            onClick={() =>
              navigate("/")
            }
          >
            Volver al inicio
          </button>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="vd-page">
        <div className="vd-empty">
          <div className="vd-empty-icon">
            <Icon
              name="cart"
              size={44}
            />
          </div>

          <h2>
            No tienes productos para comprar
          </h2>

          <p>
            Agrega productos al carrito para
            continuar.
          </p>

          <Link
            to="/catalogo"
            className="vd-gradient-button"
          >
            Ver productos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="vd-page vd-checkout-page">
      <button
        type="button"
        className="vd-checkout-back"
        onClick={() =>
          step === 1
            ? navigate("/carrito")
            : setStep(step - 1)
        }
      >
        ‹ Volver
      </button>

      <div className="vd-page-title vd-checkout-title">
        <p>FINALIZAR COMPRA</p>
        <h1>Tu pedido</h1>
      </div>

      <div className="vd-checkout-steps">
        {[1, 2, 3].map((number) => (
          <div
            key={number}
            className={`vd-checkout-step ${
              step >= number
                ? "active"
                : ""
            }`}
          >
            <span>{number}</span>

            <small>
              {number === 1
                ? "Envío"
                : number === 2
                ? "Pago"
                : "Confirmar"}
            </small>
          </div>
        ))}
      </div>

      <div className="vd-checkout-layout">
        <section className="vd-checkout-main">
          {step === 1 && (
            <div className="vd-checkout-card">
              <h2>
                Datos de envío
              </h2>

              <p className="vd-checkout-subtitle">
                Indícanos dónde quieres recibir
                tu pedido.
              </p>

              <div className="vd-checkout-form">
                <label>
                  Nombre completo

                  <input
                    value={shipping.name}
                    onChange={(event) =>
                      updateShipping(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Tu nombre completo"
                  />
                </label>

                <label>
                  Teléfono

                  <input
                    type="tel"
                    value={shipping.phone}
                    onChange={(event) =>
                      updateShipping(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="Tu número de teléfono"
                  />
                </label>

                <label className="vd-form-full">
                  Dirección

                  <input
                    value={shipping.address}
                    onChange={(event) =>
                      updateShipping(
                        "address",
                        event.target.value
                      )
                    }
                    placeholder="Calle, número y colonia"
                  />
                </label>

                <label>
                  Ciudad

                  <input
                    value={shipping.city}
                    onChange={(event) =>
                      updateShipping(
                        "city",
                        event.target.value
                      )
                    }
                    placeholder="Tu ciudad"
                  />
                </label>

                <label>
                  Estado

                  <input
                    value={shipping.state}
                    onChange={(event) =>
                      updateShipping(
                        "state",
                        event.target.value
                      )
                    }
                    placeholder="Tu estado"
                  />
                </label>

                <label>
                  Código postal

                  <input
                    value={shipping.zip}
                    onChange={(event) =>
                      updateShipping(
                        "zip",
                        event.target.value
                      )
                    }
                    placeholder="Código postal"
                  />
                </label>
              </div>

              <button
                type="button"
                className="vd-gradient-button vd-full-button"
                onClick={() => {
                  if (
                    canContinueShipping()
                  ) {
                    setStep(2);
                  } else {
                    alert(
                      "Completa todos los datos de envío."
                    );
                  }
                }}
              >
                Continuar al pago
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="vd-checkout-card">
              <h2>
                Método de pago
              </h2>

              <p className="vd-checkout-subtitle">
                Elige cómo quieres pagar tu
                compra.
              </p>

              <div className="vd-payment-options">
                {[
                  [
                    "card",
                    "Tarjeta",
                    "Crédito o débito",
                  ],
                  [
                    "transfer",
                    "Transferencia",
                    "Pago mediante transferencia",
                  ],
                  [
                    "cash",
                    "Pago en efectivo",
                    "Disponible según el vendedor",
                  ],
                ].map(
                  ([value, title, subtitle]) => (
                    <button
                      key={value}
                      type="button"
                      className={`vd-payment-option ${
                        payment === value
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setPayment(value)
                      }
                    >
                      <span className="vd-payment-radio" />

                      <div>
                        <strong>
                          {title}
                        </strong>

                        <small>
                          {subtitle}
                        </small>
                      </div>
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="vd-gradient-button vd-full-button"
                onClick={() =>
                  setStep(3)
                }
              >
                Revisar pedido
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="vd-checkout-card">
              <h2>
                Confirma tu pedido
              </h2>

              <p className="vd-checkout-subtitle">
                Revisa los datos antes de
                finalizar.
              </p>

              <div className="vd-checkout-confirm-section">
                <strong>
                  Dirección de envío
                </strong>

                <span>
                  {shipping.name}
                </span>

                <span>
                  {shipping.address}
                </span>

                <span>
                  {shipping.city},{" "}
                  {shipping.state},{" "}
                  {shipping.zip}
                </span>

                <span>
                  {shipping.phone}
                </span>
              </div>

              <div className="vd-checkout-confirm-section">
                <strong>
                  Método de pago
                </strong>

                <span>
                  {payment === "card"
                    ? "Tarjeta"
                    : payment ===
                      "transfer"
                    ? "Transferencia"
                    : "Pago en efectivo"}
                </span>
              </div>

              <button
                type="button"
                className="vd-gradient-button vd-full-button"
                onClick={finishPurchase}
              >
                Confirmar compra
              </button>
            </div>
          )}
        </section>

        <aside className="vd-order-summary">
          <h2>
            Resumen del pedido
          </h2>

          <div className="vd-order-products">
            {items.map((item) => (
              <div
                key={item.id}
                className="vd-order-product"
              >
                <img
                  src={item.image}
                  alt={item.name}
                />

                <div>
                  <strong>
                    {item.name}
                  </strong>

                  <small>
                    Cantidad:{" "}
                    {item.quantity || 1}
                  </small>
                </div>

                <span>
                  {formatPrice(
                    Number(item.price) *
                      Number(
                        item.quantity || 1
                      )
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="vd-order-totals">
            <div>
              <span>Subtotal</span>

              <strong>
                {formatPrice(subtotal)}
              </strong>
            </div>

            <div>
              <span>Envío</span>

              <strong>
                {shippingCost === 0
                  ? "Gratis"
                  : formatPrice(
                      shippingCost
                    )}
              </strong>
            </div>

            <div className="vd-order-final-total">
              <span>Total</span>

              <strong>
                {formatPrice(total)}
              </strong>
            </div>
          </div>

          {subtotal < 999 && (
            <small className="vd-free-shipping-note">
              Agrega{" "}
              {formatPrice(
                999 - subtotal
              )}{" "}
              más para obtener envío gratis.
            </small>
          )}
        </aside>
      </div>
    </main>
  );
}

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
        <p>MIS PRODUCTOS</p>
        <h1>Favoritos</h1>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="vd-empty">
          <div className="vd-empty-icon">
            <Icon
              name="heart"
              size={43}
            />
          </div>

          <h2>
            Aún no tienes favoritos
          </h2>

          <p>
            Guarda los productos que más te
            gusten y aparecerán aquí.
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

function AccountPage({
  user,
  onOpenAuth,
  onSignOut,
}) {
  if (!user) {
    return (
      <main className="vd-page">
        <div className="vd-page-title">
          <p>MI CUENTA</p>
          <h1>Bienvenido</h1>
        </div>

        <div className="vd-empty">
          <div className="vd-empty-icon">
            <Icon
              name="user"
              size={43}
            />
          </div>

          <h2>
            Inicia sesión
          </h2>

          <p>
            Accede a tus compras, favoritos y
            todas las funciones de VaniDaxi.
          </p>

          <button
            type="button"
            className="vd-gradient-button"
            onClick={onOpenAuth}
          >
            Iniciar sesión
          </button>
        </div>
      </main>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Usuario";

  return (
    <main className="vd-page">
      <div className="vd-page-title">
        <p>MI PERFIL</p>
        <h1>Mi cuenta</h1>
      </div>

      <div className="vd-account-card">
        <div className="vd-account-avatar">
          {displayName
            .charAt(0)
            .toUpperCase()}
        </div>

        <h2>{displayName}</h2>

        <p>{user.email}</p>
      </div>

      <div className="vd-account-options">
        <Link to="/carrito">
          <span>
            <Icon
              name="cart"
              size={20}
            />
          </span>

          <div>
            <strong>
              Mis compras
            </strong>

            <small>
              Consulta tus productos
            </small>
          </div>

          <b>›</b>
        </Link>

        <Link to="/favoritos">
          <span>
            <Icon
              name="heart"
              size={20}
            />
          </span>

          <div>
            <strong>
              Mis favoritos
            </strong>

            <small>
              Productos guardados
            </small>
          </div>

          <b>›</b>
        </Link>

        <Link to="/vender">
          <span>
            <Icon
              name="store"
              size={20}
            />
          </span>

          <div>
            <strong>
              Vender en VaniDaxi
            </strong>

            <small>
              Publica tus productos
            </small>
          </div>

          <b>›</b>
        </Link>
      </div>

      <button
        type="button"
        className="vd-signout-button"
        onClick={onSignOut}
      >
        Cerrar sesión
      </button>
    </main>
  );
}

function SellerPage({
  user,
  onOpenAuth,
}) {
  const navigate = useNavigate();

  return (
    <main className="vd-page">
      <div className="vd-page-title">
        <p>VENDE CON NOSOTROS</p>
        <h1>Vende en VaniDaxi</h1>
      </div>

      <div className="vd-seller-page">
        <div className="vd-seller-hero">
          <div className="vd-seller-icon">
            <Icon
              name="store"
              size={42}
            />
          </div>

          <h2>
            Haz crecer tus ventas
          </h2>

          <p>
            Publica tus productos y llega a
            nuevos compradores desde
            VaniDaxi.
          </p>
        </div>

        <div className="vd-seller-benefits">
          <div>
            <span>✓</span>

            <section>
              <strong>
                Publica tus productos
              </strong>

              <small>
                Muestra lo que vendes a nuevos
                compradores.
              </small>
            </section>
          </div>

          <div>
            <span>✓</span>

            <section>
              <strong>
                Administra tus ventas
              </strong>

              <small>
                Ten el control de tus pedidos
                y productos.
              </small>
            </section>
          </div>

          <div>
            <span>✓</span>

            <section>
              <strong>
                Haz crecer tu negocio
              </strong>

              <small>
                Conecta con nuevos clientes.
              </small>
            </section>
          </div>
        </div>

        <button
          type="button"
          className="vd-gradient-button vd-full-button"
          onClick={() => {
            if (!user) {
              onOpenAuth();
              return;
            }

            navigate("/");
          }}
        >
          {user
            ? "Comenzar a vender"
            : "Inicia sesión para vender"}
        </button>
      </div>
    </main>
  );
}

function BottomNavigation({
  cartCount,
}) {
  return (
    <nav className="vd-bottom-nav">
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `vd-bottom-item ${
            isActive ? "active" : ""
          }`
        }
      >
        <Icon
          name="home"
          size={22}
        />
        <span>Inicio</span>
      </NavLink>

      <NavLink
        to="/catalogo"
        className={({ isActive }) =>
          `vd-bottom-item ${
            isActive ? "active" : ""
          }`
        }
      >
        <Icon
          name="grid"
          size={22}
        />
        <span>Explorar</span>
      </NavLink>

      <NavLink
        to="/favoritos"
        className={({ isActive }) =>
          `vd-bottom-item ${
            isActive ? "active" : ""
          }`
        }
      >
        <Icon
          name="heart"
          size={22}
        />
        <span>Favoritos</span>
      </NavLink>

      <NavLink
        to="/carrito"
        className={({ isActive }) =>
          `vd-bottom-item vd-bottom-cart ${
            isActive ? "active" : ""
          }`
        }
      >
        <span className="vd-bottom-cart-icon">
          <Icon
            name="cart"
            size={23}
          />

          {cartCount > 0 && (
            <i>{cartCount}</i>
          )}
        </span>

        <span>Carrito</span>
      </NavLink>

      <NavLink
        to="/cuenta"
        className={({ isActive }) =>
          `vd-bottom-item ${
            isActive ? "active" : ""
          }`
        }
      >
        <Icon
          name="user"
          size={22}
        />
        <span>Cuenta</span>
      </NavLink>
    </nav>
  );
}

function MenuOverlay({
  onClose,
  onAccount,
  onSell,
  user,
  onSignOut,
}) {
  const navigate = useNavigate();

  function go(path) {
    navigate(path);
    onClose();
  }

  return (
    <div
      className="vd-menu-overlay"
      onClick={onClose}
    >
      <aside
        className="vd-side-menu"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="vd-menu-top">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <Icon
              name="close"
              size={23}
            />
          </button>

          <div className="vd-menu-logo">
            <span>Vani</span>
            <strong>Daxi</strong>
          </div>
        </div>

        <button
          type="button"
          className="vd-menu-user"
          onClick={() => {
            onClose();

            if (user) {
              navigate("/cuenta");
            } else {
              onAccount();
            }
          }}
        >
          <span className="vd-menu-user-icon">
            <Icon
              name="user"
              size={23}
            />
          </span>

          <div>
            <strong>
              {user
                ? user.user_metadata
                    ?.full_name ||
                  "Mi cuenta"
                : "Hola, bienvenido"}
            </strong>

            <small>
              {user
                ? user.email
                : "Inicia sesión o regístrate"}
            </small>
          </div>

          <b>›</b>
        </button>

        <div className="vd-menu-links">
          <button
            type="button"
            onClick={() => go("/")}
          >
            <Icon
              name="home"
              size={21}
            />
            <span>Inicio</span>
          </button>

          <button
            type="button"
            onClick={() =>
              go("/catalogo")
            }
          >
            <Icon
              name="grid"
              size={21}
            />
            <span>Explorar</span>
          </button>

          <button
            type="button"
            onClick={() =>
              go("/favoritos")
            }
          >
            <Icon
              name="heart"
              size={21}
            />
            <span>Favoritos</span>
          </button>

          <button
            type="button"
            onClick={() =>
              go("/carrito")
            }
          >
            <Icon
              name="cart"
              size={21}
            />
            <span>Mi carrito</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSell();
            }}
          >
            <Icon
              name="store"
              size={21}
            />
            <span>Vender en VaniDaxi</span>
          </button>
        </div>

        {user && (
          <button
            type="button"
            className="vd-menu-signout"
            onClick={() => {
              onSignOut();
              onClose();
            }}
          >
            Cerrar sesión
          </button>
        )}
      </aside>
    </div>
  );
}

function AuthModal({
  onClose,
}) {
  const [mode, setMode] =
    useState("login");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } =
          await supabase.auth.signInWithPassword(
            {
              email,
              password,
            }
          );

        if (error) throw error;

        onClose();
      } else {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });

        if (error) throw error;

        if (
          data.user &&
          !data.session
        ) {
          setMessage(
            "Revisa tu correo electrónico para confirmar tu cuenta."
          );
        } else {
          onClose();
        }
      }
    } catch (error) {
      const errorMessage =
        String(
          error?.message || ""
        );

      const lower =
        errorMessage.toLowerCase();

      if (
        lower.includes(
          "invalid login credentials"
        )
      ) {
        setMessage(
          "Correo o contraseña incorrectos."
        );
      } else if (
        lower.includes(
          "user already registered"
        )
      ) {
        setMessage(
          "Este correo ya está registrado. Intenta iniciar sesión."
        );
      } else {
        setMessage(
          errorMessage ||
            "Ocurrió un error. Inténtalo nuevamente."
        );
      }
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
        className="vd-auth-modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className="vd-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <Icon
            name="close"
            size={20}
          />
        </button>

        <div className="vd-auth-logo">
          <span>Vani</span>
          <strong>Daxi</strong>
        </div>

        <h2>
          {mode === "login"
            ? "Bienvenido de nuevo"
            : "Crea tu cuenta"}
        </h2>

        <p>
          {mode === "login"
            ? "Inicia sesión para continuar."
            : "Regístrate para comenzar a disfrutar VaniDaxi."}
        </p>

        <div className="vd-auth-tabs">
          <button
            type="button"
            className={
              mode === "login"
                ? "active"
                : ""
            }
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            className={
              mode === "register"
                ? "active"
                : ""
            }
            onClick={() => {
              setMode("register");
              setMessage("");
            }}
          >
            Registrarme
          </button>
        </div>

        <form
          className="vd-auth-form"
          onSubmit={handleSubmit}
        >
          {mode === "register" && (
            <label>
              Nombre completo

              <input
                type="text"
                value={fullName}
                onChange={(event) =>
                  setFullName(
                    event.target.value
                  )
                }
                placeholder="Tu nombre"
                required
              />
            </label>
          )}

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
              required
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
              minLength="6"
              required
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
              ? "Espera..."
              : mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [sellOpen, setSellOpen] =
    useState(false);

  const [user, setUser] =
    useState(null);

  const [favorites, setFavorites] =
    useState(getFavorites);

  const [cartCount, setCartCount] =
    useState(getCartCount);

  const [headerHidden, setHeaderHidden] =
    useState(false);

  useEffect(() => {
    let previousScroll =
      window.scrollY;

    function handleScroll() {
      const currentScroll =
        window.scrollY;

      if (currentScroll < 30) {
        setHeaderHidden(false);
      } else if (
        currentScroll >
        previousScroll + 5
      ) {
        setHeaderHidden(true);
      } else if (
        currentScroll <
        previousScroll - 5
      ) {
        setHeaderHidden(false);
      }

      previousScroll =
        currentScroll;
    }

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
    const updateCartCount = () => {
      setCartCount(getCartCount());
    };

    window.addEventListener(
      "vanidaxi-cart-change",
      updateCartCount
    );

    updateCartCount();

    return () =>
      window.removeEventListener(
        "vanidaxi-cart-change",
        updateCartCount
      );
  }, []);

  useEffect(() => {
    const updateFavorites = () => {
      setFavorites(
        getFavorites()
      );
    };

    window.addEventListener(
      "vanidaxi-favorites-change",
      updateFavorites
    );

    updateFavorites();

    return () =>
      window.removeEventListener(
        "vanidaxi-favorites-change",
        updateFavorites
      );
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } =
        await supabase.auth.getSession();

      if (mounted) {
        setUser(
          data.session?.user || null
        );
      }
    }

    loadUser();

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

      authListener.subscription.unsubscribe();
    };
  }, []);

  function toggleFavorite(productId) {
    const current =
      getFavorites();

    const id = Number(productId);

    const next = current.includes(id)
      ? current.filter(
          (favoriteId) =>
            Number(favoriteId) !== id
        )
      : [...current, id];

    saveFavorites(next);
    setFavorites(next);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="vd-app">
      <Header
        hidden={headerHidden}
        onOpenMenu={() =>
          setMenuOpen(true)
        }
        onAccount={() =>
          setAccountOpen(true)
        }
        cartCount={cartCount}
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
          path="/checkout"
          element={<CheckoutPage />}
        />

        <Route
          path="/cuenta"
          element={
            <AccountPage
              user={user}
              onOpenAuth={() =>
                setAccountOpen(true)
              }
              onSignOut={handleSignOut}
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
        cartCount={cartCount}
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
          onSignOut={handleSignOut}
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
              aria-label="Cerrar"
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
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          background: #ffffff;
          color: #17131c;
        }

        button,
        input {
          font: inherit;
        }

        button,
        a {
          -webkit-tap-highlight-color: transparent;
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
          background: #fff;
          padding-bottom: 88px;
        }

        .vd-header {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 70px;
          display: grid;
          grid-template-columns: 48px 1fr 96px;
          align-items: center;
          padding: 0 16px;
          background: rgba(255,255,255,.96);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid #eeeaf2;
          transition:
            transform .25s ease,
            opacity .25s ease;
        }

        .vd-header-hidden {
          transform: translateY(-100%);
          opacity: 0;
        }

        .vd-menu-button,
        .vd-header-icon {
          border: 0;
          background: transparent;
          display: grid;
          place-items: center;
          color: #29232f;
        }

        .vd-menu-button {
          width: 42px;
          height: 42px;
          border-radius: 12px;
        }

        .vd-menu-button:active,
        .vd-header-icon:active {
          background: #f3eef7;
        }

        .vd-brand {
          justify-self: center;
          font-size: 24px;
          line-height: 1;
          font-weight: 800;
          letter-spacing: -.9px;
        }

        .vd-brand span {
          color: #ee214e;
        }

        .vd-brand strong {
          color: #7133c8;
        }

        .vd-header-right {
          display: flex;
          justify-content: flex-end;
          gap: 5px;
        }

        .vd-header-icon {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 12px;
        }

        .vd-header-icon i,
        .vd-bottom-cart-icon i {
          position: absolute;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          display: grid;
          place-items: center;
          border-radius: 99px;
          background: #ef214e;
          color: #fff;
          font-size: 10px;
          font-style: normal;
          font-weight: 800;
          top: 3px;
          right: 2px;
          border: 2px solid #fff;
        }

        .vd-home,
        .vd-page {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .vd-search-section {
          padding: 17px 16px 10px;
        }

        .vd-search-box,
        .vd-catalog-search {
          width: 100%;
          height: 50px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          background: #f7f5f9;
          border: 1px solid #ece8f0;
          border-radius: 16px;
          color: #766d7d;
        }

        .vd-search-box input,
        .vd-catalog-search input {
          flex: 1;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #211c25;
        }

        .vd-search-box input::placeholder,
        .vd-catalog-search input::placeholder {
          color: #9b94a1;
        }

        .vd-search-box button {
          border: 0;
          background: transparent;
          color: #6734bd;
          display: grid;
          place-items: center;
        }

        .vd-main-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 8px 16px 17px;
        }

        .vd-main-card {
          min-height: 128px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 17px 14px;
          text-align: left;
          border: 0;
          border-radius: 20px;
          color: #fff;
        }

        .vd-sell-card {
          background: linear-gradient(
            135deg,
            #ef294f,
            #d72582,
            #7b34ce
          );
        }

        .vd-account-card {
          background: linear-gradient(
            135deg,
            #8a38cf,
            #6731bd,
            #4e269f
          );
        }

        .vd-main-icon {
          width: 48px;
          height: 48px;
          flex: 0 0 48px;
          display: grid;
          place-items: center;
          border-radius: 15px;
          background: rgba(255,255,255,.18);
          border: 1px solid rgba(255,255,255,.2);
        }

        .vd-main-copy {
          display: flex;
          flex-direction: column;
          gap: 5px;
          position: relative;
          z-index: 2;
        }

        .vd-main-copy strong {
          font-size: 16px;
          line-height: 1.05;
        }

        .vd-main-copy small {
          font-size: 11px;
          line-height: 1.35;
          opacity: .9;
        }

        .vd-card-arrow {
          position: absolute;
          right: 11px;
          bottom: 10px;
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(255,255,255,.18);
        }

        .vd-section {
          padding: 7px 16px 20px;
        }

        .vd-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 13px;
        }

        .vd-section-title h2 {
          margin: 0;
          font-size: 20px;
          letter-spacing: -.4px;
        }

        .vd-section-title a {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #7132c4;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .vd-section-title a span {
          font-size: 19px;
          line-height: 1;
        }

        .vd-category-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px 10px;
        }

        .vd-category {
          min-width: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 7px;
          text-align: center;
        }

        .vd-category-icon {
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          border-radius: 19px;
          color: #e72352;
          background: #fff0f4;
        }

        .vd-category-purple {
          color: #7334c8;
          background: #f1eaff;
        }

        .vd-category > span {
          font-size: 11px;
          font-weight: 700;
          line-height: 1.2;
        }

        .vd-offer {
          margin: 4px 16px 4px;
          min-height: 220px;
          position: relative;
          overflow: hidden;
          display: flex;
          border-radius: 24px;
          background:
            linear-gradient(
              110deg,
              #ef1f4f 0%,
              #d7267e 48%,
              #7331c9 100%
            );
          color: #fff;
        }

        .vd-offer-text {
          position: relative;
          z-index: 5;
          width: 51%;
          padding: 24px 10px 22px 22px;
        }

        .vd-offer-text h2 {
          margin: 0 0 8px;
          font-size: 27px;
          line-height: .94;
          letter-spacing: -1px;
        }

        .vd-offer-text p {
          margin: 0 0 16px;
          font-size: 11px;
          line-height: 1.4;
          opacity: .92;
        }

        .vd-offer-button {
          width: fit-content;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          border-radius: 10px;
          background: #fff;
          color: #d62465;
          font-size: 11px;
          font-weight: 800;
        }

        .vd-offer-button span {
          font-size: 17px;
          line-height: 1;
        }

        .vd-offer-art {
          position: absolute;
          inset: 0 0 0 40%;
        }

        .vd-sale-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,.12);
        }

        .vd-sale-one {
          width: 170px;
          height: 170px;
          right: -45px;
          top: 20px;
        }

        .vd-sale-two {
          width: 110px;
          height: 110px;
          right: 95px;
          bottom: -44px;
        }

        .vd-sale-three {
          width: 54px;
          height: 54px;
          right: 135px;
          top: 15px;
        }

        .vd-offer-bag {
          position: absolute;
          width: 88px;
          height: 98px;
          right: 18px;
          bottom: 21px;
          border-radius: 8px 8px 13px 13px;
          transform: rotate(7deg);
          background: linear-gradient(
            145deg,
            #fff,
            #eee
          );
          box-shadow: 0 12px 28px rgba(0,0,0,.18);
        }

        .vd-bag-handle {
          position: absolute;
          width: 42px;
          height: 25px;
          left: 23px;
          top: -19px;
          border: 6px solid #f5f0f7;
          border-bottom: 0;
          border-radius: 25px 25px 0 0;
        }

        .vd-offer-watch {
          position: absolute;
          width: 78px;
          height: 78px;
          right: 102px;
          top: 33px;
          overflow: hidden;
          border-radius: 17px;
          transform: rotate(-9deg);
          background: #111;
          border: 5px solid rgba(255,255,255,.75);
          box-shadow: 0 9px 20px rgba(0,0,0,.2);
        }

        .vd-offer-watch img,
        .vd-offer-shoe img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vd-offer-shoe {
          position: absolute;
          width: 105px;
          height: 65px;
          right: 88px;
          bottom: 15px;
          overflow: hidden;
          border-radius: 30px;
          transform: rotate(-14deg);
          box-shadow: 0 10px 22px rgba(0,0,0,.2);
        }

        .vd-percent-bubble {
          position: absolute;
          right: 8px;
          top: 17px;
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #fff;
          color: #df2462;
          font-size: 21px;
          font-weight: 900;
          transform: rotate(9deg);
        }

        .vd-dots {
          display: flex;
          justify-content: center;
          gap: 5px;
          padding: 7px 0 17px;
        }

        .vd-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ddd6e4;
        }

        .vd-dots span.active {
          width: 18px;
          border-radius: 99px;
          background: #d92a71;
        }

        .vd-product-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .vd-product-card {
          min-width: 0;
          overflow: hidden;
          position: relative;
          border: 1px solid #eeeaf1;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 5px 20px rgba(42,25,55,.045);
        }

        .vd-product-top {
          position: absolute;
          z-index: 3;
          top: 10px;
          left: 10px;
          right: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .vd-product-badge {
          padding: 5px 7px;
          border-radius: 7px;
          background: #ef2852;
          color: #fff;
          font-size: 9px;
          font-weight: 800;
        }

        .vd-product-badge.vd-new {
          background: #7633c8;
        }

        .vd-favorite {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.92);
          color: #77707c;
          box-shadow: 0 3px 10px rgba(0,0,0,.08);
        }

        .vd-favorite-active {
          color: #ed2554;
        }

        .vd-product-image {
          width: 100%;
          aspect-ratio: 1 / .92;
          display: block;
          overflow: hidden;
          background: #f5f3f6;
        }

        .vd-product-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .vd-product-info {
          padding: 11px 11px 12px;
        }

        .vd-product-info h3 {
          min-height: 34px;
          margin: 0 0 7px;
          font-size: 13px;
          line-height: 1.28;
        }

        .vd-price {
          display: flex;
          align-items: baseline;
          gap: 7px;
        }

        .vd-price strong {
          font-size: 16px;
          color: #e52150;
        }

        .vd-price del {
          font-size: 10px;
          color: #9c95a0;
        }

        .vd-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          margin: 7px 0 10px;
          color: #77707d;
          font-size: 9px;
        }

        .vd-rating span {
          color: #f2a600;
          font-size: 11px;
        }

        .vd-rating b {
          font-weight: 500;
          color: #bdb6c1;
        }

        .vd-add-button {
          width: 100%;
          height: 37px;
          border: 0;
          border-radius: 11px;
          background: linear-gradient(
            100deg,
            #ed254e,
            #d72a80,
            #7233c8
          );
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 5px 13px rgba(207,35,105,.16);
        }

        .vd-add-button:active,
        .vd-gradient-button:active,
        .vd-checkout-button:active {
          transform: scale(.98);
        }

        .vd-benefits {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          padding: 15px 16px;
        }

        .vd-benefit {
          min-height: 116px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 10px;
          border: 1px solid #eeeaf1;
          border-radius: 17px;
          background: #fff;
        }

        .vd-benefit > span {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          margin-bottom: 7px;
          border-radius: 13px;
          background: #fff0f4;
          color: #e62251;
        }

        .vd-benefit > span.vd-purple-benefit {
          background: #f1eaff;
          color: #7334c8;
        }

        .vd-benefit strong {
          font-size: 11px;
        }

        .vd-benefit small {
          margin-top: 4px;
          color: #8c8491;
          font-size: 9px;
          line-height: 1.3;
        }

        .vd-bottom-space {
          height: 15px;
        }

        .vd-bottom-nav {
          position: fixed;
          z-index: 90;
          left: 0;
          right: 0;
          bottom: 0;
          height: 73px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          align-items: stretch;
          padding: 5px 6px max(5px, env(safe-area-inset-bottom));
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(16px);
          border-top: 1px solid #eeeaf2;
          box-shadow: 0 -8px 30px rgba(45,25,58,.05);
        }

        .vd-bottom-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          color: #8d8593;
          font-size: 9px;
          font-weight: 700;
        }

        .vd-bottom-item.active {
          color: #7b32c9;
        }

        .vd-bottom-cart-icon {
          position: relative;
          display: grid;
          place-items: center;
        }

        .vd-bottom-cart-icon i {
          top: -7px;
          right: -9px;
        }

        .vd-page {
          padding: 22px 16px 30px;
        }

        .vd-page-title {
          margin-bottom: 18px;
        }

        .vd-page-title p {
          margin: 0 0 4px;
          color: #db275f;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }

        .vd-page-title h1 {
          margin: 0;
          font-size: 29px;
          letter-spacing: -1px;
        }

        .vd-catalog-search {
          margin-bottom: 13px;
        }

        .vd-filters {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding-bottom: 12px;
          scrollbar-width: none;
        }

        .vd-filters::-webkit-scrollbar {
          display: none;
        }

        .vd-filters button {
          flex: 0 0 auto;
          border: 1px solid #e8e1ed;
          background: #fff;
          color: #6f6677;
          border-radius: 99px;
          padding: 8px 12px;
          font-size: 10px;
          font-weight: 700;
        }

        .vd-filters button.active {
          border-color: transparent;
          background: linear-gradient(
            100deg,
            #ed244e,
            #d72b81,
            #7234c8
          );
          color: #fff;
        }

        .vd-catalog-grid {
          padding-top: 5px;
        }

        .vd-no-results,
        .vd-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 48px 20px;
        }

        .vd-no-results span,
        .vd-empty-icon {
          margin-bottom: 13px;
        }

        .vd-no-results span {
          font-size: 35px;
        }

        .vd-no-results strong,
        .vd-empty h2 {
          margin-bottom: 5px;
          font-size: 17px;
        }

        .vd-no-results small,
        .vd-empty p {
          margin: 0 0 19px;
          color: #8d8592;
          font-size: 12px;
          line-height: 1.5;
        }

        .vd-no-results-large {
          min-height: 300px;
        }

        .vd-empty-icon {
          width: 82px;
          height: 82px;
          display: grid;
          place-items: center;
          border-radius: 25px;
          background: #f3eaff;
          color: #7634c8;
        }

        .vd-empty h2 {
          margin: 0 0 6px;
        }

        .vd-empty p {
          max-width: 320px;
        }

        .vd-gradient-button {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(
            100deg,
            #ed254e,
            #d62a7d,
            #7333c8
          );
          color: #fff;
          font-size: 12px;
          font-weight: 800;
          box-shadow: 0 7px 18px rgba(202,34,103,.17);
        }

        .vd-full-button {
          width: 100%;
        }

        .vd-detail-back {
          margin-bottom: 15px;
        }

        .vd-detail-back a {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #7432c5;
          font-size: 12px;
          font-weight: 800;
        }

        .vd-detail-back span {
          font-size: 21px;
        }

        .vd-product-detail {
          display: grid;
          gap: 20px;
        }

        .vd-detail-image {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          background: #f5f3f6;
        }

        .vd-detail-image img {
          width: 100%;
          aspect-ratio: 1 / .9;
          display: block;
          object-fit: cover;
        }

        .vd-detail-badge {
          position: absolute;
          left: 14px;
          top: 14px;
          padding: 7px 9px;
          border-radius: 8px;
          background: #ef2852;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
        }

        .vd-detail-badge.vd-new {
          background: #7633c8;
        }

        .vd-detail-info > small {
          color: #7834c7;
          font-size: 10px;
          font-weight: 800;
        }

        .vd-detail-info h1 {
          margin: 7px 0 9px;
          font-size: 29px;
          line-height: 1.05;
          letter-spacing: -1px;
        }

        .vd-detail-rating {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #77707d;
          font-size: 11px;
        }

        .vd-detail-rating:first-letter {
          color: #f2a600;
        }

        .vd-detail-price {
          display: flex;
          align-items: baseline;
          gap: 9px;
          margin: 15px 0;
        }

        .vd-detail-price strong {
          color: #e42150;
          font-size: 28px;
        }

        .vd-detail-price del {
          color: #99919d;
          font-size: 12px;
        }

        .vd-detail-info > p {
          color: #756d7a;
          font-size: 13px;
          line-height: 1.65;
        }

        .vd-detail-actions {
          display: grid;
          grid-template-columns: 1fr 52px;
          gap: 9px;
          margin: 19px 0 25px;
        }

        .vd-detail-favorite {
          width: 52px;
          height: 44px;
          display: grid;
          place-items: center;
          border: 1px solid #e7e0eb;
          border-radius: 12px;
          background: #fff;
          color: #77707c;
        }

        .vd-detail-favorite.active {
          color: #ed2554;
          background: #fff0f4;
          border-color: #ffd5df;
        }

        .vd-specifications {
          border-top: 1px solid #eee9f1;
          padding-top: 17px;
        }

        .vd-specifications h2 {
          margin: 0 0 12px;
          font-size: 17px;
        }

        .vd-spec-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 0;
          color: #69616f;
          font-size: 12px;
          border-bottom: 1px solid #f1edf3;
        }

        .vd-spec-row span {
          color: #e32351;
          font-weight: 900;
        }

        .vd-cart-count-title {
          margin: -8px 0 13px;
          color: #88808e;
          font-size: 11px;
        }

        .vd-cart-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .vd-cart-item {
          display: flex;
          gap: 12px;
          padding: 11px;
          border: 1px solid #eee9f1;
          border-radius: 17px;
          background: #fff;
        }

        .vd-cart-image {
          width: 92px;
          height: 92px;
          flex: 0 0 92px;
          overflow: hidden;
          border-radius: 13px;
          background: #f5f3f6;
        }

        .vd-cart-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vd-cart-content {
          min-width: 0;
          flex: 1;
        }

        .vd-cart-name {
          display: block;
          margin-bottom: 5px;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.25;
        }

        .vd-cart-price {
          display: block;
          color: #8a828e;
          font-size: 10px;
        }

        .vd-cart-line-total {
          display: block;
          margin-top: 3px;
          color: #e32150;
          font-size: 15px;
        }

        .vd-cart-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: 9px;
        }

        .vd-quantity {
          display: flex;
          align-items: center;
          overflow: hidden;
          border: 1px solid #e5dfea;
          border-radius: 9px;
          background: #fff;
        }

        .vd-quantity button {
          width: 29px;
          height: 29px;
          border: 0;
          background: #faf8fb;
          color: #7132c4;
          font-size: 17px;
          font-weight: 700;
        }

        .vd-quantity span {
          width: 27px;
          text-align: center;
          font-size: 11px;
          font-weight: 800;
        }

        .vd-remove {
          border: 0;
          background: transparent;
          color: #c92757;
          font-size: 10px;
          font-weight: 700;
        }

        .vd-cart-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 17px;
          padding: 17px 2px;
          border-top: 1px solid #eee9f1;
        }

        .vd-cart-total span {
          color: #6e6674;
          font-size: 13px;
          font-weight: 700;
        }

        .vd-cart-total strong {
          color: #e32050;
          font-size: 22px;
        }

        .vd-checkout-button {
          width: 100%;
          height: 49px;
          border: 0;
          border-radius: 13px;
          background: linear-gradient(
            100deg,
            #ed254e,
            #d62a7d,
            #7333c8
          );
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          box-shadow: 0 8px 18px rgba(203,34,104,.18);
        }

        .vd-continue-shopping {
          width: 100%;
          height: 43px;
          margin-top: 8px;
          border: 1px solid #e7e0eb;
          border-radius: 12px;
          background: #fff;
          color: #7333c6;
          font-size: 11px;
          font-weight: 800;
        }

        .vd-checkout-back {
          padding: 0;
          border: 0;
          background: transparent;
          color: #7432c5;
          font-size: 12px;
          font-weight: 800;
        }

        .vd-checkout-title {
          margin-top: 16px;
        }

        .vd-checkout-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          margin: 8px 0 18px;
        }

        .vd-checkout-step {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: #a39aa8;
        }

        .vd-checkout-step::after {
          content: "";
          position: absolute;
          top: 15px;
          left: calc(50% + 18px);
          right: calc(-50% + 18px);
          height: 2px;
          background: #e9e3ed;
        }

        .vd-checkout-step:last-child::after {
          display: none;
        }

        .vd-checkout-step span {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #eee9f1;
          font-size: 11px;
          font-weight: 800;
          position: relative;
          z-index: 2;
        }

        .vd-checkout-step.active {
          color: #7132c5;
        }

        .vd-checkout-step.active span {
          background: linear-gradient(
            135deg,
            #ed254e,
            #7432c8
          );
          color: #fff;
        }

        .vd-checkout-step.active::after {
          background: #b968d7;
        }

        .vd-checkout-step small {
          font-size: 9px;
          font-weight: 800;
        }

        .vd-checkout-layout {
          display: grid;
          gap: 15px;
        }

        .vd-checkout-card,
        .vd-order-summary {
          padding: 17px;
          border: 1px solid #eee9f1;
          border-radius: 18px;
          background: #fff;
        }

        .vd-checkout-card h2,
        .vd-order-summary h2 {
          margin: 0;
          font-size: 18px;
        }

        .vd-checkout-subtitle {
          margin: 6px 0 17px;
          color: #8a828f;
          font-size: 11px;
        }

        .vd-checkout-form {
          display: grid;
          gap: 12px;
        }

        .vd-checkout-form label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #5f5766;
          font-size: 10px;
          font-weight: 800;
        }

        .vd-checkout-form input {
          width: 100%;
          height: 43px;
          padding: 0 11px;
          border: 1px solid #e4deea;
          border-radius: 10px;
          outline: 0;
          background: #fbfafc;
          font-size: 11px;
        }

        .vd-checkout-form input:focus {
          border-color: #a65bd1;
        }

        .vd-form-full {
          grid-column: 1 / -1;
        }

        .vd-payment-options {
          display: grid;
          gap: 9px;
          margin-bottom: 17px;
        }

        .vd-payment-option {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px;
          border: 1px solid #e6dfeb;
          border-radius: 13px;
          background: #fff;
          text-align: left;
        }

        .vd-payment-option.active {
          border-color: #a951ce;
          background: #fbf7ff;
        }

        .vd-payment-radio {
          width: 18px;
          height: 18px;
          flex: 0 0 18px;
          border: 2px solid #c8c0cd;
          border-radius: 50%;
        }

        .vd-payment-option.active .vd-payment-radio {
          border: 5px solid #7933c6;
        }

        .vd-payment-option div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .vd-payment-option strong {
          font-size: 12px;
        }

        .vd-payment-option small {
          color: #8d8592;
          font-size: 9px;
        }

        .vd-checkout-confirm-section {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding: 12px;
          margin-bottom: 11px;
          border-radius: 12px;
          background: #f9f7fa;
          color: #746b79;
          font-size: 10px;
        }

        .vd-checkout-confirm-section strong {
          margin-bottom: 3px;
          color: #302936;
          font-size: 11px;
        }

        .vd-order-summary h2 {
          margin-bottom: 13px;
        }

        .vd-order-products {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .vd-order-product {
          display: grid;
          grid-template-columns: 47px 1fr auto;
          align-items: center;
          gap: 8px;
        }

        .vd-order-product img {
          width: 47px;
          height: 47px;
          object-fit: cover;
          border-radius: 8px;
        }

        .vd-order-product div {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .vd-order-product strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 10px;
        }

        .vd-order-product small {
          color: #938b98;
          font-size: 8px;
        }

        .vd-order-product > span {
          color: #e32251;
          font-size: 10px;
          font-weight: 800;
        }

        .vd-order-totals {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid #eee9f1;
        }

        .vd-order-totals > div {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          padding: 5px 0;
          color: #766e7c;
          font-size: 10px;
        }

        .vd-order-totals strong {
          color: #3d3542;
        }

        .vd-order-final-total {
          margin-top: 5px;
          padding-top: 10px !important;
          border-top: 1px solid #eee9f1;
          color: #302936 !important;
          font-size: 12px !important;
        }

        .vd-order-final-total strong {
          color: #e32150;
          font-size: 17px;
        }

        .vd-free-shipping-note {
          display: block;
          margin-top: 9px;
          color: #7835c5;
          font-size: 9px;
          line-height: 1.4;
        }

        .vd-checkout-success {
          max-width: 520px;
          margin: 35px auto;
          padding: 35px 20px;
          text-align: center;
          border: 1px solid #eee9f1;
          border-radius: 22px;
          background: #fff;
        }

        .vd-success-icon {
          width: 72px;
          height: 72px;
          display: grid;
          place-items: center;
          margin: 0 auto 15px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            #ed254e,
            #7633c8
          );
          color: #fff;
          font-size: 31px;
          font-weight: 900;
        }

        .vd-checkout-success p {
          margin: 0 0 5px;
          color: #df255e;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .vd-checkout-success h1 {
          margin: 0 0 10px;
          font-size: 26px;
        }

        .vd-checkout-success > span {
          display: block;
          color: #817985;
          font-size: 11px;
          line-height: 1.5;
        }

        .vd-success-summary {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 19px 0;
          padding: 13px;
          border-radius: 12px;
          background: #faf7fc;
        }

        .vd-success-summary span {
          color: #77707c;
          font-size: 10px;
        }

        .vd-success-summary strong {
          color: #e32150;
          font-size: 18px;
        }

        .vd-account-card {
          min-height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 13px;
          padding: 22px;
          border: 1px solid #eee9f1;
          border-radius: 20px;
          background: #fff;
        }

        .vd-account-card .vd-account-avatar {
          width: 62px;
          height: 62px;
          display: grid;
          place-items: center;
          margin-bottom: 10px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            #ed254e,
            #7432c8
          );
          color: #fff;
          font-size: 23px;
          font-weight: 900;
        }

        .vd-account-card h2 {
          margin: 0 0 4px;
          font-size: 17px;
        }

        .vd-account-card p {
          margin: 0;
          color: #8b8390;
          font-size: 10px;
        }

        .vd-account-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .vd-account-options a {
          display: grid;
          grid-template-columns: 40px 1fr 20px;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 1px solid #eee9f1;
          border-radius: 13px;
          background: #fff;
        }

        .vd-account-options a > span {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #f2eaff;
          color: #7433c7;
        }

        .vd-account-options a div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .vd-account-options strong {
          font-size: 11px;
        }

        .vd-account-options small {
          color: #8c8491;
          font-size: 9px;
        }

        .vd-account-options b {
          color: #9d94a2;
          font-size: 19px;
        }

        .vd-signout-button {
          width: 100%;
          height: 43px;
          margin-top: 13px;
          border: 1px solid #f0cbd5;
          border-radius: 12px;
          background: #fff7f9;
          color: #d52a59;
          font-size: 11px;
          font-weight: 800;
        }

        .vd-seller-page {
          padding: 20px;
          border: 1px solid #eee9f1;
          border-radius: 22px;
          background: #fff;
        }

        .vd-seller-hero {
          text-align: center;
        }

        .vd-seller-icon {
          width: 82px;
          height: 82px;
          display: grid;
          place-items: center;
          margin: 0 auto 14px;
          border-radius: 25px;
          background: linear-gradient(
            135deg,
            #ed254e,
            #7432c8
          );
          color: #fff;
        }

        .vd-seller-hero h2 {
          margin: 0 0 7px;
          font-size: 22px;
        }

        .vd-seller-hero p {
          margin: 0 auto 20px;
          max-width: 390px;
          color: #817985;
          font-size: 11px;
          line-height: 1.5;
        }

        .vd-seller-benefits {
          display: grid;
          gap: 8px;
          margin-bottom: 17px;
        }

        .vd-seller-benefits > div {
          display: flex;
          gap: 9px;
          padding: 11px;
          border-radius: 12px;
          background: #faf8fb;
        }

        .vd-seller-benefits > div > span {
          width: 25px;
          height: 25px;
          flex: 0 0 25px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #f9dce6;
          color: #db2454;
          font-weight: 900;
        }

        .vd-seller-benefits section {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .vd-seller-benefits strong {
          font-size: 11px;
        }

        .vd-seller-benefits small {
          color: #89818f;
          font-size: 9px;
          line-height: 1.35;
        }

        .vd-overlay,
        .vd-menu-overlay {
          position: fixed;
          z-index: 200;
          inset: 0;
          background: rgba(22,14,27,.52);
        }

        .vd-centered {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
        }

        .vd-modal,
        .vd-auth-modal {
          width: min(430px, 100%);
          max-height: calc(100vh - 36px);
          overflow-y: auto;
          position: relative;
          padding: 25px 20px 21px;
          border-radius: 22px;
          background: #fff;
          box-shadow: 0 25px 70px rgba(20,10,28,.22);
        }

        .vd-modal {
          text-align: center;
        }

        .vd-modal-close {
          position: absolute;
          top: 11px;
          right: 11px;
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 50%;
          background: #f5f2f7;
          color: #6f6675;
        }

        .vd-modal-icon {
          width: 65px;
          height: 65px;
          display: grid;
          place-items: center;
          margin: 6px auto 13px;
          border-radius: 20px;
          background: #f0e8ff;
          color: #7433c7;
        }

        .vd-modal h2 {
          margin: 0 0 7px;
          font-size: 21px;
        }

        .vd-modal p {
          margin: 0 0 19px;
          color: #837b88;
          font-size: 11px;
          line-height: 1.5;
        }

        .vd-auth-logo {
          margin-bottom: 13px;
          font-size: 22px;
          font-weight: 900;
          letter-spacing: -.8px;
        }

        .vd-auth-logo span {
          color: #ee214e;
        }

        .vd-auth-logo strong {
          color: #7133c8;
        }

        .vd-auth-modal h2 {
          margin: 0 0 5px;
          font-size: 22px;
        }

        .vd-auth-modal > p {
          margin: 0 0 15px;
          color: #817985;
          font-size: 10px;
        }

        .vd-auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          padding: 4px;
          margin-bottom: 15px;
          border-radius: 11px;
          background: #f5f2f7;
        }

        .vd-auth-tabs button {
          height: 37px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #827987;
          font-size: 10px;
          font-weight: 800;
        }

        .vd-auth-tabs button.active {
          background: #fff;
          color: #7433c7;
          box-shadow: 0 2px 7px rgba(30,20,40,.07);
        }

        .vd-auth-form {
          display: grid;
          gap: 11px;
        }

        .vd-auth-form label {
          display: flex;
          flex-direction: column;
          gap: 6px;
          color: #5d5563;
          font-size: 10px;
          font-weight: 800;
        }

        .vd-auth-form input {
          width: 100%;
          height: 43px;
          padding: 0 11px;
          border: 1px solid #e4deea;
          border-radius: 10px;
          outline: 0;
          background: #fbfafc;
          font-size: 11px;
        }

        .vd-auth-message {
          padding: 10px;
          border-radius: 9px;
          background: #fff2f5;
          color: #cf2857;
          font-size: 10px;
          line-height: 1.4;
        }

        .vd-auth-form button:disabled {
          opacity: .6;
          cursor: wait;
        }

        .vd-menu-overlay {
          display: flex;
          justify-content: flex-start;
        }

        .vd-side-menu {
          width: min(335px, 88vw);
          height: 100%;
          padding: 16px;
          overflow-y: auto;
          background: #fff;
          box-shadow: 15px 0 45px rgba(20,10,28,.18);
        }

        .vd-menu-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 17px;
        }

        .vd-menu-top button {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 11px;
          background: #f5f2f7;
          color: #5f5666;
        }

        .vd-menu-logo {
          margin-right: auto;
          margin-left: 11px;
          font-size: 21px;
          font-weight: 900;
          letter-spacing: -.7px;
        }

        .vd-menu-logo span {
          color: #ed214e;
        }

        .vd-menu-logo strong {
          color: #7232c6;
        }

        .vd-menu-user {
          width: 100%;
          display: grid;
          grid-template-columns: 44px 1fr 18px;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 1px solid #eee9f1;
          border-radius: 15px;
          background: #faf8fb;
          text-align: left;
        }

        .vd-menu-user-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #f0e7ff;
          color: #7433c7;
        }

        .vd-menu-user div {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .vd-menu-user strong {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
        }

        .vd-menu-user small {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #8b8390;
          font-size: 9px;
        }

        .vd-menu-user b {
          color: #958c9c;
          font-size: 20px;
        }

        .vd-menu-links {
          display: grid;
          gap: 4px;
          margin-top: 17px;
        }

        .vd-menu-links button {
          width: 100%;
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 11px;
          border: 0;
          border-radius: 11px;
          background: transparent;
          color: #4f4755;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
        }

        .vd-menu-links button:hover {
          background: #f7f3fa;
          color: #7332c6;
        }

        .vd-menu-signout {
          width: 100%;
          height: 42px;
          margin-top: 15px;
          border: 1px solid #f0cbd5;
          border-radius: 11px;
          background: #fff7f9;
          color: #d32658;
          font-size: 10px;
          font-weight: 800;
        }

        .vd-chat {
          position: fixed;
          z-index: 95;
          right: 15px;
          bottom: 87px;
          width: 51px;
          height: 51px;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            #ed254e,
            #7633c8
          );
          color: #fff;
          box-shadow: 0 9px 25px rgba(121,35,146,.26);
        }

        @media (min-width: 700px) {
          .vd-header {
            grid-template-columns: 70px 1fr 110px;
            padding: 0 24px;
          }

          .vd-search-section,
          .vd-main-cards,
          .vd-section,
          .vd-benefits {
            padding-left: 24px;
            padding-right: 24px;
          }

          .vd-offer {
            margin-left: 24px;
            margin-right: 24px;
          }

          .vd-category-row {
            grid-template-columns: repeat(6, 1fr);
          }

          .vd-product-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }

          .vd-benefits {
            grid-template-columns: repeat(4, 1fr);
          }

          .vd-product-detail {
            grid-template-columns: minmax(0, 1fr) minmax(0, .9fr);
            align-items: start;
          }

          .vd-checkout-layout {
            grid-template-columns: minmax(0, 1.35fr) minmax(300px, .65fr);
            align-items: start;
          }

          .vd-checkout-form {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 430px) {
          .vd-main-cards {
            gap: 8px;
          }

          .vd-main-card {
            min-height: 118px;
            padding: 13px 10px;
            gap: 7px;
          }

          .vd-main-icon {
            width: 40px;
            height: 40px;
            flex-basis: 40px;
          }

          .vd-main-copy strong {
            font-size: 13px;
          }

          .vd-main-copy small {
            font-size: 9px;
          }

          .vd-offer-text {
            width: 55%;
            padding-left: 17px;
          }

          .vd-offer-text h2 {
            font-size: 23px;
          }

          .vd-offer-watch {
            right: 75px;
          }

          .vd-offer-shoe {
            right: 62px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
