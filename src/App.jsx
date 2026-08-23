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
    name: "Bolso urbano SHORA",
    price: 699,
    category: "Moda",
    emoji: "👜",
  },
  {
    id: 2,
    name: "Tenis casuales",
    price: 899,
    category: "Calzado",
    emoji: "👟",
  },
  {
    id: 3,
    name: "Audífonos inalámbricos",
    price: 549,
    category: "Tecnología",
    emoji: "🎧",
  },
  {
    id: 4,
    name: "Decoración para hogar",
    price: 399,
    category: "Hogar",
    emoji: "🏠",
  },
  {
    id: 5,
    name: "Accesorios para celular",
    price: 249,
    category: "Tecnología",
    emoji: "📱",
  },
  {
    id: 6,
    name: "Ropa para mujer",
    price: 599,
    category: "Moda",
    emoji: "👗",
  },
  {
    id: 7,
    name: "Kit de belleza",
    price: 449,
    category: "Belleza",
    emoji: "✨",
  },
  {
    id: 8,
    name: "Accesorios de moda",
    price: 299,
    category: "Accesorios",
    emoji: "💍",
  },
];

const categories = [
  { name: "Moda", emoji: "👗" },
  { name: "Tecnología", emoji: "📱" },
  { name: "Hogar", emoji: "🏠" },
  { name: "Calzado", emoji: "👟" },
  { name: "Belleza", emoji: "✨" },
  { name: "Accesorios", emoji: "👜" },
  { name: "Automotriz", emoji: "🚗" },
  { name: "Motos", emoji: "🏍️" },
  { name: "Alimentos", emoji: "🍔" },
];

const CART_KEY = "shora_cart";
const FAVORITES_KEY = "shora_favorites";

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

function getFavorites() {
  try {
    return JSON.parse(
      localStorage.getItem(
        FAVORITES_KEY
      ) || "[]"
    );
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
    new Event("favoritechange")
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

    saveCart([...cart]);
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

function money(value) {
  return `$${Number(value || 0).toLocaleString(
    "es-MX"
  )} MXN`;
}

function Layout({
  cartCount,
  session,
  onAccount,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] =
    useState(false);

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <button
            type="button"
            className="menu-button"
            onClick={() =>
              setMenuOpen(true)
            }
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <Link
            className="logo"
            to="/"
            onClick={() =>
              setMenuOpen(false)
            }
          >
            SHORA
            <span>SHOPP</span>
          </Link>
        </div>

        <nav className="nav">
          <NavLink to="/" end>
            Inicio
          </NavLink>

          <NavLink to="/catalogo">
            Comprar
          </NavLink>

          <NavLink to="/vender">
            Vender
          </NavLink>
        </nav>

        <div className="header-actions">
          <Link
            className="icon-btn"
            to="/carrito"
            aria-label="Carrito"
          >
            🛒
            {cartCount > 0 && (
              <b>{cartCount}</b>
            )}
          </Link>

          <button
            type="button"
            className="account"
            onClick={onAccount}
          >
            ✨
          </button>
        </div>
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
            <div className="menu-title">
              <strong>
                SHORASHOPP
              </strong>

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
              🛍️ Comprar
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
              🏪 Vender en SHORASHOPP
            </Link>

            <Link
              to="/ayuda"
              onClick={() =>
                setMenuOpen(false)
              }
            >
              💬 Ayuda y soporte
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

      <main>
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
            path="/cuenta"
            element={
              <Account session={session} />
            }
          />

          <Route
            path="/vender"
            element={
              <Seller session={session} />
            }
          />

          <Route
            path="/admin"
            element={
              <Admin session={session} />
            }
          />

          <Route
            path="/ayuda"
            element={<Support />}
          />

          <Route
            path="/privacidad"
            element={<Privacy />}
          />

          <Route
            path="/sesiones"
            element={<ActiveSessions />}
          />

          <Route
            path="/verificacion"
            element={
              <SecurityVerification
                session={session}
              />
            }
          />
        </Routes>
      </main>

      <footer className="footer">
        <div>
          <strong>
            SHORASHOPP
          </strong>

          <p>
            Compra y vende de todo en un
            solo lugar.
          </p>
        </div>

        <div>
          <Link to="/catalogo">
            Comprar
          </Link>

          <Link to="/vender">
            Vender
          </Link>

          <Link to="/cuenta">
            Mi cuenta
          </Link>
        </div>

        <small>
          © 2026 SHORASHOPP. Todos los
          derechos reservados.
        </small>
      </footer>
    </div>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <span className="pill">
            MARKETPLACE MEXICANO
          </span>

          <h1>
            Todo lo que buscas.
            <br />
            <em>
              Todo en SHORASHOPP.
            </em>
          </h1>

          <p>
            Descubre productos de
            diferentes vendedores, compra
            de forma segura y encuentra
            nuevas ofertas cada día.
          </p>

          <Link
            className="primary"
            to="/catalogo"
          >
            Explorar productos →
          </Link>
        </div>

        <div className="hero-art">
          🛍️
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <div>
            <span>
              DESCUBRE
            </span>

            <h2>
              Categorías populares
            </h2>
          </div>

          <Link to="/catalogo">
            Ver todo →
          </Link>
        </div>

        <div className="categories">
          {categories
            .slice(0, 6)
            .map((category) => (
              <Link
                to="/catalogo"
                className="category"
                key={category.name}
              >
                <div>
                  {category.emoji}
                </div>

                <strong>
                  {category.name}
                </strong>
              </Link>
            ))}
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <div>
            <span>
              SELECCIÓN SHORA
            </span>

            <h2>
              Productos destacados
            </h2>
          </div>

          <Link to="/catalogo">
            Ver catálogo →
          </Link>
        </div>

        <ProductGrid
          products={demoProducts.slice(
            0,
            4
          )}
        />
      </section>

      <section className="section seller-banner">
        <div>
          <span>
            VENDE EN SHORASHOPP
          </span>

          <h2>
            Convierte tus productos
            en ventas.
          </h2>

          <p>
            Crea tu tienda y llega a
            nuevos compradores.
          </p>

          <Link
            className="primary"
            to="/vender"
          >
            Quiero vender →
          </Link>
        </div>

        <div>
          🏪
        </div>
      </section>
    </>
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
        const matchesCategory =
          category === "Todas" ||
          product.category ===
            category;

        const matchesSearch =
          product.name
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
  }, [search, category]);

  return (
    <section className="section catalog">
      <div className="catalog-head">
        <div>
          <span>
            CATÁLOGO
          </span>

          <h1>
            Encuentra lo que necesitas
          </h1>
        </div>

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
          "Moda",
          "Tecnología",
          "Hogar",
          "Calzado",
          "Belleza",
          "Accesorios",
          "Automotriz",
          "Motos",
          "Alimentos",
        ].map((item) => (
          <button
            type="button"
            className={
              category === item
                ? "filter active"
                : "filter"
            }
            onClick={() =>
              setCategory(item)
            }
            key={item}
          >
            {item}
          </button>
        ))}
      </div>

      {products.length > 0 ? (
        <ProductGrid
          products={products}
        />
      ) : (
        <div className="empty">
          <div>🔎</div>

          <h2>
            No encontramos productos
          </h2>

          <p>
            Prueba con otra búsqueda o
            categoría.
          </p>
        </div>
      )}
    </section>
  );
}

function ProductGrid({ products }) {
  const navigate = useNavigate();

  return (
    <div className="grid">
      {products.map((product) => (
        <article
          className="card"
          key={product.id}
        >
          <button
            type="button"
            className="product-img"
            onClick={() =>
              navigate(
                `/producto/${product.id}`
              )
            }
          >
            {product.emoji}
          </button>

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
            className="add"
            onClick={() =>
              addToCart(product)
            }
          >
            Agregar al carrito
          </button>
        </article>
      ))}
    </div>
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
    <section className="section product-page">
      <div className="product-big">
        {product.emoji}
      </div>

      <div>
        <span>
          {product.category}
        </span>

        <h1>
          {product.name}
        </h1>

        <h2>
          {money(product.price)}
        </h2>

        <p>
          Producto publicado en
          SHORASHOPP. La información,
          envío y disponibilidad se
          confirmarán durante el proceso
          de compra.
        </p>

        <button
          type="button"
          className="primary"
          onClick={() =>
            addToCart(product)
          }
        >
          Agregar al carrito
        </button>
      </div>
    </section>
  );
}

function Cart() {
  const [items, setItems] =
    useState(getCart);

  const navigate = useNavigate();

  useEffect(() => {
    const updateCart = () =>
      setItems(getCart());

    window.addEventListener(
      "cartchange",
      updateCart
    );

    window.addEventListener(
      "storage",
      updateCart
    );

    return () => {
      window.removeEventListener(
        "cartchange",
        updateCart
      );

      window.removeEventListener(
        "storage",
        updateCart
      );
    };
  }, []);

  const total = items.reduce(
    (sum, product) =>
      sum +
      Number(product.price) *
        Number(product.quantity || 1),
    0
  );

  const removeItem = (index) => {
    const newCart = items.filter(
      (_, itemIndex) =>
        itemIndex !== index
    );

    saveCart(newCart);
    setItems(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    setItems([]);
  };

  return (
    <section className="section">
      <span>CARRITO</span>

      <h1>
        Tu carrito
      </h1>

      {items.length === 0 ? (
        <div className="empty">
          <div>🛒</div>

          <h2>
            Tu carrito está vacío
          </h2>

          <p>
            Agrega productos para
            comenzar tu compra.
          </p>

          <Link
            className="primary"
            to="/catalogo"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map(
              (item, index) => (
                <div
                  className="cart-item"
                  key={`${item.id}-${index}`}
                >
                  <span>
                    {item.emoji}
                  </span>

                  <div>
                    <b>
                      {item.name}
                    </b>

                    <p>
                      {money(
                        item.price
                      )}
                    </p>

                    <small>
                      Cantidad:{" "}
                      {item.quantity ||
                        1}
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      removeItem(
                        index
                      )
                    }
                  >
                    Eliminar
                  </button>
                </div>
              )
            )}
          </div>

          <aside className="summary">
            <h2>
              Resumen
            </h2>

            <p>
              Productos{" "}
              <b>
                {money(total)}
              </b>
            </p>

            <hr />

            <h3>
              Total{" "}
              <b>
                {money(total)}
              </b>
            </h3>

            <button
              type="button"
              className="primary"
              onClick={() =>
                navigate("/checkout")
              }
            >
              Continuar al pago
            </button>

            <button
              type="button"
              className="filter"
              onClick={clearCart}
            >
              Vaciar carrito
            </button>
          </aside>
        </>
      )}
    </section>
  );
}

function Checkout() {
  const [message, setMessage] =
    useState("");

  const items = getCart();

  const total = items.reduce(
    (sum, product) =>
      sum +
      Number(product.price) *
        Number(product.quantity || 1),
    0
  );

  const navigate = useNavigate();

  const finishCheckout = () => {
    if (!items.length) {
      navigate("/carrito");
      return;
    }

    setMessage(
      "El pago con Mercado Pago se conectará aquí."
    );
  };

  return (
    <section className="section">
      <span>
        FINALIZAR COMPRA
      </span>

      <h1>
        Confirmar pedido
      </h1>

      <div className="checkout">
        <div className="checkout-card">
          <h2>
            Productos
          </h2>

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
                  <b>
                    {item.name}
                  </b>

                  <small>
                    Cantidad:{" "}
                    {item.quantity ||
                      1}
                  </small>
                </div>

                <strong>
                  {money(
                    Number(
                      item.price
                    ) *
                      Number(
                        item.quantity ||
                          1
                      )
                  )}
                </strong>
              </div>
            )
          )}
        </div>

        <aside className="summary">
          <h2>
            Total
          </h2>

          <h3>
            {money(total)}
          </h3>

          <p>
            El envío será calculado
            según el vendedor y el
            destino.
          </p>

          <button
            type="button"
            className="primary"
            onClick={
              finishCheckout
            }
          >
            Pagar con Mercado Pago
          </button>

          {message && (
            <div className="empty">
              {message}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function Account({
  session,
}) {
  const navigate = useNavigate();

  if (!session) {
    return (
      <section className="section">
        <span>
          MI CUENTA
        </span>

        <h1>
          Tu cuenta SHORASHOPP
        </h1>

        <div className="empty">
          <div>✨</div>

          <h2>
            Inicia sesión
          </h2>

          <p>
            Necesitas iniciar sesión
            para administrar tu cuenta,
            compras y pedidos.
          </p>

          <button
            type="button"
            className="primary"
            onClick={() =>
              navigate("/")
            }
          >
            Iniciar sesión
          </button>
        </div>
      </section>
    );
  }

  const email =
    session.user?.email || "";

  return (
    <section className="section">
      <span>
        MI CUENTA
      </span>

      <h1>
        Tu cuenta SHORASHOPP
      </h1>

      <div className="account-grid">
        <div className="account-card">
          <div>✨</div>

          <h2>
            Mi perfil
          </h2>

          <p>
            {email}
          </p>
        </div>

        <Link
          className="account-card"
          to="/privacidad"
        >
          <div>🔐</div>

          <h2>
            Privacidad y seguridad
          </h2>

          <p>
            Protege tu cuenta.
          </p>
        </Link>

        <div className="account-card">
          <div>📦</div>

          <h2>
            Mis pedidos
          </h2>

          <p>
            Tus compras aparecerán aquí.
          </p>
        </div>

        <Link
          className="account-card"
          to="/vender"
        >
          <div>🏪</div>

          <h2>
            Mi tienda
          </h2>

          <p>
            Vende tus productos.
          </p>
        </Link>

        <div className="account-card">
          <div>❤️</div>

          <h2>
            Favoritos
          </h2>

          <p>
            Productos que guardaste.
          </p>
        </div>

        <div className="account-card">
          <div>💰</div>

          <h2>
            Crédito SHORASHOPP
          </h2>

          <p>
            Crédito para comprar dentro
            de la tienda.
          </p>
        </div>

        <div className="account-card">
          <div>🎁</div>

          <h2>
            Referidos
          </h2>

          <p>
            Invita y participa.
          </p>
        </div>
      </div>
    </section>
  );
}

function Seller({
  session,
}) {
  const navigate = useNavigate();

  return (
    <section className="section">
      <span>
        VENDE EN SHORASHOPP
      </span>

      <h1>
        Comienza a vender tus productos
      </h1>

      <p>
        Publica tus productos y llega a
        compradores.
      </p>

      <div className="seller-panel">
        <div className="seller-icon">
          🏪
        </div>

        <h2>
          Panel de vendedor
        </h2>

        <p>
          Las primeras publicaciones de
          nuevos vendedores pueden quedar
          sujetas a revisión y aprobación
          administrativa.
        </p>

        {!session ? (
          <button
            type="button"
            className="primary"
            onClick={() =>
              navigate("/cuenta")
            }
          >
            Iniciar sesión para vender
          </button>
        ) : (
          <button
            type="button"
            className="primary"
            onClick={() =>
              alert(
                "La publicación de productos se conectará aquí."
              )
            }
          >
            Publicar producto
          </button>
        )}
      </div>

      <div className="seller-rules">
        <h2>
          Reglas para vendedores
        </h2>

        <p>
          • Los nuevos vendedores pueden
          necesitar revisión administrativa.
        </p>

        <p>
          • Después de 2 publicaciones
          aprobadas, la revisión podrá
          cambiar según las reglas de
          SHORASHOPP.
        </p>

        <p>
          • Si existe una infracción, la
          revisión puede volver a activarse.
        </p>

        <p>
          • Inicialmente, cada vendedor
          administra sus propios envíos.
        </p>
      </div>
    </section>
  );
}

function Admin({
  session,
}) {
  return (
    <section className="section">
      <span>
        ADMINISTRACIÓN
      </span>

      <h1>
        Panel administrativo
      </h1>

      {!session ? (
        <div className="empty">
          <div>🔐</div>

          <h2>
            Acceso administrativo
          </h2>

          <p>
            Inicia sesión con la cuenta
            administrativa.
          </p>
        </div>
      ) : (
        <div className="admin-grid">
          <div className="category">
            <div>📦</div>
            <strong>
              Productos pendientes
            </strong>
          </div>

          <div className="category">
            <div>👥</div>
            <strong>
              Vendedores
            </strong>
          </div>

          <div className="category">
            <div>🛒</div>
            <strong>
              Pedidos
            </strong>
          </div>

          <div className="category">
            <div>📊</div>
            <strong>
              Actividad administrativa
            </strong>
          </div>

          <div className="category">
            <div>🚚</div>
            <strong>
              Envíos
            </strong>
          </div>

          <div className="category">
            <div>💰</div>
            <strong>
              Crédito
            </strong>
          </div>
        </div>
      )}
    </section>
  );
}

function Support() {
  return (
    <section className="section">
      <span>
        AYUDA Y SOPORTE
      </span>

      <h1>
        Estamos para ayudarte
      </h1>

      <div className="support-grid">
        <div className="support-card">
          <div>🤖</div>

          <h2>
            Asistente SHORASHOPP
          </h2>

          <p>
            Atención virtual para ayudarte
            con tus dudas.
          </p>
        </div>

        <div className="support-card">
          <div>📦</div>

          <h2>
            Mis pedidos
          </h2>

          <p>
            Consulta información de tus
            compras.
          </p>
        </div>

        <div className="support-card">
          <div>📩</div>

          <h2>
            Contactar soporte
          </h2>

          <p>
            El contacto directo con soporte
            se conectará aquí.
          </p>
        </div>
      </div>
    </section>
  );
}

function Privacy() {
  return (
    <section className="section">
      <span>
        PRIVACIDAD
      </span>

      <h1>
        Privacidad y seguridad
      </h1>

      <div className="settings-list">
        <Link
          className="settings-row"
          to="/sesiones"
        >
          <span>📱</span>

          <div>
            <strong>
              Sesiones activas
            </strong>

            <small>
              Revisa las sesiones de tu
              cuenta.
            </small>
          </div>

          <b>›</b>
        </Link>

        <Link
          className="settings-row"
          to="/verificacion"
        >
          <span>🛡️</span>

          <div>
            <strong>
              Verificación de seguridad
            </strong>

            <small>
              Revisa la seguridad de tu
              cuenta.
            </small>
          </div>

          <b>›</b>
        </Link>

        <div className="settings-row">
          <span>🔑</span>

          <div>
            <strong>
              Contraseña
            </strong>

            <small>
              Administración de contraseña.
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActiveSessions() {
  return (
    <section className="section">
      <span>
        SEGURIDAD
      </span>

      <h1>
        Sesiones activas
      </h1>

      <div className="security-card">
        <div>
          📱
        </div>

        <h2>
          Sesiones activas
        </h2>

        <p>
          La administración de sesiones
          se conectará aquí.
        </p>

        <div className="session-current">
          <strong>
            Sesión actual
          </strong>

          <span>
            Activa
          </span>
        </div>
      </div>
    </section>
  );
}

function SecurityVerification({
  session,
}) {
  return (
    <section className="section">
      <span>
        SEGURIDAD
      </span>

      <h1>
        Verificación de seguridad
      </h1>

      <div className="security-card">
        <div>
          🛡️
        </div>

        <h2>
          Tu cuenta
        </h2>

        <p>
          Aquí podrás revisar las medidas
          de seguridad de tu cuenta
          SHORASHOPP.
        </p>

        <div className="security-check">
          <span>✓</span>

          <div>
            <strong>
              Correo electrónico
            </strong>

            <small>
              {session?.user?.email ||
                "No hay una sesión iniciada."}
            </small>
          </div>
        </div>

        <div className="security-check">
          <span>✓</span>

          <div>
            <strong>
              Supabase Auth
            </strong>

            <small>
              Inicio de sesión protegido.
            </small>
          </div>
        </div>

        <div className="security-check">
          <span>✓</span>

          <div>
            <strong>
              Códigos de verificación
            </strong>

            <small>
              Los códigos se envían al
              correo registrado.
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthModal({
  onClose,
  initialMode = "login",
}) {
  const [mode, setMode] =
    useState(initialMode);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [code, setCode] =
    useState("");

  const [waitingForCode, setWaitingForCode] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messageType, setMessageType] =
    useState("");

  const showMessage = (
    text,
    type = ""
  ) => {
    setMessage(text);
    setMessageType(type);
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      showMessage(
        "Escribe tu correo electrónico."
      );
      return;
    }

    if (!password) {
      showMessage(
        "Escribe tu contraseña."
      );
      return;
    }

    setLoading(true);
    showMessage("");

    try {
      if (mode === "login") {
        const {
          error,
        } =
          await supabase.auth.signInWithPassword(
            {
              email: cleanEmail,
              password,
            }
          );

        if (error) {
          throw error;
        }

        onClose();
        return;
      }

      const {
        data,
        error,
      } =
        await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name:
                name.trim(),
            },
          },
        });

      if (error) {
        throw error;
      }

      if (
        data?.user &&
        !data.user.email_confirmed_at
      ) {
        setWaitingForCode(true);

        showMessage(
          "Te enviamos un código de 6 dígitos a tu correo.",
          "success"
        );
      } else {
        showMessage(
          "Tu cuenta fue creada correctamente.",
          "success"
        );

        onClose();
      }
    } catch (error) {
      console.error(
        "Error de autenticación:",
        error
      );

      showMessage(
        error?.message ||
          "No pudimos completar la operación."
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (
    event
  ) => {
    event.preventDefault();

    if (code.length !== 6) {
      showMessage(
        "Escribe el código de 6 dígitos."
      );
      return;
    }

    setLoading(true);
    showMessage("");

    try {
      const {
        error,
      } =
        await supabase.auth.verifyOtp({
          email:
            email.trim().toLowerCase(),
          token: code,
          type: "signup",
        });

      if (error) {
        throw error;
      }

      showMessage(
        "Cuenta verificada correctamente.",
        "success"
      );

      setTimeout(() => {
        onClose();
      }, 700);
    } catch (error) {
      console.error(
        "Error verificando código:",
        error
      );

      showMessage(
        error?.message ||
          "El código no es válido o ya expiró."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      return;
    }

    setLoading(true);
    showMessage("");

    try {
      const {
        error,
      } =
        await supabase.auth.resend({
          type: "signup",
          email: cleanEmail,
        });

      if (error) {
        throw error;
      }

      showMessage(
        "Enviamos un nuevo código a tu correo.",
        "success"
      );
    } catch (error) {
      console.error(
        "Error reenviando código:",
        error
      );

      showMessage(
        error?.message ||
          "No pudimos reenviar el código."
      );
    } finally {
      setLoading(false);
    }
  };

  if (waitingForCode) {
    return (
      <div className="auth-overlay">
        <div className="auth-modal">
          <button
            type="button"
            className="close-auth"
            onClick={onClose}
          >
            ×
          </button>

          <div className="auth-logo">
            S
          </div>

          <div className="auth-heading">
            <span>
              VERIFICACIÓN
            </span>

            <h2>
              Revisa tu correo
            </h2>

            <p>
              Enviamos un código de 6
              dígitos a:
            </p>

            <strong>
              {email}
            </strong>
          </div>

          <form
            className="auth-form"
            onSubmit={verifyCode}
          >
            <label>
              Código de verificación
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="000000"
                autoComplete="one-time-code"
              />
            </label>

            {message && (
              <div
                className={
                  messageType ===
                  "success"
                    ? "auth-message success"
                    : "auth-message"
                }
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="primary full"
              disabled={loading}
            >
              {loading
                ? "Verificando..."
                : "Verificar código"}
            </button>

            <button
              type="button"
              className="filter"
              onClick={
                resendCode
              }
              disabled={loading}
            >
              Reenviar código
            </button>

            <button
              type="button"
              className="text-button"
              onClick={() => {
                setWaitingForCode(
                  false
                );
                setCode("");
                setMessage("");
              }}
            >
              ← Regresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button
          type="button"
          className="close-auth"
          onClick={onClose}
        >
          ×
        </button>

        <div className="auth-logo">
          S
        </div>

        <div className="auth-heading">
          <span>
            SHORASHOPP
          </span>

          <h2>
            {mode === "login"
              ? "Bienvenido de nuevo"
              : "Crea tu cuenta"}
          </h2>

          <p>
            {mode === "login"
              ? "Entra para comprar, vender y administrar tu cuenta."
              : "Compra y vende de todo en un solo lugar."}
          </p>
        </div>

        <div className="auth-tabs">
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
              setMode(
                "register"
              );
              setMessage("");
            }}
          >
            Crear cuenta
          </button>
        </div>

        <form
          className="auth-form"
          onSubmit={
            handleSubmit
          }
        >
          {mode === "register" && (
            <label>
              Nombre completo
              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Tu nombre"
                autoComplete="name"
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

          {mode === "login" && (
            <button
              type="button"
              className="text-button"
              onClick={() =>
                showMessage(
                  "La recuperación de contraseña se conectará aquí."
                )
              }
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}

          {message && (
            <div
              className={
                messageType ===
                "success"
                  ? "auth-message success"
                  : "auth-message"
              }
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="primary full"
            disabled={loading}
          >
            {loading
              ? "Procesando..."
              : mode === "login"
              ? "Iniciar sesión"
              : "Crear mi cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [cartCount, setCartCount] =
    useState(
      () => getCart().length
    );

  const [session, setSession] =
    useState(null);

  const [authOpen, setAuthOpen] =
    useState(false);

  const [authMode, setAuthMode] =
    useState("login");

  const navigate = useNavigate();

  useEffect(() => {
    const updateCartCount =
      () => {
        setCartCount(
          getCart().reduce(
            (total, item) =>
              total +
              Number(
                item.quantity || 1
              ),
            0
          )
        );
      };

    window.addEventListener(
      "cartchange",
      updateCartCount
    );

    window.addEventListener(
      "storage",
      updateCartCount
    );

    return () => {
      window.removeEventListener(
        "cartchange",
        updateCartCount
      );

      window.removeEventListener(
        "storage",
        updateCartCount
      );
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          setSession(
            data?.session || null
          );
        }
      })
      .catch((error) => {
        console.error(
          "Error obteniendo sesión:",
          error
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

    return () => {
      mounted = false;

      listener?.subscription?.unsubscribe();
    };
  }, []);

  const openAccount =
    () => {
      if (session) {
        navigate("/cuenta");
      } else {
        setAuthMode("login");
        setAuthOpen(true);
      }
    };

  const logout =
    async () => {
      try {
        await supabase.auth.signOut();
        setSession(null);
        navigate("/");
      } catch (error) {
        console.error(
          "Error cerrando sesión:",
          error
        );
      }
    };

  return (
    <>
      <Layout
        cartCount={cartCount}
        session={session}
        onAccount={
          openAccount
        }
        onLogout={logout}
      />

      <Routes>
        <Route
          path="/checkout"
          element={<Checkout />}
        />
      </Routes>

      {authOpen && (
        <AuthModal
          initialMode={
            authMode
          }
          onClose={() =>
            setAuthOpen(false)
          }
        />
      )}
    </>
  );
}

export default App;
