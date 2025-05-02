// src/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // O usa un nuevo archivo de estilos si quieres

const Sidebar = ({ isOpen }) => {
  return (
    <div className={`bg-dark border-right ${isOpen ? 'toggled' : ''}`} id="sidebar-wrapper">
      <div className="sidebar-heading text-white"><br /><br />CENTRO MEDICO</div>
      <div className="sidebar-heading text-white">JERUSALEM <br /><br /></div>
      <div className="list-group list-group-flush">
        <Link to="/Home" className="list-group-item list-group-item-action bg-dark text-white">Inicio</Link>
        <Link to="/AgregarUsuario" className="list-group-item list-group-item-action bg-dark text-white">Agregar Usuario</Link>
        <Link to="/Agregar_productos" className="list-group-item list-group-item-action bg-dark text-white">Agregar Medicamentos</Link>
        <Link to="/ventas" className="list-group-item list-group-item-action bg-dark text-white">Farmacia</Link>
        <Link to="/Devoluciones" className="list-group-item list-group-item-action bg-dark text-white">Devoluciones</Link>
        <Link to="/Historial" className="list-group-item list-group-item-action bg-dark text-white">Historial Medico</Link>
        <Link to="/Buscar_paciente" className="list-group-item list-group-item-action bg-dark text-white">Buscar paciente</Link>
        <Link to="/Reportes" className="list-group-item list-group-item-action bg-dark text-white">Reportes</Link>
      </div>
    </div>
  );
};

export default Sidebar;
