// index.js
document.addEventListener('DOMContentLoaded', () => {

  // 🔹 AUTO LOGIN PRIMERO
  const empleado_id = localStorage.getItem("empleado_id");
  const rol = localStorage.getItem("rol");

  if (empleado_id && rol) {
    if (rol === "admin") {
      location.replace("panel_admin.html");
      return;
    } else if (rol === "empleado") {
      location.replace("panel_empleado.html");
      return;
    }
  }

  // 🔹 LUEGO BOTONES
  const btnEscanear = document.getElementById('btnEscanear');
  const btnPanel = document.getElementById('btnPanel');

  btnEscanear.addEventListener('click', () => {
    localStorage.setItem('scanner_modo', 'asistencia');
    window.location.href = 'scanner.html';
  });

  btnPanel.addEventListener('click', () => {
    const checkbox = document.getElementById("recordarSesion");
    const check = checkbox ? checkbox.checked : false;

    localStorage.setItem("recordar_tmp", check);
    localStorage.setItem('scanner_modo', 'login');
    window.location.href = 'scanner.html';
  });

});
