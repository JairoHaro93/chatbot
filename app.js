const express = require("express");
const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const { delay } = require("@whiskeysockets/baileys");
const path = require("path");
const fs = require("fs");
const { poolmysql, connectDB } = require("./db");
const { handleClientQuery } = require("./src/controllers/clientController");

const app = express();
app.use(express.json());

let sqlServerConnection;

// Cargar el menú desde un archivo
const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf8");
const menuPlanesPath = path.join(__dirname, "mensajes", "menuPlanes.txt");
const menuPlanes = fs.readFileSync(menuPlanesPath, "utf8");

// ✅ Verificar conexión a MySQL
async function testDbConnection() {
  try {
    await poolmysql.query("SELECT 1");
    console.log("✅ BASE DE DATOS MYSQL CONECTADA DESDE app.js !!!");
  } catch (error) {
    console.error("❌ ERROR AL CONECTAR MYSQL DESDE app.js:", error.message);
  }
}

// ✅ Verificar conexión a SQL Server
async function testSqlServerConnection() {
  try {
    sqlServerConnection = await connectDB();
    console.log("✅ BASE DE DATOS SQL SERVER CONECTADA DESDE app.js !!!");
  } catch (error) {
    console.error(
      "❌ ERROR AL CONECTAR SQL SERVER DESDE app.js:",
      error.message
    );
  }
}

// Ejecutar pruebas de conexión
testDbConnection();
testSqlServerConnection();

// Definir flujo de soporte
const flowSoporte = addKeyword(EVENTS.ACTION).addAnswer(
  "Por favor indicame el número de cédula del cliente sin guiones seguido de tu primer nombre y apellido EJEMPLO: 1001234567",
  { capture: true },
  async (ctx, { flowDynamic }) => {
    globalCtx = ctx.body;
    console.log(`📩 Cédula recibida: ${globalCtx}`);

    // Llamar al controlador para procesar la consulta en el modelo
    await handleClientQuery(globalCtx, sqlServerConnection, flowDynamic);
  }
);

// Definir flujo de soporte
const flowPlanes = addKeyword(EVENTS.ACTION)
  .addAnswer("Por favor indicame que plan deseas")
  .addAnswer(
    menuPlanes,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
      if (!["1", "2", "3"].includes(ctx.body)) {
        return fallBack("Respuesta Incorrecta, intenta de nuevo");
      }

      switch (ctx.body) {
        case "1":
          return await flowDynamic("Opción 1 seleccionada");
        case "2":
          return await flowDynamic("Opción 2 seleccionada");
        case "3":
          return await flowDynamic("Opción 3 seleccionada");
      }
    }
  );

// Definir flujo principal
const menuFlow = addKeyword(EVENTS.WELCOME)
  .addAnswer(
    "Hola Bienvenido a Redecom, internet Ultratapido, soy RedeBOT, tu asesor virtual, indicame como puedo ayudarte seleccionando una opción en el menú"
  )
  .addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
      if (!["1", "2", "3"].includes(ctx.body)) {
        return fallBack("Respuesta Incorrecta, intenta de nuevo");
      }

      switch (ctx.body) {
        case "1":
          return gotoFlow(flowPlanes);
        case "2":
          return await flowDynamic("Opción 2 seleccionada");
        case "3":
          return gotoFlow(flowSoporte);
      }
    }
  );

// Inicialización del bot
const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([menuFlow, flowSoporte, flowPlanes]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb({ name: "NOMBRE BOT", port: 4000 });
};

main();

// Servidor Express
app.get("/", (req, res) => {
  res.send("Servidor del bot de WhatsApp está en ejecución.");
});

app.get("/status", (req, res) => {
  res.json({
    status: "Bot activo",
    lastMessage: globalCtx || "Ningún mensaje recibido aún",
  });
});

app.listen(3005, () => {
  console.log("Servidor Express corriendo en http://localhost:3005");
});
