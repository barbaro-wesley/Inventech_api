// controllers/tipoEquipamentoController.js
const tipoEquipamentoService = require('../services/tipoEquipamentoService');

const criar = async (req, res) => {
  try {
    const { nome, taxaDepreciacao, grupoId } = req.body;
    const tipo = await tipoEquipamentoService.criar({ nome, taxaDepreciacao, grupoId });
    res.status(201).json(tipo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const listar = async (req, res) => {
  const tipos = await tipoEquipamentoService.listarTodos();
  res.json(tipos);
};

const atualizar = async (req, res) => {
  const { id } = req.params;
  try {
    const { nome, taxaDepreciacao, grupoId } = req.body;
    const atualizado = await tipoEquipamentoService.atualizar(parseInt(id, 10), { nome, taxaDepreciacao, grupoId });
    res.json(atualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const remover = async (req, res) => {
  const { id } = req.params;
  try {
    await tipoEquipamentoService.remover(parseInt(id, 10));
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Novas funções para contagem de equipamentos
const obterContagemPorTipo = async (req, res) => {
  try {
    const data = await tipoEquipamentoService.obterContagemPorTipo();
    
    return res.status(200).json({
      success: true,
      message: 'Contagem de equipamentos por tipo obtida com sucesso',
      data,
    });

  } catch (error) {
    console.error('Erro no controller obterContagemPorTipo:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
    });
  }
};

const obterContagemDetalhada = async (req, res) => {
  try {
    const data = await tipoEquipamentoService.obterContagemDetalhada();
    
    return res.status(200).json({
      success: true,
      message: 'Contagem detalhada de equipamentos por tipo obtida com sucesso',
      data,
    });

  } catch (error) {
    console.error('Erro no controller obterContagemDetalhada:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
    });
  }
};

const obterResumoGeral = async (req, res) => {
  try {
    const data = await tipoEquipamentoService.obterResumoGeral();
    
    return res.status(200).json({
      success: true,
      message: 'Resumo de equipamentos obtido com sucesso',
      data,
    });

  } catch (error) {
    console.error('Erro no controller obterResumoGeral:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
    });
  }
};

const obterContagemPorTipoEspecifico = async (req, res) => {
  try {
    const { id } = req.params;
    const tipoId = parseInt(id, 10);

    if (isNaN(tipoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do tipo de equipamento deve ser um número válido',
      });
    }

    const data = await tipoEquipamentoService.obterContagemPorTipoEspecifico(tipoId);

    return res.status(200).json({
      success: true,
      message: 'Informações do tipo de equipamento obtidas com sucesso',
      data,
    });

  } catch (error) {
    console.error('Erro no controller obterContagemPorTipoEspecifico:', error);
    
    if (error.message === 'Tipo de equipamento não encontrado') {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message,
    });
  }
};

module.exports = {
  criar,
  listar,
  atualizar,
  remover,
  obterContagemPorTipo,
  obterContagemDetalhada,
  obterResumoGeral,
  obterContagemPorTipoEspecifico,
};