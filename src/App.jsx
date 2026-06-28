import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import SubcategoryPage from "./pages/SubcategoryPage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Support from "./pages/Support";
import StaticPage from "./pages/StaticPage";
import ScrollToTop from "./components/ScrollToTop";
import ThankYou from "./pages/ThankYou";
import Language from "./pages/Language";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Injects FB Pixel, GA4, GTM scripts from DB settings
const PixelInjector = () => {
  useEffect(() => {
    fetch(`${API_URL}/settings/pixel`)
      .then(r => r.json())
      .then(d => {
        const cfg = d?.value || {};

        // Facebook Pixel
        if (cfg.fbActive && cfg.fbPixelId) {
          const script = document.createElement("script");
          script.innerHTML = `
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init','${cfg.fbPixelId}');fbq('track','PageView');
          `;
          document.head.appendChild(script);
          if (cfg.fbTestCode && window.fbq) window.fbq("set", "testEventCode", cfg.fbTestCode);
        }

        // Google Analytics 4
        if (cfg.ga4Active && cfg.ga4Id) {
          const s1 = document.createElement("script");
          s1.async = true;
          s1.src = `https://www.googletagmanager.com/gtag/js?id=${cfg.ga4Id}`;
          document.head.appendChild(s1);
          const s2 = document.createElement("script");
          s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${cfg.ga4Id}');`;
          document.head.appendChild(s2);
        }

        // Google Tag Manager
        if (cfg.gtmActive && cfg.gtmId) {
          const s = document.createElement("script");
          s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${cfg.gtmId}');`;
          document.head.appendChild(s);
        }
      })
      .catch(() => {});
  }, []);
  return null;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const hasToken = localStorage.getItem("token");
  const hasAdmin = localStorage.getItem("admin");
  return isLoggedIn || hasToken || hasAdmin ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <PixelInjector />
      <ScrollToTop />
      <Routes>
        {/* Admin routes without header/footer */}
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Regular routes with header/footer */}
        <Route path="*" element={
          <div className="flex min-h-screen flex-col bg-white text-slate-950">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:productId" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart mode="cart" />} />
                <Route path="/order" element={<Cart mode="order" />} />
                <Route path="/thank-you" element={<ThankYou />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/category/:categoryId/:subcategoryId" element={<SubcategoryPage />} />
                <Route path="/support" element={<Support />} />
                <Route path="/news" element={<StaticPage title="News & Events" subtitle="Latest launches, retail announcements, and Vision stories." />} />
                <Route path="/media" element={<StaticPage title="Media Center" subtitle="Brand resources, product visuals, and press updates." />} />
                <Route path="/language" element={<Language />} />
                <Route 
                  path="/dashboard" 
                  element={<Navigate to="/admin" replace />} 
                />
                <Route path="*" element={<StaticPage title="Page Not Found" subtitle="The page you are looking for is not available." />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </>
  );
}

export default App;
