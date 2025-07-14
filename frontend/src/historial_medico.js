import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from './AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import logo from './logo.jpg';
import Sidebar from './sidebar'; // ← Importar 
import Navbar from './Navbar';
import './Home.css';

const URL = process.env.REACT_APP_URL_BACKEND || 'http://localhost:3001'

function Home() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.nombre) {
      setHistorialMedico(prev => ({
        ...prev,
        medico_responsable: user.nombre
      }));
    }
  }, [user]);


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
      { nombre: ''}
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

  const formatearFecha = (fecha) => {
    if (!fecha) return null;
    return fecha.slice(0, 10);
  };


  const handleNombreChange = async (e) => {
    const value = e.target.value;
    setHistorialMedico({ ...historialMedico, nombre_paciente: value });

    if (value.length >= 3) {
      try {
        const { data } = await axios.get(`${URL}/buscar_pacientes`, {
          params: { nombre: value }
        });

        // Filtrar sugerencias por nombre único
        const nombresUnicos = new Set();
        const pacientesFiltrados = data.filter(paciente => {
          if (!nombresUnicos.has(paciente.nombre_paciente)) {
            nombresUnicos.add(paciente.nombre_paciente);
            return true;
          }
          return false;
        });

        setSugerencias(pacientesFiltrados);
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
      telefono: paciente.telefono || '',
      fecha_nacimiento: paciente.fecha_nacimiento ? paciente.fecha_nacimiento.slice(0, 10) : '',
      

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
    } else {
      setHistorialMedico({ ...historialMedico, [name]: value });
    }
    
  };

  const handleAddMedicamento = () => {
    setHistorialMedico((prevState) => ({
      ...prevState,
      medicamentos_recetados: [
        ...prevState.medicamentos_recetados,
        { nombre: ''}
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
          `${index + 1}. ${medicamento.nombre}`,
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
        <Sidebar isOpen={isSidebarOpen} />
        {isSidebarOpen && (
          <div className="overlay" onClick={() => setSidebarOpen(false)}></div>
        )}
        <div id="page-content-wrapper">
          <Navbar toggleSidebar={toggleSidebar} />

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
                        readOnly
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
  <div key={index} className="form-group">
    <input
      type="text"
      className="form-control"
      name={`medicamento_${index}`}
      value={medicamento.nombre}
      placeholder={`Medicamento ${index + 1}`}
      onChange={handleHistorialChange}
    />
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
                    Enviar
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
