import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!error && mounted) {
        setSession(data?.session ?? null);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setMessage("");
    setLoading(false);
  };

  const openAuth = (mode = "login") => {
    setAuthMode(mode);
    setMessage("");
    setShowAuth(true);
  };

  const closeAuth = () => {
    setShowAuth(false);
    resetForm();
  };

  const switchAuthMode = (mode) => {
    setAuthMode(mode);
    setMessage("");
  };

  const handleEmailAuth = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: name.trim(),
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data?.session) {
          closeAuth();
        } else {
          setMessage(
            "Cuenta creada. Revisa tu correo electrónico para confirmar tu cuenta."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          throw error;
        }

        closeAuth();
      }
    } catch (error) {
      setMessage(
        error?.message || "Ocurrió un error. Inténtalo nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setSession(null);
    } catch (error) {
      setMessage(error?.message || "No se pudo cerrar la sesión.");
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="app">
      {/* ================= HEADER ================= */}

      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={() => scrollToSection("inicio")}
          aria-label="SHORASHOPP inicio"
        >
          <span className="brand-symbol">S</span>

          <span className="brand-name">
            SHORA<span>SHOPP</span>
          </span>
        </button>

        <nav className="desktop-nav">
          <button
            type="button"
            onClick={() => scrollToSection("inicio")}
          >
            Inicio
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("productos")}
          >
            Productos
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("categorias")}
          >
            Categorías
          </button>

          <button
            type="button"
            onClick={() => scrollToSection("nosotros")}
          >
            Nosotros
          </button>
        </nav>

        <div className="header-actions">
          <button
            className="header-icon"
            type="button"
            aria-label="Buscar"
          >
            ⌕
          </button>

          <button
            className="header-icon cart-button"
            type="button"
            aria-label="Carrito"
          >
            🛒
            <small>0</small>
          </button>

          {session ? (
            <button
              className="header-account logged"
              type="button"
              onClick={handleLogout}
              disabled={loading}
            >
              {loading ? "..." : "Salir"}
            </button>
          ) : (
            <button
              className="header-account"
              type="button"
              onClick={() => openAuth("login")}
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      {/* ================= MAIN ================= */}

      <main>
        {/* ================= HERO ================= */}

        <section className="hero" id="inicio">
          <div className="hero-left">
            <div className="hero-label">
              <span className="label-dot" />
              NUEVA TEMPORADA
            </div>

            <h1>
              Encuentra
              <br />
              tu <em>estilo.</em>
            </h1>

            <p className="hero-description">
              Descubre productos únicos, tendencias y todo lo que
              necesitas para expresar quién eres.
            </p>

            <div className="hero-actions">
              <button
                className="main-button"
                type="button"
                onClick={() => scrollToSection("productos")}
              >
                <span>Explorar productos</span>
                <strong>↗</strong>
              </button>

              <button
                className="outline-button"
                type="button"
                onClick={() => openAuth("register")}
              >
                Crear cuenta
              </button>
            </div>

            <div className="hero-mini-info">
              <div>
                <strong>+1K</strong>
                <span>Productos</span>
              </div>

              <div>
                <strong>+500</strong>
                <span>Clientes</span>
              </div>

              <div>
                <strong>24/7</strong>
                <span>Disponible</span>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-background-shape" />

            <div className="floating-card floating-card-top">
              <span>01</span>
              <strong>DISCOVER</strong>
            </div>

            <div className="hero-main-card">
              <div className="hero-main-card-top">
                <span>SHORA</span>
                <span>2026</span>
              </div>

              <div className="hero-main-logo">S</div>

              <div className="hero-main-card-bottom">
                <span>SHOP</span>
                <span>DISCOVER</span>
                <span>INSPIRE</span>
              </div>
            </div>

            <div className="floating-card floating-card-bottom">
              <span>NEW</span>
              <strong>COLLECTION</strong>
            </div>

            <div className="hero-round-text">
              SHOP • DISCOVER • INSPIRE •
            </div>
          </div>
        </section>

        {/* ================= MARQUEE ================= */}

        <section className="marquee">
          <div className="marquee-track">
            <span>SHORASHOPP</span>
            <i>✦</i>
            <span>SHOP</span>
            <i>✦</i>
            <span>DISCOVER</span>
            <i>✦</i>
            <span>INSPIRE</span>
            <i>✦</i>
            <span>SHORASHOPP</span>
            <i>✦</i>
            <span>SHOP</span>
            <i>✦</i>
          </div>
        </section>

        {/* ================= CATEGORÍAS ================= */}

        <section
          className="section categories-section"
          id="categorias"
        >
          <div className="section-header">
            <div>
              <span className="section-label">01 / EXPLORA</span>
              <h2>Categorías</h2>
            </div>

            <button
              className="simple-link"
              type="button"
              onClick={() => scrollToSection("productos")}
            >
              Ver todas <span>↗</span>
            </button>
          </div>

          <div className="categories-grid">
            <button
              className="category-card category-fashion"
              type="button"
              onClick={() => scrollToSection("productos")}
            >
              <span className="category-index">01</span>

              <div>
                <h3>Moda</h3>
                <p>Prendas y accesorios para cada ocasión.</p>
              </div>

              <span className="category-arrow">↗</span>
            </button>

            <button
              className="category-card category-tech"
              type="button"
              onClick={() => scrollToSection("productos")}
            >
              <span className="category-index">02</span>

              <div>
                <h3>Tecnología</h3>
                <p>Innovación para tu día a día.</p>
              </div>

              <span className="category-arrow">↗</span>
            </button>

            <button
              className="category-card category-home"
              type="button"
              onClick={() => scrollToSection("productos")}
            >
              <span className="category-index">03</span>

              <div>
                <h3>Hogar</h3>
                <p>Detalles para hacer especial tu espacio.</p>
              </div>

              <span className="category-arrow">↗</span>
            </button>

            <button
              className="category-card category-beauty"
              type="button"
              onClick={() => scrollToSection("productos")}
            >
              <span className="category-index">04</span>

              <div>
                <h3>Belleza</h3>
                <p>Cuida, descubre y resalta tu estilo.</p>
              </div>

              <span className="category-arrow">↗</span>
            </button>
          </div>
        </section>

        {/* ================= PRODUCTOS ================= */}

        <section
          className="section products-section"
          id="productos"
        >
          <div className="section-header">
            <div>
              <span className="section-label">02 / SELECCIÓN</span>
              <h2>Productos destacados</h2>
            </div>

            <button className="simple-link" type="button">
              Explorar todo <span>↗</span>
            </button>
          </div>

          <div className="products-grid">
            <article className="product-card">
              <div className="product-photo product-photo-one">
                <span className="product-badge">NUEVO</span>

                <button
                  className="favorite-button"
                  type="button"
                  aria-label="Agregar a favoritos"
                >
                  ♡
                </button>

                <div className="product-photo-symbol">S</div>
              </div>

              <div className="product-details">
                <div>
                  <span>SHORASHOPP</span>
                  <h3>Producto esencial</h3>
                </div>

                <strong>$499</strong>
              </div>
            </article>

            <article className="product-card">
              <div className="product-photo product-photo-two">
                <span className="product-badge">POPULAR</span>

                <button
                  className="favorite-button"
                  type="button"
                  aria-label="Agregar a favoritos"
                >
                  ♡
                </button>

                <div className="product-photo-symbol">S</div>
              </div>

              <div className="product-details">
                <div>
                  <span>SHORASHOPP</span>
                  <h3>Selección premium</h3>
                </div>

                <strong>$699</strong>
              </div>
            </article>

            <article className="product-card">
              <div className="product-photo product-photo-three">
                <span className="product-badge">TOP</span>

                <button
                  className="favorite-button"
                  type="button"
                  aria-label="Agregar a favoritos"
                >
                  ♡
                </button>

                <div className="product-photo-symbol">S</div>
              </div>

              <div className="product-details">
                <div>
                  <span>SHORASHOPP</span>
                  <h3>Edición especial</h3>
                </div>

                <strong>$899</strong>
              </div>
            </article>
          </div>
        </section>

        {/* ================= NOSOTROS ================= */}

        <section className="about-section" id="nosotros">
          <div className="about-number">03</div>

          <div className="about-content">
            <span className="section-label">
              SOBRE SHORASHOPP
            </span>

            <h2>
              Compra
              <br />
              <em>diferente.</em>
            </h2>
          </div>

          <div className="about-description">
            <p>
              Creamos un espacio donde descubrir productos sea tan
              importante como encontrar exactamente lo que estabas
              buscando.
            </p>

            <button
              className="main-button"
              type="button"
              onClick={() => openAuth("register")}
            >
              <span>Únete a nosotros</span>
              <strong>↗</strong>
            </button>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}

      <footer className="footer">
        <div className="footer-top">
          <button
            className="brand footer-brand"
            type="button"
            onClick={() => scrollToSection("inicio")}
          >
            <span className="brand-symbol">S</span>

            <span className="brand-name">
              SHORA<span>SHOPP</span>
            </span>
          </button>

          <div className="footer-links">
            <button
              type="button"
              onClick={() => scrollToSection("inicio")}
            >
              Inicio
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("productos")}
            >
              Productos
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("categorias")}
            >
              Categorías
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("nosotros")}
            >
              Nosotros
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 SHORASHOPP</span>
          <span>Todos los derechos reservados.</span>
        </div>
      </footer>

      {/* ================= MODAL DE AUTENTICACIÓN ================= */}

      {showAuth && (
        <div
          className="auth-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeAuth();
            }
          }}
        >
          <div
            className="auth-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="auth-close"
              type="button"
              onClick={closeAuth}
              aria-label="Cerrar"
            >
              ×
            </button>

            <div className="auth-decoration">
              <span>S</span>
            </div>

            <div className="auth-header">
              <span className="section-label">
                {authMode === "login"
                  ? "BIENVENIDO"
                  : "ÚNETE"}
              </span>

              <h2>
                {authMode === "login" ? (
                  <>
                    Bienvenido
                    <br />
                    de <em>nuevo.</em>
                  </>
                ) : (
                  <>
                    Crea tu
                    <br />
                    <em>cuenta.</em>
                  </>
                )}
              </h2>

              <p>
                {authMode === "login"
                  ? "Inicia sesión para continuar en SHORASHOPP."
                  : "Forma parte de la comunidad SHORASHOPP."}
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={handleEmailAuth}
            >
              {authMode === "register" && (
                <label>
                  <span>Nombre</span>

                  <input
                    type="text"
                    placeholder="Tu nombre completo"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    autoComplete="name"
                    required
                  />
                </label>
              )}

              <label>
                <span>Correo electrónico</span>

                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                <span>Contraseña</span>

                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete={
                    authMode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                  minLength={6}
                  required
                />
              </label>

              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
              >
                <span>
                  {loading
                    ? "Procesando..."
                    : authMode === "login"
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
                </span>

                {!loading && <strong>↗</strong>}
              </button>
            </form>

            {message && (
              <div className="auth-message">
                {message}
              </div>
            )}

            <div className="auth-switch">
              {authMode === "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      switchAuthMode("register")
                    }
                  >
                    Regístrate
                  </button>
                </>
              ) : (
                <>
        
