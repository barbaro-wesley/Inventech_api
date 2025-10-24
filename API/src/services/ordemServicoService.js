const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const enviarNotificacaoTelegram = require('../utils/telegram');
const emailUtils = require('../utils/email_utility');

class OrdemServicoService {
  // Função para retornar o emoji da prioridade
  getPrioridadeEmoji(prioridade) {
    const emojis = {
      BAIXO: '🟢',
      MEDIO: '🟡',
      ALTO: '🟠',
      URGENTE: '🔴'
    };
    return emojis[prioridade] || '🟡';
  }

  // Função para retornar o texto da prioridade
  getPrioridadeTexto(prioridade) {
    const textos = {
      BAIXO: 'Baixa',
      MEDIO: 'Média',
      ALTO: 'Alta',
      URGENTE: 'Urgente'
    };
    return textos[prioridade] || 'Média';
  }

  // Função para calcular próxima data baseada na recorrência
  calcularProximaData(dataBase, recorrencia, intervaloDias = null) {
    // Se não há recorrência, retorna null
    if (!recorrencia || recorrencia === 'NENHUMA' || recorrencia === 'SEM_RECORRENCIA') {
      return null;
    }

    const novaData = new Date(dataBase);

    switch (recorrencia) {
      case 'DIARIA':
        novaData.setDate(novaData.getDate() + 1);
        break;
      case 'SEMANAL':
        novaData.setDate(novaData.getDate() + 7);
        break;
      case 'QUINZENAL':
        novaData.setDate(novaData.getDate() + 15);
        break;
      case 'MENSAL':
        novaData.setMonth(novaData.getMonth() + 1);
        break;
      case 'TRIMESTRAL':
        novaData.setMonth(novaData.getMonth() + 3);
        break;
      case 'SEMESTRAL':
        novaData.setMonth(novaData.getMonth() + 6);
        break;
      case 'ANUAL':
        novaData.setFullYear(novaData.getFullYear() + 1);
        break;
      case 'PERSONALIZADA':
        if (intervaloDias && intervaloDias > 0) {
          novaData.setDate(novaData.getDate() + intervaloDias);
        } else {
          throw new Error('Intervalo de dias é obrigatório para recorrência personalizada');
        }
        break;
      default:
        return null;
    }

    return novaData;
  }

  // Função para gerar múltiplas datas baseadas na recorrência
  gerarDatasRecorrencia(dataInicial, recorrencia, intervaloDias = null, quantidadeOcorrencias = 12) {
    // Se não há recorrência, retorna apenas a data inicial
    if (!recorrencia || recorrencia === 'NENHUMA' || recorrencia === 'SEM_RECORRENCIA') {
      return [new Date(dataInicial)];
    }

    const datas = [];
    let dataAtual = new Date(dataInicial);

    // Adiciona a primeira data
    datas.push(new Date(dataAtual));

    // Gera as próximas ocorrências
    for (let i = 1; i < quantidadeOcorrencias; i++) {
      dataAtual = this.calcularProximaData(dataAtual, recorrencia, intervaloDias);
      if (dataAtual) {
        datas.push(new Date(dataAtual));
      } else {
        break;
      }
    }

    return datas;
  }

  async criar(data) {
    const {
      preventiva = false,
      dataAgendada,
      recorrencia = 'NENHUMA', // Padrão: sem recorrência
      intervaloDias,
      quantidadeOcorrencias = 12,
      ...restData
    } = data;

    // Normaliza valores de recorrência vazios para 'NENHUMA'
    const recorrenciaNormalizada = !recorrencia ||
      recorrencia === '' ||
      recorrencia === null ||
      recorrencia === undefined
      ? 'NENHUMA'
      : recorrencia;

    // Se não é preventiva ou não tem recorrência, cria apenas uma OS
    if (!preventiva || recorrenciaNormalizada === 'NENHUMA' || recorrenciaNormalizada === 'SEM_RECORRENCIA') {
      return this.criarOSUnica({
        ...data,
        preventiva,
        dataAgendada: dataAgendada ?? null,
        recorrencia: recorrenciaNormalizada,
        intervaloDias: intervaloDias ?? null,
      });
    }

    // Se é preventiva com recorrência, gera múltiplas OSs
    if (!dataAgendada) {
      throw new Error('Data agendada é obrigatória para OSs preventivas com recorrência');
    }

    const datasRecorrencia = this.gerarDatasRecorrencia(
      dataAgendada,
      recorrenciaNormalizada,
      intervaloDias,
      quantidadeOcorrencias
    );

    const ossCriadas = [];

    // Cria uma OS para cada data gerada
    for (const [index, dataOS] of datasRecorrencia.entries()) {
      const dadosOS = {
        ...restData,
        preventiva: true,
        dataAgendada: dataOS,
        recorrencia: recorrenciaNormalizada,
        intervaloDias: intervaloDias ?? null,
        // Adiciona um sufixo na descrição para identificar a sequência
        descricao: index === 0
          ? data.descricao
          : `${data.descricao} (${index + 1}ª ocorrência)`
      };

      const os = await this.criarOSUnica(dadosOS, index === 0); // Só envia notificação para a primeira
      ossCriadas.push(os);
    }

    return {
      message: `${ossCriadas.length} ordens de serviço preventivas criadas com sucesso`,
      ossCriadas: ossCriadas.length,
      primeiraOS: ossCriadas[0],
      proximasDataS: ossCriadas.slice(1).map(os => ({
        id: os.id,
        dataAgendada: os.dataAgendada
      }))
    };
  }
  async criarAcompanhamento({ userId, ordemServicoId, descricao, files = [] }) {
    const os = await prisma.ordemServico.findUnique({
      where: { id: ordemServicoId },
      include: {
        solicitante: true,
        tecnico: true
      },
    });

    if (!os) {
      throw new Error("Ordem de Serviço não encontrada.");
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        tecnico: true
      }
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado.");
    }

    const ehSolicitante = os.solicitanteId === userId;
    const ehTecnicoAtribuido = os.tecnicoId && usuario.tecnicoId && os.tecnicoId === usuario.tecnicoId;

    const podeAdicionar = ehSolicitante || ehTecnicoAtribuido;

    if (!podeAdicionar) {
      throw new Error("Você não tem permissão para adicionar acompanhamentos a esta OS.");
    }

    // Mapear os arquivos para um array de caminhos
    const caminhos = files.map(file => file.path);

    const acompanhamento = await prisma.acompanhamentoOS.create({
      data: {
        ordemServicoId,
        descricao,
        criadoPorId: userId,
        arquivos: caminhos, // Salvar os caminhos dos arquivos
      },
      include: {
        criadoPor: { select: { id: true, nome: true, email: true } },
      },
    });

    return acompanhamento;
  }

  /**
   * Lista os acompanhamentos de uma OS.
   */
  async listarAcompanhamentos(ordemServicoId) {
    return await prisma.acompanhamentoOS.findMany({
      where: { ordemServicoId },
      include: {
        criadoPor: { select: { id: true, nome: true, email: true } },
      },
      orderBy: { criadoEm: "asc" },
    });
  }

  async criarOSUnica(data, enviarNotificacao = true) {
    // Normaliza a recorrência antes de salvar
    const recorrenciaNormalizada = !data.recorrencia ||
      data.recorrencia === '' ||
      data.recorrencia === null ||
      data.recorrencia === undefined
      ? 'NENHUMA'
      : data.recorrencia;

    // Remove quantidadeOcorrencias dos dados que vão para o banco
    const { quantidadeOcorrencias, ...dadosParaSalvar } = data;

    const novaOS = await prisma.ordemServico.create({
      data: {
        ...dadosParaSalvar,
        preventiva: data.preventiva || false,
        dataAgendada: data.dataAgendada ?? null,
        recorrencia: recorrenciaNormalizada,
        intervaloDias: data.intervaloDias ?? null,
        arquivos: data.arquivos || [],
        prioridade: data.prioridade || 'MEDIO',
      },
      include: {
        tipoEquipamento: true,
        tecnico: true,
        solicitante: { select: { nome: true } },
        Setor: true,
        equipamento: {
          select: {
            nomeEquipamento: true,
            numeroPatrimonio: true,
            numeroSerie: true,
          }
        }
      },
    });

    // Só envia notificação se solicitado (para evitar spam nas recorrências)
    if (enviarNotificacao) {
      await this.enviarNotificacoes(novaOS);
    }

    return novaOS;
  }

  async enviarNotificacoes(novaOS) {
    // Notificação no Telegram
    if (novaOS.tecnico && novaOS.tecnico.telegramChatId) {
      const prioridadeEmoji = this.getPrioridadeEmoji(novaOS.prioridade);
      const prioridadeTexto = this.getPrioridadeTexto(novaOS.prioridade);

      let msg = `📄 <b>Nova OS Atribuída</b>\n\n`;
      msg += `🔧 Técnico: ${novaOS.tecnico.nome}\n`;
      msg += `${prioridadeEmoji} Prioridade: <b>${prioridadeTexto}</b>\n`;
      msg += `📌 Descrição: ${novaOS.descricao}\n`;
      msg += `📍 Setor: ${novaOS.Setor?.nome || 'Não informado'}\n`;
      msg += `🙋 Solicitante: ${novaOS.solicitante?.nome || 'Não informado'}\n`;

      if (novaOS.equipamento) {
        msg += `\n⚙️ Equipamento: ${novaOS.equipamento.nomeEquipamento || 'Não informado'}\n`;
        msg += `🔖 Patrimônio: ${novaOS.equipamento.numeroPatrimonio || 'Não informado'}\n`;
        msg += `🔢 Nº Série: ${novaOS.equipamento.numeroSerie || 'Não informado'}\n`;
      }

      if (novaOS.dataAgendada) {
        const dataFormatada = new Date(novaOS.dataAgendada).toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        msg += `\n📅 Data Agendada: ${dataFormatada}\n`;
      }

      if (novaOS.preventiva && novaOS.recorrencia !== 'NENHUMA' && novaOS.recorrencia !== 'SEM_RECORRENCIA') {
        msg += `🔄 Recorrência: ${this.getTextoRecorrencia(novaOS.recorrencia, novaOS.intervaloDias)}\n`;
      }

      await enviarNotificacaoTelegram(novaOS.tecnico.telegramChatId, msg);
    }

    // Notificação por Email
    if (novaOS.tecnico && novaOS.tecnico.email) {
      const htmlTemplate = this.gerarTemplateEmail(novaOS);

      const emailData = {
        to: novaOS.tecnico.email,
        subject: `Nova Ordem de Serviço Atribuída - OS #${novaOS.id} [${this.getPrioridadeTexto(novaOS.prioridade)}]`,
        html: htmlTemplate
      };

      try {
        await emailUtils.enviarEmail(emailData);
        console.log(`Email enviado para ${novaOS.tecnico.email} - OS #${novaOS.id}`);
      } catch (error) {
        console.error('Erro ao enviar email:', error);
      }
    }
  }

  // Função auxiliar para converter enum em texto legível - ATUALIZADA
  getTextoRecorrencia(recorrencia, intervaloDias = null) {
    const textos = {
      NENHUMA: 'Sem recorrência',
      SEM_RECORRENCIA: 'Sem recorrência',
      DIARIA: 'Diária',
      SEMANAL: 'Semanal',
      QUINZENAL: 'Quinzenal',
      MENSAL: 'Mensal',
      TRIMESTRAL: 'Trimestral',
      SEMESTRAL: 'Semestral',
      ANUAL: 'Anual',
      PERSONALIZADA: intervaloDias ? `A cada ${intervaloDias} dias` : 'Personalizada'
    };
    return textos[recorrencia] || 'Sem recorrência';
  }
  gerarTemplateEmail(novaOS) {
    const prioridadeEmoji = this.getPrioridadeEmoji(novaOS.prioridade);
    const prioridadeTexto = this.getPrioridadeTexto(novaOS.prioridade);

    // Define cores baseadas na prioridade
    const corPrioridade = {
      BAIXO: '#10b981',
      MEDIO: '#f59e0b',
      ALTO: '#f97316',
      URGENTE: '#ef4444'
    };

    const cor = corPrioridade[novaOS.prioridade] || '#f59e0b';

    return `
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nova Ordem de Serviço</title>
    </head>
    <body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; line-height:1.6;">
      <div style="max-width:600px; margin:0 auto; background-color:#ffffff; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, hsl(215, 85%, 20%) 0%, hsl(215, 85%, 30%) 40%, hsl(215, 85%, 45%) 70%, hsl(40, 95%, 60%) 100% ); padding:40px 30px; text-align:center;">
          <div style="background-color:rgba(255,255,255,0.15); width:80px; height:80px; border-radius:50%; margin:0 auto 20px; display:flex; align-items:center; justify-content:center;">
            <div style="font-size:36px;">📄</div>
          </div>
          <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:700; text-shadow:0 2px 4px rgba(0,0,0,0.1);">
            Nova Ordem de Serviço
          </h1>
          <p style="color:rgba(255,255,255,0.9); margin:10px 0 0; font-size:16px;">
            Uma nova OS foi atribuída a você
          </p>
        </div>

        <!-- Content -->
        <div style="padding:40px 30px;">

          <!-- Title with Priority Badge -->
          <div style="text-align:center; margin-bottom:35px;">
            <h2 style="color:#1e293b; font-size:24px; font-weight:600; margin:0 0 15px; line-height:1.3;">
              ${novaOS.descricao || 'Sem descrição'}
            </h2>
            <!-- Priority Badge -->
            <div style="display:inline-block; background-color:${cor}; color:#ffffff; padding:8px 16px; border-radius:20px; font-size:14px; font-weight:600; margin-bottom:15px;">
              ${prioridadeEmoji} Prioridade: ${prioridadeTexto}
            </div>
            ${novaOS.preventiva && novaOS.recorrencia !== 'NENHUMA' && novaOS.recorrencia !== 'SEM_RECORRENCIA' ? `
            <div style="display:inline-block; background-color:#6366f1; color:#ffffff; padding:8px 16px; border-radius:20px; font-size:14px; font-weight:600; margin-bottom:15px; margin-left:10px;">
              🔄 ${this.getTextoRecorrencia(novaOS.recorrencia, novaOS.intervaloDias)}
            </div>` : ''}
            <div style="width:60px; height:3px; background:linear-gradient(90deg, hsl(215, 85%, 20%) 0%, hsl(215, 85%, 30%) 40%, hsl(215, 85%, 45%) 70%, hsl(40, 95%, 60%) 100% ); margin:0 auto; border-radius:2px;"></div>
          </div>

          <!-- Details -->
          <div style="background-color:#f8fafc; border-radius:12px; padding:30px; margin-bottom:30px; border-left:4px solid hsl(215,85%,45%);">
            
            <!-- Técnico -->
            <div style="display:flex; align-items:flex-start; margin-bottom:20px;">
              <div style="background-color:hsl(215, 40%, 95%); width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-right:15px; flex-shrink:0;">
                <span style="font-size:18px;">🔧</span>
              </div>
              <div>
                <h3 style="color:#374151; font-size:14px; font-weight:600; margin:0 0 5px; text-transform:uppercase; letter-spacing:0.5px;">
                  Técnico
                </h3>
                <p style="color:#1e293b; font-size:16px; font-weight:500; margin:0;">
                  ${novaOS.tecnico?.nome || 'Não informado'}
                </p>
              </div>
            </div>

            <!-- Setor -->
            <div style="display:flex; align-items:flex-start; margin-bottom:20px;">
              <div style="background-color:hsl(215, 40%, 95%); width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-right:15px; flex-shrink:0;">
                <span style="font-size:18px;">📍</span>
              </div>
              <div>
                <h3 style="color:#374151; font-size:14px; font-weight:600; margin:0 0 5px; text-transform:uppercase; letter-spacing:0.5px;">
                  Setor
                </h3>
                <p style="color:#1e293b; font-size:16px; font-weight:500; margin:0;">
                  ${novaOS.Setor?.nome || 'Não informado'}
                </p>
              </div>
            </div>

            <!-- Solicitante -->
            <div style="display:flex; align-items:flex-start; margin-bottom:20px;">
              <div style="background-color:hsl(215, 40%, 95%); width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-right:15px; flex-shrink:0;">
                <span style="font-size:18px;">🙋</span>
              </div>
              <div>
                <h3 style="color:#374151; font-size:14px; font-weight:600; margin:0 0 5px; text-transform:uppercase; letter-spacing:0.5px;">
                  Solicitante
                </h3>
                <p style="color:#1e293b; font-size:16px; font-weight:500; margin:0;">
                  ${novaOS.solicitante?.nome || 'Não informado'}
                </p>
              </div>
            </div>

            <!-- Equipamento -->
            ${novaOS.equipamento ? `
            <div style="display:flex; align-items:flex-start; margin-bottom:20px;">
              <div style="background-color:hsl(215, 40%, 95%); width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-right:15px; flex-shrink:0;">
                <span style="font-size:18px;">⚙️</span>
              </div>
              <div>
                <h3 style="color:#374151; font-size:14px; font-weight:600; margin:0 0 5px; text-transform:uppercase; letter-spacing:0.5px;">
                  Equipamento
                </h3>
                <p style="color:#1e293b; font-size:16px; font-weight:500; margin:0;">
                  ${novaOS.equipamento.nomeEquipamento || 'Não informado'}<br>
                  Patrimônio: ${novaOS.equipamento.numeroPatrimonio || 'N/I'}<br>
                  Nº Série: ${novaOS.equipamento.numeroSerie || 'N/I'}
                </p>
              </div>
            </div>` : ''}

            <!-- Data Agendada -->
            ${novaOS.dataAgendada ? `
            <div style="display:flex; align-items:flex-start; margin-bottom:20px;">
              <div style="background-color:hsl(215, 40%, 95%); width:40px; height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-right:15px; flex-shrink:0;">
                <span style="font-size:18px;">📅</span>
              </div>
              <div>
                <h3 style="color:#374151; font-size:14px; font-weight:600; margin:0 0 5px; text-transform:uppercase; letter-spacing:0.5px;">
                  Data Agendada
                </h3>
                <p style="color:#1e293b; font-size:16px; font-weight:500; margin:0;">
                  ${new Date(novaOS.dataAgendada).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
                </p>
              </div>
            </div>` : ''}

          </div>

          <!-- Message -->
          <div style="background:linear-gradient(135deg, hsl(215, 40%, 98%) 0%, hsl(215, 40%, 95%) 100% ); border-radius:12px; padding:25px; margin-bottom:30px; border:1px solid hsl(215, 40%, 85%);">
            <p style="color:#0f172a; font-size:16px; margin:0; text-align:center; line-height:1.6;">
              <strong>Atenção!</strong> Uma nova Ordem de Serviço foi registrada e atribuída a você.  
              Verifique os detalhes e prossiga com o atendimento.
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align:center; margin-bottom:30px;">
            <a href="${process.env.APP_URL || '#'}" style="display:inline-block; background:linear-gradient(135deg, hsl(215, 85%, 20%) 0%, hsl(215, 85%, 30%) 40%, hsl(215, 85%, 45%) 70%, hsl(40, 95%, 60%) 100% ); padding:12px 30px; border-radius:8px; text-decoration:none; color:#ffffff; font-weight:600; font-size:16px; box-shadow:0 4px 15px rgba(8,43,94,0.3);">
              🔗 Acessar Sistema
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color:#f8fafc; padding:30px; text-align:center; border-top:1px solid #e2e8f0;">
          <p style="color:#64748b; font-size:14px; margin:0 0 10px;">
            <strong>Departamento de Manutenção</strong>
          </p>
          <p style="color:#94a3b8; font-size:12px; margin:0; line-height:1.5;">
            Este é um e-mail automático do sistema de gestão de Ordens de Serviço.<br>
            Para dúvidas, entre em contato com o setor responsável.
          </p>
        </div>

      </div>
    </body>
    </html>`;
  }

  // Método para criar OSs recorrentes futuras (pode ser executado por cron job)
  async criarOSRecorrentesFuturas() {
    // Busca OSs preventivas com recorrência que já foram concluídas ou estão próximas da data
    const osRecorrentes = await prisma.ordemServico.findMany({
      where: {
        preventiva: true,
        recorrencia: {
          not: 'NENHUMA',
          notIn: ['NENHUMA', 'SEM_RECORRENCIA'] // Exclui ambos os valores
        },
        status: 'CONCLUIDA', // Só cria novas para OSs já concluídas
      },
      include: {
        tipoEquipamento: true,
        tecnico: true,
        solicitante: { select: { nome: true, id: true } },
        Setor: true,
        equipamento: true
      }
    });

    const novasOSCriadas = [];

    for (const os of osRecorrentes) {
      // Verifica se já existe uma próxima OS para este equipamento
      const proximaDataAgendada = this.calcularProximaData(
        os.dataAgendada,
        os.recorrencia,
        os.intervaloDias
      );

      if (!proximaDataAgendada) continue;

      const osExistente = await prisma.ordemServico.findFirst({
        where: {
          equipamentoId: os.equipamentoId,
          dataAgendada: proximaDataAgendada,
          preventiva: true,
          recorrencia: os.recorrencia
        }
      });

      if (!osExistente) {
        const novaOS = await this.criarOSUnica({
          descricao: os.descricao,
          tipoEquipamentoId: os.tipoEquipamentoId,
          equipamentoId: os.equipamentoId,
          tecnicoId: os.tecnicoId,
          solicitanteId: os.solicitanteId,
          prioridade: os.prioridade,
          preventiva: true,
          dataAgendada: proximaDataAgendada,
          recorrencia: os.recorrencia,
          intervaloDias: os.intervaloDias,
          setorId: os.setorId,
          arquivos: []
        }, false); // false = não enviar notificação automática

        novasOSCriadas.push(novaOS);
      }
    }

    return novasOSCriadas;
  }

  async listar(filtros = {}) {
    const {
      grupoManutencaoId,
      tecnicoId,
      status,
      preventiva
    } = filtros;

    const whereCondition = {};

    if (preventiva !== undefined) {
      whereCondition.preventiva = preventiva === true || preventiva === 'true';
    }

    if (status) {
      whereCondition.status = status;
    }

    if (tecnicoId) {
      whereCondition.tecnicoId = Number(tecnicoId);
    }

    let tecnicoWhere = undefined;
    if (grupoManutencaoId) {
      tecnicoWhere = {
        grupoId: Number(grupoManutencaoId)
      };
    }

    const queryOptions = {
      where: whereCondition,
      include: {
        tipoEquipamento: true,
        tecnico: {
          include: {
            grupo: true
          }
        },
        Setor: true,
        solicitante: { select: { nome: true } },
        equipamento: {
          select: {
            nomeEquipamento: true,
            marca: true,
            modelo: true,
            numeroSerie: true,
          }
        },
        acompanhamentos: {
          select: {
            id: true,
            descricao: true,
            criadoEm: true,
            arquivos: true, // ADICIONADO: Incluir arquivos
            criadoPor: {
              select: { nome: true, email: true }
            }
          },
          orderBy: { criadoEm: 'asc' }
        }
      },
      orderBy: [
        { prioridade: 'desc' },
        { criadoEm: 'desc' }
      ]
    };

    let todasAsOrdens = await prisma.ordemServico.findMany(queryOptions);

    if (grupoManutencaoId) {
      todasAsOrdens = todasAsOrdens.filter(os =>
        os.tecnico?.grupo?.id === Number(grupoManutencaoId)
      );
    }

    const preventivas = todasAsOrdens.filter(os => os.preventiva === true);
    const corretivas = todasAsOrdens.filter(os => os.preventiva === false);

    const totalManutencao = todasAsOrdens.reduce((acc, os) => {
      const valor = os.valorManutencao ? Number(os.valorManutencao) : 0;
      return acc + valor;
    }, 0);

    return {
      preventivas,
      corretivas,
      totalManutencao,
      total: todasAsOrdens.length
    };
  }
  async buscarPorId(id) {
    return await prisma.ordemServico.findUnique({
      where: { id },
      include: {
        tipoEquipamento: true,
        tecnico: true,
        solicitante: { select: { nome: true } },
        Setor: true
      },
    });
  }

  async atualizar(id, data) {
    // Busca a OS atual para verificar o status
    const osAtual = await prisma.ordemServico.findUnique({
      where: { id },
    });

    if (!osAtual) {
      throw new Error("Ordem de Serviço não encontrada.");
    }

    // Verifica se a OS está com status ABERTA
    if (osAtual.status !== 'ABERTA') {
      throw new Error(`Apenas OSs com status ABERTA podem ser atualizadas. Status atual: ${osAtual.status}`);
    }

    // Define quais campos podem ser atualizados
    const camposPermitidos = {
      descricao: data.descricao,
      tecnicoId: data.tecnicoId,
      prioridade: data.prioridade
    };

    // Remove campos undefined/null
    const dadosLimpos = {};
    Object.keys(camposPermitidos).forEach(campo => {
      if (data[campo] !== undefined && data[campo] !== null) {
        dadosLimpos[campo] = camposPermitidos[campo];
      }
    });

    // Se nenhum campo válido foi fornecido, retorna erro
    if (Object.keys(dadosLimpos).length === 0) {
      throw new Error("Nenhum campo válido foi fornecido para atualização. Campos permitidos: descricao, tecnicoId, prioridade");
    }

    // Atualiza apenas os campos permitidos
    const osAtualizada = await prisma.ordemServico.update({
      where: { id },
      data: dadosLimpos,
      include: {
        tipoEquipamento: true,
        tecnico: true,
        solicitante: { select: { nome: true } },
        Setor: true,
        equipamento: {
          select: {
            nomeEquipamento: true,
            marca: true,
            modelo: true,
            numeroSerie: true,
          }
        }
      },
    });

    return osAtualizada;
  }

  async deletar(id) {
    return await prisma.ordemServico.delete({
      where: { id },
    });
  }

  async iniciar(id) {
    return await prisma.ordemServico.update({
      where: { id },
      data: {
        status: "EM_ANDAMENTO",
        iniciadaEm: new Date()
      },
      include: {
        tipoEquipamento: true,
        tecnico: true,
        solicitante: { select: { nome: true } },
        Setor: true,
        equipamento: {
          select: {
            nomeEquipamento: true,
            marca: true,
            modelo: true,
            numeroSerie: true,
          }
        }
      }
    });
  }

  async concluir(id, dadosAdicionais = {}) {
    const dadosAtualizacao = {
      status: "CONCLUIDA",
      finalizadoEm: new Date(),
      ...dadosAdicionais
    };

    return await prisma.ordemServico.update({
      where: { id },
      data: dadosAtualizacao,
      include: {
        tipoEquipamento: true,
        tecnico: true,
        solicitante: { select: { nome: true } },
        Setor: true,
        equipamento: {
          select: {
            nomeEquipamento: true,
            marca: true,
            modelo: true,
            numeroSerie: true,
          }
        }
      }
    });
  }

  async cancelar(id) {
    return await prisma.ordemServico.update({
      where: { id },
      data: {
        status: "CANCELADA",
        canceladaEm: new Date()
      },
      include: {
        tipoEquipamento: true,
        tecnico: true,
        solicitante: { select: { nome: true } },
        Setor: true,
        equipamento: {
          select: {
            nomeEquipamento: true,
            marca: true,
            modelo: true,
            numeroSerie: true,
          }
        }
      }
    });
  }

  // ===== SERVICE =====
  async listarPorTecnico(tecnicoId, filtros = {}) {
  const whereCondition = {
    tecnicoId: tecnicoId
  };

  if (filtros.status) {
    whereCondition.status = filtros.status;
  }

  if (filtros.preventiva !== undefined) {
    whereCondition.preventiva = filtros.preventiva === 'true' || filtros.preventiva === true;
  }

  if (filtros.prioridade) {
    whereCondition.prioridade = filtros.prioridade;
  }

  if (filtros.dataInicio || filtros.dataFim) {
    const campoData = filtros.status === 'CONCLUIDA' ? 'finalizadoEm' : 
                     filtros.status === 'CANCELADA' ? 'canceladaEm' :
                     filtros.status === 'EM_ANDAMENTO' ? 'iniciadaEm' : 'criadoEm';

    whereCondition[campoData] = {};

    if (filtros.dataInicio) {
      whereCondition[campoData].gte = new Date(filtros.dataInicio);
    }
    
    if (filtros.dataFim) {
      const dataFim = new Date(filtros.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      whereCondition[campoData].lte = dataFim;
    }
  }

  let orderBy;
  if (filtros.status === 'CONCLUIDA' || filtros.status === 'CANCELADA') {
    orderBy = { finalizadoEm: 'desc' };
  } else {
    orderBy = [
      { dataAgendada: 'asc' },
      { criadoEm: 'desc' }
    ];
  }

  const ordens = await prisma.ordemServico.findMany({
    where: whereCondition,
    include: {
      tipoEquipamento: true,
      tecnico: true,
      Setor: true,
      solicitante: { select: { nome: true } },
      equipamento: {
        select: {
          nomeEquipamento: true,
          marca: true,
          modelo: true,
          numeroSerie: true,
        }
      },
      acompanhamentos: {
        select: {
          id: true,
          descricao: true,
          criadoEm: true,
          arquivos: true, // ADICIONADO: Incluir arquivos
          criadoPor: {
            select: { nome: true, email: true }
          }
        },
        orderBy: { criadoEm: 'asc' }
      }
    },
    orderBy: orderBy
  });

  if (filtros.status === 'ABERTA' || !filtros.status) {
    return ordens.map(os => ({
      ...os,
      criadoEm: os.criadoEm
        ? os.criadoEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : null,
      iniciadaEm: os.iniciadaEm
        ? os.iniciadaEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : null,
      finalizadoEm: os.finalizadoEm
        ? os.finalizadoEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : null,
      canceladaEm: os.canceladaEm
        ? os.canceladaEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : null,
      dataAgendada: os.dataAgendada
        ? os.dataAgendada.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : null,
      acompanhamentos: os.acompanhamentos.map(acomp => ({
        ...acomp,
        criadoEm: acomp.criadoEm
          ? acomp.criadoEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
          : null
      }))
    }));
  }

  return ordens.map(os => ({
    ...os,
    acompanhamentos: os.acompanhamentos.map(acomp => ({
      ...acomp,
      criadoEm: acomp.criadoEm
        ? acomp.criadoEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : null
    }))
  }));
}

  async listarPreventivasPorTecnico(tecnicoId) {
  const ordens = await prisma.ordemServico.findMany({
    where: {
      tecnicoId,
      status: "ABERTA",
      preventiva: true,
      NOT: { dataAgendada: null }
    },
    include: {
      tecnico: true,
      tipoEquipamento: true,
      equipamento: {
        select: {
          nomeEquipamento: true,
          marca: true,
          modelo: true,
          numeroSerie: true,
        }
      },
      solicitante: { select: { nome: true } },
      Setor: true,
      acompanhamentos: {
        select: {
          id: true,
          descricao: true,
          criadoEm: true,
          arquivos: true, // ADICIONADO: Incluir arquivos
          criadoPor: {
            select: { nome: true, email: true }
          }
        },
        orderBy: { criadoEm: 'asc' }
      }
    },
    orderBy: [
      { dataAgendada: 'asc' },
      { criadoEm: 'desc' }
    ]
  });

  return ordens.map(os => ({
    ...os,
    criadoEm: os.criadoEm
      ? os.criadoEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : null,
    dataAgendada: os.dataAgendada
      ? os.dataAgendada.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : null,
    acompanhamentos: os.acompanhamentos.map(acomp => ({
      ...acomp,
      criadoEm: acomp.criadoEm
        ? acomp.criadoEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : null
    }))
  }));
}

  async listarPorSolicitante(solicitanteId, filtros = {}) {
  const { status, dataInicio, dataFim, preventiva } = filtros;

  const whereClause = {
    solicitanteId: solicitanteId
  };

  if (status && status !== 'TODAS') {
    whereClause.status = status;
  }

  if (preventiva !== undefined && preventiva !== null && preventiva !== '') {
    whereClause.preventiva = preventiva === 'true' || preventiva === true;
  }

  if (dataInicio || dataFim) {
    whereClause.criadoEm = {};
    
    if (dataInicio) {
      const inicio = new Date(dataInicio);
      inicio.setHours(0, 0, 0, 0);
      whereClause.criadoEm.gte = inicio;
    }
    
    if (dataFim) {
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      whereClause.criadoEm.lte = fim;
    }
  }

  const ordens = await prisma.ordemServico.findMany({
    where: whereClause,
    select: {
      id: true,
      descricao: true,
      preventiva: true,
      prioridade: true,
      status: true,
      criadoEm: true,
      iniciadaEm: true,
      finalizadoEm: true,
      canceladaEm: true,
      dataAgendada: true,
      valorManutencao: true,
      resolucao: true,
      tipoEquipamento: {
        select: {
          id: true,
          nome: true
        }
      },
      tecnico: {
        select: {
          id: true,
          nome: true
        }
      },
      solicitante: { 
        select: { 
          nome: true 
        } 
      },
      Setor: {
        select: {
          id: true,
          nome: true
        }
      },
      equipamento: {
        select: {
          nomeEquipamento: true,
          marca: true,
          modelo: true,
          numeroSerie: true,
          numeroPatrimonio: true
        }
      },
      acompanhamentos: {
        select: {
          id: true,
          descricao: true,
          criadoEm: true,
          arquivos: true, // ADICIONADO: Incluir arquivos
          criadoPor: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        },
        orderBy: {
          criadoEm: 'desc'
        }
      }
    },
    orderBy: [
      {
        status: 'asc'
      },
      {
        prioridade: 'desc'
      },
      {
        criadoEm: 'desc'
      }
    ]
  });

  const ordensFormatadas = ordens.map(os => ({
    ...os,
    criadoEm: os.criadoEm
      ? os.criadoEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : null,
    iniciadaEm: os.iniciadaEm
      ? os.iniciadaEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : null,
    finalizadoEm: os.finalizadoEm
      ? os.finalizadoEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : null,
    canceladaEm: os.canceladaEm
      ? os.canceladaEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : null,
    dataAgendada: os.dataAgendada
      ? os.dataAgendada.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      : null,
    valorManutencao: os.valorManutencao ? Number(os.valorManutencao) : null,
    acompanhamentos: os.acompanhamentos.map(acomp => ({
      ...acomp,
      criadoEm: acomp.criadoEm
        ? acomp.criadoEm.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
        : null
    }))
  }));

  const estatisticas = {
    total: ordensFormatadas.length,
    abertas: ordensFormatadas.filter(os => os.status === 'ABERTA').length,
    emAndamento: ordensFormatadas.filter(os => os.status === 'EM_ANDAMENTO').length,
    concluidas: ordensFormatadas.filter(os => os.status === 'CONCLUIDA').length,
    canceladas: ordensFormatadas.filter(os => os.status === 'CANCELADA').length,
    preventivas: ordensFormatadas.filter(os => os.preventiva === true).length,
    corretivas: ordensFormatadas.filter(os => os.preventiva === false).length,
    valorTotal: ordensFormatadas.reduce((acc, os) => {
      return acc + (os.valorManutencao || 0);
    }, 0)
  };

  return {
    ordens: ordensFormatadas,
    estatisticas,
    filtrosAplicados: {
      status: status || 'TODAS',
      dataInicio: dataInicio || null,
      dataFim: dataFim || null,
      preventiva: preventiva !== undefined ? preventiva : null
    }
  };
}

  // envia notificação quando um acompanhament é registrado
  async criarAcompanhamento({ userId, ordemServicoId, descricao, files = [] }) {
  const os = await prisma.ordemServico.findUnique({
    where: { id: ordemServicoId },
    include: {
      solicitante: true,
      tecnico: true,
      equipamento: {
        select: {
          nomeEquipamento: true,
          numeroPatrimonio: true,
          numeroSerie: true,
        }
      },
      Setor: true
    },
  });

  if (!os) {
    throw new Error("Ordem de Serviço não encontrada.");
  }

  // Buscar informações do usuário incluindo o técnico vinculado
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
    include: {
      tecnico: true
    }
  });

  if (!usuario) {
    throw new Error("Usuário não encontrado.");
  }

  // Mapear os arquivos para um array de caminhos
  const caminhos = files.map(file => file.path);

  const acompanhamento = await prisma.acompanhamentoOS.create({
    data: {
      ordemServicoId,
      descricao,
      criadoPorId: userId,
      arquivos: caminhos, // ADICIONADO: Salvar os caminhos dos arquivos
    },
    include: {
      criadoPor: { select: { id: true, nome: true, email: true } },
    },
  });

  // ====== ENVIO DE NOTIFICAÇÕES ======
  await this.enviarNotificacoesAcompanhamento(os, acompanhamento, usuario);

  return acompanhamento;
}

  // Novo método para enviar notificações de acompanhamento
  async enviarNotificacoesAcompanhamento(os, acompanhamento, usuarioQueRegistrou) {
    const emailsParaNotificar = [];

    // Adiciona o email do solicitante (se não foi ele quem registrou)
    if (os.solicitante && os.solicitante.email && os.solicitante.id !== usuarioQueRegistrou.id) {
      emailsParaNotificar.push({
        email: os.solicitante.email,
        nome: os.solicitante.nome,
        tipo: 'solicitante'
      });
    }

    // Adiciona o email do técnico (se não foi ele quem registrou)
    if (os.tecnico && os.tecnico.email && os.tecnico.id !== usuarioQueRegistrou.id) {
      emailsParaNotificar.push({
        email: os.tecnico.email,
        nome: os.tecnico.nome,
        tipo: 'tecnico'
      });
    }

    // Envia emails para todos os destinatários
    for (const destinatario of emailsParaNotificar) {
      const htmlTemplate = this.gerarTemplateEmailAcompanhamento(
        os,
        acompanhamento,
        usuarioQueRegistrou,
        destinatario
      );

      const emailData = {
        to: destinatario.email,
        subject: `Nova Atualização na OS #${os.id} - ${os.preventiva ? 'Preventiva' : 'Corretiva'}`,
        html: htmlTemplate
      };

      try {
        await emailUtils.enviarEmail(emailData);
        console.log(`Email de acompanhamento enviado para ${destinatario.email} - OS #${os.id}`);
      } catch (error) {
        console.error('Erro ao enviar email de acompanhamento:', error);
      }
    }

    // Notificação no Telegram (opcional - apenas para o técnico)
    if (os.tecnico &&
      os.tecnico.telegramChatId &&
      os.tecnico.id !== usuarioQueRegistrou.id) {

      let msg = `🔔 <b>Nova Atualização na OS #${os.id}</b>\n\n`;
      msg += `👤 Registrado por: ${usuarioQueRegistrou.nome}\n`;
      msg += `📝 Descrição: ${os.descricao}\n`;
      msg += `💬 Acompanhamento: ${acompanhamento.descricao}\n`;
      msg += `📅 Data: ${new Date().toLocaleString('pt-BR')}`;

      try {
        await enviarNotificacaoTelegram(os.tecnico.telegramChatId, msg);
      } catch (error) {
        console.error('Erro ao enviar notificação Telegram:', error);
      }
    }
  }

  // Template de email para acompanhamento
  gerarTemplateEmailAcompanhamento(os, acompanhamento, usuarioQueRegistrou, destinatario) {
    const prioridadeEmoji = this.getPrioridadeEmoji(os.prioridade);
    const prioridadeTexto = this.getPrioridadeTexto(os.prioridade);

    const corPrioridade = {
      BAIXO: '#10b981',
      MEDIO: '#f59e0b',
      ALTO: '#f97316',
      URGENTE: '#ef4444'
    };

    const cor = corPrioridade[os.prioridade] || '#f59e0b';

    const corStatus = {
      ABERTA: '#3b82f6',
      EM_ANDAMENTO: '#f59e0b',
      CONCLUIDA: '#10b981',
      CANCELADA: '#ef4444'
    };

    const statusCor = corStatus[os.status] || '#3b82f6';

    const statusTexto = {
      ABERTA: 'Aberta',
      EM_ANDAMENTO: 'Em Andamento',
      CONCLUIDA: 'Concluída',
      CANCELADA: 'Cancelada'
    };

    return `
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Atualização na Ordem de Serviço</title>
    </head>
    <body style="margin:0; padding:0; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color:#f8fafc; line-height:1.6;">
      <div style="max-width:600px; margin:0 auto; background-color:#ffffff; box-shadow:0 10px 25px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background:linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%); padding:40px 30px; text-align:center;">
          <div style="background-color:rgba(255,255,255,0.15); width:80px; height:80px; border-radius:50%; margin:0 auto 20px; display:flex; align-items:center; justify-content:center;">
            <div style="font-size:36px;">🔔</div>
          </div>
          <h1 style="color:#ffffff; margin:0; font-size:28px; font-weight:700; text-shadow:0 2px 4px rgba(0,0,0,0.1);">
            Nova Atualização na OS #${os.id}
          </h1>
          <p style="color:rgba(255,255,255,0.9); margin:10px 0 0; font-size:16px;">
            ${usuarioQueRegistrou.nome} adicionou um acompanhamento
          </p>
        </div>

        <!-- Content -->
        <div style="padding:40px 30px;">

          <!-- Greeting -->
          <p style="color:#1e293b; font-size:16px; margin:0 0 25px;">
            Olá <strong>${destinatario.nome}</strong>,
          </p>

          <!-- Status e Prioridade -->
          <div style="text-align:center; margin-bottom:30px;">
            <div style="display:inline-block; background-color:${statusCor}; color:#ffffff; padding:8px 16px; border-radius:20px; font-size:14px; font-weight:600; margin:5px;">
              Status: ${statusTexto[os.status] || 'Aberta'}
            </div>
            <div style="display:inline-block; background-color:${cor}; color:#ffffff; padding:8px 16px; border-radius:20px; font-size:14px; font-weight:600; margin:5px;">
              ${prioridadeEmoji} ${prioridadeTexto}
            </div>
          </div>

          <!-- Acompanhamento em Destaque -->
          <div style="background:linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-left:4px solid #3b82f6; border-radius:12px; padding:25px; margin-bottom:30px;">
            <div style="display:flex; align-items:center; margin-bottom:15px;">
              <div style="background-color:#3b82f6; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-right:15px;">
                <span style="color:#ffffff; font-size:20px;">💬</span>
              </div>
              <div>
                <h3 style="color:#1e293b; margin:0; font-size:16px; font-weight:600;">
                  Novo Acompanhamento
                </h3>
                <p style="color:#64748b; margin:5px 0 0; font-size:13px;">
                  ${new Date(acompanhamento.criadoEm).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
                </p>
              </div>
            </div>
            <p style="color:#0f172a; font-size:15px; line-height:1.7; margin:0; white-space:pre-wrap;">
              ${acompanhamento.descricao}
            </p>
            <p style="color:#64748b; font-size:13px; margin:15px 0 0; font-style:italic;">
              Registrado por: ${usuarioQueRegistrou.nome}
            </p>
          </div>

          <!-- Detalhes da OS -->
          <div style="background-color:#f8fafc; border-radius:12px; padding:25px; margin-bottom:30px;">
            <h3 style="color:#0f172a; font-size:18px; margin:0 0 20px; font-weight:600;">
              📋 Detalhes da Ordem de Serviço
            </h3>

            <!-- Descrição -->
            <div style="margin-bottom:15px;">
              <span style="color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
                Descrição
              </span>
              <p style="color:#1e293b; font-size:15px; margin:5px 0 0;">
                ${os.descricao}
              </p>
            </div>

            <!-- Técnico -->
            ${os.tecnico ? `
            <div style="margin-bottom:15px;">
              <span style="color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
                🔧 Técnico Responsável
              </span>
              <p style="color:#1e293b; font-size:15px; margin:5px 0 0;">
                ${os.tecnico.nome}
              </p>
            </div>` : ''}

            <!-- Setor -->
            ${os.Setor ? `
            <div style="margin-bottom:15px;">
              <span style="color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
                📍 Setor
              </span>
              <p style="color:#1e293b; font-size:15px; margin:5px 0 0;">
                ${os.Setor.nome}
              </p>
            </div>` : ''}

            <!-- Equipamento -->
            ${os.equipamento ? `
            <div style="margin-bottom:15px;">
              <span style="color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
                ⚙️ Equipamento
              </span>
              <p style="color:#1e293b; font-size:15px; margin:5px 0 0;">
                ${os.equipamento.nomeEquipamento || 'Não informado'}<br>
                <span style="font-size:13px; color:#64748b;">
                  Patrimônio: ${os.equipamento.numeroPatrimonio || 'N/I'} | 
                  N° Série: ${os.equipamento.numeroSerie || 'N/I'}
                </span>
              </p>
            </div>` : ''}

            <!-- Data de Criação -->
            <div>
              <span style="color:#64748b; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px;">
                📅 Criada em
              </span>
              <p style="color:#1e293b; font-size:15px; margin:5px 0 0;">
                ${new Date(os.criadoEm).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}
              </p>
            </div>
          </div>

          <!-- CTA -->
          <div style="text-align:center; margin-bottom:30px;">
            <a href="${process.env.APP_URL || '#'}" style="display:inline-block; background:linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%); padding:14px 35px; border-radius:8px; text-decoration:none; color:#ffffff; font-weight:600; font-size:16px; box-shadow:0 4px 15px rgba(59,130,246,0.3);">
              🔗 Visualizar OS Completa
            </a>
          </div>

          <!-- Info -->
          <div style="background-color:#fef3c7; border-left:4px solid #f59e0b; border-radius:8px; padding:15px; margin-bottom:20px;">
            <p style="color:#92400e; font-size:14px; margin:0;">
              <strong>💡 Dica:</strong> Você pode responder a este acompanhamento adicionando outro comentário no sistema.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color:#f8fafc; padding:30px; text-align:center; border-top:1px solid #e2e8f0;">
          <p style="color:#64748b; font-size:14px; margin:0 0 10px;">
            <strong>Sistema de Gestão de Ordens de Serviço</strong>
          </p>
          <p style="color:#94a3b8; font-size:12px; margin:0; line-height:1.5;">
            Este é um e-mail automático. Você está recebendo porque está envolvido nesta OS.<br>
            Para responder, acesse o sistema e adicione um acompanhamento.
          </p>
        </div>

      </div>
    </body>
    </html>`;
  }
}

module.exports = new OrdemServicoService();