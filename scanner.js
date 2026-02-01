const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';

const SCANNER_MODO = localStorage.getItem('scanner_modo');
if(!SCANNER_MODO) location.replace('index.html');

let qrScanner = null;
let scanning = false;

// Procesar QR
async function procesarQR(qrData) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "validarQR", qr_id: qrData })
    });
    const data = await res.json();
    if(!data.ok){ alert("QR no válido"); return; }

    localStorage.setItem("empleado_id", data.empleado_id);
    localStorage.setItem("rol", data.rol);
    localStorage.removeItem("scanner_modo");

    if(SCANNER_MODO === "asistencia") location.replace("registrar.html");
    if(SCANNER_MODO === "login") {
      if(data.rol === "admin") location.replace("panel_admin.html");
      else location.replace("panel_empleado.html");
    }
  } catch(err) {
    console.error(err);
    alert("Error de conexión con el servidor");
  }
}

// Iniciar cámara
async function usarCamara() {
  if(scanning) return;
  scanning = true;
  try {
    if(!qrScanner) qrScanner = new Html5Qrcode("qr-reader");
    await qrScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250, experimentalFeatures: { useBarCodeDetectorIfSupported: true } },
      qrData => { detenerScanner(); procesarQR(qrData); },
      err => {}
    );
  } catch(err) {
    scanning = false;
    alert("No se pudo abrir la cámara. Usa 'Leer desde foto'");
    console.error(err);
  }
}

// Leer QR desde galería
function usarGaleria() {
  const input = document.createElement("input");
  input.type = "file"; input.accept = "image/*";
  input.onchange = async e => {
    if(!e.target.files.length) return;
    const file = e.target.files[0];
    try {
      if(!qrScanner) qrScanner = new Html5Qrcode("qr-reader");
      const qrData = await qrScanner.scanFile(file, true);
      procesarQR(qrData);
    } catch(err) {
      alert("No se detectó ningún QR en la imagen");
      console.error(err);
    }
  };
  input.click();
}

// Detener scanner
async function detenerScanner() {
  if(qrScanner && scanning) {
    try { await qrScanner.stop(); await qrScanner.clear(); } catch {}
  }
  scanning = false;
}

// EVENTOS
document.getElementById("btnCamara").addEventListener("click", usarCamara);
document.getElementById("btnGaleria").addEventListener("click", usarGaleria);
document.getElementById("btnCancelar").addEventListener("click", async () => {
  await detenerScanner();
  location.href = 'index.html';
});

// Auto iniciar cámara al cargar
window.addEventListener("load", () => { usarCamara(); });


