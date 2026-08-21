import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

/* =========================================================
   SHORASHOPP
   APP.JSX — ESTRUCTURA ACTUAL
   ========================================================= */

const categories = [
  { icon: "👕", name: "Ropa y Moda" },
  { icon: "📱", name: "Tecnología" },
  { icon: "🏠", name: "Hogar y Vida" },
  { icon: "💄", name: "Belleza y Salud" },
  { icon: "🚗", name: "Autos y Motos" },
  { icon: "🍔", name: "Comida" },
  { icon: "🧸", name: "Juguetes" },
  { icon: "⚽", name: "Deportes" },
];

const initialProducts = [
  {
    id: 1,
    name: "Smartwatch Pro",
    price: 1699,
    oldPrice: 1999,
    rating: 4.7,
    reviews: 64,
    discount: "-15%",
    type: "watch",
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
    description:
      "Smartwatch moderno con diseño elegante, seguimiento de actividad y funciones inteligentes para el día a día.",
    specifications: [
      ["Pantalla", "AMOLED"],
      ["Conectividad", "Bluetooth"],
      ["Resistencia", "Resistente al agua"],
      ["Compatibilidad", "Android / iOS"],
    ],
  },
  {
    id: 2,
    name: "Licuadora Profesional",
    price: 899,
    oldPrice: 1099,
    rating: 4.8,
    reviews: 42,
    discount: "-18%",
    type: "blender",
    category: "Hogar y Vida",
    image:
      "https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=900&q=80",
    description:
      "Licuadora de alta potencia ideal para preparar bebidas, smoothies, salsas y alimentos.",
    specifications: [
      ["Potencia", "1200 W"],
      ["Velocidades", "5"],
      ["Vaso", "Vidrio"],
      ["Capacidad", "1.8 L"],
    ],
  },
  {
    id: 3,
    name: "Tenis Urbanos",
    price: 749,
    oldPrice: 899,
    rating: 4.6,
    reviews: 37,
    discount: "-17%",
    type: "shoes",
    category: "Ropa y Moda",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    description:
      "Tenis urbanos cómodos y versátiles para uso diario.",
    specifications: [
      ["Material", "Sintético"],
      ["Suela", "Goma"],
      ["Uso", "Casual"],
      ["Tallas", "22 - 29 MX"],
    ],
  },
  {
    id: 4,
    name: "Audífonos Bluetooth",
    price: 599,
    oldPrice: 799,
    rating: 4.7,
    reviews: 91,
    discount: "-25%",
    type: "headphones",
    category: "Tecnología",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
    description:
      "Audífonos inalámbricos con sonido envolvente y batería de larga duración.",
    specifications: [
      ["Conexión", "Bluetooth 5.3"],
      ["Batería", "Hasta 30 horas"],
      ["Micrófono", "Integrado"],
      ["Carga", "USB-C"],
    ],
  },
];

function formatPrice(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
}

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [search, setSearch] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    category: "Tecnología",
    description: "",
    image: "",
  });

  useEffect(() => {
    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function checkUser() {
    try {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      setUser(currentUser || null);
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredProducts = useMemo(() => {
    const text = search.toLowerCase().trim();

    return products.filter((product) => {
      const categoryMatch =
        activeCategory === "Todos" ||
        product.category === activeCategory;

      const searchMatch =
        !text ||
        product.name.toLowerCase().includes(text) ||
        product.category.toLowerCase().includes(text);

      return categoryMatch && searchMatch;
    });
  }, [products, activeCategory, search]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  function addToCart(product) {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) => item.id === product.id
      );

      if (existing) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });

    setShowCart(true);
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  }

  function changeQuantity(productId, amount) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === productId
            ? {
                ...item,
                quantity: Math.max(1, item.quantity + amount),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function buyNow(product) {
    setCart([{ ...product, quantity: 1 }]);
    setSelectedProduct(null);
    setShowCart(true);
  }

  function openProduct(product) {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePublish(event) {
    event.preventDefault();

    if (!newProduct.name || !newProduct.price) {
      alert("Completa el nombre y el precio del producto.");
      return;
    }

    const product = {
      id: Date.now(),
      name: newProduct.name,
      price: Number(newProduct.price),
      oldPrice: 0,
      rating: 0,
      reviews: 0,
      discount: "",
      type: "new",
      category: newProduct.category,
      image:
        newProduct.image ||
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
      description:
        newProduct.description ||
        "Producto publicado en SHORASHOPP.",
      specifications: [
        ["Categoría", newProduct.category],
        ["Publicado por", user?.email || "Vendedor"],
      ],
    };

    setProducts((current) => [product, ...current]);

    setNewProduct({
      name: "",
      price: "",
      category: "Tecnología",
      description: "",
      image: "",
    });

    setShowPublish(false);
    setSelectedProduct(product);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
  }

  if (loading) {
    return (
      <div className="shora-loading">
        <div className="shora-loading-logo">SHORASHOPP</div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="shora-app">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="shora-header">
        <button
          className="shora-menu-button"
          onClick={() => setShowMenu(true)}
          aria-label="Abrir menú"
        >
          ☰
        </button>

        <button
          className="shora-logo"
          onClick={() => {
            setSelectedProduct(null);
            setActiveCategory("Todos");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <span>SHORA</span>
          <strong>SHOPP</strong>
        </button>

        <div className="shora-search">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span>🔎</span>
        </div>

        <button
          className="shora-account-button"
          onClick={() => setShowAuth(true)}
        >
          ✨
        </button>

        <button
          className="shora-cart-floating"
          onClick={() => setShowCart(true)}
        >
          🛒
          {cartCount > 0 && (
            <span className="shora-cart-count">{cartCount}</span>
          )}
        </button>
      </header>

      {/* =====================================================
          MENÚ DE CATEGORÍAS
      ===================================================== */}

      <nav className="shora-categories">
        <button
          className={activeCategory === "Todos" ? "active" : ""}
          onClick={() => {
            setActiveCategory("Todos");
            setSelectedProduct(null);
          }}
        >
          🛍️ Todos
        </button>

        {categories.map((category) => (
          <button
            key={category.name}
            className={
              activeCategory === category.name ? "active" : ""
            }
            onClick={() => {
              setActiveCategory(category.name);
              setSelectedProduct(null);
            }}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </nav>

      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <main>
        {selectedProduct ? (
          <ProductPage
            product={selectedProduct}
            addToCart={addToCart}
            buyNow={buyNow}
            onBack={() => setSelectedProduct(null)}
          />
        ) : (
          <>
            {/* HERO */}

            <section className="shora-hero">
              <div className="shora-hero-content">
                <span className="shora-hero-badge">
                  ✨ TU TIENDA ONLINE
                </span>

                <h1>
                  Compra y vende
                  <br />
                  <span>lo que quieras.</span>
                </h1>

                <p>
                  Encuentra productos increíbles y descubre
                  vendedores de todo tipo en SHORASHOPP.
                </p>

                <div className="shora-hero-actions">
                  <button
                    className="shora-primary-button"
                    onClick={() => {
                      document
                        .getElementById("productos")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }}
                  >
                    Explorar productos
                  </button>

                  <button
                    className="shora-secondary-button"
                    onClick={() => setShowPublish(true)}
                  >
                    + Vender un producto
                  </button>
                </div>
              </div>

              <div className="shora-hero-card">
                <div className="shora-hero-card-icon">🛍️</div>
                <strong>SHORASHOPP</strong>
                <span>Todo en un solo lugar</span>
              </div>
            </section>

            {/* PROMOCIÓN */}

            <section className="shora-promo">
              <div>
                <span>🎉 OFERTAS ESPECIALES</span>
                <h2>Encuentra grandes descuentos</h2>
                <p>
                  Productos seleccionados con precios increíbles.
                </p>
              </div>

              <button
                onClick={() => {
                  setActiveCategory("Todos");
                  document
                    .getElementById("productos")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                Ver ofertas →
              </button>
            </section>

            {/* CATEGORÍAS */}

            <section className="shora-section">
              <div className="shora-section-title">
                <div>
                  <span>EXPLORA</span>
                  <h2>Categorías</h2>
                </div>
              </div>

              <div className="shora-category-grid">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    className="shora-category-card"
                    onClick={() => {
                      setActiveCategory(category.name);
                      document
                        .getElementById("productos")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                    }}
                  >
                    <span>{category.icon}</span>
                    <strong>{category.name}</strong>
                  </button>
                ))}
              </div>
            </section>

            {/* PRODUCTOS */}

            <section
              className="shora-section"
              id="productos"
            >
              <div className="shora-section-title">
                <div>
                  <span>SHORASHOPP</span>
                  <h2>
                    {activeCategory === "Todos"
                      ? "Productos destacados"
                      : activeCategory}
                  </h2>
                </div>

                <span className="shora-products-count">
                  {filteredProducts.length} productos
                </span>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="shora-empty">
                  <span>🔎</span>
                  <h3>No encontramos productos</h3>
                  <p>
                    Prueba con otra búsqueda o categoría.
                  </p>
                </div>
              ) : (
                <div className="shora-product-grid">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onOpen={openProduct}
                      addToCart={addToCart}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* VENDER */}

            <section className="shora-seller-section">
              <div>
                <span>¿TIENES ALGO QUE VENDER?</span>
                <h2>Publica tu producto en SHORASHOPP</h2>
                <p>
                  Crea tu publicación y comienza a mostrar tus
                  productos a compradores.
                </p>
              </div>

              <button
                className="shora-primary-button"
                onClick={() => setShowPublish(true)}
              >
                Publicar producto
              </button>
            </section>
          </>
        )}
      </main>

      {/* =====================================================
          MENÚ LATERAL
      ===================================================== */}

      {showMenu && (
        <div
          className="shora-overlay"
          onClick={() => setShowMenu(false)}
        >
          <aside
            className="shora-side-menu"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shora-side-header">
              <div className="shora-side-logo">
                SHORASHOPP
              </div>

              <button onClick={() => setShowMenu(false)}>
                ×
              </button>
            </div>

            <div className="shora-side-user">
              <div className="shora-avatar">✨</div>

              <div>
                <strong>
                  {user ? "Mi cuenta" : "Bienvenido"}
                </strong>

                <span>
                  {user
                    ? user.email
                    : "Inicia sesión para continuar"}
                </span>
              </div>
            </div>

            <button
              className="shora-menu-item"
              onClick={() => {
                setShowMenu(false);
                setShowAuth(true);
              }}
            >
              ✨ Cuenta
            </button>

            <button
              className="shora-menu-item"
              onClick={() => {
                setShowMenu(false);
                setShowCart(true);
              }}
            >
              🛒 Mi carrito
              {cartCount > 0 && (
                <span>{cartCount}</span>
              )}
            </button>

            <button
              className="shora-menu-item"
              onClick={() => setShowPublish(true)}
            >
              📦 Publicar producto
            </button>

            <button className="shora-menu-item">
              ❤️ Favoritos
            </button>

            <button className="shora-menu-item">
              📋 Mis pedidos
            </button>

            <button className="shora-menu-item">
              💬 Mensajes
            </button>

            <button className="shora-menu-item">
              ⚙️ Configuración
            </button>

            {user && (
              <button
                className="shora-menu-item logout"
                onClick={handleLogout}
              >
                🚪 Cerrar sesión
              </button>
            )}
          </aside>
        </div>
      )}

      {/* =====================================================
          AUTENTICACIÓN
      ===================================================== */}

      {showAuth && (
        <AuthModal
          user={user}
          onClose={() => setShowAuth(false)}
          onLoggedIn={(loggedUser) => {
            setUser(loggedUser);
            setShowAuth(false);
          }}
        />
      )}

      {/* =====================================================
          PUBLICAR PRODUCTO
      ===================================================== */}

      {showPublish && (
        <div
          className="shora-modal-overlay"
          onClick={() => setShowPublish(false)}
        >
          <div
            className="shora-modal shora-publish-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="shora-modal-close"
              onClick={() => setShowPublish(false)}
            >
              ×
            </button>

            <div className="shora-modal-title">
              <span>📦</span>
              <h2>Publicar producto</h2>
              <p>
                Agrega la información de tu producto.
              </p>
            </div>

            <form onSubmit={handlePublish}>
              <label>
                Nombre del producto
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      name: event.target.value,
                    })
                  }
                  placeholder="Ej. Teléfono celular"
                />
              </label>

              <label>
                Precio
                <input
                  type="number"
                  min="0"
                  value={newProduct.price}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      price: event.target.value,
                    })
                  }
                  placeholder="Ej. 1500"
                />
              </label>

              <label>
                Categoría
                <select
                  value={newProduct.category}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      category: event.target.value,
                    })
                  }
                >
                  {categories.map((category) => (
                    <option
                      key={category.name}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Imagen del producto
                <input
                  type="url"
                  value={newProduct.image}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      image: event.target.value,
                    })
                  }
                  placeholder="URL de la imagen"
                />
              </label>

              <label>
                Descripción
                <textarea
                  value={newProduct.description}
                  onChange={(event) =>
                    setNewProduct({
                      ...newProduct,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe tu producto..."
                  rows="4"
                />
              </label>

              <button
                type="submit"
                className="shora-primary-button shora-full-button"
              >
                Publicar producto
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          CARRITO
      ===================================================== */}

      {showCart && (
        <div
          className="shora-overlay"
          onClick={() => setShowCart(false)}
        >
          <aside
            className="shora-cart-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shora-cart-header">
              <div>
                <span>🛒</span>
                <h2>Mi carrito</h2>
              </div>

              <button onClick={() => setShowCart(false)}>
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="shora-empty-cart">
                <span>🛒</span>
                <h3>Tu carrito está vacío</h3>
                <p>
                  Agrega productos para comenzar tu compra.
                </p>

                <button
                  className="shora-primary-button"
                  onClick={() => setShowCart(false)}
                >
                  Explorar productos
                </button>
              </div>
            ) : (
              <>
                <div className="shora-cart-items">
                  {cart.map((item) => (
                    <div
                      className="shora-cart-item"
                      key={item.id}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                      />

                      <div className="shora-cart-item-info">
                        <strong>{item.name}</strong>
                        <span>
                          {formatPrice(item.price)}
                        </span>

                        <div className="shora-quantity">
                          <button
                            onClick={() =>
                              changeQuantity(item.id, -1)
                            }
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              changeQuantity(item.id, 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <button
                        className="shora-remove"
                        onClick={() =>
                          removeFromCart(item.id)
                        }
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                <div className="shora-cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>
                      {formatPrice(cartTotal)}
                    </strong>
                  </div>

                  <div>
                    <span>Envío</span>
                    <strong>Se calculará al comprar</strong>
                  </div>

                  <div className="total">
                    <span>Total</span>
                    <strong>
                      {formatPrice(cartTotal)}
                    </strong>
                  </div>

                  <button
                    className="shora-primary-button shora-full-button"
                    onClick={() =>
                      alert(
                        "El checkout se conectará aquí."
                      )
                    }
                  >
                    Comprar ahora
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* =====================================================
          ASISTENTE
      ===================================================== */}

      <button
        className="shora-support-button"
        onClick={() =>
          alert(
            "Hola 👋 Soy el asistente de SHORASHOPP. Pronto podré ayudarte directamente."
          )
        }
        aria-label="Asistente SHORASHOPP"
      >
        💬
      </button>
    </div>
  );
}

/* =========================================================
   PRODUCT CARD
   ========================================================= */

function ProductCard({ product, onOpen, addToCart }) {
  return (
    <article className="shora-product-card">
      <button
        className="shora-product-image-button"
        onClick={() => onOpen(product)}
      >
        {product.discount && (
          <span className="shora-discount">
            {product.discount}
          </span>
        )}

        <img
          src={product.image}
          alt={product.name}
        />
      </button>

      <div className="shora-product-info">
        <span className="shora-product-category">
          {product.category}
        </span>

        <button
          className="shora-product-name"
          onClick={() => onOpen(product)}
        >
          {product.name}
        </button>

        <div className="shora-rating">
          ⭐ {product.rating || "Nuevo"}
          {product.reviews > 0 && (
            <span>({product.reviews})</span>
          )}
        </div>

        <div className="shora-price-row">
          <strong>{formatPrice(product.price)}</strong>

          {product.oldPrice > product.price && (
            <del>
              {formatPrice(product.oldPrice)}
            </del>
          )}
        </div>

        <button
          className="shora-add-cart"
          onClick={() => addToCart(product)}
        >
          🛒 Agregar al carrito
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   PÁGINA INDIVIDUAL DEL PRODUCTO
   ========================================================= */

function ProductPage({
  product,
  addToCart,
  buyNow,
  onBack,
}) {
  return (
    <section className="shora-product-page">
      <button
        className="shora-back-button"
        onClick={onBack}
      >
        ← Volver a productos
      </button>

      <div className="shora-product-detail">
        <div className="shora-product-detail-image">
          {product.discount && (
            <span className="shora-discount">
              {product.discount}
            </span>
          )}

          <img
            src={product.image}
            alt={product.name}
          />
        </div>

        <div className="shora-product-detail-info">
          <span className="shora-product-category">
            {product.category}
          </span>

          <h1>{product.name}</h1>

          <div className="shora-detail-rating">
            ⭐ {product.rating || "Nuevo"}

            {product.reviews > 0 && (
              <span>
                · {product.reviews} reseñas
              </span>
            )}
          </div>

          <div className="shora-detail-price">
            <strong>
              {formatPrice(product.price)}
            </strong>

            {product.oldPrice > product.price && (
              <del>
                {formatPrice(product.oldPrice)}
              </del>
            )}
          </div>

          <p className="shora-detail-description">
            {product.description}
          </p>

          <div className="shora-product-actions">
            <button
              className="shora-primary-button"
              onClick={() => buyNow(product)}
            >
              Comprar ahora
            </button>

            <button
              className="shora-secondary-button"
              onClick={() => addToCart(product)}
            >
              🛒 Agregar al carrito
            </button>
          </div>

          <div className="shora-product-benefits">
            <div>
              🚚
              <span>
                <strong>Envío</strong>
                <small>
                  Opciones disponibles al comprar
                </small>
              </span>
            </div>

            <div>
              🔒
              <span>
                <strong>Compra segura</strong>
                <small>
                  Protección para tu compra
                </small>
              </span>
            </div>

            <div>
              💬
              <span>
                <strong>Soporte</strong>
                <small>
                  Ayuda durante tu compra
                </small>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="shora-specifications">
        <div className="shora-section-title">
          <div>
            <span>DETALLES</span>
            <h2>Especificaciones</h2>
          </div>
        </div>

        <div className="shora-spec-table">
          {product.specifications.map(
            ([label, value]) => (
              <div key={label}>
                <strong>{label}</strong>
                <span>{value}</span>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   AUTH MODAL
   ========================================================= */

function AuthModal({
  user,
  onClose,
  onLoggedIn,
}) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAuth(event) {
    event.preventDefault();
    setMessage("");
    setAuthLoading(true);

    try {
      if (mode === "register") {
        const {
          data,
          error,
        } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          setMessage(
            "Cuenta creada correctamente. Revisa tu correo si Supabase solicita confirmación."
          );

          if (data.session) {
            onLoggedIn(data.user);
          }
        }
      } else {
        const {
          data,
          error,
        } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          onLoggedIn(data.user);
        }
      }
    } catch (error) {
      setMessage(
        error?.message ||
          "No fue posible completar la operación."
      );
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <div
      className="shora-modal-overlay"
      onClick={onClose}
    >
      <div
        className="shora-modal shora-auth-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="shora-modal-close"
          onClick={onClose}
        >
          ×
        </button>

        {user ? (
          <div className="shora-auth-logged">
            <div className="shora-auth-icon">✨</div>
            <h2>Mi cuenta</h2>
            <p>{user.email}</p>

            <button
              className="shora-primary-button shora-full-button"
              onClick={onClose}
            >
              Continuar
            </button>
          </div>
        ) : (
          <>
            <div className="shora-modal-title">
              <div className="shora-auth-icon">✨</div>

              <h2>
                {mode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
              </h2>

              <p>
                {mode === "login"
                  ? "Bienvenido nuevamente a SHORASHOPP."
                  : "Crea tu cuenta para comprar y vender."}
              </p>
            </div>

            <form onSubmit={handleAuth}>
              {mode === "register" && (
                <label>
                  Nombre
                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Tu nombre"
                    required
                  />
                </label>
              )}

              <label>
                Correo electrónico
                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="correo@ejemplo.com"
                  required
                />
              </label>

              <label>
                Contraseña
                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="••••••••"
                  required
                  minLength="6"
                />
              </label>

              {message && (
                <div className="shora-auth-message">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="shora-primary-button shora-full-button"
                disabled={authLoading}
              >
                {authLoading
                  ? "Procesando..."
                  : mode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
              </button>
            </form>

            <div className="shora-auth-switch">
              {mode === "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={() => {
                      setMode("register");
                      setMessage("");
                    }}
                  >
                    Crear cuenta
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      setMessage("");
                    }}
                  >
                    Iniciar sesión
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
