const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';

const empleado_id = localStorage.getItem('empleado_id');

if (!empleado_id) {
  window.location.href = 'index.html';
}

/* ⛔ bloquear botón atrás */
history.pushState(null, '', location.href);
window.onpopstate = () => {
  history.pushState(null, '', location.href);
};

/* =========================
   CARGAR DATOS EMPLEADO
========================= */
fetch(API_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'panelEmpleado',
    empleado_id
  })
})
.then(r => r.json())
.then(res => {
  if (!res.ok) {
    alert('No se pudo cargar empleado');
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('nombreEmpleado').textContent =
    res.estado.nombre || 'Empleado';

  if (res.estado.foto_url) {
    document.getElementById('fotoEmpleado').src = res.estado.foto_url;
  }

  // Guardamos estado actual
  window.ESTADO_ACTUAL = res.estado.estado; // DENTRO | FUERA
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

  fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: tipo,
      empleado_id
    })
  })
  .then(r => r.json())
  .then(res => {
    if (!res.ok) {
      alert('Error al registrar');
      return;
    }

    alert(`${tipo.toUpperCase()} registrada correctamente`);

    localStorage.removeItem('empleado_id');
    localStorage.removeItem('scanner_modo');

    window.location.replace('index.html');
  })
  .catch(() => alert('Error de conexión'));
}
