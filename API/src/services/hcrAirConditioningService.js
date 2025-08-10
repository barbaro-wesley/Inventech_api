const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class HcrAirConditioningService {
 async criar(data) {
  if (!Array.isArray(data.arquivos)) {
    data.arquivos = [];
  }

  // conversão de tipos
  data.setorId = data.setorId ? Number(data.setorId) : null;
  data.localizacaoId = data.localizacaoId ? Number(data.localizacaoId) : null;
  data.tipoEquipamentoId = data.tipoEquipamentoId ? Number(data.tipoEquipamentoId) : null;
  data.valorCompra = data.valorCompra
    ? parseFloat(data.valorCompra.replace(/[^\d,]/g, '').replace(',', '.'))
    : null;
  data.dataCompra = data.dataCompra ? new Date(data.dataCompra) : null;
  data.inicioGarantia = data.inicioGarantia ? new Date(data.inicioGarantia) : null;
  data.terminoGarantia = data.terminoGarantia ? new Date(data.terminoGarantia) : null;

  return await prisma.hcrAirConditioning.create({ data });
}

  async listar() {
  const condicionadores = await prisma.hcrAirConditioning.findMany({
    include: {
      setor: true,
      localizacao: true,
      tipoEquipamento: true,
    }
  });

  const condicionadoresComOS = await Promise.all(
    condicionadores.map(async (ar) => {
      const ordensServico = await prisma.ordemServico.findMany({
        where: { equipamentoId: ar.id },
        include: {
          tecnico: true,
          solicitante: true,
          tipoEquipamento: true,
          Setor: true,
        }
      });
      return {
        ...ar,
        ordensServico,
      };
    })
  );

  return condicionadoresComOS;
}

  async buscarPorId(id) {
    return await prisma.hcrAirConditioning.findUnique({
      where: { id },
      include: {
        setor: true,
        localizacao: true,
        tipoEquipamento: true,
      }
    });
  }

async atualizar(id, data) {
  // Garantir que arquivos seja array
  if (!Array.isArray(data.arquivos)) {
    data.arquivos = [];
  }

  // Buscar arquivos existentes
  const equipamentoExistente = await prisma.hcrAirConditioning.findUnique({
    where: { id },
    select: { arquivos: true }
  });

  // Combinar arquivos
  const arquivosAtualizados = [
    ...(equipamentoExistente?.arquivos || []),
    ...data.arquivos
  ];

  // Converta os tipos
  data.valorCompra = data.valorCompra
    ? parseFloat(data.valorCompra.toString().replace(/[^\d,]/g, '').replace(',', '.'))
    : null;
  data.dataCompra = data.dataCompra ? new Date(data.dataCompra) : null;
  data.inicioGarantia = data.inicioGarantia ? new Date(data.inicioGarantia) : null;
  data.terminoGarantia = data.terminoGarantia ? new Date(data.terminoGarantia) : null;

  // Prepare o objeto para update sem os campos *_id diretos
 const updateData = {
  ...data,
  arquivos: arquivosAtualizados,
  setor: data.setorId ? { connect: { id: Number(data.setorId) } } : undefined,
  localizacao: data.localizacaoId ? { connect: { id: Number(data.localizacaoId) } } : undefined,
  tipoEquipamento: data.tipoEquipamentoId ? { connect: { id: Number(data.tipoEquipamentoId) } } : undefined,
};

delete updateData.setorId;
delete updateData.localizacaoId;
delete updateData.tipoEquipamentoId;

  return await prisma.hcrAirConditioning.update({
    where: { id },
    data: updateData,
  });
}

  async deletar(id) {
    return await prisma.hcrAirConditioning.delete({
      where: { id },
    });
  }
}

module.exports = new HcrAirConditioningService();
