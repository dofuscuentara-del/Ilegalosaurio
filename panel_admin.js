const API_URL =
  'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';

/* ======================
   SEGURIDAD
====================== */
const rol = localStorage.getItem('rol');
const admin_id = localStorage.getItem('empleado_id');

if (rol !== 'admin' || !admin_id) {
  alert('Acceso no autorizado');
  localStorage.clear();
  location.href = 'index.html';
}

/* ======================
   ELEMENTOS
====================== */
const empleadosActivosEl = document.getElementById('empleadosActivos');
const totalEmpleadosEl = document.getElementById('totalEmpleados');
const listaEmpleadosEl = document.getElementById('listaEmpleados');

const fotoAdmin = document.getElementById('fotoAdmin');
const btnCambiarFotoAdmin = document.getElementById('btnCambiarFotoAdmin');
const btnSalirAdmin = document.getElementById('btnSalirAdmin');
const btnNuevoEmpleado = document.getElementById('btnNuevoEmpleado');

/* ======================
   ESTADO
====================== */
let empleados = [];

/* ======================
   INIT
====================== */
cargarAdmin();
cargarEmpleados();

/* ======================
   BACKEND
====================== */
async function post(action, payload = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload })
  });
  return res.json();
}

/* ======================
   CARGAR DATOS
====================== */
async function cargarEmpleados() {
  const data = await post('listarEmpleados');
  if (!data.ok) return alert('Error al cargar empleados');

  empleados = data.empleados;
  renderResumen();
  renderLista();
}

async function cargarAdmin() {
  const data = await post('listarEmpleados');
  if (!data.ok) return;

  const admin = data.empleados.find(e => e.empleado_id === admin_id);
  if (admin?.foto_url) fotoAdmin.src = admin.foto_url;
}

/* ======================
   UI
====================== */
function renderResumen() {
  empleadosActivosEl.textContent = empleados.filter(e => e.activo).length;
  totalEmpleadosEl.textContent = empleados.length;
}

function renderLista() {
  listaEmpleadosEl.innerHTML = '';

  empleados.forEach(emp => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${emp.nombre}</strong><br>
        <small>${emp.rol} | ${emp.activo ? 'Activo' : 'Bloqueado'}</small>
      </div>
    `;
    listaEmpleadosEl.appendChild(li);
  });
}

/* ======================
   CREAR EMPLEADO
====================== */
btnNuevoEmpleado.onclick = async () => {
  const nombre = prompt('Nombre del empleado');
  if (!nombre) return;

  const data = await post('crearEmpleado', {
    data: { nombre }
  });

  if (!data.ok) return alert('Error al crear empleado');

  mostrarQR(data.qr_id);
  cargarEmpleados();
};

/* ======================
   FOTO ADMIN
====================== */
btnCambiarFotoAdmin.onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
      const res = await post('subirFoto', {
        empleado_id: admin_id,
        base64: reader.result
      });

      if (res.ok) fotoAdmin.src = res.foto_url;
      else alert('Error al subir foto');
    };

    reader.readAsDataURL(file);
  };

  input.click();
};

/* ======================
   SALIR
====================== */
btnSalirAdmin.onclick = () => {
  localStorage.clear();
  location.href = 'index.html';
};

/* ======================
   QR
====================== */
function mostrarQR(qr_id) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position:fixed; inset:0;
    background:rgba(0,0,0,.6);
    display:flex; align-items:center; justify-content:center;
    z-index:9999;
  `;

  modal.innerHTML = `
    <div style="background:#fff;padding:20px;border-radius:12px;text-align:center">
      <h3>QR del empleado</h3>
      <canvas id="qrCanvas"></canvas>
      <p style="font-size:12px">${qr_id}</p>
      <button id="btnCerrarQR">Cerrar</button>
    </div>
  `;

  document.body.appendChild(modal);

  new QRious({
    element: document.getElementById('qrCanvas'),
    value: qr_id,
    size: 220
  });

  document.getElementById('btnCerrarQR').onclick = () => modal.remove();
}
