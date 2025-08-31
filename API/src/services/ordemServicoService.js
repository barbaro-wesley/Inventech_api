const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const enviarNotificacaoTelegram = require('../utils/telegram');
const emailUtils = require('../utils/email_utility');
class OrdemServicoService {
  async criar(data) {
    const novaOS = await prisma.ordemServico.create({
      data: {
        ...data,
        preventiva: data.preventiva,
        dataAgendada: data.dataAgendada ?? null,
        recorrencia: data.recorrencia ?? 'NENHUMA',
        intervaloDias: data.intervaloDias ?? null,
        arquivos: data.arquivos || [],
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

    // Notificação no Telegram (mantém a funcionalidade existente)
    if (novaOS.tecnico && novaOS.tecnico.telegramChatId) {
      let msg = `📄 <b>Nova OS Atribuída</b>\n\n`;
      msg += `🔧 Técnico: ${novaOS.tecnico.nome}\n`;
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

      await enviarNotificacaoTelegram(novaOS.tecnico.telegramChatId, msg);
    }

    // Notificação por Email (nova funcionalidade)
    if (novaOS.tecnico && novaOS.tecnico.email) {
      const htmlTemplate = this.gerarTemplateEmail(novaOS);
      
      const emailData = {
        to: novaOS.tecnico.email,
        subject: `Nova Ordem de Serviço Atribuída - OS #${novaOS.id}`,
        html: htmlTemplate
      };

      try {
        await emailUtils.enviarEmail(emailData);
        console.log(`Email enviado para ${novaOS.tecnico.email} - OS #${novaOS.id}`);
      } catch (error) {
        console.error('Erro ao enviar email:', error);
      }
    }

    return novaOS;
  }

  gerarTemplateEmail(novaOS) {
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

          <!-- Title -->
          <div style="text-align:center; margin-bottom:35px;">
            <h2 style="color:#1e293b; font-size:24px; font-weight:600; margin:0 0 10px; line-height:1.3;">
              ${novaOS.descricao || 'Sem descrição'}
            </h2>
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

  async listar() {
    const [preventivas, corretivas] = await Promise.all([
      prisma.ordemServico.findMany({
        where: { preventiva: true },
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
          }
        },
      }),
      prisma.ordemServico.findMany({
        where: { preventiva: false },
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
          }
        },
      }),
    ]);

    const totalManutencao = [...preventivas, ...corretivas].reduce((acc, os) => {
      const valor = os.valorManutencao ? Number(os.valorManutencao) : 0;
      return acc + valor;
    }, 0);

    return {
      preventivas,
      corretivas,
      totalManutencao,
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
    return await prisma.ordemServico.update({
      where: { id },
      data,
    });
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

  async listarPorTecnico(tecnicoId) {
    return await prisma.ordemServico.findMany({
      where: {
        tecnicoId: tecnicoId,
        status: "ABERTA"
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
      },
      orderBy: {
        criadoEm: 'desc',
      },
    });
  }

  async listarPorTecnicoEmAndamento(tecnicoId) {
    return await prisma.ordemServico.findMany({
      where: {
        tecnicoId: tecnicoId,
        status: "EM_ANDAMENTO"
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
      },
      orderBy: {
        criadoEm: 'desc',
      }
    });
  }

  async listarPorTecnicoConcluida(tecnicoId) {
    return await prisma.ordemServico.findMany({
      where: {
        tecnicoId: tecnicoId,
        status: "CONCLUIDA"
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
      },
      orderBy: {
        criadoEm: 'desc',
      }
    });
  }

  async listarPorTecnicoCancelada(tecnicoId) {
    return await prisma.ordemServico.findMany({
      where: {
        tecnicoId: tecnicoId,
        status: "CANCELADA"
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
      },
      orderBy: {
        criadoEm: 'desc',
      }
    });
  }
}

module.exports = new OrdemServicoService();