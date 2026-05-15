export function notify(message, type = "success") {

  const oldNotify =
    document.querySelector(".custom-notify");

  if (oldNotify) {
    oldNotify.remove();
  }

  const div =
    document.createElement("div");

  div.className =
    `custom-notify ${type}`;

  div.innerHTML = `
    <span>${message}</span>
  `;

  document.body.appendChild(div);

  setTimeout(() => {
    div.classList.add("show");
  }, 100);

  setTimeout(() => {
    div.classList.remove("show");

    setTimeout(() => {
      div.remove();
    }, 400);

  }, 3000);
}