const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';

const esDesktop = !/Android|iPhone|iPad/i.test(navigator.userAgent);

if (esDesktop) {
  alert('En laptops se recomienda usar "Leer desde foto"');
}

const SCANNER_MODO = localStorage.getItem('scanner_modo');
if (!SCANNER_MODO) {
  location.replace('index.html');
}

// INSTANCIA ÚNICA
let qrScanner = null;
let scanning = false;

// INICIAR CÁMARA
async function usarCamara() {
  if (!qrScanner) {
    qrScanner = new Html5Qrcode("qr-reader");
  }

  if (scanning) return;

  try {
    scanning = true;

    await qrScanner.start(
      { facingMode: { exact: "environment" } }, // fuerza cámara trasera
      {
        fps: 10,
        qrbox: 250
      },
      qrData => {
        detenerScanner();
        procesarQR(qrData);
      },
      err => {
        console.warn('QR scan error', err);
      }
    );

  } catch (err) {
    scanning = false;
    alert("No se pudo abrir la cámara. Revisa permisos o usa 'Leer desde foto'.");
    console.error(err);
  }
}

// LEER DESDE GALERÍA
async function usarGaleria() {
  if (!qrScanner) {
    qrScanner = new Html5Qrcode("qr-reader");
  }

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async e => {
    if (!e.target.files.length) return;

    try {
      const file = e.target.files[0];

      // Aseguramos que sea un Blob
      const blob = file instanceof Blob ? file : new Blob([file]);

      const qrData = await qrScanner.scanFile(blob, true);
      procesarQR(qrData);

    } catch (err) {
      alert("No se detectó ningún QR en la imagen");
      console.error(err);
    }
  };

  input.click();
}

// DETENER SCANNER
async function detenerScanner() {
  if (qrScanner && scanning) {
    try {
      await qrScanner.stop();
      await qrScanner.clear();
    } catch (err) {
      console.warn('Error deteniendo scanner', err);
    }
  }
  scanning = false;
}

// PROCESAR QR
function procesarQR(qrData) {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "validarQR",
      qr_id: qrData
    })
  })
    .then(r => r.json())
    .then(data => {
      if (!data.ok) {
        alert("QR no válido");
        return;
      }

      localStorage.setItem("empleado_id", data.empleado_id);
      localStorage.setItem("rol", data.rol);
      localStorage.removeItem("scanner_modo");

      if (SCANNER_MODO === "asistencia") {
        location.replace("registrar.html");
        return;
      }

      if (SCANNER_MODO === "login") {
        if (data.rol === "admin") {
          location.replace("panel_admin.html");
        } else {
          location.replace("panel_empleado.html");
        }
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error de conexión con el servidor");
    });
}

// EVENTOS
document.getElementById("btnCamara").addEventListener('click', usarCamara);
document.getElementById("btnGaleria").addEventListener('click', usarGaleria);
document.getElementById("btnCancelar").addEventListener('click', async () => {
  await detenerScanner();
  location.href = 'index.html';
});
