const API_URL = 'https://script.google.com/macros/s/AKfycbzFBswLY6YJeEAlrH1DoKde2ZeplXQjfvpgS3koq9BJs1y0htljmGiFTv8zWCPCEbS3/exec';
const SCANNER_MODO = localStorage.getItem('scanner_modo');
if(!SCANNER_MODO) location.replace('index.html');

let qrScanner = new Html5Qrcode("qr-reader");
let scanning = false;

// Función para procesar QR
function procesarQR(qrData){
  fetch(API_URL,{
    method:"POST",
    body: JSON.stringify({action:"validarQR",qr_id:qrData})
  })
  .then(r=>r.json())
  .then(data=>{
    if(!data.ok){alert("QR no válido"); return;}
    localStorage.setItem("empleado_id",data.empleado_id);
    localStorage.setItem("rol",data.rol);
    localStorage.removeItem("scanner_modo");

    if(SCANNER_MODO==="asistencia") location.replace("registrar.html");
    if(SCANNER_MODO==="login"){
      if(data.rol==="admin") location.replace("panel_admin.html");
      else location.replace("panel_empleado.html");
    }
  })
  .catch(err=>{console.error(err);alert("Error de conexión con el servidor");});
}

// Función para iniciar cámara automáticamente
async function iniciarCamara(){
  if(scanning) return;
  scanning = true;
  try{
    await qrScanner.start(
      {facingMode:"environment"},
      {fps:10,qrbox:250},
      qrData=>{detenerScanner();procesarQR(qrData);}
    );
  }catch(err){
    console.warn("No se pudo abrir cámara:",err);
    scanning = false;
  }
}

// Función para leer galería
function usarGaleria(){
  const input=document.createElement("input");
  input.type="file"; input.accept="image/*";
  input.onchange=e=>{
    if(!e.target.files.length) return;
    const file=e.target.files[0];
    const reader=new FileReader();
    reader.onload=async ev=>{
      try{
        const qrData=await qrScanner.scanFile(ev.target.result,true);
        procesarQR(qrData);
      }catch(err){alert("No se detectó QR en la imagen");console.error(err);}
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// Detener scanner
async function detenerScanner(){
  if(scanning){try{await qrScanner.stop(); await qrScanner.clear();}catch{}}
  scanning=false;
}

// Eventos
document.getElementById("btnCamara").addEventListener("click",iniciarCamara);
document.getElementById("btnGaleria").addEventListener("click",usarGaleria);
document.getElementById("btnCancelar").addEventListener("click",async()=>{await detenerScanner(); location.href='index.html';});

// Auto iniciar cámara al cargar
window.addEventListener("load",()=>{iniciarCamara();});
