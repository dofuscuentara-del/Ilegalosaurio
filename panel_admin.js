const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';

/* ===== SEGURIDAD ===== */
const rol = localStorage.getItem('rol');
const admin_id = localStorage.getItem('empleado_id');

if (rol !== 'admin' || !admin_id) {
  localStorage.clear();
  location.href = 'index.html';
}

/* ===== ELEMENTOS ===== */
const empleadosActivosEl = document.getElementById('empleadosActivos');
const totalEmpleadosEl = document.getElementById('totalEmpleados');
const listaEmpleadosEl = document.getElementById('listaEmpleados');
const fotoAdmin = document.getElementById('fotoAdmin');

document.getElementById('btnSalirAdmin').onclick = () => {
  localStorage.clear();
  location.href = 'index.html';
};

document.getElementById('btnNuevoEmpleado').onclick = crearEmpleado;

/* ===== INIT ===== */
cargarEmpleados();

/* ===== BACKEND GET ===== */
async function api(params) {
  const url = API_URL + '?' + new URLSearchParams(params);
  const res = await fetch(url);
  return res.json();
}

/* ===== DATA ===== */
async function cargarEmpleados() {
  const data = await api({ action: 'listarEmpleados' });
  if (!data.ok) return alert('Error');

  render(data.empleados);

  const admin = data.empleados.find(e => e.empleado_id === admin_id);
  if (admin?.foto_url) fotoAdmin.src = admin.foto_url;
}

function render(empleados) {
  empleadosActivosEl.textContent = empleados.filter(e => e.activo).length;
  totalEmpleadosEl.textContent = empleados.length;

  listaEmpleadosEl.innerHTML = '';
  empleados.forEach(e => {
    const li = document.createElement('li');
    li.innerHTML = `<b>${e.nombre}</b><br><small>${e.rol}</small>`;
    listaEmpleadosEl.appendChild(li);
  });
}

async function crearEmpleado() {
  const nombre = prompt('Nombre');
  if (!nombre) return;

  const res = await api({
    action: 'crearEmpleado',
    nombre
  });

  if (!res.ok) return alert('Error');

  alert('Empleado creado\nQR: ' + res.qr_id);
  cargarEmpleados();
}

