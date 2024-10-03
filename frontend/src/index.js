import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';  // Asegúrate de que la ruta es correcta

ReactDOM.render(
  <React.StrictMode>
    <App />  {/* Renderiza solo App */}
  </React.StrictMode>,
  document.getElementById('root')
);
