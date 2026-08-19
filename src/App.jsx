import { useState } from "react";
import "./App.css";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="app">

      {/* ENCABEZADO */}
      <header className="header">

        {/* BOTONES IZQUIERDA */}
        <div className="leftButtons">

          <button
            className="iconButton"
            onClick={() => setCartOpen(!cartOpen)}
            aria-label="Carrito"
          >
            🛒
          </button>

          <button
            className="iconButton menuButton"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
          >
            ☰
          </button>

        </div>

        {/* LOGO */}
        <div className="logo">
          <span>SHORA</span>
          <strong>SHOPP</strong>
        </div>

        {/* BUSCADOR */}
        <div className="searchBox">
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
          />
          <button>🔍</button>
        </div>

      </header>


      {/* MENÚ SOBRE LA PÁGINA */}
      {menuOpen && (
        <>
          <div
            className="overlay"
            onClick={() => setMenuOpen(false)}
          />

          <div className="sideMenu">

            <div className="menuHeader">
              <h2>SHORASHOPP</h2>
              <button onClick={() => setMenuOpen(false)}>✕</button>
            </div>

            <div className="profileBox">
              <div className="profileIcon">👤</div>
              <div>
                <h3>Mi cuenta</h3>
                <p>Inicia sesión o regístrate</p>
              </div>
            </div>

            <button className="menuItem">
              👤 <span>Cuenta</span>
            </button>

            <button className="menuItem">
              💜 <span>Mi perfil</span>
            </button>

            <button className="menuItem">
              📦 <span>Mis pedidos</span>
            </button>

            <button className="menuItem">
              💬 <span>Mensajes</span>
            </button>

            <button className="menuItem">
              ❤️ <span>Favoritos</span>
            </button>

            <button className="menuItem">
              ⚙️ <span>Configuración</span>
            </button>

            <button className="menuItem">
              ❓ <span>Ayuda</span>
            </button>

            <div className="menuDivider" />

            <button className="sellerButton">
              🛍️ Vender en SHORASHOPP
            </button>

          </div>
        </>
      )}


      {/* CARRITO */}
      {cartOpen && (
        <>
          <div
            className="overlay"
            onClick={() => setCartOpen(false)}
          />

          <div className="cartPanel">

            <div className="cartHeader">
              <h2>🛒 Mi carrito</h2>
              <button onClick={() => setCartOpen(false)}>✕</button>
            </div>

            <div className="emptyCart">
              <div className="bigCart">🛒</div>
              <h3>Tu carrito está vacío</h3>
              <p>
                Agrega productos y aparecerán aquí.
              </p>
              <button
                className="continueButton"
                onClick={() => setCartOpen(false)}
              >
                Explorar productos
              </button>
            </div>

          </div>
        </>
      )}


      {/* HERO PRINCIPAL */}
      <main>

        <section className="hero">

          <div className="heroContent">

            <div className="heroText">

              <span className="smallTitle">
                ✨ TODO EN UN SOLO LUGAR
              </span>

              <h1>
                Compra.
                <br />
                Vende.
                <br />
                <span>Descubre.</span>
              </h1>

              <p>
                Encuentra todo lo que buscas en SHORASHOPP.
                Productos de diferentes vendedores,
                grandes oportunidades y mucho más.
              </p>

              <div className="heroButtons">

                <button className="primaryButton">
                  Explorar productos
                </button>

                <button className="secondaryButton">
                  Vender ahora
                </button>

              </div>

            </div>


            {/* TARJETAS DECORATIVAS */}
            <div className="heroVisual">

              <div className="floatingCard cardOne">
                👜
                <span>Moda</span>
              </div>

              <div className="floatingCard cardTwo">
                📱
                <span>Tecnología</span>
              </div>

              <div className="floatingCard cardThree">
                🏠
                <span>Hogar</span>
              </div>

              <div className="mainCircle">
                <div className="circleInner">
                  🛍️
                </div>
              </div>

            </div>

          </div>

        </section>


        {/* CATEGORÍAS */}
        <section className="categories">

          <div className="sectionTitle">
            <h2>Explora categorías</h2>
            <p>Encuentra algo que te encante</p>
          </div>

          <div className="categoryGrid">

            <div className="categoryCard">
              <div>👗</div>
              <span>Moda</span>
            </div>

            <div className="categoryCard">
              <div>📱</div>
              <span>Tecnología</span>
            </div>

            <div className="categoryCard">
              <div>🏠</div>
              <span>Hogar</span>
            </div>

            <div className="categoryCard">
              <div>💄</div>
              <span>Belleza</span>
            </div>

            <div className="categoryCard">
              <div>🎮</div>
              <span>Entretenimiento</span>
            </div>

            <div className="categoryCard">
              <div>🚗</div>
              <span>Automóviles</span>
            </div>

          </div>

        </section>


        {/* PRODUCTOS */}
        <section className="products">

          <div className="sectionTitle productTitle">
            <div>
              <h2>Productos destacados</h2>
              <p>Descubre productos increíbles</p>
            </div>

            <button className="viewAll">
              Ver todos →
            </button>
          </div>

          <div className="productGrid">

            <div className="productCard">
              <div className="productImage pink">
                👜
              </div>
              <h3>Productos de moda</h3>
              <p>Descubre las novedades</p>
              <strong>Ver productos →</strong>
            </div>

            <div className="productCard">
              <div className="productImage purple">
                📱
              </div>
              <h3>Tecnología</h3>
              <p>Lo último en tecnología</p>
              <strong>Ver productos →</strong>
            </div>

            <div className="productCard">
              <div className="productImage red">
                🏠
              </div>
              <h3>Hogar</h3>
              <p>Todo para tu hogar</p>
              <strong>Ver productos →</strong>
            </div>

          </div>

        </section>


        {/* INVITACIÓN A VENDEDORES */}
        <section className="sellerSection">

          <div>
            <span>¿TIENES ALGO QUE VENDER?</span>

            <h2>
              Convierte tus productos
              <br />
              en oportunidades.
            </h2>

            <p>
              Publica tus productos y llega a nuevos clientes
              a través de SHORASHOPP.
            </p>

            <button>
              Comenzar a vender →
            </button>
          </div>

          <div className="sellerIcon">
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
          Compra y vende de todo en un solo lugar.
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

    </div>
  );
}
