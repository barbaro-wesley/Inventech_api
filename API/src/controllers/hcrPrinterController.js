const printerService = require('../services/hcrPrinterService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function create(req, res) {
  try {
    const { nPatrimonio, ip, marca, modelo, tipoEquipamentoId, nomeSetor, nomeLocalizacao } = req.body;

    // Busca o setor pelo nome
    const setor = await prisma.setor.findUnique({
      where: { nome: nomeSetor },
    });

    if (!setor) {
      return res.status(400).json({ error: `Setor '${nomeSetor}' não encontrado.` });
    }

    // Busca a localização com base no nome E setorId correspondente
    const localizacao = await prisma.localizacao.findFirst({
      where: {
        nome: nomeLocalizacao,
        setorId: setor.id,
      },
    });

    if (!localizacao) {
      return res.status(400).json({ error: `Localização '${nomeLocalizacao}' não encontrada para o setor '${nomeSetor}'.` });
    }

    // Cria a impressora com os IDs reais
    const nova = await printerService.createPrinter({
      nPatrimonio,
      ip,
      marca,
      modelo,
      tipoEquipamentoId,
      setorId: setor.id,
      localizacaoId: localizacao.id,
    });

    res.status(201).json(nova);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar impressora', details: error.message });
  }
}

module.exports = {
  getAll: async (req, res) => {
    try {
      const data = await printerService.getAllPrinters();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar impressoras' });
    }
  },

  getById: async (req, res) => {
    try {
      const data = await printerService.getPrinterById(req.params.id);
      if (!data) return res.status(404).json({ error: 'Impressora não encontrada' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar impressora' });
    }
  },

  create,

  update: async (req, res) => {
    try {
      const data = await printerService.updatePrinter(req.params.id, req.body);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao atualizar impressora', details: error.message });
    }
  },

  remove: async (req, res) => {
    try {
      await printerService.deletePrinter(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Erro ao excluir impressora', details: error.message });
    }
  },
};
