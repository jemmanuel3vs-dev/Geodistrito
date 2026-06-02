
function showMessage(
  message,
  type = 'info'
) {

  const existing =
    document.querySelector(
      '.custom-message'
    );

  if (existing) {
    existing.remove();
  }

  const div =
    document.createElement('div');

  div.className =
    `custom-message ${type}`;

  div.textContent =
    message;

  document.body.appendChild(div);

  setTimeout(() => {
    div.classList.add('show');
  }, 10);

  setTimeout(() => {

    div.classList.remove('show');

    setTimeout(() => {
      div.remove();
    }, 300);

  }, 3000);

}

export function showError(
  message
) {

  showMessage(
    message,
    'error'
  );

}

export function showSuccess(
  message
) {

  showMessage(
    message,
    'success'
  );

}

export function showInfo(
  message
) {

  showMessage(
    message,
    'info'
  );

}
