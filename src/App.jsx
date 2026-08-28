import { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useParams,
} from "react-router-dom";

import { supabase } from "./supabaseClient";

const CART_KEY = "vanidaxi_cart";

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
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=600&q=85",
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
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=85",
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
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=85",
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
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=600&q=85",
  },
];

function Icon({ name, size = 24, stroke = 1.8 }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: stroke,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "menu":
      return (
        <svg {...props}>
          <path d="M4 6h16" />
          <path d="M4 12h16" />
          <path d="M4 18h16" />
        </svg>
      );

    case "search":
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
      );

    case "bell":
      return (
        <svg {...props}>
          <path d="M18 9a6 6 0 0 0-12 0c0 6-2.5 6.5-2.5 8h17c0-1.5-2.5-2-2.5-8" />
          <path d="M10 21h4" />
        </svg>
      );

    case "cart":
      return (
        <svg {...props}>
          <path d="M3 4h2l2.2 10.5h10.4L20 7H6" />
          <circle cx="9" cy="19" r="1.4" />
          <circle cx="17" cy="19" r="1.4" />
        </svg>
      );

    case "store":
      return (
        <svg {...props}>
          <path d="M4 10h16" />
          <path d="m5 10 1.3-5h11.4l1.3 5" />
          <path d="M6.5 10v9h11v-9" />
          <path d="M9 19v-5h6v5" />
        </svg>
      );

    case "user":
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.5" />
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
          <rect x="7" y="2.8" width="10" height="18.4" rx="2" />
          <path d="M10.5 5h3" />
          <circle cx="12" cy="18.2" r=".8" fill="currentColor" stroke="none" />
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
          <path d="M4 13v3.5A2.5 2.5 0 0 0 6.5 19H7v-7H6.5A2.5 2.5 0 0 0 4 14.5" />
          <path d="M20 13v3.5a2.5 2.5 0 0 1-2.5 2.5H17v-7h.5A2.5 2.5 0 0 1 20 14.5" />
        </svg>
      );

    case "game":
      return (
        <svg {...props}>
          <path d="M7 8h10a5 5 0 0 1 5 5v2.5a2.5 2.5 0 0 1-4.3 1.8L15 15H9l-2.7 2.3A2.5 2.5 0 0 1 2 15.5V13a5 5 0 0 1 5-5Z" />
          <path d="M7 11v4" />
          <path d="M5 13h4" />
          <circle cx="17" cy="12" r=".8" fill="currentColor" stroke="none" />
          <circle cx="19" cy="14" r=".8" fill="currentColor" stroke="none" />
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

    default:
      return null;
  }
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("vanidaxi-cart-change"));
}

function addProductToCart(product) {
  const cart = getCart();

  const existing = cart.find(
    (item) => item.id === product.id
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

function Header({ cartCount, onOpenMenu }) {
  return (
    <header className="vd-header">
      <button
        className="vd-menu-button"
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menú"
      >
        <Icon name="menu" size={27} stroke={1.8} />
      </button>

      <Link to="/" className="vd-brand">
        <div>
          <span>Vani</span>
          <strong>Daxi</strong>
        </div>

        <small>
          <b>Compra.</b>
          <b>Vende.</b>
          <span>Descubre.</span>
        </small>
      </Link>

      <div className="vd-header-right">
        <button
          type="button"
          className="vd-header-icon"
          aria-label="Notificaciones"
        >
          <Icon name="bell" size={24} />
          <i>3</i>
        </button>

        <Link
          to="/carrito"
          className="vd-header-icon"
          aria-label="Carrito"
        >
          <Icon name="cart" size={25} />
          <i>{cartCount}</i>
        </Link>
      </div>
    </header>
  );
}

function Home({ onAccount, onSell }) {
  const [search, setSearch] = useState("");

  const visibleProducts = useMemo(() => {
    if (!search.trim()) return products;

    return products.filter((product) =>
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <main className="vd-home">
      <section className="vd-search-section">
        <div className="vd-search-box">
          <Icon name="search" size={26} stroke={1.55} />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="¿Qué estás buscando hoy?"
          />

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("vd-products")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <Icon name="search" size={25} />
          </button>
        </div>
      </section>

      <section className="vd-main-cards">
        <button
          type="button"
          className="vd-main-card vd-sell-card"
          onClick={onSell}
        >
          <span className="vd-main-icon">
            <Icon name="store" size={31} />
          </span>

          <span className="vd-main-copy">
            <strong>
              Vende en
              <br />
              VaniDaxi
            </strong>

            <small>
              Únete y comienza a vender
              <br />
              tus productos hoy
            </small>
          </span>

          <span className="vd-card-arrow">›</span>
        </button>

        <button
          type="button"
          className="vd-main-card vd-account-card"
          onClick={onAccount}
        >
          <span className="vd-main-icon">
            <Icon name="user" size={31} />
          </span>

          <span className="vd-main-copy">
            <strong>Mi cuenta</strong>

            <small>
              Inicia sesión o regístrate
              <br />
              como comprador o vendedor
            </small>
          </span>

          <span className="vd-card-arrow">›</span>
        </button>
      </section>

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
              to="/catalogo"
              className="vd-category"
            >
              <div>
                <Icon
                  name={category.icon}
                  size={35}
                  stroke={1.55}
                />
              </div>

              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

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

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("vd-products")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Ver ofertas
            <span>›</span>
          </button>
        </div>

        <div className="vd-offer-art">
          <div className="vd-offer-bag vd-bag-one" />
          <div className="vd-offer-bag vd-bag-two" />

          <img
            src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=380&q=80"
            alt="Smartwatch"
          />

          <img
            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=380&q=80"
            alt="Tenis"
          />

          <b className="vd-percent">%</b>
        </div>
      </section>

      <div className="vd-dots">
        <span className="active" />
        <span />
        <span />
        <span />
      </div>

      <section
        className="vd-section vd-products-section"
        id="vd-products"
      >
        <div className="vd-section-title">
          <h2>Productos destacados</h2>

          <Link to="/catalogo">
            Ver todos
            <span>›</span>
          </Link>
        </div>

        <div className="vd-product-grid">
          {visibleProducts.map((product) => (
            <ProductCard
              product={product}
              key={product.id}
            />
          ))}
        </div>
      </section>

      <section className="vd-benefits">
        <Benefit
          icon="shield"
          title="Compra segura"
          text="Protegemos tus datos y compras"
        />

        <Benefit
          icon="truck"
          title="Envíos rápidos"
          text="Recibe tus productos en tiempo récord"
        />

        <Benefit
          icon="badge"
          title="Vendedores verificados"
          text="Más confianza para ti"
        />

        <Benefit
          icon="chat"
          title="Soporte 24/7"
          text="Estamos aquí para ayudarte"
        />
      </section>

      <div className="vd-bottom-space" />
    </main>
  );
}

function Benefit({ icon, title, text }) {
  return (
    <div className="vd-benefit">
      <span>
        <Icon name={icon} size={29} stroke={1.6} />
      </span>

      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const [favorite, setFavorite] = useState(false);

  return (
    <article className="vd-product-card">
      <div className="vd-product-top">
        <span
          className={
            product.badgeType === "new"
              ? "vd-product-badge vd-new"
              : "vd-product-badge"
          }
        >
          {product.discount}
        </span>

        <button
          type="button"
          className={
            favorite
              ? "vd-favorite vd-favorite-active"
              : "vd-favorite"
          }
          onClick={() =>
            setFavorite(!favorite)
          }
        >
          <Icon
            name="heart"
            size={22}
            stroke={1.7}
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
            ${product.price.toLocaleString("es-MX")}.00
          </strong>

          {product.oldPrice && (
            <del>
              ${product.oldPrice.toLocaleString("es-MX")}.00
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

function Catalog() {
  const [search, setSearch] = useState("");

  const filtered = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="vd-page">
      <div className="vd-page-title">
        <p>EXPLORA</p>
        <h1>Todos los productos</h1>
      </div>

      <div className="vd-catalog-search">
        <Icon name="search" size={22} />

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar productos..."
        />
      </div>

      <div className="vd-filters">
        <button className="active">
          Todos
        </button>

        {categories.map((category) => (
          <button key={category.name}>
            {category.name}
          </button>
        ))}
      </div>

      <div className="vd-product-grid vd-catalog-grid">
        {filtered.map((product) => (
          <ProductCard
            product={product}
            key={product.id}
          />
        ))}
      </div>
    </main>
  );
}

function ProductPage() {
  const { id } = useParams();

  const product =
    products.find(
      (item) =>
        item.id === Number(id)
    ) || products[0];

  return (
    <main className="vd-page">
      <div className="vd-product-detail">
        <div className="vd-detail-image">
          <img
            src={product.image}
            alt={product.name}
          />
        </div>

        <div className="vd-detail-info">
          <small>
            {product.category || "Producto"}
          </small>

          <h1>{product.name}</h1>

          <strong>
            ${product.price.toLocaleString("es-MX")}.00
          </strong>

          <p>
            Encuentra este producto en
            VaniDaxi.
          </p>

          <button
            type="button"
            className="vd-gradient-button"
            onClick={() =>
              addProductToCart(product)
            }
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </main>
  );
}

function Cart() {
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
          <div>🛒</div>

          <h2>
            Tu carrito está vacío
          </h2>

          <Link
            className="vd-gradient-button"
            to="/catalogo"
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
                <img
                  src={item.image}
                  alt={item.name}
                />

                <div>
                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    $
                    {Number(
                      item.price
                    ).toLocaleString("es-MX")}
                    .00
                  </span>

                  <small>
                    Cantidad:{" "}
                    {item.quantity || 1}
                  </small>
                </div>
              </div>
            ))}
          </div>

          <div className="vd-cart-total">
            <span>Total</span>

            <strong>
              ${total.toLocaleString("es-MX")}.00
            </strong>
          </div>
        </>
      )}
    </main>
  );
}

function AccountPage() {
  return (
    <main className="vd-page">
      <div className="vd-account-page">
        <div className="vd-account-icon">
          <Icon name="user" size={48} />
        </div>

        <p>MI CUENTA</p>

        <h1>
          Compra y vende en VaniDaxi
        </h1>

        <span>
          Inicia sesión o regístrate
          para continuar.
        </span>

        <button className="vd-gradient-button">
          Iniciar sesión
        </button>
      </div>
    </main>
  );
}

function SellerPage() {
  return (
    <main className="vd-page">
      <div className="vd-seller-page">
        <div className="vd-account-icon">
          <Icon name="store" size={46} />
        </div>

        <p>VENDE EN VANIDAXI</p>

        <h1>
          Comienza a vender tus productos
        </h1>

        <span>
          Publica tus productos y llega
          a nuevos compradores.
        </span>

        <button className="vd-gradient-button">
          Publicar producto
        </button>
      </div>
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
            ? "vd-nav-active"
            : ""
        }
      >
        <span>⌂</span>
        <small>Inicio</small>
      </NavLink>

      <NavLink
        to="/catalogo"
        className={({ isActive }) =>
          isActive
            ? "vd-nav-active"
            : ""
        }
      >
        <Icon name="grid" size={24} />
        <small>Categorías</small>
      </NavLink>

      <button
        type="button"
        className="vd-sell-nav"
        onClick={onSell}
      >
        <span>
          <Icon name="store" size={28} />
        </span>

        <small>Vender</small>
      </button>

      <button type="button">
        <Icon name="heart" size={25} />
        <small>Favoritos</small>
      </button>

      <button
        type="button"
        onClick={onAccount}
      >
        <Icon name="user" size={25} />
        <small>Cuenta</small>
      </button>
    </nav>
  );
}

function App() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [accountOpen, setAccountOpen] =
    useState(false);

  const [sellOpen, setSellOpen] =
    useState(false);

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

  useEffect(() => {
    const updateCart = () => {
      const count = getCart().reduce(
        (sum, item) =>
          sum +
          Number(
            item.quantity || 1
          ),
        0
      );

      setCartCount(count);
    };

    window.addEventListener(
      "vanidaxi-cart-change",
      updateCart
    );

    return () =>
      window.removeEventListener(
        "vanidaxi-cart-change",
        updateCart
      );
  }, []);

  function openAccount() {
    setAccountOpen(true);
  }

  function openSell() {
    setSellOpen(true);
  }

  return (
    <div className="vd-app">
      <Header
        cartCount={cartCount}
        onOpenMenu={() =>
          setMenuOpen(true)
        }
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              onAccount={openAccount}
              onSell={openSell}
            />
          }
        />

        <Route
          path="/catalogo"
          element={<Catalog />}
        />

        <Route
          path="/producto/:id"
          element={<ProductPage />}
        />

        <Route
          path="/carrito"
          element={<Cart />}
        />

        <Route
          path="/cuenta"
          element={<AccountPage />}
        />

        <Route
          path="/vender"
          element={<SellerPage />}
        />

        <Route
          path="*"
          element={
            <Home
              onAccount={openAccount}
              onSell={openSell}
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
      >
        <Icon
          name="chat"
          size={28}
          stroke={1.8}
        />
      </button>

      <BottomNavigation
        onAccount={openAccount}
        onSell={openSell}
      />

      {menuOpen && (
        <div
          className="vd-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          <aside
            className="vd-side-menu"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="vd-menu-head">
              <div>
                <div className="vd-menu-brand">
                  <span>Vani</span>
                  <strong>Daxi</strong>
                </div>

                <small>
                  Todo en un solo lugar
                </small>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                ×
              </button>
            </div>

            <Link
              to="/"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              ⌂ Inicio
            </Link>

            <Link
              to="/catalogo"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              ▦ Categorías
            </Link>

            <Link
              to="/carrito"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              🛒 Carrito
            </Link>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openAccount();
              }}
            >
              ♙ Mi cuenta
            </button>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openSell();
              }}
            >
              🏪 Vender
            </button>
          </aside>
        </div>
      )}

      {accountOpen && (
        <div
          className="vd-overlay vd-centered"
          onClick={() =>
            setAccountOpen(false)
          }
        >
          <div
            className="vd-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              className="vd-modal-close"
              type="button"
              onClick={() =>
                setAccountOpen(false)
              }
            >
              ×
            </button>

            <div className="vd-modal-icon vd-purple-modal">
              <Icon name="user" size={40} />
            </div>

            <h2>Mi cuenta</h2>

            <p>
              Inicia sesión o regístrate
              como comprador o vendedor.
            </p>

            <button className="vd-gradient-button">
              Iniciar sesión
            </button>

            <button className="vd-light-button">
              Crear cuenta
            </button>
          </div>
        </div>
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
              className="vd-modal-close"
              type="button"
              onClick={() =>
                setSellOpen(false)
              }
            >
              ×
            </button>

            <div className="vd-modal-icon">
              <Icon name="store" size={40} />
            </div>

            <h2>
              Vende en VaniDaxi
            </h2>

            <p>
              Únete y comienza a vender
              tus productos hoy.
            </p>

            <button className="vd-gradient-button">
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
          width: 100%;
          min-height: 100%;
          margin: 0;
          padding: 0;
          background: #ffffff;
        }

        body {
          min-width: 320px;
          color: #282831;
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
          width: 100%;
          max-width: 560px;
          min-height: 100vh;
          margin: 0 auto;
          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #ffffff 74%,
              #faf8fc 100%
            );
          position: relative;
          overflow-x: hidden;
          padding-bottom: 78px;
        }

        /* HEADER */

        .vd-header {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          height: 66px;
          padding: 7px 14px;
          display: grid;
          grid-template-columns: 42px 1fr 88px;
          align-items: center;
          background: rgba(255,255,255,.97);
          border-bottom: 1px solid #ededed;
          backdrop-filter: blur(14px);
        }

        .vd-menu-button,
        .vd-header-icon {
          border: 0;
          background: transparent;
          color: #24242b;
        }

        .vd-menu-button {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .vd-brand {
          text-align: center;
        }

        .vd-brand > div {
          line-height: 1;
          font-size: 28px;
          font-weight: 900;
          letter-spacing: -1.7px;
        }

        .vd-brand span {
          color: #6b1cb1;
        }

        .vd-brand strong {
          color: #ea164d;
        }

        .vd-brand small {
          display: flex;
          justify-content: center;
          gap: 4px;
          margin-top: 4px;
          font-size: 9px;
          line-height: 1;
        }

        .vd-brand small b:first-child {
          color: #e7194f;
        }

        .vd-brand small b:nth-child(2) {
          color: #74309d;
        }

        .vd-brand small span {
          color: #47444b;
        }

        .vd-header-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 3px;
        }

        .vd-header-icon {
          width: 38px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .vd-header-icon i {
          position: absolute;
          top: 0;
          right: -1px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e31549;
          color: white;
          font-size: 9px;
          font-style: normal;
          font-weight: 800;
        }

        /* HOME */

        .vd-home {
          width: 100%;
          padding: 13px 18px 20px;
        }

        .vd-search-section {
          margin-bottom: 12px;
        }

        .vd-search-box {
          width: 100%;
          height: 52px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding-left: 15px;
          border: 1px solid #f0eef2;
          border-radius: 17px;
          background: white;
          box-shadow:
            0 5px 18px rgba(42, 26, 57, .045);
          color: #67656d;
        }

        .vd-search-box input {
          flex: 1;
          min-width: 0;
          height: 100%;
          border: 0;
          outline: 0;
          color: #3b3a40;
          font-size: 14px;
          background: transparent;
        }

        .vd-search-box input::placeholder {
          color: #85828a;
        }

        .vd-search-box button {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 0 17px 17px 0;
          background:
            linear-gradient(
              135deg,
              #ec1450,
              #7c1aa3
            );
          color: white;
        }

        /* TARJETAS CENTRALES SUAVIZADAS */

        .vd-main-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 20px;
        }

        .vd-main-card {
          min-width: 0;
          height: 105px;
          padding: 12px;
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 9px;
          position: relative;
          overflow: hidden;

          /* Bordes mucho menos marcados */
          border: 1px solid rgba(255,255,255,.10);
          outline: none;

          border-radius: 17px;
          text-align: left;
          color: white;

          /* Sombra mucho más suave */
          box-shadow:
            0 6px 16px rgba(101, 18, 108, .09);
        }

        .vd-main-card:active {
          transform: scale(.99);
        }

        .vd-sell-card {
          background:
            linear-gradient(
              135deg,
              #ef164c,
              #e51768
            );
        }

        .vd-account-card {
          background:
            linear-gradient(
              135deg,
              #bc1d96,
              #6516ab
            );
        }

        .vd-main-icon {
          width: 47px;
          height: 47px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;

          /* Caja del icono más integrada */
          background: rgba(255,255,255,.94);

          color: #db174c;

          box-shadow:
            0 3px 9px rgba(0,0,0,.045);
        }

        .vd-account-card .vd-main-icon {
          color: #6918a1;
        }

        .vd-main-copy {
          min-width: 0;
          display: block;
        }

        .vd-main-copy strong {
          display: block;
          font-size: 14px;
          line-height: 1.12;
          font-weight: 850;
        }

        .vd-main-copy small {
          display: block;
          margin-top: 5px;
          color: rgba(255,255,255,.9);
          font-size: 9.5px;
          line-height: 1.32;
        }

        .vd-card-arrow {
          position: absolute;
          right: 10px;
          bottom: 10px;
          width: 29px;
          height: 29px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;

          /* Menos contraste en el círculo */
          background: rgba(255,255,255,.94);

          color: #722396;
          font-size: 25px;
          line-height: 1;

          box-shadow:
            0 2px 7px rgba(0,0,0,.04);
        }

        /* TITLES */

        .vd-section {
          margin-bottom: 18px;
        }

        .vd-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .vd-section-title h2 {
          margin: 0;
          font-size: 19px;
          line-height: 1.15;
          font-weight: 850;
        }

        .vd-section-title a {
          color: #702292;
          font-size: 12px;
          font-weight: 800;
        }

        .vd-section-title a span {
          margin-left: 3px;
          font-size: 19px;
          vertical-align: -2px;
        }

        /* CATEGORIES */

        .vd-category-row {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding: 3px 1px 5px;
          scrollbar-width: none;
        }

        .vd-category-row::-webkit-scrollbar {
          display: none;
        }

        .vd-category {
          flex: 0 0 79px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .vd-category > div {
          width: 72px;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;

          /* ORILLAS MUY SUAVES */
          border: 1px solid rgba(120, 110, 135, .075);

          background:
            linear-gradient(
              145deg,
              #ffffff,
              #fcfbfd
            );

          color: #d8184c;

          /* Sombra más ligera para que no parezca un recuadro marcado */
          box-shadow:
            0 4px 11px rgba(40, 26, 57, .035);
        }

        .vd-category:nth-child(2) > div,
        .vd-category:nth-child(4) > div,
        .vd-category:nth-child(6) > div {
          color: #6b22a5;
        }

        .vd-category > span {
          text-align: center;
          color: #36353b;
          font-size: 9px;
          line-height: 1.15;
          font-weight: 650;
        }

        /* OFFER */

        .vd-offer {
          width: 100%;
          min-height: 155px;
          display: grid;
          grid-template-columns: 43% 57%;
          overflow: hidden;
          position: relative;
          border-radius: 18px;
          background:
            radial-gradient(
              circle at 65% 25%,
              rgba(255,255,255,.12),
              transparent 25%
            ),
            linear-gradient(
              115deg,
              #e81649,
              #a90b86 50%,
              #58179c
            );
          color: white;
          box-shadow:
            0 7px 17px rgba(94, 15, 115, .10);
        }

        .vd-offer-text {
          position: relative;
          z-index: 3;
          padding: 17px 0 14px 18px;
        }

        .vd-offer-text h2 {
          margin: 0;
          font-size: 22px;
          line-height: 1.02;
          font-weight: 900;
        }

        .vd-offer-text p {
          margin: 7px 0 10px;
          font-size: 10px;
          line-height: 1.35;
        }

        .vd-offer-text button {
          min-height: 31px;
          padding: 0 12px;
          border: 0;
          border-radius: 18px;
          background: rgba(255,255,255,.96);
          color: #d31961;
          font-size: 10px;
          font-weight: 850;
        }

        .vd-offer-text button span {
          margin-left: 4px;
          font-size: 15px;
        }

        .vd-offer-art {
          position: relative;
          overflow: hidden;
        }

        .vd-offer-art img {
          position: absolute;
          object-fit: cover;
          border: 3px solid rgba(255,255,255,.06);
          box-shadow:
            0 8px 15px rgba(0,0,0,.13);
        }

        .vd-offer-art img:first-of-type {
          width: 83px;
          height: 94px;
          left: 7px;
          bottom: 11px;
          border-radius: 16px;
          transform: rotate(4deg);
        }

        .vd-offer-art img:nth-of-type(2) {
          width: 108px;
          height: 69px;
          right: -2px;
          bottom: 2px;
          border-radius: 15px;
          transform: rotate(-7deg);
        }

        .vd-offer-bag {
          position: absolute;
          bottom: 13px;
          width: 55px;
          height: 64px;
          border-radius: 7px 7px 9px 9px;
          opacity: .9;
        }

        .vd-bag-one {
          left: 48px;
          background: #dd43c2;
        }

        .vd-bag-two {
          left: 78px;
          bottom: 7px;
          background: #b13cd8;
        }

        .vd-percent {
          position: absolute;
          top: 10px;
          right: 12px;
          width: 43px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f40049;
          font-size: 34px;
          font-weight: 900;
          transform: rotate(8deg);
        }

        .vd-dots {
          display: flex;
          justify-content: center;
          gap: 5px;
          padding: 7px 0 8px;
        }

        .vd-dots span {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #bab9bf;
        }

        .vd-dots .active {
          background: #e50046;
        }

        /* PRODUCTS */

        .vd-products-section {
          margin-bottom: 17px;
        }

        .vd-product-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 8px;
        }

        .vd-product-card {
          min-width: 0;

          /* Borde casi imperceptible */
          border: 1px solid rgba(100, 90, 110, .07);

          border-radius: 13px;
          background: white;
          overflow: hidden;

          box-shadow:
            0 4px 12px rgba(35, 24, 47, .035);
        }

        .vd-product-top {
          height: 0;
          position: relative;
          z-index: 4;
        }

        .vd-product-badge {
          position: absolute;
          top: 7px;
          left: 7px;
          padding: 4px 6px;
          border-radius: 5px;
          background: #e7164c;
          color: white;
          font-size: 8px;
          font-weight: 850;
        }

        .vd-product-badge.vd-new {
          background: #6817a2;
        }

        .vd-favorite {
          position: absolute;
          top: 5px;
          right: 6px;
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 50%;
          background: rgba(255,255,255,.92);
          color: #6d6a70;
        }

        .vd-favorite-active {
          color: #e5154c;
        }

        .vd-product-image {
          width: 100%;
          height: 102px;
          display: block;
          background: #faf9fa;
        }

        .vd-product-image img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .vd-product-info {
          padding: 7px;
        }

        .vd-product-info h3 {
          min-height: 27px;
          margin: 0 0 5px;
          color: #302f35;
          font-size: 9px;
          line-height: 1.3;
          font-weight: 750;
        }

        .vd-price {
          display: flex;
          align-items: baseline;
          gap: 4px;
          white-space: nowrap;
        }

        .vd-price strong {
          color: #d9164a;
          font-size: 11px;
        }

        .vd-price del {
          color: #89868c;
          font-size: 7px;
        }

        .vd-rating {
          margin-top: 5px;
          color: #77747b;
          font-size: 7.5px;
          white-space: nowrap;
        }

        .vd-rating span {
          color: #f0b000;
        }

        .vd-rating b {
          color: #b5b2b6;
          margin: 0 2px;
        }

        .vd-product-info > button {
          width: 100%;
          height: 27px;
          margin-top: 6px;
          border: 0;
          border-radius: 7px;
          background:
            linear-gradient(
              135deg,
              #f7f4f8,
              #f3edf8
            );
          color: #702098;
          font-size: 8px;
          font-weight: 800;
        }

        /* BENEFITS */

        .vd-benefits {
          display: grid;
          grid-template-columns: repeat(4, 1fr);

          border: 1px solid rgba(100, 90, 110, .06);

          border-radius: 15px;
          background: white;

          box-shadow:
            0 5px 13px rgba(40,28,55,.035);
        }

        .vd-benefit {
          min-width: 0;
          padding: 12px 7px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          text-align: center;
        }

        .vd-benefit > span {
          color: #e2164b;
        }

        .vd-benefit:nth-child(2) > span,
        .vd-benefit:nth-child(4) > span {
          color: #6c1da0;
        }

        .vd-benefit strong {
          display: block;
          font-size: 8px;
          line-height: 1.2;
        }

        .vd-benefit small {
          display: block;
          margin-top: 2px;
          color: #747079;
          font-size: 7px;
          line-height: 1.25;
        }

        .vd-bottom-space {
          height: 20px;
        }

        /* BOTTOM NAV */

        .vd-bottom-nav {
          position: fixed;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          z-index: 60;
          width: min(100%, 560px);
          height: 68px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          align-items: end;
          padding:
            4px 7px
            max(5px, env(safe-area-inset-bottom));
          background: rgba(255,255,255,.98);
          border-top: 1px solid #f0eef1;
          box-shadow:
            0 -5px 16px rgba(28,20,38,.035);
        }

        .vd-bottom-nav > a,
        .vd-bottom-nav > button {
          height: 55px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          border: 0;
          background: transparent;
          color: #727079;
          font-size: 21px;
        }

        .vd-bottom-nav small {
          font-size: 8px;
          font-weight: 700;
        }

        .vd-nav-active {
          color: #e2164b !important;
        }

        .vd-sell-nav {
          width: 62px !important;
          height: 62px !important;
          justify-self: center;
          margin-top: -26px;
          border-radius: 21px !important;
          background:
            linear-gradient(
              145deg,
              #ee174e,
              #72169e
            ) !important;
          color: white !important;
          box-shadow:
            0 8px 18px
            rgba(167,19,99,.20);
        }

        .vd-sell-nav span {
          display: flex;
          align-items: center;
        }

        /* CHAT */

        .vd-chat {
          position: fixed;
          right: max(
            15px,
            calc(
              (100vw - 560px) / 2 + 15px
            )
          );
          bottom: 80px;
          z-index: 55;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              #ef164e,
              #70169f
            );
          color: white;
          box-shadow:
            0 7px 17px
            rgba(130,19,116,.18);
        }

        /* GENERIC PAGES */

        .vd-page {
          width: 100%;
          min-height: calc(100vh - 144px);
          padding: 22px 18px;
        }

        .vd-page-title {
          margin-bottom: 18px;
        }

        .vd-page-title p,
        .vd-account-page > p,
        .vd-seller-page > p {
          margin: 0 0 6px;
          color: #77747d;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 2px;
        }

        .vd-page-title h1 {
          margin: 0;
          font-size: 27px;
          line-height: 1.1;
        }

        .vd-catalog-search {
          height: 49px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 0 14px;
          border: 1px solid rgba(100,90,110,.08);
          border-radius: 15px;
          background: white;
          box-shadow:
            0 4px 12px rgba(35,24,47,.025);
        }

        .vd-catalog-search input {
          flex: 1;
          border: 0;
          outline: 0;
        }

        .vd-filters {
          display: flex;
          gap: 7px;
          margin: 13px 0 17px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .vd-filters::-webkit-scrollbar {
          display: none;
        }

        .vd-filters button {
          flex: 0 0 auto;
          padding: 8px 12px;
          border: 1px solid rgba(100,90,110,.08);
          border-radius: 999px;
          background: white;
          color: #68656c;
          font-size: 9px;
        }

        .vd-filters button.active {
          border-color: transparent;
          background:
            linear-gradient(
              135deg,
              #ed164d,
              #72179e
            );
          color: white;
        }

        .vd-catalog-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .vd-catalog-grid .vd-product-image {
          height: 135px;
        }

        .vd-product-detail {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
          align-items: center;
        }

        .vd-detail-image {
          min-height: 290px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          background: #f8f7f9;
        }

        .vd-detail-image img {
          width: 90%;
          height: 90%;
          object-fit: contain;
        }

        .vd-detail-info h1 {
          margin: 8px 0 13px;
          font-size: 27px;
        }

        .vd-detail-info > strong {
          color: #dc164b;
          font-size: 24px;
        }

        .vd-detail-info p {
          color: #777;
          line-height: 1.5;
        }

        .vd-gradient-button {
          min-height: 44px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 13px;
          background:
            linear-gradient(
              135deg,
              #ed164e,
              #75179f
            );
          color: white;
          font-size: 11px;
          font-weight: 800;
          box-shadow:
            0 6px 14px rgba(130,19,100,.12);
        }

        .vd-light-button {
          width: 100%;
          min-height: 42px;
          margin-top: 9px;
          border: 0;
          border-radius: 12px;
          background: #f7f4f8;
          color: #6d228f;
          font-weight: 800;
        }

        .vd-empty,
        .vd-account-page,
        .vd-seller-page {
          min-height: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .vd-empty > div,
        .vd-account-icon {
          width: 82px;
          height: 82px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          border-radius: 25px;
          background:
            linear-gradient(
              135deg,
              #fff0f5,
              #f2e8fc
            );
          color: #731b9d;
          font-size: 44px;
        }

        .vd-empty h2 {
          margin: 0 0 14px;
        }

        .vd-cart-list {
          display: grid;
          gap: 9px;
        }

        .vd-cart-item {
          min-height: 75px;
          padding: 10px;
          display: grid;
          grid-template-columns: 65px 1fr;
          gap: 11px;
          align-items: center;
          border: 1px solid rgba(100,90,110,.07);
          border-radius: 15px;
          background: white;
          box-shadow:
            0 4px 10px rgba(35,24,47,.025);
        }

        .vd-cart-item img {
          width: 65px;
          height: 65px;
          object-fit: contain;
          background: #faf9fa;
        }

        .vd-cart-item strong {
          display: block;
          font-size: 12px;
        }

        .vd-cart-item span {
          display: block;
          margin-top: 4px;
          color: #da164a;
          font-size: 12px;
          font-weight: 800;
        }

        .vd-cart-item small {
          color: #777;
          font-size: 9px;
        }

        .vd-cart-total {
          margin-top: 15px;
          padding: 17px;
          display: flex;
          justify-content: space-between;
          border-radius: 16px;
          background:
            linear-gradient(
              135deg,
              #ef174e,
              #74169d
            );
          color: white;
          box-shadow:
            0 6px 15px rgba(130,19,100,.10);
        }

        /* OVERLAYS */

        .vd-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(16,12,21,.44);
          backdrop-filter: blur(4px);
        }

        .vd-centered {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .vd-side-menu {
          width: min(80%, 310px);
          height: 100%;
          padding: 20px;
          background: white;
          box-shadow:
            12px 0 28px rgba(0,0,0,.11);
        }

        .vd-menu-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 17px;
          border-bottom: 1px solid #f3f2f4;
        }

        .vd-menu-brand {
          font-size: 25px;
          font-weight: 900;
        }

        .vd-menu-brand span {
          color: #6f1ba8;
        }

        .vd-menu-brand strong {
          color: #e7174d;
        }

        .vd-menu-head small {
          color: #777;
          font-size: 9px;
        }

        .vd-menu-head button {
          border: 0;
          background: transparent;
          font-size: 28px;
        }

        .vd-side-menu > a,
        .vd-side-menu > button {
          width: 100%;
          padding: 13px 5px;
          display: block;
          border: 0;
          border-bottom: 1px solid #f4f3f5;
          background: transparent;
          text-align: left;
          color: #36333b;
          font-size: 13px;
          font-weight: 700;
        }

        .vd-modal {
          width: min(100%, 340px);
          position: relative;
          padding: 25px 20px;
          border-radius: 23px;
          background: white;
          text-align: center;
          box-shadow:
            0 15px 40px rgba(0,0,0,.12);
        }

        .vd-modal-close {
          position: absolute;
          top: 9px;
          right: 11px;
          border: 0;
          background: transparent;
          color: #67636a;
          font-size: 27px;
        }

        .vd-modal-icon {
          width: 67px;
          height: 67px;
          margin: 0 auto 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 19px;
          background:
            linear-gradient(
              135deg,
              #ef164e,
              #74169f
            );
          color: white;
        }

        .vd-purple-modal {
          background:
            linear-gradient(
              135deg,
              #b71c98,
              #63169f
            );
        }

        .vd-modal h2 {
          margin: 0 0 8px;
          font-size: 21px;
        }

        .vd-modal p {
          margin: 0 0 17px;
          color: #706c74;
          font-size: 12px;
          line-height: 1.5;
        }

        /* RESPONSIVE */

        @media (max-width: 430px) {
          .vd-home {
            padding-left: 13px;
            padding-right: 13px;
          }

          .vd-header {
            padding-left: 10px;
            padding-right: 10px;
          }

          .vd-brand > div {
            font-size: 25px;
          }

          .vd-brand small {
            font-size: 8px;
          }

          .vd-main-cards {
            gap: 7px;
          }

          .vd-main-card {
            height: 99px;
            padding: 10px 9px;
            grid-template-columns: 43px 1fr;
            gap: 7px;
          }

          .vd-main-icon {
            width: 43px;
            height: 43px;
          }

          .vd-main-copy strong {
            font-size: 12px;
          }

          .vd-main-copy small {
            font-size: 8px;
          }

          .vd-card-arrow {
            width: 27px;
            height: 27px;
            right: 8px;
            bottom: 8px;
            font-size: 22px;
          }

          .vd-offer {
            min-height: 145px;
          }

          .vd-offer-text {
            padding-left: 14px;
          }

          .vd-offer-text h2 {
            font-size: 19px;
          }

          .vd-product-grid {
            gap: 7px;
          }

          .vd-product-image {
            height: 93px;
          }

          .vd-benefit {
            padding-left: 5px;
            padding-right: 5px;
          }
        }

        @media (max-width: 360px) {
          .vd-brand > div {
            font-size: 22px;
          }

          .vd-header-right {
            gap: 0;
          }

          .vd-main-card {
            height: 96px;
          }

          .vd-main-copy strong {
            font-size: 11px;
          }

          .vd-main-copy small {
            font-size: 7.5px;
          }

          .vd-category {
            flex-basis: 73px;
          }

          .vd-category > div {
            width: 65px;
            height: 65px;
          }

          .vd-product-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .vd-benefits {
            grid-template-columns: repeat(2, 1fr);
          }

          .vd-benefit:nth-child(1),
          .vd-benefit:nth-child(2) {
            border-bottom:
              1px solid rgba(100,90,110,.06);
          }

          .vd-benefit:nth-child(1),
          .vd-benefit:nth-child(3) {
            border-right:
              1px solid rgba(100,90,110,.06);
          }
        }
      `}</style>
    </div>
  );
}

export default App;
