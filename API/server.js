const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const tipoEquipamentoRoutes = require('./src/routes/tipoEquipamentoRoutes');
const grupoRoutes = require('./src/routes/grupoManutencaoRoutes');
const tecnicoRoutes = require('./src/routes/tecnicoRoutes');
const hcrComputerRoutes = require('./src/routes/hcrComputerRoutes');
const setor = require('./src/routes/setorRouter')
const localizacao = require('./src/routes/localizacaoRouter')
const hcrEquipamentosMedicosRouter = require('./src/routes/hcrEquipamentosMedicosRouter');
const ordemServicoRoutes = require('./src/routes/ordemServicoRoutes');
const hcrAirConditioningRoutes = require('./src/routes/hcrAirConditioningRoutes');
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tipos-equipamento', tipoEquipamentoRoutes);
app.use('/api/grupos-manutencao', grupoRoutes);
app.use('/api/tecnicos', tecnicoRoutes);
app.use('/api/hcr-computers', hcrComputerRoutes);
app.use('/api/setor',setor);
app.use('/api/localizacao',localizacao);
app.use('/api/equipamentos-medicos', hcrEquipamentosMedicosRouter);
app.use('/api/os', ordemServicoRoutes);
app.use('/api/condicionadores', hcrAirConditioningRoutes);

const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
