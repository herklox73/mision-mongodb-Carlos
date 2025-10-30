# Misión MongoDB - Bestiario Digital

## Información del Estudiante

| Campo               | Información                             |
| ------------------- | --------------------------------------- |
| **Nombre Completo** | Carlos Vicente Ñacata Calapucha         |
| **Materia**         | Modelado                                |
| **Institución**     | Universidad de las Fuerzas Armadas ESPE |
| **Fecha**           | Octubre 2025                            |
| **Rol**             | Cronista de Datos                       |

---

## Descripción del Proyecto

Este proyecto implementa un **Bestiario Digital de Criaturas Fantásticas** utilizando **MongoDB**, una base de datos NoSQL orientada a documentos.
El objetivo es aplicar operaciones CRUD, modelar datos con esquemas flexibles y realizar consultas avanzadas.

---

## Estructura del Repositorio

```
mision-mongodb-carlos/
│
├── README.md
├── ANALISIS_NOSQL.md
├── src/
│   └── misiones_mongodb.mongodb.js
├── docker-compose.yml
├── .editorconfig
└── .gitignore
```

---

## El Bestiario Digital

La base de datos `bestiario` contiene una colección llamada `criaturas` con **5 documentos** que representan criaturas como el Dragón de Fuego, Fénix, Unicornio, Hidra y Grifo.
Cada criatura tiene atributos únicos (como habilidades, estadísticas o nivel de peligro) que demuestran la flexibilidad de MongoDB frente a los modelos relacionales.

---

## Instrucciones de Ejecución

### Requisitos previos

- Docker y Docker Compose instalados
- Visual Studio Code con la extensión **MongoDB for VS Code**
- Git instalado

### Pasos

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/mision-mongodb-carlos.git
   cd mision-mongodb-carlos
   ```

2. Levantar el contenedor de MongoDB:

   ```bash
   docker-compose up -d
   ```

3. Conectarse a MongoDB:

   ```
   mongodb://root:root12345@localhost:27017
   ```

4. Ejecutar el script desde el contenedor:

   ```bash
   docker exec -it mongodb-bestiario mongosh -u root -p root12345
   load('/src/misiones_mongodb.mongodb.js')
   ```

5. Verificar los datos:

   ```javascript
   use("bestiario");
   db.criaturas.find().pretty();
   ```

6. Detener el contenedor:

   ```bash
   docker-compose down
   ```

---

## Operaciones Implementadas

- **CREATE:** `insertOne()`, `insertMany()`
- **READ:** `find()`, consultas filtradas, proyecciones, ordenamientos
- **UPDATE:** `updateOne()`, `updateMany()`
- **DELETE:** (opcional) eliminación de documentos

Ejemplo:

```javascript
db.criaturas.find({ nivel_peligro: { $gt: 8 } });
```

---

## Archivos del Proyecto

- **src/misiones_mongodb.mongodb.js:** operaciones CRUD y consultas.
- **ANALISIS_NOSQL.md:** análisis de NoSQL vs SQL y casos de uso.
- **docker-compose.yml:** configuración de contenedor MongoDB.

---

## Convención de Commits

Ejemplos:

```
feat: agrega inserciones iniciales
docs: actualiza README con pasos de ejecución
refactor: mejora consultas y validaciones
chore: configura docker-compose
```

---

## Tecnologías Utilizadas

| Tecnología | Propósito                   |
| ---------- | --------------------------- |
| MongoDB    | Base de datos NoSQL         |
| Docker     | Contenedor de base de datos |
| VS Code    | Editor de código            |
| Git        | Control de versiones        |

---

## Referencias

- [Documentación oficial de MongoDB](https://www.mongodb.com/docs/)
