import React, { useState, useContext} from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext'; 
import Sidebar from './sidebar'; // ← Importar 
import Navbar from './Navbar'; 

const URL = process.env.REACT_APP_URL_BACKEND || 'http://localhost:3001'

function AgregarUsuario() {

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useContext(AuthContext);  // Extraer la función logout del contexto


  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();  // Llamar la función logout
    navigate('/login');  // Redirigir al login después de cerrar sesión
  };

  const [formData, setFormData] = useState({
    nombre: '',
    usuario: '',
    contrasena: '',
    rol: 'empleado', // Valor por defecto
    estado: 'activa' // Valor por defecto
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${URL}/agregar_usuario`, formData);
      alert('Usuario agregado exitosamente');
      navigate('/'); // Redirigir después de agregar el usuario
    } catch (error) {
      console.error('Error al agregar el usuario', error);
      alert('Hubo un error al agregar el usuario');
    }
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
        <Sidebar isOpen={isSidebarOpen} />
        {/* /#sidebar-wrapper */}
        
        {/* Page Content */}
        <div id="page-content-wrapper">
        <Navbar toggleSidebar={toggleSidebar} />

          <div className="container mt-5">
      <h2>Agregar Nuevo Usuario</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            className="form-control"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Usuario:</label>
          <input
            type="text"
            className="form-control"
            name="usuario"
            value={formData.usuario}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            className="form-control"
            name="contrasena"
            value={formData.contrasena}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Rol:</label>
          <select
            className="form-control"
            name="rol"
            value={formData.rol}
            onChange={handleChange}
            required
          >
            <option value="admin">Admin</option>
            <option value="empleado">Empleado</option>
          </select>
        </div>
        <div className="form-group">
          <label>Estado:</label>
          <select
            className="form-control"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
          >
            <option value="activa">Activa</option>
            <option value="desactivada">Desactivada</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Agregar Usuario
        </button>
      </form>
    </div>
        </div>
        {/* /#page-content-wrapper */}
      </div>
    </div>
  );
}

export default AgregarUsuario;
