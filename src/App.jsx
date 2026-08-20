import "./App.css";

export default function App() {
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

          <button className="headerButton">
            👤
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

    </div>
  );
}
