const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class HcrEquipamentosMedicosService {
 async criar(data) {

    const dadosParaCriar = { ...data };
    if (dadosParaCriar.valorCompra) {
      dadosParaCriar.valorCompra = parseFloat(dadosParaCriar.valorCompra);
    }
    if (dadosParaCriar.setorId) {
      dadosParaCriar.setorId = parseInt(dadosParaCriar.setorId, 10);
    }
    if (dadosParaCriar.localizacaoId) {
      dadosParaCriar.localizacaoId = parseInt(dadosParaCriar.localizacaoId, 10);
    }
    if (dadosParaCriar.tipoEquipamentoId) {
      dadosParaCriar.tipoEquipamentoId = parseInt(dadosParaCriar.tipoEquipamentoId, 10);
    }
    dadosParaCriar.fabricante = data.fabricante;
    dadosParaCriar.identificacao = data.identificacao;
    dadosParaCriar.dataCompra = data.dataCompra ? new Date(data.dataCompra) : null;
    dadosParaCriar.inicioGarantia = data.inicioGarantia ? new Date(data.inicioGarantia) : null;
    dadosParaCriar.terminoGarantia = data.terminoGarantia ? new Date(data.terminoGarantia) : null;
    dadosParaCriar.arquivos = data.arquivos || [];

    return await prisma.hcrEquipamentosMedicos.create({
      data: dadosParaCriar,
    });
  }

  async listar() {
    return await prisma.hcrEquipamentosMedicos.findMany({
      include: { 
        setor: true, 
        localizacao: true,
        tipoEquipamento: true,
        ordensServico: true
      },
    });
  }

  async buscarPorId(id) {
    return await prisma.hcrEquipamentosMedicos.findUnique({
      where: { id: Number(id) },
      include: { 
        setor: true, 
        localizacao: true,
        tipoEquipamento: true
      },
    });
  }

async atualizar(id, data) {
  const {
    numeroPatrimonio,
    numeroSerie,
    numeroAnvisa,
    nomeEquipamento,
    modelo,
    valorCompra,
    dataCompra,
    inicioGarantia,
    terminoGarantia,
    notaFiscal,
    obs,
    setorId,
    localizacaoId,
    tipoEquipamentoId,
    fabricante,
    identificacao,
    arquivos = []
  } = data;
  const equipamentoAtual = await prisma.hcrEquipamentosMedicos.findUnique({
    where: { id: Number(id) },
  });
  const arquivosAtuais = equipamentoAtual?.arquivos || [];
  const arquivosCombinados = [...arquivosAtuais, ...arquivos];
  return await prisma.hcrEquipamentosMedicos.update({
    where: { id: Number(id) },
    data: {
      numeroPatrimonio,
      numeroSerie,
      numeroAnvisa,
      nomeEquipamento,
      modelo,
      valorCompra: valorCompra ? parseFloat(valorCompra) : null,
      dataCompra: dataCompra ? new Date(dataCompra) : null,
      inicioGarantia: inicioGarantia ? new Date(inicioGarantia) : null,
      terminoGarantia: terminoGarantia ? new Date(terminoGarantia) : null,
      notaFiscal,
      obs,
      setorId: setorId ? parseInt(setorId, 10) : null,
      localizacaoId: localizacaoId ? parseInt(localizacaoId, 10) : null,
      tipoEquipamentoId: tipoEquipamentoId ? parseInt(tipoEquipamentoId, 10) : null,
      fabricante,
      identificacao,
      arquivos: arquivosCombinados, // salva todos arquivos
    }
  });
}

  async deletar(id) {
    return await prisma.hcrEquipamentosMedicos.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = new HcrEquipamentosMedicosService();
