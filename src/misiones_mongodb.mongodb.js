// ============================================
// MISIÓN MONGODB - BESTIARIO DIGITAL
// Autor: [Tu Nombre Completo]
// Fecha: Octubre 2025
// ============================================

// PASO 1: Seleccionar la base de datos
use("bestiario");

console.log(" Iniciando Misión: Bestiario Digital\n");

// ============================================
// PASO 2: CREAR LA COLECCIÓN
// ============================================

console.log(" Creando colección 'criaturas'...");

db.createCollection("criaturas", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["nombre", "habitat", "nivel_peligro"],
      properties: {
        nombre: {
          bsonType: "string",
          description: "Nombre de la criatura - REQUERIDO",
        },
        habitat: {
          bsonType: "string",
          description: "Hábitat donde vive - REQUERIDO",
        },
        nivel_peligro: {
          bsonType: "int",
          minimum: 1,
          maximum: 10,
          description: "Peligrosidad del 1 al 10 - REQUERIDO",
        },
        dieta: {
          bsonType: "array",
          description: "Lista de alimentos",
        },
        habilidades: {
          bsonType: "array",
          description: "Lista de habilidades",
        },
      },
    },
  },
});

console.log(" Colección creada exitosamente\n");

// ============================================
// PASO 3: INSERCIÓN (CREATE)
// ============================================

console.log(" FASE 1: Insertando criaturas en el bestiario\n");

// Inserción individual #1
console.log(" Insertando: Dragón de Fuego...");
db.criaturas.insertOne({
  nombre: "Dragón de Fuego",
  habitat: "Montañas Volcánicas",
  nivel_peligro: 10,
  dieta: ["rocas volcánicas", "caballeros", "ganado"],
  habilidades: ["vuelo", "aliento de fuego", "garras afiladas"],
  descubierto_por: "Eldrin el Valiente",
  estadisticas: {
    ataque: 95,
    defensa: 80,
    velocidad: 60,
  },
});
console.log(" Dragón insertado\n");

// Inserción individual #2
console.log(" Insertando: Fénix Resplandeciente...");
db.criaturas.insertOne({
  nombre: "Fénix Resplandeciente",
  habitat: "Desierto de Cristal",
  nivel_peligro: 8,
  dieta: ["esencias mágicas", "luz solar"],
  habilidades: ["regeneración", "vuelo", "fuego sagrado", "resurrección"],
  descubierto_por: "Aria la Sabia",
  estadisticas: {
    ataque: 70,
    defensa: 85,
    velocidad: 95,
    magia: 100,
  },
  debilidad: "agua bendita",
});
console.log(" Fénix insertado\n");

// Inserción múltiple
console.log(" Insertando 3 criaturas en lote...");
db.criaturas.insertMany([
  {
    nombre: "Unicornio Plateado",
    habitat: "Bosque Encantado",
    nivel_peligro: 3,
    dieta: ["hierba mágica", "flores luminosas", "rocío lunar"],
    habilidades: ["curación", "purificación", "velocidad"],
    descubierto_por: "Luna Brightwood",
    estadisticas: {
      ataque: 30,
      defensa: 40,
      velocidad: 85,
      magia: 90,
    },
    temperamento: "pacífico",
  },
  {
    nombre: "Hidra de Pantano",
    habitat: "Pantano Tóxico",
    nivel_peligro: 9,
    dieta: ["peces gigantes", "aventureros", "bestias"],
    habilidades: ["regeneración de cabezas", "veneno", "mordida múltiple"],
    descubierto_por: "Tharn el Audaz",
    cantidad_cabezas: 7,
    estadisticas: {
      ataque: 88,
      defensa: 75,
      velocidad: 40,
    },
  },
  {
    nombre: "Grifo Dorado",
    habitat: "Picos Celestiales",
    nivel_peligro: 7,
    dieta: ["ovejas", "cabras montesas"],
    habilidades: ["vuelo", "garras de acero", "vista aguda"],
    descubierto_por: "Kaelen Skyward",
    estadisticas: {
      ataque: 75,
      defensa: 70,
      velocidad: 80,
    },
    guardian_de: "Templo del Sol",
  },
]);
console.log("3 criaturas insertadas: Unicornio, Hidra, Grifo\n");

// ============================================
// PASO 4: LECTURA (READ)
// ============================================

console.log("🔹 FASE 2: Consultando el bestiario\n");

// Consulta 1: Todas las criaturas
console.log(" Consulta 1: Mostrando TODAS las criaturas");
console.log("Comando: db.criaturas.find()\n");
db.criaturas.find().forEach((criatura) => {
  console.log(`   ${criatura.nombre}`);
  console.log(`     Hábitat: ${criatura.habitat}`);
  console.log(`     Peligro: ${criatura.nivel_peligro}/10`);
  console.log("");
});

// Consulta 2: Por hábitat específico
console.log("\n Consulta 2: Criaturas del Bosque Encantado");
console.log("Comando: db.criaturas.find({ habitat: 'Bosque Encantado' })\n");
const bosque = db.criaturas.find({ habitat: "Bosque Encantado" });
bosque.forEach((criatura) => {
  console.log(
    `  ✨ ${criatura.nombre} - Nivel de peligro: ${criatura.nivel_peligro}/10`
  );
});

// Consulta 3: Criaturas muy peligrosas
console.log("\n Consulta 3: Criaturas con nivel de peligro MAYOR a 8");
console.log("Comando: db.criaturas.find({ nivel_peligro: { $gt: 8 } })\n");
const peligrosas = db.criaturas.find({ nivel_peligro: { $gt: 8 } });
peligrosas.forEach((criatura) => {
  console.log(
    `   ${criatura.nombre} - Nivel ${criatura.nivel_peligro}/10 - ¡EXTREMADAMENTE PELIGROSO!`
  );
});

// Consulta BONUS
console.log("\nBONUS: Criaturas que pueden volar");
console.log("Comando: db.criaturas.find({ habilidades: 'vuelo' })\n");
const voladoras = db.criaturas.find({ habilidades: "vuelo" });
voladoras.forEach((criatura) => {
  console.log(`  ${criatura.nombre} - Puede volar`);
});

// ============================================
// PASO 5: ACTUALIZACIÓN (UPDATE)
// ============================================

console.log("\n FASE 3: Actualizando criaturas\n");

// Actualización 1: Añadir habilidad
console.log("Actualización 1: El Unicornio aprendió 'teleportación'");
console.log(
  "Comando: db.criaturas.updateOne({ nombre: ... }, { $push: { habilidades: ... } })\n"
);

const update1 = db.criaturas.updateOne(
  { nombre: "Unicornio Plateado" },
  { $push: { habilidades: "teleportación" } }
);

console.log(`Documentos modificados: ${update1.modifiedCount}`);

// Verificar la actualización
console.log(" Verificando nuevas habilidades del Unicornio:");
const unicornio = db.criaturas.findOne({ nombre: "Unicornio Plateado" });
console.log(`   Habilidades: ${unicornio.habilidades.join(", ")}\n`);

// Actualización 2: Incrementar peligro por hábitat
console.log(" Actualización 2: ¡Evento mágico en las Montañas Volcánicas!");
console.log("Todas las criaturas de ese hábitat aumentan su nivel de peligro");
console.log(
  "Comando: db.criaturas.updateMany({ habitat: ... }, { $inc: { nivel_peligro: 1 } })\n"
);

const update2 = db.criaturas.updateMany(
  { habitat: "Montañas Volcánicas" },
  { $inc: { nivel_peligro: 1 } }
);

console.log(` Documentos modificados: ${update2.modifiedCount}`);

// Verificar
const dragon = db.criaturas.findOne({ nombre: "Dragón de Fuego" });
console.log(` Nuevo nivel del Dragón: ${dragon.nivel_peligro}/10\n`);

// ============================================
// PASO 6: CONSULTAS AVANZADAS
// ============================================

console.log(" FASE 4: Consultas avanzadas\n");

// Proyección
console.log(" Listado simple (solo nombre y nivel):");
console.log(
  "Comando: db.criaturas.find({}, { nombre: 1, nivel_peligro: 1, _id: 0 })\n"
);
db.criaturas.find({}, { nombre: 1, nivel_peligro: 1, _id: 0 }).forEach((c) => {
  console.log(`  • ${c.nombre}: ${c.nivel_peligro}/10`);
});

// Ordenamiento
console.log("\n Top 3 criaturas MÁS PELIGROSAS:");
console.log(
  "Comando: db.criaturas.find().sort({ nivel_peligro: -1 }).limit(3)\n"
);
db.criaturas
  .find()
  .sort({ nivel_peligro: -1 })
  .limit(3)
  .forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.nombre} - Nivel ${c.nivel_peligro}/10`);
  });

// Conteo
const total = db.criaturas.countDocuments();
console.log(`\n Total de criaturas catalogadas: ${total}`);

// ============================================
// RESUMEN FINAL
// ============================================

console.log("\n" + "=".repeat(60));
console.log("✨ ¡MISIÓN COMPLETADA CON ÉXITO! ✨");
console.log("=".repeat(60));
console.log(`\n Estadísticas finales:`);
console.log(`   • Criaturas en el bestiario: ${total}`);
console.log(`   • Operaciones de inserción: 5 criaturas`);
console.log(`   • Operaciones de consulta: 6 queries diferentes`);
console.log(`   • Operaciones de actualización: 2 updates`);
console.log("\n El Bestiario Digital está listo para ser explorado\n");
console.log("=".repeat(60));
