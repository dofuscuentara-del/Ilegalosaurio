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

const btnEntrada = document.getElementById('btnEntrada');
const btnSalida = document.getElementById('btnSalida');
const btnCalculadora = document.getElementById('btnCalculadora');
const btnSalir = document.getElementById('btnSalir');

/* ===== FOTO PERFIL ===== */
const fotoPerfilEl = document.getElementById('fotoPerfil');
const btnCambiarFoto = document.getElementById('btnCambiarFoto');
const inputFoto = document.getElementById('inputFoto');

/* ===== MODAL CALCULADORA ===== */
const modalCalc = document.getElementById('modalCalculadora');
const fechaInicioEl = document.getElementById('fechaInicio');
const fechaFinEl = document.getElementById('fechaFin');
const sueldoHoraEl = document.getElementById('sueldoHora');
const resultadoCalcEl = document.getElementById('resultadoCalc');

const btnCalcular = document.getElementById('btnCalcular');
const btnCerrarCalc = document.getElementById('btnCerrarCalc');

/* =========================
   MODAL AVATARES
========================= */
const modalAvatares = document.getElementById('modalAvatares');
const gridAvatares = document.getElementById('gridAvatares');
const btnCerrarAvatar = document.getElementById('btnCerrarAvatar');
const tabMasculino = document.getElementById('tabMasculino');
const tabFemenino = document.getElementById('tabFemenino');
let generoActivo = 'masculino';

/* =========================
   LOADER AVATARES
========================= */
function mostrarLoaderAvatares(show) {
  if (show) {
    gridAvatares.innerHTML = `<div style="text-align:center; width:100%; padding:50px 0;">Cargando avatares...</div>`;
  } else {
    gridAvatares.innerHTML = '';
  }
}

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

    if (data.estado.foto_url) {
      fotoPerfilEl.src = data.estado.foto_url;
      localStorage.setItem('foto_perfil', data.estado.foto_url);
    }
    document.getElementById('nombreEmpleado').textContent = data.estado.nombre || 'Empleado';
  } catch (err) {
    console.error(err);
    alert('Error al cargar datos');
  }
}

function generarAvatares(genero) {
  // Limpiar grilla y mostrar loader
  gridAvatares.innerHTML = '';
  mostrarLoaderAvatares(true);

  const promesas = [];

  for (let i = 1; i <= 10; i++) {
    const img = document.createElement('img');
    const avatarNombre = genero === 'masculino' ? `m${i}.png` : `f${i}.png`;

    img.src = avatarNombre;
    img.classList.add('avatar-item');
    img.width = 80;
    img.height = 80;

    // Cada imagen agrega una promesa para saber cuándo termina de cargar
    const promesaImg = new Promise((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => {
        console.warn(`No se pudo cargar la imagen ${avatarNombre}`);
        resolve();
      };
    });

    promesas.push(promesaImg);
    gridAvatares.appendChild(img);

    img.addEventListener('click', async () => {
      try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'subirFotoPerfil',
            empleado_id,
            tipo: 'empleado',
            avatarNombre: avatarNombre
          })
        });
        const data = await res.json();

        if (!data.ok) {
          alert('Error al guardar foto');
          return;
        }

        fotoPerfilEl.src = avatarNombre;
        localStorage.setItem('foto_perfil', avatarNombre);
        modalAvatares.style.display = 'none';
      } catch (err) {
        console.error(err);
        alert('Error al guardar foto');
      }
    });
  }

  // Ocultar loader solo cuando todas las imágenes estén cargadas o fallen
  Promise.all(promesas).then(() => {
    mostrarLoaderAvatares(false);
  });
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
   EVENTOS
========================= */
btnCambiarFoto.addEventListener('click', () => {
  modalAvatares.style.display = 'flex';
  generarAvatares(generoActivo);
});

btnCerrarAvatar.addEventListener('click', () => {
  modalAvatares.style.display = 'none';
});

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

btnCerrarCalc.addEventListener('click', () => {
  modalCalc.style.display = 'none';
});

btnCalcular.addEventListener('click', async () => {
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
});

btnSalir.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

/* =========================
   INICIO
========================= */
cargarPanel();



