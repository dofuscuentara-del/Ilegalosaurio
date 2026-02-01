const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';
const empleado_id = localStorage.getItem('empleado_id');
if (!empleado_id) location.href = 'index.html';

document.getElementById('btnEntrada').onclick = () => registrar('entrada');
document.getElementById('btnSalida').onclick = () => registrar('salida');

async function registrar(tipo) {
  const res = await fetch(`${API_URL}?action=${tipo}&empleado_id=${empleado_id}`);
  const data = await res.json();

  if (!data.ok) return alert('Error');

  alert(`${tipo.toUpperCase()} registrada`);
  localStorage.clear();
  location.href = 'index.html';
}

  .catch(() => alert('Error de conexión'));
}

