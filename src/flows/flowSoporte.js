const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { handleClientQuery } = require("../controllers/clientController");

const flowSoporte = addKeyword(EVENTS.ACTION).addAnswer(
  "📌 Por favor, indícame el número de cédula del cliente sin guiones seguido de tu primer nombre y apellido. Ejemplo: `1001234567 Juan Pérez`",
  { capture: true },
  async (ctx, { flowDynamic }) => {
    globalCtx = ctx.body;
    console.log(`📩 Cédula recibida: ${globalCtx}`);

    // Llamar al controlador para procesar la consulta en SQL Server
    await handleClientQuery(globalCtx, global.sqlServerConnection, flowDynamic);
  }
);

module.exports = flowSoporte;
