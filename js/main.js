// main.js atualizado completo com todas as funções

import initI18n from './i18n.js';

const loadHtmlPartials = async () => {
  const headerElement = document.getElementById('main-header');
  const footerElement = document.getElementById('main-footer');

  if (headerElement) {
    try {
      const response = await fetch('partials/header.html');
      headerElement.innerHTML = await response.text();
    } catch (error) {
      console.error('Failed to load header:', error);
      headerElement.innerHTML = '<p class="text-center text-red-500">Error loading header</p>';
    }
  }

  if (footerElement) {
    try {
      const response = await fetch('partials/footer.html');
      footerElement.innerHTML = await response.text();
    } catch (error) {
      console.error('Failed to load footer:', error);
      footerElement.innerHTML = '<p class="text-center text-red-500">Error loading footer</p>';
    }
  }
};

const initializePage = async () => {
  await loadHtmlPartials();
  await initI18n();
  lucide.createIcons();
};

initializePage();

// Funções do dashboard automatizado

let totalProdutos = 0;
const limiteGratis = 5;
const historicoExtrato = [];
const produtosBase = {};

function atualizarLucro() {
  const vendas = parseFloat(document.getElementById('vendas').value);
  const lucro = vendas * 0.4;
  document.getElementById('lucro').value = isNaN(lucro) ? '' : lucro.toFixed(2);
}

function adicionarProduto() {
  if (totalProdutos >= limiteGratis) {
    document.getElementById('limiteAviso').innerText = 'Limite de 5 produtos atingido no plano gratuito. Atualize para o Plano Pro ou Ultra para continuar adicionando.';
    return;
  }
  const produto = document.getElementById('produto').value;
  const custo = parseFloat(document.getElementById('custo').value);
  const venda = parseFloat(document.getElementById('venda').value);
  const qtd = parseInt(document.getElementById('quantidade').value);
  if (!produto || isNaN(custo) || isNaN(venda) || isNaN(qtd)) return;
  const lucro = (venda - custo) * qtd;
  const novaLinha = `<tr class="highlight"><td>${produto}</td><td>${custo}</td><td>${venda}</td><td>${qtd}</td><td><strong>${lucro} Kz</strong></td></tr>`;
  document.getElementById('tabelaInventario').insertAdjacentHTML('beforeend', novaLinha);
  historicoExtrato.push(`Produto: ${produto}, Custo: ${custo}, Venda: ${venda}, Qtd: ${qtd}, Lucro: ${lucro} Kz`);
  produtosBase[produto] = { custo, venda };
  atualizarDropdownProdutos();
  totalProdutos++;
  document.getElementById('produto').value = '';
  document.getElementById('custo').value = '';
  document.getElementById('venda').value = '';
  document.getElementById('quantidade').value = '';
}

function atualizarDropdownProdutos() {
  const dropdown = document.getElementById('produtoSelecionado');
  dropdown.innerHTML = '<option value="">Selecione um produto</option>';
  for (const nome in produtosBase) {
    dropdown.innerHTML += `<option value="${nome}">${nome}</option>`;
  }
}

function gerarFatura() {
  const empresa = document.getElementById('nomeEmpresa').value;
  const cliente = document.getElementById('nomeCliente').value;
  const data = document.getElementById('dataFatura').value;
  const produto = document.getElementById('produtoSelecionado').value;
  const qtd = parseInt(document.getElementById('quantidadeFatura').value);
  if (!produto || !qtd || !empresa || !cliente || !data) return alert('Preencha todos os campos');
  const preco = produtosBase[produto]?.venda || 0;
  const total = preco * qtd;
  const fatura = `FATURA\nEmpresa: ${empresa}\nCliente: ${cliente}\nData: ${data}\nProduto: ${produto}\nQtd: ${qtd}\nTotal: ${total} Kz`;
  const blob = new Blob([fatura], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fatura_${cliente}_${data}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function baixarExtrato() {
  const blob = new Blob([historicoExtrato.join("\n")], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'extrato_hora_pro.txt';
  a.click();
  URL.revokeObjectURL(url);
}

function inicializarGrafico() {
  new Chart(document.getElementById('salesChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Vendas (Kz)',
        data: [1200, 1500, 1800, 2200, 3000, 3500],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true
      }]
    }
  });
}

document.addEventListener('DOMContentLoaded', inicializarGrafico);
