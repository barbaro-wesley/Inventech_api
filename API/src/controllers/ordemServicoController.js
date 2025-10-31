const ordemServicoService = require('../services/ordemServicoService');
const { PrismaClient } = require('@prisma/client');
const Prisma = new PrismaClient();

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
    const { 
      grupoManutencaoId, 
      tecnicoId,
      status,
      preventiva 
    } = req.query;

    const filtros = {
      grupoManutencaoId: grupoManutencaoId ? Number(grupoManutencaoId) : undefined,
      tecnicoId: tecnicoId ? Number(tecnicoId) : undefined,
      status: status || undefined,
      preventiva: preventiva !== undefined ? preventiva === 'true' : undefined
    };

    // Remove propriedades undefined
    Object.keys(filtros).forEach(key => 
      filtros[key] === undefined && delete filtros[key]
    );

    const resultado = await ordemServicoService.listar(filtros);
    
    res.status(200).json({ 
      preventivas: resultado.preventivas, 
      corretivas: resultado.corretivas, 
      totalManutencao: resultado.totalManutencao,
      total: resultado.total
    });
  } catch (error) {
    res.status(400).json({ 
      error: 'Erro ao listar ordens de serviço', 
      detalhes: error.message 
    });
  }
},
  async criarAcompanhamentoController(req, res) {
  try {
    const { ordemServicoId, descricao } = req.body;
    const userId = req.usuario.id; // vindo do middleware de autenticação
    const files = req.files || []; // Pegar os arquivos do multer

    if (!descricao || !ordemServicoId) {
      // Limpar arquivos em caso de erro de validação
      if (files.length > 0) {
        files.forEach(file => {
          const fs = require('fs');
          fs.unlink(file.path, (err) => {
            if (err) console.error(`Erro ao deletar arquivo: ${file.path}`, err);
          });
        });
      }

      return res
        .status(400)
        .json({ message: "Descrição e ordemServicoId são obrigatórios." });
    }

    const acompanhamento = await ordemServicoService.criarAcompanhamento({
      userId,
      ordemServicoId: Number(ordemServicoId),
      descricao,
      files, // Passar os arquivos para o service
    });

    return res.status(201).json({
      success: true,
      data: acompanhamento
    });
  } catch (error) {
    // Limpar arquivos em caso de erro
    if (req.files && req.files.length > 0) {
      const fs = require('fs');
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error(`Erro ao deletar arquivo: ${file.path}`, err);
        });
      });
    }

    console.error(error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
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
    const { descricao, tecnicoId, prioridade } = req.body;

    // Validações básicas
    if (!id) {
      return res.status(400).json({ 
        error: 'ID da ordem de serviço é obrigatório' 
      });
    }

    // Validação de prioridade se fornecida
    const prioridadesValidas = ['BAIXO', 'MEDIO', 'ALTO', 'URGENTE'];
    if (prioridade && !prioridadesValidas.includes(prioridade)) {
      return res.status(400).json({ 
        error: `Prioridade inválida. Valores permitidos: ${prioridadesValidas.join(', ')}` 
      });
    }

    // Validação de tecnicoId se fornecido
    if (tecnicoId) {
      const tecnico = await Prisma.tecnico.findUnique({
        where: { id: Number(tecnicoId) }
      });

      if (!tecnico) {
        return res.status(404).json({ 
          error: 'Técnico informado não existe' 
        });
      }
    }

    // Validação de descrição se fornecida
    if (descricao !== undefined && typeof descricao !== 'string') {
      return res.status(400).json({ 
        error: 'Descrição deve ser uma string' 
      });
    }

    // Monta objeto com dados filtrados
    const dados = {};
    if (descricao !== undefined && descricao.trim() !== '') {
      dados.descricao = descricao.trim();
    }
    if (tecnicoId !== undefined) {
      dados.tecnicoId = Number(tecnicoId);
    }
    if (prioridade !== undefined) {
      dados.prioridade = prioridade;
    }

    // Chama o service
    const os = await ordemServicoService.atualizar(Number(id), dados);

    return res.status(200).json({
      message: 'Ordem de serviço atualizada com sucesso',
      data: os
    });
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error.message);
    
    // Retorna mensagens de erro específicas do service
    if (error.message.includes('não encontrada')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('não podem ser atualizadas')) {
      return res.status(403).json({ error: error.message });
    }

    return res.status(400).json({ 
      error: error.message || 'Erro ao atualizar ordem de serviço' 
    });
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