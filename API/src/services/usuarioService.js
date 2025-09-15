const prisma = require('../config/prismaClient');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const criarUsuario = async (dados) => {
  const { nome, email, senha, papel, tecnicoId, modulos } = dados;

  const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
  if (usuarioExistente) throw new Error('E-mail já cadastrado');

  const senhaCriptografada = await bcrypt.hash(senha, 10);

  const novoUsuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: senhaCriptografada,
      papel,
      tecnicoId: tecnicoId ? parseInt(tecnicoId) : null,
      modulos: modulos
        ? {
            create: modulos.map((moduloId) => ({
              modulo: { connect: { id: moduloId } },
            })),
          }
        : undefined,
    },
    include: {
      modulos: { include: { modulo: true } },
      tecnico: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          matricula: true,
          ativo: true,
          grupo: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      }
    },
  });

  const { senha: _, ...usuarioSemSenha } = novoUsuario;
  return usuarioSemSenha;
};
const atualizarUsuario = async (usuarioId, dados) => {
  const { nome, email, papel, tecnicoId, modulos } = dados;

  // Converter usuarioId para número se necessário
  const id = parseInt(usuarioId);
  if (isNaN(id)) {
    throw new Error('ID do usuário deve ser um número válido');
  }

  // Usar transação para garantir consistência
  return await prisma.$transaction(async (tx) => {
    // Verificar se o usuário existe
    const usuarioExistente = await tx.usuario.findUnique({
      where: { id },
      include: {
        modulos: { include: { modulo: true } }
      }
    });

    if (!usuarioExistente) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se o email já está em uso por outro usuário
    if (email && email !== usuarioExistente.email) {
      const emailEmUso = await tx.usuario.findUnique({
        where: { email: email.trim().toLowerCase() }
      });
      
      if (emailEmUso) {
        throw new Error('E-mail já está sendo usado por outro usuário');
      }
    }

    // Validar se os módulos existem (se fornecidos)
    if (modulos && Array.isArray(modulos) && modulos.length > 0) {
      const modulosExistentes = await tx.modulo.findMany({
        where: {
          id: { in: modulos.map(m => parseInt(m)) }
        }
      });

      if (modulosExistentes.length !== modulos.length) {
        throw new Error('Um ou mais módulos não foram encontrados');
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {};

    if (nome !== undefined && nome !== null) {
      dadosAtualizacao.nome = nome.trim();
    }
    
    if (email !== undefined && email !== null) {
      dadosAtualizacao.email = email.trim().toLowerCase();
    }
    
    if (papel !== undefined && papel !== null) {
      dadosAtualizacao.papel = papel;
    }
    
    // Tratar tecnicoId com cuidado
    if (tecnicoId !== undefined) {
      if (tecnicoId === null || tecnicoId === '' || tecnicoId === 0) {
        dadosAtualizacao.tecnicoId = null;
      } else {
        const tecnicoIdNum = parseInt(tecnicoId);
        if (isNaN(tecnicoIdNum)) {
          throw new Error('ID do técnico deve ser um número válido');
        }
        
        // Verificar se o técnico existe
        const tecnicoExiste = await tx.tecnico.findUnique({
          where: { id: tecnicoIdNum }
        });
        
        if (!tecnicoExiste) {
          throw new Error('Técnico não encontrado');
        }
        
        dadosAtualizacao.tecnicoId = tecnicoIdNum;
      }
    }

    // Atualizar usuário
    let usuarioAtualizado = await tx.usuario.update({
      where: { id },
      data: dadosAtualizacao,
      include: {
        modulos: { include: { modulo: true } },
        tecnico: {
          select: {
            id: true,
            nome: true,
            email: true,
            telefone: true,
            matricula: true,
            ativo: true,
            grupo: {
              select: {
                id: true,
                nome: true
              }
            }
          }
        }
      }
    });

    // Atualizar módulos se fornecidos
    if (modulos !== undefined) {
      // Remover todos os módulos atuais
      await tx.usuarioModulo.deleteMany({
        where: { usuarioId: id }
      });

      // Adicionar os novos módulos
      if (Array.isArray(modulos) && modulos.length > 0) {
        const modulosParaCriar = modulos
          .filter(moduloId => moduloId !== null && moduloId !== undefined)
          .map(moduloId => ({
            usuarioId: id,
            moduloId: parseInt(moduloId)
          }));

        if (modulosParaCriar.length > 0) {
          await tx.usuarioModulo.createMany({
            data: modulosParaCriar
          });
        }
      }

      // Buscar o usuário atualizado com os novos módulos
      usuarioAtualizado = await tx.usuario.findUnique({
        where: { id },
        include: {
          modulos: { include: { modulo: true } },
          tecnico: {
            select: {
              id: true,
              nome: true,
              email: true,
              telefone: true,
              matricula: true,
              ativo: true,
              grupo: {
                select: {
                  id: true,
                  nome: true
                }
              }
            }
          }
        }
      });
    }

    // Remover senha do retorno
    const { senha: _, ...usuarioSemSenha } = usuarioAtualizado;
    return usuarioSemSenha;
  });
};
const buscarPorId = async (id) => {
  const usuario = await prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      tecnicoId: true,
      modulos: {
        select: {
          ativo: true,
          dataVinculo: true,
          modulo: {
            select: { id: true, nome: true, descricao: true },
          },
        },
      },
      tecnico: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          matricula: true,
          ativo: true,
          grupo: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      }
    },
  });
  return usuario;
};

const login = async ({ email, senha }) => {
  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: {
      modulos: { include: { modulo: true } },
      tecnico: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          matricula: true,
          ativo: true,
          grupo: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      }
    },
  });
  if (!usuario) throw new Error('Usuário não encontrado');

  const senhaValida = await bcrypt.compare(senha, usuario.senha);
  if (!senhaValida) throw new Error('Senha inválida');

  const token = jwt.sign(
    { id: usuario.id, papel: usuario.papel },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return token;
};

const listarTodos = async () => {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      tecnicoId: true,
      modulos: {
        select: {
          ativo: true,
          dataVinculo: true,
          modulo: {
            select: { id: true, nome: true },
          },
        },
      },
      tecnico: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          matricula: true,
          ativo: true,
          grupo: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      }
    },
    orderBy: { nome: 'asc' },
  });
  return usuarios;
};
const atualizarSenha = async (usuarioId, { senhaAtual, novaSenha }) => {
  // Buscar o usuário com a senha para validação
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId }
  });
  
  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  // Verificar se a senha atual está correta
  const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
  if (!senhaValida) {
    throw new Error('Senha atual incorreta');
  }

  // Criptografar a nova senha
  const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10);

  // Atualizar a senha no banco
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { senha: novaSenhaCriptografada }
  });

  return { mensagem: 'Senha atualizada com sucesso' };
};

// Função para redefinir senha (para admin resetar senha de qualquer usuário)
const redefinirSenha = async (usuarioId, { novaSenha }) => {
  // Verificar se o usuário existe
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: { id: true, nome: true, email: true }
  });
  
  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  // Criptografar a nova senha
  const novaSenhaCriptografada = await bcrypt.hash(novaSenha, 10);

  // Atualizar a senha no banco
  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { senha: novaSenhaCriptografada }
  });

  return { 
    mensagem: 'Senha redefinida com sucesso',
    usuario: usuario.nome,
    email: usuario.email
  };
};
// Função adicional para buscar apenas usuários que são técnicos
const listarUsuariosTecnicos = async () => {
  const usuariosTecnicos = await prisma.usuario.findMany({
    where: {
      tecnicoId: { not: null }
    },
    select: {
      id: true,
      nome: true,
      email: true,
      papel: true,
      tecnicoId: true,
      modulos: {
        select: {
          ativo: true,
          dataVinculo: true,
          modulo: {
            select: { id: true, nome: true },
          },
        },
      },
      tecnico: {
        select: {
          id: true,
          nome: true,
          email: true,
          telefone: true,
          matricula: true,
          ativo: true,
          grupo: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      }
    },
    orderBy: { nome: 'asc' },
  });
  return usuariosTecnicos;
};

// Função para buscar técnicos disponíveis (não vinculados a usuários)
const listarTecnicosDisponiveis = async () => {
  const tecnicosDisponiveis = await prisma.tecnico.findMany({
    where: {
      Usuario: {
        none: {} // Técnicos que não têm usuários associados
      },
      ativo: true
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      matricula: true,
      ativo: true,
      grupo: {
        select: {
          id: true,
          nome: true
        }
      }
    },
    orderBy: { nome: 'asc' }
  });
  return tecnicosDisponiveis;
};

module.exports = {
  criarUsuario,
  login,
  buscarPorId,
  listarTodos,
  listarUsuariosTecnicos,
  listarTecnicosDisponiveis,
  atualizarSenha,      // Nova função
  redefinirSenha,      // Nova função
  atualizarUsuario,

};