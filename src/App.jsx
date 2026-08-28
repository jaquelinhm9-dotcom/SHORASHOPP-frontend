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

const CART_KEY = "vanidaxi_cart";

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

function money(value) {
  return `$${Number(value || 0).toLocaleString(
    "es-MX"
  )} MXN`;
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

  return (
    <>
      <header className="main-header">
        <div className="header-left">
          <button
            type="button"
            className="menu-button"
            onClick={() =>
              setMenuOpen(true)
            }
          >
            ☰
          </button>

          <Link
            to="/"
            className="brand"
            onClick={() =>
              setMenuOpen(false)
            }
          >
            <span className="brand-main">
              Vani
            </span>

            <span className="brand-second">
              Daxi
            </span>
          </Link>
        </div>

        <nav className="main-nav">
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
            to="/carrito"
            className="cart-button"
          >
            🛒

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="account-button"
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
            <div className="side-menu-header">
              <strong>
                VaniDaxi
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
              🏪 Vender en VaniDaxi
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
    </>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="hero-label">
            MARKETPLACE MEXICANO
          </span>

          <h1>
            Todo lo que buscas.
            <br />

            <span>
              Todo en VaniDaxi.
            </span>
          </h1>

          <p>
            Compra y vende productos de
            diferentes categorías en un
            solo lugar.
          </p>

          <Link
            to="/catalogo"
            className="primary-button"
          >
            Explorar productos →
          </Link>
        </div>

        <div className="hero-visual">
          🛍️
        </div>
      </section>

      <section className="section">
        <div className="section-heading">
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

        <div className="category-grid">
          {categories
            .slice(0, 6)
            .map((category) => (
              <Link
                to="/catalogo"
                className="category-card"
                key={category.name}
              >
                <div className="category-icon">
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
        <div className="section-heading">
          <div>
            <span>
              SELECCIÓN VANIDAXI
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

      <section className="seller-banner">
        <div>
          <span>
            VENDE EN VANIDAXI
          </span>

          <h2>
            Convierte tus productos
            en ventas.
          </h2>

          <p>
            Crea tu espacio como vendedor
            y llega a nuevos compradores.
          </p>

          <Link
            to="/vender"
            className="primary-button"
          >
            Quiero vender →
          </Link>
        </div>

        <div className="seller-banner-icon">
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
        const categoryOk =
          category === "Todas" ||
          product.category ===
            category;

        const searchOk =
          product.name
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        return (
          categoryOk &&
          searchOk
        );
      }
    );
  }, [search, category]);

  return (
    <section className="section">
      <div className="catalog-heading">
        <div>
          <span>
            CATÁLOGO
          </span>

          <h1>
            Encuentra lo que necesitas
          </h1>
        </div>

        <input
          type="search"
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
            key={item}
            className={
              category === item
                ? "filter active"
                : "filter"
            }
            onClick={() =>
              setCategory(item)
            }
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
        <div className="empty-box">
          <div>🔎</div>

          <h2>
            No encontramos productos
          </h2>

          <p>
            Prueba otra búsqueda o
            categoría.
          </p>
        </div>
      )}
    </section>
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
            className="add-button"
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
    <section className="section product-detail">
      <div className="product-detail-image">
        {product.emoji}
      </div>

      <div className="product-detail-info">
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
          Producto disponible en
          VaniDaxi.
        </p>

        <button
          type="button"
          className="primary-button"
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

  const removeItem = (index) => {
    const newCart =
      items.filter(
        (_, i) => i !== index
      );

    saveCart(newCart);
    setItems(newCart);
  };

  const changeQuantity = (
    index,
    amount
  ) => {
    const newCart = [...items];

    newCart[index].quantity =
      Number(
        newCart[index].quantity || 1
      ) + amount;

    if (
      newCart[index].quantity <= 0
    ) {
      newCart.splice(index, 1);
    }

    saveCart(newCart);
    setItems(newCart);
  };

  return (
    <section className="section">
      <span>
        CARRITO
      </span>

      <h1>
        Tu carrito
      </h1>

      {items.length === 0 ? (
        <div className="empty-box">
          <div>🛒</div>

          <h2>
            Tu carrito está vacío
          </h2>

          <p>
            Agrega productos para
            comenzar tu compra.
          </p>

          <Link
            to="/catalogo"
            className="primary-button"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map(
              (item, index) => (
                <div
                  className="cart-item"
                  key={`${item.id}-${index}`}
                >
                  <div className="cart-item-icon">
                    {item.emoji}
                  </div>

                  <div className="cart-item-info">
                    <h3>
                      {item.name}
                    </h3>

                    <strong>
                      {money(
                        item.price
                      )}
                    </strong>

                    <div className="quantity">
                      <button
                        type="button"
                        onClick={() =>
                          changeQuantity(
                            index,
                            -1
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
                          changeQuantity(
                            index,
                            1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="remove-button"
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

            <div>
              <span>
                Productos
              </span>

              <strong>
                {money(total)}
              </strong>
            </div>

            <hr />

            <div>
              <strong>
                Total
              </strong>

              <strong>
                {money(total)}
              </strong>
            </div>

            <Link
              to="/checkout"
              className="primary-button"
            >
              Continuar al pago
            </Link>
          </aside>
        </div>
      )}
    </section>
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

  const [message, setMessage] =
    useState("");

  return (
    <section className="section">
      <span>
        FINALIZAR COMPRA
      </span>

      <h1>
        Confirmar pedido
      </h1>

      <div className="checkout-layout">
        <div className="checkout-card">
          <h2>
            Tus productos
          </h2>

          {items.length === 0 ? (
            <p>
              Tu carrito está vacío.
            </p>
          ) : (
            items.map(
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
                      {item.quantity ||
                        1}
                    </small>
                  </div>

                  <b>
                    {money(
                      Number(
                        item.price
                      ) *
                        Number(
                          item.quantity ||
                            1
                        )
                    )}
                  </b>
                </div>
              )
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
            según el vendedor y destino.
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              setMessage(
                "La conexión con Mercado Pago se configurará aquí."
              )
            }
          >
            Pagar con Mercado Pago
          </button>

          {message && (
            <div className="notice">
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
  if (!session) {
    return (
      <section className="section">
        <span>
          MI CUENTA
        </span>

        <h1>
          Tu cuenta VaniDaxi
        </h1>

        <div className="empty-box">
          <div>✨</div>

          <h2>
            Inicia sesión
          </h2>

          <p>
            Inicia sesión para
            administrar tu cuenta,
            compras y pedidos.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <span>
        MI CUENTA
      </span>

      <h1>
        Tu cuenta VaniDaxi
      </h1>

      <div className="account-grid">
        <div className="account-card">
          <div>✨</div>

          <h2>
            Mi perfil
          </h2>

          <p>
            {session.user?.email}
          </p>
        </div>

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
          to="/privacidad"
          className="account-card"
        >
          <div>🔐</div>

          <h2>
            Privacidad y seguridad
          </h2>

          <p>
            Protege tu cuenta.
          </p>
        </Link>

        <Link
          to="/vender"
          className="account-card"
        >
          <div>🏪</div>

          <h2>
            Mi tienda
          </h2>

          <p>
            Administra tus ventas.
          </p>
        </Link>

        <div className="account-card">
          <div>❤️</div>

          <h2>
            Favoritos
          </h2>

          <p>
            Productos guardados.
          </p>
        </div>

        <div className="account-card">
          <div>💰</div>

          <h2>
            Crédito VaniDaxi
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
            Invita a nuevos compradores.
          </p>
        </div>
      </div>
    </section>
  );
}

function Seller({
  session,
}) {
  return (
    <section className="section">
      <span>
        VENDE EN VANIDAXI
      </span>

      <h1>
        Comienza a vender
      </h1>

      <p>
        Publica tus productos y llega
        a nuevos compradores.
      </p>

      <div className="seller-panel">
        <div>
          🏪
        </div>

        <h2>
          Panel de vendedor
        </h2>

        <p>
          Las primeras publicaciones de
          nuevos vendedores pueden
          requerir revisión y aprobación
          administrativa.
        </p>

        {!session ? (
          <Link
            to="/"
            className="primary-button"
          >
            Iniciar sesión
          </Link>
        ) : (
          <button
            type="button"
            className="primary-button"
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

      <div className="rules">
        <h2>
          Reglas para vendedores
        </h2>

        <p>
          • Los nuevos vendedores pueden
          necesitar revisión.
        </p>

        <p>
          • Después de 2 publicaciones
          aprobadas, la revisión podrá
          cambiar.
        </p>

        <p>
          • Una infracción puede activar
          nuevamente la revisión.
        </p>

        <p>
          • Inicialmente, cada vendedor
          administra sus propios envíos.
        </p>
      </div>
    </section>
  );
}

function Support() {
  return (
    <section className="section">
      <span>
        AYUDA
      </span>

      <h1>
        Ayuda y soporte
      </h1>

      <div className="support-grid">
        <div className="support-card">
          <div>🤖</div>

          <h2>
            Asistente VaniDaxi
          </h2>

          <p>
            Atención virtual para
            ayudarte con tus dudas.
          </p>
        </div>

        <div className="support-card">
          <div>📦</div>

          <h2>
            Pedidos
          </h2>

          <p>
            Consulta información sobre
            tus compras.
          </p>
        </div>

        <div className="support-card">
          <div>📩</div>

          <h2>
            Soporte
          </h2>

          <p>
            El contacto directo con
            soporte se conectará aquí.
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
        SEGURIDAD
      </span>

      <h1>
        Privacidad y seguridad
      </h1>

      <div className="settings-list">
        <Link
          to="/sesiones"
          className="settings-row"
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
          to="/verificacion"
          className="settings-row"
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

        <div className="session-status">
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
          Seguridad de tu cuenta
        </h2>

        <p>
          Aquí puedes revisar el estado
          básico de seguridad de tu cuenta.
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
              Código de verificación
            </strong>

            <small>
              Código enviado al correo
              durante el registro.
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

  const [success, setSuccess] =
    useState(false);

  const showMessage = (
    text,
    isSuccess = false
  ) => {
    setMessage(text);
    setSuccess(isSuccess);
  };

  const handleAuth = async (
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

    if (
      mode === "register" &&
      !name.trim()
    ) {
      showMessage(
        "Escribe tu nombre."
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
          true
        );
      } else {
        showMessage(
          "Tu cuenta fue creada correctamente.",
          true
        );

        setTimeout(
          onClose,
          700
        );
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
        true
      );

      setTimeout(
        onClose,
        700
      );
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
    setLoading(true);
    showMessage("");

    try {
      const {
        error,
      } =
        await supabase.auth.resend({
          type: "signup",
          email:
            email.trim().toLowerCase(),
        });

      if (error) {
        throw error;
      }

      showMessage(
        "Enviamos un nuevo código a tu correo.",
        true
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
          V
        </div>

        {waitingForCode ? (
          <>
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
              onSubmit={
                verifyCode
              }
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
                    success
                      ? "auth-message success"
                      : "auth-message"
                  }
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="primary-button full"
                disabled={loading}
              >
                {loading
                  ? "Verificando..."
                  : "Verificar código"}
              </button>

              <button
                type="button"
                className="secondary-button full"
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
          </>
        ) : (
          <>
            <div className="auth-heading">
              <span>
                VaniDaxi
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
                  setMode(
                    "login"
                  );
                  setMessage("");
                }}
              >
                Iniciar sesión
              </button>

              <button
                type="button"
                className={
                  mode ===
                  "register"
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
                handleAuth
              }
            >
              {mode ===
                "register" && (
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
                    mode ===
                    "login"
                      ? "current-password"
                      : "new-password"
                  }
                />
              </label>

              {message && (
                <div
                  className={
                    success
                      ? "auth-message success"
                      : "auth-message"
                  }
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="primary-button full"
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : mode ===
                    "login"
                  ? "Iniciar sesión"
                  : "Crear mi cuenta"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] =
    useState(null);

  const [authOpen, setAuthOpen] =
    useState(false);

  const [authMode, setAuthMode] =
    useState("login");

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

  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) {
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
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          setSession(
            newSession || null
          );
        }
      );

    return () => {
      active = false;

      authListener?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const updateCart = () => {
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
    };

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

  const accountAction = () => {
    if (session) {
      navigate("/cuenta");
    } else {
      setAuthMode("login");
      setAuthOpen(true);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate("/");
  };

  return (
    <div className="app">
      <Header
        cartCount={cartCount}
        session={session}
        onAccount={
          accountAction
        }
        onLogout={logout}
      />

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
            />
          }
        />

        <Route
          path="/vender"
          element={
            <Seller
              session={session}
            />
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
          element={
            <ActiveSessions />
          }
        />

        <Route
          path="/verificacion"
          element={
            <SecurityVerification
              session={session}
            />
          }
        />

        <Route
          path="*"
          element={<Home />}
        />
      </Routes>

      <footer className="footer">
        <div>
          <strong>
            VaniDaxi
          </strong>

          <p>
            Compra y vende de todo en
            un solo lugar.
          </p>
        </div>

        <div className="footer-links">
          <Link to="/catalogo">
            Comprar
          </Link>

          <Link to="/vender">
            Vender
          </Link>

          <Link to="/cuenta">
            Mi cuenta
          </Link>

          <Link to="/ayuda">
            Ayuda
          </Link>
        </div>

        <small>
          © 2026 VaniDaxi. Todos los
          derechos reservados.
        </small>
      </footer>

      <Link
        to="/ayuda"
        className="support-floating"
        aria-label="Ayuda"
      >
        💬
      </Link>

      {authOpen && (
        <AuthModal
          initialMode={authMode}
          onClose={() =>
            setAuthOpen(false)
          }
        />
      )}
    </div>
  );
}

export default App;
