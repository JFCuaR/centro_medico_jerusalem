import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import HomeFarmacia from './HomeFarmacia';
import AgregarUsuario from './AgregarUsuario';
import Agregar from './Agregar_Productos';
import Historial from './historial_medico';
import Ventas from './ventas';
import Ventas2 from './Ventas2';
import BuscarPa from './Buscar_paciente';
import AgendarCita from './AgendarCita';
import Agendarcita1 from './agendarcita1';
import Agenda from './Agenda';
import Reportes from './reportes';
import Login from './Login';
import PrivateRoute from './PrivateRoute';
import { AuthProvider } from './AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/AgregarUsuario" element={<PrivateRoute><AgregarUsuario /></PrivateRoute>} />
          <Route path="/Home" element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="/HomeFarmacia" element={<PrivateRoute><HomeFarmacia /></PrivateRoute>} />
          <Route path="/Agregar_productos" element={<PrivateRoute><Agregar /></PrivateRoute>} />
          <Route path="/Historial" element={<PrivateRoute><Historial /></PrivateRoute>} />
          <Route path="/ventas" element={<PrivateRoute><Ventas /></PrivateRoute>} />
          <Route path="/ventas2" element={<PrivateRoute><Ventas2 /></PrivateRoute>} />
          <Route path="/Buscar_paciente" element={<PrivateRoute><BuscarPa /></PrivateRoute>} />
          <Route path="/AgendarCita" element={<PrivateRoute><AgendarCita /></PrivateRoute>} />
          <Route path="/Agendarcita1" element={<PrivateRoute><Agendarcita1 /></PrivateRoute>} />
          <Route path="/Agenda" element={<PrivateRoute><Agenda /></PrivateRoute>} />
          <Route path="/Reportes" element={<PrivateRoute><Reportes /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
