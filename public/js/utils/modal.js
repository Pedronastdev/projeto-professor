export function openModal(id) {
  document.getElementById(id).style.display = "block";
  document.body.style.overflow = "hidden";
}

export function closeModal(id) {
  document.getElementById(id).style.display = "none";
  document.body.style.overflow = "auto";
}