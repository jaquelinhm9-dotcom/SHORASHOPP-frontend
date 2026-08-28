import { useEffect, useMemo, useState } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";

import { supabase } from "./supabaseClient";

const products = [
  {
    id: 1,
    name: "Audífonos inalámbricos",
    price: 399,
    oldPrice: 499,
    category: "Tecnología",
    emoji: "🎧",
    badge: "-20%",
    rating: "4.8",
  },
  {
    id: 2,
    name: "Bolsa de hombro elegante",
    price: 599,
    oldPrice: 699,
    category: "Moda",
    emoji: "👜",
    badge: "Nuevo",
    rating: "4.9",
  },
  {
    id: 3,
    name: "Smartwatch Series 9",
    price: 1699,
    oldPrice: 1999,
    category: "Tecnología",
    emoji: "⌚",
    badge: "-15%",
    rating: "4.7",
  },
  {
    id: 4,
    name: "Licuadora profesional",
    price: 899,
    oldPrice: 999,
    category: "Hogar",
    emoji: "🥤",
    badge: "Nuevo",
    rating: "4.6",
  },
];

const categories = [
  { name: "Moda", emoji: "👗" },
  { name: "Tecnología", emoji: "📱" },
  { name: "Hogar", emoji: "🏠" },
  { name: "Belleza", emoji: "👩" },
  { name: "Accesorios", emoji: "🎧" },
  { name: "Juguetes y Más", emoji: "🎮" },
];

const CART_KEY = "vanidaxi_cart";

function formatPrice(value) {
  return `$${Number(value || 0).toLocaleString("es-MX")}.00`;
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

function addToCart(product) {
  const cart = getCart();

  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  saveCart(cart);
}

function Header({ cartCount, onAccount }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="header">
        <button
          className="header-menu"
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <Link to="/" className="brand">
          <span>Vani</span>
          <strong>Daxi</strong>
        </Link>

        <div className="header-actions">
          <Link to="/catalogo" className="header-search-icon">
            🔍
          </Link>

          <Link to="/carrito" className="header-cart">
            🛒
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </Link>
        </div>
      </header>

      {menuOpen && (
        <div
          className="menu-backdrop"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className="side-menu"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="side-menu-top">
              <div className="side-brand">
                <span>Vani</span>Daxi
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
              >
                ×
              </button>
            </div>

            <Link to="/" onClick={() => setMenuOpen(false)}>
              🏠 Inicio
            </Link>

            <Link
              to="/catalogo"
              onClick={() => setMenuOpen(false)}
            >
              🔍 Explorar
            </Link>

            <Link
              to="/carrito"
              onClick={() => setMenuOpen(false)}
            >
              🛒 Carrito
            </Link>

            <Link
              to="/vender"
              onClick={() => setMenuOpen(false)}
            >
              🏪 Vender
            </Link>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onAccount();
              }}
            >
              ✨ Mi cuenta
            </button>
          </aside>
        </div>
      )}
    </>
  );
}

function Home({ onAccount }) {
  return (
    <main className="home-page">
      {/* NO HAY SECCIÓN DE BIENVENIDO */}

      <section className="home-search-section">
        <Link to="/catalogo" className="home-search">
          <span className="home-search-icon">🔍</span>
          <span>¿Qué estás buscando?</span>
        </Link>
      </section>

      <section className="main-cards">
        <Link to="/vender" className="main-card sell-card">
          <div className="main-card-icon">🏪</div>

          <div className="main-card-content">
            <h2>
              Vende en
              <br />
              VaniDaxi
            </h2>

            <p>
              Únete y comienza a vender
              <br />
              tus productos hoy
            </p>
          </div>

          <span className="card-arrow">›</span>
        </Link>

        <button
          type="button"
          className="main-card account-card-main"
          onClick={onAccount}
        >
          <div className="main-card-icon">👤</div>

          <div className="main-card-content">
            <h2>Mi cuenta</h2>

            <p>
              Inicia sesión o regístrate
              <br />
              como comprador o vendedor
            </p>
          </div>

          <span className="card-arrow">›</span>
        </button>
      </section>

      <section className="categories-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">EXPLORA</p>
            <h1>Categorías</h1>
          </div>

          <Link to="/catalogo">Ver todas ›</Link>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/catalogo?categoria=${encodeURIComponent(
                category.name
              )}`}
              className="category-card"
            >
              <span>{category.emoji}</span>
              <small>{category.name}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className="offer-banner">
        <div className="offer-text">
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

          <Link to="/catalogo">Ver ofertas ›</Link>
        </div>

        <div className="offer-products">
          🎧 👜 ⌚ 👟
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading">
          <div>
            <h2>Productos destacados</h2>
          </div>

          <Link to="/catalogo">Ver todos ›</Link>
        </div>

        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>

      <section className="benefits">
        <div>
          <span>🛡️</span>
          <strong>Compra segura</strong>
          <small>Protegemos tus datos y compras</small>
        </div>

        <div>
          <span>🚚</span>
          <strong>Envíos rápidos</strong>
          <small>Recibe tus productos</small>
        </div>

        <div>
          <span>🏅</span>
          <strong>Vendedores verificados</strong>
          <small>Más confianza para ti</small>
        </div>

        <div>
          <span>💬</span>
          <strong>Soporte 24/7</strong>
          <small>Estamos aquí para ayudarte</small>
        </div>
      </section>
    </main>
  );
}

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <Link
        to={`/producto/${product.id}`}
        className="product-image"
      >
        <span className="product-badge">{product.badge}</span>
        <span className="favorite">♡</span>

        <div className="product-emoji">{product.emoji}</div>
      </Link>

      <div className="product-details">
        <h3>{product.name}</h3>

        <div className="price-row">
          <strong>{formatPrice(product.price)}</strong>

          <del>{formatPrice(product.oldPrice)}</del>
        </div>

        <small>
          ⭐ {product.rating} · Ventas verificadas
        </small>

        <button
          type="button"
          onClick={() => addToCart(product)}
        >
          Agregar
        </button>
      </div>
    </article>
  );
}

function Catalog() {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <main className="page">
      <div className="page-title">
        <p>EXPLORAR</p>
        <h1>Encuentra lo que buscas</h1>
      </div>

      <div className="catalog-search">
        <span>🔍</span>

        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Buscar productos..."
        />
      </div>

      <div className="catalog-categories">
        <button type="button">Todos</button>

        {categories.map((category) => (
          <button
            type="button"
            key={category.name}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="products-grid catalog-products">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
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
      (item) => item.id === Number(id)
    ) || products[0];

  return (
    <main className="page">
      <section className="product-page">
        <div className="product-page-image">
          {product.emoji}
        </div>

        <div className="product-page-info">
          <p>{product.category}</p>

          <h1>{product.name}</h1>

          <strong>
            {formatPrice(product.price)}
          </strong>

          <p className="product-description">
            Encuentra este producto en VaniDaxi.
            Compra de forma sencilla y segura.
          </p>

          <button
            type="button"
            className="gradient-button"
            onClick={() => addToCart(product)}
          >
            Agregar al carrito
          </button>
        </div>
      </section>
    </main>
  );
}

function Cart() {
  const [cart, setCart] = useState(getCart());

  useEffect(() => {
    const updateCart = () => setCart(getCart());

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

  const total = cart.reduce(
    (sum, item) =>
      sum +
      item.price * (item.quantity || 1),
    0
  );

  function changeQuantity(id, amount) {
    const updatedCart = getCart()
      .map((item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          quantity:
            (item.quantity || 1) + amount,
        };
      })
      .filter((item) => item.quantity > 0);

    saveCart(updatedCart);
    setCart(updatedCart);
  }

  return (
    <main className="page">
      <div className="page-title">
        <p>MI COMPRA</p>
        <h1>Carrito</h1>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <span>🛒</span>

          <h2>Tu carrito está vacío</h2>

          <Link
            to="/catalogo"
            className="gradient-button"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {cart.map((item) => (
              <article
                className="cart-item"
                key={item.id}
              >
                <span>{item.emoji}</span>

                <div>
                  <h3>{item.name}</h3>

                  <strong>
                    {formatPrice(item.price)}
                  </strong>
                </div>

                <div className="quantity">
                  <button
                    type="button"
                    onClick={() =>
                      changeQuantity(item.id, -1)
                    }
                  >
                    −
                  </button>

                  <span>
                    {item.quantity || 1}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      changeQuantity(item.id, 1)
                    }
                  >
                    +
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="cart-summary">
            <strong>Total</strong>

            <b>{formatPrice(total)}</b>
          </div>
        </>
      )}
    </main>
  );
}

function Seller() {
  return (
    <main className="page">
      <div className="seller-page">
        <span>🏪</span>

        <p>VENDE EN VANIDAXI</p>

        <h1>
          Publica y vende
          <br />
          tus productos
        </h1>

        <p>
          Llega a nuevos compradores desde
          una sola plataforma.
        </p>

        <button
          type="button"
          className="gradient-button"
        >
          Publicar producto
        </button>
      </div>
    </main>
  );
}

function Account({ session, onLogin }) {
  if (!session) {
    return (
      <main className="page">
        <div className="account-login">
          <span>👤</span>

          <h1>Mi cuenta</h1>

          <p>
            Inicia sesión o crea una cuenta
            para continuar.
          </p>

          <button
            type="button"
            className="gradient-button"
            onClick={onLogin}
          >
            Iniciar sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-title">
        <p>MI CUENTA</p>
        <h1>{session.user?.email}</h1>
      </div>
    </main>
  );
}

function AuthModal({ onClose }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");
  const [message, setMessage] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (mode === "login") {
        const { error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) throw error;

        onClose();
      } else {
        const { error } =
          await supabase.auth.signUp({
            email: email.trim(),
            password,
          });

        if (error) throw error;

        setMessage(
          "Revisa tu correo para confirmar tu cuenta."
        );
      }
    } catch (error) {
      setMessage(
        error.message ||
          "Ocurrió un error."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button
          className="auth-close"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <div className="auth-logo">
          <span>Vani</span>Daxi
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={
              mode === "login"
                ? "active"
                : ""
            }
            onClick={() =>
              setMode("login")
            }
          >
            Entrar
          </button>

          <button
            type="button"
            className={
              mode === "register"
                ? "active"
                : ""
            }
            onClick={() =>
              setMode("register")
            }
          >
            Registrarme
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Correo electrónico

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
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
              required
            />
          </label>

          {message && (
            <p className="auth-message">
              {message}
            </p>
          )}

          <button
            className="gradient-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Procesando..."
              : mode === "login"
              ? "Entrar"
              : "Crear cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}

function BottomNav({ onAccount }) {
  return (
    <nav className="bottom-nav">
      <NavLink to="/">
        <span>⌂</span>
        Inicio
      </NavLink>

      <NavLink to="/catalogo">
        <span>🔍</span>
        Explorar
      </NavLink>

      <NavLink
        to="/vender"
        className="sell-nav"
      >
        <span>＋</span>
        Vender
      </NavLink>

      <NavLink to="/carrito">
        <span>🛒</span>
        Carrito
      </NavLink>

      <button
        type="button"
        onClick={onAccount}
      >
        <span>✨</span>
        Cuenta
      </button>
    </nav>
  );
}

function App() {
  const navigate = useNavigate();

  const [session, setSession] =
    useState(null);

  const [authOpen, setAuthOpen] =
    useState(false);

  const [cartCount, setCartCount] =
    useState(0);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setSession(data.session || null);
      });

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          setSession(newSession || null);
        }
      );

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const count = getCart().reduce(
        (total, item) =>
          total + (item.quantity || 1),
        0
      );

      setCartCount(count);
    };

    updateCount();

    window.addEventListener(
      "vanidaxi-cart-change",
      updateCount
    );

    return () =>
      window.removeEventListener(
        "vanidaxi-cart-change",
        updateCount
      );
  }, []);

  function openAccount() {
    if (session) {
      navigate("/cuenta");
      return;
    }

    setAuthOpen(true);
  }

  return (
    <div className="app-shell">
      <Header
        cartCount={cartCount}
        onAccount={openAccount}
      />

      <div className="content">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                onAccount={openAccount}
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
            path="/vender"
            element={<Seller />}
          />

          <Route
            path="/cuenta"
            element={
              <Account
                session={session}
                onLogin={() =>
                  setAuthOpen(true)
                }
              />
            }
          />

          <Route
            path="*"
            element={
              <Home
                onAccount={openAccount}
              />
            }
          />
        </Routes>
      </div>

      <Link
        to="/cuenta"
        className="floating-chat"
      >
        💬
      </Link>

      <BottomNav
        onAccount={openAccount}
      />

      {authOpen && (
        <AuthModal
          onClose={() =>
            setAuthOpen(false)
          }
        />
      )}
    </div>
  );
}

export default App;
