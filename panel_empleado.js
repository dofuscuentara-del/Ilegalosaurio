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
   CARGAR PANEL
========================= */
cargarPanel();
cargarFotoLocal();

async function cargarPanel() {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'panelEmpleado',
        empleado_id
      })
    });

    const data = await res.json();
    if (!data.ok) {
      alert('No se pudo cargar el panel');
      return;
    }

    renderEstado(data.estado);
    renderHistorial(data.resumen.dias);
    horasHoyEl.textContent = `Horas últimos 15 días: ${data.resumen.total_horas}`;

  } catch (err) {
    console.error(err);
    alert('Error al cargar datos');
  }
}

/* =========================
   FOTO PERFIL
========================= */
btnCambiarFoto.addEventListener('click', () => {
  inputFoto.click();
});

inputFoto.addEventListener('change', () => {
  const file = inputFoto.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'subirFotoPerfil',
          empleado_id,
          tipo: 'empleado',
          base64: reader.result
        })
      });

      const data = await res.json();
      if (!data.ok) {
        alert('Error al subir foto');
        return;
      }

      fotoPerfilEl.src = data.foto_url;
      localStorage.setItem('foto_perfil', data.foto_url);

    } catch (err) {
      console.error(err);
      alert('Error al subir foto');
    }
  };

  reader.readAsDataURL(file);
});

function cargarFotoLocal() {
  const foto = localStorage.getItem('foto_perfil');
  if (foto) {
    fotoPerfilEl.src = foto;
  }
}

/* =========================
   ENTRADA / SALIDA
========================= */
btnEntrada.addEventListener('click', () => marcar('entrada'));
btnSalida.addEventListener('click', () => marcar('salida'));

async function marcar(tipo) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: tipo,
        empleado_id
      })
    });

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
   CALCULADORA PRO (MODAL)
========================= */
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
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'resumenRango',
        empleado_id,
        desde,
        hasta
      })
    });

    const data = await res.json();
    if (!data.ok) {
      alert('No se pudo calcular');
      return;
    }

    const total = data.total_horas * sueldo;

    resultadoCalcEl.textContent =
      `Horas: ${data.total_horas} | Total: $${total.toFixed(2)}`;

  } catch (err) {
    console.error(err);
    alert('Error en calculadora');
  }
});

/* =========================
   SALIR
========================= */
btnSalir.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

/* =========================
   RENDER
========================= */
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
