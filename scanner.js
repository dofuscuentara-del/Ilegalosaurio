
const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';

const esDesktop = !/Android|iPhone|iPad/i.test(navigator.userAgent);

// =======================
// MODO ESCANER
// =======================
const SCANNER_MODO = localStorage.getItem('scanner_modo');
if (!SCANNER_MODO) location.replace('index.html');

let qrScanner = null;
let scanning = false;

// =======================
// INICIAR CÁMARA
// =======================
async function usarCamara() {
  if (scanning) return;

  if (!qrScanner) qrScanner = new Html5Qrcode("qr-reader");

  try {
    scanning = true;
    await qrScanner.start(
      esDesktop ? { facingMode: "user" } : { facingMode: "environment" },
      { fps: 10, qrbox: 230 },
      qrData => {
        detenerScanner();
        procesarQR(qrData);
      },
      err => {
        console.warn("No detectado aún...", err);
      }
    );
  } catch (err) {
    scanning = false;
    alert("No se pudo abrir la cámara");
    console.error(err);
  }
}

// =======================
// LEER DESDE GALERÍA
// =======================
async function usarGaleria() {
  await detenerScanner(); // detener cámara si estaba activa
  qrScanner = new Html5Qrcode("qr-reader"); // nueva instancia

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = async e => {
    if (!e.target.files.length) return;

    try {
      const qrData = await qrScanner.scanFile(e.target.files[0], true);
      procesarQR(qrData);
    } catch (err) {
      alert("No se detectó ningún QR en la imagen");
      console.error(err);
    }
  };

  input.click();
}

// =======================
// DETENER ESCANER
// =======================
async function detenerScanner() {
  if (qrScanner && scanning) {
    try {
      await qrScanner.stop();
      await qrScanner.clear();
    } catch {}
  }
  scanning = false;
}

// =======================
// PROCESAR QR Y CONEXIÓN
// =======================
async function procesarQR(qrData) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      mode: "cors", // permite conexión cross-origin
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "validarQR",
        qr_id: qrData
      })
    });

    const data = await res.json();

    if (!data.ok) {
      alert("QR no válido o empleado inactivo");
      return;
    }

    localStorage.setItem("empleado_id", data.empleado_id);
    const rol = (data.rol || data.tipo || '').toLowerCase();
    localStorage.setItem("rol", rol);
    localStorage.removeItem("scanner_modo");

    if (SCANNER_MODO === "asistencia") {
      location.replace("registrar.html");
      return;
    }

    if (SCANNER_MODO === "login") {
      location.replace(rol === "admin" ? "panel_admin.html" : "panel_empleado.html");
    }

  } catch (err) {
    console.error(err);
    alert("Error de conexión con el servidor. Revisa tu URL o despliegue de Apps Script.");
  }
}

// =======================
// EVENTOS
// =======================
document.getElementById("btnCamara").onclick = usarCamara;
document.getElementById("btnGaleria").onclick = usarGaleria;
document.getElementById("btnCancelar").onclick = async () => {
  await detenerScanner();
  location.replace("index.html");
};


