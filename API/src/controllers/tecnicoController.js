const tecnicoService = require('../services/tecnicoService');

const criar = async (req, res) => {
  try {
    if (!req.body.grupoId) {
      return res.status(400).json({ error: 'grupoId é obrigatório' });
    }

    const tecnico = await tecnicoService.criar(req.body);
    res.status(201).json(tecnico);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listar = async (req, res) => {
  try {
    const tecnicos = await tecnicoService.listar();
    res.status(200).json(tecnicos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  try {
    const tecnico = await tecnicoService.atualizar(parseInt(id), req.body);
    res.status(200).json(tecnico);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remover = async (req, res) => {
  const { id } = req.params;
  try {
    await tecnicoService.remover(parseInt(id));
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listarEquipamentos = async (req, res) => {
  try {
    const tecnicoId = req.usuario?.tecnicoId;
    if (!tecnicoId) {
      return res.status(401).json({ error: 'Usuário não está associado a um técnico' });
    }
    const result = await tecnicoService.listarEquipamentosPorTecnico(tecnicoId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
const listarTiposEquipamento = async (req, res) => {
  try {
    const tecnicoId = req.usuario?.tecnicoId;
    if (!tecnicoId) {
      return res.status(401).json({ error: 'Usuário não está associado a um técnico' });
    }
    const result = await tecnicoService.listarTiposEquipamentoPorTecnico(tecnicoId);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
const gerarRelatorioTecnico = async (req, res) => {
  try {
    const { dataInicio, dataFim, status, prioridade } = req.query;
    const tecnicoId = req.usuario?.tecnicoId; // Corrigido de req.user para req.usuario

    if (!tecnicoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário não é um técnico' 
      });
    }

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data de início e fim são obrigatórias' 
      });
    }

    // Tratar arrays de query parameters
    const statusArray = status ? (Array.isArray(status) ? status : status.split(',')) : undefined;
    const prioridadeArray = prioridade ? (Array.isArray(prioridade) ? prioridade : prioridade.split(',')) : undefined;

    const filtros = { dataInicio, dataFim, status: statusArray, prioridade: prioridadeArray };
    // Usar tecnicoService em vez de relatorioService para consistência
    const resultado = await tecnicoService.gerarRelatorioTecnico(tecnicoId, filtros);

    res.json({
      success: true,
      data: resultado,
      tecnico: {
        id: tecnicoId,
        nome: req.usuario.nome,
        email: req.usuario.email
      }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
const gerarRelatorioResumo = async (req, res) => {
  try {
    const { dataInicio, dataFim, status, prioridade } = req.query;
    const tecnicoId = req.usuario?.tecnicoId; // Corrigido de req.user para req.usuario

    if (!tecnicoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário não é um técnico' 
      });
    }

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data de início e fim são obrigatórias' 
      });
    }

    const statusArray = status ? (Array.isArray(status) ? status : status.split(',')) : undefined;
    const prioridadeArray = prioridade ? (Array.isArray(prioridade) ? prioridade : prioridade.split(',')) : undefined;

    const filtros = { dataInicio, dataFim, status: statusArray, prioridade: prioridadeArray };
    // Usar tecnicoService em vez de relatorioService para consistência
    const resultado = await tecnicoService.gerarRelatorioResumo(tecnicoId, filtros);

    res.json({
      success: true,
      data: resultado,
      tecnico: {
        id: tecnicoId,
        nome: req.usuario.nome,
        email: req.usuario.email
      }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório resumo:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
const gerarRelatorioProdutividade = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    const tecnicoId = req.usuario?.tecnicoId; // Corrigido de req.user para req.usuario

    if (!tecnicoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário não é um técnico' 
      });
    }

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data de início e fim são obrigatórias' 
      });
    }

    const filtros = { dataInicio, dataFim };
    // Usar tecnicoService em vez de relatorioService para consistência
    const resultado = await tecnicoService.gerarRelatorioProdutividade(tecnicoId, filtros);

    res.json({
      success: true,
      data: resultado,
      tecnico: {
        id: tecnicoId,
        nome: req.usuario.nome,
        email: req.usuario.email
      }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório produtividade:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const listarOSPorPeriodo = async (req, res) => {
  try {
    const { dataInicio, dataFim, status, prioridade } = req.query;
    const tecnicoId = req.usuario?.tecnicoId; // Corrigido de req.user para req.usuario

    if (!tecnicoId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Usuário não é um técnico' 
      });
    }

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ 
        success: false, 
        message: 'Data de início e fim são obrigatórias' 
      });
    }

    const statusArray = status ? (Array.isArray(status) ? status : status.split(',')) : undefined;
    const prioridadeArray = prioridade ? (Array.isArray(prioridade) ? prioridade : prioridade.split(',')) : undefined;

    const filtros = { dataInicio, dataFim, status: statusArray, prioridade: prioridadeArray };
    // Usar tecnicoService em vez de relatorioService para consistência
    const ordens = await tecnicoService.listarOSPorPeriodo(tecnicoId, filtros);

    res.json({
      success: true,
      data: {
        message: 'Ordens listadas com sucesso',
        total: ordens.length,
        ordens
      },
      tecnico: {
        id: tecnicoId,
        nome: req.usuario.nome,
        email: req.usuario.email
      }
    });

  } catch (error) {
    console.error('Erro ao listar OS por período:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};


module.exports = {
  criar,
  listar,
  atualizar,
  remover,
  listarEquipamentos,
  listarTiposEquipamento,
   gerarRelatorioTecnico,
  gerarRelatorioResumo,
  gerarRelatorioProdutividade,
  listarOSPorPeriodo
};