import React, { useEffect, useState } from 'react';
import api from '../config/api';
import { FaCheckCircle, FaChevronDown, FaChevronUp, FaFileUpload } from 'react-icons/fa';
import "../styles/ChamadosTecnico.css"

const ChamadosTecnico = () => {
  const [chamados, setChamados] = useState([]);
  const [aberto, setAberto] = useState(null);
  const [resolucao, setResolucao] = useState('');
  const [arquivos, setArquivos] = useState([]);
  const [valorManutencao, setValorManutencao] = useState('');

  useEffect(() => {
    const fetchChamados = async () => {
      try {
        const { data } = await api.get('/os/tecnico');
        setChamados(data);
      } catch (error) {
        console.error('Erro ao buscar chamados:', error);
      }
    };

    fetchChamados();
  }, []);

  const handleAbrir = (id) => {
    setAberto(aberto === id ? null : id);
    setResolucao('');
    setArquivos([]);
  };

  const handleFinalizar = async (os) => {
    if (!resolucao) return alert('Descreva a resolução.');

    const formData = new FormData();
    formData.append('resolucao', resolucao);
    formData.append('tecnicoId', os.tecnico.id);
    formData.append('finalizadoEm', new Date().toISOString());
    formData.append('valorManutencao', valorManutencao);
    arquivos.forEach((file) => formData.append('arquivos', file));

    try {
     await api.put(`/os/${os.id}/concluir`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  withCredentials: true, // necessário para enviar o token via cookie
});

      alert('Chamado finalizado com sucesso!');
      setAberto(null);
      setResolucao('');
      setArquivos([]);
      setValorManutencao('');
      const { data } = await api.get('/os/tecnico');
      setChamados(data);
    } catch (error) {
      console.error('Erro ao finalizar chamado:', error);
      alert('Erro ao finalizar chamado.');
    }
  };

  return (
    <div className="chamados-container">
      <h2 className="chamados-title">Chamados Atribuídos</h2>

      {chamados.length === 0 ? (
        <p className="chamados-vazio">Nenhum chamado atribuído.</p>
      ) : (
        chamados.map((os) => (
          <div key={os.id} className="chamado-card">
            <div className="chamado-header">
              <div>
                <p className="chamado-descricao">#{os.id} - {os.descricao}</p>
                <p className="chamado-status">Status: <strong>{os.status}</strong></p>
              </div>

              <button onClick={() => handleAbrir(os.id)} className="btn-finalizar">
                <FaCheckCircle className="icon" />
                {aberto === os.id ? 'Cancelar' : 'Finalizar'}
                {aberto === os.id ? <FaChevronUp /> : <FaChevronDown />}
              </button>
            </div>

            {aberto === os.id && (
              <div className="finalizar-area">
                <textarea
                  className="textarea-resolucao"
                  rows="4"
                  placeholder="Descreva a resolução..."
                  value={resolucao}
                  onChange={(e) => setResolucao(e.target.value)}
                />
                <div className="input-valor">
                  <label>
                     Valor da manutenção (R$):
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 150.50"
                      value={valorManutencao}
                      onChange={(e) => setValorManutencao(e.target.value)}
                      />
                    </label>
                </div>
                <div className="input-arquivos">
                  <label>
                    <FaFileUpload className="icon" /> Anexar arquivos:
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setArquivos([...e.target.files])}
                    />
                  </label>
                </div>

                <button
                  onClick={() => handleFinalizar(os)}
                  className="btn-confirmar"
                >
                  Confirmar Finalização
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ChamadosTecnico;