// ===== LOADER GLOBAL =====

function showLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.style.display = "flex";
}

function hideLoader() {
  const loader = document.getElementById("globalLoader");
  if (loader) loader.style.display = "none";
}

// ===== INTERCEPTAR TODOS LOS FETCH =====
const originalFetch = window.fetch;

window.fetch = async function () {
  showLoader();
  try {
    const response = await originalFetch.apply(this, arguments);
    return response;
  } finally {
    hideLoader();
  }
};

// ===== MOSTRAR LOADER AL CAMBIAR DE PÁGINA =====
document.addEventListener("click", function (e) {
  const target = e.target.closest("button, a");
  if (target) {
    showLoader();
  }
});
