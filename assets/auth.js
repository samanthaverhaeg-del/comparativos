/* Autenticação compartilhada — Qive Comparativos
   Inclua no <head> de TODA página do repositório:
   <link rel="stylesheet" href="/comparativos/assets/auth.css">
   <script src="/comparativos/assets/auth.js"></script>

   A senha fica salva no localStorage do domínio samanthaverhaeg-del.github.io,
   por isso funciona automaticamente em qualquer página/pasta deste repo
   (e não interfere em outros repositórios, pois a chave é específica). */
(function () {
  var CORRECT_PIN = "478569";
  var STORAGE_KEY = "comparativos_auth";

  // Esconde o conteúdo imediatamente para evitar "flash" antes de checar a senha.
  document.write('<style id="auth-hide-style">body{visibility:hidden;}</style>');

  function reveal() {
    var s = document.getElementById("auth-hide-style");
    if (s) s.parentNode.removeChild(s);
  }

  function buildLockScreen() {
    var overlay = document.createElement("div");
    overlay.id = "lock-screen";
    overlay.style.visibility = "visible";
    overlay.innerHTML =
      '<div class="lock-box">' +
      '<div class="lock-tail"></div>' +
      '<div class="lock-title">Comparativos</div>' +
      '<div class="lock-subtitle">Acesso restrito &mdash; digite a senha</div>' +
      '<input type="password" id="lock-input" maxlength="10" inputmode="numeric" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022" autofocus>' +
      '<button id="lock-submit">Entrar</button>' +
      '<div id="lock-error">Senha incorreta. Tente novamente.</div>' +
      "</div>";
    document.body.appendChild(overlay);

    var input = document.getElementById("lock-input");
    var submit = document.getElementById("lock-submit");
    var errorMsg = document.getElementById("lock-error");

    function tryUnlock() {
      if (input.value === CORRECT_PIN) {
        localStorage.setItem(STORAGE_KEY, "true");
        overlay.parentNode.removeChild(overlay);
        reveal();
      } else {
        errorMsg.style.display = "block";
        input.value = "";
        input.focus();
      }
    }

    submit.addEventListener("click", tryUnlock);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") tryUnlock();
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      reveal();
      return;
    }
    buildLockScreen();
  });
})();
