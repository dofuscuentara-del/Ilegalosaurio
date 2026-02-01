const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';
const empleado_id = localStorage.getItem('empleado_id');
if (!empleado_id) location.href = 'index.html';

const estadoEl = document.getElementById('estadoActual');
const horasHoyEl = document.getElementById('horasHoy');

document.getElementById('btnEntrada').onclick = () => marcar('entrada');
document.getElementById('btnSalida').onclick = () => marcar('salida');
document.getElementById('btnSalir').onclick = () => {
  localStorage.clear();
  location.href = 'index.html';
};

async function marcar(tipo) {
  const res = await fetch(`${API_URL}?action=${tipo}&empleado_id=${empleado_id}`);
  const data = await res.json();

  if (!data.ok) return alert('Error');
  estadoEl.textContent = `Estado: ${data.estado}`;
}
