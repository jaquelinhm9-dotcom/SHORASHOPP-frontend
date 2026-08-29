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
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

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
    (item) => Number(item.id) === Number(product.id)
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
    (item) => Number(item.id) !== Number(productId)
  );

  saveCart(cart);
}

function updateCartQuantity(productId, quantity) {
  const cart = getCart();

  const item = cart.find(
    (entry) => Number(entry.id) === Number(productId)
  );

  if (!item) return;

  item.quantity = Math.max(
    1,
    Number(quantity) || 1
  );

  saveCart(cart);
}

function formatPrice(value) {
  return `$${Number(value).toLocaleString("es-MX")}.00`;
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
          <circle cx="10.8" cy="10.8" r="6.2" />
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
          <rect x="7" y="2.7" width="10" height="18.6" rx="2" />
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
          <rect x="4" y="4" width="6" height="6" rx="1" />
          <rect x="14" y="4" width="6" height="6" rx="1" />
          <rect x="4" y="14" width="6" height="6" rx="1" />
          <rect x="14" y="14" width="6" height="6" rx="1" />
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
        <Icon name="menu" size={25} stroke={1.9} />
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
          <i>{cartCount}</i>
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
            onToggleFavorite(Number(product.id))
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

function FeaturedProducts({
  favorites,
  onToggleFavorite,
}) {
  return (
    <section
      id="vd-products"
      className="vd-section vd-products-section"
    >
      <div className="vd-section-title">
        <h2>Productos destacados</h2>

        <Link to="/catalogo">
          Ver todos
          <span>›</span>
        </Link>
      </div>

      <div className="vd-product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </section>
  );
}

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

        <strong>Compra segura</strong>
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

        <strong>Envíos rápidos</strong>
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

        <strong>Vendedores</strong>
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

        <strong>Soporte 24/7</strong>
        <small>
          Estamos aquí
          <br />
          para ayudarte
        </small>
      </div>
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

    return products.filter((product) =>
      [
        product.name,
        product.category,
        product.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  const showProducts = search.trim()
    ? visibleProducts
    : products;

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

      <section
        id={
          search.trim()
            ? undefined
            : "vd-featured"
        }
        className="vd-section vd-products-section"
      >
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
          {showProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>

        {showProducts.length === 0 && (
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
    }
  }, [location.search]);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        activeCategory === "Todos" ||
        product.category === activeCategory;

      const matchesSearch =
        !search.trim() ||
        [
          product.name,
          product.category,
          product.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
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
              onToggleFavorite={onToggleFavorite}
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

  const total = items.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity || 1),
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
  const [step, setStep] = useState(1);
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
      Number(item.price) *
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
    return Object.values(shipping).every(
      (value) => String(value).trim()
    );
  }

  function finishPurchase() {
    saveCart([]);
    setItems([]);
    setCompleted(true);
    setStep(3);
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
                <button
                  type="button"
                  className={`vd-payment-option ${
                    payment === "card"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setPayment("card")
                  }
                >
                  <span className="vd-payment-radio" />
                  <div>
                    <strong>
                      Tarjeta
                    </strong>
                    <small>
                      Crédito o débito
                    </small>
                  </div>
                </button>

                <button
                  type="button"
                  className={`vd-payment-option ${
                    payment === "transfer"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setPayment("transfer")
                  }
                >
                  <span className="vd-payment-radio" />
                  <div>
                    <strong>
                      Transferencia
                    </strong>
                    <small>
                      Pago mediante transferencia
                    </small>
                  </div>
                </button>

                <button
                  type="button"
                  className={`vd-payment-option ${
                    payment === "cash"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    setPayment("cash")
                  }
                >
                  <span className="vd-payment-radio" />
                  <div>
                    <strong>
                      Pago en efectivo
                    </strong>
                    <small>
                      Disponible según el vendedor
                    </small>
                  </div>
                </button>
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
                    : payment === "transfer"
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
}function Favorites({
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
        <p>GUARDADOS</p>
        <h1>Mis favoritos</h1>
      </div>

      {favoriteProducts.length === 0 ? (
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
            Guarda los productos que más te
            gusten para encontrarlos aquí.
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
}) {
  return (
    <main className="vd-page">
      <div className="vd-page-title">
        <p>MI PERFIL</p>
        <h1>Mi cuenta</h1>
      </div>

      {user ? (
        <div className="vd-account-page-card">
          <div className="vd-account-avatar">
            {String(
              user.email || "V"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          <h2>
            {user.user_metadata
              ?.full_name ||
              "Usuario VaniDaxi"}
          </h2>

          <p>
            {user.email}
          </p>

          <button
            type="button"
            className="vd-gradient-button"
            onClick={async () => {
              await supabase.auth.signOut();
            }}
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className="vd-empty">
          <div className="vd-empty-icon">
            <Icon
              name="user"
              size={44}
            />
          </div>

          <h2>
            Inicia sesión
          </h2>

          <p>
            Accede a tus compras, favoritos y
            información de tu cuenta.
          </p>

          <button
            type="button"
            className="vd-gradient-button"
            onClick={onOpenAuth}
          >
            Iniciar sesión
          </button>
        </div>
      )}
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
            <i>
              {cartCount}
            </i>
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

function SideMenu({
  open,
  onClose,
  onAccount,
  onSell,
  user,
}) {
  const navigate = useNavigate();

  if (!open) return null;

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
        <div className="vd-side-menu-header">
          <Link
            to="/"
            className="vd-brand vd-menu-brand"
            onClick={onClose}
          >
            <span>Vani</span>
            <strong>Daxi</strong>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <Icon
              name="close"
              size={24}
            />
          </button>
        </div>

        <button
          type="button"
          className="vd-menu-profile"
          onClick={() => {
            onAccount();
            onClose();
          }}
        >
          <span className="vd-menu-profile-icon">
            <Icon
              name="user"
              size={24}
            />
          </span>

          <div>
            <strong>
              {user
                ? "Mi cuenta"
                : "Hola, bienvenido"}
            </strong>

            <small>
              {user
                ? user.email
                : "Inicia sesión o regístrate"}
            </small>
          </div>

          <span>›</span>
        </button>

        <div className="vd-menu-links">
          <button
            type="button"
            onClick={() =>
              go("/")
            }
          >
            <Icon
              name="home"
              size={21}
            />
            Inicio
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
            Explorar productos
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
            Mis favoritos
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
            Mi carrito
          </button>

          <button
            type="button"
            onClick={() => {
              onSell();
              onClose();
            }}
          >
            <Icon
              name="store"
              size={21}
            />
            Vender en VaniDaxi
          </button>
        </div>

        <div className="vd-menu-bottom">
          <small>
            VaniDaxi
          </small>

          <span>
            Todo en un solo lugar
          </span>
        </div>
      </aside>
    </div>
  );
}

function AuthModal({
  open,
  onClose,
}) {
  const [mode, setMode] =
    useState("login");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [name, setName] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  if (!open) return null;

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

        if (error) {
          throw error;
        }

        onClose();
      } else {
        const { error } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
              },
            },
          });

        if (error) {
          throw error;
        }

        setMessage(
          "Cuenta creada. Revisa tu correo para confirmar tu registro."
        );
      }
    } catch (error) {
      const text =
        String(error?.message || "")
          .toLowerCase();

      if (
        text.includes(
          "invalid login credentials"
        )
      ) {
        setMessage(
          "Correo o contraseña incorrectos."
        );
      } else if (
        text.includes(
          "user already registered"
        )
      ) {
        setMessage(
          "Este correo ya tiene una cuenta."
        );
      } else {
        setMessage(
          error?.message ||
            "Ocurrió un problema. Inténtalo nuevamente."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="vd-modal-overlay"
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
            size={23}
          />
        </button>

        <div className="vd-auth-header">
          <div className="vd-auth-logo">
            <span>Vani</span>
            <strong>Daxi</strong>
          </div>

          <h2>
            {mode === "login"
              ? "Bienvenido"
              : "Crea tu cuenta"}
          </h2>

          <p>
            {mode === "login"
              ? "Ingresa para continuar en VaniDaxi."
              : "Únete a VaniDaxi y disfruta de todas sus funciones."}
          </p>
        </div>

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
                value={name}
                onChange={(event) =>
                  setName(
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
              ? "Procesando..."
              : mode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}function SellerPage({
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
                Muestra lo que vendes a miles
                de compradores.
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

        if (error) {
          throw error;
        }

        onClose();
      } else {
        const {
          data,
          error,
        } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name:
                  fullName,
              },
            },
          });

        if (error) {
          throw error;
        }

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

      if (
        errorMessage.includes(
          "Invalid login credentials"
        )
      ) {
        setMessage(
          "Correo o contraseña incorrectos."
        );
      } else if (
        errorMessage.includes(
          "User already registered"
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
    useState(() =>
      getCart().reduce(
        (total, item) =>
          total +
          Number(
            item.quantity || 1
          ),
        0
      )
    );

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
      const count =
        getCart().reduce(
          (total, item) =>
            total +
            Number(
              item.quantity || 1
            ),
          0
        );

      setCartCount(count);
    };

    window.addEventListener(
      "vanidaxi-cart-change",
      updateCartCount
    );

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

    return () =>
      window.removeEventListener(
        "vanidaxi-favorites-change",
        updateFavorites
      );
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data,
      } =
        await supabase.auth.getSession();

      if (mounted) {
        setUser(
          data.session?.user ||
            null
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

    const exists =
      current.includes(
        Number(productId)
      );

    const next = exists
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
        /* Los estilos completos continúan en la siguiente parte */
      `}</style>
    </div>
  );
}

export default App;
