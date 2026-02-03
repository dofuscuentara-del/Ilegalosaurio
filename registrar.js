
const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';

// Obtenemos empleado_id y rol desde el scanner
let empleado_id = localStorage.getItem('empleado_id');
let rol = localStorage.getItem('rol'); // <-- rol guardado en scanner

if (!empleado_id || !rol) {
  window.location.href = 'index.html';
}

/* ⛔ Bloquear botón atrás */
history.pushState(null, '', location.href);
window.onpopstate = () => {
  history.pushState(null, '', location.href);
};

/* =========================
   LIMPIAR LOCALSTORAGE SI ES NECESARIO
========================= */
localStorage.removeItem('scanner_modo');

/* =========================
   CARGAR DATOS EMPLEADO (GET)
========================= */
fetch(`${API_URL}?action=panelEmpleado&empleado_id=${encodeURIComponent(empleado_id)}`)
  .then(r => r.json())
  .then(res => {
    if (!res.ok) {
      alert('No se pudo cargar empleado');
      limpiarYSalir();
      return;
    }

    document.getElementById('nombreEmpleado').textContent =
      res.estado.nombre || 'Empleado';

    if (res.estado.foto_url) {
      document.getElementById('fotoEmpleado').src = res.estado.foto_url;
    }

    // Guardamos estado actual
    window.ESTADO_ACTUAL = res.estado.estado; // DENTRO | FUERA

    // Guardamos el rol correctamente si no estaba definido
    if (!rol && res.estado.rol) {
      rol = res.estado.rol.trim().toLowerCase();
      localStorage.setItem('rol', rol);
    }
  })
  .catch(() => {
    alert('Error de conexión al cargar empleado');
    limpiarYSalir();
  });

/* =========================
   BOTONES
========================= */
document.getElementById('btnEntrada').onclick = () => registrar('entrada');
document.getElementById('btnSalida').onclick = () => registrar('salida');

function registrar(tipo) {

  if (tipo === 'entrada' && window.ESTADO_ACTUAL === 'DENTRO') {
    alert('Ya tienes una entrada activa');
    return;
  }

  if (tipo === 'salida' && window.ESTADO_ACTUAL === 'FUERA') {
    alert('No puedes marcar salida sin entrada');
    return;
  }

  const confirmar = confirm(`¿Confirmar ${tipo.toUpperCase()}?`);
  if (!confirmar) return;

  // Construir URL GET para registrar
  const url = `${API_URL}?action=${tipo}&empleado_id=${encodeURIComponent(empleado_id)}`;

  fetch(url)
    .then(r => r.json())
    .then(res => {
      if (!res.ok) {
        alert('Error al registrar: ' + (res.error || 'desconocido'));
        return;
      }

      alert(`${tipo.toUpperCase()} registrada correctamente`);

      // Limpiar solo empleado_id y scanner_modo
      localStorage.removeItem('empleado_id');
      localStorage.removeItem('scanner_modo');

      // Mantener rol hasta que cierre sesión
      // localStorage.removeItem('rol'); <-- no hacemos esto

      window.location.replace('index.html');
    })
    .catch(() => {
      alert('Error de conexión al registrar');
    });
}

// =========================
// FUNCIONES AUXILIARES
// =========================
function limpiarYSalir() {
  localStorage.removeItem('empleado_id');
  localStorage.removeItem('scanner_modo');
  window.location.href = 'index.html';
}
