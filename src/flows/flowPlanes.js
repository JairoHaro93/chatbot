const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const fs = require("fs");
const path = require("path");

const menuPlanesPath = path.join(__dirname, "../../mensajes", "menuPlanes.txt");
const menuPlanes = fs.readFileSync(menuPlanesPath, "utf8");

const flowPlanes = addKeyword(EVENTS.ACTION)
  .addAnswer("📌 Por favor, indícame qué plan deseas.")
  .addAnswer(
    menuPlanes,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
      if (!["1", "2", "3"].includes(ctx.body)) {
        return fallBack("⚠️ Respuesta Incorrecta, intenta de nuevo.");
      }

      switch (ctx.body) {
        case "1":
          return await flowDynamic("✅ Opción 1 seleccionada.");
        case "2":
          return await flowDynamic("✅ Opción 2 seleccionada.");
        case "3":
          return await flowDynamic("✅ Opción 3 seleccionada.");
      }
    }
  );

module.exports = flowPlanes;
