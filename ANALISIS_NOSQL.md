# Análisis NoSQL — Bestiario Digital

Estudiante: Carlos Calapucha
Materia: Modelado
Fecha: 21/10/2025

## 1) NoSQL vs SQL — ¿Por qué MongoDB para el Bestiario?

En SQL todas las filas deben compartir el mismo esquema. En un bestiario las criaturas no son homogéneas: una Hidra tiene `cantidad_cabezas`, un Fénix tiene `debilidad`, un Unicornio `temperamento`, y un Dragón no requiere ninguno de esos campos. En SQL eso obliga a columnas innecesarias que quedan en NULL.

**Ejemplo SQL (estructura rígida):**

```sql
CREATE TABLE criaturas (
  id INT PRIMARY KEY,
  nombre VARCHAR(100),
  nivel_peligro INT,
  cantidad_cabezas INT,   -- NULL en casi todas
  debilidad VARCHAR(50),  -- NULL en casi todas
  temperamento VARCHAR(50)
);
```

En MongoDB cada criatura es un documento independiente con solo los campos que necesita.

**Ejemplo MongoDB (estructura flexible):**

```js
{
  nombre: "Hidra de Pantano",
  nivel_peligro: 9,
  cantidad_cabezas: 7,
  dieta: ["anfibios", "carroña"],
  estadisticas: { ataque: 80, defensa: 90 }
}
```

Además, MongoDB permite nativamente arrays y objetos anidados sin tablas extra ni JOINs. En SQL, para guardar `habilidades` o `dieta` serían necesarias tablas adicionales y consultas con JOIN para reconstruir un solo ser.

**Conclusión del punto**: Para un dominio con estructura variable, MongoDB reduce complejidad (sin JOINs, sin columnas vacías) y modela con mayor naturalidad que SQL.

---

## 2) Otros tipos de bases NoSQL

**Clave‑Valor (Redis, DynamoDB)**
Usadas cuando la búsqueda es siempre por clave exacta y la velocidad es crítica (sesiones web, caché, contadores). No sirven bien para consultas complejas, pero son extremadamente rápidas.

**Columnar (Cassandra, BigTable)**
Optimizada para lecturas masivas por columna y grandes volúmenes de tiempo real (IoT, métricas industriales, logs). Ideal para cálculos agregados en streaming, no para documentos heterogéneos.

**Grafos (Neo4j, Neptune)**
Especializada en consultas sobre relaciones profundas (redes sociales, fraude, recomendación). Ineficiente usar MongoDB para este tipo de navegación de nodos y aristas.

---

## 3) Caso real — Electronic Arts (EA)

EA usa MongoDB para perfiles de jugadores en franquicias como FIFA, Battlefield y The Sims. Cada juego requiere estructuras distintas (estadísticas, inventario, progresión) sin afectar el resto. Con SQL se requerirían múltiples tablas por juego y JOINs complejos; con MongoDB cada perfil es un documento único y actualizable en tiempo real.

Resultados reportados: reducción significativa de latencia de lectura, eliminación de ALTER TABLE entre lanzamientos y simplificación del modelo.

---

## Conclusión general

MongoDB es idóneo cuando:

- Los datos tienen estructura variable
- Se requieren arrays y objetos anidados sin relaciones externas
- El esquema evoluciona con el tiempo

No es la única solución: Redis, Cassandra y Neo4j superan a MongoDB cuando el problema corresponde a su modelo nativo. No existe "la mejor base" de forma absoluta — solo la más adecuada al problema.
