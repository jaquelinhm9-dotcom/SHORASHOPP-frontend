import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setMessage("");
    setShowAuth(true);
  };

  const closeAuth = () => {
    setShowAuth(false);
    setMessage("");
    setEmail("");
    setPassword("");
    setPhone("");
    setName("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (authMode === "register") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone,
            },
          },
        });

        if (error) throw error;

        setMessage(
          "Cuenta creada. Revisa tu correo para confirmar tu cuenta."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        closeAuth();
      }
    } catch (error) {
      setMessage(error.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    if (!phone) {
      setMessage("Escribe tu número de teléfono.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;

      setMessage("Te enviamos un código de verificación por SMS.");
    } catch (error) {
      setMessage(error.message || "No se pudo enviar el código.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <span>SHORASHOPP</span>
        </div>

        <nav className="nav">
          <a href="#inicio">Inicio</a>
          <a href="#productos">Productos</a>
          <a href="#categorias">Categorías</a>
          <a href="#nosotros">Nosotros</a>
        </nav>

        <div className="header-actions">
          <button className="icon-button" aria-label="Buscar">
            ⌕
          </button>

          <button className="icon-button" aria-label="Carrito">
            🛒
          </button>

          {session ? (
            <button className="account-button" onClick={handleLogout}>
              Cerrar sesión
            </button>
          ) : (
            <button
              className="account-button"
              onClick={() => openAuth("login")}
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-content">
            <span className="eyebrow">NUEVA TEMPORADA</span>

            <h1>
              Encuentra tu
              <br />
              <span>estilo.</span>
            </h1>

            <p>
              Descubre productos únicos, tendencias y todo lo que necesitas
              para expresar quién eres.
            </p>

            <div className="hero-buttons">
              <button
                className="primary-button"
                onClick={() =>
                  document
                    .getElementById("productos")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explorar productos
                <span>→</span>
              </button>

              <button
                className="secondary-button"
                onClick={() => openAuth("register")}
              >
                Crear cuenta
              </button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card card-one">
              <span>01</span>
            </div>

            <div className="hero-card card-two">
              <span>02</span>
            </div>

            <div className="hero-circle">
              <div className="circle-text">SHOP • DISCOVER • INSPIRE •</div>
              <strong>S</strong>
            </div>
          </div>
        </section>

        <section className="categories" id="categorias">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORA</span>
              <h2>Categorías</h2>
            </div>

            <button className="text-button">
              Ver todas <span>→</span>
            </button>
          </div>

          <div className="category-grid">
            <article className="category-card">
              <div className="category-number">01</div>
              <h3>Moda</h3>
              <p>Prendas y accesorios para cada ocasión.</p>
              <span className="category-arrow">↗</span>
            </article>

            <article className="category-card">
              <div className="category-number">02</div>
              <h3>Tecnología</h3>
              <p>Innovación para tu día a día.</p>
              <span className="category-arrow">↗</span>
            </article>

            <article className="category-card">
              <div className="category-number">03</div>
              <h3>Hogar</h3>
              <p>Detalles que hacen especial tu espacio.</p>
              <span className="category-arrow">↗</span>
            </article>

            <article className="category-card">
              <div className="category-number">04</div>
              <h3>Belleza</h3>
              <p>Cuida, descubre y resalta tu estilo.</p>
              <span className="category-arrow">↗</span>
            </article>
          </div>
        </section>

        <section className="products" id="productos">
          <div className="section-heading">
            <div>
              <span className="eyebrow">SELECCIÓN</span>
              <h2>Productos destacados</h2>
            </div>

            <button className="text-button">
              Explorar todo <span>→</span>
            </button>
          </div>

          <div className="product-grid">
            <article className="product-card">
              <div className="product-image image-one">
                <span className="product-tag">NUEVO</span>
              </div>

              <div className="product-info">
                <div>
                  <h3>Producto esencial</h3>
                  <p>SHORASHOPP</p>
                </div>
                <strong>$499</strong>
              </div>
            </article>

            <article className="product-card">
              <div className="product-image image-two">
                <span className="product-tag">POPULAR</span>
              </div>

              <div className="product-info">
                <div>
                  <h3>Selección premium</h3>
                  <p>SHORASHOPP</p>
                </div>
                <strong>$699</strong>
              </div>
            </article>

            <article className="product-card">
              <div className="product-image image-three">
                <span className="product-tag">TOP</span>
              </div>

              <div className="product-info">
                <div>
                  <h3>Edición especial</h3>
                  <p>SHORASHOPP</p>
                </div>
                <strong>$899</strong>
              </div>
            </article>
          </div>
        </section>

        <section className="about" id="nosotros">
          <div>
            <span className="eyebrow">SOBRE SHORASHOPP</span>
            <h2>Compra diferente.</h2>
          </div>

          <p>
            Creamos un espacio donde descubrir productos sea tan importante
            como encontrar exactamente lo que estabas buscando.
          </p>
        </section>
      </main>

      <footer className="footer">
        <div className="brand">
          <div className="brand-mark">S</div>
          <span>SHORASHOPP</span>
        </div>

        <p>© 2026 SHORASHOPP. Todos los derechos reservados.</p>
      </footer>

      {showAuth && (
        <div className="modal-overlay" onClick={closeAuth}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeAuth}>
              ×
            </button>

            <div className="auth-header">
              <span className="eyebrow">
                {authMode === "login" ? "BIENVENIDO" : "ÚNETE"}
              </span>

              <h2>
                {authMode === "login"
                  ? "Inicia sesión."
                  : "Crea tu cuenta."}
              </h2>

              <p>
                {authMode === "login"
                  ? "Accede a tu cuenta de SHORASHOPP."
                  : "Forma parte de SHORASHOPP."}
              </p>
            </div>

            <form onSubmit={handleAuth}>
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              )}

              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              {authMode === "register" && (
                <input
                  type="tel"
                  placeholder="Número de teléfono"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              )}

              <button
                className="auth-submit"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Procesando..."
                  : authMode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
              </button>
            </form>

            <div className="auth-divider">
              <span>o</span>
            </div>

            <div className="phone-login">
              <input
                type="tel"
                placeholder="+52 000 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <button
                type="button"
                onClick={handlePhoneLogin}
                disabled={loading}
              >
                Continuar con teléfono
              </button>
            </div>

            {message && <div className="auth-message">{message}</div>}

            <div className="auth-switch">
              {authMode === "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button onClick={() => setAuthMode("register")}>
                    Regístrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button onClick={() => setAuthMode("login")}>
                    Inicia sesión
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
