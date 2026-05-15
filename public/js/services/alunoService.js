import { request }
from "./api.js";

export const alunoService = {

  criar(aluno) {

    return request("/aluno", {
      method: "POST",
      body: JSON.stringify(aluno),
    });
  },

  atualizar(id, data) {

  return request(
    `/aluno/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
},

  deletar(id) {

    return request(`/aluno/${id}`, {
      method: "DELETE",
    });
  },
};