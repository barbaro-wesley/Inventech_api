const express = require('express');
require('dotenv').config();
const helmet = require('helmet');
const app = express();
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500 
});
app.use(cookieParser()); 
app.use(helmet());
app.use(express.json());
app.use(limiter);
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const tipoEquipamentoRoutes = require('./src/routes/tipoEquipamentoRoutes');
const grupoRoutes = require('./src/routes/grupoManutencaoRoutes');
const tecnicoRoutes = require('./src/routes/tecnicoRoutes');
const setor = require('./src/routes/setorRouter')
const localizacao = require('./src/routes/localizacaoRouter')
const hcrEquipamentosMedicosRouter = require('./src/routes/hcrEquipamentosMedicosRouter');
const ordemServicoRoutes = require('./src/routes/ordemServicoRoutes');
const uploadRouter = require('./src/routes/uploadRouter');
const sistemaRoutes = require('./src/routes/sistemaRoutes.js');
const chamado = require('./src/routes/chamadoRoutes.js');
const sobreavisoRoutes = require('./src/routes/sobreavisoRoutes.js');
const incidenteRoutes = require('./src/routes/incidente.routes');
const capacitacao = require('./src/routes/capacitacao.routes');
const funcionario = require('./src/routes/funcionario.routes');
const tiposDocumentos = require('./src/routes/tipoDocumento.routes');
const modulo = require('./src/routes/moduloRoutes.js')
const reports = require('./src/routes/reports.routes');
const productCategory = require("./src/routes/productCategoryRoutes")
const product = require("./src/routes/productRoutes")
const stockMovement = require("./src/routes/stockMovementRoutes")
const software = require("./src/routes/gestaoSoftwareRoutes")
// const cailun = require("./src/routes/cailunRoutes.js")
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tipos-equipamento', tipoEquipamentoRoutes);
app.use('/api/grupos-manutencao', grupoRoutes);
app.use('/api/tecnicos', tecnicoRoutes);
app.use('/api/setor',setor);
app.use('/api/localizacao',localizacao);
app.use('/api/equipamentos-medicos', hcrEquipamentosMedicosRouter);
app.use('/api/os', ordemServicoRoutes);
app.use('/api/sistemas', sistemaRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/upload', uploadRouter);
app.use("/api/chamados",chamado)
app.use("/api/sobreaviso",sobreavisoRoutes)
app.use('/api/incidentes', incidenteRoutes);
app.use('/api/capacitacao', capacitacao);
app.use('/api/funcionarios', funcionario);
app.use('/api/tipos-documento',tiposDocumentos)
app.use('/api/modulos',modulo)
app.use('/api/reports',reports)
app.use('/api/categories',productCategory)
app.use('/api/products',product)
app.use('/api/stock-movements',stockMovement)
app.use('/api/gestao-software',software)
// app.use('/api/cailun',cailun)

const PORT = process.env.PORT ;
const HOST = process.env.HOST;

app.listen(PORT, HOST,() => {
  console.log(`Servidor rodando ${HOST} ${PORT} `);
});