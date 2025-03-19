const { getClientByCedula } = require("../../models/chatbot/clientModel");

const handleClientQuery = async (cedula, nombreCompleto) => {
  try {
    const clientData = await getClientByCedula(cedula);

    if (
      clientData.length > 0 &&
      clientData[0].nombre_completo === nombreCompleto
    ) {
      // Eliminar duplicados de servicios basados en la referencia y orden de instalación
      const uniqueServices = [];
      const seen = new Set();

      clientData[0].servicios.forEach((servicio) => {
        const key = `${servicio.referencia}-${servicio.orden_instalacion}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueServices.push(servicio);
        }
      });

      return { valid: true, servicios: uniqueServices };
    } else {
      return {
        valid: false,
        message:
          "❌ No se encontró un cliente con esos datos. Verifica la información e intenta nuevamente.",
      };
    }
  } catch (error) {
    console.error("❌ Error en la consulta del cliente:", error.message);
    return {
      valid: false,
      message:
        "⚠️ Hubo un error al buscar la información. Inténtalo nuevamente más tarde.",
    };
  }
};

module.exports = { handleClientQuery };
