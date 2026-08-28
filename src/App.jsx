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

function AccountPage({
  user,
  onOpenAuth,
  onSignOut,
}) {
  return (
    <main className="vd-page">
      <div className="vd-account-page">
        <div className="vd-account-icon">
          <Icon name="user" size={42} />
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

function SellerPage({ onOpenAuth, user }) {
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
          Comienza a vender tus productos
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

function FavoritesPage({
  favorites,
  onToggleFavorite,
}) {
  const favoriteProducts =
    products.filter((product) =>
      favorites.includes(Number(product.id))
    );

  return (
    <main className="vd-page">
      <div className="vd-page-title">
        <p>MIS FAVORITOS</p>
        <h1>Favoritos</h1>
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
            Toca el corazón de un producto
            para guardarlo.
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
        <span>
          <span className="vd-home-symbol">
            ⌂
          </span>
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

function MenuOverlay({
  onClose,
  onAccount,
  onSell,
  user,
  onSignOut,
}) {
  const location = useLocation();

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
            aria-label="Cerrar menú"
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

  async function handleSubmit(event) {
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
          aria-label="Cerrar"
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
                setEmail(event.target.value)
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
                setPassword(event.target.value)
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

function App() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [sellOpen, setSellOpen] =
    useState(false);

  const [headerHidden, setHeaderHidden] =
    useState(false);

  const [user, setUser] = useState(null);

  const [cartCount, setCartCount] =
    useState(() =>
      getCart().reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 1),
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
          data?.session?.user || null
        );
      })
      .catch(() => {});

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
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
      const count = getCart().reduce(
        (sum, item) =>
          sum +
          Number(item.quantity || 1),
        0
      );

      setCartCount(count);
    };

    const updateFavorites = () => {
      setFavorites(getFavorites());
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
    let lastScroll = window.scrollY || 0;

    const handleScroll = () => {
      const current =
        window.scrollY || 0;

      if (current < 16) {
        setHeaderHidden(false);
      } else if (current > lastScroll + 5) {
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
      { passive: true }
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

  function toggleFavorite(productId) {
    const current = getFavorites();

    const next = current.includes(
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
          alert(
            "Soporte VaniDaxi"
          )
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

        /* ================= HEADER ================= */

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

          background: rgba(255, 255, 255, .97);
          border-bottom: 1px solid #efedf0;

          backdrop-filter: blur(15px);

          transition:
            transform .25s ease,
            opacity .25s ease;
        }

        .vd-header-hidden {
          transform: translateY(-110%);
          opacity: .98;
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
          color: #5d1d9d;
        }

        .vd-brand strong {
          color: #e91450;
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
          color: #ffffff;

          font-size: 8px;
          line-height: 1;
          font-style: normal;
          font-weight: 900;
        }

        /* ================= SEARCH ================= */

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

          background: #ffffff;

          color: #77737d;

          box-shadow:
            0 4px 13px rgba(48, 29, 67, .04);
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

          color: #ffffff;
        }

        /* ================= MAIN CARDS ================= */

        .vd-main-cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;

          margin-bottom: 17px;
        }

        .vd-main-card {
          position: relative;

          width: 100%;
          min-width: 0;
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
          color: #ffffff;

          box-shadow:
            0 5px 12px rgba(83, 16, 99, .10);

          transition:
            transform .15s ease,
            box-shadow .15s ease;
        }

        .vd-main-card:active {
          transform: scale(.985);
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

          background: rgba(255, 255, 255, .97);
          color: #df174f;

          box-shadow:
            0 2px 6px rgba(0, 0, 0, .05);
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

          color: rgba(255, 255, 255, .91);

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

          background: rgba(255, 255, 255, .96);
          color: #742091;
        }

        /* ================= SECTION HEADINGS ================= */

        .vd-section {
          margin-bottom: 15px;
        }

        .vd-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;

          margin-bottom: 8px;
        }

        .vd-section-title h2 {
          margin: 0;

          color: #222129;

          font-size: 14px;
          line-height: 1.1;
          font-weight: 900;

          letter-spacing: -.2px;
        }

        .vd-section-title a {
          color: #dd1653;

          font-size: 8px;
          font-weight: 850;
        }

        .vd-section-title a span {
          margin-left: 2px;

          font-size: 13px;
          vertical-align: -1px;
        }

        /* ================= CATEGORIES ================= */

        .vd-category-row {
          display: flex;
          gap: 7px;

          overflow-x: auto;

          padding: 2px 1px 4px;

          scrollbar-width: none;
        }

        .vd-category-row::-webkit-scrollbar {
          display: none;
        }

        .vd-category {
          flex: 0 0 58px;

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 4px;
        }

        .vd-category-icon {
          width: 51px;
          height: 51px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid rgba(100, 87, 113, .06);
          border-radius: 10px;

          background:
            linear-gradient(
              145deg,
              #ffffff,
              #faf6fb
            );

          color: #ee1653;

          box-shadow:
            0 3px 9px rgba(41, 26, 59, .035);
        }

        .vd-category-purple {
          color: #7620a7;
        }

        .vd-category > span {
          width: 58px;

          text-align: center;

          color: #3b3940;

          font-size: 7px;
          line-height: 1.08;
          font-weight: 750;
        }

        /* ================= OFFER ================= */

        .vd-offer {
          position: relative;

          width: 100%;
          height: 145px;

          display: grid;
          grid-template-columns: 42% 58%;

          overflow: hidden;

          border-radius: 11px;

          background:
            radial-gradient(
              circle at 76% 22%,
              rgba(255,255,255,.18),
              transparent 18%
            ),
            linear-gradient(
              115deg,
              #f11954 0%,
              #d50f82 49%,
              #6920aa 100%
            );

          color: #ffffff;

          box-shadow:
            0 8px 16px rgba(106, 17, 106, .11);
        }

        .vd-offer-text {
          position: relative;
          z-index: 5;

          padding: 19px 4px 10px 16px;
        }

        .vd-offer-text h2 {
          margin: 0;

          font-size: 18px;
          line-height: .98;
          font-weight: 950;
          letter-spacing: -.4px;
        }

        .vd-offer-text p {
          margin: 7px 0 9px;

          font-size: 8px;
          line-height: 1.27;
        }

        .vd-offer-button {
          min-height: 26px;
          padding: 0 10px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 2px;

          border-radius: 999px;

          background: #ffffff;

          color: #dd1657;

          font-size: 8px;
          font-weight: 900;
        }

        .vd-offer-button span {
          font-size: 13px;
          line-height: 1;
        }

        .vd-offer-art {
          position: relative;
          overflow: hidden;
        }

        .vd-sale-circle {
          position: absolute;

          width: 4px;
          height: 4px;

          border-radius: 50%;

          background: rgba(255,255,255,.65);
        }

        .vd-sale-one {
          left: 23px;
          top: 28px;
        }

        .vd-sale-two {
          left: 77px;
          top: 21px;
          background: #ffd650;
        }

        .vd-sale-three {
          right: 22px;
          top: 38px;
          background: #ff7ea3;
        }

        .vd-offer-bag {
          position: absolute;
          left: 73px;
          top: 27px;

          width: 58px;
          height: 78px;

          border-radius: 8px 8px 10px 10px;

          background:
            linear-gradient(
              135deg,
              #ea49b7,
              #9a3fd0
            );

          box-shadow:
            0 8px 15px rgba(31, 0, 53, .15);

          transform: rotate(5deg);
        }

        .vd-bag-handle {
          position: absolute;
          left: 8px;
          top: -17px;

          width: 41px;
          height: 29px;

          border: 2px solid rgba(255,255,255,.78);
          border-bottom: 0;
          border-radius: 24px 24px 0 0;
        }

        .vd-offer-watch {
          position: absolute;
          left: 4px;
          bottom: 9px;

          width: 63px;
          height: 71px;

          overflow: hidden;

          border-radius: 12px;

          transform: rotate(4deg);

          box-shadow:
            0 9px 16px rgba(0, 0, 0, .16);

          background: #fff;
        }

        .vd-offer-watch img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vd-offer-shoe {
          position: absolute;
          right: -9px;
          bottom: 1px;

          width: 108px;
          height: 67px;

          overflow: hidden;

          border-radius: 12px;

          transform: rotate(-7deg);

          box-shadow:
            0 9px 16px rgba(0, 0, 0, .15);

          background: #ffffff;
        }

        .vd-offer-shoe img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .vd-percent-bubble {
          position: absolute;
          right: 58px;
          top: 57px;

          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #ff4d78,
              #bd2acb
            );

          color: #ffffff;

          font-size: 23px;
          font-weight: 950;

          transform: rotate(8deg);
        }

        .vd-dots {
          display: flex;
          justify-content: center;
          gap: 5px;

          padding: 6px 0 8px;
        }

        .vd-dots span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #eadfea;
        }

        .vd-dots .active {
          background: #e81959;
        }

        /* ================= PRODUCTS ================= */

        .vd-products-section {
          margin-bottom: 14px;
        }

        .vd-product-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 6px;
        }

        .vd-product-card {
          min-width: 0;

          overflow: hidden;

          border: 1px solid rgba(95, 84, 104, .065);
          border-radius: 8px;

          background: #ffffff;

          box-shadow:
            0 4px 10px rgba(35, 24, 47, .035);
        }

        .vd-product-top {
          height: 0;
          position: relative;
          z-index: 4;
        }

        .vd-product-badge {
          position: absolute;
          top: 5px;
          left: 5px;

          padding: 3px 5px;

          border-radius: 4px;

          background: #e91650;
          color: #ffffff;

          font-size: 6px;
          line-height: 1;
          font-weight: 900;
        }

        .vd-product-badge.vd-new {
          background: #7920a4;
        }

        .vd-favorite {
          position: absolute;
          top: 4px;
          right: 4px;

          width: 19px;
          height: 19px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 0;
          border-radius: 50%;

          background: rgba(255,255,255,.93);
          color: #77737c;
        }

        .vd-favorite-active {
          color: #e71854;
        }

        .vd-product-image {
          display: flex;
          align-items: center;
          justify-content: center;

          width: 100%;
          height: 83px;

          background:
            linear-gradient(
              145deg,
              #fcfcfc,
              #f7f5f8
            );
        }

        .vd-product-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .vd-product-info {
          padding: 5px;
        }

        .vd-product-info h3 {
          min-height: 23px;

          margin: 0 0 3px;

          color: #2e2c33;

          font-size: 6.5px;
          line-height: 1.2;
          font-weight: 850;
        }

        .vd-price {
          display: flex;
          align-items: baseline;
          gap: 3px;

          min-width: 0;

          white-space: nowrap;
        }

        .vd-price strong {
          color: #d9194e;
          font-size: 8px;
          font-weight: 900;
        }

        .vd-price del {
          color: #8d8991;
          font-size: 5.5px;
        }

        .vd-rating {
          margin-top: 3px;

          color: #75717a;

          font-size: 5.5px;
          line-height: 1;
          white-space: nowrap;
        }

        .vd-rating span {
          color: #f1af00;
        }

        .vd-rating b {
          margin: 0 1px;
          color: #b6b2b8;
        }

        .vd-add-button {
          width: 100%;
          height: 19px;

          margin-top: 4px;

          border: 0;
          border-radius: 5px;

          background:
            linear-gradient(
              135deg,
              #f21a54,
              #be24ac
            );

          color: #ffffff;

          font-size: 6.5px;
          font-weight: 900;
        }

        .vd-no-results {
          min-height: 125px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 4px;

          border: 1px solid #f0edf2;
          border-radius: 10px;

          background: #ffffff;

          text-align: center;
        }

        .vd-no-results span {
          font-size: 24px;
        }

        .vd-no-results strong {
          font-size: 11px;
        }

        .vd-no-results small {
          color: #77737c;
          font-size: 8px;
        }

        .vd-no-results-large {
          min-height: 260px;
        }

        /* ================= BENEFITS ================= */

        .vd-benefits {
          display: grid;
          grid-template-columns: repeat(4, 1fr);

          overflow: hidden;

          border: 1px solid rgba(101, 88, 114, .06);
          border-radius: 10px;

          background: #ffffff;

          box-shadow:
            0 4px 11px rgba(40, 28, 55, .035);
        }

        .vd-benefit {
          min-width: 0;

          display: flex;
          flex-direction: column;
          align-items: center;

          padding: 9px 3px;

          text-align: center;
        }

        .vd-benefit > span {
          margin-bottom: 4px;
          color: #e91550;
        }

        .vd-purple-benefit {
          color: #72209e !important;
        }

        .vd-benefit strong {
          display: block;

          color: #35323a;

          font-size: 6.5px;
          line-height: 1.15;
        }

        .vd-benefit small {
          display: block;

          margin-top: 2px;

          color: #77737a;

          font-size: 5.6px;
          line-height: 1.18;
        }

        .vd-bottom-space {
          height: 12px;
        }

        /* ================= BOTTOM NAV ================= */

        .vd-bottom-nav {
          position: fixed;
          left: 50%;
          bottom: 0;
          z-index: 75;

          transform: translateX(-50%);

          width: min(100%, 560px);
          height: 67px;

          display: grid;
          grid-template-columns: repeat(5, 1fr);
          align-items: end;

          padding:
            4px 7px
            max(5px, env(safe-area-inset-bottom));

          background: rgba(255,255,255,.98);

          border-top: 1px solid #efedf0;

          box-shadow:
            0 -5px 15px rgba(35, 25, 45, .035);

          backdrop-filter: blur(12px);
        }

        .vd-nav-item {
          min-width: 0;
          height: 54px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;

          border: 0;
          background: transparent;

          color: #7b7680;

          font-size: 8px;

          text-align: center;
        }

        .vd-nav-item small,
        .vd-sell-nav small {
          font-size: 6.5px;
          font-weight: 800;
        }

        .vd-nav-active {
          color: #e61853 !important;
        }

        .vd-home-symbol {
          display: flex;
          align-items: center;
          justify-content: center;

          font-size: 23px;
          line-height: 1;
        }

        .vd-sell-nav {
          width: 50px;
          height: 50px;

          justify-self: center;

          margin-top: -21px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1px;

          border: 0;
          border-radius: 17px;

          background:
            linear-gradient(
              145deg,
              #ef1852,
              #7a179f
            );

          color: #ffffff;

          box-shadow:
            0 7px 15px rgba(135, 18, 103, .20);
        }

        .vd-sell-nav span {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* ================= CHAT ================= */

        .vd-chat {
          position: fixed;

          right:
            max(
              12px,
              calc(
                (100vw - 560px) / 2 + 12px
              )
            );

          bottom: 76px;

          z-index: 73;

          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 0;
          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #ed174f,
              #74179e
            );

          color: #ffffff;

          box-shadow:
            0 6px 14px rgba(124, 19, 106, .17);
        }

        /* ================= GENERIC PAGES ================= */

        .vd-page {
          width: 100%;
          min-height: calc(100vh - 131px);

          padding: 18px 15px 22px;
        }

        .vd-page-title {
          margin-bottom: 14px;
        }

        .vd-page-title p,
        .vd-account-page > p,
        .vd-seller-page > p {
          margin: 0 0 4px;

          color: #86828b;

          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.8px;
        }

        .vd-page-title h1 {
          margin: 0;

          color: #28262e;

          font-size: 23px;
          line-height: 1.05;
          font-weight: 900;
        }

        .vd-catalog-search {
          width: 100%;
          height: 40px;

          display: flex;
          align-items: center;
          gap: 7px;

          margin-bottom: 10px;
          padding: 0 11px;

          border: 1px solid #ece8ef;
          border-radius: 10px;

          background: #ffffff;
        }

        .vd-catalog-search input {
          flex: 1;

          border: 0;
          outline: 0;

          font-size: 10px;
        }

        .vd-filters {
          display: flex;
          gap: 5px;

          overflow-x: auto;

          margin-bottom: 13px;

          scrollbar-width: none;
        }

        .vd-filters::-webkit-scrollbar {
          display: none;
        }

        .vd-filters button {
          flex: 0 0 auto;

          min-height: 25px;
          padding: 0 9px;

          border: 1px solid #ece8ef;
          border-radius: 999px;

          background: #ffffff;

          color: #706b75;

          font-size: 7px;
          font-weight: 700;
        }

        .vd-filters button.active {
          border-color: transparent;

          background:
            linear-gradient(
              135deg,
              #ed184f,
              #71169d
            );

          color: #ffffff;
        }

        .vd-catalog-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .vd-catalog-grid .vd-product-image {
          height: 135px;
        }

        .vd-detail-back {
          margin-bottom: 10px;
        }

        .vd-detail-back a {
          display: inline-flex;
          align-items: center;
          gap: 4px;

          color: #75209f;

          font-size: 9px;
          font-weight: 800;
        }

        .vd-detail-back span {
          font-size: 16px;
        }

        .vd-product-detail {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          align-items: start;
        }

        .vd-detail-image {
          position: relative;

          min-height: 265px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 16px;

          background:
            linear-gradient(
              145deg,
              #fbfafc,
              #f4f0f7
            );
        }

        .vd-detail-image img {
          width: 100%;
          height: 100%;
          min-height: 265px;

          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .vd-detail-badge {
          position: absolute;
          left: 9px;
          top: 9px;

          padding: 4px 7px;

          border-radius: 5px;

          background: #e7164e;
          color: #ffffff;

          font-size: 7px;
          font-weight: 900;
        }

        .vd-detail-badge.vd-new {
          background: #75209e;
        }

        .vd-detail-info > small {
          color: #7d7782;
          font-size: 8px;
          font-weight: 750;
        }

        .vd-detail-info h1 {
          margin: 7px 0 6px;

          color: #29272f;

          font-size: 21px;
          line-height: 1.06;
        }

        .vd-detail-rating {
          color: #77727b;
          font-size: 8px;
        }

        .vd-detail-rating:first-letter {
          color: #f0ac00;
        }

        .vd-detail-rating span {
          margin: 0 3px;
          color: #c0bbc1;
        }

        .vd-detail-price {
          margin: 12px 0 10px;

          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .vd-detail-price strong {
          color: #db164d;
          font-size: 21px;
        }

        .vd-detail-price del {
          color: #8c8790;
          font-size: 8px;
        }

        .vd-detail-info > p {
          margin: 0 0 13px;

          color: #77727b;

          font-size: 9px;
          line-height: 1.5;
        }

        .vd-detail-actions {
          display: flex;
          gap: 7px;
        }

        .vd-gradient-button {
          min-height: 38px;
          padding: 0 14px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          border: 0;
          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #ed174e,
              #74179d
            );

          color: #ffffff;

          font-size: 9px;
          font-weight: 900;

          box-shadow:
            0 6px 13px rgba(126, 18, 101, .11);
        }

        .vd-detail-actions .vd-gradient-button {
          flex: 1;
        }

        .vd-detail-favorite {
          width: 39px;
          min-width: 39px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 1px solid #ece8ef;
          border-radius: 9px;

          background: #ffffff;
          color: #716c75;
        }

        .vd-detail-favorite.active {
          color: #e71854;
        }

        .vd-specifications {
          margin-top: 18px;
        }

        .vd-specifications h2 {
          margin: 0 0 8px;

          font-size: 12px;
        }

        .vd-spec-row {
          display: flex;
          gap: 7px;

          padding: 6px 0;

          border-bottom: 1px solid #f3eff5;

          color: #6e6972;

          font-size: 8px;
        }

        .vd-spec-row span {
          color: #e61955;
          font-weight: 900;
        }

        /* ================= CART ================= */

        .vd-cart-list {
          display: grid;
          gap: 8px;
        }

        .vd-cart-item {
          display: grid;
          grid-template-columns: 67px 1fr;
          gap: 9px;

          min-height: 82px;

          padding: 8px;

          border: 1px solid #eeeaf0;
          border-radius: 11px;

          background: #ffffff;

          box-shadow:
            0 3px 9px rgba(35, 25, 45, .025);
        }

        .vd-cart-image {
          width: 67px;
          height: 67px;

          display: flex;
          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 8px;

          background: #faf8fb;
        }

        .vd-cart-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .vd-cart-content {
          min-width: 0;
        }

        .vd-cart-content strong {
          display: block;

          color: #323038;

          font-size: 9px;
          line-height: 1.22;
        }

        .vd-cart-price {
          display: block;

          margin-top: 4px;

          color: #da164b;

          font-size: 9px;
          font-weight: 900;
        }

        .vd-cart-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;

          margin-top: 6px;
        }

        .vd-quantity {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          border: 1px solid #eeeaf1;
          border-radius: 999px;

          padding: 2px 5px;
        }

        .vd-quantity button {
          width: 18px;
          height: 18px;

          border: 0;
          border-radius: 50%;

          background: #f6f1f8;
          color: #6d218f;
        }

        .vd-quantity span {
          font-size: 8px;
          font-weight: 800;
        }

        .vd-remove {
          border: 0;
          background: transparent;

          color: #9b5969;

          font-size: 7px;
          font-weight: 750;
        }

        .vd-cart-total {
          margin-top: 10px;

          min-height: 52px;
          padding: 0 13px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #ee1750,
              #74169d
            );

          color: #ffffff;
        }

        .vd-cart-total span {
          font-size: 10px;
          font-weight: 700;
        }

        .vd-cart-total strong {
          font-size: 16px;
          font-weight: 900;
        }

        .vd-checkout-button {
          width: 100%;

          height: 42px;

          margin-top: 9px;

          border: 0;
          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #ef174f,
              #75169f
            );

          color: white;

          font-size: 9px;
          font-weight: 900;
        }

        .vd-continue-shopping {
          width: 100%;

          min-height: 38px;

          margin-top: 7px;

          border: 0;
          border-radius: 9px;

          background: #f6f2f8;
          color: #6e218e;

          font-size: 8px;
          font-weight: 900;
        }

        /* ================= EMPTY ================= */

        .vd-empty {
          min-height: 340px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;
        }

        .vd-empty-icon,
        .vd-account-icon {
          width: 72px;
          height: 72px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 10px;

          border-radius: 19px;

          background:
            linear-gradient(
              135deg,
              #fff0f5,
              #f1e8fb
            );

          color: #76209f;
        }

        .vd-empty h2 {
          margin: 0 0 6px;

          font-size: 16px;
        }

        .vd-empty p {
          margin: 0 0 14px;

          color: #77737b;

          font-size: 8px;
        }

        /* ================= ACCOUNT / SELLER ================= */

        .vd-account-page,
        .vd-seller-page {
          min-height: 390px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;
        }

        .vd-account-page h1,
        .vd-seller-page h1 {
          max-width: 290px;

          margin: 0 0 8px;

          color: #2a2830;

          font-size: 23px;
          line-height: 1.08;
          font-weight: 900;
        }

        .vd-account-page > span,
        .vd-seller-page > span {
          max-width: 300px;

          margin-bottom: 15px;

          color: #77737c;

          font-size: 9px;
          line-height: 1.4;
        }

        /* ================= OVERLAYS ================= */

        .vd-overlay {
          position: fixed;
          inset: 0;

          z-index: 100;

          background: rgba(19, 13, 23, .45);

          backdrop-filter: blur(4px);
        }

        .vd-centered {
          display: flex;
          align-items: center;
          justify-content: center;

          padding: 16px;
        }

        .vd-side-menu {
          width: min(82%, 305px);
          height: 100%;

          padding: 17px 16px;

          background: #ffffff;

          box-shadow:
            12px 0 28px rgba(0,0,0,.12);

          animation:
            vd-slide-menu .22s ease both;
        }

        @keyframes vd-slide-menu {
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

          margin-bottom: 12px;
          padding-bottom: 12px;

          border-bottom: 1px solid #f1eef3;
        }

        .vd-menu-brand {
          display: block;

          font-size: 22px;
          line-height: 1;
          letter-spacing: -1px;
          font-weight: 900;
        }

        .vd-menu-brand span {
          color: #6420a0;
        }

        .vd-menu-brand strong {
          color: #e91752;
        }

        .vd-menu-head small {
          display: block;
          margin-top: 5px;

          color: #7c7680;

          font-size: 7px;
        }

        .vd-menu-close,
        .vd-modal-close {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: 0;
          background: transparent;

          color: #5f5962;
        }

        .vd-menu-link {
          width: 100%;
          min-height: 39px;

          display: flex;
          align-items: center;
          gap: 9px;

          padding: 0 6px;

          border: 0;
          border-bottom: 1px solid #f3f0f4;

          background: transparent;

          color: #3f3a42;

          font-size: 10px;
          font-weight: 800;

          text-align: left;
        }

        .vd-menu-link-active {
          color: #dd1751;
        }

        .vd-menu-signout {
          margin-top: 10px;
          color: #9f5366;
        }

        /* ================= MODAL ================= */

        .vd-modal {
          width: min(100%, 335px);

          position: relative;

          padding: 22px 18px 18px;

          border-radius: 18px;

          background: #ffffff;

          box-shadow:
            0 17px 40px rgba(0,0,0,.15);

          text-align: center;
        }

        .vd-modal-close {
          position: absolute;
          top: 5px;
          right: 5px;
        }

        .vd-modal-icon {
          width: 58px;
          height: 58px;

          margin: 0 auto 9px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 17px;

          background:
            linear-gradient(
              135deg,
              #ed174e,
              #77189f
            );

          color: #ffffff;
        }

        .vd-modal h2 {
          margin: 0 0 6px;

          color: #28262e;

          font-size: 19px;
        }

        .vd-modal p {
          margin: 0 0 13px;

          color: #77727c;

          font-size: 9px;
          line-height: 1.45;
        }

        .vd-auth-form {
          display: grid;
          gap: 8px;

          text-align: left;
        }

        .vd-auth-form label {
          display: grid;
          gap: 4px;

          color: #615b65;

          font-size: 8px;
          font-weight: 800;
        }

        .vd-auth-form input {
          width: 100%;
          height: 38px;

          padding: 0 10px;

          border: 1px solid #ebe7ef;
          border-radius: 8px;

          outline: 0;

          background: #ffffff;
          color: #36323a;

          font-size: 9px;
        }

        .vd-auth-form input:focus {
          border-color: #bd54c7;

          box-shadow:
            0 0 0 3px rgba(189,84,199,.08);
        }

        .vd-auth-message {
          padding: 7px 8px;

          border-radius: 7px;

          background: #faf0f4;

          color: #8d4c5e;

          font-size: 8px;
          line-height: 1.35;
        }

        .vd-full-button {
          width: 100%;
        }

        .vd-light-button {
          width: 100%;
          min-height: 39px;

          margin-top: 7px;

          border: 0;
          border-radius: 9px;

          background: #f7f2f9;

          color: #6e228e;

          font-size: 8px;
          font-weight: 900;
        }

        /* ================= RESPONSIVE ================= */

        @media (max-width: 430px) {
          .vd-app {
            max-width: 100%;
          }

          .vd-home {
            padding-left: 12px;
            padding-right: 12px;
          }

          .vd-header {
            grid-template-columns: 42px 1fr 82px;
            padding-left: 8px;
            padding-right: 8px;
          }

          .vd-brand {
            font-size: 24px;
          }

          .vd-main-card {
            height: 67px;
          }

          .vd-main-icon {
            width: 36px;
            height: 36px;
          }

          .vd-category {
            flex-basis: 57px;
          }

          .vd-category-icon {
            width: 50px;
            height: 50px;
          }

          .vd-product-image {
            height: 81px;
          }
        }

        @media (max-width: 370px) {
          .vd-home {
            padding-left: 10px;
            padding-right: 10px;
          }

          .vd-product-grid {
            gap: 5px;
          }

          .vd-product-image {
            height: 77px;
          }

          .vd-main-copy strong {
            font-size: 9.5px;
          }

          .vd-main-copy small {
            font-size: 6.5px;
          }

          .vd-offer {
            height: 142px;
          }

          .vd-category {
            flex-basis: 55px;
          }

          .vd-category > span {
            width: 55px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
