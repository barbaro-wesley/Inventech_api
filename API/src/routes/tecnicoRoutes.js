const express = require('express');
const router = express.Router();
const controller = require('../controllers/tecnicoController');
const autenticarUsuario = require('../middlewares/auth');
const permitirSomente = require('../middlewares/permissoes');

// Somente admin pode gerenciar técnicos
router.use(autenticarUsuario);

router.post('/', permitirSomente('admin','cadastro','tecnico'),controller.criar);
router.get('/',permitirSomente('admin','cadastro','visualizador','tecnico'), controller.listar);
router.put('/:id',permitirSomente('admin','cadastro'), controller.atualizar);
router.delete('/:id', permitirSomente('admin'),controller.remover);
router.get('/TecnicoEquipamentos', controller.listarEquipamentos); 
router.get('/tipos-equipamentos', autenticarUsuario, controller.listarTiposEquipamento);
// rotas de relatorios

router.get('/completo', 
  permitirSomente('admin', 'tecnico', 'visualizador'), 
  controller.gerarRelatorioTecnico
);

router.get('/resumo', 
  permitirSomente('admin', 'tecnico', 'visualizador'), 
  controller.gerarRelatorioResumo
);

// Relatório de produtividade do técnico logado
router.get('/produtividade', 
  permitirSomente('admin', 'tecnico', 'visualizador'), 
  controller.gerarRelatorioProdutividade
);

// Listar OS do técnico por período
router.get('/listar-periodo', 
  permitirSomente('admin', 'tecnico', 'visualizador'), 
  controller.listarOSPorPeriodo
);
module.exports = router;
