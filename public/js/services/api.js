const BASE_URL = "http://localhost:3000";

export async function request(url, options = {}) {

  const response = await fetch(url, {

    headers: {
      "Content-Type": "application/json",
    },

    ...options,
  });

  const data =
    await response.json();

  if (!response.ok) {

    return {
      error: true,

      message:
        data.mensagem ||
        "Erro na requisição",
    };
  }

  return data;
}