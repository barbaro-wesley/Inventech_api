const ordemServicoService = require('../services/ordemServicoService');
const { Prisma } = require('@prisma/client');
const ordemServicoController = {
async criar(req, res) {
    const arquivos = req.files ? req.files.map(file => file.path) : [];
    const data = {
      descricao: req.body.descricao,
      tipoEquipamentoId: Number(req.body.tipoEquipamentoId),
      tecnicoId: Number(req.body.tecnicoId),
      status: req.body.status,
      preventiva: req.body.preventiva === 'true',
      setorId: Number(req.body.setorId),
      equipamentoId: Number(req.body.equipamentoId),
      solicitanteId: Number(req.usuario.id),  
      arquivos,
    };

    try {
      const os = await ordemServicoService.criar(data);
      res.status(201).json(os);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar Ordem de Serviço', detalhes: error.message });
    }
  },

 async listar(req, res) {
  try {
    const { osList, totalManutencao } = await ordemServicoService.listar();
    res.status(200).json({ osList, totalManutencao });
  } catch (error) {
    res.status(400).json({ error: 'Erro ao listar ordens de serviço' });
  }
},

  async listarPorTecnico(req, res) {
  try {
    const tecnicoId = req.usuario.tecnicoId;
    
    if (!tecnicoId) {
      return res.status(403).json({ error: 'Usuário não está vinculado a um técnico.' });
    }

    const osList = await ordemServicoService.listarPorTecnico(tecnicoId);
    res.status(200).json(osList);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao listar OS do técnico', detalhes: error.message });
  }
},

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const os = await ordemServicoService.buscarPorId(Number(id));
      if (!os) return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
      res.status(200).json(os);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao buscar ordem de serviço' });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const os = await ordemServicoService.atualizar(Number(id), req.body);
      res.status(200).json(os);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao atualizar ordem de serviço' });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await ordemServicoService.deletar(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Erro ao deletar ordem de serviço' });
    }
  },
  async concluir(req, res) {
  try {
    const { id } = req.params;
    const { resolucao, tecnicoId, finalizadoEm, valorManutencao } = req.body;

    const caminhosArquivos = req.files?.map((file) => file.path) || [];

    const dadosAtualizacao = {
      resolucao,
      tecnicoId: Number(tecnicoId),
      finalizadoEm: new Date(finalizadoEm),
      status: 'CONCLUIDA',
      arquivos: caminhosArquivos,
      valorManutencao: valorManutencao ? new Prisma.Decimal(valorManutencao) : null,
    };
    const osAtualizada = await ordemServicoService.concluir(Number(id), dadosAtualizacao);
    res.status(200).json(osAtualizada);
  } catch (error) {
    res.status(400).json({
      error: 'Erro ao concluir a OS',
      detalhes: error.message,
    });
  }
}
};

module.exports = ordemServicoController;