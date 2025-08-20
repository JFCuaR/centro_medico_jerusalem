import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './sidebar';
import Navbar from './Navbar';
import './Home.css';

const URL = process.env.REACT_APP_URL_BACKEND || 'http://localhost:3001'

function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // Para buscar por nombre
  const [dpiSearchTerm, setDpiSearchTerm] = useState(''); // Para buscar por DPI
  const [selectedPaciente, setSelectedPaciente] = useState(null); // Paciente seleccionado para mostrar detalles
  const [showModal, setShowModal] = useState(false); // Controlar la ventana emergente
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [medicamentosEdit, setMedicamentosEdit] = useState([]);



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

  const handleActualizar = (paciente) => {
    setSelectedPaciente(paciente);
    setMedicamentosEdit(
      paciente.medicamentos_recetados
        ? paciente.medicamentos_recetados
            .join('|')
            .split('|')
            .map((m) => m.trim())
        : ['']
    );
    setShowUpdateModal(true);
  };
  

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedPaciente(null);
  };


  const handleGuardarActualizacion = async () => {
    try {
      const updatedPaciente = {
        ...selectedPaciente,
        medicamentos_recetados: medicamentosEdit
          .filter((m) => m.trim() !== '')
          .join('|'),
      };
  
      await axios.put(`${URL}/actualizar_paciente/${selectedPaciente.id}`, updatedPaciente);
      alert('Paciente actualizado correctamente');
      handleCloseUpdateModal();
      fetchPacientes();
    } catch (error) {
      console.error('Error al actualizar el paciente:', error);
      alert('Error al actualizar el paciente');
    }
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
        <Sidebar isOpen={isSidebarOpen} />
        {/* /#sidebar-wrapper */}

        {isSidebarOpen && (
          <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Page Content */}
        <div id="page-content-wrapper">
          <Navbar toggleSidebar={toggleSidebar} />

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
            <div className="card shadow">
              <div className="card-header bg-secondary text-white">
                <h5 className="mb-0">👥 Pacientes Registrados</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-hover mb-0">
                    <thead className="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Nombre del Paciente</th>
                        <th>DPI</th>
                        <th>Fecha de Consulta</th>
                        <th>Diagnóstico</th>
                        <th>Teléfono</th>
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
                          <td>
                            {paciente.fecha_consulta
                              ? paciente.fecha_consulta.slice(0, 10).split('-').reverse().join('/')
                              : 'No disponible'}
                          </td>
                          <td>{paciente.diagnostico}</td>
                          <td>{paciente.telefono}</td>
                          <td>
                            <ul className="mb-0">
                              {paciente.medicamentos_recetados
                                .join('|')
                                .split('|')
                                .map((medicamento, index) => (
                                  <li key={index}>{medicamento.trim()}</li>
                                ))}
                            </ul>
                          </td>
                          <td>
                            <button
                              className="btn btn-info btn-sm mr-2"
                              onClick={() => handleVisualizar(paciente)}
                            >
                              Visualizar
                            </button>
                            <button
                              className="btn btn-warning btn-sm"
                              onClick={() => handleActualizar(paciente)}
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                      {pacientes.length === 0 && (
                        <tr>
                          <td colSpan="8" className="text-center py-3">
                            No hay pacientes registrados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>


            {/* Modal para mostrar los detalles del paciente */}
            {showModal && selectedPaciente && (
              <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h5 className="modal-title">Detalles del Paciente</h5>
                        <button type="button" className="close" onClick={handleCloseModal}>
                          &times;
                        </button>
                      </div>
                      <div className="modal-body">
                        <div className="container">

                          <h5 className="text-center mb-4">Datos Personales</h5>

                          <div className="row">
                            <div className="col-md-6">
                              <p><strong>Nombre:</strong> {selectedPaciente.nombre_paciente}</p>
                              <p><strong>Fecha de Nacimiento:</strong> {selectedPaciente.fecha_nacimiento ? new Date(selectedPaciente.fecha_nacimiento).toLocaleDateString() : 'No registrada'}</p>
                              <p><strong>Sexo:</strong> {selectedPaciente.sexo}</p>
                              <p><strong>Religión:</strong> {selectedPaciente.religion}</p>
                            </div>

                            <div className="col-md-6">
                              <p><strong>DPI:</strong> {selectedPaciente.dpi}</p>
                              <p><strong>Fecha de Consulta:</strong> {new Date(selectedPaciente.fecha_consulta).toLocaleDateString()}</p>
                              <p><strong>Médico Responsable:</strong> {selectedPaciente.medico_responsable}</p>
                              <p><strong>Teléfono:</strong> {selectedPaciente.telefono}</p>
                            </div>
                          </div>

                          <hr />

                          <h5 className="text-center mb-4">Diagnóstico</h5>

                          <div className="row">
                            <div className="col-12">
                              <p><strong>Diagnóstico:</strong> {selectedPaciente.diagnostico}</p>
                            </div>
                          </div>

                          <hr />

                          <h5 className="text-center mb-4">Medicamentos Recetados</h5>

                          <div className="row">
                            <div className="col-12">
                              <ul>
                                {selectedPaciente.medicamentos_recetados.map((medicamento, index) => (
                                  <li key={index}>{medicamento}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <hr />

                          <h5 className="text-center mb-4">Antecedentes Médicos</h5>

                          <div className="row">
                            <div className="col-md-6">
                              <p><strong>Antecedentes Médicos:</strong> {selectedPaciente.antecedentes_medico}</p>
                              <p><strong>Antecedentes Quirúrgicos:</strong> {selectedPaciente.antecedentes_quirurgico}</p>
                              <p><strong>Antecedentes Alérgicos:</strong> {selectedPaciente.antecedentes_alergico}</p>
                            </div>

                            <div className="col-md-6">
                              <p><strong>Antecedentes Traumáticos:</strong> {selectedPaciente.antecedentes_traumaticos}</p>
                              <p><strong>Antecedentes Familiares:</strong> {selectedPaciente.antecedentes_familiares}</p>
                              <p><strong>Vicios y Manías:</strong> {selectedPaciente.antecedentes_vicios_y_manias}</p>
                            </div>
                          </div>

                        </div>


                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                          Cerrar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showUpdateModal && selectedPaciente && (
              <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                  <div className="modal-content">

                    {/* Encabezado del modal */}
                    <div className="modal-header">
                      <h5 className="modal-title">Actualizar Paciente</h5>
                      <button type="button" className="close" onClick={handleCloseUpdateModal}>
                        &times;
                      </button>
                    </div>

                    {/* Cuerpo del modal */}
                    <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          {/* DATOS PERSONALES */}
                          <h5 className="text-center">Datos Personales</h5>
                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <label>Nombre</label>
                              <input type="text" className="form-control" value={selectedPaciente.nombre_paciente || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, nombre_paciente: e.target.value })} />
                            </div>
                            <div className="form-group col-md-6">
                              <label>DPI</label>
                              <input type="text" className="form-control" value={selectedPaciente.dpi || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, dpi: e.target.value })} />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <label>Fecha de Consulta</label>
                              <input type="date" className="form-control" value={selectedPaciente.fecha_consulta ? selectedPaciente.fecha_consulta.slice(0, 10) : ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, fecha_consulta: e.target.value })} />
                            </div>
                            <div className="form-group col-md-6">
                              <label>Fecha de Nacimiento</label>
                              <input type="date" className="form-control" value={selectedPaciente.fecha_nacimiento ? selectedPaciente.fecha_nacimiento.slice(0, 10) : ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, fecha_nacimiento: e.target.value })} />
                            </div>
                          </div>

                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <label>Sexo</label>
                              <input type="text" className="form-control" value={selectedPaciente.sexo || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, sexo: e.target.value })} />
                            </div>
                            <div className="form-group col-md-6">
                              <label>Religión</label>
                              <input type="text" className="form-control" value={selectedPaciente.religion || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, religion: e.target.value })} />
                            </div>
                          </div>

                          <div className="form-group">
                            <label>Teléfono</label>
                            <input type="text" className="form-control" value={selectedPaciente.telefono || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, telefono: e.target.value })} />
                          </div>

                          <div className="form-group">
                            <label>Médico Responsable</label>
                            <input type="text" className="form-control" value={selectedPaciente.medico_responsable || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, medico_responsable: e.target.value })} />
                          </div>

                          {/* DIAGNOSTICO */}
                          <h5 className="text-center mt-4">Diagnóstico</h5>
                          <div className="form-group">
                            <textarea className="form-control" rows="2" value={selectedPaciente.diagnostico || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, diagnostico: e.target.value })}></textarea>
                          </div>

                          {/* MEDICAMENTOS */}
                          <h5 className="text-center mt-4">Medicamentos Recetados</h5>
                          <div className="form-group">
                            {medicamentosEdit.map((med, idx) => (
                              <div key={idx} className="input-group mb-2">
                                <input
                                  type="text"
                                  className="form-control"
                                  value={med}
                                  onChange={(e) => {
                                    const updated = [...medicamentosEdit];
                                    updated[idx] = e.target.value;
                                    setMedicamentosEdit(updated);
                                  }}
                                />
                                <div className="input-group-append">
                                  <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => {
                                      const updated = medicamentosEdit.filter((_, i) => i !== idx);
                                      setMedicamentosEdit(updated);
                                    }}
                                    disabled={medicamentosEdit.length === 1}
                                  >
                                    &times;
                                  </button>
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => setMedicamentosEdit([...medicamentosEdit, ''])}
                            >
                              ➕ Agregar Medicamento
                            </button>
                          </div>


                          {/* ANTECEDENTES */}
                          <h5 className="text-center mt-4">Antecedentes Médicos</h5>
                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <label>Antecedentes Médicos</label>
                              <input type="text" className="form-control" value={selectedPaciente.antecedentes_medico || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, antecedentes_medico: e.target.value })} />
                            </div>
                            <div className="form-group col-md-6">
                              <label>Antecedentes Quirúrgicos</label>
                              <input type="text" className="form-control" value={selectedPaciente.antecedentes_quirurgico || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, antecedentes_quirurgico: e.target.value })} />
                            </div>
                            <div className="form-group col-md-6">
                              <label>Antecedentes Alérgicos</label>
                              <input type="text" className="form-control" value={selectedPaciente.antecedentes_alergico || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, antecedentes_alergico: e.target.value })} />
                            </div>
                            <div className="form-group col-md-6">
                              <label>Antecedentes Traumáticos</label>
                              <input type="text" className="form-control" value={selectedPaciente.antecedentes_traumaticos || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, antecedentes_traumaticos: e.target.value })} />
                            </div>
                            <div className="form-group col-md-6">
                              <label>Antecedentes Familiares</label>
                              <input type="text" className="form-control" value={selectedPaciente.antecedentes_familiares || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, antecedentes_familiares: e.target.value })} />
                            </div>
                            <div className="form-group col-md-6">
                              <label>Vicios y Manías</label>
                              <input type="text" className="form-control" value={selectedPaciente.antecedentes_vicios_y_manias || ''} onChange={(e) => setSelectedPaciente({ ...selectedPaciente, antecedentes_vicios_y_manias: e.target.value })} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pie del modal */}
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={handleCloseUpdateModal}>
                        Cancelar
                      </button>
                      <button type="button" className="btn btn-primary" onClick={handleGuardarActualizacion}>
                        Guardar Cambios
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
