// dashboard.js
const produtos = [];
let vendasTotais = 0;

function atualizarLucro() {
  const vendas = parseFloat(document.getElementById('vendas').value) || 0;
  const lucro = vendas * 0.4;
  document.getElementById('lucro').value = lucro.toFixed(2);
}

function adicionarProduto() {
  if (produtos.length >= 5) {
    document.getElementById('limiteAviso').innerText = 'Limite atingido no plano gratuito. Atualize para o plano Pro para adicionar mais produtos.';
    return;
  }

  const nome = document.getElementById('produto').value;
  const custo = parseFloat(document.getElementById('custo').value);
  const venda = parseFloat(document.getElementById('venda').value);
  const qtd = parseInt(document.getElementById('quantidade').value);
  if (!nome || isNaN(custo) || isNaN(venda) || isNaN(qtd)) return;

  const lucro = (venda - custo) * qtd;
  produtos.push({ nome, custo, venda, qtd, lucro });
  atualizarTabela();
  atualizarSelectProdutos();
  limparCampos();
}

function atualizarTabela() {
  const tabela = document.getElementById('tabelaInventario');
  tabela.innerHTML = '';
  produtos.forEach(p => {
    tabela.innerHTML += `<tr><td>${p.nome}</td><td>${p.custo}</td><td>${p.venda}</td><td>${p.qtd}</td><td>${p.lucro}</td></tr>`;
  });
}

function atualizarSelectProdutos() {
  const select = document.getElementById('produtoSelecionado');
  select.innerHTML = '';
  produtos.forEach((p, i) => {
    select.innerHTML += `<option value="${i}">${p.nome}</option>`;
  });
}

function limparCampos() {
  document.getElementById('produto').value = '';
  document.getElementById('custo').value = '';
  document.getElementById('venda').value = '';
  document.getElementById('quantidade').value = '';
}

function gerarFatura() {
  const empresa = document.getElementById('nomeEmpresa').value;
  const cliente = document.getElementById('nomeCliente').value;
  const data = document.getElementById('dataFatura').value;
  const produtoIndex = document.getElementById('produtoSelecionado').value;
  const qtd = parseInt(document.getElementById('quantidadeFatura').value);
  if (!empresa || !cliente || !data || !qtd || !produtos[produtoIndex]) return;

  const p = produtos[produtoIndex];
  const total = p.venda * qtd;
  const conteudo = `Fatura\nEmpresa: ${empresa}\nCliente: ${cliente}\nData: ${data}\nProduto: ${p.nome}\nQtd: ${qtd}\nTotal: ${total} Kz`;

  const blob = new Blob([conteudo], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Fatura_${cliente}.txt`;
  link.click();
}

function baixarExtrato() {
  const conteudo = produtos.map(p => `${p.nome} | Custo: ${p.custo} | Venda: ${p.venda} | Qtd: ${p.qtd} | Lucro: ${p.lucro}`).join('\n');
  const blob = new Blob([conteudo], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'extrato_dashboard.txt';
  link.click();
}

new Chart(document.getElementById('salesChart'), {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Vendas (Kz)',
      data: [1200, 1500, 1800, 2200, 3000, 3500],
      borderColor: 'blue',
      backgroundColor: 'rgba(0, 119, 204, 0.2)',
      fill: true
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true } }
  }
});
