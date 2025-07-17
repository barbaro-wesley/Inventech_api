import { Request, Response } from 'express';
import hcrEquipamentosMedicosService from '../services/hcrEquipamentosMedicosService';

const hcrEquipamentosMedicosController = {
  async criar(req, res) {
    try {
      const equipamento = await hcrEquipamentosMedicosService.criar(req.body);
      res.status(201).json(equipamento);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao criar equipamento médico', detalhes: error });
    }
  },

  async listar(req,res) {
    try {
      const equipamentos = await hcrEquipamentosMedicosService.listar();
      res.status(200).json(equipamentos);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao listar equipamentos médicos' });
    }
  },

  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const equipamento = await hcrEquipamentosMedicosService.buscarPorId(Number(id));
      if (!equipamento) {
        return res.status(404).json({ error: 'Equipamento não encontrado' });
      }
      res.status(200).json(equipamento);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao buscar equipamento' });
    }
  },

  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const equipamento = await hcrEquipamentosMedicosService.atualizar(Number(id), req.body);
      res.status(200).json(equipamento);
    } catch (error) {
      res.status(400).json({ error: 'Erro ao atualizar equipamento' });
    }
  },

  async deletar(req, res) {
    try {
      const { id } = req.params;
      await hcrEquipamentosMedicosService.deletar(Number(id));
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: 'Erro ao deletar equipamento' });
    }
  }
};

export default hcrEquipamentosMedicosController;
