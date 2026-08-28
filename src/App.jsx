import { useMemo, useState } from "react";

const categories = [
  { name: "Ropa y Moda", icon: "👕" },
  { name: "Tecnología", icon: "📱" },
  { name: "Hogar y Vida", icon: "⌂" },
  { name: "Belleza y Salud", icon: "♙" },
  { name: "Accesorios", icon: "🎧" },
  { name: "Juguetes y Más", icon: "🎮" },
];

const products = [
  {
    id: 1,
    name: "Audífonos Inalámbricos",
    price: "$399.00",
    oldPrice: "$499.00",
    badge: "-20%",
    rating: "4.8",
    sales: "120 ventas",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 2,
    name: "Bolsa de Hombro Elegante",
    price: "$599.00",
    oldPrice: "",
    badge: "Nuevo",
    rating: "4.9",
    sales: "85 ventas",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 3,
    name: "Smartwatch Series 9",
    price: "$1,699.00",
    oldPrice: "$1,999.00",
    badge: "-15%",
    rating: "4.7",
    sales: "64 ventas",
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: 4,
    name: "Licuadora Profesional",
    price: "$899.00",
    oldPrice: "",
    badge: "Nuevo",
    rating: "4.6",
    sales: "45 ventas",
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=500&q=85",
  },
];

function App() {
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(2);
  const [menuOpen, setMenuOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [activeTab, setActiveTab] = useState("Inicio");
  const [showAccount, setShowAccount] = useState(false);
  const [showSell, setShowSell] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;

    return products.filter((product) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const toggleFavorite = (id) => {
    setFavoriteIds((current) =>
      current.includes(id)
        ? current.filter((favoriteId) => favoriteId !== id)
        : [...current, id]
    );
  };

  const addToCart = () => {
    setCartCount((count) => count + 1);
  };

  return (
    <>
      <div className="app-shell">
        <header className="top-header">
          <button
            className="icon-button menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
          >
            <span />
            <span />
            <span />
          </button>

          <div className="brand">
            <div className="brand-name">
              <span className="brand-red">SHORA</span>
              <span className="brand-purple">SHOPP</span>
            </div>

            <div className="brand-subtitle">
              <strong>Compra.</strong>
              <strong> Vende.</strong>
              <strong> Descubre.</strong>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="header-icon notification-button"
              onClick={() => alert("No tienes nuevas notificaciones")}
              aria-label="Notificaciones"
            >
              ♧
              <span className="notification-badge">3</span>
            </button>

            <button
              className="header-icon cart-header-button"
              onClick={() => setActiveTab("Carrito")}
              aria-label="Carrito"
            >
              🛒
              {cartCount > 0 && (
                <span className="notification-badge cart-badge">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="main-content">
          {/* BUSCADOR */}
          <section className="search-section">
            <div className="search-box">
              <span className="search-icon">⌕</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="¿Qué estás buscando hoy?"
              />

              <button
                className="search-submit"
                onClick={() =>
                  document.querySelector(".products-section")?.scrollIntoView({
                    behavior: "smooth",
                  })
                }
              >
                ⌕
              </button>
            </div>
          </section>

          {/* BOTONES CENTRALES */}
          <section className="main-cards">
            <button
              className="main-action-card sell-card"
              onClick={() => setShowSell(true)}
            >
              <div className="action-icon">🏪</div>

              <div className="action-content">
                <strong>Vende en</strong>
                <strong>SHORASHOPP</strong>

                <p>Únete y comienza a vender tus productos hoy</p>
              </div>

              <div className="action-arrow">›</div>
            </button>

            <button
              className="main-action-card account-card"
              onClick={() => setShowAccount(true)}
            >
              <div className="action-icon">♟</div>

              <div className="action-content">
                <strong>Mi cuenta</strong>

                <p>
                  Inicia sesión o regístrate como comprador o vendedor
                </p>
              </div>

              <div className="action-arrow">›</div>
            </button>
          </section>

          {/* CATEGORÍAS */}
          <section className="categories-section">
            <div className="section-heading">
              <h2>Categorías</h2>

              <button onClick={() => setActiveTab("Categorías")}>
                Ver todas <span>›</span>
              </button>
            </div>

            <div className="categories-row">
              {categories.map((category) => (
                <button
                  className="category-card"
                  key={category.name}
                  onClick={() => {
                    setSearch("");
                    alert(`Categoría seleccionada: ${category.name}`);
                  }}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* OFERTA */}
          <section className="offer-section">
            <div className="offer-content">
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

              <button onClick={() => alert("Mostrando ofertas exclusivas")}>
                Ver ofertas <span>›</span>
              </button>
            </div>

            <div className="offer-visual">
              <span className="offer-percent">%</span>

              <img
                className="offer-watch"
                src="https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=85"
                alt="Smartwatch"
              />

              <img
                className="offer-shoe"
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=85"
                alt="Producto en oferta"
              />
            </div>
          </section>

          <div className="slider-dots">
            <span className="active" />
            <span />
            <span />
            <span />
          </div>

          {/* PRODUCTOS */}
          <section className="products-section">
            <div className="section-heading">
              <h2>Productos destacados</h2>

              <button onClick={() => alert("Mostrando todos los productos")}>
                Ver todos <span>›</span>
              </button>
            </div>

            <div className="products-grid">
              {filteredProducts.map((product) => {
                const isFavorite = favoriteIds.includes(product.id);

                return (
                  <article className="product-card" key={product.id}>
                    <div className="product-top">
                      <span
                        className={`product-badge ${
                          product.badge === "Nuevo" ? "new-badge" : ""
                        }`}
                      >
                        {product.badge}
                      </span>

                      <button
                        className={`favorite-button ${
                          isFavorite ? "favorite-active" : ""
                        }`}
                        onClick={() => toggleFavorite(product.id)}
                      >
                        ♡
                      </button>
                    </div>

                    <button
                      className="product-image-button"
                      onClick={addToCart}
                    >
                      <img src={product.image} alt={product.name} />
                    </button>

                    <div className="product-info">
                      <h3>{product.name}</h3>

                      <div className="product-price">
                        <strong>{product.price}</strong>

                        {product.oldPrice && (
                          <del>{product.oldPrice}</del>
                        )}
                      </div>

                      <div className="product-rating">
                        <span>★</span>
                        {product.rating}
                        <b>•</b>
                        {product.sales}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <div className="no-products">
                No encontramos productos con esa búsqueda.
              </div>
            )}
          </section>

          {/* BENEFICIOS */}
          <section className="benefits-section">
            <div className="benefit">
              <span className="benefit-icon">♢</span>

              <div>
                <strong>Compra segura</strong>
                <p>Protegemos tus datos y compras</p>
              </div>
            </div>

            <div className="benefit">
              <span className="benefit-icon">♧</span>

              <div>
                <strong>Envíos rápidos</strong>
                <p>Recibe tus productos en tiempo récord</p>
              </div>
            </div>

            <div className="benefit">
              <span className="benefit-icon">✿</span>

              <div>
                <strong>Vendedores verificados</strong>
                <p>Más confianza para ti</p>
              </div>
            </div>

            <div className="benefit">
              <span className="benefit-icon">☏</span>

              <div>
                <strong>Soporte 24/7</strong>
                <p>Estamos aquí para ayudarte</p>
              </div>
            </div>
          </section>

          <div className="bottom-space" />
        </main>

        {/* CHAT */}
        <button
          className="chat-button"
          onClick={() => setShowChat(true)}
          aria-label="Abrir soporte"
        >
          ☵
        </button>

        {/* BARRA INFERIOR */}
        <nav className="bottom-navigation">
          <button
            className={activeTab === "Inicio" ? "nav-active" : ""}
            onClick={() => setActiveTab("Inicio")}
          >
            <span>⌂</span>
            <small>Inicio</small>
          </button>

          <button
            className={activeTab === "Categorías" ? "nav-active" : ""}
            onClick={() => setActiveTab("Categorías")}
          >
            <span>▦</span>
            <small>Categorías</small>
          </button>

          <button
            className="sell-navigation-button"
            onClick={() => setShowSell(true)}
          >
            <span>♜</span>
            <small>Vender</small>
          </button>

          <button
            className={activeTab === "Favoritos" ? "nav-active" : ""}
            onClick={() => setActiveTab("Favoritos")}
          >
            <span>♡</span>
            <small>Favoritos</small>
          </button>

          <button
            className={activeTab === "Cuenta" ? "nav-active" : ""}
            onClick={() => {
              setActiveTab("Cuenta");
              setShowAccount(true);
            }}
          >
            <span>♙</span>
            <small>Cuenta</small>
          </button>
        </nav>

        {/* MENÚ */}
        {menuOpen && (
          <div className="modal-overlay" onClick={() => setMenuOpen(false)}>
            <aside
              className="side-menu"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="side-menu-header">
                <div>
                  <div className="brand-name side-brand">
                    <span className="brand-red">SHORA</span>
                    <span className="brand-purple">SHOPP</span>
                  </div>

                  <p>Todo en un solo lugar</p>
                </div>

                <button onClick={() => setMenuOpen(false)}>×</button>
              </div>

              <button>👤 Mi perfil</button>
              <button>📦 Mis pedidos</button>
              <button>💬 Mensajes</button>
              <button>♡ Favoritos</button>
              <button>⚙ Configuración</button>
            </aside>
          </div>
        )}

        {/* CUENTA */}
        {showAccount && (
          <div
            className="modal-overlay centered"
            onClick={() => setShowAccount(false)}
          >
            <div
              className="modal-card"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setShowAccount(false)}
              >
                ×
              </button>

              <div className="modal-big-icon">♟</div>

              <h2>Mi cuenta</h2>

              <p>
                Inicia sesión o crea tu cuenta para comprar, vender y administrar
                tus pedidos.
              </p>

              <button className="modal-primary">
                Iniciar sesión
              </button>

              <button className="modal-secondary">
                Crear cuenta
              </button>
            </div>
          </div>
        )}

        {/* VENDER */}
        {showSell && (
          <div
            className="modal-overlay centered"
            onClick={() => setShowSell(false)}
          >
            <div
              className="modal-card"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setShowSell(false)}
              >
                ×
              </button>

              <div className="modal-big-icon">🏪</div>

              <h2>Vende en SHORASHOPP</h2>

              <p>
                Publica tus productos y comienza a llegar a nuevos compradores.
              </p>

              <button
                className="modal-primary"
                onClick={() => {
                  setShowSell(false);
                  alert("Aquí se abrirá la sección para publicar productos.");
                }}
              >
                Publicar producto
              </button>
            </div>
          </div>
        )}

        {/* CHAT */}
        {showChat && (
          <div
            className="modal-overlay centered"
            onClick={() => setShowChat(false)}
          >
            <div
              className="modal-card chat-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                className="modal-close"
                onClick={() => setShowChat(false)}
              >
                ×
              </button>

              <h2>Soporte SHORASHOPP</h2>

              <p>
                Hola 👋 ¿En qué podemos ayudarte?
              </p>

              <input placeholder="Escribe tu mensaje..." />

              <button className="modal-primary">
                Enviar mensaje
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          background: #ffffff;
        }

        body {
          margin: 0;
          min-width: 320px;
          background: #ffffff;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          color: #25252c;
        }

        button,
        input {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .app-shell {
          width: 100%;
          max-width: 560px;
          min-height: 100vh;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(circle at 100% 5%, rgba(121, 31, 155, 0.07), transparent 22%),
            radial-gradient(circle at 0% 40%, rgba(229, 0, 71, 0.04), transparent 28%),
            #ffffff;
          box-shadow: 0 0 40px rgba(20, 20, 35, 0.06);
        }

        .top-header {
          height: 82px;
          display: grid;
          grid-template-columns: 48px 1fr 92px;
          align-items: center;
          padding: 8px 20px;
          border-bottom: 1px solid #eeeeee;
          background: rgba(255, 255, 255, 0.96);
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .icon-button {
          width: 38px;
          height: 38px;
          border: 0;
          background: transparent;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          padding: 6px;
        }

        .menu-button span {
          width: 29px;
          height: 2px;
          display: block;
          background: #25252c;
        }

        .brand {
          text-align: center;
          min-width: 0;
        }

        .brand-name {
          font-size: 29px;
          line-height: 1;
          font-weight: 900;
          letter-spacing: -1.5px;
          white-space: nowrap;
        }

        .brand-red {
          color: #e60042;
        }

        .brand-purple {
          color: #5d168f;
        }

        .brand-subtitle {
          margin-top: 5px;
          font-size: 12px;
          color: #56535d;
          letter-spacing: 0.1px;
        }

        .brand-subtitle strong {
          font-weight: 650;
        }

        .header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }

        .header-icon {
          width: 36px;
          height: 42px;
          border: 0;
          background: transparent;
          font-size: 27px;
          position: relative;
          line-height: 1;
          padding: 0;
        }

        .notification-badge {
          position: absolute;
          top: 0px;
          right: 0px;
          min-width: 17px;
          height: 17px;
          padding: 0 4px;
          border-radius: 50%;
          background: #e60042;
          color: #fff;
          font-size: 10px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-badge {
          right: -3px;
        }

        .main-content {
          padding: 0 20px;
        }

        .search-section {
          padding: 13px 0 14px;
        }

        .search-box {
          height: 52px;
          width: 100%;
          display: flex;
          align-items: center;
          border: 1px solid #e8e6ea;
          background: #fff;
          box-shadow: 0 8px 20px rgba(40, 25, 55, 0.06);
          overflow: hidden;
        }

        .search-icon {
          width: 54px;
          text-align: center;
          font-size: 33px;
          line-height: 1;
          color: #56535c;
          transform: rotate(-20deg);
        }

        .search-box input {
          flex: 1;
          height: 100%;
          border: 0;
          outline: none;
          min-width: 0;
          color: #33313a;
          font-size: 15px;
          background: transparent;
        }

        .search-box input::placeholder {
          color: #7d7983;
        }

        .search-submit {
          width: 54px;
          height: 52px;
          border: 0;
          background: linear-gradient(135deg, #f00045, #9817b4);
          color: white;
          font-size: 30px;
          transform: rotate(-20deg);
        }

        .main-cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 22px;
        }

        .main-action-card {
          min-width: 0;
          min-height: 136px;
          border: 0;
          padding: 14px 12px;
          color: white;
          display: grid;
          grid-template-columns: 60px minmax(0, 1fr);
          grid-template-rows: 1fr auto;
          column-gap: 11px;
          text-align: left;
          box-shadow: 0 10px 22px rgba(73, 20, 88, 0.15);
          position: relative;
          overflow: hidden;
        }

        .sell-card {
          background: linear-gradient(135deg, #f30045 0%, #df004d 100%);
        }

        .account-card {
          background: linear-gradient(135deg, #b419a2 0%, #531293 100%);
        }

        .action-icon {
          width: 58px;
          height: 58px;
          background: #fff;
          color: #e50049;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          border-radius: 16px;
          grid-row: 1;
        }

        .account-card .action-icon {
          color: #66159d;
        }

        .action-content {
          min-width: 0;
        }

        .action-content strong {
          display: block;
          font-size: 18px;
          line-height: 1.16;
          font-weight: 800;
        }

        .action-content p {
          margin: 7px 0 0;
          font-size: 12px;
          line-height: 1.42;
          color: rgba(255, 255, 255, 0.9);
        }

        .action-arrow {
          position: absolute;
          width: 36px;
          height: 36px;
          right: 10px;
          bottom: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          color: #6e258f;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 33px;
          line-height: 1;
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 19px;
          letter-spacing: -0.5px;
          font-weight: 800;
        }

        .section-heading button {
          border: 0;
          background: transparent;
          color: #5b277f;
          font-weight: 750;
          font-size: 13px;
          white-space: nowrap;
        }

        .section-heading button span {
          font-size: 25px;
          vertical-align: -2px;
          margin-left: 4px;
        }

        .categories-section {
          margin-bottom: 18px;
        }

        .categories-row {
          display: flex;
          gap: 9px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }

        .categories-row::-webkit-scrollbar {
          display: none;
        }

        .category-card {
          flex: 0 0 103px;
          min-height: 119px;
          border: 1px solid #eeeeee;
          background: #ffffff;
          box-shadow: 0 6px 15px rgba(45, 32, 65, 0.06);
          padding: 11px 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .category-icon {
          font-size: 37px;
          line-height: 1;
          filter: saturate(1.2);
        }

        .category-card span:last-child {
          font-size: 11px;
          font-weight: 650;
          color: #39363f;
          text-align: center;
        }

        .offer-section {
          min-height: 194px;
          display: grid;
          grid-template-columns: 49% 51%;
          overflow: hidden;
          position: relative;
          background:
            radial-gradient(circle at 80% 20%, rgba(255,255,255,.18), transparent 24%),
            linear-gradient(115deg, #e7003d 0%, #ad0b89 49%, #501195 100%);
          color: white;
          box-shadow: 0 9px 18px rgba(80, 16, 120, 0.17);
        }

        .offer-content {
          padding: 20px 0 16px 22px;
          position: relative;
          z-index: 2;
        }

        .offer-content h2 {
          margin: 0;
          font-size: 23px;
          line-height: 1.05;
          letter-spacing: -0.5px;
        }

        .offer-content p {
          margin: 9px 0 13px;
          font-size: 13px;
          line-height: 1.38;
        }

        .offer-content button {
          height: 34px;
          padding: 0 15px;
          border: 0;
          border-radius: 18px;
          background: white;
          color: #c31565;
          font-size: 12px;
          font-weight: 800;
        }

        .offer-content button span {
          margin-left: 5px;
          font-size: 20px;
          vertical-align: -2px;
        }

        .offer-visual {
          position: relative;
          overflow: hidden;
        }

        .offer-percent {
          position: absolute;
          right: 12px;
          top: 15px;
          width: 61px;
          height: 73px;
          background: #f30049;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 47px;
          font-weight: 900;
          transform: rotate(7deg);
          z-index: 4;
        }

        .offer-watch {
          position: absolute;
          width: 118px;
          height: 128px;
          object-fit: cover;
          left: 7px;
          bottom: 12px;
          border-radius: 18px;
          transform: rotate(4deg);
          box-shadow: 0 12px 20px rgba(0,0,0,.24);
        }

        .offer-shoe {
          position: absolute;
          width: 124px;
          height: 88px;
          object-fit: cover;
          right: 6px;
          bottom: 7px;
          background: #fff;
          transform: rotate(-8deg);
          box-shadow: 0 12px 22px rgba(0,0,0,.2);
        }

        .slider-dots {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          padding: 9px 0 8px;
        }

        .slider-dots span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #bfc0c6;
        }

        .slider-dots .active {
          background: #e60042;
        }

        .products-section {
          padding-top: 0;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
        }

        .product-card {
          min-width: 0;
          border: 1px solid #ededed;
          background: white;
          box-shadow: 0 6px 15px rgba(35, 25, 50, 0.07);
          overflow: hidden;
          position: relative;
        }

        .product-top {
          position: absolute;
          z-index: 3;
          top: 8px;
          left: 8px;
          right: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          pointer-events: none;
        }

        .product-badge {
          padding: 5px 7px;
          background: #ee0044;
          color: white;
          font-size: 10px;
          line-height: 1;
          font-weight: 800;
          border-radius: 4px;
        }

        .new-badge {
          background: #6015a0;
        }

        .favorite-button {
          width: 30px;
          height: 30px;
          border: 0;
          background: rgba(255, 255, 255, 0.92);
          color: #4a4650;
          font-size: 23px;
          line-height: 1;
          pointer-events: auto;
        }

        .favorite-active {
          color: #e50046;
        }

        .product-image-button {
          width: 100%;
          height: 150px;
          border: 0;
          padding: 0;
          background: #f7f7f8;
          display: block;
        }

        .product-image-button img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          mix-blend-mode: multiply;
        }

        .product-info {
          padding: 9px 9px 11px;
        }

        .product-info h3 {
          margin: 0 0 7px;
          font-size: 12px;
          line-height: 1.25;
          min-height: 30px;
          color: #35323b;
        }

        .product-price {
          display: flex;
          align-items: baseline;
          gap: 5px;
          min-width: 0;
        }

        .product-price strong {
          color: #d90042;
          font-size: 15px;
          white-space: nowrap;
        }

        .product-price del {
          font-size: 9px;
          color: #86818b;
          white-space: nowrap;
        }

        .product-rating {
          margin-top: 7px;
          color: #6b6870;
          font-size: 10px;
        }

        .product-rating span {
          color: #f1b400;
          margin-right: 3px;
        }

        .product-rating b {
          margin: 0 4px;
          color: #aaa;
        }

        .no-products {
          padding: 30px 10px;
          text-align: center;
          color: #77727c;
          font-size: 14px;
        }

        .benefits-section {
          margin-top: 18px;
          border: 1px solid #ecebed;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          background: white;
          box-shadow: 0 6px 15px rgba(40, 28, 55, 0.05);
        }

        .benefit {
          min-height: 74px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border-bottom: 1px solid #efedf0;
        }

        .benefit:nth-child(odd) {
          border-right: 1px solid #efedf0;
        }

        .benefit:nth-last-child(-n + 2) {
          border-bottom: 0;
        }

        .benefit-icon {
          font-size: 25px;
          color: #861a9d;
          flex: 0 0 auto;
        }

        .benefit strong {
          display: block;
          font-size: 11px;
          margin-bottom: 4px;
        }

        .benefit p {
          margin: 0;
          color: #68636e;
          font-size: 9px;
          line-height: 1.35;
        }

        .bottom-space {
          height: 95px;
        }

        .chat-button {
          position: fixed;
          width: 58px;
          height: 58px;
          border: 0;
          border-radius: 50%;
          right: max(20px, calc((100vw - 560px) / 2 + 20px));
          bottom: 91px;
          z-index: 35;
          background: linear-gradient(135deg, #f00046, #75149d);
          color: white;
          font-size: 30px;
          box-shadow: 0 12px 24px rgba(143, 18, 112, 0.25);
        }

        .bottom-navigation {
          position: fixed;
          z-index: 40;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: min(100%, 560px);
          height: 74px;
          background: rgba(255, 255, 255, 0.98);
          border-top: 1px solid #eceaed;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          align-items: center;
          box-shadow: 0 -5px 18px rgba(30, 20, 45, 0.05);
        }

        .bottom-navigation button {
          height: 64px;
          border: 0;
          background: transparent;
          color: #65616a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          font-size: 23px;
        }

        .bottom-navigation small {
          font-size: 10px;
          font-weight: 650;
        }

        .bottom-navigation .nav-active {
          color: #d80045;
        }

        .sell-navigation-button {
          width: 68px;
          height: 68px !important;
          justify-self: center;
          align-self: start;
          margin-top: -29px;
          border-radius: 22px !important;
          color: white !important;
          background: linear-gradient(135deg, #f00047, #79149e) !important;
          box-shadow: 0 10px 24px rgba(191, 0, 82, 0.24);
        }

        .sell-navigation-button span {
          font-size: 27px;
        }

        .sell-navigation-button small {
          color: white;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(20, 15, 25, 0.42);
        }

        .modal-overlay.centered {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .side-menu {
          width: min(82%, 330px);
          height: 100%;
          background: white;
          padding: 23px;
          box-shadow: 15px 0 30px rgba(0, 0, 0, 0.15);
        }

        .side-menu-header {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
          padding-bottom: 22px;
          border-bottom: 1px solid #eeeeee;
          margin-bottom: 15px;
        }

        .side-brand {
          font-size: 24px;
        }

        .side-menu-header p {
          margin: 7px 0 0;
          color: #77717d;
          font-size: 12px;
        }

        .side-menu-header button,
        .modal-close {
          border: 0;
          background: transparent;
          font-size: 28px;
          color: #5d5862;
        }

        .side-menu > button:not(.modal-close) {
          display: block;
          width: 100%;
          text-align: left;
          border: 0;
          background: transparent;
          padding: 14px 5px;
          font-size: 15px;
          color: #3e3944;
        }

        .modal-card {
          width: min(100%, 360px);
          position: relative;
          background: white;
          padding: 30px 24px;
          text-align: center;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
        }

        .modal-close {
          position: absolute;
          top: 8px;
          right: 10px;
        }

        .modal-big-icon {
          width: 65px;
          height: 65px;
          margin: 0 auto 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f00047, #77139e);
          color: white;
          border-radius: 18px;
          font-size: 32px;
        }

        .modal-card h2 {
          margin: 0 0 10px;
          font-size: 22px;
        }

        .modal-card p {
          margin: 0 0 20px;
          color: #68636d;
          line-height: 1.5;
          font-size: 14px;
        }

        .modal-primary,
        .modal-secondary {
          width: 100%;
          min-height: 44px;
          border: 0;
          margin-top: 9px;
          font-weight: 750;
        }

        .modal-primary {
          background: linear-gradient(135deg, #ed0047, #75139d);
          color: white;
        }

        .modal-secondary {
          background: #f4f2f5;
          color: #5d5862;
        }

        .chat-modal input {
          width: 100%;
          height: 43px;
          border: 1px solid #ddd9df;
          padding: 0 12px;
          outline: none;
          margin-bottom: 5px;
        }

        @media (max-width: 420px) {
          .app-shell {
            max-width: 100%;
          }

          .top-header {
            grid-template-columns: 42px 1fr 82px;
            padding-left: 13px;
            padding-right: 13px;
          }

          .brand-name {
            font-size: 25px;
          }

          .brand-subtitle {
            font-size: 10px;
          }

          .main-content {
            padding: 0 14px;
          }

          .main-cards {
            gap: 9px;
          }

          .main-action-card {
            min-height: 142px;
            grid-template-columns: 52px minmax(0, 1fr);
            padding: 12px 9px;
            column-gap: 8px;
          }

          .action-icon {
            width: 50px;
            height: 50px;
            font-size: 24px;
          }

          .action-content strong {
            font-size: 16px;
          }

          .action-content p {
            font-size: 11px;
          }

          .action-arrow {
            width: 32px;
            height: 32px;
            font-size: 29px;
          }

          .offer-content {
            padding-left: 16px;
          }

          .offer-content h2 {
            font-size: 20px;
          }

          .product-image-button {
            height: 135px;
          }

          .chat-button {
            right: 15px;
          }
        }

        @media (max-width: 360px) {
          .brand-name {
            font-size: 22px;
          }

          .header-actions {
            gap: 4px;
          }

          .main-action-card {
            min-height: 150px;
          }

          .action-content strong {
            font-size: 14px;
          }

          .action-content p {
            font-size: 10px;
          }

          .category-card {
            flex-basis: 93px;
            min-height: 105px;
          }

          .offer-section {
            min-height: 180px;
          }

          .product-image-button {
            height: 120px;
          }
        }
      `}</style>
    </>
  );
}

export default App;
