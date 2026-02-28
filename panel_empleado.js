const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';

const empleado_id = localStorage.getItem('empleado_id');
if (!empleado_id) window.location.href = 'index.html';

/* ELEMENTOS */
const estadoEl = document.getElementById('estadoActual');
const horasHoyEl = document.getElementById('horasHoy');
const listaDiasEl = document.getElementById('listaDias');

const btnEntrada = document.getElementById('btnEntrada');
const btnSalida = document.getElementById('btnSalida');
const btnCalculadora = document.getElementById('btnCalculadora');
const btnSalir = document.getElementById('btnSalir');

const fotoPerfilEl = document.getElementById('fotoPerfil');
const btnCambiarFoto = document.getElementById('btnCambiarFoto');

const modalCalc = document.getElementById('modalCalculadora');
const fechaInicioEl = document.getElementById('fechaInicio');
const fechaFinEl = document.getElementById('fechaFin');
const sueldoHoraEl = document.getElementById('sueldoHora');
const resultadoCalcEl = document.getElementById('resultadoCalc');

const btnCalcular = document.getElementById('btnCalcular');
const btnCerrarCalc = document.getElementById('btnCerrarCalc');

const modalAvatares = document.getElementById('modalAvatares');
const gridAvatares = document.getElementById('gridAvatares');
const btnCerrarAvatar = document.getElementById('btnCerrarAvatar');
const tabMasculino = document.getElementById('tabMasculino');
const tabFemenino = document.getElementById('tabFemenino');
let generoActivo = 'masculino';

/* FUNCIONES */
async function cargarPanel() {
  try {
    const res = await fetch(`${API_URL}?action=panelEmpleado&empleado_id=${encodeURIComponent(empleado_id)}`);
    const data = await res.json();
    if (!data.ok) return alert('No se pudo cargar el panel');

    renderEstado(data.estado.estado);
    renderHistorial(data.resumen?.dias || []);
    horasHoyEl.textContent = `Horas últimos 15 días: ${data.resumen?.total_horas || 0}`;
    document.getElementById('nombreEmpleado').textContent = data.estado.nombre || 'Empleado';

    // FOTO: SOLO SI NO HAY NINGUNA
    if (!fotoPerfilEl.src || fotoPerfilEl.src.includes('perfil.png')) {
      const fotoGuardada = localStorage.getItem('foto_perfil');
      fotoPerfilEl.src = fotoGuardada || 'm1.png';
    }

  } catch (err) {
    console.error(err);
    alert('Error al cargar datos');
  }
}

function generarAvatares(genero) {
  gridAvatares.innerHTML = '';
  for (let i = 1; i <= 10; i++) {
    const img = document.createElement('img');
    const avatarNombre = genero === 'masculino' ? `m${i}.png` : `f${i}.png`;
    img.src = avatarNombre;
    img.classList.add('avatar-item');
    img.width = 80; img.height = 80;
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
    const res = await fetch(`${API_URL}?action=${tipo}&empleado_id=${encodeURIComponent(empleado_id)}`);
    const data = await res.json();
    if (!data.ok) return alert(data.error || 'Error al registrar');
    cargarPanel();
  } catch (err) {
    console.error(err);
    alert('Error de conexión');
  }
}

/* EVENTOS */
btnCambiarFoto.addEventListener('click', () => {
  modalAvatares.style.display = 'flex';
  generarAvatares(generoActivo);
});
btnCerrarAvatar.addEventListener('click', () => modalAvatares.style.display = 'none');

tabMasculino.addEventListener('click', () => {
  generoActivo = 'masculino';
  tabMasculino.classList.add('tab-activa');
  tabFemenino.classList.remove('tab-activa');
  generarAvatares('masculino');
});
tabFemenino.addEventListener('click', () => {
  generoActivo = 'femenino';
  tabFemenino.classList.add('tab-activa');
  tabMasculino.classList.remove('tab-activa');
  generarAvatares('femenino');
});

btnEntrada.addEventListener('click', () => marcar('entrada'));
btnSalida.addEventListener('click', () => marcar('salida'));

btnCalculadora.addEventListener('click', () => {
  resultadoCalcEl.textContent = 'Horas: 0 | Total: $0';
  modalCalc.style.display = 'flex';
});
btnCerrarCalc.addEventListener('click', () => modalCalc.style.display = 'none');

btnCalcular.addEventListener('click', async () => {
  const desde = fechaInicioEl.value;
  const hasta = fechaFinEl.value;
  const sueldo = parseFloat(sueldoHoraEl.value);
  if (!desde || !hasta || !sueldo) return alert('Completa todos los campos');

  try {
    const res = await fetch(`${API_URL}?action=resumenRango&empleado_id=${encodeURIComponent(empleado_id)}&desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`);
    const data = await res.json();
    if (!data.ok) return alert('No se pudo calcular');
    resultadoCalcEl.textContent = `Horas: ${data.total_horas} | Total: $${(data.total_horas * sueldo).toFixed(2)}`;
  } catch (err) {
    console.error(err);
    alert('Error en calculadora');
  }
});

btnSalir.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

/* INICIO */
cargarPanel();
