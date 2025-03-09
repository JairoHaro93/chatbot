const getClientByCedula = async (cedula, sqlServerConnection) => {
  try {
    if (!sqlServerConnection) throw new Error("No hay conexión con SQL Server");

    const result = await sqlServerConnection
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
            ORDER BY nombre_completo;`
      );

    return result.recordset;
  } catch (error) {
    console.error("❌ Error al buscar cliente en SQL Server:", error.message);
    throw error;
  }
};

module.exports = { getClientByCedula };
