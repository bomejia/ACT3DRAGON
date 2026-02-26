const tipos = ["a", "r", "v"]

window.onload = async () => {
    const res = await fetch("/dragon")
    const dragon = await res.json()

    if (dragon.tipo) {
        mostrarJuego(dragon)
    }
}

function comenzar() {
    const nombre = document.getElementById("nombre").value
    if (!nombre) return alert("Ponle nombre a tu dragon")

    const tipo = tipos[Math.floor(Math.random() * 3)]

    fetch("/dragon/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, tipo })
    })
    .then(res => res.json())
    .then(dragon => mostrarJuego(dragon))
}

function obtenerImagen(tipo, estado) {
    if (estado === "huevo") return "imagenes/huevo.png"
    if (estado === "agrietado") return `imagenes/${tipo}_huevoroto.png`
    if (estado === "bebe") return `imagenes/${tipo}_dragonbebe.png`
    if (estado === "adolescente") return `imagenes/${tipo}_dragonadolescente.png`
    if (estado === "legendario") return `imagenes/${tipo}_dragonlegendario.png`
}

function mostrarJuego(dragon) {
    document.getElementById("inicio").classList.add("oculto")
    document.getElementById("juego").classList.remove("oculto")

    actualizarDragon(dragon)
    cargarTareas()
}

function actualizarDragon(dragon) {

    document.getElementById("titulo").innerText =
        dragon.nombre.toUpperCase()

    document.getElementById("nivel").innerText = dragon.nivel
    document.getElementById("xp").innerText = dragon.xp

    document.getElementById("imagen").src =
        obtenerImagen(dragon.tipo, dragon.estado)

    actualizarBarra(dragon.xp)
}

function actualizarBarra(xp) {

    // máximo XP = 800 (legendario en tu server)
    const porcentaje = Math.min((xp / 800) * 100, 100)

    document.getElementById("progreso").style.width =
        porcentaje + "%"
}

async function cargarTareas() {

    const res = await fetch("/tareas")
    const tareas = await res.json()

    const lista = document.getElementById("lista")
    lista.innerHTML = ""

    tareas.forEach(t => {

        const li = document.createElement("li")

        li.innerHTML = `
            ${t.descripcion}
            <button onclick="completar(${t.id})">
                COMPLETAR
            </button>
        `

        lista.appendChild(li)
    })
}

async function completar(id) {

    const res = await fetch("/tareas/" + id, {
        method: "PUT"
    })

    const data = await res.json()

    if (data.dragon) {

        actualizarDragon(data.dragon)

        document.getElementById("mensaje").innerText =
            "✨ GANASTE XP ✨"

        setTimeout(() => {
            document.getElementById("mensaje").innerText = ""
        }, 1500)
    }
}

async function reiniciarTodo() {

    await fetch("/dragon/reset", {
        method: "DELETE"
    })

    location.reload()
}