import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Pizza, Home, Menu, X, ShoppingBag, Package, Users, User, BarChart3, Shield, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Encabezado() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tienePermiso, logout, usuario, cargando } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { path: "/", label: "Inicio", icon: <Home size={18} />, permission: "ver_inicio" },
    { path: "/catalogo", label: "Catálogo", icon: <ShoppingBag size={18} />, permission: "ver_catalogo" },
    { path: "/productos", label: "Productos", icon: <Package size={18} />, permission: "ver_productos" },
    { path: "/categorias", label: "Categorías", icon: <LayoutDashboard size={18} />, permission: "ver_categorias" },
    { path: "/empleados", label: "Empleados", icon: <Users size={18} />, permission: "ver_empleados" },
    { path: "/clientes", label: "Clientes", icon: <User size={18} />, permission: "ver_clientes" },
    { path: "/ventas", label: "Ventas", icon: <BarChart3 size={18} />, permission: "ver_ventas" },
    { path: "/reportes", label: "Reportes", icon: <BarChart3 size={18} />, permission: "ver_reportes" },
    { path: "/permisos", label: "Permisos", icon: <Shield size={18} />, permission: "ver_permisos" },
  ];

  const itemsVisibles = menuItems.filter(item =>
    usuario?.rol === 'administrador' || tienePermiso(item.permission)
  );

  const cerrarSesion = async () => {
    await logout();
    setMenuAbierto(false);
    navigate("/login");
  };

  if (cargando) {
    return (
      <nav className="navbar-professional">
        <div className="nav-container">
          <div className="logo-wrapper">
            <div className="logo-icon"><Pizza size={28} /></div>
            <span className="logo-text">Mi Sistema</span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className={`navbar-professional ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          {/* Logo */}
          <Link className="logo-wrapper" to="/">
            <div className="logo-icon"><Pizza size={28} /></div>
            <span className="logo-text">Mi Sistema</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-nav">
            <ul className="nav-list">
              {itemsVisibles.map((item) => (
                <li key={item.path} className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    to={item.path}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="user-area">
              {usuario ? (
                <>
                  <div className="user-info">
                    <span className="user-name">{usuario.email?.split('@')[0] || 'Usuario'}</span>
                    <span className="user-role">{usuario.rol || 'Usuario'}</span>
                  </div>
                  <button className="logout-btn" onClick={cerrarSesion}>
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <Link to="/login" className="login-btn">
                  <User size={18} />
                  <span>Ingresar</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="menu-btn" onClick={() => setMenuAbierto(!menuAbierto)}>
            {menuAbierto ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {menuAbierto && (
          <>
            <div className="mobile-overlay" onClick={() => setMenuAbierto(false)} />
            <motion.div 
              className="mobile-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="drawer-header">
                <div className="drawer-header-content">
                  <div className="drawer-logo">
                    <Pizza size={28} />
                  </div>
                  <div>
                    <h3>Mi Sistema</h3>
                    <p>Bienvenido</p>
                  </div>
                </div>
                <button className="drawer-close" onClick={() => setMenuAbierto(false)}>
                  <X size={22} />
                </button>
              </div>

              {usuario && (
                <div className="user-profile-card">
                  <div className="profile-avatar">
                    <span className="avatar-initials">
                      {usuario.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="profile-info">
                    <span className="profile-name">{usuario.email}</span>
                    <span className="profile-role">{usuario.rol || 'Usuario'}</span>
                  </div>
                </div>
              )}

              <div className="drawer-menu">
                <div className="menu-section">
                  <span className="section-title">Menú</span>
                  <ul className="section-list">
                    {itemsVisibles.map((item) => (
                      <li key={item.path}>
                        <Link to={item.path} onClick={() => setMenuAbierto(false)}>
                          <span className="menu-icon">{item.icon}</span>
                          <span className="menu-label">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="drawer-footer">
                {usuario ? (
                  <button className="drawer-logout" onClick={cerrarSesion}>
                    <LogOut size={18} /> Cerrar Sesión
                  </button>
                ) : (
                  <Link to="/login" className="drawer-login" onClick={() => setMenuAbierto(false)}>
                    <User size={18} /> Iniciar Sesión
                  </Link>
                )}
                <div className="drawer-version">
                  <span>© 2024 Mi Sistema</span>
                  <span>v1.0</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .navbar-professional {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(20px);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .navbar-professional.scrolled {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        /* Logo */
        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .logo-icon {
          background: linear-gradient(135deg, #0d6efd, #6610f2);
          border-radius: 12px;
          padding: 8px;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-size: 1.3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #0d6efd, #6610f2);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        /* Desktop Navigation */
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-list {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 4px;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 12px;
          color: #495057;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: rgba(13, 110, 253, 0.1);
          color: #0d6efd;
        }

        .nav-link.active {
          background: linear-gradient(135deg, #0d6efd, #6610f2);
          color: white;
        }

        /* User Area */
        .user-area {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-info {
          text-align: right;
        }

        .user-name {
          display: block;
          font-weight: 600;
          font-size: 0.85rem;
          color: #212529;
        }

        .user-role {
          display: block;
          font-size: 0.7rem;
          color: #6c757d;
        }

        .logout-btn {
          background: none;
          border: none;
          padding: 8px;
          border-radius: 10px;
          cursor: pointer;
          color: #6c757d;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logout-btn:hover {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
        }

        .login-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: linear-gradient(135deg, #0d6efd, #6610f2);
          color: white;
          text-decoration: none;
          border-radius: 40px;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
        }

        /* Mobile Menu Button */
        .menu-btn {
          display: none;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: none;
          background: #f8f9fa;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }

        /* Mobile Drawer */
        .mobile-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 1100;
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 85%;
          max-width: 320px;
          background: white;
          box-shadow: -5px 0 30px rgba(0, 0, 0, 0.15);
          z-index: 1101;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .drawer-header {
          background: linear-gradient(135deg, #0d6efd, #6610f2);
          color: white;
          padding: 24px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .drawer-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .drawer-logo {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 8px;
        }

        .drawer-header h3 { margin: 0; font-size: 1.1rem; }
        .drawer-header p { margin: 0; font-size: 0.7rem; opacity: 0.9; }
        .drawer-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 12px;
          width: 36px;
          height: 36px;
          color: white;
          cursor: pointer;
        }

        .user-profile-card {
          background: #f8f9fa;
          margin: 16px;
          padding: 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          border: 1px solid #e9ecef;
        }

        .profile-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #0d6efd, #6610f2);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .avatar-initials {
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
        }

        .profile-name { display: block; font-weight: 700; font-size: 0.9rem; }
        .profile-role { display: block; font-size: 0.7rem; color: #6c757d; }

        .drawer-menu { flex: 1; padding: 8px 16px; }
        .menu-section { margin-bottom: 24px; }
        .section-title { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; color: #6c757d; margin-bottom: 12px; padding-left: 12px; }
        .section-list { list-style: none; padding: 0; margin: 0; }
        .section-list li { margin-bottom: 4px; }
        .section-list a { display: flex; align-items: center; gap: 14px; padding: 12px 14px; color: #495057; text-decoration: none; border-radius: 14px; transition: all 0.2s; }
        .section-list a:hover { background: #f8f9fa; }
        .menu-icon { width: 24px; display: flex; align-items: center; justify-content: center; color: #0d6efd; }
        .menu-label { font-weight: 500; font-size: 0.85rem; }

        .drawer-footer { padding: 16px; border-top: 1px solid #e9ecef; background: #f8f9fa; }
        .drawer-logout, .drawer-login { width: 100%; padding: 12px; border: none; border-radius: 14px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; text-decoration: none; }
        .drawer-logout { background: #dc3545; color: white; }
        .drawer-login { background: #0d6efd; color: white; }
        .drawer-version { display: flex; justify-content: space-between; margin-top: 12px; font-size: 0.65rem; color: #6c757d; }

        /* Responsive */
        @media (max-width: 991px) {
          .desktop-nav { display: none; }
          .menu-btn { display: flex; }
        }

        .mobile-drawer::-webkit-scrollbar { width: 4px; }
        .mobile-drawer::-webkit-scrollbar-track { background: #f1f1f1; }
        .mobile-drawer::-webkit-scrollbar-thumb { background: #0d6efd; border-radius: 4px; }
      `}</style>
    </>
  );
}

export default Encabezado;