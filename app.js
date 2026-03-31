/* ============================
   PROJETO: SIMULADOR DE PEDIDO
   Objetos • Arrays • Funções
   Repetição • Condicional 
   GRUPO 5:
      ANDREA SUGIMOTO
      GENIEL 
      RENATO VIEIRA
      FRAN GIUNCO
      JANNE MARY
   ============================ */

/* ---------- TAREFA 1 ----------
   Array "cardapio" com objetos: id, nome, preco
-------------------------------- */
const cardapio = [
  { id: 1, nome: "Hambúrguer Veggie", preco: 22.90, categoria: "lanche", disponivel: true },
  { id: 2, nome: "Cheeseburger Artesanal", preco: 26.50, categoria: "lanche", disponivel: true },
  { id: 3, nome: "Batata Rústica", preco: 14.90, categoria: "lanche", disponivel: true },
  { id: 4, nome: "Refrigerante Lata", preco: 6.50, categoria: "bebida", disponivel: true },
  { id: 5, nome: "Suco Natural", preco: 9.90, categoria: "bebida", disponivel: true },
  { id: 6, nome: "Milkshake", preco: 16.90, categoria: "bebida", disponivel: true },
  { id: 7, nome: "Brownie com Calda", preco: 12.90, categoria: "sobremesa", disponivel: true },
  { id: 8, nome: "Sorvete 2 bolas", preco: 10.00, categoria: "sobremesa", disponivel: false }, // exemplo de indisponível
];

/* ---------- TAREFA 3 ----------
   Carrinho como array vazio
-------------------------------- */
let carrinho = [];

/* ---------- CONFIG CUPOM ----------
   CUMPOM10: R$10 off
   FRETE0: R$8 off acima de R$40
------------------------------------- */
const CUPONS_VALIDOS = ["VERDE10", "FRETE0"];
let cupomAplicado = null; // null | "VERDE10" | "FRETE0"

/* ---------- HELPERS ---------- */
const moeda = (valor) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

function getEl(id) {
  return document.getElementById(id);
}

/* ============================
   TAREFA 2: Exibir Cardápio
   - usando repetição (forEach)
   - renderiza na tela (HTML)
   ============================ */
function exibirCardapio(filtroCategoria = "todos") {
  const lista = getEl("listaCardapio");
  if (!lista) return;

  lista.innerHTML = "";

  const itensFiltrados =
    filtroCategoria === "todos"
      ? cardapio
      : cardapio.filter((p) => p.categoria === filtroCategoria);

  itensFiltrados.forEach((produto) => {
    const div = document.createElement("div");
    div.className = "item";

    div.innerHTML = `
      <div class="item__top">
        <div>
          <p class="item__name">${produto.nome}</p>
          <div class="item__meta">
            <span class="badge">${produto.categoria.toUpperCase()}</span>
          </div>
        </div>
        <div class="item__price">${moeda(produto.preco)}</div>
      </div>

      <div class="item__actions">
        <button class="btn ${produto.disponivel ? "btn--primary" : ""}"
          type="button"
          data-add="${produto.id}"
          ${produto.disponivel ? "" : "disabled"}
          aria-label="Adicionar ${produto.nome} ao carrinho">
          ${produto.disponivel ? "Adicionar" : "Indisponível"}
        </button>
      </div>
    `;

    lista.appendChild(div);
  });

  // eventos dos botões adicionar
  lista.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-add"));
      adicionarAoCarrinho(id);
    });
  });
}

/* ============================
   Adicionar ao carrinho
   ============================ */
function adicionarAoCarrinho(id) {
  const produto = cardapio.find((p) => p.id === id);

  if (!produto) {
    setMensagem("Este produto não existe!", true);
    return;
  }

  if (!produto.disponivel) {
    setMensagem("Este item está indisponível no momento.", true);
    return;
  }

  carrinho.push(produto);
  setMensagem(`${produto.nome} foi adicionado ao carrinho ✅`, false);

  renderCarrinho();
  atualizarResumo();
}

/* ============================
   Carrinho (render + remover)
   ============================ */
function renderCarrinho() {
  const area = getEl("cartItens");
  if (!area) return;

  if (carrinho.length === 0) {
    area.innerHTML = `<div class="cartEmpty">Carrinho vazio. Adicione itens do cardápio.</div>`;
    return;
  }

  area.innerHTML = "";

  carrinho.forEach((produto, index) => {
    const item = document.createElement("div");
    item.className = "cartItem";

    item.innerHTML = `
      <div class="cartItem__row">
        <div>
          <div class="cartItem__name">${produto.nome}</div>
          <div class="cartItem__meta">${produto.categoria.toUpperCase()} • ${moeda(produto.preco)}</div>
        </div>
        <button class="btn btn--ghost" type="button" data-remove="${index}">
          Remover
        </button>
      </div>
    `;

    area.appendChild(item);
  });

  area.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.getAttribute("data-remove"));
      removerDoCarrinho(idx);
    });
  });
}

function removerDoCarrinho(indice) {
  if (indice < 0 || indice >= carrinho.length) return;

  const removido = carrinho.splice(indice, 1)[0];
  setMensagem(`Removido: ${removido.nome}`, false);

  renderCarrinho();
  atualizarResumo();
}

/* ============================
   Subtotal
   ============================ */
function calcularSubtotal() {
  let subtotal = 0;
  for (let i = 0; i < carrinho.length; i++) {
    subtotal += carrinho[i].preco;
  }
  return subtotal;
}

/* ============================
   Desconto:
   - automático 10% se subtotal >= 50
   - CUMPOM10: -10
   - FRETE0: -8 se subtotal >= 40 (senão não aplica)
   ============================ */
function calcularDesconto(subtotal) {
  let desconto = 0;

  //  automático
  if (subtotal >= 50) {
    desconto += subtotal * 0.10;
  }

  //  cupom por tipo
  if (cupomAplicado === "VERDE10" && subtotal > 25) {
    desconto += 10;
  } else if (cupomAplicado === "FRETE0") {
    if (subtotal >= 40) {
      desconto += 8;
    } else {
      // não aplica desconto do FRETE0 se não cumprir regra
      // mensagem opcional (não trava o cálculo)
      setMensagem("Cupom FRETE0 só é válido para pedidos acima de R$40.", true);
      setMensagem("Cupom VERDE10 só é válido para pedidos acima de R$50.", true);
    }
  }

  // segurança
  if (desconto > subtotal) desconto = subtotal;

  return desconto;
}

/* ============================
   Atualiza totais na UI
   ============================ */
function atualizarResumo() {
  const subtotal = calcularSubtotal();
  const desconto = calcularDesconto(subtotal);
  const totalFinal = subtotal - desconto;

  const elSubtotal = getEl("subtotalTxt");
  const elDesconto = getEl("descontoTxt");
  const elTotal = getEl("totalTxt");
  const elTopo = getEl("cartTotalTop");

  if (elSubtotal) elSubtotal.textContent = moeda(subtotal);
  if (elDesconto) elDesconto.textContent = moeda(desconto);
  if (elTotal) elTotal.textContent = moeda(totalFinal);
  if (elTopo) elTopo.textContent = moeda(totalFinal);

  const statItens = getEl("statItens");
  const statSubtotal = getEl("statSubtotal");
  const statDesconto = getEl("statDesconto");
  const statTotal = getEl("statTotal");

  if (statItens) statItens.textContent = String(carrinho.length);
  if (statSubtotal) statSubtotal.textContent = moeda(subtotal);
  if (statDesconto) statDesconto.textContent = moeda(desconto);
  if (statTotal) statTotal.textContent = moeda(totalFinal);
}

/* ============================
   Cupom (aplicar)
   ============================ */
function aplicarCupom() {
  const input = getEl("cupomInput");
  if (!input) return;

  const codigo = String(input.value || "").trim().toUpperCase();
  const subtotal = calcularSubtotal();

  // limpa mensagem antes de validar
  setMensagem("", false);

  if (!codigo) {
    setMensagem("Digite um cupom para aplicar.", true);
    return;
  }

  //  valida se está na lista de cupons
  if (!CUPONS_VALIDOS.includes(codigo)) {
    cupomAplicado = null;
    setMensagem("Cupom inválido. Use: VERDE10 ou FRETE0", true);
    atualizarResumo();
    return;
  }

  // regra opcional: só permite cupom se tiver algo no carrinho
  if (subtotal <= 25 && codigo === "VERDE10") {
    cupomAplicado = null;
    setMensagem("Cupom VERDE10 só é válido para pedidos acima de R$25,00.", true);
    
    atualizarResumo();
    return;
  }

  // valida regra do FRETE0
  if (codigo === "FRETE0" && subtotal < 40) {
    cupomAplicado = null;
    setMensagem("FRETE0 exige subtotal mínimo de R$ 40,00.", true);
    atualizarResumo();
    return;
  }

  // aplica cupom
  cupomAplicado = codigo;

  if (codigo === "VERDE10") {
    setMensagem("Cupom VERDE10 aplicado: -R$10 ", false);
  } else {
    setMensagem("Cupom FRETE0 aplicado: -R$8 ", false);
  }

  atualizarResumo();
}

/* ============================
   Recibo
   ============================ */
function gerarRecibo() {
  const reciboEl = getEl("recibo");
  if (!reciboEl) return;

  if (carrinho.length === 0) {
    reciboEl.textContent = "Carrinho vazio. Adicione itens para gerar recibo.";
    return;
  }

  const subtotal = calcularSubtotal();
  const desconto = calcularDesconto(subtotal);
  const totalFinal = subtotal - desconto;

  const agora = new Date().toLocaleString("pt-BR");

  let texto = "";
  texto += "RESUMO DO PEDIDO\n";
  texto += "============================\n";
  texto += `Data: ${agora}\n`;
  texto += "----------------------------\n";

  carrinho.forEach((p) => {
    texto += `• ${p.nome} (${moeda(p.preco)})\n`;
  });

  texto += "----------------------------\n";
  texto += `Subtotal:  ${moeda(subtotal)}\n`;
  texto += `Desconto:  -${moeda(desconto)}${cupomAplicado ? ` (${cupomAplicado})` : ""}\n`;
  texto += `TOTAL:     ${moeda(totalFinal)}\n`;
  texto += "============================\n";

  reciboEl.textContent = texto;
}

/* ============================
   Mensagem na tela (#cupomMsg)
   ============================ */
function setMensagem(msg, erro) {
  const elMsg = getEl("cupomMsg");
  if (!elMsg) return;

  elMsg.textContent = msg || "";
  elMsg.style.color = erro ? "rgba(255,170,170,.95)" : "var(--c-3)";
}

/* ============================
   Eventos
   ============================ */
document.addEventListener("DOMContentLoaded", () => {
  exibirCardapio("todos");
  renderCarrinho();
  atualizarResumo();

  // filtro por chips (se existir no seu HTML)
  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-selected"));
      chip.classList.add("is-selected");
      exibirCardapio(chip.dataset.filter || "todos");
    });
  });

  // aplicar cupom
  const btnCupom = getEl("btnAplicarCupom");
  if (btnCupom) btnCupom.addEventListener("click", aplicarCupom);

  const inputCupom = getEl("cupomInput");
  if (inputCupom) {
    inputCupom.addEventListener("keydown", (e) => {
      if (e.key === "Enter") aplicarCupom();
    });
  }

  // finalizar (recibo)
  const btnFinalizar = getEl("btnFinalizar");
  if (btnFinalizar) btnFinalizar.addEventListener("click", gerarRecibo);

  // limpar carrinho
  const btnLimpar = getEl("btnLimpar");
  if (btnLimpar) {
    btnLimpar.addEventListener("click", () => {
      carrinho = [];
      cupomAplicado = null;

      if (inputCupom) inputCupom.value = "";
      setMensagem("", false);

      renderCarrinho();
      atualizarResumo();

      const reciboEl = getEl("recibo");
      if (reciboEl) reciboEl.textContent = "Seu recibo aparecerá aqui…";
    });
  }
});
