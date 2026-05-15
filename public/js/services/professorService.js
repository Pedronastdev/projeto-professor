import { request } from "./api.js";

export const professorService = {
  buscar(nome, materia) {
    return request(
      `/professor?nome=${encodeURIComponent(
        nome
      )}&materia=${encodeURIComponent(materia)}`
    );
  },

  listar() {
    return request("/professor/todos");
  },

  criar(data) {
    return request("/professor", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  atualizar(data) {
    return request("/professor", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deletar(data) {
    return request("/professor", {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  },
};