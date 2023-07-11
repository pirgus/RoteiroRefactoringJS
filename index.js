const { readFileSync } = require('fs');

class ServicoCalculoFatura{
  // funcao credito extraida
  calcularCredito(apre, pecas){
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if(getPeca(apre, pecas).tipo === "comedia")
      creditos += Math.floor(apre.audiencia / 5);
    return creditos;
  }

  calcularTotalFatura(pecas, apresentacoes){
    let totalFatura = 0;
    for(let apre of apresentacoes){
      totalFatura += this.calcularTotalApresentacao(apre, pecas);
    }
    return totalFatura;
  }

  calcularTotalCreditos(pecas, apresentacoes){
    let totalCreditos = 0;
    for(let apre of apresentacoes){
      totalCreditos += this.calcularCredito(apre, pecas);
    }
  
    return totalCreditos;
  }

  calcularTotalApresentacao(apre, pecas){
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
}

function getPeca(apresentacao, pecas){
  return pecas[apresentacao.id];
}

function formatarMoeda(valor){
  return new Intl.NumberFormat("pt-BR",
  {
    style: "currency", currency: "BRL",
    minimumFractionDigits: 2
  }).format(valor/100);
}

const calc = new ServicoCalculoFatura();

function gerarFaturaStr (fatura, pecas, calc) {
    let totalFatura = 0;
    let creditos = 0;

    let faturaStr = `Fatura ${fatura.cliente}\n`;
    let faturaHTML = gerarFaturaHTML(fatura, pecas);
    console.log(faturaHTML);
    for (let apre of fatura.apresentacoes) {
      faturaStr += `  ${getPeca(apre, pecas).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre, pecas))} (${apre.audiencia} assentos)\n`;
    }
    faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
    faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
    return faturaStr;
  }

function gerarFaturaHTML(fatura, pecas){
  let faturaStr = ` <html>\n <p> Fatura ${fatura.cliente} </p>\n <ul>\n`;
  for(let apre of fatura.apresentacoes){
    faturaStr += `<li> ${getPeca(apre, pecas).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre, pecas))} (${apre.audiencia} assentos) </li>\n`;
  }
  faturaStr += `</ul>`;
  faturaStr += `<p> Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))} </p>\n`;
  faturaStr += `<p> Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>\n`;
  faturaStr += `</html>\n`;

  return faturaStr;
}

const faturas = JSON.parse(readFileSync('./faturas.json'));
const pecas = JSON.parse(readFileSync('./pecas.json'));
const faturaStr = gerarFaturaStr(faturas, pecas, calc);
console.log(faturaStr);
