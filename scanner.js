const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';
const SCANNER_MODO = localStorage.getItem('scanner_modo');
if (!SCANNER_MODO) location.href = 'index.html';

let qrScanner;

async function usarCamara() {
  qrScanner = new Html5Qrcode("qr-reader");

  await qrScanner.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    async qr => {
      await qrScanner.stop();
      procesarQR(qr);
    }
  );
}

function procesarQR(qr) {
  fetch(`${API_URL}?action=validarQR&qr_id=${encodeURIComponent(qr)}`)
    .then(r => r.json())
    .then(data => {
      if (!data.ok) return alert('QR inválido');

      localStorage.setItem('empleado_id', data.empleado_id);
      localStorage.setItem('rol', data.rol);

      if (SCANNER_MODO === 'asistencia') {
        location.href = 'registrar.html';
      } else {
        location.href = data.rol === 'admin'
          ? 'panel_admin.html'
          : 'panel_empleado.html';
      }
    });
}

document.getElementById('btnCamara').onclick = usarCamara;
document.getElementById('btnCancelar').onclick = () => location.href = 'index.html';
