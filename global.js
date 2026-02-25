// Esperar a que todo el DOM esté cargado
document.addEventListener("DOMContentLoaded", () => {

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

  // Mostrar overlay al cargar la página y ocultar rápido
  showLoading();
  setTimeout(() => hideLoading(), 500); // 0.5s

  // Interceptar todos los botones existentes
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

});
