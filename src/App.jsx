import { useState } from 'react'
import { usuarioDao as dao } from './db/UsuarioDao'
import { crearUsuario, usuarioVacio } from './db/Usuario'
import './App.css'

function App() {
  const [form, setForm] = useState(usuarioVacio())
  const [usuarios, setUsuarios] = useState([])
  const [verLista, setVerLista] = useState(false)
  const [aviso, setAviso] = useState(null) // { tipo: 'ok' | 'error', texto }

  const editando = form.id !== null

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function mostrarAviso(tipo, texto) {
    setAviso({ tipo, texto })
    setTimeout(() => setAviso(null), 3500)
  }

  // Botón "VER usuarios" -> dao.obtenerTodos()
  async function verUsuarios() {
    try {
      const registros = await dao.obtenerTodos()
      setUsuarios(registros)
      setVerLista(true)
    } catch (error) {
      console.error(error)
      mostrarAviso('error', 'No fue posible leer la base de datos.')
    }
  }

  async function guardar(e) {
    e.preventDefault()
    const usuario = crearUsuario(form)

    const edadValida = Number.isInteger(usuario.edad) && usuario.edad >= 1 && usuario.edad <= 120
    if (!usuario.nombre || !usuario.profesion || !edadValida) {
      mostrarAviso('error', 'Revisa los datos: todos los campos son obligatorios y la edad debe ser de 1 a 120.')
      return
    }

    try {
      if (editando) {
        await dao.actualizar(usuario)
        mostrarAviso('ok', 'Usuario actualizado.')
      } else {
        await dao.insertar(usuario)
        mostrarAviso('ok', 'Usuario registrado.')
      }
      setForm(usuarioVacio())
      if (verLista) await verUsuarios()
    } catch (error) {
      console.error(error)
      mostrarAviso('error', 'No fue posible guardar la información.')
    }
  }

  function editar(u) {
    setForm({ ...u, edad: String(u.edad) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function eliminar(u) {
    if (!window.confirm(`¿Eliminar a ${u.nombre}?`)) return
    try {
      await dao.eliminar(u.id)
      if (form.id === u.id) setForm(usuarioVacio())
      mostrarAviso('ok', 'Usuario eliminado.')
      await verUsuarios()
    } catch (error) {
      console.error(error)
      mostrarAviso('error', 'No fue posible eliminar el usuario.')
    }
  }

  return (
    <main className="contenedor">
      <h1>Registro de usuarios</h1>

      <form className="formulario" onSubmit={guardar}>
        <h2>{editando ? `Editando usuario #${form.id}` : 'Nuevo usuario'}</h2>

        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={cambiar} placeholder="Ej. Ana López" />
        </label>

        <label>
          Edad
          <input name="edad" type="number" inputMode="numeric" value={form.edad} onChange={cambiar} placeholder="Ej. 20" />
        </label>

        <label>
          Profesión
          <input name="profesion" value={form.profesion} onChange={cambiar} placeholder="Ej. Ing. en Sistemas" />
        </label>

        <div className="acciones">
          <button type="submit">{editando ? 'ACTUALIZAR' : 'GUARDAR'}</button>
          {editando && (
            <button type="button" className="secundario" onClick={() => setForm(usuarioVacio())}>
              CANCELAR
            </button>
          )}
        </div>
      </form>

      {aviso && (
        <p className={aviso.tipo === 'ok' ? 'aviso ok' : 'aviso error'} role="status">
          {aviso.texto}
        </p>
      )}

      <button className="ver" onClick={verUsuarios}>VER usuarios</button>

      {verLista && (
        <section className="lista">
          <h2>Usuarios registrados ({usuarios.length})</h2>
          {usuarios.length === 0 && <p className="vacio">No hay usuarios registrados.</p>}

          {usuarios.map((u) => (
            <article key={u.id} className="tarjeta">
              <div>
                <strong>{u.nombre}</strong>
                <span>ID {u.id} · {u.edad} años</span>
                <span>{u.profesion}</span>
              </div>
              <div className="botones">
                <button className="chico" onClick={() => editar(u)}>Editar</button>
                <button className="chico peligro" onClick={() => eliminar(u)}>Eliminar</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default App