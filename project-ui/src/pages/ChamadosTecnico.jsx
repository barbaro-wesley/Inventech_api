import React, { useEffect, useState } from 'react';
import api from '../config/api'; // seu axios com baseURL
import { FaFileUpload } from 'react-icons/fa';

const ChamadosTecnico = () => {
  const [chamados, setChamados] = useState([]);
  const [selecionado, setSelecionado] = useState(null);
  const [resolucao, setResolucao] = useState('');
  const [arquivos, setArquivos] = useState([]);

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

  const handleSelecionar = (os) => {
    setSelecionado(os);
    setResolucao('');
    setArquivos([]);
  };

  const handleFinalizar = async () => {
    if (!resolucao || !selecionado) return;

    const formData = new FormData();
    formData.append('resolucao', resolucao);
    formData.append('tecnicoId', selecionado.tecnicoId);
    formData.append('finalizadoEm', new Date().toISOString());
    arquivos.forEach((file) => formData.append('arquivos', file));

    try {
      await api.put(`/ordemservico/${selecionado.id}/concluir`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Chamado finalizado com sucesso!');
      setSelecionado(null);
      setResolucao('');
      setArquivos([]);
      // Atualizar a lista após finalização
      const { data } = await api.get('/ordemservico/tecnico');
      setChamados(data);
    } catch (error) {
      console.error('Erro ao finalizar chamado:', error);
      alert('Erro ao finalizar chamado.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Meus Chamados</h2>

      {chamados.length === 0 ? (
        <p>Nenhum chamado atribuído.</p>
      ) : (
        <ul className="space-y-2">
          {chamados.map((os) => (
            <li
              key={os.id}
              className={`border p-3 rounded shadow cursor-pointer hover:bg-blue-100 ${
                selecionado?.id === os.id ? 'bg-blue-200' : ''
              }`}
              onClick={() => handleSelecionar(os)}
            >
              <strong>#{os.id}</strong> - {os.descricao} ({os.status})
            </li>
          ))}
        </ul>
      )}

      {selecionado && (
        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold">Finalizar Chamado #{selecionado.id}</h3>

          <textarea
            className="w-full border p-2 mt-2"
            rows="4"
            placeholder="Descreva a resolução..."
            value={resolucao}
            onChange={(e) => setResolucao(e.target.value)}
          />

          <label className="block mt-3">
            <span className="mr-2">Anexar arquivos:</span>
            <input
              type="file"
              multiple
              onChange={(e) => setArquivos([...e.target.files])}
            />
          </label>

          <button
            onClick={handleFinalizar}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Finalizar Chamado
          </button>
        </div>
      )}
    </div>
  );
};

export default ChamadosTecnico;
