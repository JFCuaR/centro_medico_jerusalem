const express = require('express');
const mysql = require('mysql2/promise'); // Usa solo mysql2/promise para promesas
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuración de la conexión a la base de datos usando Promesas
let db;

(async function initializeDB() {
  try {
    db = await mysql.createConnection({
     /* host: 'localhost',
      user: 'root',
      password: '',
      database: 'jerusalem',
      port: 3307,*/
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: {
        ca: fs.readFileSync(process.env.SSL_CERT) // Ruta al archivo de certificado
      }
    });
    console.log('Conectado a la base de datos');
  } catch (err) {
    console.error('Error conectando a la base de datos:', err);
  }
})();

// Ruta para manejar el inicio de sesión
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Intento de login:', username, password);

  if (!username || !password) {
    return res.status(400).json({ msg: 'Por favor ingresa usuario y contraseña' });
  }

  try {
    // Verificamos que la conexión esté disponible
    if (!db) {
      return res.status(500).json({ msg: 'Error de conexión a la base de datos' });
    }

    // Realizamos la consulta SQL para obtener el usuario
    const [results] = await db.query('SELECT * FROM usuarios WHERE usuario = ?', [username]);

    // Verificamos si se encontró el usuario
    if (results.length > 0) {
      const user = results[0]; // Asignamos el resultado a la variable `user`

      // Verificamos el estado del usuario
      if (user.estado !== 'activa') {
        return res.status(403).json({ msg: 'Cuenta desactivada, contacta con el administrador.' });
      }

      // Comparamos la contraseña ingresada con el hash almacenado
      const isMatch = await bcrypt.compare(password, user.contraseña);
      
      console.log('Contraseña ingresada:', password);
      console.log('Hash almacenado:', user.contraseña); // <-- Verificamos el hash almacenado
      console.log('Resultado de la comparación:', isMatch); // <-- Verificamos si la comparación es exitosa

      if (isMatch) {
        const token = jwt.sign({ id: user.id_usuario, rol: user.rol }, 'secreto', { expiresIn: '1h' });
        return res.json({ token, rol: user.rol }); // Retornamos token y rol
      } else {
        return res.status(400).json({ msg: 'Contraseña incorrecta' });
      }
    } else {
      return res.status(400).json({ msg: 'Usuario no encontrado' });
    }
  } catch (err) {
    console.error('Error durante el inicio de sesión:', err);
    return res.status(500).json({ msg: 'Error del servidor' });
  }
});

// Ruta para agregar productos
app.post('/medicamentos', async (req, res) => {
    const {
      codigo_barra,
      nombre,
      descripcion,
      precio_compra,
      precio_venta,
      stock,
      modulo,
      tipo_venta,
      fecha_vencimiento
    } = req.body;
    
    const sql = `
      INSERT INTO medicamentos 
      (codigo_barra, nombre, Descripcion, precio_compra, precio_venta, stock, modulo, tipo_venta, Fecha_vencimiento) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    try {
      await db.query(sql, [
        codigo_barra,
        nombre,
        descripcion,
        precio_compra,
        precio_venta,
        stock,
        modulo,
        tipo_venta,
        fecha_vencimiento
      ]);
      res.status(200).send('Medicamento agregado exitosamente');
    } catch (err) {
      console.error('Error al insertar datos en la base de datos:', err);
      res.status(500).send('Error al insertar datos en la base de datos');
    }
  });
  

// Ruta para agregar pacientes y detalles del cliente
app.post('/pacientes-detalles', async (req, res) => {
  const { paciente, detalleCliente } = req.body;

  const pacienteSql = 'INSERT INTO pacientes (nombre, direccion, telefono, email, fecha_nacimiento, id_cliente) VALUES (?, ?, ?, ?, ?, ?)';
  
  try {
    const [result] = await db.query(pacienteSql, [
      paciente.nombre,
      paciente.direccion,
      paciente.telefono,
      paciente.email,
      paciente.fecha_nacimiento,
      paciente.id_cliente
    ]);

    const id_paciente = result.insertId;

    const detalleSql = 'INSERT INTO detalle_paciente (id_paciente, descripcion, fecha) VALUES (?, ?, ?)';
    await db.query(detalleSql, [id_paciente, detalleCliente.descripcion_tratamiento, detalleCliente.fecha]);

    res.status(200).send('Paciente y detalles guardados exitosamente');
  } catch (err) {
    console.error('Error al insertar el paciente o los detalles:', err);
    res.status(500).send('Error al insertar el paciente o los detalles');
  }
});

// Ruta para obtener los productos
app.get('/vermedicamentos', async (req, res) => {
    try {
      // Ordena los productos por la columna 'stock' en orden ascendente
      const [productos] = await db.query('SELECT * FROM medicamentos ORDER BY stock ASC');
      res.json(productos);
    } catch (err) {
      console.error('Error al obtener los productos:', err);
      res.status(500).json({ message: 'Error al obtener los productos' });
    }
  });
  
  app.get('/buscar_medicamentos', async (req, res) => {
    const { nombre } = req.query;
  
    const sql = `SELECT nombre FROM medicamentos WHERE nombre LIKE ? LIMIT 5`;
    try {
      const [result] = await db.query(sql, [`%${nombre}%`]);
      res.status(200).json(result);
    } catch (err) {
      console.error('Error al buscar medicamentos:', err);
      res.status(500).send('Error al buscar medicamentos');
    }
  });

  /*app.get('/buscar_medicamentos', async (req, res) => {
    const { nombre, codigo_barra } = req.query;
  
    let sql = 'SELECT * FROM medicamentos WHERE 1=1'; // Comienza la consulta
  
    const params = []; // Almacenará los parámetros para la consulta
  
    // Agregar condición de búsqueda por nombre si se proporciona
    if (nombre) {
      sql += ' AND nombre LIKE ?';
      params.push(`%${nombre}%`);
    }
  
    // Agregar condición de búsqueda por código de barras si se proporciona
    if (codigo_barra) {
      sql += ' AND codigo_barra = ?';
      params.push(codigo_barra);
    }
  
    sql += ' LIMIT 5'; // Limitar los resultados a 5
  
    try {
      const [result] = await db.query(sql, params);
      res.status(200).json(result);
    } catch (err) {
      console.error('Error al buscar medicamentos:', err);
      res.status(500).send('Error al buscar medicamentos');
    }
  });*/
  
  
  app.get('/medicamentos/relacionados/:nombre', async (req, res) => {
    const { nombre } = req.params;
  
    const sql = `
      SELECT nombre, descripcion, modulo, tipo_venta
      FROM medicamentos
      WHERE nombre LIKE ?
    `;
  
    try {
      const [results] = await db.query(sql, [`%${nombre}%`]);
      res.json(results);
    } catch (err) {
      console.error('Error al buscar medicamentos relacionados:', err);
      res.status(500).send('Error al buscar medicamentos relacionados');
    }
  });
  
  

 /*app.post('/realizarventa', async (req, res) => {
    const cart = req.body;
  
    try {
      for (let medicamentos of cart) {
        // Reducir el stock del producto en la base de datos
        await db.query('UPDATE medicamentos SET stock = stock - 1 WHERE id_medicamento = ?', [medicamentos.id_medicamento]);
      }
      res.status(200).json({ message: 'Venta realizada con éxito' });
    } catch (err) {
      console.error('Error al realizar la venta:', err);
      res.status(500).json({ message: 'Error al realizar la venta' });
    }
  });*/

  app.post('/realizarventa', async (req, res) => {
    const cart = req.body;
  
    console.log('Datos del carrito recibidos:', cart); // Agrega esta línea para ver los datos del carrito
  
    // Inicia una transacción
    await db.beginTransaction();
  
    try {
      // Insertar la venta en la tabla `ventas`
      const [ventaResult] = await db.query(
        'INSERT INTO ventas (fecha) VALUES (NOW())'
      );
      const idVenta = ventaResult.insertId; // Obtener el id_venta generado
  
      // Agrupar medicamentos por id_medicamento para sumar cantidades
      const groupedMedicamentos = cart.reduce((acc, item) => {
        console.log('Procesando item:', item); // Agrega esta línea para ver los datos del item
  
        if (!acc[item.id_medicamento]) {
          acc[item.id_medicamento] = {
            id_medicamento: item.id_medicamento,
            cantidad: 0,
          };
        }
        acc[item.id_medicamento].cantidad += item.cantidad || 0;
        return acc;
      }, {});
  
      // Insertar detalles de la venta y actualizar stock en la tabla `medicamentos`
      for (let id in groupedMedicamentos) {
        const medicamento = groupedMedicamentos[id];
  
        // Validar que la cantidad sea un número válido
        console.log('Validando cantidad:', medicamento.cantidad); // Agrega esta línea para ver la cantidad
  
        if (isNaN(medicamento.cantidad) || medicamento.cantidad <= 0) {
          throw new Error('Cantidad inválida en el carrito');
        }
  
        // Verificar si el medicamento existe
        const [rows] = await db.query(
          'SELECT * FROM medicamentos WHERE id_medicamento = ?',
          [medicamento.id_medicamento]
        );
  
        if (rows.length === 0) {
          throw new Error(`Medicamento con id ${medicamento.id_medicamento} no encontrado`);
        }
  
        const precioUnitario = rows[0].precio_venta;
  
        // Validar stock
        if (rows[0].stock < medicamento.cantidad) {
          throw new Error(`No hay suficiente stock para el medicamento ${rows[0].nombre}`);
        }
  
        // Actualizar el stock del medicamento
        await db.query(
          'UPDATE medicamentos SET stock = stock - ? WHERE id_medicamento = ?',
          [medicamento.cantidad, medicamento.id_medicamento]
        );
  
        // Insertar detalles de la venta en la tabla `detalles_venta`
        await db.query(
          'INSERT INTO detalles_venta (id_venta, id_medicamento, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [idVenta, medicamento.id_medicamento, medicamento.cantidad, precioUnitario]
        );
      }
  
      // Confirmar la transacción
      await db.commit();
      res.status(200).json({ message: 'Venta realizada con éxito' });
    } catch (err) {
      // Revertir la transacción en caso de error
      await db.rollback();
      console.error('Error al realizar la venta:', err.message);
      res.status(500).json({ message: 'Error al realizar la venta', error: err.message });
    }
  });
  
  
  app.get('/verhistorial', async (req, res) => {
    const query = `SELECT id, nombre_paciente, direccion, fecha_consulta, diagnostico, sintomas, tratamiento, sexo, religion, medico_responsable, medicamentos_recetados, dpi 
                   FROM historial_medico 
                   ORDER BY fecha_consulta DESC`; // Ordenar por fecha de consulta más reciente
  
    try {
      const [results] = await db.query(query);
      const pacientes = results.map((paciente) => ({
        ...paciente,
        medicamentos_recetados: JSON.parse(paciente.medicamentos_recetados) || []
      }));
      res.json(pacientes);
    } catch (err) {
      console.error('Error al obtener los datos:', err);
      res.status(500).send('Error al obtener los datos');
    }
  });
  
  // Endpoint para agregar nuevo historial médico
  app.post('/historial-medico', async (req, res) => {
    const { 
      nombre_paciente, 
      fecha_consulta, 
      diagnostico, 
      sintomas, 
      tratamiento = '', 
      sexo, 
      religion, 
      medico_responsable, 
      medicamentos_recetados, 
      dpi, 
      antecedentes_medico,
      antecedentes_quirurgico,
      antecedentes_alergico,
      antecedentes_traumaticos,
      antecedentes_familiares,
      antecedentes_vicios_y_manias
    } = req.body;

    // Convertir medicamentos_recetados a una cadena con formato adecuado
    const medicamentosFormateados = medicamentos_recetados
      .filter(medicamento => medicamento.nombre && medicamento.modo_administracion && medicamento.cantidad && medicamento.unidad)
      .map(medicamento => {
        // Crear una cadena con espacios entre los campos del medicamento y agregar coma al final solo si es necesario
        const comentario = medicamento.comentario ? ` ${medicamento.comentario}` : '';
        return `${medicamento.nombre} ${medicamento.modo_administracion} ${medicamento.cantidad} ${medicamento.unidad}${comentario}`;
      })
      .join(' | ');  // Separar medicamentos diferentes con ' | ', evitando una coma al final

    try {
      // Insertar en la tabla historial_medico
      const [result] = await db.query(
        `INSERT INTO historial_medico 
        (nombre_paciente, fecha_consulta, diagnostico, sintomas, tratamiento, sexo, religion, medico_responsable, medicamentos_recetados, dpi) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [
          nombre_paciente,
          fecha_consulta,
          diagnostico,
          sintomas,
          tratamiento,
          sexo,
          religion,
          medico_responsable,
          medicamentosFormateados, // Guardar los medicamentos formateados sin comas finales
          dpi,
        ]
      );

      const id_historial = result.insertId;  // Obtener el ID del historial médico recién insertado

      // Insertar en la tabla antecedentes_medicos
      await db.query(
        `INSERT INTO antecedentes_medicos 
        (id_historial, antecedentes_medico, antecedentes_quirurgico, antecedentes_alergico, antecedentes_traumaticos, antecedentes_familiares, antecedentes_vicios_y_manias) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`, 
        [
          id_historial,
          antecedentes_medico,
          antecedentes_quirurgico,
          antecedentes_alergico,
          antecedentes_traumaticos,
          antecedentes_familiares,
          antecedentes_vicios_y_manias,
        ]
      );

      res.status(201).send('Historial médico y antecedentes guardados exitosamente');

    } catch (err) {
      console.error('Error al guardar el historial médico y antecedentes:', err);
      res.status(500).send('Error al guardar el historial médico y antecedentes');
    }
});


app.post('/agregar_usuario', async (req, res) => {
  const { nombre, usuario, contrasena, rol, estado } = req.body;

  try {
    // Generar un salt y luego encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const query = `
      INSERT INTO usuarios (nombre, usuario, contraseña, rol, estado)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.query(query, [nombre, usuario, hashedPassword, rol, estado]);

    res.status(201).send('Usuario agregado exitosamente');
  } catch (error) {
    console.error('Error al agregar usuario:', error);
    res.status(500).send('Error al agregar usuario');
  }
});


  
  

  // Ruta para obtener todos los pacientes y permitir búsqueda por nombre o DPI
// Ruta para obtener todos los pacientes y permitir búsqueda por nombre o DPI
// Ruta para obtener todos los pacientes y permitir búsqueda por nombre o DPI
app.get('/buscar_pacientes', async (req, res) => {
  const { nombre, dpi } = req.query;

  // Construimos la consulta SQL con condicionales y un JOIN para antecedentes
  let sql = `SELECT h.id, h.nombre_paciente, h.fecha_consulta, h.diagnostico, h.sintomas, h.tratamiento, h.sexo, h.religion, h.medico_responsable, h.medicamentos_recetados, h.dpi, 
             a.antecedentes_medico, a.antecedentes_quirurgico, a.antecedentes_alergico, a.antecedentes_traumaticos, a.antecedentes_familiares, a.antecedentes_vicios_y_manias
             FROM historial_medico h
             LEFT JOIN antecedentes_medicos a ON h.id = a.id_historial
             WHERE 1=1`;

  const params = [];

  // Si se proporciona el nombre, añadimos la condición
  if (nombre) {
    sql += ' AND h.nombre_paciente LIKE ?';
    params.push(`%${nombre}%`);
  }

  // Si se proporciona el DPI, añadimos la condición
  if (dpi) {
    sql += ' AND h.dpi LIKE ?';
    params.push(`%${dpi}%`);
  }

  // Ordenar por la fecha de consulta más reciente
  sql += ' ORDER BY h.fecha_consulta DESC';

  try {
    const [result] = await db.query(sql, params);

    // Parsear medicamentos si están en formato cadena separada por comas
    const pacientes = result.map((paciente) => ({
      ...paciente,
      medicamentos_recetados: typeof paciente.medicamentos_recetados === 'string'
        ? paciente.medicamentos_recetados.split(',') // Si es una cadena, la dividimos por comas
        : [], // Si no hay medicamentos o el formato es incorrecto, devolvemos un array vacío
      antecedentes_medico: paciente.antecedentes_medico || '',
      antecedentes_quirurgico: paciente.antecedentes_quirurgico || '',
      antecedentes_alergico: paciente.antecedentes_alergico || '',
      antecedentes_traumaticos: paciente.antecedentes_traumaticos || '',
      antecedentes_familiares: paciente.antecedentes_familiares || '',
      antecedentes_vicios_y_manias: paciente.antecedentes_vicios_y_manias || ''
    }));

    res.status(200).json(pacientes);
  } catch (err) {
    console.error('Error al buscar pacientes:', err);
    res.status(500).json({ message: 'Error al buscar pacientes' });
  }
});








// Ruta para obtener los pacientes
// Ruta para obtener los pacientes con sus detalles de tratamiento
app.get('/verpacientes', async (req, res) => {
    const sql = `
      SELECT p.id_paciente, p.nombre, p.direccion, p.telefono, p.email, p.fecha_nacimiento, p.id_cliente, 
             d.id_detalle_paciente, d.descripcion, d.tratamiento, d.fecha
      FROM pacientes p
      LEFT JOIN detalle_paciente d ON p.id_paciente = d.id_paciente
    `;
  
    try {
      const [pacientes] = await db.query(sql);
      res.json(pacientes);
    } catch (err) {
      console.error('Error al obtener los pacientes y sus detalles:', err);
      res.status(500).json({ message: 'Error al obtener los pacientes y sus detalles' });
    }
  });

  // Ruta para obtener los pacientes con sus detalles de tratamiento
app.get('/verpacientes', async (req, res) => {
    const sql = `
      SELECT p.id_paciente, p.nombre, p.direccion, p.telefono, p.email, p.fecha_nacimiento, p.id_cliente, 
             d.id_detalle_paciente, d.descripcion, d.tratamiento, d.fecha
      FROM pacientes p
      LEFT JOIN detalle_paciente d ON p.id_paciente = d.id_paciente
    `;
  
    try {
      const [pacientes] = await db.query(sql);
      res.json(pacientes);
    } catch (err) {
      console.error('Error al obtener los pacientes y sus detalles:', err);
      res.status(500).json({ message: 'Error al obtener los pacientes y sus detalles' });
    }
  });
  
  // Ruta para obtener un paciente por ID
app.get('/pacientes/:id', async (req, res) => {
    const { id } = req.params;
    const sql = `
      SELECT p.id_paciente, p.nombre, p.direccion, p.telefono, p.email, p.fecha_nacimiento, p.id_cliente, 
             d.id_detalle_paciente, d.descripcion, d.tratamiento, d.fecha
      FROM pacientes p
      LEFT JOIN detalle_paciente d ON p.id_paciente = d.id_paciente
      WHERE p.id_paciente = ?
    `;
  
    try {
      const [result] = await db.query(sql, [id]);
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).json({ message: 'Paciente no encontrado' });
      }
    } catch (err) {
      console.error('Error al obtener el paciente:', err);
      res.status(500).json({ message: 'Error al obtener el paciente' });
    }
  });

  app.get('/sales/:date', async (req, res) => {
    const selectedDate = req.params.date;
  
    const query = `
      SELECT dv.id_medicamento, SUM(dv.cantidad) AS total_cantidad, 
             m.precio_compra, m.precio_venta, 
             SUM(dv.cantidad * dv.precio_unitario) AS total_ventas
      FROM detalles_venta dv
      JOIN medicamentos m ON dv.id_medicamento = m.id_medicamento
      JOIN ventas v ON dv.id_venta = v.id_venta
      WHERE DATE(v.fecha) = ?
      GROUP BY dv.id_medicamento
    `;
  
    try {
      const [results] = await db.query(query, [selectedDate]);
  
      let totalSales = 0;
      let totalCost = 0;
  
      // Nos aseguramos de que los resultados se sumen correctamente como números
      results.forEach(item => {
        totalSales += parseFloat(item.total_ventas) || 0;
        totalCost += parseFloat(item.total_cantidad) * parseFloat(item.precio_compra) || 0;
      });
  
      res.json({
        totalSales: totalSales.toFixed(2),  // Redondeamos a 2 decimales
        totalCost: totalCost.toFixed(2),
        profit: (totalSales - totalCost).toFixed(2)
      });
    } catch (err) {
      console.error('Error al obtener el reporte diario:', err);
      res.status(500).json({ error: 'Error al obtener el reporte diario' });
    }
  });
  

  // Ruta para obtener datos de ventas y detalles de ventas
// server.js
app.get('/sales/week/:date', async (req, res) => {
  const selectedDate = req.params.date;

  const query = `
    SELECT dv.id_medicamento, SUM(dv.cantidad) AS total_cantidad, 
           m.precio_compra, m.precio_venta, 
           SUM(dv.cantidad * dv.precio_unitario) AS total_ventas
    FROM detalles_venta dv
    JOIN medicamentos m ON dv.id_medicamento = m.id_medicamento
    JOIN ventas v ON dv.id_venta = v.id_venta
    WHERE WEEK(v.fecha) = WEEK(?)
    GROUP BY dv.id_medicamento
  `;

  try {
    const [results] = await db.query(query, [selectedDate]);

    let totalSales = 0;
    let totalCost = 0;

    results.forEach(item => {
      totalSales += parseFloat(item.total_ventas) || 0;  // Nos aseguramos de sumar los valores como números
      totalCost += parseFloat(item.total_cantidad) * parseFloat(item.precio_compra) || 0;
    });

    res.json({
      totalSales: totalSales.toFixed(2),  // Aseguramos que los valores tengan 2 decimales
      totalCost: totalCost.toFixed(2),
      profit: (totalSales - totalCost).toFixed(2)
    });
  } catch (err) {
    console.error('Error al obtener el reporte semanal:', err);
    res.status(500).json({ error: 'Error al obtener el reporte semanal' });
  }
});



app.get('/sales/month/:date', async (req, res) => {
  const selectedDate = req.params.date;

  const query = `
    SELECT dv.id_medicamento, SUM(dv.cantidad) AS total_cantidad, 
           m.precio_compra, m.precio_venta, 
           SUM(dv.cantidad * dv.precio_unitario) AS total_ventas
    FROM detalles_venta dv
    JOIN medicamentos m ON dv.id_medicamento = m.id_medicamento
    JOIN ventas v ON dv.id_venta = v.id_venta
    WHERE MONTH(v.fecha) = MONTH(?)
    GROUP BY dv.id_medicamento
  `;

  try {
    const [results] = await db.query(query, [selectedDate]);

    let totalSales = 0;
    let totalCost = 0;

    // Asegurarnos de que las sumas se hagan correctamente como números
    results.forEach(item => {
      totalSales += parseFloat(item.total_ventas);  // Usamos parseFloat para asegurarnos de que sean números
      totalCost += parseFloat(item.total_cantidad) * parseFloat(item.precio_compra);
    });

    res.json({
      totalSales: totalSales.toFixed(2),  // Aseguramos que los valores sean correctos y limitamos a 2 decimales
      totalCost: totalCost.toFixed(2),
      profit: (totalSales - totalCost).toFixed(2)
    });
  } catch (err) {
    console.error('Error al obtener el reporte mensual:', err);
    res.status(500).json({ error: 'Error al obtener el reporte mensual' });
  }
});



  app.listen(3001, () => {
    console.log('Servidor corriendo en el puerto 3001');
  });
  