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

const demoProducts = [
  {
    id: 1,
    name: "Bolso urbano VaniDaxi",
    price: 699,
    category: "Moda",
    emoji: "👜",
    badge: "Oferta",
  },
  {
    id: 2,
    name: "Tenis casuales",
    price: 899,
    category: "Moda",
    emoji: "👟",
    badge: "Popular",
  },
  {
    id: 3,
    name: "Audífonos inalámbricos",
    price: 549,
    category: "Tecnología",
    emoji: "🎧",
    badge: "Nuevo",
  },
  {
    id: 4,
    name: "Decoración para hogar",
    price: 399,
    category: "Hogar",
    emoji: "🏠",
    badge: "Oferta",
  },
  {
    id: 5,
    name: "Accesorios para celular",
    price: 249,
    category: "Tecnología",
    emoji: "📱",
    badge: "Popular",
  },
  {
    id: 6,
    name: "Ropa para mujer",
    price: 599,
    category: "Moda",
    emoji: "👗",
    badge: "Nuevo",
  },
  {
    id: 7,
    name: "Kit de belleza",
    price: 449,
    category: "Belleza",
    emoji: "✨",
    badge: "Oferta",
  },
  {
    id: 8,
    name: "Accesorios de moda",
    price: 299,
    category: "Accesorios",
    emoji: "💍",
    badge: "Popular",
  },
];

const categories = [
  {
    name: "Moda",
    emoji: "👗",
  },
  {
    name: "Tecnología",
    emoji: "📱",
  },
  {
    name: "Hogar",
    emoji: "🏠",
  },
  {
    name: "Belleza",
    emoji: "✨",
  },
  {
    name: "Autos",
    emoji: "🚗",
  },
  {
    name: "Comida",
    emoji: "🍔",
  },
  {
    name: "Juguetes",
    emoji: "🧸",
  },
  {
    name: "Deportes",
    emoji: "⚽",
  },
];

const CART_KEY = "vanidaxi_cart";

function money(value) {
  return `$${Number(value || 0).toLocaleString(
    "es-MX"
  )}`;
}

function getCart() {
  try {
    return JSON.parse(
      localStorage.getItem(CART_KEY) || "[]"
    );
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
    new Event("cartchange")
  );
}

function addToCart(product) {
  const cart = getCart();

  const existing = cart.find(
    (item) => item.id === product.id
  );

  if (existing) {
    existing.quantity =
      Number(existing.quantity || 1) + 1;

    saveCart(cart);
    return;
  }

  saveCart([
    ...cart,
    {
      ...product,
      quantity: 1,
    },
  ]);
}

function Header({
  cartCount,
  session,
  onAccount,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const [searchOpen, setSearchOpen] =
    useState(false);

  return (
    <>
      <header className="top-header">
        <div className="top-header-row">
          <button
            type="button"
            className="icon-button"
            onClick={() =>
              setMenuOpen(true)
            }
          >
            ☰
          </button>

          <Link
            to="/"
            className="logo"
          >
            <span>Vani</span>
            <b>Daxi</b>
          </Link>

          <div className="header-icons">
            <button
              type="button"
              className="icon-button"
              onClick={() =>
                setSearchOpen(
                  !searchOpen
                )
              }
            >
              🔍
            </button>

            <Link
              to="/carrito"
              className="cart-icon"
            >
              🛒

              {cartCount > 0 && (
                <span>
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="header-search">
            <input
              autoFocus
              placeholder="Buscar en VaniDaxi..."
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  window.location.href =
                    "/VaniDaxi-frontend/catalogo";
                }
              }}
            />
          </div>
        )}
      </header>

      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          <aside
            className="side-menu"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="menu-top">
              <div className="menu-logo">
                Vani<span>Daxi</span>
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
              🏠 Inicio
            </Link>

            <Link
              to="/catalogo"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              🛍️ Explorar productos
            </Link>

            <Link
              to="/carrito"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              🛒 Mi carrito
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

            <Link
              to="/vender"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              🏪 Vender en VaniDaxi
            </Link>

            <Link
              to="/ayuda"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              💬 Ayuda
            </Link>

            {session && (
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onLogout();
                }}
              >
                🚪 Cerrar sesión
              </button>
            )}
          </aside>
        </div>
      )}
    </>
  );
}

function Home() {
  return (
    <main className="home">
      <section className="welcome-section">
        <div>
          <p className="small-gradient-text">
            BIENVENIDO A
          </p>

          <h1>
            Todo lo que buscas
            <span>
              en un solo lugar.
            </span>
          </h1>

          <p className="welcome-description">
            Compra, vende y descubre
            miles de productos.
          </p>
        </div>

        <div className="welcome-icon">
          🛍️
        </div>
      </section>

      <section className="search-section">
        <Link
          to="/catalogo"
          className="big-search"
        >
          <span>🔍</span>

          <span>
            ¿Qué estás buscando?
          </span>
        </Link>
      </section>

      {/* BOTONES CENTRALES */}
      <section className="quick-section">
        <Link
          to="/vender"
          className="quick-card quick-buy"
        >
          <span className="quick-icon">
            🏪
          </span>

          <div>
            <strong>
              Vende en
              <br />
              VaniDaxi
            </strong>

            <small>
              Únete y comienza a vender
              tus productos hoy
            </small>
          </div>

          <b>›</b>
        </Link>

        <Link
          to="/cuenta"
          className="quick-card quick-sell"
        >
          <span className="quick-icon">
            👤
          </span>

          <div>
            <strong>
              Mi cuenta
            </strong>

            <small>
              Inicia sesión o regístrate
              como comprador o vendedor
            </small>
          </div>

          <b>›</b>
        </Link>
      </section>

      <section className="home-section">
        <div className="section-title-row">
          <div>
            <p>
              EXPLORA
            </p>

            <h2>
              Categorías
            </h2>
          </div>

          <Link to="/catalogo">
            Ver todas
          </Link>
        </div>

        <div className="categories-row">
          {categories.map(
            (category) => (
              <Link
                to={`/catalogo?categoria=${category.name}`}
                className="category-item"
                key={category.name}
              >
                <div>
                  {category.emoji}
                </div>

                <span>
                  {category.name}
                </span>
              </Link>
            )
          )}
        </div>
      </section>

      <section className="promo-banner">
        <div className="promo-content">
          <span>
            ✨ VANIDAXI
          </span>

          <h2>
            Descubre ofertas
            increíbles
          </h2>

          <p>
            Encuentra productos que te
            encantarán.
          </p>

          <Link to="/catalogo">
            Ver ofertas
          </Link>
        </div>

        <div className="promo-emoji">
          🎁
        </div>
      </section>

      <section className="home-section products-section">
        <div className="section-title-row">
          <div>
            <p>
              PARA TI
            </p>

            <h2>
              Productos destacados
            </h2>
          </div>

          <Link to="/catalogo">
            Ver más
          </Link>
        </div>

        <ProductGrid
          products={demoProducts.slice(0, 4)}
        />
      </section>

      <section className="register-banner">
        <div>
          <span>
            ✨ ÚNETE A VANIDAXI
          </span>

          <h2>
            Todo comienza aquí
          </h2>

          <p>
            Crea tu cuenta y disfruta
            una nueva forma de comprar
            y vender.
          </p>
        </div>

        <Link
          to="/cuenta"
          className="register-button"
        >
          Crear cuenta
        </Link>
      </section>
    </main>
  );
}

function ProductGrid({
  products,
}) {
  const navigate = useNavigate();

  return (
    <div className="product-grid">
      {products.map((product) => (
        <article
          className="product-card"
          key={product.id}
        >
          <button
            type="button"
            className="product-image"
            onClick={() =>
              navigate(
                `/producto/${product.id}`
              )
            }
          >
            {product.badge && (
              <span className="product-badge">
                {product.badge}
              </span>
            )}

            <span>
              {product.emoji}
            </span>
          </button>

          <div className="product-info">
            <small>
              {product.category}
            </small>

            <h3>
              {product.name}
            </h3>

            <strong>
              {money(product.price)}
            </strong>

            <button
              type="button"
              onClick={() =>
                addToCart(product)
              }
            >
              Agregar
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Catalog() {
  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("Todas");

  const products = useMemo(() => {
    return demoProducts.filter(
      (product) => {
        const searchMatch =
          product.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const categoryMatch =
          category === "Todas" ||
          product.category === category;

        return (
          searchMatch &&
          categoryMatch
        );
      }
    );
  }, [search, category]);

  return (
    <main className="page">
      <section className="page-heading">
        <p>
          EXPLORAR
        </p>

        <h1>
          Encuentra lo que buscas
        </h1>
      </section>

      <div className="catalog-search">
        🔍

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

      <div className="filters">
        {[
          "Todas",
          ...categories.map(
            (item) => item.name
          ),
        ].map((item) => (
          <button
            type="button"
            key={item}
            className={
              category === item
                ? "active"
                : ""
            }
            onClick={() =>
              setCategory(item)
            }
          >
            {item}
          </button>
        ))}
      </div>

      <ProductGrid
        products={products}
      />
    </main>
  );
}

function Product() {
  const { id } = useParams();

  const product =
    demoProducts.find(
      (item) =>
        item.id === Number(id)
    ) || demoProducts[0];

  return (
    <main className="page">
      <section className="product-detail">
        <div className="detail-image">
          {product.emoji}
        </div>

        <div className="detail-info">
          <small>
            {product.category}
          </small>

          <h1>
            {product.name}
          </h1>

          <h2>
            {money(product.price)}
          </h2>

          <p>
            Producto disponible en
            VaniDaxi.
          </p>

          <button
            type="button"
            className="gradient-button"
            onClick={() =>
              addToCart(product)
            }
          >
            Agregar al carrito
          </button>
        </div>
      </section>
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
      "cartchange",
      update
    );

    return () =>
      window.removeEventListener(
        "cartchange",
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

  function updateQuantity(
    index,
    amount
  ) {
    const newItems = [...items];

    newItems[index].quantity =
      Number(
        newItems[index].quantity || 1
      ) + amount;

    if (
      newItems[index].quantity <= 0
    ) {
      newItems.splice(index, 1);
    }

    saveCart(newItems);
    setItems(newItems);
  }

  return (
    <main className="page">
      <section className="page-heading">
        <p>
          MI COMPRA
        </p>

        <h1>
          Tu carrito
        </h1>
      </section>

      {items.length === 0 ? (
        <div className="empty-state">
          <div>
            🛒
          </div>

          <h2>
            Tu carrito está vacío
          </h2>

          <p>
            Descubre productos increíbles
            en VaniDaxi.
          </p>

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
            {items.map(
              (item, index) => (
                <article
                  className="cart-item"
                  key={`${item.id}-${index}`}
                >
                  <div className="cart-product-image">
                    {item.emoji}
                  </div>

                  <div className="cart-product-info">
                    <h3>
                      {item.name}
                    </h3>

                    <strong>
                      {money(item.price)}
                    </strong>

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            index,
                            -1
                          )
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
                          updateQuantity(
                            index,
                            1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </article>
              )
            )}
          </div>

          <div className="cart-total">
            <div>
              <span>
                Total
              </span>

              <strong>
                {money(total)}
              </strong>
            </div>

            <Link
              to="/checkout"
              className="gradient-button"
            >
              Continuar
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

function Checkout() {
  const items = getCart();

  const total = items.reduce(
    (sum, item) =>
      sum +
      Number(item.price) *
        Number(item.quantity || 1),
    0
  );

  return (
    <main className="page">
      <section className="page-heading">
        <p>
          FINALIZAR COMPRA
        </p>

        <h1>
          Resumen de tu pedido
        </h1>
      </section>

      <div className="checkout-card">
        {items.map(
          (item, index) => (
            <div
              className="checkout-item"
              key={`${item.id}-${index}`}
            >
              <span>
                {item.emoji}
              </span>

              <div>
                <strong>
                  {item.name}
                </strong>

                <small>
                  Cantidad:{" "}
                  {item.quantity || 1}
                </small>
              </div>

              <b>
                {money(
                  Number(item.price) *
                    Number(
                      item.quantity || 1
                    )
                )}
              </b>
            </div>
          )
        )}

        <div className="checkout-total">
          <span>
            Total
          </span>

          <strong>
            {money(total)}
          </strong>
        </div>

        <button
          type="button"
          className="gradient-button"
          onClick={() =>
            alert(
              "La conexión de pago se integrará aquí."
            )
          }
        >
          Continuar al pago
        </button>
      </div>
    </main>
  );
}

function Account({
  session,
  openAuth,
}) {
  if (!session) {
    return (
      <main className="page">
        <div className="empty-state">
          <div>
            ✨
          </div>

          <h2>
            Bienvenido a VaniDaxi
          </h2>

          <p>
            Inicia sesión o crea una
            cuenta para continuar.
          </p>

          <button
            type="button"
            className="gradient-button"
            onClick={openAuth}
          >
            Iniciar sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="page-heading">
        <p>
          MI CUENTA
        </p>

        <h1>
          Hola, {session.user?.email}
        </h1>
      </section>

      <div className="account-grid">
        <Link
          to="/carrito"
          className="account-card"
        >
          🛒

          <strong>
            Mis compras
          </strong>
        </Link>

        <Link
          to="/vender"
          className="account-card"
        >
          🏪

          <strong>
            Mi tienda
          </strong>
        </Link>

        <Link
          to="/ayuda"
          className="account-card"
        >
          💬

          <strong>
            Ayuda
          </strong>
        </Link>
      </div>
    </main>
  );
}

function Seller() {
  return (
    <main className="page">
      <section className="seller-page">
        <div className="seller-icon">
          🏪
        </div>

        <p>
          VENDE EN VANIDAXI
        </p>

        <h1>
          Convierte tus productos
          en ventas.
        </h1>

        <span>
          Publica tus productos y llega
          a nuevos compradores.
        </span>

        <button
          type="button"
          className="gradient-button"
          onClick={() =>
            alert(
              "La publicación de productos se conectará aquí."
            )
          }
        >
          Publicar producto
        </button>
      </section>
    </main>
  );
}

function Support() {
  return (
    <main className="page">
      <div className="empty-state">
        <div>
          💬
        </div>

        <h2>
          ¿Necesitas ayuda?
        </h2>

        <p>
          El asistente de VaniDaxi estará
          disponible para ayudarte.
        </p>
      </div>
    </main>
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

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (mode === "login") {
        const { error } =
          await supabase.auth.signInWithPassword(
            {
              email:
                email
                  .trim()
                  .toLowerCase(),
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
            email:
              email
                .trim()
                .toLowerCase(),
            password,
          });

        if (error) {
          throw error;
        }

        setMessage(
          "Cuenta creada. Revisa tu correo para confirmar tu registro."
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
          type="button"
          className="auth-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="auth-brand">
          Vani<span>Daxi</span>
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
            Iniciar sesión
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
            Crear cuenta
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
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
              required
            />
          </label>

          {message && (
            <p className="auth-message">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="gradient-button"
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

function BottomNavigation({
  onAccount,
}) {
  return (
    <nav className="bottom-navigation">
      <NavLink to="/">
        <span>⌂</span>
        Inicio
      </NavLink>

      <NavLink to="/catalogo">
        <span>🔍</span>
        Explorar
      </NavLink>

      <NavLink to="/vender">
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
        setSession(
          data?.session || null
        );
      });

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          setSession(
            newSession || null
          );
        }
      );

    return () =>
      listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function updateCart() {
      const cart = getCart();

      setCartCount(
        cart.reduce(
          (total, item) =>
            total +
            Number(
              item.quantity || 1
            ),
          0
        )
      );
    }

    updateCart();

    window.addEventListener(
      "cartchange",
      updateCart
    );

    return () =>
      window.removeEventListener(
        "cartchange",
        updateCart
      );
  }, []);

  function openAccount() {
    if (session) {
      navigate("/cuenta");
      return;
    }

    setAuthOpen(true);
  }

  async function logout() {
    await supabase.auth.signOut();

    navigate("/");
  }

  return (
    <div className="app">
      <Header
        cartCount={cartCount}
        session={session}
        onAccount={openAccount}
        onLogout={logout}
      />

      <div className="app-content">
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/catalogo"
            element={<Catalog />}
          />

          <Route
            path="/producto/:id"
            element={<Product />}
          />

          <Route
            path="/carrito"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

          <Route
            path="/cuenta"
            element={
              <Account
                session={session}
                openAuth={() =>
                  setAuthOpen(true)
                }
              />
            }
          />

          <Route
            path="/vender"
            element={<Seller />}
          />

          <Route
            path="/ayuda"
            element={<Support />}
          />

          <Route
            path="*"
            element={<Home />}
          />
        </Routes>
      </div>

      <BottomNavigation
        onAccount={openAccount}
      />

      <Link
        to="/ayuda"
        className="floating-support"
      >
        💬
      </Link>

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
