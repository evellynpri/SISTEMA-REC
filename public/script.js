/* Seleciona os elementos HTML utilizados pelo sistema. */
const formulario = document.querySelector("#formulario");
const input = document.querySelector("#tarefa");
const lista = document.querySelector("#lista");
const mensagem = document.querySelector("#mensagem");
const contador = document.querySelector("#contador");
/*variável adicionada por mim para a alteração de comportamento javascript*/
const concluidas = document.querySelector("#concluidas");

/* Pede ao servidor a lista de tarefas e desenha na tela. */
async function carregarTarefas() {
  /* Espera a resposta do servidor e converte o corpo para JSON. */
  const resposta = await fetch("/tarefas");
  const tarefas = await resposta.json();

  /* Limpa a lista antes de desenhar tudo de novo. */
  lista.innerHTML = "";

  /*Contador*/
  let totalConcluidas = 0;

  /* Cria um <li> para cada tarefa recebida do servidor. */
  tarefas.forEach(function (tarefa) {
    const item = document.createElement("li");
    item.textContent = tarefa.texto;

    /* Mostra como concluída se já estiver assim no banco. -- fiz uma alteração aqui para incrementar o contador*/
    if (tarefa.concluida) {
      item.classList.add("concluida");
      totalConcluidas++;
    }

    /* Alterna a tarefa entre normal e concluída, salvando no servidor. */
    item.addEventListener("click", async function () {
      await fetch("/tarefas/" + tarefa.id, { method: "PATCH" });
      carregarTarefas();
    });

    /* Cria o botão de remoção. */
    const botaoRemover = document.createElement("button");
    botaoRemover.textContent = "Remover";

    /* Remove a tarefa no servidor e atualiza a tela. */
    botaoRemover.addEventListener("click", async function (evento) {
      evento.stopPropagation();
      await fetch("/tarefas/" + tarefa.id, { method: "DELETE" });
      carregarTarefas();
    });

    /* Coloca o botão no item e o item na lista. */
    item.appendChild(botaoRemover);
    lista.appendChild(item);
  });

  /* O contador mostra o total de tarefas que vieram do servidor. */
  contador.textContent = tarefas.length;
  
  /*Atualização do contador*/
  concluidas.textContent = totalConcluidas;
}

/* Executa quando o usuário envia o formulário de cadastro. */
formulario.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  /* Lê o texto digitado e remove espaços das extremidades. */
  const texto = input.value.trim();

  /* Não deixa cadastrar tarefa vazia. */
  if (texto === "") {
    mensagem.textContent = "Digite uma tarefa.";
    return;
  }

  /* Envia a nova tarefa para o servidor via POST, em JSON. */
  await fetch("/tarefas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto: texto })
  });

  /* Limpa o campo e busca a lista atualizada do servidor. */
  input.value = "";
  mensagem.textContent = "Tarefa adicionada!";
  carregarTarefas();
});

/* Busca a lista assim que a página abre. */
carregarTarefas();
