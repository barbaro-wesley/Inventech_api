const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class HcrEquipamentosMedicosService {
  async criar(data) {
    const dadosParaCriar = { ...data };

    // Conversões numéricas
    if (dadosParaCriar.valorCompra) {
      dadosParaCriar.valorCompra = parseFloat(dadosParaCriar.valorCompra);
    }
    if (dadosParaCriar.valorAtual) {
      dadosParaCriar.valorAtual = parseFloat(dadosParaCriar.valorAtual);
    }
    if (dadosParaCriar.taxaDepreciacao) {
      dadosParaCriar.taxaDepreciacao = parseFloat(dadosParaCriar.taxaDepreciacao);
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

    // Datas
    dadosParaCriar.dataCompra = data.dataCompra ? new Date(data.dataCompra) : null;
    dadosParaCriar.inicioGarantia = data.inicioGarantia ? new Date(data.inicioGarantia) : null;
    dadosParaCriar.terminoGarantia = data.terminoGarantia ? new Date(data.terminoGarantia) : null;

    // Arquivos
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
        ordensServico: true,
      },
    });
  }
async listarPorTipo(tipoEquipamentoId) {
  return prisma.hcrEquipamentosMedicos.findMany({
    where: {
      tipoEquipamentoId, // agora filtrando pelo campo correto
    },
    include: {
      setor: true,
      localizacao: true,
      tipoEquipamento: true,
      ordensServico: true
    }
  });
}
  async buscarPorId(id) {
    return await prisma.hcrEquipamentosMedicos.findUnique({
      where: { id: Number(id) },
      include: {
        setor: true,
        localizacao: true,
        tipoEquipamento: true,
        ordensServico: true,
      },
    });
  }

  async atualizar(id, data) {
    const equipamentoAtual = await prisma.hcrEquipamentosMedicos.findUnique({
      where: { id: Number(id) },
    });

    const arquivosAtuais = equipamentoAtual?.arquivos || [];
    const arquivosCombinados = [...arquivosAtuais, ...(data.arquivos || [])];

    return await prisma.hcrEquipamentosMedicos.update({
      where: { id: Number(id) },
      data: {
        numeroPatrimonio: data.numeroPatrimonio,
        numeroSerie: data.numeroSerie,
        numeroAnvisa: data.numeroAnvisa,
        nomeEquipamento: data.nomeEquipamento,
        modelo: data.modelo,
        marca: data.marca,
        fabricante: data.fabricante,
        identificacao: data.identificacao,
        ip: data.ip,
        sistemaOperacional: data.sistemaOperacional,
        nControle: data.nControle,
        BTUS: data.BTUS,
        estado: data.estado,
        notaFiscal: data.notaFiscal,
        obs: data.obs,

        valorCompra: data.valorCompra ? parseFloat(data.valorCompra) : null,
        valorAtual: data.valorAtual ? parseFloat(data.valorAtual) : null,
        taxaDepreciacao: data.taxaDepreciacao ? parseFloat(data.taxaDepreciacao) : null,

        dataCompra: data.dataCompra ? new Date(data.dataCompra) : null,
        inicioGarantia: data.inicioGarantia ? new Date(data.inicioGarantia) : null,
        terminoGarantia: data.terminoGarantia ? new Date(data.terminoGarantia) : null,

        setorId: data.setorId ? parseInt(data.setorId, 10) : null,
        localizacaoId: data.localizacaoId ? parseInt(data.localizacaoId, 10) : null,
        tipoEquipamentoId: data.tipoEquipamentoId ? parseInt(data.tipoEquipamentoId, 10) : null,

        arquivos: arquivosCombinados,
      },
    });
  }

  async deletar(id) {
    return await prisma.hcrEquipamentosMedicos.delete({
      where: { id: Number(id) },
    });
  }
}

module.exports = new HcrEquipamentosMedicosService();
