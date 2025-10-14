const ordemServicoService = require('../services/ordemServicoService');
const { Prisma } = require('@prisma/client');

const ordemServicoController = {
  async criar(req, res) {
    const arquivos = req.files ? req.files.map(file => file.path) : [];
    const preventiva = req.body.preventiva === 'true' || req.body.preventiva === true;
    const dataAgendada = req.body.dataAgendada ? new Date(req.body.dataAgendada) : null;
    const recorrencia = req.body.recorrencia || 'NENHUMA';
    const intervaloDias = req.body.intervaloDias ? Number(req.body.intervaloDias) : null;
    const prioridade = req.body.prioridade || 'MEDIO'; // Valor padrão MEDIO
    const quantidadeOcorrencias = req.body.quantidadeOcorrencias ? Number(req.body.quantidadeOcorrencias) : 12; // Padrão 12 ocorrências

    const data = {
      descricao: req.body.descricao,
      tipoEquipamentoId: Number(req.body.tipoEquipamentoId),
      tecnicoId: Number(req.body.tecnicoId),
      status: req.body.status,
      preventiva,
      setorId: Number(req.body.setorId),
      equipamentoId: Number(req.body.equipamentoId),
      solicitanteId: Number(req.usuario.id),
      arquivos,
      dataAgendada,
      recorrencia,
      intervaloDias,
      prioridade,
      quantidadeOcorrencias, // Adiciona quantidade de ocorrências
    };

    try {
      const resultado = await ordemServicoService.criar(data);
      res.status(201).json(resultado);
    } catch (error) {
      res.status(400).json({ 
        error: 'Erro ao criar Ordem de Serviço', 
        detalhes: error.message 
      });
    }
  },

  async listar(req, res) {
    try {
      const { preventivas, corretivas, totalManutencao } = await ordemServicoService.listar();
      res.status(200).json({ preventivas, corretivas, totalManutencao });
    } catch (error) {
      res.status(400).json({ error: 'Erro ao listar ordens de serviço', detalhes: error.message });
    }
  },
  async  criarAcompanhamentoController(req, res) {
  try {
    const { ordemServicoId, descricao } = req.body;
    const userId = req.usuario.id; // vindo do middleware de autenticação

    if (!descricao || !ordemServicoId) {
      return res
        .status(400)
        .json({ message: "Descrição e ordemServicoId são obrigatórios." });
    }

    const acompanhamento = await ordemServicoService.criarAcompanhamento({
      userId,
      ordemServicoId: Number(ordemServicoId),
      descricao,
    });

    return res.status(201).json(acompanhamento);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
},

/**
 * Controller: Lista acompanhamentos de uma OS
 */
async  listarAcompanhamentosController(req, res) {
  try {
    const { id } = req.params;
    const acompanhamentos = await ordemServicoService.listarAcompanhamentos(Number(id));
    res.json(acompanhamentos);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Erro ao listar acompanhamentos.", error: error.message });
  }
},

  async listarPorTecnico(req, res) {
  try {
    const tecnicoId = req.usuario.tecnicoId;
    if (!tecnicoId) {
      return res.status(403).json({ error: 'Usuário não está vinculado a um técnico.' });
    }

    // Pega todos os filtros da query string
    const { status, preventiva, prioridade, dataInicio, dataFim } = req.query;
    
    const filtros = {
      status,
      preventiva,
      prioridade,
      dataInicio,
      dataFim
    };

    // Remove filtros vazios/undefined
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === undefined || filtros[key] === '') {
        delete filtros[key];
      }
    });
    
    const osList = await ordemServicoService.listarPorTecnico(tecnicoId, filtros);
    res.status(200).json(osList);
  } catch (error) {
    res.status(400).json({ error: 'Erro ao listar OS do técnico', detalhes: error.message });
  }
},
  async listarPreventivasPorTecnico(req, res) {
  try {
    const tecnicoId = req.usuario.tecnicoId;
    if (!tecnicoId) {
      return res.status(403).json({ error: 'Usuário não está vinculado a um técnico.' });
    }

    const osList = await ordemServicoService.listarPreventivasPorTecnico(tecnicoId);
    res.status(200).json(osList);
  } catch (error) {
    res.status(400).json({ 
      error: 'Erro ao listar OS preventivas do técnico', 
      detalhes: error.message 
    });
  }
},
async listarMinhasOS (req, res)  {
  try {
    // Pega o ID do usuário logado do middleware de autenticação
    const solicitanteId = req.usuario.id;
    
    // Extrai os filtros da query string
    const { status, dataInicio, dataFim, preventiva } = req.query;

    // Validação básica dos filtros
    const filtros = {};

    if (status) {
      const statusValidos = ['ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA', 'TODAS'];
      if (statusValidos.includes(status)) {
        filtros.status = status;
      }
    }

    if (dataInicio) {
      // Validar formato da data (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataInicio)) {
        filtros.dataInicio = dataInicio;
      }
    }

    if (dataFim) {
      // Validar formato da data (YYYY-MM-DD)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dataFim)) {
        filtros.dataFim = dataFim;
      }
    }

    if (preventiva !== undefined) {
      filtros.preventiva = preventiva;
    }

    // Chama o service
    const resultado = await ordemServicoService.listarPorSolicitante(solicitanteId, filtros);

    return res.status(200).json({
      success: true,
      message: 'Ordens de serviço listadas com sucesso',
      data: resultado
    });

  } catch (error) {
    console.error('Erro ao listar ordens de serviço do solicitante:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
}

  ,

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
      // Se prioridade estiver sendo atualizada, incluir na atualização
      if (req.body.prioridade) {
        req.body.prioridade = req.body.prioridade;
      }
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

  async iniciar(req, res) {
    try {
      const os = await ordemServicoService.iniciar(Number(req.params.id));
      res.json(os);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async cancelar(req, res) {
    try {
      const os = await ordemServicoService.cancelar(Number(req.params.id));
      res.json(os);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async concluir(req, res) {
    try {
      const { id } = req.params;
      // Arquivos novos (se houver upload)
      const caminhosArquivos = req.files?.map((file) => file.path) || [];

      const { resolucao, tecnicoId, valorManutencao } = req.body;

      // Só dados adicionais que complementam
      const dadosAtualizacao = {
        resolucao,
        tecnicoId: tecnicoId ? Number(tecnicoId) : undefined,
        arquivos: caminhosArquivos,
        valorManutencao: valorManutencao ? new Prisma.Decimal(valorManutencao) : null,
      };

      // Passa para service que já seta status + finalizadoEm
      const osAtualizada = await ordemServicoService.concluir(Number(id), dadosAtualizacao);

      res.status(200).json(osAtualizada);
    } catch (error) {
      res.status(400).json({
        error: 'Erro ao concluir a OS',
        detalhes: error.message,
      });
    }
  },

  // Novo método para criar OSs recorrentes futuras (pode ser chamado manualmente ou por cron job)
  async criarOSRecorrentesFuturas(req, res) {
    try {
      const novasOSCriadas = await ordemServicoService.criarOSRecorrentesFuturas();
      res.status(200).json({
        message: `${novasOSCriadas.length} OSs recorrentes criadas com sucesso`,
        ossCriadas: novasOSCriadas.length,
        oss: novasOSCriadas
      });
    } catch (error) {
      res.status(400).json({
        error: 'Erro ao criar OSs recorrentes futuras',
        detalhes: error.message
      });
    }
  }
};

module.exports = ordemServicoController;