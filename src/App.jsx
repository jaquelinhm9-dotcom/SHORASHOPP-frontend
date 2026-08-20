import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { supabase } from "./lib/supabase";

const categories = [
  { name: "Moda y ropa", icon: "👗" },
  { name: "Tecnología", icon: "📱" },
  { name: "Hogar y vida", icon: "🏠" },
  { name: "Belleza y salud", icon: "💄" },
  { name: "Accesorios", icon: "👜" },
  { name: "Juguetería", icon: "🧸" },
];

const demoProducts = [
  {
    id: "demo-1",
    name: "Bolsa de mano",
    price: 599,
    category: "Moda y ropa",
    icon: "👜",
  },
  {
    id: "demo-2",
    name: "Audífonos inalámbricos",
    price: 899,
    category: "Tecnología",
    icon: "🎧",
  },
  {
    id: "demo-3",
    name: "Reloj moderno",
    price: 749,
    category: "Accesorios",
    icon: "⌚",
  },
  {
    id: "demo-4",
    name: "Set para el hogar",
    price: 429,
    category: "Hogar y vida",
    icon: "🏠",
  },
];

const offers = [
  {
    title: "Ofertas exclusivas",
    text: "Productos que valen la pena, precios que te van a sorprender.",
    visual: "🛍️",
  },
  {
    title: "Descuentos increíbles",
    text: "Encuentra grandes oportunidades todos los días.",
    visual: "✨",
  },
  {
    title: "Compra, vende y descubre",
    text: "Todo lo que buscas en un solo lugar.",
    visual: "🛒",
  },
];

function formatPrice(value) {
  return Number(value || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function App() {
  const [user, setUser] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState(null);

  const [authMode, setAuthMode] = useState("login");
  const [authMethod, setAuthMethod] = useState("email");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState("");

  const [profileName, setProfileName] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [products, setProducts] = useState([]);
  const [productFormOpen, setProductFormOpen] = useState(false);

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productCategory, setProductCategory] = useState("Moda y ropa");
  const [productDescription, setProductDescription] = useState("");
  const [productMessage, setProductMessage] = useState("");

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);

  const [search, setSearch] = useState("");
  const [offerSlide, setOfferSlide] = useState(0);

  useEffect(() => {
    if (!supabase) return;

    let mounted = true;

    const initialize = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      const currentUser = data?.session?.user || null;
      setUser(currentUser);

      if (currentUser) {
        updateUserInformation(currentUser);
        await loadProducts(currentUser.id);
        await loadOrders(currentUser.id);
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user || null;

      setUser(currentUser);

      if (currentUser) {
        updateUserInformation(currentUser);
        await loadProducts(currentUser.id);
        await loadOrders(currentUser.id);
      } else {
        setProfileName("");
        setProducts([]);
        setOrders([]);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setOfferSlide((current) => (current + 1) % offers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateUserInformation = (currentUser) => {
    const name =
      currentUser?.user_metadata?.full_name ||
      currentUser?.user_metadata?.name ||
      currentUser?.email?.split("@")[0] ||
      "Usuario";

    setProfileName(name);
  };

  const openPanel = (name) => {
    setMenuOpen(false);
    setPanel(name);
    setAuthMessage("");
    setAuthError("");

    if (name === "products" && user) {
      loadProducts(user.id);
    }

    if (name === "orders" && user) {
      loadOrders(user.id);
    }
  };

  const closePanel = () => {
    setPanel(null);
    setEditingProfile(false);
    setProfileSaved(false);
    setProductFormOpen(false);
    setProductMessage("");
  };

  const openAuth = (mode = "login") => {
    setPanel("auth");
    setAuthMode(mode);
    setAuthMessage("");
    setAuthError("");
    setVerificationCode("");
  };

  const goTo = (id) => {
    closePanel();
    setMenuOpen(false);

    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 30);
  };

  const loadProducts = async (userId) => {
    if (!supabase || !userId) return;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando productos:", error);
      return;
    }

    setProducts(data || []);
  };

  const loadOrders = async (userId) => {
    if (!supabase || !userId) return;

    setOrdersLoading(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error cargando pedidos:", error);
      setOrders([]);
    } else {
      setOrders(data || []);
    }

    setOrdersLoading(false);
  };

  const handleEmailAuth = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setAuthError("Supabase no está configurado.");
      return;
    }

    setLoading(true);
    setAuthError("");
    setAuthMessage("");

    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        if (data?.user) {
          setProfileName(fullName.trim());
        }

        setAuthMessage(
          "¡Cuenta creada! Revisa tu correo para confirmar tu cuenta."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setAuthMessage("¡Bienvenido de nuevo a SHORASHOPP! ✨");
      }
    } catch (error) {
      console.error(error);
      setAuthError(error.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setAuthError("Supabase no está configurado.");
      return;
    }

    setLoading(true);
    setAuthError("");
    setAuthMessage("");

    try {
      if (authMode === "register") {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone.trim(),
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        setAuthMessage(
          "Te enviamos un código por SMS. Escríbelo para continuar."
        );
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phone.trim(),
        });

        if (error) throw error;

        setAuthMessage(
          "Te enviamos un código de acceso por SMS."
        );
      }
    } catch (error) {
      console.error(error);
      setAuthError(
        error.message ||
          "No fue posible enviar el código. Verifica la configuración de teléfono en Supabase."
      );
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneCode = async (event) => {
    event.preventDefault();

    if (!supabase) return;

    setLoading(true);
    setAuthError("");
    setAuthMessage("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: verificationCode.trim(),
        type: "sms",
      });

      if (error) throw error;

      if (data?.user) {
        setUser(data.user);

        const name =
          data.user.user_metadata?.full_name ||
          data.user.phone ||
          "Usuario";

        setProfileName(name);
      }

      setAuthMessage("¡Listo! Entraste a SHORASHOPP. ✨");
      setVerificationCode("");
    } catch (error) {
      console.error(error);
      setAuthError(error.message || "Código incorrecto.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }

    setUser(null);
    setProducts([]);
    setOrders([]);
    setFavorites([]);
    setCart([]);
    setProfileName("");
    closePanel();
  };

  const saveProfile = async () => {
    if (!supabase || !user) return;

    const cleanName = profileName.trim();

    if (!cleanName) return;

    setLoading(true);
    setProfileSaved(false);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: cleanName,
        },
      });

      if (error) throw error;

      setUser(data.user);
      setEditingProfile(false);
      setProfileSaved(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (event) => {
    event.preventDefault();

    if (!supabase || !user) {
      setProductMessage("Inicia sesión para publicar productos.");
      return;
    }

    const name = productName.trim();
    const price = Number(productPrice);
    const description =
      productDescription.trim() ||
      "Producto publicado en SHORASHOPP.";

    if (!name || !productPrice || Number.isNaN(price)) {
      setProductMessage("Completa correctamente los datos.");
      return;
    }

    setLoading(true);
    setProductMessage("");

    try {
      const { data, error } = await supabase
        .from("products")
        .insert({
          user_id: user.id,
          name,
          price,
          category: productCategory,
          description,
        })
        .select()
        .single();

      if (error) throw error;

      setProducts((current) => [data, ...current]);

      setProductName("");
      setProductPrice("");
      setProductCategory("Moda y ropa");
      setProductDescription("");
      setProductFormOpen(false);

      setProductMessage("✓ Producto publicado correctamente.");
    } catch (error) {
      console.error(error);
      setProductMessage(
        error.message || "No fue posible publicar el producto."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!supabase || !user) return;

    if (!window.confirm("¿Eliminar este producto?")) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setProducts((current) =>
        current.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error(error);
      setProductMessage(
        error.message || "No fue posible eliminar el producto."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (product) => {
    setFavorites((current) =>
      current.includes(product.id)
        ? current.filter((id) => id !== product.id)
        : [...current, product.id]
    );
  };

  const addToCart = (product) => {
    setCart((current) => [...current, product]);
  };

  const removeFromCart = (index) => {
    setCart((current) =>
      current.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const allProducts = products.length ? products : demoProducts;

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return allProducts;

    return allProducts.filter((product) => {
      return (
        product.name?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term)
      );
    });
  }, [allProducts, search]);

  const favoriteProducts = allProducts.filter((product) =>
    favorites.includes(product.id)
  );

  const renderProductCard = (product) => {
    const favorite = favorites.includes(product.id);

    return (
      <article className="productCard" key={product.id}>
        <div className="productImage">
          <span className="productEmoji">
            {product.icon || "🛍️"}
          </span>

          <span className="offerBadge">
            OFERTA
          </span>

          <button
            className={`favoriteButton ${
              favorite ? "favoriteActive" : ""
            }`}
            onClick={() => toggleFavorite(product)}
            aria-label="Favorito"
          >
            {favorite ? "♥" : "♡"}
          </button>
        </div>

        <div className="productInfo">
          <span className="productCategory">
            {product.category || "Productos"}
          </span>

          <h3>{product.name}</h3>

          <strong className="productPrice">
            ${formatPrice(product.price)}
            <small> MXN</small>
          </strong>

          <button
            className="cartButton"
            onClick={() => addToCart(product)}
          >
            Agregar al carrito
          </button>
        </div>
      </article>
    );
  };

  const renderAuth = () => (
    <div className="authContainer">
      <div className="authLogo">✨</div>

      <h2>
        {authMode === "login"
          ? "Bienvenido a SHORASHOPP"
          : "Crea tu cuenta"}
      </h2>

      <p className="authIntro">
        {authMode === "login"
          ? "Entra para comprar, vender y descubrir."
          : "Únete para comprar, vender y descubrir productos."}
      </p>

      <div className="authMethods">
        <button
          className={authMethod === "email" ? "active" : ""}
          onClick={() => {
            setAuthMethod("email");
            setAuthError("");
            setAuthMessage("");
          }}
        >
          📧 Correo
        </button>

        <button
          className={authMethod === "phone" ? "active" : ""}
          onClick={() => {
            setAuthMethod("phone");
            setAuthError("");
            setAuthMessage("");
          }}
        >
          📱 Teléfono
        </button>
      </div>

      {authMethod === "email" ? (
        <form className="authForm" onSubmit={handleEmailAuth}>
          {authMode === "register" && (
            <>
              <label>Nombre completo</label>
              <input
                value={fullName}
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Tu nombre completo"
                required
              />
            </>
          )}

          <label>Correo electrónico</label>

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />

          <label>Contraseña</label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
          />

          <button
            className="primaryButton fullButton"
            disabled={loading}
          >
            {loading
              ? "Espera..."
              : authMode === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </button>
        </form>
      ) : (
        <>
          {!verificationCode ? (
            <form className="authForm" onSubmit={handlePhoneAuth}>
              {authMode === "register" && (
                <>
                  <label>Nombre completo</label>

                  <input
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    placeholder="Tu nombre completo"
                    required
                  />
                </>
              )}

              <label>Número de teléfono</label>

              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value)
                }
                placeholder="+52 669 123 4567"
                required
              />

              <small className="phoneHint">
                Incluye el código de país. Ejemplo: +52
              </small>

              <button
                className="primaryButton fullButton"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar código SMS"}
              </button>
            </form>
          ) : (
            <form className="authForm" onSubmit={verifyPhoneCode}>
              <label>Código de verificación</label>

              <input
                value={verificationCode}
                onChange={(event) =>
                  setVerificationCode(event.target.value)
                }
                placeholder="Escribe el código SMS"
                inputMode="numeric"
                required
              />

              <button
                className="primaryButton fullButton"
                disabled={loading}
              >
                {loading
                  ? "Verificando..."
                  : "Verificar código"}
              </button>

              <button
                type="button"
                className="textButton"
                onClick={() => setVerificationCode("")}
              >
                Cambiar número
              </button>
            </form>
          )}
        </>
      )}

      {authError && (
        <div className="errorMessage">
          {authError}
        </div>
      )}

      {authMessage && (
        <div className="successMessage">
          {authMessage}
        </div>
      )}

      <div className="authSwitch">
        {authMode === "login"
          ? "¿No tienes cuenta?"
          : "¿Ya tienes una cuenta?"}

        <button
          onClick={() => {
            setAuthMode(
              authMode === "login" ? "register" : "login"
            );
            setAuthError("");
            setAuthMessage("");
          }}
        >
          {authMode === "login"
            ? "Crear cuenta"
            : "Iniciar sesión"}
        </button>
      </div>
    </div>
  );

  const renderProfile = () => {
    if (!user) {
      return (
        <div className="emptyState">
          <div className="emptyIcon">👤</div>
          <h3>Inicia sesión para ver tu cuenta</h3>
          <p>
            Administra tu perfil, pedidos, favoritos y productos.
          </p>
          <button
            className="primaryButton"
            onClick={() => openAuth("login")}
          >
            Iniciar sesión
          </button>
        </div>
      );
    }

    return (
      <div className="profile">
        <div className="avatar">
          {(profileName || "U").charAt(0).toUpperCase()}
        </div>

        <div className="profileField">
          <label>Nombre</label>

          {editingProfile ? (
            <input
              value={profileName}
              onChange={(event) =>
                setProfileName(event.target.value)
              }
            />
          ) : (
            <div className="profileValue">
              {profileName || "Sin nombre"}
            </div>
          )}
        </div>

        <div className="profileField">
          <label>Correo</label>
          <div className="profileValue">
            {user.email || "Cuenta por teléfono"}
          </div>
        </div>

        {user.phone && (
          <div className="profileField">
            <label>Teléfono</label>
            <div className="profileValue">
              {user.phone}
            </div>
          </div>
        )}

        {editingProfile ? (
          <div className="buttonRow">
            <button
              className="primaryButton"
              onClick={saveProfile}
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>

            <button
              className="secondaryButton"
              onClick={() => setEditingProfile(false)}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            className="primaryButton fullButton"
            onClick={() => setEditingProfile(true)}
          >
            Editar perfil
          </button>
        )}

        {profileSaved && (
          <div className="successMessage">
            ✓ Perfil actualizado.
          </div>
        )}

        <button className="logoutButton" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    );
  };

  const renderOrders = () => {
    if (!user) {
      return (
        <div className="emptyState">
          <div className="emptyIcon">📦</div>
          <h3>Inicia sesión para ver tus pedidos</h3>
          <p>
            Aquí aparecerán tus compras y su estado.
          </p>
          <button
            className="primaryButton"
            onClick={() => openAuth("login")}
          >
            Iniciar sesión
          </button>
        </div>
      );
    }

    if (ordersLoading) {
      return (
        <div className="emptyState">
          <div className="emptyIcon">⏳</div>
          <h3>Cargando pedidos...</h3>
        </div>
      );
    }

    if (!orders.length) {
      return (
        <div className="emptyState">
          <div className="emptyIcon">📦</div>
          <h3>Aún no tienes pedidos</h3>
          <p>
            Cuando realices una compra aparecerá aquí.
          </p>
          <button
            className="primaryButton"
            onClick={() => {
              closePanel();
              goTo("productos");
            }}
          >
            Explorar productos
          </button>
        </div>
      );
    }

    return (
      <div className="ordersList">
        {orders.map((order) => (
          <article className="orderCard" key={order.id}>
            <div className="orderIcon">📦</div>

            <div>
              <small>PEDIDO</small>

              <h3>
                #{String(order.id).slice(-8)}
              </h3>

              <p>
                Estado:{" "}
                <strong>
                  {order.status || "Pendiente"}
                </strong>
              </p>

              {order.total !== null &&
                order.total !== undefined && (
                  <strong>
                    ${formatPrice(order.total)} MXN
                  </strong>
                )}
            </div>
          </article>
        ))}
      </div>
    );
  };

  const renderSellerProducts = () => {
    if (!user) {
      return (
        <div className="emptyState">
          <div className="emptyIcon">🏪</div>
          <h3>Vende en SHORASHOPP</h3>
          <p>
            Inicia sesión para publicar tus productos.
          </p>

          <button
            className="primaryButton"
            onClick={() => openAuth("login")}
          >
            Iniciar sesión
          </button>
        </div>
      );
    }

    return (
      <div className="sellerArea">
        {!productFormOpen && (
          <button
            className="primaryButton fullButton"
            onClick={() => {
              setProductMessage("");
              setProductFormOpen(true);
            }}
          >
            ＋ Publicar producto
          </button>
        )}

        {productFormOpen && (
          <form className="productForm" onSubmit={createProduct}>
            <h3>Nuevo producto</h3>

            <label>Nombre</label>

            <input
              value={productName}
              onChange={(event) =>
                setProductName(event.target.value)
              }
              placeholder="Ej. Bolsa de mano"
              required
            />

            <label>Precio</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={productPrice}
              onChange={(event) =>
                setProductPrice(event.target.value)
              }
              placeholder="599"
              required
            />

            <label>Categoría</label>

            <select
              value={productCategory}
              onChange={(event) =>
                setProductCategory(event.target.value)
              }
            >
              {categories.map((category) => (
                <option key={category.name}>
                  {category.name}
                </option>
              ))}
            </select>

            <label>Descripción</label>

            <textarea
              rows="4"
              value={productDescription}
              onChange={(event) =>
                setProductDescription(event.target.value)
              }
              placeholder="Describe tu producto..."
            />

            <div className="buttonRow">
              <button
                className="primaryButton"
                disabled={loading}
              >
                {loading ? "Publicando..." : "Publicar"}
              </button>

              <button
                type="button"
                className="secondaryButton"
                onClick={() => setProductFormOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {productMessage && (
          <div className="successMessage">
            {productMessage}
          </div>
        )}

        <div className="sellerList">
          {products.map((product) => (
            <article className="sellerItem" key={product.id}>
              <div>
                <strong>{product.name}</strong>
                <span>
                  ${formatPrice(product.price)} MXN
                </span>
                <small>{product.category}</small>
              </div>

              <button
                className="deleteButton"
                onClick={() => deleteProduct(product.id)}
              >
                Eliminar
              </button>
            </article>
          ))}
        </div>
      </div>
    );
  };

  const renderCart = () => {
    if (!cart.length) {
      return (
        <div className="emptyState">
          <div className="emptyIcon">🛒</div>
          <h3>Tu carrito está vacío</h3>
          <p>
            Agrega productos y aparecerán aquí.
          </p>
          <button
            className="primaryButton"
            onClick={() => {
              closePanel();
              goTo("productos");
            }}
          >
            Ver productos
          </button>
        </div>
      );
    }

    const total = cart.reduce(
      (sum, item) => sum + Number(item.price || 0),
      0
    );

    return (
      <div className="cartArea">
        {cart.map((item, index) => (
          <article
            className="cartItem"
            key={`${item.id}-${index}`}
          >
            <span className="cartEmoji">
              {item.icon || "🛍️"}
            </span>

            <div>
              <strong>{item.name}</strong>
              <small>
                ${formatPrice(item.price)} MXN
              </small>
            </div>

            <button
              className="removeCart"
              onClick={() => removeFromCart(index)}
            >
              ×
            </button>
          </article>
        ))}

        <div className="cartTotal">
          <span>Total</span>
          <strong>${formatPrice(total)} MXN</strong>
        </div>

        <button className="primaryButton fullButton">
          Continuar con la compra
        </button>
      </div>
    );
  };

  const renderPanelContent = () => {
    if (panel === "auth") return renderAuth();
    if (panel === "profile") return renderProfile();
    if (panel === "orders") return renderOrders();
    if (panel === "products") return renderSellerProducts();
    if (panel === "cart") return renderCart();

    if (panel === "favorites") {
      return favoriteProducts.length ? (
        <div className="panelGrid">
          {favoriteProducts.map(renderProductCard)}
        </div>
      ) : (
        <div className="emptyState">
          <div className="emptyIcon">♡</div>
          <h3>Aún no tienes favoritos</h3>
          <p>
            Presiona el corazón de cualquier producto para guardarlo.
          </p>
        </div>
      );
    }

    if (panel === "messages") {
      return (
        <div className="emptyState">
          <div className="emptyIcon">💬</div>
          <h3>¿Necesitas ayuda?</h3>
          <p>
            Próximamente podrás contactar con soporte directamente
            desde SHORASHOPP.
          </p>
          <button
            className="primaryButton"
            onClick={closePanel}
          >
            Volver a la tienda
          </button>
        </div>
      );
    }

    if (panel === "settings") {
      return (
        <div className="settingsList">
          <div className="settingItem">
            <span>🔔</span>
            <div>
              <strong>Notificaciones</strong>
              <small>
                Mantente al día con tus pedidos.
              </small>
            </div>
          </div>

          <div className="settingItem">
            <span>🔒</span>
            <div>
              <strong>Privacidad</strong>
              <small>
                Controla la información de tu cuenta.
              </small>
            </div>
          </div>

          <div className="settingItem">
            <span>❓</span>
            <div>
              <strong>Ayuda</strong>
              <small>
                Estamos aquí para ayudarte.
              </small>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const panelTitles = {
    auth: {
      title: "Tu cuenta",
      subtitle: "Compra, vende y descubre",
      icon: "✨",
    },
    profile: {
      title: "Mi perfil",
      subtitle: "Administra tu información",
      icon: "👤",
    },
    orders: {
      title: "Mis pedidos",
      subtitle: "Consulta tus compras",
      icon: "📦",
    },
    products: {
      title: "Mis productos",
      subtitle: "Vende en SHORASHOPP",
      icon: "🏪",
    },
    favorites: {
      title: "Favoritos",
      subtitle: "Tus productos guardados",
      icon: "❤️",
    },
    cart: {
      title: "Mi carrito",
      subtitle: `${cart.length} producto${
        cart.length === 1 ? "" : "s"
      }`,
      icon: "🛒",
    },
    messages: {
      title: "Ayuda",
      subtitle: "Estamos para ayudarte",
      icon: "💬",
    },
    settings: {
      title: "Configuración",
      subtitle: "Preferencias de tu cuenta",
      icon: "⚙️",
    },
  };

  const currentPanel = panelTitles[panel];

  return (
    <div className="app">
      <header className="header">
        <div className="headerInner">
          <button
            className="headerIcon"
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </button>

          <button
            className="brand"
            onClick={() => goTo("inicio")}
          >
            <span className="brandShora">Shora</span>
            <span className="brandShop">Shop</span>

            <small>
              <b>Compra</b>, <strong>Vende</strong> y Descubre
            </small>
          </button>

          <div className="headerActions">
            <button
              className="headerIcon"
              onClick={() => openPanel("messages")}
            >
              🔔
            </button>

            <button
              className="headerIcon"
              onClick={() => openPanel("cart")}
            >
              🛒

              {cart.length > 0 && (
                <span className="cartCount">
                  {cart.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main id="inicio" className="main">
        <div className="searchWrapper">
          <div className="searchInput">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="¿Qué estás pensando comprar hoy?"
            />
            <span>🔍</span>
          </div>
        </div>

        <section className="quickGrid">
          <button
            className="quickCard"
            onClick={() => openPanel("products")}
          >
            <span className="quickIcon">🏪</span>

            <div>
              <strong>Vende en ShoraShop</strong>
              <small>
                Vende tus productos de forma fácil
              </small>
            </div>

            <span className="arrow">→</span>
          </button>

          <button
            className="quickCard"
            onClick={() => {
              if (user) openPanel("profile");
              else openAuth("login");
            }}
          >
            <span className="quickIcon">👤</span>

            <div>
              <strong>Mi cuenta</strong>
              <small>
                {user
                  ? `Hola, ${profileName}`
                  : "Hola, crea tu cuenta"}
              </small>
            </div>

            <span className="arrow">→</span>
          </button>
        </section>

        <section id="categorias" className="section">
          <div className="sectionHeader">
            <h2>Categorías</h2>

            <button
              onClick={() => setSearch("")}
            >
              Ver todas →
            </button>
          </div>

          <div className="categoryScroller">
            {categories.map((category) => (
              <button
                className="categoryCard"
                key={category.name}
                onClick={() => setSearch(category.name)}
              >
                <span>{category.icon}</span>
                <strong>{category.name}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="offer">
          <div className="offerContent">
            <div>
              <span className="offerLabel">
                SHORASHOPP
              </span>

              <h2>{offers[offerSlide].title}</h2>

              <p>{offers[offerSlide].text}</p>

              <button
                onClick={() => goTo("productos")}
              >
                Ver ofertas
              </button>
            </div>

            <div className="offerVisual">
              <span>{offers[offerSlide].visual}</span>
              <b>-50%</b>
            </div>
          </div>

          <div className="offerDots">
            {offers.map((_, index) => (
              <button
                key={index}
                className={
                  offerSlide === index ? "active" : ""
                }
                onClick={() => setOfferSlide(index)}
              />
            ))}
          </div>
        </section>

        <section id="productos" className="section">
          <div className="sectionHeader">
            <h2>Productos destacados</h2>

            <button
              onClick={() => {
                setSearch("");
                document
                  .getElementById("productos")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              Ver todos →
            </button>
          </div>

          {filteredProducts.length ? (
            <div className="productGrid">
              {filteredProducts
                .slice(0, 8)
                .map(renderProductCard)}
            </div>
          ) : (
            <div className="noProducts">
              <span>🔎</span>
              <h3>No encontramos productos</h3>
              <p>Prueba con otra búsqueda.</p>
            </div>
          )}
        </section>

        <section className="trust">
          <div>
            <span>🔒</span>
            <strong>Compra segura</strong>
            <small>Protegemos tus datos</small>
          </div>

          <div>
            <span>🚚</span>
            <strong>Envíos rápidos</strong>
            <small>Recibe tus productos</small>
          </div>

          <div>
            <span>🤝</span>
            <strong>Compra y vende</strong>
            <small>Una comunidad 24/7</small>
          </div>
        </section>
      </main>

      <button
        className="support"
        onClick={() => openPanel("messages")}
      >
        💬 Ayuda
      </button>

      <nav className="bottomNav">
        <button onClick={() => goTo("inicio")}>
          <span>⌂</span>
          Inicio
        </button>

        <button onClick={() => goTo("categorias")}>
          <span>▦</span>
          Categorías
        </button>

        <button
          className="sellNav"
          onClick={() => openPanel("products")}
        >
          <span>🏪</span>
          Vender
        </button>

        <button onClick={() => openPanel("favorites")}>
          <span>♡</span>
          Favoritos
        </button>

        <button
          onClick={() => {
            if (user) openPanel("profile");
            else openAuth("login");
          }}
        >
          <span>♙</span>
          Cuenta
        </button>
      </nav>

      {menuOpen && (
        <div
          className="drawerBackdrop"
          onClick={() => setMenuOpen(false)}
        >
          <aside
            className="drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawerTop">
              <div>
                <span className="drawerLogo">
                  Shora<span>Shop</span>
                </span>

                <small>
                  Compra, Vende y Descubre
                </small>
              </div>

              <button
                className="closeIcon"
                onClick={() => setMenuOpen(false)}
              >
                ×
              </button>
            </div>

            <button
              className="drawerItem"
              onClick={() => goTo("inicio")}
            >
              🏠 Inicio
            </button>

            <button
              className="drawerItem"
              onClick={() => goTo("categorias")}
            >
              🗂️ Categorías
            </button>

            <button
              className="drawerItem"
              onClick={() => openPanel("orders")}
            >
              📦 Mis pedidos
            </button>

            <button
              className="drawerItem"
              onClick={() => openPanel("products")}
            >
              🛍️ Mis productos
            </button>

            <button
              className="drawerItem"
              onClick={() => openPanel("favorites")}
            >
              ❤️ Favoritos
            </button>

            <button
              className="drawerItem"
              onClick={() => openPanel("settings")}
            >
              ⚙️ Configuración
            </button>

            <div className="drawerBottom">
              {user ? (
                <button
                  className="drawerLogout"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              ) : (
                <>
                  <button
                    className="primaryButton fullButton"
                    onClick={() => openAuth("login")}
                  >
                    Iniciar sesión
                  </button>

                  <button
                    className="secondaryButton fullButton"
                    onClick={() => openAuth("register")}
                  >
                    Crear cuenta
                  </button>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      {panel && (
        <div
          className="panelBackdrop"
          onClick={closePanel}
        >
          <div
            className="panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="panelHeader">
              <div className="panelTitle">
                <span>{currentPanel?.icon}</span>

                <div>
                  <h2>{currentPanel?.title}</h2>
                  <small>{currentPanel?.subtitle}</small>
                </div>
              </div>

              <button
                className="closeIcon"
                onClick={closePanel}
              >
                ×
              </button>
            </div>

            {renderPanelContent()}
          </div>
        </div>
      )}
    </div>
  );
}
