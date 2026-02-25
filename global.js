// Mostrar overlay
function showLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.style.display = "flex";
}

// Ocultar overlay
function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.style.display = "none";
}

// Mostrar overlay al abrir página
window.addEventListener("load", () => {
  showLoading();
  setTimeout(() => hideLoading(), 500); // 0.5s
});

// Interceptar todos los botones para mostrar overlay
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    showLoading();
  });
});

