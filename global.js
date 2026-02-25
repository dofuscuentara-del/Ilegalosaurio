
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

// Mostrar overlay al abrir página y ocultar rápido
window.addEventListener("load", () => {
  showLoading();
  setTimeout(() => hideLoading(), 500); // 0.5s
});

// Ocultar overlay si la página se carga desde cache/back-forward
window.addEventListener("pageshow", () => {
  hideLoading();
});

// Interceptar todos los botones para mostrar overlay
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    showLoading();
  });
});

// Interceptar fetch globalmente para mostrar overlay automáticamente
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  showLoading();
  try {
    const res = await originalFetch(...args);
    hideLoading();
    return res;
  } catch (err) {
    hideLoading();
    throw err;
  }
};
