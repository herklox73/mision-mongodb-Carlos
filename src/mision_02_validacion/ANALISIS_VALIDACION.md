# Análisis de Validación — El Manuscrito del Guardián

**Estudiante:** Carlos Vicente Ñacata Calapucha  
**Materia:** Modelado  
**Institución:** Universidad de las Fuerzas Armadas ESPE

---

## 1. Validación a Nivel de Base de Datos vs Backend

### ¿Por qué JSON Schema en MongoDB es preferible a validar solo en backend?

La validación en la base de datos actúa como una **última línea de defensa** que garantiza la integridad de los datos independientemente de cómo lleguen a MongoDB. Mientras que la validación en el backend es importante, tiene limitaciones críticas:

#### Vulnerabilidades de validar solo en backend:

1. **Múltiples puntos de entrada**: Si la aplicación crece y tiene varios microservicios, APIs o clientes (web, móvil, terceros), cada uno debe implementar las mismas reglas de validación. Un error en cualquiera de ellos compromete la integridad.

2. **Acceso directo a la base de datos**: Administradores, scripts de migración, herramientas de respaldo o desarrolladores que ejecuten comandos directamente en MongoDB pueden insertar datos inválidos accidentalmente si no existe validación en la BD.

3. **Evolución del código**: Durante refactorizaciones o cuando múltiples desarrolladores trabajan en paralelo, es fácil que las validaciones se vuelvan inconsistentes entre versiones o módulos del backend.

4. **Bugs y omisiones**: Un simple error de programación (como olvidar validar un campo en una ruta específica) puede dejar pasar datos corruptos.

#### Ventajas de JSON Schema en MongoDB:

- **Capa de seguridad inmutable**: La validación está en el mismo lugar donde se almacenan los datos, imposible de saltarse.
- **Documentación viva**: El schema define explícitamente qué estructura deben tener los documentos, sirviendo como especificación técnica.
- **Detección temprana de errores**: Los datos inválidos se rechazan antes de persistirse, evitando inconsistencias que serían difíciles de limpiar después.
- **Independencia del lenguaje**: Cualquier aplicación (Node.js, Python, Java) que se conecte a MongoDB respeta las mismas reglas sin duplicar lógica.

### Ejemplo práctico del proyecto:

En nuestro bestiario, si un desarrollador crea una nueva API en Python para importar criaturas masivamente y olvida validar que `habilidades` debe tener mínimo 1 elemento, JSON Schema lo rechazará automáticamente:

```javascript
// Esto falla en MongoDB aunque el backend lo permita:
{
  nombre: "Goblin",
  habilidades: [], // Viola minItems: 1
  // ...
}
```

**Conclusión**: La validación en backend es necesaria para dar feedback temprano al usuario, pero JSON Schema en MongoDB garantiza que **NUNCA** entren datos incorrectos, sin importar el origen.

---

## 2. Relación 1-a-1 Embebida: `ficha_veterinaria`

### ¿Por qué fue un buen enfoque embeber `ficha_veterinaria`?

La decisión de embeber la ficha veterinaria como un sub-documento dentro de cada criatura es óptima por tres razones:

#### 1. **Relación verdaderamente 1-a-1 e inseparable**

Cada criatura tiene exactamente UNA ficha veterinaria y esa ficha no tiene sentido sin la criatura. No existen casos donde:

- Una ficha veterinaria pertenezca a múltiples criaturas (violación de 1-a-1)
- Una ficha veterinaria exista sin criatura asociada (dato huérfano)

#### 2. **Atomicidad de consultas**

En nuestro bestiario, siempre que consultamos una criatura queremos saber su estado de salud:

```javascript
// Una sola query devuelve TODO lo necesario:
db.criaturas.findOne({nombre: "Dragón de Esmeraldas"});
// Resultado:
{
  nombre: "Dragón de Esmeraldas",
  nivel_peligro: 8,
  ficha_veterinaria: {
    salud: "Óptima",
    ultima_revision: ISODate("2025-10-15")
  }
}
```

Si estuviera referenciada, necesitaríamos dos queries o un `$lookup` (JOIN) en cada consulta, degradando el rendimiento.

#### 3. **Tamaño del sub-documento**

La ficha veterinaria solo tiene 2 campos (`salud` y `ultima_revision`). MongoDB tiene un límite de 16MB por documento, y este sub-documento ocupa menos de 1KB, haciendo el embedding totalmente viable.

### ¿Cuándo hubiéramos preferido referenciarla?

La relación debería ser **referenciada** (en su propia colección) si:

1. **La ficha crece significativamente**: Si tuviéramos un historial completo de tratamientos, cirugías, análisis de laboratorio con imágenes, etc., el sub-documento podría alcanzar varios MB, comprometiendo el límite de 16MB del documento padre.

2. **Actualizaciones frecuentes e independientes**: Si veterinarios actualizan la ficha 50 veces al día mientras que la información de la criatura (nombre, hábitat) cambia raramente, cada update en el documento embebido reescribe TODO el documento padre. Con referencia, solo se actualiza el documento de la ficha.

3. **Consultas independientes comunes**: Si necesitáramos generar reportes mensuales de todas las fichas veterinarias sin importar la criatura (ej: "criaturas revisadas en octubre"), una colección separada con índices específicos sería más eficiente.

**Ejemplo de diseño referenciado:**

```javascript
// Colección: fichas_veterinarias
{
  _id: ObjectId("..."),
  id_criatura: ObjectId("..."), // Referencia
  salud: "Óptima",
  ultima_revision: ISODate("2025-10-15"),
  historial_tratamientos: [ /* Array grande */ ],
  analisis_laboratorio: [ /* Documentos pesados */ ]
}
```

**Conclusión**: Para nuestro caso con datos pequeños y consultas siempre conjuntas, embeber es correcto. Si la ficha fuera un sub-sistema complejo, referenciar sería mejor.

---

## 3. Relaciones 1-a-N: Embebida vs Referenciada

En el modelo implementamos dos relaciones 1-a-Muchos con estrategias diferentes:

### Relación 1: Guardián → Inventario (EMBEBIDA)

**Decisión**: El inventario está embebido como array de objetos dentro del documento del guardián:

```javascript
{
  nombre: "Eldrin el Sabio",
  inventario: [
    { nombre_item: "Báculo de Roble", cantidad: 1 },
    { nombre_item: "Pociones de Curación", cantidad: 5 }
  ]
}
```

#### Justificación:

1. **Cardinalidad limitada**: Un guardián típicamente tendrá entre 5-50 ítems en su inventario (no miles). El array no crecerá indefinidamente.

2. **Consultas siempre conjuntas**: Cuando consultamos un guardián, casi siempre queremos ver su inventario completo. Tenerlo embebido significa una sola query sin JOINs.

3. **Actualizaciones atómicas**: Podemos actualizar tanto el nivel del guardián como su inventario en una sola operación transaccional garantizada por MongoDB.

4. **Los ítems no tienen vida propia**: Un ítem como "Pociones de Curación" no es una entidad que exista independientemente del guardián. No buscamos "todos los guardianes que tienen Pociones", sino "qué tiene el guardián X".

#### ¿Cuándo sería incorrecto embeber?

Si el inventario pudiera crecer a miles de ítems (ej: un MMORPG donde los jugadores acumulan 10,000+ objetos), el array excedería los límites prácticos y deberíamos usar referencia:

```javascript
// Colección: inventarios
{
  _id: ObjectId("..."),
  id_guardian: ObjectId("..."),
  nombre_item: "Báculo de Roble",
  cantidad: 1
}
```

---

### Relación 2: Guardián → Criaturas (REFERENCIADA)

**Decisión**: Cada criatura almacena el `ObjectId` de su guardián:

```javascript
// Documento en colección criaturas:
{
  nombre: "Dragón de Esmeraldas",
  id_guardian: ObjectId("671a2b3c4d5e6f7g8h9i0j1k"), // Referencia
  habitat: "Montañas Místicas"
}
```

#### Justificación:

1. **Cardinalidad ilimitada**: Un Guardián Maestro puede ser responsable de cientos o miles de criaturas a lo largo de su carrera. Embeber este array en el documento del guardián violaría el límite de 16MB rápidamente.

2. **Consultas bidireccionales**:

   - Necesitamos buscar "¿quién cuida al Dragón de Esmeraldas?" → Consulta directa en `criaturas`
   - Necesitamos buscar "¿qué criaturas cuida Eldrin?" → `db.criaturas.find({id_guardian: ObjectId("...")})`

   Con embedding solo en el guardián, la segunda query sería imposible sin escanear todos los guardianes.

3. **Criaturas como entidades independientes**: Las criaturas tienen sentido por sí mismas (tienen nombre, habilidades, habitat). Se consultan frecuentemente sin necesidad del guardián (ej: "criaturas legendarias del bosque").

4. **Actualizaciones independientes**: Si una criatura cambia de guardián (reasignación), solo actualizamos un campo en el documento de la criatura. Si estuviera embebida, tendríamos que removerla del array del guardián antiguo y agregarla al nuevo en dos operaciones.

#### ¿Cuándo hubiéramos embebido?

Solo si garantizáramos:

- Máximo 100 criaturas por guardián (límite estricto del negocio)
- NUNCA consultamos criaturas sin su guardián
- Las criaturas no pueden reasignarse a otro guardián

En ese caso hipotético:

```javascript
// Documento guardián con criaturas embebidas:
{
  nombre: "Eldrin el Sabio",
  criaturas: [
    {
      nombre: "Dragón de Esmeraldas",
      nivel_peligro: 8,
      // ... resto de datos
    }
  ]
}
```

Pero este diseño sería frágil y limitante para un bestiario real.

---

## Comparación Final: Decisiones de Modelado

| Relación                               | Estrategia       | Razón Clave                                                                 |
| -------------------------------------- | ---------------- | --------------------------------------------------------------------------- |
| Criatura → `ficha_veterinaria` (1-a-1) | **Embebida**     | Datos pequeños, inseparables, siempre consultados juntos                    |
| Guardián → `inventario` (1-a-N)        | **Embebida**     | Cardinalidad limitada (~50 ítems), no tienen entidad propia                 |
| Guardián → `criaturas` (1-a-N)         | **Referenciada** | Cardinalidad ilimitada, entidades independientes, consultas bidireccionales |

---

## Conclusión General

El modelado de datos en MongoDB no es binario (embeber vs referenciar), sino que depende de:

1. **Tamaño y crecimiento**: ¿El array podría exceder 16MB o miles de elementos?
2. **Patrones de consulta**: ¿Los datos se consultan juntos o por separado?
3. **Frecuencia de actualización**: ¿Se actualizan como unidad o independientemente?
4. **Naturaleza de la relación**: ¿Los documentos hijos tienen sentido sin el padre?

En nuestro bestiario, cada decisión se tomó evaluando estos criterios, logrando un balance entre rendimiento, escalabilidad y mantenibilidad.

---

**Firma del Cronista:**  
Carlos Vicente Ñacata Calapucha  
_Guardián del Bestiario Digital_
