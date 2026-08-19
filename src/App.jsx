import { useEffect, useMemo, useState } from "react";
import {
  import { useState } from "react";
  Link,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";

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
];

const CART_KEY = "shora_cart";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cartchange"));
}

function addToCart(product) {
  const cart = getCart();
  saveCart([...cart, product]);
}

function Layout({ cartCount }) {
  return (
    <div className="app">
      <header className="header">
        <Link className="logo" to="/">
          SHORA<span>SHOPP</span>
        </Link>

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
            🛒 <b>{cartCount}</b>
          </Link>

          <Link className="account" to="/cuenta">
            Mi cuenta
          </Link>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/producto/:id" element={<Product />} />
          <Route path="/carrito" element={<Cart />} />
          <Route path="/cuenta" element={<Account />} />
          <Route path="/vender" element={<Seller />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>

      <footer className="footer">
        <div>
          <strong>SHORASHOPP</strong>
          <p>Compra y vende de todo en un solo lugar.</p>
        </div>

        <div>
          <Link to="/catalogo">Comprar</Link>
          <Link to="/vender">Vender</Link>
          <Link to="/cuenta">Mi cuenta</Link>
        </div>

        <small>
          © 2026 SHORASHOPP. Todos los derechos reservados.
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
          <span className="pill">MARKETPLACE MEXICANO</span>

          <h1>
            Todo lo que buscas.
            <br />
            <em>Todo en SHORASHOPP.</em>
          </h1>

          <p>
            Descubre productos de diferentes vendedores, compra de forma
            segura y encuentra nuevas ofertas cada día.
          </p>

          <Link className="primary" to="/catalogo">
            Explorar productos →
          </Link>
        </div>

        <div className="hero-art">🛍️</div>
      </section>

      <section className="section">
        <div className="section-title">
          <div>
            <span>DESCUBRE</span>
            <h2>Categorías populares</h2>
          </div>

          <Link to="/catalogo">Ver todo →</Link>
        </div>

        <div className="categories">
          {[
            "Moda",
            "Tecnología",
            "Hogar",
            "Calzado",
            "Belleza",
            "Accesorios",
          ].map((category, index) => (
            <Link
              to="/catalogo"
              className="category"
              key={category}
            >
              <div>
                {["👗", "📱", "🏠", "👟", "✨", "👜"][index]}
              </div>

              <strong>{category}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-title">
          <div>
            <span>SELECCIÓN SHORA</span>
            <h2>Productos destacados</h2>
          </div>

          <Link to="/catalogo">Ver catálogo →</Link>
        </div>

        <ProductGrid products={demoProducts.slice(0, 4)} />
      </section>
    </>
  );
}

function Catalog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");

  const products = useMemo(() => {
    return demoProducts.filter((product) => {
      const matchesCategory =
        category === "Todas" ||
        product.category === category;

      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <section className="section catalog">
      <div className="catalog-head">
        <div>
          <span>CATÁLOGO</span>
          <h1>Encuentra lo que necesitas</h1>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
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
        ].map((item) => (
          <button
            type="button"
            className={
              category === item
                ? "filter active"
                : "filter"
            }
            onClick={() => setCategory(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="empty">
          <div>🔎</div>
          <h2>No encontramos productos</h2>
          <p>Prueba con otra búsqueda o categoría.</p>
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
        <article className="card" key={product.id}>
          <button
            type="button"
            className="product-img"
            onClick={() =>
              navigate(`/producto/${product.id}`)
            }
            aria-label={`Ver ${product.name}`}
          >
            {product.emoji}
          </button>

          <small>{product.category}</small>

          <h3>{product.name}</h3>

          <strong>
            ${product.price.toLocaleString("es-MX")} MXN
          </strong>

          <button
            type="button"
            className="add"
            onClick={() => addToCart(product)}
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
      (item) => item.id === Number(id)
    ) || demoProducts[0];

  return (
    <section className="section product-page">
      <div className="product-big">
        {product.emoji}
      </div>

      <div>
        <span>{product.category}</span>

        <h1>{product.name}</h1>

        <h2>
          ${product.price.toLocaleString("es-MX")} MXN
        </h2>

        <p>
          Producto publicado en SHORASHOPP. La información,
          envío y disponibilidad se confirmarán durante el
          proceso de compra.
        </p>

        <button
          type="button"
          className="primary"
          onClick={() => addToCart(product)}
        >
          Agregar al carrito
        </button>
      </div>
    </section>
  );
}

function Cart() {
  const [items, setItems] = useState(getCart);

  useEffect(() => {
    const updateCart = () => {
      setItems(getCart());
    };

    window.addEventListener("cartchange", updateCart);

    window.addEventListener("storage", updateCart);

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
    (sum, product) => sum + product.price,
    0
  );

  const removeItem = (index) => {
    const newCart = items.filter(
      (_, itemIndex) => itemIndex !== index
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

      <h1>Tu carrito</h1>

      {items.length === 0 ? (
        <div className="empty">
          <div>🛒</div>

          <h2>Tu carrito está vacío</h2>

          <p>
            Agrega productos para comenzar tu compra.
          </p>

          <Link className="primary" to="/catalogo">
            Ver productos
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item, index) => (
              <div
                className="cart-item"
                key={`${item.id}-${index}`}
              >
                <span>{item.emoji}</span>

                <div>
                  <b>{item.name}</b>

                  <p>
                    {item.price.toLocaleString("es-MX")} MXN
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <aside className="summary">
            <h2>Resumen</h2>

            <p>
              Productos{" "}
              <b>
                ${total.toLocaleString("es-MX")} MXN
              </b>
            </p>

            <hr />

            <h3>
              Total{" "}
              <b>
                ${total.toLocaleString("es-MX")} MXN
              </b>
            </h3>

            <button
              type="button"
              className="primary"
              onClick={() =>
                alert(
                  "El proceso de pago se conectará con Mercado Pago."
                )
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

function Account() {
  return (
    <section className="section">
      <span>MI CUENTA</span>

      <h1>Tu cuenta SHORASHOPP</h1>

      <div className="empty">
        <div>👤</div>

        <h2>Bienvenido a SHORASHOPP</h2>

        <p>
          Aquí podrás administrar tus compras, pedidos y
          datos de cuenta.
        </p>

        <Link className="primary" to="/catalogo">
          Comenzar a comprar
        </Link>
      </div>
    </section>
  );
}

function Seller() {
  return (
    <section className="section">
      <span>VENDE EN SHORASHOPP</span>

      <h1>Comienza a vender tus productos</h1>

      <p>
        Publica tus productos y llega a compradores de todo
        México.
      </p>

      <div className="empty">
        <div>🏪</div>

        <h2>Panel de vendedor</h2>

        <p>
          La publicación de productos podrá quedar sujeta
          a revisión y aprobación administrativa.
        </p>

        <button
          type="button"
          className="primary"
          onClick={() =>
            alert(
              "El registro de vendedor estará disponible próximamente."
            )
          }
        >
          Registrarme como vendedor
        </button>
      </div>
    </section>
  );
}

function Admin() {
  return (
    <section className="section">
      <span>ADMINISTRACIÓN</span>

      <h1>Panel administrativo</h1>

      <div className="categories">
        <div className="category">
          <div>📦</div>
          <strong>Productos pendientes</strong>
        </div>

        <div className="category">
          <div>👥</div>
          <strong>Vendedores</strong>
        </div>

        <div className="category">
          <div>🛒</div>
          <strong>Pedidos</strong>
        </div>

        <div className="category">
          <div>📊</div>
          <strong>Actividad administrativa</strong>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [cartCount, setCartCount] = useState(
    () => getCart().length
  );

  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(getCart().length);
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

  return <Layout cartCount={cartCount} />;
}

export default App;
