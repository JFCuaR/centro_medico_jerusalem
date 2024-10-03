import React, { useState } from 'react';

function AgendarCita() {
  const [formData, setFormData] = useState({
    nombre: '',
    DPI: '',
    fecha: '',
    hora: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí puedes agregar la lógica para guardar la cita en la base de datos
    console.log(formData);
    alert('Cita agendada con éxito');
  };

  return (
    <div className="container mt-4">
      <h2>Agendar Cita Médica</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre del Paciente</label>
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
          <label>No. DPI</label>
          <input
            type="number"
            className="form-control"
            name="DPI"
            value={formData.DPI}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Fecha</label>
          <input
            type="date"
            className="form-control"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Hora</label>
          <input
            type="time"
            className="form-control"
            name="hora"
            value={formData.hora}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Agendar Cita</button>
      </form>
    </div>
  );
}

export default AgendarCita;
