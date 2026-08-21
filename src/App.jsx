import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "./App.css";

const categories = [
{ icon: "👕", name: "Ropa y Moda" },
{ icon: "📱", name: "Tecnología" },
{ icon: "🏠", name: "Hogar y Vida" },
{ icon: "👩", name: "Belleza y Salud" },
{ icon: "🎧", name: "Accesorios" },
{ icon: "🎮", name: "Juguetes y Más" },
];

const products = [
{
name: "Audífonos Inalámbricos",
price: "$399.00",
oldPrice: "$499.00",
rating: "4.8",
reviews: "120 ventas",
discount: "-20%",
type: "earbuds",
},
{
name: "Bolsa de Hombro Elegante",
price: "$599.00",
oldPrice: "$799.00",
rating: "4.9",
reviews: "85 ventas",
discount: "Nuevo",
type: "bag",
},
{
name: "Smartwatch Series 9",
price: "$1,699.00",
oldPrice: "$1,999.00",
rating: "4.7",
reviews: "64 ventas",
discount: "-15%",
type: "watch",
},
{
name: "Licuadora Profesional",
price: "$899.00",
oldPrice: "",
rating: "4.6",
reviews: "45 ventas",
discount: "Nuevo",
type: "blender",
},
];

function App() {
const [session, setSession] = useState(null);
const [showAuth, setShowAuth] = useState(false);
const [authMode, setAuthMode] = useState("login");
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState("");

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

useEffect(() => {
let mounted = true;

const getSession = async () => {  
  const { data } = await supabase.auth.getSession();  

  if (mounted) {  
    setSession(data?.session ?? null);  
  }  
};  

getSession();  

const {  
  data: { subscription },  
} = supabase.auth.onAuthStateChange((_event, currentSession) => {  
  setSession(currentSession);  
});  

return () => {  
  mounted = false;  
  subscription.unsubscribe();  
};

}, []);

const openAuth = (mode = "login") => {
setAuthMode(mode);
setMessage("");
setShowAuth(true);
};

const closeAuth = () => {
setShowAuth(false);
setMessage("");
setName("");
setEmail("");
setPassword("");
setLoading(false);
};

const handleAuth = async (event) => {
event.preventDefault();

setLoading(true);  
setMessage("");  

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
    } else {  
      setMessage(  
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
  }  
} catch (error) {  
  setMessage(error?.message || "Ocurrió un error.");  
} finally {  
  setLoading(false);  
}

};

const handleLogout = async () => {
await supabase.auth.signOut();
setSession(null);
};

const goHome = () => {
window.scrollTo({
top: 0,
behavior: "smooth",
});
};

return (
<div className="app">

{/* HEADER */}  

  <header className="mobile-header">  
    <button className="menu-button" type="button">  
      ☰  
    </button>  

    <button className="logo" type="button" onClick={goHome}>  
      <strong>  
        SHORA<span>SHOPP</span>  
      </strong>  

      <small>  
        Compra. <b>Vende.</b> Descubre.  
      </small>  
    </button>  

    <div className="header-icons">  
      <button type="button" className="notification-button">  
        ♧  
        <i>3</i>  
      </button>  

      <button type="button" className="cart-button">  
        🛒  
        <i>2</i>  
      </button>  
    </div>  
  </header>  

  {/* SEARCH */}  

  <div className="search-container">  
    <div className="search-box">  
      <span>⌕</span>  

      <input  
        type="text"  
        placeholder="¿Qué estás buscando hoy?"  
      />  

      <button type="button">  
        ⌕  
      </button>  
    </div>  
  </div>  

  <main>  

    {/* SELL / ACCOUNT */}  

    <section className="quick-cards">  

      <button  
        className="quick-card sell-card"  
        type="button"  
        onClick={() => openAuth("register")}  
      >  
        <div className="quick-icon">▣</div>  

        <div className="quick-content">  
          <strong>Vende en<br />SHORASHOPP</strong>  
          <span>Únete y comienza a vender<br />tus productos hoy</span>  
        </div>  

        <b className="round-arrow">›</b>  
      </button>  

      <button  
        className="quick-card account-card"  
        type="button"  
        onClick={() =>  
          session ? handleLogout() : openAuth("login")  
        }  
      >  
        <div className="quick-icon">♟</div>  

        <div className="quick-content">  
          <strong>  
            {session ? "Mi cuenta" : "Mi cuenta"}  
          </strong>  

          <span>  
            {session  
              ? "Sesión iniciada"  
              : "Hola, Jacqueline"}  
          </span>  

          <small>  
            {session  
              ? "Cerrar sesión"  
              : "Ver perfil, pedidos y configuraciones"}  
          </small>  
        </div>  

        <b className="round-arrow">›</b>  
      </button>  

    </section>  

    {/* CATEGORIES */}  

    <section className="content-section">  

      <div className="section-title-row">  
        <h2>Categorías</h2>  

        <button type="button">  
          Ver todas <span>›</span>  
        </button>  
      </div>  

      <div className="categories-scroll">  
        {categories.map((category) => (  
          <button  
            className="category-item"  
            key={category.name}  
            type="button"  
          >  
            <div className="category-icon">  
              {category.icon}  
            </div>  

            <span>{category.name}</span>  
          </button>  
        ))}  
      </div>  

    </section>  

    {/* OFFER BANNER */}  

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

          <button type="button">  
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

    {/* PRODUCTS */}  

    <section className="content-section products-section">  

      <div className="section-title-row">  
        <h2>Productos destacados</h2>  

        <button type="button">  
          Ver todos <span>›</span>  
        </button>  
      </div>  

      <div className="products-grid">  

        {products.map((product) => (  
          <article  
            className="product-card"  
            key={product.name}  
          >  

            <div className="product-image">  

              <span className="product-label">  
                {product.discount}  
              </span>  

              <button  
                className="heart-button"  
                type="button"  
                aria-label="Favorito"  
              >  
                ♡  
              </button>  

              <div className={`product-art ${product.type}`}>  
                {product.type === "earbuds" && "🎧"}  
                {product.type === "bag" && "👜"}  
                {product.type === "watch" && "⌚"}  
                {product.type === "blender" && "🥤"}  
              </div>  

            </div>  

            <div className="product-info">  

              <h3>{product.name}</h3>  

              <div className="price-row">  
                <strong>{product.price}</strong>  

                {product.oldPrice && (  
                  <del>{product.oldPrice}</del>  
                )}  
              </div>  

              <div className="rating-row">  
                <span>★</span>  
                {product.rating}  
                <small>• {product.reviews}</small>  
              </div>  

            </div>  

          </article>  
        ))}  

      </div>  

    </section>  

    {/* TRUST */}  

    <section className="trust-section">  

      <div className="trust-item">  
        <span>♢</span>  
        <strong>Compra segura</strong>  
        <small>Protegemos tus datos y compras</small>  
      </div>  

      <div className="trust-item">  
        <span>♧</span>  
        <strong>Envíos rápidos</strong>  
        <small>Recibe tus productos en tiempo récord</small>  
      </div>  

      <div className="trust-item">  
        <span>✿</span>  
        <strong>Vendedores verificados</strong>  
        <small>Más confianza para ti</small>  
      </div>  

      <div className="trust-item">  
        <span>☏</span>  
        <strong>Soporte 24/7</strong>  
        <small>Estamos aquí para ayudarte</small>  
      </div>  

    </section>  

  </main>  

  {/* BOTTOM NAV */}  

  <nav className="bottom-nav">  

    <button  
      className="bottom-item active"  
      type="button"  
      onClick={goHome}  
    >  
      <span>⌂</span>  
      <small>Inicio</small>  
    </button>  

    <button className="bottom-item" type="button">  
      <span>▦</span>  
      <small>Categorías</small>  
    </button>  

    <button  
      className="seller-button"  
      type="button"  
      onClick={() => openAuth("register")}  
    >  
      <span>▰</span>  
      <small>Vender</small>  
    </button>  

    <button className="bottom-item" type="button">  
      <span>♡</span>  
      <small>Favoritos</small>  
    </button>  

    <button  
      className="bottom-item"  
      type="button"  
      onClick={() =>  
        session ? handleLogout() : openAuth("login")  
      }  
    >  
      <span>♙</span>  
      <small>Cuenta</small>  
    </button>  

  </nav>  

  {/* AUTH */}  

  {showAuth && (  
    <div  
      className="auth-overlay"  
      onMouseDown={(event) => {  
        if (event.target === event.currentTarget) {  
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

        <div className="auth-logo">  
          S  
        </div>  

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

        <form onSubmit={handleAuth}>  

          {authMode === "register" && (  
            <input  
              type="text"  
              placeholder="Nombre completo"  
              value={name}  
              onChange={(event) =>  
                setName(event.target.value)  
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

        {message && (  
          <div className="auth-message">  
            {message}  
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
                  setMessage("");  
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
                  setMessage("");  
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

export default App;
