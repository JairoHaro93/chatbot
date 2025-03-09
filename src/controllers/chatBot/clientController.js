const { getClientByCedula } = require("../../models/chatbot/clientModel");

const handleClientQuery = async (cedula, flowDynamic) => {
  try {
    const clientData = await getClientByCedula(cedula);

    if (clientData.length > 0) {
      await flowDynamic(
        `✅ Cliente encontrado: ${clientData[0].nombre_completo}`
      );
    } else {
      await flowDynamic("❌ No se encontró un cliente con esa cédula.");
    }
  } catch (error) {
    console.error("❌ Error en la consulta del cliente:", error.message);
    await flowDynamic(
      "⚠️ Hubo un error al buscar la información. Inténtalo nuevamente más tarde."
    );
  }
};

module.exports = { handleClientQuery };
