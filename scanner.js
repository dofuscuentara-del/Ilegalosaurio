
const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';

const esDesktop = !/Android|iPhone|iPad/i.test(navigator.userAgent);

const SCANNER_MODO = localStorage.getItem('scanner_modo');
if (!SCANNER_MODO) {
  location.replace('index.html');
}

let qrScanner = null;
let scanning = false;

// =======================
// CÁMARA
// =======================
async function usarCamara() {
  if (scanning) return;

  qrScanner = new Html5Qrcode("qr-reader");

  try {
    scanning = true;

    await qrScanner.start(
      esDesktop ? { facingMode: "user" } : { facingMode: "environment" },
      { fps: 10, qrbox: 230 },
      qrData => {
        detenerScanner();
        procesarQR(qrData);
      }
    );
  } catch (err) {
    scanning = false;
    alert("No se pudo abrir la cámara");
    console.error(err);
  }
}

// =======================
// GALERÍA (FIX REAL)
// =======================
async function usarGaleria() {
  await detenerScanner();

  // 🔑 NUEVA instancia limpia
  qrScanner = new Html5Qrcode("qr-reader");

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
// DETENER
// =======================
async function detenerScanner() {
  if (qrScanner) {
    try {
      await qrScanner.stop();
      await qrScanner.clear();
    } catch {}
  }
  scanning = false;
}

// =======================
// PROCESAR QR (SIN CORS)
// =======================
function procesarQR(qrData) {
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

      if (SCANNER_MODO === "login") {
        location.replace(
          data.rol === "admin"
            ? "panel_admin.html"
            : "panel_empleado.html"
        );
      }
    })
    .catch(err => {
      console.error(err);
      alert("Error de conexión con el servidor");
    });
}

// =======================
// EVENTOS
// =======================
btnCamara.onclick = usarCamara;
btnGaleria.onclick = usarGaleria;
btnCancelar.onclick = async () => {
  await detenerScanner();
  location.replace("index.html");
};

