import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

const categories = [
  ["👕", "Ropa y Moda"],
  ["📱", "Tecnología"],
  ["🏠", "Hogar y Vida"],
  ["💄", "Belleza y Salud"],
  ["🎧", "Accesorios"],
  ["🎮", "Juguetes y Más"],
];

const demoProducts = [
  {
    name: "Audífonos Inalámbricos",
    price: "$399.00",
    oldPrice: "$499.00",
    rating: "4.8",
    sales: "120 ventas",
    discount: "-20%",
    icon: "🎧",
    category: "Tecnología",
  },
  {
    name: "Bolsa de Hombro Elegante",
    price: "$599.00",
    oldPrice: "$799.00",
    rating: "4.9",
    sales: "85 ventas",
    discount: "Nuevo",
    icon: "👜",
    category: "Ropa y Moda",
  },
  {
    name: "Smartwatch Series 9",
    price: "$1,699.00",
    oldPrice: "$1,999.00",
    rating: "4.7",
    sales: "64 ventas",
    discount: "-15%",
    icon: "⌚",
    category: "Tecnología",
  },
  {
    name: "Licuadora Profesional",
    price: "$899.00",
    oldPrice: "",
    rating: "4.6",
    sales: "45 ventas",
    discount: "Nuevo",
    icon: "🥤",
    category: "Hogar y Vida",
  },
];

const pages = [
  "home",
  "account",
  "profile",
  "edit-profile",
  "categories",
  "favorites",
  "offers",
  "notifications",
  "notification-offers",
  "notification-orders",
  "notification-messages",
  "orders",
  "orders-list",
  "orders-tracking",
  "orders-confirmations",
  "order-detail",
  "messages",
  "messages-conversations",
  "messages-sellers",
  "messages-support",
  "conversation",
  "cart",
  "checkout",
  "payment",
  "addresses",
  "add-address",
  "payment-methods",
  "add-payment-method",
  "coupons",
  "wallet",
  "returns",
  "return-detail",
  "help",
  "support",
  "referrals",
  "privacy",
  "sessions",
  "security",
  "settings",
  "seller",
  "seller-dashboard",
  "seller-products",
  "seller-add-product",
  "seller-sales",
  "seller-reviews",
  "seller-commissions",
];

function getPage() {
  const hash = window.location.hash.replace("#", "");
  return pages.includes(hash) ? hash : "home";
}

function App() {
  const [session, setSession] = useState(null);
  const [currentPage, setCurrentPage] = useState(getPage());
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [toast, setToast] = useState("");

  const [store, setStore] = useState(null);
  const [storeLoading, setStoreLoading] = useState(false);
  const [storeError, setStoreError] = useState("");

  const [realProducts, setRealProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    compare_at_price: "",
    category_id: "",
    category_name: "",
    stock: "1",
    sku: "",
    image_url: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPage(getPage());
      setMenuOpen(false);
      window.scrollTo({ top: 0, behavior: "auto" });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      loadStore();
      loadRealProducts();
    } else {
      setStore(null);
      setRealProducts([]);
    }
  }, [session]);

  useEffect(() => {
    if (currentPage === "seller-dashboard" || currentPage === "seller-products") {
      if (session?.user?.id) {
        loadStore();
        loadRealProducts();
      }
    }
  }, [currentPage]);

  const go = (page) => {
    if (!pages.includes(page)) return;

    if (page === currentPage) {
      setMenuOpen(false);
      return;
    }

    window.history.pushState(
      {},
      "",
      page === "home" ? window.location.pathname : `#${page}`
    );

    setCurrentPage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      go("home");
    }
  };

  const notify = (text) => {
    setToast(text);
    setTimeout(() => setToast(""), 2500);
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setAuthMessage("");
    setAuthOpen(true);
  };

  const closeAuth = () => {
    setAuthOpen(false);
    setAuthMessage("");
    setEmail("");
    setPassword("");
    setName("");
  };

  const authenticate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthMessage("");

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

        if (error) throw error;

        if (data?.session) {
          closeAuth();
          go("account");
        } else {
          setAuthMessage(
            "Cuenta creada. Revisa tu correo para confirmar tu cuenta."
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        closeAuth();
        go("account");
      }
    } catch (error) {
      setAuthMessage(error?.message || "Ocurrió un error.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setStore(null);
    setRealProducts([]);
    go("home");
  };

  const toggleFavorite = (name) => {
    setFavorites((old) => {
      if (old.includes(name)) {
        notify("Eliminado de favoritos.");
        return old.filter((x) => x !== name);
      }

      notify("Agregado a favoritos.");
      return [...old, name];
    });
  };

  const loadStore = async () => {
    if (!session?.user?.id) return;

    setStoreLoading(true);
    setStoreError("");

    try {
      const { data, error } = await supabase
        .from("seller_stores")
        .select("*")
        .eq("owner_id", session.user.id)
        .maybeSingle();

      if (error) throw error;

      setStore(data || null);
    } catch (error) {
      console.error(error);
      setStoreError(error?.message || "No se pudo consultar tu tienda.");
    } finally {
      setStoreLoading(false);
    }
  };

  const createStore = async (e) => {
    e.preventDefault();

    if (!session?.user?.id) {
      openAuth("login");
      return;
    }

    const form = e.currentTarget;
    const storeName = form.store_name.value.trim();
    const description = form.description.value.trim();

    if (!storeName) {
      notify("Escribe el nombre de tu tienda.");
      return;
    }

    setStoreLoading(true);
    setStoreError("");

    try {
      const { data, error } = await supabase
        .from("seller_stores")
        .insert({
          owner_id: session.user.id,
          store_name: storeName,
          description,
          status: "active",
        })
        .select("*")
        .single();

      if (error) throw error;

      setStore(data);
      notify("¡Tu tienda fue creada!");
      go("seller-dashboard");
    } catch (error) {
      console.error(error);
      setStoreError(
        error?.message ||
          "No se pudo crear la tienda. Revisa las políticas de Supabase."
      );
    } finally {
      setStoreLoading(false);
    }
  };

  const loadRealProducts = async () => {
    if (!session?.user?.id) return;

    setProductsLoading(true);

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", store?.id || "__no_store__")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRealProducts(data || []);
    } catch (error) {
      console.error("Error cargando productos:", error);
      setRealProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const createProduct = async (e) => {
    e.preventDefault();

    if (!session?.user?.id) {
      openAuth("login");
      return;
    }

    if (!store?.id) {
      notify("Primero crea tu tienda.");
      go("seller");
      return;
    }

    const price = Number(productForm.price);
    const compareAtPrice = productForm.compare_at_price
      ? Number(productForm.compare_at_price)
      : null;
    const stock = Number(productForm.stock);

    if (!productForm.name.trim()) {
      notify("Escribe el nombre del producto.");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      notify("Escribe un precio válido.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      notify("Escribe un inventario válido.");
      return;
    }

    setProductsLoading(true);

    try {
      const slugBase = productForm.name
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const slug = `${slugBase || "producto"}-${Date.now()}`;

      const productData = {
        seller_id: store.id,
        category_id: productForm.category_id || null,
        name: productForm.name.trim(),
        slug,
        description: productForm.description.trim() || null,
        price,
        compare_at_price: compareAtPrice,
        stock,
        sku: productForm.sku.trim() || null,
        image_url: productForm.image_url.trim() || null,
        images: productForm.image_url.trim()
          ? [productForm.image_url.trim()]
          : [],
        status: "pending",
      };

      const { data, error } = await supabase
        .from("products")
        .insert(productData)
        .select("*")
        .single();

      if (error) throw error;

      setRealProducts((old) => [data, ...old]);

      setProductForm({
        name: "",
        description: "",
        price: "",
        compare_at_price: "",
        category_id: "",
        category_name: "",
        stock: "1",
        sku: "",
        image_url: "",
      });

      notify(
        "Producto guardado. Quedó pendiente de aprobación para mostrarse públicamente."
      );

      go("seller-products");
    } catch (error) {
      console.error("Error publicando producto:", error);

      if (error?.code === "42501") {
        notify(
          "Supabase rechazó la publicación por permisos. Hay que revisar las políticas de la tabla."
        );
      } else {
        notify(error?.message || "No se pudo publicar el producto.");
      }
    } finally {
      setProductsLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("¿Eliminar este producto?")) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      setRealProducts((old) => old.filter((product) => product.id !== productId));
      notify("Producto eliminado.");
    } catch (error) {
      console.error(error);
      notify(error?.message || "No se pudo eliminar el producto.");
    }
  };

  const filteredProducts = demoProducts.filter((p) => {
    const matchesCategory = !category || p.category === category;
    const q = search.trim().toLowerCase();

    return (
      matchesCategory &&
      (!q || p.name.toLowerCase().includes(q))
    );
  });

  const button = {
    width: "100%",
    padding: 17,
    border: "1px solid #ece7f3",
    borderRadius: 17,
    background: "#fff",
    color: "#24152f",
    textAlign: "left",
    cursor: "pointer",
    boxShadow: "0 5px 18px rgba(50,16,74,.05)",
  };

  const card = {
    background: "#fff",
    border: "1px solid #ece7f3",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 5px 18px rgba(50,16,74,.05)",
  };

  const PageHeader = ({ icon, title, text }) => (
    <div
      style={{
        background: "linear-gradient(135deg,#ed174d,#7020d0)",
        color: "#fff",
        borderRadius: 22,
        padding: 24,
        marginBottom: 18,
      }}
    >
      <div style={{ fontSize: 36 }}>{icon}</div>
      <h1 style={{ margin: "8px 0 5px" }}>{title}</h1>
      <p style={{ margin: 0, opacity: 0.92 }}>{text}</p>
    </div>
  );

  const Option = ({ icon, title, text, page }) => (
    <button type="button" onClick={() => go(page)} style={button}>
      <strong style={{ display: "block", fontSize: 16 }}>
        {icon} {title}
      </strong>
      <span style={{ display: "block", marginTop: 7, color: "#666" }}>
        {text} ›
      </span>
    </button>
  );

  const Info = ({ icon, title, text }) => (
    <div style={card}>
      <div style={{ fontSize: 30 }}>{icon}</div>
      <strong>{title}</strong>
      <p style={{ margin: "7px 0 0", color: "#666", lineHeight: 1.6 }}>
        {text}
      </p>
    </div>
  );

  const RealProductCard = ({ product }) => (
    <article
      style={{
        ...card,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: 170,
          background: "#f7f4fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span style={{ fontSize: 60 }}>📦</span>
        )}
      </div>

      <div style={{ padding: 16 }}>
        <strong style={{ display: "block", fontSize: 17 }}>
          {product.name}
        </strong>

        <div
          style={{
            marginTop: 9,
            fontSize: 21,
            fontWeight: 900,
            color: "#7020d0",
          }}
        >
          ${Number(product.price || 0).toLocaleString("es-MX", {
            minimumFractionDigits: 2,
          })}
        </div>

        <div style={{ marginTop: 7, color: "#666", fontSize: 13 }}>
          Inventario: {product.stock}
        </div>

        <div
          style={{
            marginTop: 7,
            fontSize: 12,
            fontWeight: 800,
            color: product.status === "approved" ? "#16834a" : "#b66a00",
          }}
        >
          {product.status === "approved"
            ? "✓ Publicado"
            : product.status === "pending"
            ? "⏳ Pendiente de aprobación"
            : product.status}
        </div>

        <button
          type="button"
          onClick={() => deleteProduct(product.id)}
          style={{
            width: "100%",
            marginTop: 13,
            padding: 11,
            border: "1px solid #f0d5dc",
            borderRadius: 12,
            background: "#fff",
            color: "#d41452",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Eliminar
        </button>
      </div>
    </article>
  );

  const ProductGrid = () => (
    <div className="products-grid">
      {filteredProducts.map((product) => (
        <article
          className="product-card"
          key={product.name}
          onClick={() => notify(`Seleccionaste ${product.name}`)}
        >
          <div className="product-image">
            <span className="product-label">{product.discount}</span>

            <button
              className="heart-button"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(product.name);
              }}
            >
              {favorites.includes(product.name) ? "♥" : "♡"}
            </button>

            <div className="product-art">{product.icon}</div>
          </div>

          <div className="product-info">
            <h3>{product.name}</h3>

            <div className="price-row">
              <strong>{product.price}</strong>
              {product.oldPrice && <del>{product.oldPrice}</del>}
            </div>

            <div className="rating-row">
              <span>★</span> {product.rating}
              <small>• {product.sales}</small>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  const SellerCreateStore = () => (
    <>
      <PageHeader
        icon="🏪"
        title="Crea tu tienda"
        text="Antes de publicar productos necesitamos crear tu tienda."
      />

      <form onSubmit={createStore} style={card}>
        <label className="form-label">Nombre de la tienda</label>

        <input
          name="store_name"
          className="seller-input"
          placeholder="Ej. Tienda Jacqueline"
          required
        />

        <label className="form-label">Descripción</label>

        <textarea
          name="description"
          className="seller-input"
          placeholder="Cuéntales a tus clientes qué vendes..."
          rows={5}
        />

        {storeError && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 12,
              background: "#fff0f3",
              color: "#b21e4b",
              fontSize: 13,
            }}
          >
            {storeError}
          </div>
        )}

        <button
          type="submit"
          disabled={storeLoading}
          style={{
            width: "100%",
            marginTop: 15,
            padding: 15,
            border: 0,
            borderRadius: 14,
            background: "linear-gradient(90deg,#ed174d,#7020d0)",
            color: "#fff",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {storeLoading ? "Creando tienda..." : "Crear mi tienda"}
        </button>
      </form>
    </>
  );

  const SellerDashboard = () => {
    if (!session) {
      return (
        <>
          <PageHeader
            icon="🏪"
            title="Vende en SHORASHOPP"
            text="Inicia sesión para administrar tu tienda."
          />
          <button
            type="button"
            onClick={() => openAuth("login")}
            style={{
              width: "100%",
              padding: 16,
              border: 0,
              borderRadius: 15,
              background: "linear-gradient(90deg,#ed174d,#7020d0)",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            Iniciar sesión
          </button>
        </>
      );
    }

    if (storeLoading) {
      return (
        <>
          <PageHeader
            icon="🏪"
            title="Vende en SHORASHOPP"
            text="Estamos preparando tu tienda."
          />
          <Info icon="⏳" title="Cargando..." text="Consultando tu tienda." />
        </>
      );
    }

    if (!store) {
      return <SellerCreateStore />;
    }

    return (
      <>
        <PageHeader
          icon="🏪"
          title={store.store_name}
          text={store.description || "Administra tu tienda SHORASHOPP."}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2,minmax(0,1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div style={card}>
            <strong style={{ fontSize: 26 }}>{realProducts.length}</strong>
            <div style={{ color: "#666", marginTop: 5 }}>Productos</div>
          </div>

          <div style={card}>
            <strong style={{ fontSize: 26 }}>
              {realProducts.reduce(
                (total, product) => total + Number(product.stock || 0),
                0
              )}
            </strong>
            <div style={{ color: "#666", marginTop: 5 }}>En inventario</div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <Option
            icon="📦"
            title="Productos publicados"
            text="Administra tus productos."
            page="seller-products"
          />

          <Option
            icon="➕"
            title="Agregar producto"
            text="Publica un producto nuevo."
            page="seller-add-product"
          />

          <Option
            icon="💰"
            title="Ventas"
            text="Consulta tus ventas."
            page="seller-sales"
          />

          <Option
            icon="⭐"
            title="Reseñas"
            text="Consulta las opiniones."
            page="seller-reviews"
          />

          <Option
            icon="💳"
            title="Comisiones"
            text="Consulta tus comisiones."
            page="seller-commissions"
          />
        </div>
      </>
    );
  };

  const SellerProducts = () => (
    <>
      <PageHeader
        icon="📦"
        title="Mis productos"
        text={store ? store.store_name : "Productos de tu tienda."}
      />

      <button
        type="button"
        onClick={() => go("seller-add-product")}
        style={{
          width: "100%",
          padding: 15,
          marginBottom: 15,
          border: 0,
          borderRadius: 15,
          background: "linear-gradient(90deg,#ed174d,#7020d0)",
          color: "#fff",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        + Agregar producto
      </button>

      {productsLoading ? (
        <Info
          icon="⏳"
          title="Cargando productos..."
          text="Estamos consultando los productos de tu tienda."
        />
      ) : realProducts.length === 0 ? (
        <Info
          icon="📦"
          title="Todavía no tienes productos"
          text="Cuando publiques tu primer producto aparecerá aquí."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
            gap: 14,
          }}
        >
          {realProducts.map((product) => (
            <RealProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );

  const SellerAddProduct = () => {
    if (!session) {
      return (
        <>
          <PageHeader
            icon="➕"
            title="Agregar producto"
            text="Inicia sesión para publicar productos."
          />
          <button
            type="button"
            onClick={() => openAuth("login")}
            style={{
              width: "100%",
              padding: 16,
              border: 0,
              borderRadius: 15,
              background: "linear-gradient(90deg,#ed174d,#7020d0)",
              color: "#fff",
              fontWeight: 900,
            }}
          >
            Iniciar sesión
          </button>
        </>
      );
    }

    if (!store) {
      return <SellerCreateStore />;
    }

    return (
      <>
        <PageHeader
          icon="➕"
          title="Publicar producto"
          text={`Publica un producto en ${store.store_name}.`}
        />

        <form
          onSubmit={createProduct}
          style={{
            ...card,
            display: "grid",
            gap: 13,
          }}
        >
          <label className="form-label">Nombre del producto</label>

          <input
            className="seller-input"
            value={productForm.name}
            onChange={(e) =>
              setProductForm({
                ...productForm,
                name: e.target.value,
              })
            }
            placeholder="Ej. Audífonos inalámbricos"
            required
          />

          <label className="form-label">Descripción</label>

          <textarea
            className="seller-input"
            value={productForm.description}
            onChange={(e) =>
              setProductForm({
                ...productForm,
                description: e.target.value,
              })
            }
            placeholder="Describe tu producto..."
            rows={5}
          />

          <label className="form-label">Precio</label>

          <input
            className="seller-input"
            type="number"
            min="0"
            step="0.01"
            value={productForm.price}
            onChange={(e) =>
              setProductForm({
                ...productForm,
                price: e.target.value,
              })
            }
            placeholder="0.00"
            required
          />

          <label className="form-label">
            Precio anterior <span>(opcional)</span>
          </label>

          <input
            className="seller-input"
            type="number"
            min="0"
            step="0.01"
            value={productForm.compare_at_price}
            onChange={(e) =>
              setProductForm({
                ...productForm,
                compare_at_price: e.target.value,
              })
            }
            placeholder="0.00"
          />

          <label className="form-label">Categoría</label>

          <select
            className="seller-input"
            value={productForm.category_name}
            onChange={(e) =>
              setProductForm({
                ...productForm,
                category_name: e.target.value,
              })
            }
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(([, name]) => (
              <option value={name} key={name}>
                {name}
              </option>
            ))}
          </select>

          <label className="form-label">Inventario</label>

          <input
            className="seller-input"
            type="number"
            min="0"
            step="1"
            value={productForm.stock}
            onChange={(e) =>
              setProductForm({
                ...productForm,
                stock: e.target.value,
              })
            }
            required
          />

          <label className="form-label">
            SKU <span>(opcional)</span>
          </label>

          <input
            className="seller-input"
            value={productForm.sku}
            onChange={(e) =>
              setProductForm({
                ...productForm,
                sku: e.target.value,
              })
            }
            placeholder="Ej. AUD-001"
          />

          <label className="form-label">
            Imagen del producto <span>(URL opcional por ahora)</span>
          </label>

          <input
            className="seller-input"
            type="url"
            value={productForm.image_url}
            onChange={(e) =>
              setProductForm({
                ...productForm,
                image_url: e.target.value,
              })
            }
            placeholder="https://..."
          />

          {storeError && (
            <div
              style={{
                padding: 12,
                borderRadius: 12,
                background: "#fff0f3",
                color: "#b21e4b",
                fontSize: 13,
              }}
            >
              {storeError}
            </div>
          )}

          <div
            style={{
              padding: 13,
              borderRadius: 13,
              background: "#f7f3fb",
              color: "#5e5266",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            ℹ️ El producto se guardará como <strong>pendiente</strong> de
            aprobación. Tú podrás verlo desde tu panel de vendedor.
          </div>

          <button
            type="submit"
            disabled={productsLoading}
            style={{
              width: "100%",
              padding: 16,
              border: 0,
              borderRadius: 15,
              background: "linear-gradient(90deg,#ed174d,#7020d0)",
              color: "#fff",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            {productsLoading ? "Publicando..." : "Publicar producto"}
          </button>
        </form>
      </>
    );
  };

  const renderPage = () => {
    switch (currentPage) {
      case "account":
        return (
          <>
            <PageHeader
              icon="👤"
              title="Mi cuenta"
              text="Gestiona tu perfil, pedidos y configuración."
            />

            <div style={{ display: "grid", gap: 12 }}>
              <Option
                icon="👤"
                title="Perfil"
                text="Consulta tu información personal."
                page="profile"
              />

              <Option
                icon="📦"
                title="Mis pedidos"
                text="Consulta tus compras."
                page="orders"
              />

              <Option
                icon="📍"
                title="Direcciones"
                text="Administra tus direcciones."
                page="addresses"
              />

              <Option
                icon="💳"
                title="Métodos de pago"
                text="Administra tus formas de pago."
                page="payment-methods"
              />

              <Option
                icon="🎟️"
                title="Cupones"
                text="Consulta tus cupones."
                page="coupons"
              />

              <Option
                icon="💰"
                title="Monedero"
                text="Consulta tu saldo."
                page="wallet"
              />

              <Option
                icon="🔐"
                title="Privacidad y seguridad"
                text="Protege tu cuenta."
                page="privacy"
              />

              <Option
                icon="⚙️"
                title="Configuración"
                text="Configura tu experiencia."
                page="settings"
              />

              <button
                type="button"
                onClick={logout}
                style={{
                  ...button,
                  color: "#d41452",
                }}
              >
                🚪 Cerrar sesión
              </button>
            </div>
          </>
        );

      case "profile":
        return (
          <>
            <PageHeader
              icon="👤"
              title="Perfil"
              text="Tu información personal."
            />

            <Info
              icon="👤"
              title={
                session?.user?.user_metadata?.full_name || "Mi perfil"
              }
              text={session?.user?.email || "Usuario de SHORASHOPP"}
            />

            <div style={{ marginTop: 12 }}>
              <Option
                icon="✏️"
                title="Editar perfil"
                text="Modifica tus datos personales."
                page="edit-profile"
              />
            </div>
          </>
        );

      case "edit-profile":
        return (
          <>
            <PageHeader
              icon="✏️"
              title="Editar perfil"
              text="Actualiza tu información."
            />

            <Info
              icon="📝"
              title="Datos personales"
              text="Aquí quedará la edición de nombre, fotografía y demás información de tu perfil."
            />
          </>
        );

      case "categories":
        return (
          <>
            <PageHeader
              icon="▦"
              title="Categorías"
              text="Explora productos por categoría."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2,minmax(0,1fr))",
                gap: 12,
              }}
            >
              {categories.map(([icon, name]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setCategory(name);
                    go("home");
                  }}
                  style={{
                    ...button,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 34 }}>{icon}</div>
                  <strong>{name}</strong>
                </button>
              ))}
            </div>
          </>
        );

      case "favorites":
        return (
          <>
            <PageHeader
              icon="♡"
              title="Favoritos"
              text="Tus productos guardados."
            />

            {favorites.length === 0 ? (
              <Info
                icon="♡"
                title="No tienes favoritos"
                text="Toca el corazón de cualquier producto para guardarlo aquí."
              />
            ) : (
              <ProductGrid />
            )}
          </>
        );

      case "offers":
        return (
          <>
            <PageHeader
              icon="🏷️"
              title="Ofertas exclusivas"
              text="Descuentos especiales de SHORASHOPP."
            />

            <ProductGrid />
          </>
        );

      case "notifications":
        return (
          <>
            <PageHeader
              icon="🔔"
              title="Notificaciones"
              text="Novedades y avisos de SHORASHOPP."
            />

            <div style={{ display: "grid", gap: 12 }}>
              <Option
                icon="🔥"
                title="Nuevas ofertas disponibles"
                text="Revisa promociones y descuentos."
                page="notification-offers"
              />

              <Option
                icon="📦"
                title="Tus pedidos"
                text="Consulta actualizaciones de tus compras."
                page="notification-orders"
              />

              <Option
                icon="💬"
                title="Mensajes"
                text="Consulta mensajes de vendedores y soporte."
                page="notification-messages"
              />
            </div>
          </>
        );

      case "notification-offers":
        return (
          <>
            <PageHeader
              icon="🔥"
              title="Nuevas ofertas"
              text="Promociones y descuentos disponibles."
            />

            <ProductGrid />
          </>
        );

      case "notification-orders":
        return (
          <>
            <PageHeader
              icon="📦"
              title="Tus pedidos"
              text="Actualizaciones de tus compras."
            />

            <OrdersPage />
          </>
        );

      case "notification-messages":
      case "messages":
        return <MessagesPage />;

      case "messages-conversations":
        return (
          <>
            <PageHeader
              icon="💬"
              title="Conversaciones"
              text="Tus conversaciones recientes."
            />

            <Info
              icon="💬"
              title="Conversaciones recientes"
              text="Aquí aparecerán tus conversaciones conforme comiences a comunicarte dentro de SHORASHOPP."
            />

            <div style={{ marginTop: 12 }}>
              <Option
                icon="💬"
                title="Abrir conversaciones"
                text="Consulta tus conversaciones."
                page="conversation"
              />
            </div>
          </>
        );

      case "messages-sellers":
        return (
          <>
            <PageHeader
              icon="🏪"
              title="Vendedores"
              text="Comunicación con vendedores."
            />

            <Info
              icon="🏪"
              title="Mis vendedores"
              text="Los vendedores con los que tengas conversaciones aparecerán aquí."
            />

            <div style={{ marginTop: 12 }}>
              <Option
                icon="💬"
                title="Conversar con un vendedor"
                text="Consulta tus conversaciones."
                page="conversation"
              />
            </div>
          </>
        );

      case "messages-support":
        return (
          <>
            <PageHeader
              icon="🛟"
              title="Soporte SHORASHOPP"
              text="Estamos aquí para ayudarte."
            />

            <Info
              icon="🛟"
              title="Atención al cliente"
              text="Aquí podrás comunicarte con el equipo de soporte."
            />

            <div style={{ marginTop: 12 }}>
              <Option
                icon="💬"
                title="Abrir soporte"
                text="Inicia una conversación con soporte."
                page="support"
              />
            </div>
          </>
        );

      case "conversation":
        return (
          <>
            <PageHeader
              icon="💬"
              title="Conversación"
              text="Tu conversación dentro de SHORASHOPP."
            />

            <Info
              icon="💬"
              title="Sin mensajes todavía"
              text="Esta pantalla queda preparada para conectar las conversaciones reales."
            />
          </>
        );

      case "orders":
        return (
          <>
            <PageHeader
              icon="📦"
              title="Mis pedidos"
              text="Consulta tus compras, entregas y confirmaciones."
            />

            <div style={{ display: "grid", gap: 12 }}>
              <Option
                icon="📦"
                title="Tus pedidos"
                text="Consulta tus compras y el estado de cada pedido."
                page="orders-list"
              />

              <Option
                icon="🚚"
                title="Seguimiento"
                text="Revisa el progreso y ubicación de tus entregas."
                page="orders-tracking"
              />

              <Option
                icon="✅"
                title="Confirmaciones"
                text="Consulta confirmaciones relacionadas con tus compras."
                page="orders-confirmations"
              />
            </div>
          </>
        );

      case "orders-list":
        return (
          <>
            <PageHeader
              icon="📦"
              title="Tus pedidos"
              text="Tus compras y detalles."
            />

            <Info
              icon="📦"
              title="Pedidos realizados"
              text="Tus pedidos aparecerán aquí después de realizar una compra."
            />

            <div style={{ marginTop: 12 }}>
              <Option
                icon="📋"
                title="Detalle de pedido"
                text="Consulta la información de un pedido."
                page="order-detail"
              />
            </div>
          </>
        );

      case "orders-tracking":
        return (
          <>
            <PageHeader
              icon="🚚"
              title="Seguimiento"
              text="Consulta el avance de tus entregas."
            />

            <Info
              icon="📍"
              title="Ubicación del pedido"
              text="El seguimiento de tus envíos aparecerá aquí cuando exista una compra activa."
            />

            <div style={{ marginTop: 12 }}>
              <Option
                icon="📦"
                title="Ver pedido"
                text="Consulta los detalles del pedido."
                page="order-detail"
              />
            </div>
          </>
        );

      case "orders-confirmations":
        return (
          <>
            <PageHeader
              icon="✅"
              title="Confirmaciones"
              text="Confirmaciones de tus compras."
            />

            <Info
              icon="✅"
              title="Compra confirmada"
              text="Las confirmaciones de tus compras aparecerán aquí."
            />

            <Info
              icon="💳"
              title="Pago confirmado"
              text="Aquí podrán mostrarse las confirmaciones relacionadas con tus pagos."
            />

            <Info
              icon="📦"
              title="Pedido recibido"
              text="Las confirmaciones de recepción podrán aparecer aquí."
            />
          </>
        );

      case "order-detail":
        return (
          <>
            <PageHeader
              icon="📋"
              title="Detalle del pedido"
              text="Información completa de tu pedido."
            />

            <Info
              icon="📦"
              title="Productos"
              text="Aquí se mostrarán los productos incluidos en el pedido."
            />

            <Info
              icon="💳"
              title="Pago"
              text="Aquí aparecerá la información correspondiente al pago."
            />

            <Info
              icon="🚚"
              title="Entrega"
              text="Aquí aparecerá la información de envío y seguimiento."
            />
          </>
        );

      case "cart":
        return (
          <>
            <PageHeader
              icon="🛒"
              title="Carrito"
              text="Productos que estás por comprar."
            />

            <Info
              icon="🛒"
              title="Tu carrito está vacío"
              text="Los productos que agregues aparecerán aquí."
            />

            <div style={{ marginTop: 12 }}>
              <Option
                icon="💳"
                title="Continuar al pago"
                text="Pasar al proceso de compra."
                page="checkout"
              />
            </div>
          </>
        );

      case "checkout":
        return (
          <>
            <PageHeader
              icon="🧾"
              title="Finalizar compra"
              text="Revisa tu compra antes de pagar."
            />

            <Option
              icon="📍"
              title="Dirección"
              text="Selecciona dónde recibir tu pedido."
              page="addresses"
            />

            <div style={{ marginTop: 12 }}>
              <Option
                icon="💳"
                title="Método de pago"
                text="Selecciona cómo pagar."
                page="payment"
              />
            </div>
          </>
        );

      case "payment":
        return (
          <>
            <PageHeader
              icon="💳"
              title="Pago"
              text="Selecciona tu método de pago."
            />

            <Option
              icon="💳"
              title="Métodos de pago"
              text="Administra tus tarjetas y métodos."
              page="payment-methods"
            />

            <div style={{ marginTop: 12 }}>
              <Info
                icon="🔒"
                title="Pago seguro"
                text="La información de pago se manejará mediante el sistema de pagos conectado a tu aplicación."
              />
            </div>
          </>
        );

      case "addresses":
        return (
          <>
            <PageHeader
              icon="📍"
              title="Direcciones"
              text="Administra tus direcciones de entrega."
            />

            <Info
              icon="📍"
              title="Mis direcciones"
              text="Tus direcciones guardadas aparecerán aquí."
            />

            <div style={{ marginTop: 12 }}>
              <Option
                icon="➕"
                title="Agregar dirección"
                text="Añade una nueva dirección."
                page="add-address"
              />
            </div>
          </>
        );

      case "add-address":
        return (
          <>
            <PageHeader
              icon="📍"
              title="Agregar dirección"
              text="Añade una dirección de entrega."
            />

            <Info
              icon="📝"
              title="Nueva dirección"
              text="Esta pantalla queda preparada para conectar el formulario de dirección."
            />
          </>
        );

      case "payment-methods":
        return (
          <>
            <PageHeader
              icon="💳"
              title="Métodos de pago"
              text="Administra tus formas de pago."
            />

            <Info
              icon="💳"
              title="Métodos guardados"
              text="Tus métodos de pago aparecerán aquí."
            />

            <div style={{ marginTop: 12 }}>
              <Option
                icon="➕"
                title="Agregar método"
                text="Añade una nueva forma de pago."
                page="add-payment-method"
              />
            </div>
          </>
        );

      case "add-payment-method":
        return (
          <>
            <PageHeader
              icon="💳"
              title="Agregar método de pago"
              text="Añade una nueva forma de pago."
            />

            <Info
              icon="🔒"
              title="Pago protegido"
              text="Esta pantalla queda preparada para conectar el formulario de pago."
            />
          </>
        );

      case "coupons":
        return (
          <>
            <PageHeader
              icon="🎟️"
              title="Cupones"
              text="Tus descuentos disponibles."
            />

            <Info
              icon="🎟️"
              title="Mis cupones"
              text="Aquí aparecerán tus cupones y códigos de descuento."
            />
          </>
        );

      case "wallet":
        return (
          <>
            <PageHeader
              icon="💰"
              title="Monedero"
              text="Saldo y movimientos."
            />

            <Info
              icon="💰"
              title="Saldo disponible"
              text="$0.00 — esta sección queda preparada para conectar el monedero."
            />

            <Info
              icon="📋"
              title="Movimientos"
              text="Aquí aparecerán tus movimientos."
            />
          </>
        );

      case "returns":
        return (
          <>
            <PageHeader
              icon="↩️"
              title="Devoluciones"
              text="Gestiona tus devoluciones."
            />

            <Option
              icon="📦"
              title="Mis devoluciones"
              text="Consulta tus solicitudes."
              page="return-detail"
            />
          </>
        );

      case "return-detail":
        return (
          <>
            <PageHeader
              icon="↩️"
              title="Detalle de devolución"
              text="Información de tu devolución."
            />

            <Info
              icon="📋"
              title="Solicitud"
              text="Aquí aparecerán los detalles de la devolución."
            />

            <Info
              icon="🚚"
              title="Estado"
              text="Aquí aparecerá el avance de tu devolución."
            />
          </>
        );

      case "help":
        return (
          <>
            <PageHeader
              icon="❓"
              title="Centro de ayuda"
              text="Encuentra respuestas a tus preguntas."
            />

            <Option
              icon="🛟"
              title="Soporte SHORASHOPP"
              text="Contacta con nuestro equipo."
              page="support"
            />

            <div style={{ marginTop: 12 }}>
              <Option
                icon="↩️"
                title="Devoluciones"
                text="Consulta devoluciones."
                page="returns"
              />
            </div>
          </>
        );

      case "support":
        return (
          <>
            <PageHeader
              icon="🛟"
              title="Soporte SHORASHOPP"
              text="Ayuda y atención al cliente."
            />

            <Info
              icon="💬"
              title="Atención al cliente"
              text="Esta pantalla queda preparada para conectar el chat de soporte."
            />

            <Info
              icon="📋"
              title="Mis solicitudes"
              text="Aquí aparecerán tus solicitudes de soporte."
            />
          </>
        );

      case "referrals":
        return (
          <>
            <PageHeader
              icon="🎁"
              title="Programa de referidos"
              text="Invita personas y obtén beneficios."
            />

            <Info
              icon="🎁"
              title="Tu código de invitación"
              text="Aquí aparecerá tu código personal para compartir."
            />

            <Info
              icon="👥"
              title="Personas invitadas"
              text="Aquí aparecerán tus referencias."
            />
          </>
        );

      case "privacy":
        return (
          <>
            <PageHeader
              icon="🔐"
              title="Privacidad y seguridad"
              text="Protege tu cuenta y tus datos."
            />

            <Option
              icon="📱"
              title="Sesiones activas"
              text="Revisa dónde está iniciada tu cuenta."
              page="sessions"
            />

            <div style={{ marginTop: 12 }}>
              <Option
                icon="🛡️"
                title="Verificación de seguridad"
                text="Consulta el estado de seguridad."
                page="security"
              />
            </div>
          </>
        );

      case "sessions":
        return (
          <>
            <PageHeader
              icon="📱"
              title="Sesiones activas"
              text="Dispositivos conectados a tu cuenta."
            />

            <Info
              icon="📱"
              title="Sesión actual"
              text="Este dispositivo está utilizando tu cuenta actualmente."
            />

            <Info
              icon="🔒"
              title="Cerrar sesiones"
              text="La administración de sesiones queda preparada para conectarse a tu sistema de autenticación."
            />
          </>
        );

      case "security":
        return (
          <>
            <PageHeader
              icon="🛡️"
              title="Verificación de seguridad"
              text="Estado de protección de tu cuenta."
            />

            <Info
              icon="🔑"
              title="Contraseña"
              text="Tu contraseña se administra mediante el sistema de autenticación."
            />

            <Info
              icon="✉️"
              title="Correo electrónico"
              text={session?.user?.email || "Correo de la cuenta"}
            />

            <Info
              icon="🛡️"
              title="Cuenta protegida"
              text="Tu flujo actual de acceso permanece conectado."
            />
          </>
        );

      case "settings":
        return (
          <>
            <PageHeader
              icon="⚙️"
              title="Configuración"
              text="Personaliza tu experiencia."
            />

            <Info
              icon="🔔"
              title="Preferencias de notificaciones"
              text="Aquí podrás controlar qué avisos quieres recibir."
            />

            <Info
              icon="🌐"
              title="Preferencias generales"
              text="Aquí quedarán las configuraciones generales de la aplicación."
            />
          </>
        );

      case "seller":
        return <SellerDashboard />;

      case "seller-dashboard":
        return <SellerDashboard />;

      case "seller-products":
        return <SellerProducts />;

      case "seller-add-product":
        return <SellerAddProduct />;

      case "seller-sales":
        return (
          <>
            <PageHeader
              icon="💰"
              title="Ventas"
              text="Consulta el rendimiento de tu tienda."
            />

            <Info
              icon="💰"
              title="Ventas totales"
              text="$0.00 — aquí aparecerán tus ventas cuando estén conectadas."
            />

            <Info
              icon="📊"
              title="Estadísticas"
              text="Aquí se mostrarán tus estadísticas de ventas."
            />
          </>
        );

      case "seller-reviews":
        return (
          <>
            <PageHeader
              icon="⭐"
              title="Reseñas"
              text="Opiniones de tus compradores."
            />

            <Info
              icon="⭐"
              title="Mis reseñas"
              text="Aquí aparecerán las reseñas recibidas en tus productos."
            />
          </>
        );

      case "seller-commissions":
        return (
          <>
            <PageHeader
              icon="💳"
              title="Comisiones"
              text="Consulta las comisiones de tu tienda."
            />

            <Info
              icon="💳"
              title="Comisiones"
              text="Aquí aparecerá el detalle de las comisiones correspondientes a tus ventas."
            />
          </>
        );

      default:
        return <Home />;
    }
  };

  const Home = () => (
    <main>
      <section className="quick-cards">
        <button
          className="quick-card sell-card"
          type="button"
          onClick={() => {
            if (session) go("seller");
            else openAuth("register");
          }}
        >
          <div className="quick-icon">▣</div>

          <div className="quick-content">
            <strong>
              Vende en
              <br />
              SHORASHOPP
            </strong>

            <span>
              Únete y comienza a vender tus productos hoy.
            </span>
          </div>

          <b className="round-arrow">›</b>
        </button>

        <button
          className="quick-card account-card"
          type="button"
          onClick={() =>
            session ? go("account") : openAuth("login")
          }
        >
          <div className="quick-icon">♙</div>

          <div className="quick-content">
            <strong>Mi cuenta</strong>

            <span>
              {session ? "Sesión iniciada" : "Hola, Jacqueline"}
            </span>

            <small>
              Perfil, pedidos y configuraciones
            </small>
          </div>

          <b className="round-arrow">›</b>
        </button>
      </section>

      <section className="content-section">
        <div className="section-title-row">
          <h2>Categorías</h2>

          <button
            type="button"
            onClick={() => go("categories")}
          >
            Ver todas <span>›</span>
          </button>
        </div>

        <div className="categories-scroll">
          {categories.map(([icon, name]) => (
            <button
              className="category-item"
              key={name}
              type="button"
              onClick={() => {
                setCategory(name);
                setSearch("");
                go("home");
              }}
            >
              <div className="category-icon">
                {icon}
              </div>

              <span>{name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="offer-section">
        <div className="offer-banner">
          <div className="offer-text">
            <strong>
              OFERTAS
              <br />
              EXCLUSIVAS
            </strong>

            <span>
              Descuentos increíbles
              <br />
              por tiempo limitado
            </span>

            <button
              type="button"
              onClick={() => go("offers")}
            >
              Ver ofertas <b>›</b>
            </button>
          </div>

          <div className="offer-products">
            <div className="offer-bag">🛍️</div>
            <div className="offer-watch">⌚</div>
            <div className="offer-shoe">👟</div>
            <div className="offer-percent">%</div>
          </div>
        </div>
      </section>

      <section className="content-section products-section">
        <div className="section-title-row">
          <h2>
            {category || "Productos destacados"}
          </h2>

          <button
            type="button"
            onClick={() => {
              setCategory("");
              setSearch("");
            }}
          >
            Ver todos <span>›</span>
          </button>
        </div>

        <ProductGrid />
      </section>

      <section className="trust-section">
        <div className="trust-item">
          <span>♢</span>
          <strong>Compra segura</strong>
          <small>
            Protegemos tus datos y compras
          </small>
        </div>

        <div className="trust-item">
          <span>♧</span>
          <strong>Envíos rápidos</strong>
          <small>
            Recibe tus productos rápidamente
          </small>
        </div>

        <div className="trust-item">
          <span>✿</span>
          <strong>Vendedores verificados</strong>
          <small>
            Más confianza para ti
          </small>
        </div>

        <div className="trust-item">
          <span>☏</span>
          <strong>Soporte 24/7</strong>
          <small>
            Estamos aquí para ayudarte
          </small>
        </div>
      </section>
    </main>
  );

  return (
    <div className="app">
      <header className="mobile-header">
        <button
          className="menu-button"
          type="button"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>

        <button
          className="logo"
          type="button"
          onClick={() => go("home")}
        >
          <strong>
            SHORA<span>SHOPP</span>
          </strong>

          <small>
            Compra. <b>Vende.</b> Descubre.
          </small>
        </button>

        <div className="header-icons">
          <button
            type="button"
            className="notification-button"
            onClick={() => go("notifications")}
          >
            🔔
            <i>3</i>
          </button>

          <button
            type="button"
            className="cart-button"
            onClick={() => go("cart")}
          >
            🛒
            <i>2</i>
          </button>
        </div>
      </header>

      <div className="search-container">
        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="¿Qué estás buscando hoy?"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                go("home");
              }
            }}
          />

          <button
            type="button"
            onClick={() => go("home")}
          >
            ⌕
          </button>
        </div>
      </div>

      {currentPage === "home" ? (
        <Home />
      ) : (
        <section
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "20px 16px 120px",
          }}
        >
          <button
            type="button"
            onClick={back}
            style={{
              border: 0,
              background: "transparent",
              color: "#7020d0",
              fontWeight: 800,
              padding: "8px 0 16px",
              cursor: "pointer",
            }}
          >
            ← Volver
          </button>

          {renderPage()}
        </section>
      )}

      {menuOpen && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setMenuOpen(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.35)",
            zIndex: 10000,
          }}
        >
          <aside
            style={{
              width: "min(330px,88vw)",
              height: "100%",
              background: "#fff",
              padding: 20,
              overflowY: "auto",
              boxShadow:
                "8px 0 30px rgba(0,0,0,.15)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 18,
              }}
            >
              <strong
                style={{
                  fontSize: 22,
                  background:
                    "linear-gradient(90deg,#ed174d,#7020d0)",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                SHORASHOPP
              </strong>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                style={{
                  border: 0,
                  background: "#f4f4f6",
                  borderRadius: 10,
                  width: 40,
                  height: 40,
                  fontSize: 22,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gap: 7 }}>
              <MenuItem
                icon="⌂"
                text="Inicio"
                onClick={() => go("home")}
              />

              <MenuItem
                icon="👤"
                text="Mi cuenta"
                onClick={() =>
                  session
                    ? go("account")
                    : openAuth("login")
                }
              />

              <MenuItem
                icon="▦"
                text="Categorías"
                onClick={() => go("categories")}
              />

              <MenuItem
                icon="♡"
                text="Favoritos"
                onClick={() => go("favorites")}
              />

              <MenuItem
                icon="🏷️"
                text="Ofertas"
                onClick={() => go("offers")}
              />

              <MenuItem
                icon="🔔"
                text="Notificaciones"
                onClick={() => go("notifications")}
              />

              <MenuItem
                icon="📦"
                text="Mis pedidos"
                onClick={() => go("orders")}
              />

              <MenuItem
                icon="💬"
                text="Mensajes"
                onClick={() => go("messages")}
              />

              <MenuItem
                icon="🛒"
                text="Carrito"
                onClick={() => go("cart")}
              />

              <MenuItem
                icon="📍"
                text="Direcciones"
                onClick={() => go("addresses")}
              />

              <MenuItem
                icon="💳"
                text="Métodos de pago"
                onClick={() => go("payment-methods")}
              />

              <MenuItem
                icon="🎟️"
                text="Cupones"
                onClick={() => go("coupons")}
              />

              <MenuItem
                icon="💰"
                text="Monedero"
                onClick={() => go("wallet")}
              />

              <MenuItem
                icon="↩️"
                text="Devoluciones"
                onClick={() => go("returns")}
              />

              <MenuItem
                icon="❓"
                text="Centro de ayuda"
                onClick={() => go("help")}
              />

              <MenuItem
                icon="🎁"
                text="Referidos"
                onClick={() => go("referrals")}
              />

              <MenuItem
                icon="🔐"
                text="Privacidad y seguridad"
                onClick={() => go("privacy")}
              />

              <MenuItem
                icon="⚙️"
                text="Configuración"
                onClick={() => go("settings")}
              />

              <MenuItem
                icon="🏪"
                text="Vender en SHORASHOPP"
                onClick={() =>
                  session
                    ? go("seller")
                    : openAuth("register")
                }
              />
            </div>
          </aside>
        </div>
      )}

      <nav className="bottom-nav">
        <button
          className={`bottom-item ${
            currentPage === "home"
              ? "active"
              : ""
          }`}
          type="button"
          onClick={() => go("home")}
        >
          <span>⌂</span>
          <small>Inicio</small>
        </button>

        <button
          className={`bottom-item ${
            currentPage === "categories"
              ? "active"
              : ""
          }`}
          type="button"
          onClick={() => go("categories")}
        >
          <span>▦</span>
          <small>Categorías</small>
        </button>

        <button
          className="seller-button"
          type="button"
          onClick={() =>
            session
              ? go("seller")
              : openAuth("register")
          }
        >
          <span>▰</span>
          <small>Vender</small>
        </button>

        <button
          className={`bottom-item ${
            currentPage === "favorites"
              ? "active"
              : ""
          }`}
          type="button"
          onClick={() => go("favorites")}
        >
          <span>♡</span>
          <small>Favoritos</small>
        </button>

        <button
          className={`bottom-item ${
            currentPage === "account"
              ? "active"
              : ""
          }`}
          type="button"
          onClick={() =>
            session
              ? go("account")
              : openAuth("login")
          }
        >
          <span>♙</span>
          <small>Cuenta</small>
        </button>
      </nav>

      {toast && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 90,
            transform: "translateX(-50%)",
            zIndex: 11000,
            background: "#222",
            color: "#fff",
            padding: "11px 18px",
            borderRadius: 20,
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          {toast}
        </div>
      )}

      {authOpen && (
        <div
          className="auth-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeAuth();
            }
          }}
        >
          <div className="auth-modal">
            <button
              className="auth-close"
              type="button"
              onClick={closeAuth}
            >
              ×
            </button>

            <div className="auth-logo">S</div>

            <h2>
              {authMode === "login"
                ? "Bienvenido."
                : "Crea tu cuenta."}
            </h2>

            <p>
              {authMode === "login"
                ? "Inicia sesión en SHORASHOPP."
                : "Únete a SHORASHOPP."}
            </p>

            <form onSubmit={authenticate}>
              {authMode === "register" && (
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  required
                />
              )}

              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                minLength={6}
                required
              />

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

            {authMessage && (
              <div className="auth-message">
                {authMessage}
              </div>
            )}

            <div className="auth-switch">
              {authMode === "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setAuthMessage("");
                    }}
                  >
                    Regístrate
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setAuthMessage("");
                    }}
                  >
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

function MenuItem({ icon, text, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 13,
        padding: 13,
        border: 0,
        borderRadius: 12,
        background: "#fff",
        color: "#24152f",
        fontWeight: 700,
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span>{text}</span>
    </button>
  );
}

export default App;
