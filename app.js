const express = require("express");
const {
  createBot,
  createProvider,
  createFlow,
  EVENTS,
  addKeyword,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const { poolmysql, connectDB } = require("./src/config/db");

const flowSoporte = require("./src/flows/flowSoporte");
const flowPlanes = require("./src/flows/flowPlanes");

const app = express();
app.use(express.json());

// ✅ Verificar conexión a MySQL
async function testDbConnection() {
  try {
    await poolmysql.query("SELECT 1");
    console.log("✅ BASE DE DATOS MYSQL CONECTADA DESDE app.js");
  } catch (error) {
    console.error("❌ ERROR AL CONECTAR MYSQL:", error.message);
  }
}

// ✅ Verificar conexión a SQL Server
async function testSqlServerConnection() {
  try {
    global.sqlServerConnection = await connectDB();
    console.log("✅ BASE DE DATOS SQL SERVER CONECTADA DESDE app.js");
  } catch (error) {
    console.error("❌ ERROR AL CONECTAR SQL SERVER:", error.message);
  }
}

// Ejecutar pruebas de conexión
testDbConnection();
testSqlServerConnection();

// 📌 Cargar menú principal desde archivo
const fs = require("fs");
const path = require("path");
const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf8");

// 📌 Definir flujo principal
const menuFlow = addKeyword(EVENTS.WELCOME)
  .addAnswer(
    "Hola Bienvenido a Redecom, internet Ultrarapido. Soy RedeBOT, tu asesor virtual. ¿En qué puedo ayudarte? Selecciona una opción del menú."
  )
  .addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
      if (!["1", "2", "3"].includes(ctx.body)) {
        return fallBack("⚠️ Respuesta Incorrecta, intenta de nuevo.");
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

// 🔹 Inicialización del bot
const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([menuFlow, flowSoporte, flowPlanes]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb({ name: "RedeBOT", port: 4000 });
};

main();

// ✅ Servidor Express
app.get("/", (req, res) => {
  res.send("Servidor del bot de WhatsApp está en ejecución.");
});

app.get("/status", (req, res) => {
  res.json({
    status: "✅ Bot activo",
    lastMessage: globalCtx || "Ningún mensaje recibido aún",
  });
});

app.listen(3005, () => {
  console.log("🚀 Servidor Express corriendo en http://localhost:3005");
});
