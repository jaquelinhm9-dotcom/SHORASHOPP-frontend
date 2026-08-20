import { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./lib/supabase";

export default function App() {
  const [showAccount, setShowAccount] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAccount = () => {
    setActivePanel(null);
    setShowAuth(false);
    setShowAccount(true);
  };

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setMessage("");
    setShowAccount(false);
    setShowAuth(true);
  };

  const openPanel = (panel) => {
    setShowAccount(false);
    setShowAuth(false);
    setActivePanel(panel);
  };

  const closePanels = () => {
    setShowAccount(false);
    setShowAuth(false);
    setActivePanel(null);
  };

  const handleAuth = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setMessage(
        "La conexión con SHORASHOPP no está disponible en este momento."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      if (authMode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) throw error;

        setMessage(
          "¡Registro exitoso! Revisa tu correo para confirmar tu cuenta. ✨"
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage("¡Bienvenido a SHORASHOPP! ✨");
      }
    } catch (error) {
      setMessage(error.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    closePanels();
    setMessage("");
  };

  const panelData = {
    profile: {
      icon: "👤",
      title: "Mi perfil",
      subtitle: "Administra tu información personal.",
    },
    orders: {
      icon: "📦",
      title: "Mis pedidos",
      subtitle: "Aquí aparecerán tus compras.",
    },
    products: {
      icon: "🛍️",
      title: "Mis productos",
      subtitle: "Administra los productos que publiques.",
    },
    messages: {
      icon: "💬",
      title: "Mensajes",
      subtitle: "Comunícate con compradores y vendedores.",
    },
    favorites: {
      icon: "❤️",
      title: "Favoritos",
      subtitle: "Aquí aparecerán los productos que guardes.",
    },
    settings: {
      icon: "⚙️",
      title: "Configuración",
      subtitle: "Personaliza tu experiencia en SHORASHOPP.",
    },
    cart: {
      icon: "🛒",
      title: "Mi carrito",
      subtitle: "Aquí aparecerán los productos que agregues.",
    },
  };

  const currentPanel = activePanel ? panelData[activePanel] : null;

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">

        <button
          className="logo logoButton"
          onClick={() => {
            closePanels();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span>SHORA</span>
          <strong>SHOPP</strong>
        </button>

        <div className="searchBox">
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
          />
          <button aria-label="Buscar">⌕</button>
        </div>

        <div className="headerActions">

          <button
            className="headerButton"
            onClick={() => openPanel("cart")}
            aria-label="Carrito"
          >
            🛒
          </button>

          <button
            className="headerButton accountButton"
            onClick={openAccount}
            aria-label="Cuenta"
          >
            ✨
          </button>

        </div>

      </header>

      {/* HERO */}
      <main>

        <section className="hero">

          <div className="heroContent">

            <div className="heroText">

              <div className="heroTag">
                ✦ TODO EN UN SOLO LUGAR
              </div>

              <h1>
                Compra.
                <br />
                Vende.
                <br />
                <span>Descubre.</span>
              </h1>

              <p>
                Encuentra productos increíbles,
                descubre nuevas oportunidades y
                compra directamente a vendedores
                de SHORASHOPP.
              </p>

              <div className="heroButtons">

                <button
                  className="primaryButton"
                  onClick={() =>
                    document
                      .getElementById("categorias")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Explorar productos
                  <span>→</span>
                </button>

                <button
                  className="secondaryButton"
                  onClick={() => openPanel("products")}
                >
                  Quiero vender
                </button>

              </div>

            </div>

            <div className="heroVisual">

              <div className="glow glowOne"></div>
              <div className="glow glowTwo"></div>

              <div className="mainCircle">

                <div className="circleContent">

                  <div className="shoppingBag">
                    🛍️
                  </div>

                  <div className="circleText">
                    SHORA
                    <strong>SHOPP</strong>
                  </div>

                </div>

              </div>

              <div className="floatingCard cardOne">
                <div className="floatingIcon">👜</div>
                <div>
                  <strong>Moda</strong>
                  <small>Descubre más</small>
                </div>
              </div>

              <div className="floatingCard cardTwo">
                <div className="floatingIcon">📱</div>
                <div>
                  <strong>Tecnología</strong>
                  <small>Lo más nuevo</small>
                </div>
              </div>

              <div className="floatingCard cardThree">
                <div className="floatingIcon">🏠</div>
                <div>
                  <strong>Hogar</strong>
                  <small>Encuentra todo</small>
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* CATEGORÍAS */}
        <section
          className="categories"
          id="categorias"
        >

          <div className="sectionTitle">

            <span>CATEGORÍAS</span>

            <h2>
              Explora lo que buscas
            </h2>

            <p>
              Todo lo que necesitas, en un solo lugar.
            </p>

          </div>

          <div className="categoryGrid">

            {[
              ["👗", "Moda"],
              ["📱", "Tecnología"],
              ["🏠", "Hogar"],
              ["💄", "Belleza"],
              ["🎮", "Entretenimiento"],
              ["🚗", "Automóviles"],
            ].map(([icon, name]) => (
              <button
                className="categoryCard"
                key={name}
                onClick={() => openPanel("cart")}
              >
                <div className="categoryIcon">{icon}</div>
                <strong>{name}</strong>
                <span>Ver productos →</span>
              </button>
            ))}

          </div>

        </section>

        {/* PRODUCTOS */}
        <section className="featured">

          <div className="featuredHeader">

            <div>

              <span>DESCUBRE</span>

              <h2>
                Productos destacados
              </h2>

              <p>
                Descubre productos que podrían gustarte.
              </p>

            </div>

            <button
              className="viewAll"
              onClick={() => openPanel("cart")}
            >
              Ver todos →
            </button>

          </div>

          <div className="productGrid">

            <article className="productCard">

              <div className="productImage productPink">
                👜
              </div>

              <div className="productInfo">

                <span>MODA</span>

                <h3>
                  Nuevas tendencias
                </h3>

                <p>
                  Descubre productos de moda.
                </p>

                <button
                  className="productAction"
                  onClick={() => openPanel("cart")}
                >
                  Ver producto →
                </button>

              </div>

            </article>

            <article className="productCard">

              <div className="productImage productPurple">
                📱
              </div>

              <div className="productInfo">

                <span>TECNOLOGÍA</span>

                <h3>
                  Tecnología
                </h3>

                <p>
                  Encuentra lo último.
                </p>

                <button
                  className="productAction"
                  onClick={() => openPanel("cart")}
                >
                  Ver producto →
                </button>

              </div>

            </article>

            <article className="productCard">

              <div className="productImage productOrange">
                🏠
              </div>

              <div className="productInfo">

                <span>HOGAR</span>

                <h3>
                  Para tu hogar
                </h3>

                <p>
                  Todo para tu espacio.
                </p>

                <button
                  className="productAction"
                  onClick={() => openPanel("cart")}
                >
                  Ver producto →
                </button>

              </div>

            </article>

          </div>

        </section>

        {/* VENDE */}
        <section className="sellerSection">

          <div className="sellerContent">

            <span>
              VENDE EN SHORASHOPP
            </span>

            <h2>
              Tu producto.
              <br />
              Tu oportunidad.
            </h2>

            <p>
              Publica tus productos y conecta
              con nuevos compradores.
            </p>

            <button
              onClick={() => openPanel("products")}
            >
              Comenzar a vender →
            </button>

          </div>

          <div className="sellerVisual">
            🛍️
          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer>

        <div className="footerLogo">
          SHORA<strong>SHOPP</strong>
        </div>

        <p>
          Compra, vende y descubre.
        </p>

        <div className="footerLinks">

          <button onClick={() => openPanel("messages")}>
            Ayuda
          </button>

          <button onClick={() => openPanel("settings")}>
            Privacidad
          </button>

          <button onClick={() => openPanel("settings")}>
            Términos
          </button>

          <button onClick={() => openPanel("messages")}>
            Contacto
          </button>

        </div>

        <small>
          © 2026 SHORASHOPP. Todos los derechos reservados.
        </small>

      </footer>

      {/* PANEL DE CUENTA */}
      {showAccount && (

        <div
          className="accountOverlay"
          onClick={() => setShowAccount(false)}
        >

          <aside
            className="accountPanel"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="accountPanelHeader">

              <div className="accountIdentity">

                <div className="accountAvatar">
                  ✨
                </div>

                <div>

                  <strong>
                    {user
                      ? "Mi cuenta"
                      : "Bienvenido a SHORASHOPP"}
                  </strong>

                  <small>
                    {user
                      ? user.email
                      : "Inicia sesión para continuar"}
                  </small>

                </div>

              </div>

              <button
                className="panelClose"
                onClick={() => setShowAccount(false)}
              >
                ×
              </button>

            </div>

            {!user && (

              <div className="accountLoginBox">

                <p>
                  Accede a tu cuenta para disfrutar
                  de todas las funciones.
                </p>

                <button
                  className="panelPrimary"
                  onClick={() => openAuth("login")}
                >
                  Iniciar sesión
                </button>

                <button
                  className="panelSecondary"
                  onClick={() => openAuth("register")}
                >
                  Crear una cuenta
                </button>

              </div>

            )}

            <nav className="accountMenu">

              <button onClick={() => openPanel("profile")}>
                <span>👤</span>
                <div>
                  <strong>Mi perfil</strong>
                  <small>Información personal</small>
                </div>
                <b>›</b>
              </button>

              <button onClick={() => openPanel("orders")}>
                <span>📦</span>
                <div>
                  <strong>Mis pedidos</strong>
                  <small>Consulta tus compras</small>
                </div>
                <b>›</b>
              </button>

              <button onClick={() => openPanel("products")}>
                <span>🛍️</span>
                <div>
                  <strong>Mis productos</strong>
                  <small>Administra tus publicaciones</small>
                </div>
                <b>›</b>
              </button>

              <button onClick={() => openPanel("messages")}>
                <span>💬</span>
                <div>
                  <strong>Mensajes</strong>
                  <small>Compradores y vendedores</small>
                </div>
                <b>›</b>
              </button>

              <button onClick={() => openPanel("favorites")}>
                <span>❤️</span>
                <div>
                  <strong>Favoritos</strong>
                  <small>Productos que guardaste</small>
                </div>
                <b>›</b>
              </button>

              <button onClick={() => openPanel("settings")}>
                <span>⚙️</span>
                <div>
                  <strong>Configuración</strong>
                  <small>Preferencias de tu cuenta</small>
                </div>
                <b>›</b>
              </button>

            </nav>

            {user && (

              <button
                className="logoutButton"
                onClick={handleLogout}
              >
                🚪 Cerrar sesión
              </button>

            )}

          </aside>

        </div>

      )}

      {/* VENTANAS INTERNAS */}
      {activePanel && currentPanel && (

        <div
          className="featureOverlay"
          onClick={closePanels}
        >

          <section
            className="featureModal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="featureClose"
              onClick={closePanels}
            >
              ×
            </button>

            <div className="featureIcon">
              {currentPanel.icon}
            </div>

            <h2>
              {currentPanel.title}
            </h2>

            <p className="featureSubtitle">
              {currentPanel.subtitle}
            </p>

            {!user && activePanel !== "cart" ? (

              <div className="emptyFeature">

                <div>✨</div>

                <h3>
                  Inicia sesión para continuar
                </h3>

                <p>
                  Necesitas una cuenta de SHORASHOPP
                  para utilizar esta sección.
                </p>

                <button
                  className="featurePrimary"
                  onClick={() => openAuth("login")}
                >
                  Iniciar sesión
                </button>

                <button
                  className="featureSecondary"
                  onClick={() => openAuth("register")}
                >
                  Crear una cuenta
                </button>

              </div>

            ) : (

              <div className="emptyFeature">

                <div className="emptyBig">
                  {currentPanel.icon}
                </div>

                <h3>
                  Esta sección está lista para crecer
                </h3>

                <p>
                  Aquí construiremos esta función de
                  SHORASHOPP en el siguiente paso.
                </p>

                <button
                  className="featurePrimary"
                  onClick={closePanels}
                >
                  Volver a SHORASHOPP
                </button>

              </div>

            )}

          </section>

        </div>

      )}

      {/* AUTENTICACIÓN */}
      {showAuth && (

        <div
          className="authOverlay"
          onClick={() => setShowAuth(false)}
        >

          <div
            className="authModal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="authClose"
              onClick={() => setShowAuth(false)}
            >
              ×
            </button>

            <div className="authLogo">
              ✨
            </div>

            <h2>
              {authMode === "login"
                ? "Bienvenido a SHORASHOPP"
                : "Crea tu cuenta"}
            </h2>

            <p className="authSubtitle">
              {authMode === "login"
                ? "Inicia sesión para continuar."
                : "Regístrate y comienza a disfrutar SHORASHOPP."}
            </p>

            <form onSubmit={handleAuth}>

              {authMode === "register" && (

                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  required
                />

              )}

              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength="6"
                required
              />

              <button
                type="submit"
                className="authSubmit"
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : authMode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
              </button>

              {message && (

                <p className="authMessage">
                  {message}
                </p>

              )}

              <button
                type="button"
                className="authSwitch"
                onClick={() => {

                  setAuthMode(
                    authMode === "login"
                      ? "register"
                      : "login"
                  );

                  setMessage("");

                }}
              >
                {authMode === "login"
                  ? "¿No tienes cuenta? Regístrate"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}
