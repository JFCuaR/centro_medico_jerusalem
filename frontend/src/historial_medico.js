import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import logo from './logo.jpg';
import './Home.css';

const URL = process.env.REACT_APP_URL_BACKEND || 'http://localhost:3001'

function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [historialMedico, setHistorialMedico] = useState({
    nombre_paciente: '',
    fecha_consulta: '',
    diagnostico: '',
    sintomas: '',
    dpi: '',
    sexo: '',
    religion: '',
    medico_responsable: '',
    medicamentos_recetados: [
      { nombre: '', modo_administracion: '', cantidad: '', unidad: '', comentario: '' }
    ],
    antecedentes_medico: '',
    antecedentes_quirurgico: '',
    antecedentes_alergico: '',
    antecedentes_traumaticos: '',
    antecedentes_familiares: '',
    antecedentes_vicios_y_manias: ''
  });

  const [sugerencias, setSugerencias] = useState([]);
  const [recetaGenerada, setRecetaGenerada] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleNombreChange = async (e) => {
    const value = e.target.value;
    setHistorialMedico({ ...historialMedico, nombre_paciente: value });
    
    // Realizar la búsqueda de pacientes
    if (value.length >= 3) {
      try {
        const { data } = await axios.get(`${URL}/buscar_pacientes`, {
          params: { nombre: value }
        });
        setSugerencias(data); // Actualiza las sugerencias
      } catch (error) {
        console.error('Error al buscar pacientes:', error);
      }
    } else {
      setSugerencias([]);
    }
  };

  const handleSeleccionarSugerencia = async (paciente) => {
    setHistorialMedico({
      ...historialMedico,
      nombre_paciente: paciente.nombre_paciente,
      dpi: paciente.dpi,
      sexo: paciente.sexo,
      religion: paciente.religion,
      antecedentes_medico: paciente.antecedentes_medico,
      antecedentes_quirurgico: paciente.antecedentes_quirurgico,
      antecedentes_alergico: paciente.antecedentes_alergico,
      antecedentes_traumaticos: paciente.antecedentes_traumaticos,
      antecedentes_familiares: paciente.antecedentes_familiares,
      antecedentes_vicios_y_manias: paciente.antecedentes_vicios_y_manias
    });
    setSugerencias([]);
  };

  const handleHistorialChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('medicamento_')) {
      const index = parseInt(name.split('_')[1], 10);
      const nuevosMedicamentos = [...historialMedico.medicamentos_recetados];
      nuevosMedicamentos[index].nombre = value;
      setHistorialMedico({ ...historialMedico, medicamentos_recetados: nuevosMedicamentos });
    } else if (name.startsWith('modo_')) {
      const index = parseInt(name.split('_')[1], 10);
      const nuevosMedicamentos = [...historialMedico.medicamentos_recetados];
      nuevosMedicamentos[index].modo_administracion = value;
      setHistorialMedico({ ...historialMedico, medicamentos_recetados: nuevosMedicamentos });
    } else if (name.startsWith('cantidad_')) {
      const index = parseInt(name.split('_')[1], 10);
      const nuevosMedicamentos = [...historialMedico.medicamentos_recetados];
      nuevosMedicamentos[index].cantidad = value;
      setHistorialMedico({ ...historialMedico, medicamentos_recetados: nuevosMedicamentos });
    } else if (name.startsWith('unidad_')) {
      const index = parseInt(name.split('_')[1], 10);
      const nuevosMedicamentos = [...historialMedico.medicamentos_recetados];
      nuevosMedicamentos[index].unidad = value;
      setHistorialMedico({ ...historialMedico, medicamentos_recetados: nuevosMedicamentos });
    } else if (name.startsWith('comentario_')) {
      const index = parseInt(name.split('_')[1], 10);
      const nuevosMedicamentos = [...historialMedico.medicamentos_recetados];
      nuevosMedicamentos[index].comentario = value;
      setHistorialMedico({ ...historialMedico, medicamentos_recetados: nuevosMedicamentos });
    } else {
      setHistorialMedico({ ...historialMedico, [name]: value });
    }
  };

  const handleAddMedicamento = () => {
    setHistorialMedico((prevState) => ({
      ...prevState,
      medicamentos_recetados: [
        ...prevState.medicamentos_recetados,
        { nombre: '', modo_administracion: '', cantidad: '', unidad: '', comentario: '' }
      ],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dpiSinGuiones = historialMedico.dpi.replace(/-/g, '');

    const medicamentosFiltrados = historialMedico.medicamentos_recetados.filter(
      (medicamento) => medicamento.nombre && typeof medicamento.nombre === 'string' && medicamento.nombre.trim() !== ''
    );

    const datosParaEnviar = {
      ...historialMedico,
      dpi: dpiSinGuiones,
      medicamentos_recetados: medicamentosFiltrados,
    };

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estás a punto de guardar los datos del historial médico.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`${URL}/historial-medico`, datosParaEnviar);

          Swal.fire({
            title: 'Guardado',
            text: 'El historial médico ha sido guardado exitosamente.',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            setRecetaGenerada(true);
          });
        } catch (error) {
          console.error('Hubo un error al agregar el historial médico:', error);
          Swal.fire('Error', 'Hubo un error al guardar el historial médico.', 'error');
        }
      }
    });
  };

  const handleNuevo = () => {
    setHistorialMedico({
      nombre_paciente: '',
      fecha_consulta: '',
      diagnostico: '',
      sintomas: '',
      dpi: '',
      sexo: '',
      religion: '',
      medico_responsable: '',
      telefono: '',  // Agregado
      fecha_nacimiento: '',  
      medicamentos_recetados: [
        { nombre: '', modo_administracion: '', cantidad: '', unidad: '', comentario: '' }
      ],
      antecedentes_medico: '',
      antecedentes_quirurgico: '',
      antecedentes_alergico: '',
      antecedentes_traumaticos: '',
      antecedentes_familiares: '',
      antecedentes_vicios_y_manias: ''
    });
    setRecetaGenerada(false);  // Oculta la receta generada
  };
  
  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    const imgData = logo;

    doc.addImage(imgData, 'JPEG', 15, 10, 50, 20);

    doc.setFontSize(14);
    doc.text('Dr. Oscar Herrera', 80, 25);
    doc.setFontSize(12);
    doc.text('CENTRO MEDICO JERUSALEM', 75, 30);
    doc.text('CONSULTAS • RECIÉN NACIDOS • NIÑOS • ADOLESCENTES • ADULTOS', 50, 35);
    doc.line(15, 40, 195, 40);

    doc.setFontSize(12);
    doc.text(`Nombre del Paciente: ${historialMedico.nombre_paciente}`, 20, 50);
    doc.text(`Fecha de Consulta: ${historialMedico.fecha_consulta}`, 20, 60);

    doc.text('Medicamentos Recetados:', 20, 70);
    let yPosition = 80;

    historialMedico.medicamentos_recetados
      .filter((med) => med.nombre.trim() !== '')
      .forEach((medicamento, index) => {
        doc.text(
          `${index + 1}. ${medicamento.nombre}, ${medicamento.modo_administracion}, ${medicamento.cantidad} ${medicamento.unidad}${medicamento.comentario ? `, ${medicamento.comentario}` : ''}`,
          20,
          yPosition
        );
        yPosition += 10;
      });

    doc.setFontSize(10);
    doc.text(`Médico Responsable: ${historialMedico.medico_responsable}`, 20, yPosition + 10);

    doc.setFontSize(10);
    doc.text('CENTRO MEDICO JERUSALEM', 20, 260);
    doc.text('Camino a aldea lolemi, chocola,', 20, 270);
    doc.text('Aldea Chocola, san pablo jocopilas, suchitepequez', 20, 275);
    doc.text('Tel: 3161 2260', 20, 280);

    doc.save('receta-medica.pdf');
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ingreso de Historial Médico</title>
      <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet" />
      <div className={`d-flex ${isSidebarOpen ? 'toggled' : ''}`} id="wrapper">
        <div className="bg-dark border-right" id="sidebar-wrapper">
          <div className="sidebar-heading text-white">
            <br />
            <br />
            CENTRO MEDICO
          </div>
          <div className="sidebar-heading text-white">
            JERUSALEM
            <br />
            <br />
          </div>
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

        <div id="page-content-wrapper">
          <nav className="navbar navbar-expand-lg navbar-light bg-light border-bottom">
            <button className="btn btn-primary" id="menu-toggle" onClick={toggleSidebar}>
              Menu
            </button>
          </nav>
          <div className="container-fluid">
            <div className="row">
              <div className="col-md-12">
                <h2>Ingreso de Historial Médico</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group col-md-6">
                    <label>Nombre del Paciente:</label>
          <input
            type="text"
            className="form-control"
            name="nombre_paciente"
            value={historialMedico.nombre_paciente}
            onChange={handleNombreChange}
            autoComplete="off"
          />
          {sugerencias.length > 0 && (
            <ul className="suggestions-list">
              {sugerencias.map((sugerencia) => (
                <li
                  key={sugerencia.dpi}
                  onClick={() => handleSeleccionarSugerencia(sugerencia)}
                >
                  {sugerencia.nombre_paciente}
                </li>
              ))}
            </ul>
          )}
                    </div>
                    <div className="form-group col-md-6">
                      <label>Fecha de Consulta:</label>
                      <input
                        type="date"
                        className="form-control"
                        name="fecha_consulta"
                        value={historialMedico.fecha_consulta}
                        onChange={handleHistorialChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label>Diagnóstico:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="diagnostico"
                        value={historialMedico.diagnostico}
                        onChange={handleHistorialChange}
                        required
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <label>Síntomas:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="sintomas"
                        value={historialMedico.sintomas}
                        onChange={handleHistorialChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label>DPI:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="dpi"
                        value={historialMedico.dpi}
                        onChange={handleHistorialChange}
                        maxLength={15}
                        required
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <label>Sexo:</label>
                      <select
                        className="form-control"
                        name="sexo"
                        value={historialMedico.sexo}
                        onChange={handleHistorialChange}
                        required
                      >
                        <option value="">Seleccione</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group col-md-6">
                      <label>Religión:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="religion"
                        value={historialMedico.religion}
                        onChange={handleHistorialChange}
                      />
                    </div>
                    <div className="form-group col-md-6">
                      <label>Médico Responsable:</label>
                      <input
                        type="text"
                        className="form-control"
                        name="medico_responsable"
                        value={historialMedico.medico_responsable}
                        onChange={handleHistorialChange}
                        required
                      />
                    </div>
                    <div className="form-group col-md-6">
    <label>Teléfono:</label>
    <input
      type="text"
      className="form-control"
      name="telefono"
      value={historialMedico.telefono}
      onChange={handleHistorialChange}
      maxLength={15}
      required
    />
  </div>
  <div className="form-group col-md-6">
    <label>Fecha de Nacimiento:</label>
    <input
      type="date"
      className="form-control"
      name="fecha_nacimiento"
      value={historialMedico.fecha_nacimiento}
      onChange={handleHistorialChange}
      required
    />
  </div>
                  </div>

                  <div className="form-group">
                    <label>Medicamentos Recetados:</label>
                    {historialMedico.medicamentos_recetados.map((medicamento, index) => (
                      <div key={index} className="form-row align-items-center mb-2">
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control"
                            name={`medicamento_${index}`}
                            value={medicamento.nombre}
                            placeholder={`Medicamento ${index + 1}`}
                            onChange={handleHistorialChange}
                          />
                        </div>
                        <div className="col-md-2">
                          <select
                            className="form-control"
                            name={`modo_${index}`}
                            value={medicamento.modo_administracion}
                            onChange={handleHistorialChange}
                          >
                            <option value="">Seleccionar</option>
                            <option value="tomar">Tomar</option>
                            <option value="inhalar">Inhalar</option>
                            <option value="inyectar">Inyectar</option>
                            <option value="nebulizar">Nebulizar</option>
                          </select>
                        </div>
                        <div className="col-md-2">
                          <input
                            type="text"
                            step="0.1"
                            className="form-control"
                            name={`cantidad_${index}`}
                            value={medicamento.cantidad}
                            placeholder="Cantidad"
                            onChange={handleHistorialChange}
                          />
                        </div>
                        <div className="col-md-2">
                          <select
                            className="form-control"
                            name={`unidad_${index}`}
                            value={medicamento.unidad}
                            onChange={handleHistorialChange}
                          >
                            <option value="">Unidad</option>
                            <option value="tabletas">Tabletas</option>
                            <option value="gotas">Gotas</option>
                            <option value="cm">Cm</option>
                            <option value="puff">Puff</option>
                            <option value="ampolla">Ampolla</option>
                            <option value="sobre">sobre</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <input
                            type="text"
                            className="form-control"
                            name={`comentario_${index}`}
                            value={medicamento.comentario}
                            placeholder="Dosis"
                            onChange={handleHistorialChange}
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      className="btn btn-primary mt-2"
                      onClick={handleAddMedicamento}
                    >
                      Agregar Más Medicamentos
                    </button>
                  </div>

                  <div className="form-group">
                    <h4>Antecedentes</h4>
                    <div className="form-row">
                      <div className="col-md-4">
                        <label>Antecedentes Médicos:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="antecedentes_medico"
                          value={historialMedico.antecedentes_medico}
                          onChange={handleHistorialChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label>Antecedentes Quirúrgicos:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="antecedentes_quirurgico"
                          value={historialMedico.antecedentes_quirurgico}
                          onChange={handleHistorialChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label>Antecedentes Alérgicos:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="antecedentes_alergico"
                          value={historialMedico.antecedentes_alergico}
                          onChange={handleHistorialChange}
                        />
                      </div>
                    </div>
                    <div className="form-row mt-3">
                      <div className="col-md-4">
                        <label>Antecedentes Traumáticos:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="antecedentes_traumaticos"
                          value={historialMedico.antecedentes_traumaticos}
                          onChange={handleHistorialChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label>Antecedentes Familiares:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="antecedentes_familiares"
                          value={historialMedico.antecedentes_familiares}
                          onChange={handleHistorialChange}
                        />
                      </div>
                      <div className="col-md-4">
                        <label>Vicios y Manías:</label>
                        <input
                          type="text"
                          className="form-control"
                          name="antecedentes_vicios_y_manias"
                          value={historialMedico.antecedentes_vicios_y_manias}
                          onChange={handleHistorialChange}
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary mt-3">
                    Guardar
                  </button>
                  <button type="button" className="btn btn-secondary mt-3 ml-3" onClick={handleNuevo}>
                    Nuevo
                  </button>
                  <button type="button" className="btn btn-secondary mt-3 ml-3" onClick={handleGeneratePDF}>
                    Generar Receta en PDF
                  </button>
                </form>

                {recetaGenerada && (
                  <div className="mt-5">
                    <h3>Receta Médica</h3>
                    <p>
                      <strong>Paciente:</strong> {historialMedico.nombre_paciente}
                    </p>
                    <p>
                      <strong>Diagnóstico:</strong> {historialMedico.diagnostico}
                    </p>
                    <p>
                      <strong>Medicamentos:</strong>
                    </p>
                    <ul>
                      {historialMedico.medicamentos_recetados
                        .filter((med) => med.nombre.trim() !== '')
                        .map((med, index) => (
                          <li key={index}>{med.nombre}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
