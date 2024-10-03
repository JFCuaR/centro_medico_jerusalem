import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import miImagen from './logo.jpg';
import './Home.css';
import AuthContext from './AuthContext';  // Importar AuthContext para manejar el logout

function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);  // Extraer la función logout del contexto
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();  // Llamar la función logout
    navigate('/login');  // Redirigir al login después de cerrar sesión
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Sidebar Template</title>
      <link
        href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <div className={`d-flex ${isSidebarOpen ? 'toggled' : ''}`} id="wrapper">
        {/* Sidebar */}
        <div className="bg-dark border-right" id="sidebar-wrapper">
          <div className="sidebar-heading text-white"><br /><br />CENTRO MEDICO</div>
          <div className="sidebar-heading text-white">JERUSALEM <br /><br /></div>
          <div className="list-group list-group-flush">
            <Link to="/HomeFarmacia" className="list-group-item list-group-item-action bg-dark text-white">
              Inicio
             </Link>
            <Link to="/ventas2" className="list-group-item list-group-item-action bg-dark text-white">
              Farmacia
            </Link>
          
          
          </div>
         
        </div>
        {/* /#sidebar-wrapper */}
        
        {/* Page Content */}
        <div id="page-content-wrapper">
          <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <button className="btn btn-primary" id="menu-toggle" onClick={toggleSidebar}>
              Menu
            </button>
            <button className="btn btn-danger ml-auto" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </nav>
          <div className="container-fluid">
            <div className="image-container">
              <img src={miImagen} alt="logo" />
            </div>
          </div>
        </div>
        {/* /#page-content-wrapper */}
      </div>
    </div>
  );
}

export default Home;
