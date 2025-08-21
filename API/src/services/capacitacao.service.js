const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const nodemailer = require('nodemailer');

// Configuração do transporter (SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // Gmail com porta 587 usa STARTTLS, então deixe false
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const getAllCapacitacoes = async () => {
  return prisma.capacitacao.findMany({
    include: {
      tipoDocumento: true,
      participantes: { include: { funcionario: true } }
    },
    orderBy: { data: 'desc' }
  });
};

const getCapacitacaoById = async (id) => {
  return prisma.capacitacao.findUnique({
    where: { id: parseInt(id) },
    include: {
      tipoDocumento: true,
      participantes: { include: { funcionario: true } }
    }
  });
};

const createCapacitacao = async (data) => {
  const { titulo, dataEvento, local, instrutor, tipoDocumentoId, participantesIds = [], arquivoPdf } = data;

  // Lista de campos obrigatórios
  const obrigatorios = { titulo, dataEvento, tipoDocumentoId };
  const faltando = Object.entries(obrigatorios)
    .filter(([_, valor]) => valor === undefined || valor === null || valor === '')
    .map(([campo]) => campo);

  if (faltando.length > 0) {
    throw new Error(`Campos obrigatórios faltando: ${faltando.join(', ')}`);
  }

  const capacitacao = await prisma.capacitacao.create({
    data: {
      titulo,
      data: new Date(dataEvento),
      local,
      instrutor,
      tipoDocumentoId: parseInt(tipoDocumentoId),
      arquivoPdf,
      participantes: {
        create: participantesIds.map((id) => ({
          funcionarioId: parseInt(id)
        }))
      }
    },
    include: {
      participantes: {
        include: { funcionario: true }
      }
    }
  });

  // Envio de e-mails (opcional)
  await Promise.all(
    capacitacao.participantes.map(async (p) => {
      const func = p.funcionario;
      if (func.email) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM,
          to: func.email,
          subject: `Nova Capacitação: ${capacitacao.titulo}`,
          html: `
            <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nova Capacitação Disponível</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 40px 30px; text-align: center;">
          <div style="background-color: rgba(255, 255, 255, 0.15); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <div style="font-size: 36px;">🎓</div>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            Nova Capacitação Disponível
          </h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0; font-size: 16px;">
            Você foi selecionado para participar
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          
          <!-- Training Title -->
          <div style="text-align: center; margin-bottom: 35px;">
            <h2 style="color: #1e293b; font-size: 24px; font-weight: 600; margin: 0 0 10px; line-height: 1.3;">
              ${capacitacao.titulo}
            </h2>
            <div style="width: 60px; height: 3px; background: linear-gradient(90deg, #2563eb, #1d4ed8); margin: 0 auto; border-radius: 2px;"></div>
          </div>

          <!-- Training Details -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #2563eb;">
            
            <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
              <div style="background-color: #dbeafe; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                <span style="font-size: 18px;">📅</span>
              </div>
              <div>
                <h3 style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Data e Horário
                </h3>
                <p style="color: #1e293b; font-size: 16px; font-weight: 500; margin: 0;">
                  ${capacitacao.data}
                </p>
              </div>
            </div>

            <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
              <div style="background-color: #dbeafe; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                <span style="font-size: 18px;">📍</span>
              </div>
              <div>
                <h3 style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Local
                </h3>
                <p style="color: #1e293b; font-size: 16px; font-weight: 500; margin: 0;">
                  ${capacitacao.local || 'A definir'}
                </p>
              </div>
            </div>

            <div style="display: flex; align-items: flex-start; margin-bottom: 20px;">
              <div style="background-color: #dbeafe; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0;">
                <span style="font-size: 18px;">👨‍🏫</span>
              </div>
              <div>
                <h3 style="color: #374151; font-size: 14px; font-weight: 600; margin: 0 0 5px; text-transform: uppercase; letter-spacing: 0.5px;">
                  Instrutor
                </h3>
                <p style="color: #1e293b; font-size: 16px; font-weight: 500; margin: 0;">
                  ${capacitacao.instrutor || 'A definir'}
                </p>
              </div>
            </div>


          </div>

          <!-- Message -->
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border: 1px solid #bae6fd;">
            <p style="color: #0f172a; font-size: 16px; margin: 0; text-align: center; line-height: 1.6;">
              <strong>Parabéns!</strong> Você foi selecionado para participar desta capacitação. 
              Esta é uma excelente oportunidade para desenvolver suas habilidades e expandir seus conhecimentos.
            </p>
          </div>

          <!-- Call to Action -->
          <div style="text-align: center; margin-bottom: 30px;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 20px;">
              Fique atento às próximas comunicações com mais detalhes sobre a capacitação.
            </p>
            <div style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 12px 30px; border-radius: 8px; text-decoration: none; color: #ffffff; font-weight: 600; font-size: 16px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);">
              📚 Prepare-se para aprender!
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 10px;">
            <strong>Departamento de Recursos Humanos</strong>
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.5;">
            Este é um e-mail automático do sistema de gestão de capacitações.<br>
            Para dúvidas, entre em contato com o RH.
          </p>
        </div>

      </div>
    </body>
    </html>
          `
        });
      }
    })
  );

  return capacitacao;
};

module.exports = {
  getAllCapacitacoes,
  getCapacitacaoById,
  createCapacitacao
};
