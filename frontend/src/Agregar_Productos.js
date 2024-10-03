import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from './AuthContext';
import './AgregarProduc.css';

const URL = process.env.REACT_APP_URL_BACKEND || 'http://localhost:3001'

function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [codigo_barra, setCodigoBarra] = useState('');
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio_compra, setPrecioCompra] = useState('');
  const [precio_venta, setPrecioVenta] = useState('');
  const [stock, setStock] = useState('');
  const [modulo, setModulo] = useState('');
  const [tipo_venta, setTipoVenta] = useState('');
  const [fecha_vencimiento, setFechaVencimiento] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [relatedMedicamentos, setRelatedMedicamentos] = useState([]);
  const { logout } = useContext(AuthContext);  // Extraer la función logout del contexto
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();  // Llamar la función logout
    navigate('/login');  // Redirigir al login después de cerrar sesión
  };

  // Buscar sugerencias cuando el nombre tiene más de 2 caracteres
  useEffect(() => {
    if (nombre.length > 2) {
      const fetchSuggestions = async () => {
        try {
          const response = await axios.get(`${URL}/buscar_medicamentos`, {
            params: { nombre }
          });
          setSuggestions(response.data);
        } catch (error) {
          console.error('Error al buscar medicamentos:', error);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [nombre]);

  // Buscar medicamentos relacionados cuando se selecciona o ingresa un nombre
  const fetchRelatedMedicamentos = async (nombre) => {
    try {
      const response = await axios.get(`${URL}/medicamentos/relacionados/${nombre}`);
      setRelatedMedicamentos(response.data);
    } catch (error) {
      console.error('Error al buscar medicamentos relacionados:', error);
    }
  };

  const handleSelectRelatedMedicamento = (medicamento) => {
    // Completar los campos con los datos del medicamento seleccionado
    setNombre(medicamento.nombre);
    setDescripcion(medicamento.descripcion);
    setModulo(medicamento.modulo);
    setTipoVenta(medicamento.tipo_venta);
    setRelatedMedicamentos([]); // Limpiar los medicamentos relacionados después de la selección
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${URL}/medicamentos`, {
        codigo_barra,
        nombre,
        descripcion,
        precio_compra,
        precio_venta,
        stock,
        modulo,
        tipo_venta,
        fecha_vencimiento,
      });
      alert('Medicamento agregado exitosamente');
    } catch (error) {
      console.error('Hubo un error al agregar el medicamento:', error);
      alert('Hubo un error al agregar el medicamento');
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
        <div className="bg-dark border-right" id="sidebar-wrapper">
          <div className="sidebar-heading text-white"><br /><br />CENTRO MEDICO</div>
          <div className="sidebar-heading text-white">JERUSALEM <br /><br /></div>
          <div className="list-group list-group-flush">
          <Link to="/Home" className="list-group-item list-group-item-action bg-dark text-white">
              Inicio
             </Link>
             <Link to="/AgregarUsuario" className="list-group-item list-group-item-action bg-dark text-white">
              Agregar Usuario
             </Link>
            <Link to="/Agregar_productos" className="list-group-item list-group-item-action bg-dark text-white">
              Agregar Medicamentos
            </Link>
            <Link to="/ventas" className="list-group-item list-group-item-action bg-dark text-white">
              Farmacia
            </Link>
            <Link to="/Historial" className="list-group-item list-group-item-action bg-dark text-white">
              Historial Medico
            </Link>
            <Link to="/Buscar_paciente" className="list-group-item list-group-item-action bg-dark text-white">
              Buscar paciente
            </Link>
          </div>
          <div className="sidebar-heading text-white mt-4">CITAS</div>
          <div className="list-group list-group-flush">
            <Link to="/AgendarCita" className="list-group-item list-group-item-action bg-dark text-white">
              Agendar Cita
            </Link>
            <Link to="/Agenda" className="list-group-item list-group-item-action bg-dark text-white">
              Ver Citas
            </Link>
            <Link to="/Reportes" className="list-group-item list-group-item-action bg-dark text-white">
              Reportes
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
            <h2>Agregar Medicamento</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Código de Barra:</label>
                <input
                  type="text"
                  className="form-control"
                  value={codigo_barra}
                  onChange={(e) => setCodigoBarra(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nombre:</label>
                <input
                  type="text"
                  className="form-control"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (e.target.value.length > 2) {
                      fetchRelatedMedicamentos(e.target.value);
                    }
                  }}
                  required
                />
                {/* Mostrar medicamentos relacionados */}
                {relatedMedicamentos.length > 0 && (
                  <div>
                    <h5>Medicamentos relacionados:</h5>
                    <ul>
                      {relatedMedicamentos.map((medicamento, index) => (
                        <li key={index} onClick={() => handleSelectRelatedMedicamento(medicamento)}>
                          {medicamento.nombre}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Descripción:</label>
                <input
                  type="text"
                  className="form-control"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Precio de Compra:</label>
                <input
                  type="number"
                  className="form-control"
                  value={precio_compra}
                  onChange={(e) => setPrecioCompra(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Precio de Venta:</label>
                <input
                  type="number"
                  className="form-control"
                  value={precio_venta}
                  onChange={(e) => setPrecioVenta(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Stock:</label>
                <input
                  type="number"
                  className="form-control"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Módulo:</label>
                <input
                  type="text"
                  className="form-control"
                  value={modulo}
                  onChange={(e) => setModulo(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo de Venta:</label>
                <input
                  type="text"
                  className="form-control"
                  value={tipo_venta}
                  onChange={(e) => setTipoVenta(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha de Vencimiento:</label>
                <input
                  type="date"
                  className="form-control"
                  value={fecha_vencimiento}
                  onChange={(e) => setFechaVencimiento(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-success">Agregar Medicamento</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
