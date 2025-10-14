const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class HcrEquipamentosMedicosService {
  // Função utilitária para calcular valor atual
  calcularValorAtual(valorCompra, dataCompra, taxaDepreciacao) {
    if (!valorCompra || !dataCompra || !taxaDepreciacao) return null;
    const hoje = new Date();
    const anos = (hoje - new Date(dataCompra)) / (1000 * 60 * 60 * 24 * 365.25);
    let valorAtual = valorCompra * (1 - taxaDepreciacao * anos);
    return valorAtual > 0 ? valorAtual : 0;
  }

  async criar(data) {
    const dadosParaCriar = { ...data };

    // Conversões numéricas
    if (dadosParaCriar.valorCompra) dadosParaCriar.valorCompra = parseFloat(dadosParaCriar.valorCompra);
    if (dadosParaCriar.setorId) dadosParaCriar.setorId = parseInt(dadosParaCriar.setorId, 10);
    if (dadosParaCriar.localizacaoId) dadosParaCriar.localizacaoId = parseInt(dadosParaCriar.localizacaoId, 10);
    if (dadosParaCriar.tipoEquipamentoId) dadosParaCriar.tipoEquipamentoId = parseInt(dadosParaCriar.tipoEquipamentoId, 10);

    // Datas
    dadosParaCriar.dataCompra = data.dataCompra ? new Date(data.dataCompra) : null;
    dadosParaCriar.inicioGarantia = data.inicioGarantia ? new Date(data.inicioGarantia) : null;
    dadosParaCriar.terminoGarantia = data.terminoGarantia ? new Date(data.terminoGarantia) : null;

    // Arquivos
    dadosParaCriar.arquivos = data.arquivos || [];

    // Buscar taxa de depreciação do TipoEquipamento
    let taxa = null;
    if (dadosParaCriar.tipoEquipamentoId) {
      const tipo = await prisma.tipoEquipamento.findUnique({ where: { id: dadosParaCriar.tipoEquipamentoId } });
      taxa = tipo?.taxaDepreciacao;
    }

    if (taxa && dadosParaCriar.valorCompra && dadosParaCriar.dataCompra) {
      dadosParaCriar.valorAtual = this.calcularValorAtual(dadosParaCriar.valorCompra, dadosParaCriar.dataCompra, taxa);
    }

    return await prisma.hcrEquipamentosMedicos.create({ data: dadosParaCriar });
  }

  async listar(filtros = {}) {
  const where = {};
  
  // Filtro por setor
  if (filtros.setorId) {
    where.setorId = parseInt(filtros.setorId);
  }
  
  // Filtro por localização
  if (filtros.localizacaoId) {
    where.localizacaoId = parseInt(filtros.localizacaoId);
  }
  
  // Filtro por tipo de equipamento
  if (filtros.tipoEquipamentoId) {
    where.tipoEquipamentoId = parseInt(filtros.tipoEquipamentoId);
  }

  console.log('Filtros aplicados:', where); // 👈 Debug

  const equipamentos = await prisma.hcrEquipamentosMedicos.findMany({
    where, // 👈 IMPORTANTE: o where precisa estar aqui
    include: { 
      setor: true, 
      localizacao: true, 
      tipoEquipamento: true, 
      ordensServico: true 
    },
  });

  return equipamentos.map(eq => {
    if (eq.tipoEquipamento?.taxaDepreciacao && eq.valorCompra && eq.dataCompra) {
      eq.valorAtual = this.calcularValorAtual(
        eq.valorCompra, 
        eq.dataCompra, 
        eq.tipoEquipamento.taxaDepreciacao
      );
    }
    return eq;
  });
}

  async listarPorTipo(tipoEquipamentoId) {
    const equipamentos = await prisma.hcrEquipamentosMedicos.findMany({
      where: { tipoEquipamentoId },
      include: { setor: true, localizacao: true, tipoEquipamento: true, ordensServico: true },
    });

    return equipamentos.map(eq => {
      if (eq.tipoEquipamento?.taxaDepreciacao && eq.valorCompra && eq.dataCompra) {
        eq.valorAtual = this.calcularValorAtual(eq.valorCompra, eq.dataCompra, eq.tipoEquipamento.taxaDepreciacao);
      }
      return eq;
    });
  }
  async buscarPorNumeroPatrimonio(numeroPatrimonio) {
  if (!numeroPatrimonio) return [];

  const equipamentos = await prisma.hcrEquipamentosMedicos.findMany({
    where: { numeroPatrimonio },
    include: { setor: true, localizacao: true, tipoEquipamento: true, ordensServico: true },
  });

  // Calcular valorAtual para cada um
  return equipamentos.map(eq => {
    if (eq?.tipoEquipamento?.taxaDepreciacao && eq.valorCompra && eq.dataCompra) {
      eq.valorAtual = this.calcularValorAtual(
        eq.valorCompra,
        eq.dataCompra,
        eq.tipoEquipamento.taxaDepreciacao
      );
    }
    return eq;
  });
}

  async buscarPorId(id) {
    const eq = await prisma.hcrEquipamentosMedicos.findUnique({
      where: { id: Number(id) },
      include: { setor: true, localizacao: true, tipoEquipamento: true, ordensServico: true },
    });

    if (eq?.tipoEquipamento?.taxaDepreciacao && eq.valorCompra && eq.dataCompra) {
      eq.valorAtual = this.calcularValorAtual(eq.valorCompra, eq.dataCompra, eq.tipoEquipamento.taxaDepreciacao);
    }

    return eq;
  }

  async atualizar(id, data) {
    const equipamentoAtual = await prisma.hcrEquipamentosMedicos.findUnique({ where: { id: Number(id) } });
    const arquivosAtuais = equipamentoAtual?.arquivos || [];
    const arquivosCombinados = [...arquivosAtuais, ...(data.arquivos || [])];

    let dadosParaAtualizar = {
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
      dataCompra: data.dataCompra ? new Date(data.dataCompra) : null,
      inicioGarantia: data.inicioGarantia ? new Date(data.inicioGarantia) : null,
      terminoGarantia: data.terminoGarantia ? new Date(data.terminoGarantia) : null,
      setorId: data.setorId ? parseInt(data.setorId, 10) : null,
      localizacaoId: data.localizacaoId ? parseInt(data.localizacaoId, 10) : null,
      tipoEquipamentoId: data.tipoEquipamentoId ? parseInt(data.tipoEquipamentoId, 10) : null,
      arquivos: arquivosCombinados,
    };

    // Recalcular valorAtual
    if (dadosParaAtualizar.tipoEquipamentoId && dadosParaAtualizar.valorCompra && dadosParaAtualizar.dataCompra) {
      const tipo = await prisma.tipoEquipamento.findUnique({ where: { id: dadosParaAtualizar.tipoEquipamentoId } });
      if (tipo?.taxaDepreciacao) {
        dadosParaAtualizar.valorAtual = this.calcularValorAtual(dadosParaAtualizar.valorCompra, dadosParaAtualizar.dataCompra, tipo.taxaDepreciacao);
      }
    }

    return await prisma.hcrEquipamentosMedicos.update({
      where: { id: Number(id) },
      data: dadosParaAtualizar,
    });
  }

  async deletar(id) {
    return await prisma.hcrEquipamentosMedicos.delete({ where: { id: Number(id) } });
  }
}

module.exports = new HcrEquipamentosMedicosService();
