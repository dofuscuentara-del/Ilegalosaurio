
const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';
const esDesktop = !/Android|iPhone|iPad/i.test(navigator.userAgent);
if (esDesktop) alert('En laptops se recomienda usar "Leer desde foto"');

const SCANNER_MODO = localStorage.getItem('scanner_modo');
if (!SCANNER_MODO) location.replace('index.html');

let qrScanner=null, scanning=false;

async function usarCamara(){
  if(!qrScanner) qrScanner=new Html5Qrcode("qr-reader");
  if(scanning) return;
  try{
    scanning=true;
    await qrScanner.start({facingMode:"environment"},{fps:10, qrbox:{width:250,height:250}}, qrData=>{detenerScanner(); procesarQR(qrData);}, ()=>{});
  }catch(err){scanning=false; alert("No se pudo abrir la cámara"); console.error(err);}
}

async function usarGaleria(){
  if(!qrScanner) qrScanner=new Html5Qrcode("qr-reader");
  const input=document.createElement("input"); input.type="file"; input.accept="image/*";
  input.onchange=async e=>{if(!e.target.files.length) return; try{const file=e.target.files[0]; const qrData=await qrScanner.scanFile(file,true); procesarQR(qrData);}catch(err){alert("No se detectó ningún QR en la imagen"); console.error(err);}};
  input.click();
}

async function detenerScanner(){if(qrScanner&&scanning){try{await qrScanner.stop(); await qrScanner.clear();}catch{}} scanning=false;}

async function procesarQR(qrData){
  try{
    const url=`${API_URL}?action=validarQR&qr_id=${encodeURIComponent(qrData)}`;
    const res=await fetch(url,{method:"GET"}); const data=await res.json();
    if(!data.ok){alert("QR no válido o empleado inactivo"); return;}
    localStorage.setItem("empleado_id", data.empleado_id);
    localStorage.setItem("rol", data.rol||data.tipo);
    localStorage.removeItem("scanner_modo");
    if(SCANNER_MODO==="asistencia") location.replace("registrar.html");
    if(SCANNER_MODO==="login") location.replace(data.rol==="admin"?"panel_admin.html":"panel_empleado.html");
  }catch(err){console.error(err); alert("Error de conexión con el servidor.\nVerifica que tu Web App esté desplegado como 'Anyone, even anonymous'.");}
}

document.getElementById("btnCamara").onclick=usarCamara;
document.getElementById("btnGaleria").onclick=usarGaleria;
document.getElementById("btnCancelar").onclick=async()=>{await detenerScanner(); location.replace("index.html");};

