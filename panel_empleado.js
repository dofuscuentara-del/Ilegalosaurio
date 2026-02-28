
const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';

const empleado_id = localStorage.getItem('empleado_id');
if (!empleado_id) {
  window.location.href = 'index.html';
}

/* =========================
   ELEMENTOS
========================= */
const estadoEl = document.getElementById('estadoActual');
const horasHoyEl = document.getElementById('horasHoy');
const listaDiasEl = document.getElementById('listaDias');
const fotoPerfilEl = document.getElementById('fotoPerfil');

const modalCalc = document.getElementById('modalCalculadora');
const fechaInicioEl = document.getElementById('fechaInicio');
const fechaFinEl = document.getElementById('fechaFin');
const sueldoHoraEl = document.getElementById('sueldoHora');
const resultadoCalcEl = document.getElementById('resultadoCalc');

const modalAvatares = document.getElementById('modalAvatares');
const gridAvatares = document.getElementById('gridAvatares');
const tabMasculino = document.getElementById('tabMasculino');
const tabFemenino = document.getElementById('tabFemenino');
let generoActivo = 'masculino';

/* =========================
   FUNCIONES
========================= */
async function cargarPanel() {
  try {
    const url = `${API_URL}?action=panelEmpleado&empleado_id=${encodeURIComponent(empleado_id)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.ok) {
      alert('No se pudo cargar el panel');
      return;
    }

    renderEstado(data.estado.estado);
    renderHistorial(data.resumen?.dias || []);
    horasHoyEl.textContent = `Horas últimos 15 días: ${data.resumen?.total_horas || 0}`;
    document.getElementById('nombreEmpleado').textContent = data.estado.nombre || 'Empleado';

    const fotoGuardada = localStorage.getItem('foto_perfil');
    fotoPerfilEl.src = fotoGuardada || 'm1.png';

  } catch (err) {
    console.error(err);
    alert('Error al cargar datos');
  }
}

function generarAvatares(genero) {
  gridAvatares.innerHTML = '';
  const total = 10;

  for (let i = 1; i <= total; i++) {
    const img = document.createElement('img');
    const avatarNombre = genero === 'masculino' ? `m${i}.png` : `f${i}.png`;

    img.src = avatarNombre;
    img.classList.add('avatar-item');
    img.width = 80;
    img.height = 80;

    img.addEventListener('click', () => {
      fotoPerfilEl.src = avatarNombre;
      localStorage.setItem('foto_perfil', avatarNombre);
      modalAvatares.style.display = 'none';
    });

    gridAvatares.appendChild(img);
  }
}

function renderEstado(estado) {
  estadoEl.textContent = `Estado: ${estado}`;
}

function renderHistorial(dias) {
  listaDiasEl.innerHTML = '';
  dias.forEach(d => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${d.fecha}</span><span>${d.horas} h</span>`;
    listaDiasEl.appendChild(li);
  });
}

async function marcar(tipo) {
  try {
    const url = `${API_URL}?action=${tipo}&empleado_id=${encodeURIComponent(empleado_id)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.ok) {
      alert(data.error || 'Error al registrar');
      return;
    }

    cargarPanel();
  } catch (err) {
    console.error(err);
    alert('Error de conexión');
  }
}

/* =========================
   EVENTOS — EVENT DELEGATION
========================= */
document.body.addEventListener('click', (e) => {
  switch (e.target.id) {
    case 'btnCambiarFoto':
      modalAvatares.style.display = 'flex';
      generarAvatares(generoActivo);
      break;

    case 'btnCalculadora':
      resultadoCalcEl.textContent = 'Horas: 0 | Total: $0';
      modalCalc.style.display = 'flex';
      break;

    case 'btnCerrarAvatar':
      modalAvatares.style.display = 'none';
      break;

    case 'btnCerrarCalc':
      modalCalc.style.display = 'none';
      break;

    case 'btnEntrada':
      marcar('entrada');
      break;

    case 'btnSalida':
      marcar('salida');
      break;

    case 'btnSalir':
      localStorage.clear();
      window.location.href = 'index.html';
      break;

    case 'tabMasculino':
      generoActivo = 'masculino';
      tabMasculino.classList.add('tab-activa');
      tabFemenino.classList.remove('tab-activa');
      generarAvatares('masculino');
      break;

    case 'tabFemenino':
      generoActivo = 'femenino';
      tabFemenino.classList.add('tab-activa');
      tabMasculino.classList.remove('tab-activa');
      generarAvatares('femenino');
      break;

    case 'btnCalcular':
      calcularRango();
      break;
  }
});

async function calcularRango() {
  const desde = fechaInicioEl.value;
  const hasta = fechaFinEl.value;
  const sueldo = parseFloat(sueldoHoraEl.value);

  if (!desde || !hasta || !sueldo) {
    alert('Completa todos los campos');
    return;
  }

  try {
    const url = `${API_URL}?action=resumenRango&empleado_id=${encodeURIComponent(empleado_id)}&desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.ok) {
      alert('No se pudo calcular');
      return;
    }

    const total = data.total_horas * sueldo;
    resultadoCalcEl.textContent = `Horas: ${data.total_horas} | Total: $${total.toFixed(2)}`;
  } catch (err) {
    console.error(err);
    alert('Error en calculadora');
  }
}

/* =========================
   INICIO
========================= */
cargarPanel();
