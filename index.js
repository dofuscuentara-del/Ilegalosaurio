// index.js

document.addEventListener('DOMContentLoaded', function () {

  // ===== AUTO LOGIN =====
  const empleado_id = localStorage.getItem("empleado_id");
  const rol = localStorage.getItem("rol");

  if (empleado_id && rol) {
    if (rol === "admin") {
      window.location.href = "panel_admin.html";
      return;
    }
    if (rol === "empleado") {
      window.location.href = "panel_empleado.html";
      return;
    }
  }

  // ===== BOTONES =====
  const btnEscanear = document.getElementById("btnEscanear");
  const btnPanel = document.getElementById("btnPanel");

  if (btnEscanear) {
    btnEscanear.onclick = function () {
      localStorage.setItem("scanner_modo", "asistencia");
      window.location.href = "scanner.html";
    };
  }

  if (btnPanel) {
    btnPanel.onclick = function () {
      const checkbox = document.getElementById("recordarSesion");
      const check = checkbox ? checkbox.checked : false;

      localStorage.setItem("recordar_tmp", check);
      localStorage.setItem("scanner_modo", "login");
      window.location.href = "scanner.html";
    };
  }

});
