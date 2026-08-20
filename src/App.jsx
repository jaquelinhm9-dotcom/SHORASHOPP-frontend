import { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./lib/supabase";

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
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

  const handleAuth = async (event) => {
    event.preventDefault();
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
          "¡Registro exitoso! Revisa tu correo para confirmar tu cuenta."
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
    await supabase.auth.signOut();
    setUser(null);
    setMessage("");
  };

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">

        <div className="logo">
          <span>SHORA</span>
          <strong>SHOPP</strong>
        </div>

        <div className="searchBox">
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
          />
          <button>⌕</button>
        </div>

        <div className="headerActions">

          <button className="headerButton">
            🛒
          </button>

          <button
            className="headerButton"
            onClick={() => {
              setShowAuth(true);
              setMessage("");
            }}
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

                <button className="primaryButton">
                  Explorar productos
                  <span>→</span>
                </button>

                <button className="secondaryButton">
                  Quiero vender
                </button>

              </div>

            </div>


            {/* VISUAL CENTRAL */}
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


              {/* TARJETAS FLOTANTES */}

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

        <section className="categories">

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

            <button className="categoryCard">
              <div className="categoryIcon">👗</div>
              <strong>Moda</strong>
              <span>Ver productos →</span>
            </button>

            <button className="categoryCard">
              <div className="categoryIcon">📱</div>
              <strong>Tecnología</strong>
              <span>Ver productos →</span>
            </button>

            <button className="categoryCard">
              <div className="categoryIcon">🏠</div>
              <strong>Hogar</strong>
              <span>Ver productos →</span>
            </button>

            <button className="categoryCard">
              <div className="categoryIcon">💄</div>
              <strong>Belleza</strong>
              <span>Ver productos →</span>
            </button>

            <button className="categoryCard">
              <div className="categoryIcon">🎮</div>
              <strong>Entretenimiento</strong>
              <span>Ver productos →</span>
            </button>

            <button className="categoryCard">
              <div className="categoryIcon">🚗</div>
              <strong>Automóviles</strong>
              <span>Ver productos →</span>
            </button>

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

            <button className="viewAll">
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

            <button>
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
          <span>Ayuda</span>
          <span>Privacidad</span>
          <span>Términos</span>
          <span>Contacto</span>
        </div>

        <small>
          © 2026 SHORASHOPP. Todos los derechos reservados.
        </small>

      </footer>


      {/* MODAL DE AUTENTICACIÓN */}

      {showAuth && (

        <div
          className="authOverlay"
          onClick={() => setShowAuth(false)}
        >

          <div
            className="authModal"
            onClick={(event) => event.stopPropagation()}
          >

            <button
              className="authClose"
              onClick={() => setShowAuth(false)}
              aria-label="Cerrar"
            >
              ×
            </button>

            <div className="authLogo">
              ✨
            </div>

            <h2>
              {user
                ? "¡Hola! ✨"
                : authMode === "login"
                ? "Bienvenido a SHORASHOPP"
                : "Crea tu cuenta"}
            </h2>

            {user ? (

              <div className="authLogged">

                <p>
                  Has iniciado sesión correctamente.
                </p>

                <p>
                  {user.email}
                </p>

                <button
                  className="authSubmit"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>

              </div>

            ) : (

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

            )}

          </div>

        </div>

      )}

    </div>
  );
}
