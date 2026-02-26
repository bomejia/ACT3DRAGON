const express = require("express")
const fs = require("fs").promises

const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.static("public"))

/* =========================
   UTILIDADES
========================= */

const leer = async (ruta) => {
    const data = await fs.readFile(ruta, "utf-8")
    return JSON.parse(data)
}

const escribir = async (ruta, data) => {
    await fs.writeFile(ruta, JSON.stringify(data, null, 2))
}

/* =========================
   EVOLUCION DEMO (5 ETAPAS)
========================= */

const evolucionar = (xp) => {
    if (xp >= 800) return { nivel: 5, estado: "legendario" }
    if (xp >= 500) return { nivel: 4, estado: "adolescente" }
    if (xp >= 250) return { nivel: 3, estado: "bebe" }
    if (xp >= 100) return { nivel: 2, estado: "agrietado" }
    return { nivel: 1, estado: "huevo" }
}

/* =========================
   DRAGON
========================= */

app.get("/dragon", async (req, res) => {
    try {
        const dragon = await leer("dragon.json")
        res.json(dragon)
    } catch {
        res.status(500).json({ error: "Error interno" })
    }
})

app.post("/dragon/crear", async (req, res) => {
    try {
        const { nombre, tipo } = req.body

        if (!nombre || !tipo) {
            return res.status(400).json({ error: "Datos incompletos" })
        }

        const dragon = {
            nombre,
            tipo,
            xp: 0,
            nivel: 1,
            estado: "huevo"
        }

        await escribir("dragon.json", dragon)
        res.json(dragon)

    } catch {
        res.status(500).json({ error: "Error interno" })
    }
})

/* =========================
   RESET TOTAL (ARREGLADO)
========================= */

app.delete("/dragon/reset", async (req, res) => {
    try {

        const dragon = {
            nombre: "",
            tipo: "",
            xp: 0,
            nivel: 1,
            estado: "huevo"
        }

        await escribir("dragon.json", dragon)

        // Reiniciar tareas también
        const tareas = await leer("tareas.json")
        tareas.forEach(t => t.completada = false)
        await escribir("tareas.json", tareas)

        res.json({ mensaje: "Todo reiniciado correctamente" })

    } catch {
        res.status(500).json({ error: "Error interno" })
    }
})

/* =========================
   TAREAS (MODO DEMO)
========================= */

app.get("/tareas", async (req, res) => {
    try {
        const tareas = await leer("tareas.json")
        res.json(tareas)
    } catch {
        res.status(500).json({ error: "Error interno" })
    }
})

app.put("/tareas/:id", async (req, res) => {
    try {
        const dragon = await leer("dragon.json")

        // DEMO: cada clic suma 120 XP (más rápido)
        dragon.xp += 120

        const evolucion = evolucionar(dragon.xp)
        dragon.nivel = evolucion.nivel
        dragon.estado = evolucion.estado

        await escribir("dragon.json", dragon)

        res.json({ mensaje: "XP ganada", dragon })

    } catch {
        res.status(500).json({ error: "Error interno" })
    }
})

/* =========================
   ERRORES
========================= */

app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" })
})

app.listen(PORT, () => {
    console.log("Servidor corriendo en puerto " + PORT)
})