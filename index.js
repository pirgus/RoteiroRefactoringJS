const { readFileSync } = require('fs');

function getPeca(apresentacao, pecas){
  return pecas[apresentacao.id];
}

// funcao credito extraida
function calcularCredito(apre, pecas){
  let creditos = 0;
  creditos += Math.max(apre.audiencia - 30, 0);
  if(getPeca(apre, pecas).tipo === "comedia")
    creditos += Math.floor(apre.audiencia / 5);

  return creditos;
}

function formatarMoeda(valor){
  return new Intl.NumberFormat("pt-BR",
  {
    style: "currency", currency: "BRL",
    minimumFractionDigits: 2
  }).format(valor/100);
}

function calcularTotalFatura(pecas, apresentacoes){
  let totalFatura = 0;
  for(let apre of apresentacoes){
    totalFatura += calcularTotalApresentacao(apre, pecas);
  }
  return totalFatura;
}

function calcularTotalCreditos(pecas, apresentacoes){
  let totalCreditos = 0;
  for(let apre of apresentacoes){
    totalCreditos += calcularCredito(apre, pecas);
  }

  return totalCreditos;
}

function calcularTotalApresentacao(apre, pecas){
  let total = 0;
  switch(getPeca(apre, pecas).tipo){
    case "tragedia":
      total = 40000;
      if (apre.audiencia > 30) {
        total += 1000 * (apre.audiencia - 30);
      }
      break;
    case "comedia":
      total = 30000;
      if (apre.audiencia > 20) {
         total += 10000 + 500 * (apre.audiencia - 20);
      }
      total += 300 * apre.audiencia;
      break;
    default:
        throw new Error(`Peça desconhecia: ${getPeca(apre, pecas).tipo}`);
  }

  return total;
}

function gerarFaturaStr (fatura, pecas) {
    let totalFatura = 0;
    let creditos = 0;

    let faturaStr = `Fatura ${fatura.cliente}\n`;
    for (let apre of fatura.apresentacoes) {
      faturaStr += `  ${getPeca(apre, pecas).nome}: ${formatarMoeda(calcularTotalApresentacao(apre, pecas))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
    return faturaStr;
  }


const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas);
console.log(faturaStr);
