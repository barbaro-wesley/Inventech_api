const express = require("express");
const router = express.Router();
const { relatorioEquipamentosPorSetor,relatorioOsPorTecnico } = require("../services/reports");

router.get("/equipamentos-por-setor", async (req, res) => {
  try {
    // query param ?setores=1,2&tipos=3,4
    let setorIds = [];
    let tipoIds = [];

    if (req.query.setores) {
      setorIds = req.query.setores
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
    }

    if (req.query.tipos) {
      tipoIds = req.query.tipos
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter((id) => !isNaN(id));
    }

    const dados = await relatorioEquipamentosPorSetor(setorIds, tipoIds);
    res.json(dados);
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
    res.status(500).json({ error: "Erro ao gerar relatório" });
  }
});

router.get("/os-por-tecnico", async (req, res) => {
  try {
    const { tecnicos, inicio, fim, campoData = "criadoEm", status } = req.query;

    const tecnicoIds = tecnicos ? tecnicos.split(",").map(id => parseInt(id)) : [];
    const statusArray = status ? status.split(",") : [];

    if (tecnicoIds.length === 0 || !inicio || !fim) {
      return res.status(400).json({ error: "É necessário informar técnicos e intervalo de datas" });
    }

    const dados = await relatorioOsPorTecnico({
      tecnicoIds,
      dataInicio: inicio,
      dataFim: fim,
      campoData,
      statusArray,
    });

    res.json(dados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar relatório" });
  }
});

module.exports = router;
