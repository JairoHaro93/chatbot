const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const {
  handleClientQuery,
} = require("../controllers/chatBot/clientController");

const flowSoporte = addKeyword(EVENTS.ACTION).addAnswer(
  "📌 Por favor, indícame el número de cédula del cliente sin guiones seguido de tu primer nombre y apellido. Ejemplo: `1001234567`",
  { capture: true },
  async (ctx, { flowDynamic }) => {
    console.log(`📩 Cédula recibida: ${ctx.body}`);

    // Llamar al controlador para procesar la consulta en SQL Server
    await handleClientQuery(ctx.body, flowDynamic);
  }
);

module.exports = flowSoporte;
