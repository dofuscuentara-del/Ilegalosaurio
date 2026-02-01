// index.js
document.addEventListener('DOMContentLoaded', () => {
  const btnEscanear = document.getElementById('btnEscanear');
  const btnPanel = document.getElementById('btnPanel');

  btnEscanear.addEventListener('click', () => {
    // modo asistencia
    localStorage.setItem('scanner_modo', 'asistencia');
    window.location.href = 'scanner.html';
  });

  btnPanel.addEventListener('click', () => {
    // modo login
    localStorage.setItem('scanner_modo', 'login');
    window.location.href = 'scanner.html';
  });
});
