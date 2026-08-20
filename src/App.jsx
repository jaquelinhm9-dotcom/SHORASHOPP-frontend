import { useState } from "react";
import "./App.css";

const categories = [
  "Todo",
  "Mujer",
  "Hombre",
  "Belleza",
  "Hogar",
  "Accesorios",
];

const products = [
  {
    id: 1,
    name: "Conjunto casual",
    price: "$399",
    oldPrice: "$599",
    category: "Mujer",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 2,
    name: "Bolsa elegante",
    price: "$299",
    oldPrice: "$450",
    category: "Accesorios",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 3,
    name: "Tenis urbanos",
    price: "$549",
    oldPrice: "$799",
    category: "Hombre",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
  },
  {
    id: 4,
    name: "Set de belleza",
    price: "$249",
    oldPrice: "$350",
    category: "Belleza",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=700&q=80",
  },
];

function App() {
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategory === "Todo" || product.category === activeCategory;

    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="app">
      {/* HEADER */}
      <header className="header">
        <div className="header-inner">
          <button
            className="mobile-menu"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Abrir menú"
          >
            ☰
          </button>

          <div className="logo">
            <span className="logo-main">SHORA</span>
            <span className="logo-shop">SHOPP</span>
          </div>

          <nav className={`nav ${showMenu ? "nav-open" : ""}`}>
            <button
              onClick={() => {
                setActiveCategory("Todo");
                setShowMenu(false);
              }}
            >
              Inicio
            </button>

            <button
              onClick={() => {
                setActiveCategory("Mujer");
                setShowMenu(false);
              }}
            >
              Mujer
            </button>

            <button
              onClick={() => {
                setActiveCategory("Hombre");
                setShowMenu(false);
              }}
            >
              Hombre
            </button>

            <button
              onClick={() => {
                setActiveCategory("Belleza");
                setShowMenu(false);
              }}
            >
              Belleza
            </button>

            <button
              onClick={() => {
                setActiveCategory("Hogar");
                setShowMenu(false);
              }}
            >
              Hogar
            </button>
          </nav>

          <div className="header-actions">
            <button
              className="login-link"
              onClick={() => setShowLogin(true)}
            >
              Iniciar sesión
            </button>

            <button
              className="register-button"
              onClick={() => setShowRegister(true)}
            >
              Registrarse
            </button>

            <button
              className="cart-button"
              onClick={() => alert("Carrito próximamente")}
              aria-label="Carrito"
            >
              🛒
              {cartCount > 0 && (
                <span className="cart-count">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <span className="hero-small">DESCUBRE · ELIGE · DISFRUTA</span>

              <h1>
                Todo lo que buscas,
                <br />
                <span>en un solo lugar.</span>
              </h1>

              <p>
                Encuentra productos increíbles, descubre nuevas opciones
                y compra de una manera sencilla.
              </p>

              <button
                className="hero-button"
                onClick={() => {
                  document
                    .getElementById("productos")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Explorar productos
                <span>→</span>
              </button>
            </div>

            <div className="hero-image-wrapper">
              <div className="hero-circle"></div>

              <img
                className="hero-image"
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85"
                alt="Productos de SHORASHOPP"
              />

              <div className="floating-card floating-card-one">
                <span>✨</span>
                <div>
                  <strong>Nuevos productos</strong>
                  <small>Descúbrelos ahora</small>
                </div>
              </div>

              <div className="floating-card floating-card-two">
                <strong>+100</strong>
                <small>productos</small>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="categories-section">
          <div className="section-heading">
            <div>
              <span className="section-label">EXPLORA</span>
              <h2>Categorías</h2>
            </div>

            <p>
              Encuentra exactamente lo que estás buscando.
            </p>
          </div>

          <div className="categories">
            {categories.map((category) => (
              <button
                key={category}
                className={
                  activeCategory === category ? "category active" : "category"
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* PRODUCTS */}
        <section className="products-section" id="productos">
          <div className="products-top">
            <div>
              <span className="section-label">NUESTRA SELECCIÓN</span>
              <h2>Productos destacados</h2>
            </div>

            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Buscar productos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-products">
              <div>🔎</div>
              <h3>No encontramos productos</h3>
              <p>Prueba con otra búsqueda o categoría.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image-wrapper">
                    <img src={product.image} alt={product.name} />

                    <button
                      className="favorite-button"
                      aria-label="Agregar a favoritos"
                    >
                      ♡
                    </button>

                    <span className="product-tag">Oferta</span>
                  </div>

                  <div className="product-info">
                    <span className="product-category">
                      {product.category}
                    </span>

                    <h3>{product.name}</h3>

                    <div className="product-price">
                      <strong>{product.price}</strong>
                      <del>{product.oldPrice}</del>
                    </div>

                    <button
                      className="add-cart"
                      onClick={() => setCartCount((count) => count + 1)}
                    >
                      Agregar al carrito
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="cta">
          <div>
            <span className="section-label">SHORASHOPP</span>
            <h2>Descubre algo que te encante.</h2>
            <p>
              Explora nuestra colección y encuentra tus próximos favoritos.
            </p>
          </div>

          <button
            onClick={() =>
              document
                .getElementById("productos")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Ver productos →
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div className="logo footer-logo">
              <span className="logo-main">SHORA</span>
              <span className="logo-shop">SHOPP</span>
            </div>

            <p>
              Tu espacio para descubrir productos que te encantan.
            </p>
          </div>

          <div className="footer-links">
            <div>
              <strong>Comprar</strong>
              <button>Mujer</button>
              <button>Hombre</button>
              <button>Belleza</button>
            </div>

            <div>
              <strong>Ayuda</strong>
              <button>Contacto</button>
              <button>Preguntas frecuentes</button>
              <button>Envíos</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 SHORASHOPP</span>
          <span>Hecho para comprar mejor.</span>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div
          className="modal-overlay"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={() => setShowLogin(false)}
            >
              ×
            </button>

            <span className="modal-label">BIENVENIDO</span>
            <h2>Iniciar sesión</h2>
            <p>Entra a tu cuenta de SHORASHOPP.</p>

            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="tu@email.com"
            />

            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
            />

            <button className="auth-button">
              Iniciar sesión
            </button>

            <div className="auth-divider">
              <span>o</span>
            </div>

            <button
              className="secondary-auth-button"
              onClick={() => {
                setShowLogin(false);
                setShowRegister(true);
              }}
            >
              Crear una cuenta
            </button>
          </div>
        </div>
      )}

      {/* REGISTER MODAL */}
      {showRegister && (
        <div
          className="modal-overlay"
          onClick={() => setShowRegister(false)}
        >
          <div
            className="auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={() => setShowRegister(false)}
            >
              ×
            </button>

            <span className="modal-label">SHORASHOPP</span>
            <h2>Crear cuenta</h2>
            <p>Regístrate para comenzar a comprar.</p>

            <label>Nombre</label>
            <input
              type="text"
              placeholder="Tu nombre"
            />

            <label>Correo electrónico</label>
            <input
              type="email"
              placeholder="tu@email.com"
            />

            <label>Contraseña</label>
            <input
              type="password"
              placeholder="Crea una contraseña"
            />

            <button className="auth-button">
              Registrarme
            </button>

            <p className="modal-footer-text">
              ¿Ya tienes una cuenta?{" "}
              <button
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);
                }}
              >
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
