import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const URL = process.env.REACT_APP_URL_BACKEND || 'http://localhost:3001'

function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Para buscar por nombre
  const [dpiSearchTerm, setDpiSearchTerm] = useState(''); // Para buscar por DPI
  const [selectedPaciente, setSelectedPaciente] = useState(null); // Paciente seleccionado para mostrar detalles
  const [showModal, setShowModal] = useState(false); // Controlar la ventana emergente

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Función para obtener los pacientes según el término de búsqueda
  const fetchPacientes = async () => {
    try {
      const response = await axios.get(`${URL}/buscar_pacientes`, {
        params: {
          nombre: searchTerm,
          dpi: dpiSearchTerm,
        },
      });
      setPacientes(response.data);
    } catch (error) {
      console.error('Error al obtener los pacientes:', error);
    }
  };

  useEffect(() => {
    // Hacer una búsqueda inicial cuando se carga el componente
    fetchPacientes();
  }, []);

  const handleSearch = () => {
    fetchPacientes();
  };

  // Función para mostrar el modal con los detalles del paciente seleccionado
  const handleVisualizar = (paciente) => {
    setSelectedPaciente(paciente);
    setShowModal(true);
  };

  // Función para cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPaciente(null); // Limpiar el paciente seleccionado al cerrar el modal
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Historial de Pacientes</title>
      <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet" />
      <div className={`d-flex ${isSidebarOpen ? 'toggled' : ''}`} id="wrapper">
        {/* Sidebar */}
        <div className="bg-dark border-right" id="sidebar-wrapper">
          <div className="sidebar-heading text-white"><br /><br />CENTRO MEDICO</div>
          <div className="sidebar-heading text-white"> JERUSALEM <br /><br /></div>
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
            <Link to="/Devoluciones" className="list-group-item list-group-item-action bg-dark text-white">
              Devoluciones
            </Link>
            <Link to="/Historial" className="list-group-item list-group-item-action bg-dark text-white">
              Historial Medico
            </Link>
            <Link to="/Buscar_paciente" className="list-group-item list-group-item-action bg-dark text-white">
              Buscar paciente
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
          </nav>
          <div className="container-fluid">
            <h2>Pacientes</h2>

            {/* Filas para las barras de búsqueda */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <input
                  type="text"
                  placeholder="Buscar por DPI..."
                  value={dpiSearchTerm}
                  onChange={(e) => setDpiSearchTerm(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <button className="btn btn-primary mb-3" onClick={handleSearch}>
              Buscar
            </button>

            {/* Tabla responsive */}
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre del Paciente</th>
                    <th>DPI</th>
                    <th>Fecha de Consulta</th>
                    <th>Diagnóstico</th>
                    <th>Medicamentos Recetados</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientes.map((paciente) => (
                    <tr key={paciente.id}>
                      <td>{paciente.id}</td>
                      <td>{paciente.nombre_paciente}</td>
                      <td>{paciente.dpi}</td>
                      <td>{paciente.fecha_consulta}</td>
                      <td>{paciente.diagnostico}</td>
                      <td>
                        <ul>
                          {paciente.medicamentos_recetados.map((medicamento, index) => (
                            <li key={index}>{medicamento}</li>
                          ))}
                        </ul>
                      </td>
                      <td>
                        <button className="btn btn-info" onClick={() => handleVisualizar(paciente)}>
                          Visualizar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal para mostrar los detalles del paciente */}
            {showModal && selectedPaciente && (
              <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title">Detalles del Paciente</h5>
                      <button type="button" className="close" onClick={handleCloseModal}>
                        &times;
                      </button>
                    </div>
                    <div className="modal-body">
                      <p><strong>Nombre del Paciente:</strong> {selectedPaciente.nombre_paciente}</p>
                      <p><strong>DPI:</strong> {selectedPaciente.dpi}</p>
                      <p><strong>Fecha de Consulta:</strong> {new Date(selectedPaciente.fecha_consulta).toLocaleDateString()}</p>
                      <p><strong>Diagnóstico:</strong> {selectedPaciente.diagnostico}</p>
                      <p><strong>Medicamentos Recetados:</strong></p>
                      <ul>
                        {selectedPaciente.medicamentos_recetados.map((medicamento, index) => (
                          <li key={index}>{medicamento}</li>
                        ))}
                      </ul>
                      {/* Mostrar otros detalles como antecedentes si están disponibles */}
                      <p><strong>Antecedentes Médicos:</strong> {selectedPaciente.antecedentes_medico}</p>
                      <p><strong>Antecedentes Quirúrgicos:</strong> {selectedPaciente.antecedentes_quirurgico}</p>
                      <p><strong>Antecedentes Alérgicos:</strong> {selectedPaciente.antecedentes_alergico}</p>
                      <p><strong>Antecedentes Traumáticos:</strong> {selectedPaciente.antecedentes_traumaticos}</p>
                      <p><strong>Antecedentes Familiares:</strong> {selectedPaciente.antecedentes_familiares}</p>
                      <p><strong>Vicios y Manías:</strong> {selectedPaciente.antecedentes_vicios_y_manias}</p>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
        {/* /#page-content-wrapper */}
      </div>
    </div>
  );
}

export default Home;
