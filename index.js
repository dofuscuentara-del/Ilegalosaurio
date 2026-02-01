// index.js
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnEscanear').onclick = () => {
    localStorage.setItem('scanner_modo', 'asistencia');
    location.href = 'scanner.html';
  };

  document.getElementById('btnPanel').onclick = () => {
    localStorage.setItem('scanner_modo', 'login');
    location.href = 'scanner.html';
  };
});
