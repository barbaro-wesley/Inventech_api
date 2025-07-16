const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const tipoEquipamentoRoutes = require('./src/routes/tipoEquipamentoRoutes');
const grupoRoutes = require('./src/routes/grupoManutencaoRoutes');
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tipos-equipamento', tipoEquipamentoRoutes);
app.use('/api/grupos-manutencao', grupoRoutes);
const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
