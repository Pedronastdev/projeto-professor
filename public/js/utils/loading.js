export function setLoading(
  button,
  loading = true
) {

  if (loading) {

    button.disabled = true;

    button.dataset.original =
      button.innerHTML;

    button.innerHTML =
      "Carregando...";

  } else {

    button.disabled = false;

    button.innerHTML =
      button.dataset.original;
  }
}