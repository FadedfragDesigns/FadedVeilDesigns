/* Contact form validation + submission handling for contactpage.html */
(function () {
  'use strict';

  const form = document.getElementById('wp-contact-form');
  if (!form) return;

  const status = document.getElementById('wp-contact-status');
  const submitBtn = form.querySelector('.wp-contact-submit');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validation rules per field name. Each returns an error string, or '' when valid.
  const rules = {
    name: (v) => (v.trim() ? '' : 'Please enter your name.'),
    email: (v) => {
      if (!v.trim()) return 'Please enter your email.';
      return EMAIL_RE.test(v.trim()) ? '' : 'Please enter a valid email address.';
    },
    subject: (v) => (v ? '' : 'Please pick a subject.'),
    message: (v) => {
      const t = v.trim();
      if (!t) return 'Please write a message.';
      return t.length < 10 ? 'Message should be at least 10 characters.' : '';
    }
  };

  function fieldEl(name) {
    return form.elements[name];
  }

  function errorEl(name) {
    return form.querySelector('[data-error-for="' + name + '"]');
  }

  function showError(name, msg) {
    const input = fieldEl(name);
    const slot = errorEl(name);
    if (slot) slot.textContent = msg;
    if (input) input.classList.toggle('wp-input--invalid', Boolean(msg));
  }

  // Validate a single field; returns true when valid.
  function validateField(name) {
    const input = fieldEl(name);
    if (!input || !rules[name]) return true;
    const msg = rules[name](input.value);
    showError(name, msg);
    return !msg;
  }

  // Clear an error as soon as the user fixes the field.
  Object.keys(rules).forEach((name) => {
    const input = fieldEl(name);
    if (!input) return;
    input.addEventListener('input', () => {
      if (input.classList.contains('wp-input--invalid')) validateField(name);
    });
    input.addEventListener('blur', () => validateField(name));
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const results = Object.keys(rules).map(validateField);
    const allValid = results.every(Boolean);

    if (!allValid) {
      status.textContent = '';
      const firstInvalid = form.querySelector('.wp-input--invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // No backend here — simulate an async send so the UX is complete.
    submitBtn.disabled = true;
    status.className = 'wp-contact-status';
    status.textContent = 'Sending…';

    const data = {
      name: fieldEl('name').value.trim(),
      email: fieldEl('email').value.trim(),
      subject: fieldEl('subject').value,
      message: fieldEl('message').value.trim()
    };

    setTimeout(function () {
      // Replace this block with a real fetch() to your endpoint when available.
      console.log('Contact form submission:', data);

      form.reset();
      submitBtn.disabled = false;
      status.className = 'wp-contact-status wp-contact-status--ok';
      status.textContent = 'Thanks, ' + data.name + '! Your message has been sent.';
    }, 900);
  });
})();
