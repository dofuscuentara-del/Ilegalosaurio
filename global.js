// Mostrar overlay de carga
function showLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.style.display = "flex";
}

// Ocultar overlay
function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.style.display = "none";
}

// Aplicar a todos los botones
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    showLoading();
    // Opcional: ocultar automáticamente después de X ms
    // setTimeout(() => hideLoading(), 3000);
  });
});
