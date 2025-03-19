const { connectDB } = require("../../config/db");

let pool;

// Función para inicializar la conexión
async function initDB() {
  if (!pool) {
    pool = await connectDB(); // Espera la conexión
  }
}

const getClientByCedula = async (cedula) => {
  await initDB(); // Asegurar que `pool` está inicializado antes de usarlo
  try {
    const result = await pool
      .request()
      .input("cedula", cedula)
      .query(
        `SELECT c.cli_cedula AS cedula,
                  CONCAT(COALESCE(c.cli_nombres, ''), ' ', COALESCE(c.cli_apellidos, '')) AS nombre_completo,
                  CONCAT(COALESCE(o.ord_ins_coordenadas_x, ''), ', ', COALESCE(o.ord_ins_coordenadas_y, '')) AS coordenadas,
                  o.ord_ins_ip_equipo_final AS ip,
                  o.ord_ins_direccion AS direccion,
                  o.ord_ins_referencia_direccion AS referencia,
                  o.ord_ins_id AS orden_instalacion,
                  o.ord_ins_fecha_instalacion AS fecha_instalacion,
                  o.ord_ins_telefonos AS telefonos,
                  CASE 
                    WHEN e.est_pag_fac_int_nombre = 'CANCELADO' THEN 'PAGADO'
                    ELSE e.est_pag_fac_int_nombre
                  END AS estado,
                  CONCAT(COALESCE(emp.emp_nombres, ''), ' ', COALESCE(emp.emp_apellidos, '')) AS instalado_por,
                  pi.pla_int_nombre AS plan_nombre,
                  pi.pla_int_precio AS precio
            FROM t_Clientes c
            JOIN t_Ordenes_Instalaciones o ON c.cli_cedula = o.cli_cedula
            JOIN t_Sucursales s ON o.suc_id = s.suc_id
            JOIN t_Pagos_Mensual_Internet p ON o.ord_ins_id = p.ord_ins_id
            JOIN t_Estado_Pago_Factura_Internet e ON p.est_pag_fac_int = e.est_pag_fac_int_id
            JOIN t_Empleados emp ON o.emp_id = emp.emp_id
            JOIN t_Planes_Internet pi ON o.pla_int_id = pi.pla_int_id
            WHERE o.est_ser_int_id <> 10
              AND s.suc_nombre = 'LATACUNGA'
              AND c.cli_cedula = @cedula
                 AND p.ani_mes_id = 86
            ORDER BY nombre_completo;`
      );

    const rows = result.recordset;

    // Estructurar la respuesta agrupando por cédula y nombre
    const groupedData = rows.reduce((acc, row) => {
      const {
        cedula,
        nombre_completo,
        coordenadas,
        ip,
        direccion,
        referencia,
        orden_instalacion,
        fecha_instalacion,
        estado,
        instalado_por,
        plan_nombre,
        telefonos,
        precio,
      } = row;

      // Buscar si ya existe el cliente en el acumulador
      let cliente = acc.find((c) => c.cedula === cedula);

      if (!cliente) {
        // Si no existe, se agrega con un array de servicios
        cliente = { cedula, nombre_completo, servicios: [] };
        acc.push(cliente);
      }

      // Agregar el servicio (incluyendo estado, instalado_por y el plan) al array del cliente
      cliente.servicios.push({
        coordenadas,
        ip,
        direccion,
        referencia,
        orden_instalacion,
        fecha_instalacion,
        estado,
        instalado_por,
        plan_nombre,
        telefonos,
        precio,
      });

      return acc;
    }, []);

    return groupedData;
  } catch (error) {
    console.error("❌ Error al buscar cliente en SQL Server:", error.message);
    throw error;
  }
};

module.exports = { getClientByCedula };
