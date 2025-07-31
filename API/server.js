const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const cookieParser = require('cookie-parser');
const corsOptions = {
  origin: 'http://localhost:5173', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(cookieParser()); 
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
const uploadRouter = require('./src/routes/uploadRouter');
const sistemaRoutes = require('./src/routes/sistemaRoutes.js');
const chamado = require('./src/routes/chamadoRoutes.js');
const sobreavisoRoutes = require('./src/routes/sobreavisoRoutes.js');
const incidenteRoutes = require('./src/routes/incidente.routes');

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
app.use('/api/sistemas', sistemaRoutes);
app.use('/api/upload', uploadRouter);
app.use('/uploads', express.static('uploads'));
app.use("/api/chamados",chamado)
app.use("/api/sobreaviso",sobreavisoRoutes)
app.use('/api/incidentes', incidenteRoutes);
const PORT = process.env.PORT ;
const HOST = process.env.HOST;

app.listen(PORT, HOST,() => {
  console.log(`Servidor rodando ${HOST} ${PORT} `);
});
