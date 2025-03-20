const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const {
  handleClientQuery,
} = require("../controllers/chatBot/clientController");

const normalizeText = (text) => {
  return text
    .normalize("NFD") // Descompone caracteres acentuados
    .replace(/[̀-ͯ]/g, "") // Elimina los diacríticos (tildes)
    .toUpperCase(); // Convierte a mayúsculas
};

const flowSoporte = addKeyword(EVENTS.ACTION)
  .addAnswer(
    "🤖 Por favor, indícame el número de cédula del cliente sin guiones seguido de su nombre completo. Ejemplo:\n `1001234567 JUAN ALFONSO PEREZ GARCIA`",
    { capture: true },
    async (ctx, { flowDynamic, fallBack, state, endFlow }) => {
      console.log(`📩 Datos recibidos: ${ctx.body}`);

      const [cedula, ...nombreArray] = ctx.body.split(" ");
      const nombreCompleto = normalizeText(nombreArray.join(" "));

      if (!cedula || !nombreCompleto) {
        return endFlow({
          body: "⚠️ Formato incorrecto. Por favor, envía tu cédula y nombre completo correctamente.",
        });
      }

      const response = await handleClientQuery(cedula, nombreCompleto);

      if (response.valid) {
        const options = response.servicios
          .map(
            (servicio, index) =>
              `${index + 1}. ${servicio.referencia || "Sin referencia"}`
          )
          .join("\n");

        await state.update({
          cedula,
          nombreCompleto,
          servicios: response.servicios,
        });

        await flowDynamic(
          `🤖 Cliente validado: ${nombreCompleto} ✅\nPor favor, elige la referencia del servicio sobre el que necesitas soporte:\n${options}`
        );
        return { capture: true };
      } else {
        return endFlow({ body: response.message });
      }
    }
  )
  .addAnswer(
    "🤖 Por favor, selecciona el número del servicio:",
    { capture: true },
    async (ctx, { flowDynamic, fallBack, state, endFlow }) => {
      const selectedIndex = parseInt(ctx.body) - 1;
      const servicios = state.get("servicios");

      if (
        !servicios ||
        selectedIndex < 0 ||
        selectedIndex >= servicios.length
      ) {
        return fallBack("⚠️ Opción no válida, intenta nuevamente.");
      }

      const selectedService = servicios[selectedIndex];
      await state.update({ selectedService });
      console.log(selectedService.estado);

      if (selectedService.estado === "PENDIENTE") {
        await flowDynamic(
          "🚨 Tu servicio ha sido suspendido por falta de pago. Por favor, regulariza tu situación para restablecer el servicio."
        );
        return endFlow(); // Asegura que el flujo se detiene aquí
      }

      return await flowDynamic(
        "🤖 Selecciona el motivo de tu solicitud:\n \n1️⃣ Sin Servicio de Internet\n \n2️⃣ Servicio Intermitente\n \n3️⃣ Cambio de Nombre y/o Contraseña",
        { capture: true }
      );
    }
  )
  .addAnswer(
    "🤖 Indica el número de la opción seleccionada:",
    { capture: true },
    async (ctx, { flowDynamic, state }) => {
      const selectedService = state.get("selectedService");
      let reason;

      switch (ctx.body) {
        case "1":
          reason = "Sin Servicio de Internet";
          await flowDynamic(
            "🔍 Has seleccionado: Sin Servicio de Internet. Nuestro equipo revisará tu caso."
          );
          break;
        case "2":
          reason = "Servicio Intermitente";
          await flowDynamic(
            "📡 Has seleccionado: Servicio Intermitente. Te ayudaremos a solucionarlo."
          );
          break;
        case "3":
          reason = "Cambio de Nombre y/o Contraseña";
          await flowDynamic(
            "🔑 Has seleccionado: Cambio de Nombre y/o Contraseña. Indica los nuevos datos."
          );
          break;
        default:
          return await flowDynamic("⚠️ Opción no válida, intenta nuevamente.");
      }

      await flowDynamic(
        `🤖 Resumen de la solicitud:\n` +
          `✅Cliente: ${state.get("nombreCompleto")}\n` +
          `✅ Servicio: ${selectedService.referencia || "Sin referencia"}\n` +
          `✅ Orden de instalación: ${selectedService.orden_instalacion}\n` +
          `✅ Motivo: ${reason}`
      );
    }
  );

module.exports = flowSoporte;
