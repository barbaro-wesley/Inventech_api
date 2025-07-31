const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class HcrEquipamentosMedicosService {
  async criar(data) {
    return await prisma.hcrEquipamentosMedicos.create({
      data: {
        numeroPatrimonio: data.numeroPatrimonio,
        numeroSerie: data.numeroSerie,
        numeroAnvisa: data.numeroAnvisa,
        nomeEquipamento: data.nomeEquipamento,
        modelo: data.modelo,
        valorCompra: data.valorCompra,
        dataCompra: data.dataCompra ? new Date(data.dataCompra) : null,
        inicioGarantia: data.inicioGarantia ? new Date(data.inicioGarantia) : null,
        terminoGarantia: data.terminoGarantia ? new Date(data.terminoGarantia) : null,
        notaFiscal: data.notaFiscal,
        obs: data.obs,
        setorId: data.setorId,
        localizacaoId: data.localizacaoId,
        tipoEquipamentoId: data.tipoEquipamentoId,
        fabricante: data.Fabricante,
        identificacao: data.Identificacao, 
      }
    });
  }

  async listar() {
    return await prisma.hcrEquipamentosMedicos.findMany({
      include: { 
        setor: true, 
        localizacao: true,
        tipoEquipamento: true
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
    identificacao
  } = data;

  return await prisma.hcrEquipamentosMedicos.update({
    where: { id: Number(id) },
    data: {
      numeroPatrimonio,
      numeroSerie,
      numeroAnvisa,
      nomeEquipamento,
      modelo,
      valorCompra,
      dataCompra: dataCompra ? new Date(dataCompra) : null,
      inicioGarantia: inicioGarantia ? new Date(inicioGarantia) : null,
      terminoGarantia: terminoGarantia ? new Date(terminoGarantia) : null,
      notaFiscal,
      obs,
      setorId,
      localizacaoId,
      tipoEquipamentoId,
      fabricante,
      identificacao
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
