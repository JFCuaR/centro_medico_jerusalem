import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import miImagen from './logo.jpg';
import './Home.css';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function Home() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [salesData, setSalesData] = useState(null);
  const [reportType, setReportType] = useState('day');

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleReportTypeChange = (e) => {
    setReportType(e.target.value);
  };

  // Función para convertir la fecha a formato YYYY-MM-DD
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchSalesData = (date) => {
    const formattedDate = formatDate(date);
    let url = `http://localhost:3001/sales/${formattedDate}`;
    if (reportType === 'week') {
      url = `http://localhost:3001/sales/week/${formattedDate}`;
    } else if (reportType === 'month') {
      url = `http://localhost:3001/sales/month/${formattedDate}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((data) => setSalesData(data))
      .catch((error) => console.error('Error al obtener los datos:', error));
  };

  useEffect(() => {
    if (selectedDate) {
      fetchSalesData(selectedDate);
    }
  }, [selectedDate, reportType]);

  // Datos del gráfico de barras
  const chartData = {
    labels: ['Total Ventas', 'Total Costo', 'Ganancia Neta'],
    datasets: [
      {
        label: 'Ventas y Costos',
        data: salesData
          ? [salesData.totalSales, salesData.totalCost, salesData.profit]
          : [0, 0, 0],
        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Sidebar Template</title>
      <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet" />
      <div className={`d-flex ${isSidebarOpen ? 'toggled' : ''}`} id="wrapper">
        {/* Sidebar */}
        <div className="bg-dark border-right" id="sidebar-wrapper">
          <div className="sidebar-heading text-white">
            <br />
            <br />
            CENTRO MEDICO
          </div>
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
          </nav>
          <div className="container-fluid">
            <div className="image-container">
              <img src={miImagen} alt="logo" />
            </div>

            {/* Selector para el tipo de reporte */}
            <div className="mt-4">
              <h4>Selecciona el tipo de reporte</h4>
              <select value={reportType} onChange={handleReportTypeChange} className="form-control">
                <option value="day">Diario</option>
                <option value="week">Semanal</option>
                <option value="month">Mensual</option>
              </select>
            </div>

            {/* Calendario para seleccionar la fecha */}
            <div className="mt-4">
              <h4>Selecciona una fecha para ver las ventas y ganancias</h4>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy/MM/dd"
                className="form-control"
              />
            </div>

            {/* Mostrar los resultados de las ventas */}
            <div className="mt-4">
              {salesData ? (
                <>
                  <h5>Resumen de ventas</h5>
                  <p><strong>Total de ventas:</strong> Q. {salesData.totalSales}</p>
                  <p><strong>Total de costo:</strong> Q. {salesData.totalCost}</p>
                  <p><strong>Ganancia neta:</strong> Q. {salesData.profit}</p>

                  {/* Mostrar gráfico de barras */}
                  <div className="mt-4">
                    <Bar data={chartData} options={chartOptions} />
                  </div>
                </>
              ) : (
                <p>No hay datos de ventas para la fecha seleccionada.</p>
              )}
            </div>
          </div>
        </div>
        {/* /#page-content-wrapper */}
      </div>
    </div>
  );
}

export default Home;
