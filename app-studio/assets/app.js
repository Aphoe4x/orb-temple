/* Contact form: validate + submit via fetch, with graceful fallback. */
(function () {
  "use strict";

  const form = document.getElementById("contactForm");
  if (!form) return;

  const statusBox = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const rules = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
    email: (v) => (emailRe.test(v.trim()) ? "" : "Please enter a valid email."),
    message: (v) => (v.trim().length >= 10 ? "" : "Please describe your project (at least 10 characters)."),
  };

  function setFieldError(field, msg) {
    const errEl = document.querySelector(`.field__error[data-for="${field}"]`);
    const input = form.elements[field];
    if (errEl) errEl.textContent = msg || "";
    if (input) input.classList.toggle("invalid", Boolean(msg));
  }

  function validate() {
    let firstBad = null;
    let valid = true;
    for (const field in rules) {
      const msg = rules[field](form.elements[field] ? form.elements[field].value : "");
      setFieldError(field, msg);
      if (msg) {
        valid = false;
        if (!firstBad) firstBad = form.elements[field];
      }
    }
    if (firstBad) firstBad.focus();
    return valid;
  }

  // Clear a field's error as the user types.
  for (const field in rules) {
    const input = form.elements[field];
    if (input) input.addEventListener("input", () => setFieldError(field, ""));
  }

  function showStatus(kind, html) {
    statusBox.className = "form__status" + (kind ? " form__status--" + kind : "");
    statusBox.innerHTML = html;
  }

  form.addEventListener("submit", async function (event) {
    if (!validate()) {
      showStatus("err", "Please fix the highlighted fields.");
      return;
    }

    event.preventDefault();
    submitBtn.disabled = true;
    const original = submitBtn.textContent;
    submitBtn.textContent = "Sending…";
    showStatus("", "");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { "X-Requested-With": "XMLHttpRequest" },
      });
      const data = await response.json();

      if (data.ok) {
        form.reset();
        showStatus("ok", "✅ " + data.message);
      } else {
        if (data.errors) {
          for (const field in data.errors) {
            if (rules[field] !== undefined) setFieldError(field, data.errors[field]);
          }
        }
        showStatus("err", "⚠️ " + (data.message || "Something went wrong."));
      }
    } catch (err) {
      showStatus("err", "⚠️ Network error. Please check your connection and try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });
})();
