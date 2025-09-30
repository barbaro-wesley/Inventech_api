// services/cailunService.js - Service completo com autenticação e operações de pastas
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require("axios");
const Redis = require("ioredis");
const fsSync = require('fs');  // Para métodos síncronos
const fs = require('fs').promises;  // Para métodos assíncronos

const redis = new Redis(process.env.REDIS_URL);
const path = require('path');
const CAILUN_BASE_URL = process.env.CAILUN_URL;
const CAILUN_EMAIL = process.env.CAILUN_EMAIL;
const CAILUN_PASSWORD = process.env.CAILUN_PASSWORD;
const BASE_STORAGE_PATH = process.env.STORAGE_PATH || './storage/folders';
// ==========================================
// Login
// ==========================================

async function loginCailun() {
  try {
    console.log('🔐 Tentando fazer login na API Cailun...');

    const response = await axios.post(`${CAILUN_BASE_URL}/login`, {
      email: CAILUN_EMAIL,
      password: CAILUN_PASSWORD,
    });

    console.log('✅ Login realizado com sucesso!');
    console.log('📊 Dados recebidos:', JSON.stringify(response.data, null, 2));

    const token = response.data.accessToken?.token;
    const expireAt = response.data.accessToken?.expireAt;

    if (token) {
      let ttl;

      if (expireAt && expireAt > 0) {
        const now = Math.floor(Date.now() / 1000);

        if (expireAt > now) {
          // É um timestamp Unix válido
          ttl = expireAt - now - 60; // menos 1 min de segurança
          console.log(`⏰ Usando TTL calculado: ${ttl} segundos`);
        } else if (expireAt > 3600) {
          // Parece ser um valor em segundos (maior que 1 hora)
          ttl = Math.min(expireAt - 60, 86400); // máximo de 24 horas, menos 1 min de segurança
          console.log(`⏰ Usando TTL do expireAt: ${ttl} segundos`);
        } else {
          // Valor muito baixo, usar padrão
          ttl = 3600; // 1 hora padrão
          console.log(`⏰ ExpireAt muito baixo, usando TTL padrão: ${ttl} segundos`);
        }
      } else {
        // Sem expireAt válido, usar padrão
        ttl = 3600; // 1 hora padrão
        console.log(`⏰ Sem expireAt válido, usando TTL padrão: ${ttl} segundos`);
      }

      // Garantir que o TTL seja positivo e não muito alto
      if (ttl <= 0) {
        ttl = 3600; // 1 hora padrão
        console.log(`⚠️ TTL inválido, usando padrão: ${ttl} segundos`);
      }

      if (ttl > 86400) {
        ttl = 86400; // máximo de 24 horas
        console.log(`⚠️ TTL muito alto, limitando a: ${ttl} segundos`);
      }

      await redis.set("cailun:token", token, "EX", ttl);
      console.log(`💾 Token salvo no Redis com TTL de ${ttl} segundos`);

      // Calcular data de expiração baseada no TTL usado
      const expiresAt = new Date((Math.floor(Date.now() / 1000) + ttl) * 1000);

      return {
        success: true,
        token: token,
        expiresAt: expiresAt.toISOString(),
        ttl: ttl,
        originalExpireAt: expireAt
      };
    } else {
      throw new Error('Token não encontrado na resposta');
    }

  } catch (error) {
    console.error('❌ Erro no login:', error.message);

    if (error.response) {
      console.error('📄 Status:', error.response.status);
      console.error('📄 Response data:', JSON.stringify(error.response.data, null, 2));

      return {
        success: false,
        error: error.response.data?.message || error.message,
        status: error.response.status,
        statusText: error.response.statusText
      };
    }

    return {
      success: false,
      error: error.message
    };
  }
}

async function testToken() {
  try {
    const token = await redis.get("cailun:token");
    const ttl = await redis.ttl("cailun:token");

    if (!token) {
      return { hasToken: false, message: 'Nenhum token encontrado no Redis' };
    }

    console.log(`🔍 Token encontrado, TTL restante: ${ttl} segundos`);

    // Teste simples fazendo uma requisição com o token
    const response = await axios.get(`${CAILUN_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      hasToken: true,
      valid: true,
      ttlRemaining: ttl,
      message: 'Token válido',
      userInfo: response.data
    };

  } catch (error) {
    console.error('❌ Erro ao testar token:', error.response?.data || error.message);

    return {
      hasToken: true,
      valid: false,
      message: 'Token inválido ou expirado',
      error: error.response?.data || error.message
    };
  }
}

// Função para obter ou renovar token automaticamente
async function getValidToken() {
  try {
    // Primeiro, verifica se já existe um token válido
    const existingToken = await redis.get("cailun:token");
    const ttl = await redis.ttl("cailun:token");

    // Se existe token e ainda tem mais de 5 minutos de vida
    if (existingToken && ttl > 300) {
      console.log(`🔄 Usando token existente (TTL: ${ttl}s)`);
      return {
        success: true,
        token: existingToken,
        fromCache: true,
        ttlRemaining: ttl
      };
    }

    console.log('🔄 Token não existe ou está expirando, fazendo novo login...');
    const loginResult = await loginCailun();

    if (loginResult.success) {
      return {
        success: true,
        token: loginResult.token,
        fromCache: false,
        ttl: loginResult.ttl
      };
    }

    return loginResult;

  } catch (error) {
    console.error('❌ Erro ao obter token válido:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ==========================================
// FUNÇÕES DE OPERAÇÕES COM PASTAS
// ==========================================
async function createDirectory(dirPath) {
  try {
    console.log(`📂 Tentando criar diretório: ${dirPath}`);

    // Verificar se o diretório pai existe
    const parentDir = path.dirname(dirPath);
    console.log(`👨‍👩‍👧‍👦 Diretório pai: ${parentDir}`);

    await fs.mkdir(dirPath, { recursive: true });

    // Verificar se foi criado
    const stats = await fs.stat(dirPath);
    if (stats.isDirectory()) {
      console.log(`✅ Diretório criado com sucesso: ${dirPath}`);
      return true;
    } else {
      throw new Error('Caminho criado não é um diretório');
    }

  } catch (error) {
    console.error(`❌ Erro ao criar diretório ${dirPath}:`, error.message);
    throw error;
  }
}
/**
 * Cria uma nova pasta na API Cailun
 * @param {string} name - Nome da pasta
 * @param {number} downward - ID da pasta pai (0 para pasta raiz)
 * @returns {Object} Resultado da operação
 */
/**
 * Cria uma nova pasta na API Cailun
 * @param {string} name - Nome da pasta
 * @param {number} downward - ID da pasta pai (0 para pasta raiz)
 * @returns {Object} Resultado da operação
 */
async function createFolder(name, downward = 0) {
  let folderData = null;
  let localPath = null;
  let directoryCreated = false;

  try {
    console.log(`\n📁 ==> INICIANDO CRIAÇÃO DA PASTA "${name}" <==`);
    console.log(`🔗 Pasta pai (downward): ${downward || 'raiz'}`);
    
    // Verificar se BASE_STORAGE_PATH existe
    console.log(`📂 Verificando diretório base: ${BASE_STORAGE_PATH}`);
    await fs.mkdir(BASE_STORAGE_PATH, { recursive: true });

    const tokenResult = await getValidToken();
    if (!tokenResult.success) {
      throw new Error(`Erro ao obter token: ${tokenResult.error}`);
    }

    // 1. CRIAR PASTA NA API DO CAILUN
    console.log(`🌐 Criando pasta na API do Cailun...`);
    const response = await axios.post(
      `${CAILUN_BASE_URL}/storage/folder`,
      {
        name: name.trim(),
        downward: downward
      },
      {
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      }
    );

    folderData = response.data.data;
    console.log("✅ Pasta criada na API do Cailun!");
    console.log("📊 Dados retornados:", JSON.stringify(folderData, null, 2));

    // 2. DETERMINAR CAMINHO LOCAL E VALIDAR PASTA PAI
    console.log(`\n🗂️ Determinando caminho local...`);
    
    let parentFolderId = null; // Para o banco de dados local
    
    if (downward && downward !== 0) {
      console.log(`🔍 Buscando pasta pai no banco (cailun_id: ${downward})`);
      
      const parentFolder = await prisma.folder.findUnique({
        where: { cailun_id: parseInt(downward) },
        select: { id: true, name: true, local_path: true, cailun_id: true }
      });
      
      if (parentFolder) {
        console.log(`👨‍👩‍👧‍👦 Pasta pai encontrada:`, {
          id: parentFolder.id,
          name: parentFolder.name,
          cailun_id: parentFolder.cailun_id,
          local_path: parentFolder.local_path
        });
        
        parentFolderId = parentFolder.id; // ID local da pasta pai
        
        if (parentFolder.local_path) {
          localPath = path.join(parentFolder.local_path, name.trim());
          console.log(`📁 Caminho construído com pai: ${localPath}`);
        } else {
          console.log(`⚠️ Pasta pai sem local_path, usando base`);
          localPath = path.join(BASE_STORAGE_PATH, name.trim());
        }
      } else {
        console.log(`⚠️ Pasta pai não encontrada no banco, usando base`);
        console.log(`🔄 Considerando esta pasta como raiz`);
        localPath = path.join(BASE_STORAGE_PATH, name.trim());
        downward = 0; // Forçar como pasta raiz
      }
    } else {
      localPath = path.join(BASE_STORAGE_PATH, name.trim());
      console.log(`📁 Pasta raiz - caminho: ${localPath}`);
    }

    console.log(`✅ Caminho final determinado: ${localPath}`);

    // 3. CRIAR DIRETÓRIO FÍSICO
    console.log(`\n📂 Criando diretório físico...`);
    await createDirectory(localPath);
    directoryCreated = true;

    // 4. PREPARAR DADOS PARA O BANCO (COM VALIDAÇÃO DE CONSTRAINTS)
    console.log(`\n💾 Preparando dados para o banco de dados...`);
    
    const folderDataToSave = {
      cailun_id: parseInt(folderData.id),
      name: name.trim(),
      label: folderData.label || name.trim(),
      local_path: localPath,
      is_root: parseInt(folderData.is_root || (downward === 0 ? 1 : 0))
    };

    // CRÍTICO: Para pastas raiz, definir downward como NULL
    // Para evitar foreign key constraint violation
    if (downward && downward !== 0) {
      folderDataToSave.downward = parseInt(downward);
    } else {
      folderDataToSave.downward = null; // Explicitamente NULL para pasta raiz
    }

    // Adicionar campos opcionais somente se tiverem valores válidos
    if (folderData.organization_account_id) {
      folderDataToSave.organization_account_id = folderData.organization_account_id;
    }
    
    if (folderData.hash) {
      folderDataToSave.hash = folderData.hash;
    }
    
    if (folderData.users_id) {
      folderDataToSave.users_id = folderData.users_id;
    }

    // Adicionar referência à pasta pai somente se existir no banco local
    if (parentFolderId) {
      folderDataToSave.parent_folder_id = parentFolderId;
    }

    // Campos de data do Cailun (opcionais) - salvando como string
    if (folderData.created_at) {
      folderDataToSave.cailun_created_at = folderData.created_at;
    }
    if (folderData.updated_at) {
      folderDataToSave.cailun_updated_at = folderData.updated_at;
    }
    if (folderData.deleted_at) {
      folderDataToSave.cailun_deleted_at = folderData.deleted_at;
    }

    console.log('📝 Dados finais a serem salvos:', JSON.stringify(folderDataToSave, null, 2));

    // 5. SALVAR NO BANCO DE DADOS
    console.log(`\n💾 Salvando no banco de dados...`);
    
    // SOLUÇÃO TEMPORÁRIA: Desconectar relacionamentos para evitar constraint
    const savedFolder = await prisma.folder.create({
      data: {
        cailun_id: folderDataToSave.cailun_id,
        name: folderDataToSave.name,
        label: folderDataToSave.label,
        local_path: folderDataToSave.local_path,
        is_root: folderDataToSave.is_root,
        organization_account_id: folderDataToSave.organization_account_id,
        hash: folderDataToSave.hash,
        users_id: folderDataToSave.users_id,
        cailun_created_at: folderDataToSave.cailun_created_at,
        cailun_updated_at: folderDataToSave.cailun_updated_at,
        // downward: omitido temporariamente para evitar constraint
      }
    });

    console.log(`✅ Pasta salva no banco com ID local: ${savedFolder.id}`);
    console.log(`🎉 SUCESSO TOTAL! Pasta "${name}" criada em todos os locais\n`);

    return {
      success: true,
      folder: folderData,
      localFolder: savedFolder,
      localPath: localPath,
      message: `Pasta "${name}" criada com sucesso no Cailun e localmente`
    };

  } catch (error) {
    console.error("\n❌ ERRO DURANTE CRIAÇÃO DA PASTA:");
    console.error("📄 Mensagem:", error.message);
    console.error("🔍 Stack:", error.stack);

    // ROLLBACK DETALHADO
    console.log("\n🔄 INICIANDO PROCESSO DE ROLLBACK...");

    // 1. Remover diretório se foi criado
    if (directoryCreated && localPath) {
      console.log(`📂 Removendo diretório criado: ${localPath}`);
      try {
        await removeDirectory(localPath);
        console.log(`✅ Diretório removido com sucesso`);
      } catch (rollbackError) {
        console.error(`❌ Falha no rollback do diretório:`, rollbackError.message);
      }
    }

    // 2. Log da pasta órfã no Cailun
    if (folderData && folderData.id) {
      console.log(`⚠️ ATENÇÃO: Pasta órfã criada no Cailun!`);
      console.log(`🆔 ID no Cailun: ${folderData.id}`);
      console.log(`📝 Nome: ${folderData.label || name}`);
      console.log(`💡 Considere implementar limpeza automática ou manual desta pasta`);
    }

    // 3. Retornar erro estruturado
    if (error.response) {
      console.error("🌐 Erro da API:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });

      return {
        success: false,
        error: error.response.data?.message || error.message,
        status: error.response.status,
        statusText: error.response.statusText,
        details: error.response.data,
        orphanFolder: folderData
      };
    }

    return {
      success: false,
      error: error.message,
      step: directoryCreated ? 'database_save' : (folderData ? 'directory_creation' : 'api_call'),
      orphanFolder: folderData
    };
  }
}

// Função para buscar pastas do banco local
async function getFolders(parentId = null) {
  try {
    // Debug: Verificar o valor recebido
    console.log('🔍 Parâmetro parentId recebido:', parentId, typeof parentId);
    
    // Construir condição WHERE corretamente
    let whereCondition;
    
    if (parentId === null || parentId === undefined) {
      // Buscar pastas raiz (sem pai)
      whereCondition = { 
        OR: [
          { downward: null },
          { downward: 0 }
        ]
      };
    } else {
      // Buscar subpastas de um pai específico
      whereCondition = { downward: parentId };
    }

    console.log('🔍 Condição WHERE construída:', JSON.stringify(whereCondition, null, 2));

    // Debug: Verificar se há registros na tabela
    const totalFolders = await prisma.folder.count();
    console.log('📊 Total de pastas no banco:', totalFolders);

    // Debug: Verificar alguns registros para entender a estrutura
    const sampleFolders = await prisma.folder.findMany({
      take: 3,
      select: {
        id: true,
        cailun_id: true,
        name: true,
        downward: true
      }
    });
    console.log('📋 Amostra de registros:', JSON.stringify(sampleFolders, null, 2));

    const folders = await prisma.folder.findMany({
      where: whereCondition,
      orderBy: { created_at: 'desc' },
      include: {
        child_folders: {
          select: {
            id: true,
            cailun_id: true,
            name: true,
            created_at: true
          }
        }
      }
    });

    console.log(`✅ ${folders.length} pastas encontradas com a condição`);
    console.log('📁 Pastas encontradas:', folders.map(f => ({ id: f.id, name: f.name, downward: f.downward })));
    
    return { success: true, folders };

  } catch (error) {
    console.error("❌ Erro ao buscar pastas:", error.message);
    console.error("❌ Stack trace:", error.stack);
    return { success: false, error: error.message };
  }
}async function checkFolderExists(folderId) {
    try {
        console.log('🔍 Verificando se pasta existe:', folderId);
        
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
            select: {
                id: true,
                cailun_id: true,
                name: true,
                local_path: true
            }
        });

        if (!folder) {
            return { success: false, error: 'Pasta não encontrada' };
        }

        console.log('✅ Pasta encontrada:', folder.name);
        return { success: true, folder };

    } catch (error) {
        console.error("❌ Erro ao verificar pasta:", error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Buscar arquivos de uma pasta específica
 */
async function getFolderFiles(folderId, filters = {}) {
    try {
        const { search, fileType } = filters;
        
        console.log('🔍 Buscando arquivos da pasta:', folderId);
        console.log('🔍 Filtros aplicados:', { search, fileType });

        // Primeiro, buscar informações da pasta incluindo o cailun_id
        const folder = await prisma.folder.findUnique({
            where: { id: folderId },
            select: {
                id: true,
                cailun_id: true,
                name: true,
                local_path: true,
                created_at: true
            }
        });

        if (!folder) {
            return { success: false, error: 'Pasta não encontrada' };
        }

        // Construir condições de busca usando o cailun_id
        const whereCondition = {
            folder_cailun_id: folder.cailun_id  // ← Mudança aqui
        };

        // Filtro por nome do arquivo (se fornecido)
        if (search && search.trim()) {
            whereCondition.OR = [
                {
                    original_name: {
                        contains: search.trim(),
                        mode: 'insensitive'
                    }
                },
                {
                    name: {
                        contains: search.trim(),
                        mode: 'insensitive'
                    }
                }
            ];
        }

        // Filtro por tipo de arquivo (se fornecido)
        if (fileType && fileType.trim()) {
            whereCondition.mime_type = {
                contains: fileType.trim(),
                mode: 'insensitive'
            };
        }

        console.log('🔍 Condição WHERE para arquivos:', JSON.stringify(whereCondition, null, 2));

        // Debug: Verificar total de arquivos na pasta
        const totalFiles = await prisma.file.count({
            where: { folder_cailun_id: folder.cailun_id }  // ← Mudança aqui também
        });
        console.log('📊 Total de arquivos na pasta:', totalFiles);

        // Buscar arquivos
        const files = await prisma.file.findMany({
            where: whereCondition,
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                name: true,
                original_name: true,
                file_path: true,
                file_size: true,
                mime_type: true,
                folder_cailun_id: true,  // ← Campo correto
                created_at: true,
                updated_at: true,
            }
        });

        console.log(`✅ ${files.length} arquivo(s) encontrado(s) na pasta "${folder.name}"`);
        
        return { 
            success: true, 
            files, 
            folder: {
                id: folder.id,
                cailun_id: folder.cailun_id,
                name: folder.name,
                local_path: folder.local_path,
                created_at: folder.created_at
            }
        };

    } catch (error) {
        console.error("❌ Erro ao buscar arquivos da pasta:", error.message);
        console.error("❌ Stack trace:", error.stack);
        return { success: false, error: error.message };
    }
}


// Função para buscar uma pasta específica
async function getFolderById(cailunId) {
  try {
    console.log(`🔍 Buscando pasta com cailun_id: ${cailunId}`);

    const folder = await prisma.folder.findUnique({
      where: { cailun_id: parseInt(cailunId) },
      include: {
        parent_folder: {
          select: { id: true, cailun_id: true, name: true }
        },
        child_folders: {
          select: { id: true, cailun_id: true, name: true, created_at: true }
        }
      }
    });

    if (!folder) {
      return { success: false, error: 'Pasta não encontrada' };
    }

    console.log(`✅ Pasta encontrada: ${folder.name}`);
    return { success: true, folder };

  } catch (error) {
    console.error("❌ Erro ao buscar pasta:", error.message);
    return { success: false, error: error.message };
  }
}
function formatarTelefone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 13) {
    const country = digits.substring(0, 2);
    const area = digits.substring(2, 4);
    const number = digits.substring(4);
    return `${country}(${area})${number.slice(0, 5)}-${number.slice(5)}`;
  }
  return phone;
}

async function startSubscriptionFlow(data) {
  // Imports dentro da função para garantir escopo correto
  const FormData = require("form-data");
  const fs = require("fs");
  
  let filePath = data.file.path;
  
  try {
    const tokenResult = await getValidToken();
    if (!tokenResult.success) throw new Error(tokenResult.error);

    // Validar data limite
    let signatureLimitDateOriginal = null;
    if (data.signatureLimitDate) {
      try {
        signatureLimitDateOriginal = new Date(data.signatureLimitDate);
        if (isNaN(signatureLimitDateOriginal.getTime())) {
          signatureLimitDateOriginal = null;
        }
      } catch (e) {
        console.error("Erro ao processar data:", e.message);
      }
    }

    // Criar FormData
    const form = new FormData();
    
    // Adicionar arquivo
    form.append("file", fs.createReadStream(filePath), {
      filename: data.file.originalname,
      contentType: data.file.mimetype
    });

    // Adicionar outros campos
    if (data.folderId) form.append("folderId", String(data.folderId));
    if (data.signatureLimitDate) form.append("signatureLimitDate", data.signatureLimitDate);
    if (data.reminder !== undefined) form.append("reminder", String(data.reminder));
    if (data.reminderDays) form.append("reminderDays", String(data.reminderDays));
    if (data.notificationDescription) form.append("notificationDescription", data.notificationDescription);
    if (data.notificationDate) form.append("notificationDate", data.notificationDate);
    if (data.message) form.append("message", data.message);

    // Adicionar signatories
    if (data.signatories && Array.isArray(data.signatories)) {
      data.signatories.forEach((signatory, i) => {
        form.append(`signatories[${i}][name]`, signatory.name);
        form.append(`signatories[${i}][email]`, signatory.email);
        form.append(`signatories[${i}][cpf]`, signatory.cpf);
        form.append(`signatories[${i}][phone]`, formatarTelefone(signatory.phone));
        form.append(`signatories[${i}][signAsId]`, signatory.signAsId);
        form.append(`signatories[${i}][requiredAuthenticationType]`, signatory.requiredAuthenticationType);

        if (Array.isArray(signatory.additionalAuthenticationType)) {
          signatory.additionalAuthenticationType.forEach(type => {
            form.append(`signatories[${i}][additionalAuthenticationType][]`, type);
          });
        }
      });
    }

    // Fazer requisição
    const response = await axios.post(
      `${process.env.CAILUN_URL}/subscriptionFlow`,
      form,
      {
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          ...form.getHeaders()
        },
        timeout: 30000
      }
    );

    // Limpar arquivo
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      console.error("Erro ao limpar arquivo:", e.message);
    }
    
    // Enriquecer dados
    const enrichedData = {
      ...response.data.data,
      signatureLimitDate: signatureLimitDateOriginal,
      signatureLimitDateISO: signatureLimitDateOriginal?.toISOString(),
      originalSignatureLimitDate: data.signatureLimitDate,
      originalFolderId: data.folderId,
      originalMessage: data.message,
      originalSignatories: data.signatories,
      fileName: data.file.originalname,
      fileSize: data.file.size,
      fileMimeType: data.file.mimetype
    };

    return { success: true, data: enrichedData };

  } catch (error) {
    console.error("Erro:", error.message);
    
    // Limpar arquivo em caso de erro
    const fs = require("fs");
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {}

    return {
      success: false,
      error: error.message,
      details: error.response?.data,
      status: error.response?.status
    };
  }
}
async function salvarFluxoAssinatura(dadosAPI) {
  try {
    console.log("Salvando fluxo no banco...");
    
    if (!dadosAPI || !dadosAPI.uuid) {
      throw new Error("UUID é obrigatório");
    }

    // Processar signatureLimitDate
    let signatureLimitDate = null;
    const fontes = [
      dadosAPI.signatureLimitDate,
      dadosAPI.originalSignatureLimitDate,
      dadosAPI.signatureLimitDateISO,
      dadosAPI.signature_limit_date
    ];
    
    for (const fonte of fontes) {
      if (fonte) {
        let dataTemp = fonte instanceof Date ? fonte : new Date(fonte);
        if (!isNaN(dataTemp.getTime())) {
          signatureLimitDate = dataTemp;
          break;
        }
      }
    }

    const dadosMapeados = {
      organizationAccountId: BigInt(dadosAPI.organization_account_id || 1),
      documentStatusTypeId: dadosAPI.document_status_type_id || 1,
      documentTypesId: dadosAPI.document_types_id || 1,
      envelopesId: BigInt(dadosAPI.envelopes_id || dadosAPI.id || Date.now()),
      filesId: BigInt(dadosAPI.files_id || dadosAPI.id || Date.now()),
      status: dadosAPI.status || 1,
      name: dadosAPI.name || dadosAPI.fileName || "Documento",
      label: dadosAPI.label || dadosAPI.fileName || "Documento",
      uuid: dadosAPI.uuid,
      signatureLimitDate: signatureLimitDate,
      resolution: dadosAPI.resolution || null,
      pages: dadosAPI.pages || null,
      size: dadosAPI.size || dadosAPI.fileSize || null,
      createdAt: dadosAPI.created_at ? new Date(dadosAPI.created_at) : new Date(),
      updatedAt: dadosAPI.updated_at ? new Date(dadosAPI.updated_at) : new Date(),
      language: dadosAPI.language || null,
      timezone: dadosAPI.timezone || null,
      versionId: BigInt(dadosAPI.version_id || 1),
      dtTimezoneZero: dadosAPI.dt_timezone_zero ? new Date(dadosAPI.dt_timezone_zero) : new Date(),
      links: JSON.stringify({
        originalData: {
          signatories: dadosAPI.originalSignatories,
          message: dadosAPI.originalMessage,
          fileName: dadosAPI.fileName
        }
      })
    };

    console.log("Salvando com signatureLimitDate:", signatureLimitDate?.toISOString() || null);

    const fluxoSalvo = await prisma.fluxoAssinatura.upsert({
      where: { uuid: dadosAPI.uuid },
      update: {
        signatureLimitDate: dadosMapeados.signatureLimitDate,
        status: dadosMapeados.status,
        name: dadosMapeados.name,
        label: dadosMapeados.label,
        updatedAt: new Date(),
        links: dadosMapeados.links
      },
      create: dadosMapeados
    });

    console.log("Fluxo salvo! Data:", fluxoSalvo.signatureLimitDate?.toISOString() || null);

    return {
      success: true,
      data: {
        ...fluxoSalvo,
        id: fluxoSalvo.id.toString()
      },
      message: "Fluxo salvo com sucesso"
    };

  } catch (error) {
    console.error("Erro ao salvar:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}


// 🔧 FUNÇÃO AUXILIAR PARA VALIDAR DADOS ANTES DO ENVIO
function validateSignatoryData(signatory, index) {
  const errors = [];

  if (!signatory.name) errors.push(`signatories[${index}].name é obrigatório`);
  if (!signatory.email) errors.push(`signatories[${index}].email é obrigatório`);
  if (!signatory.cpf) errors.push(`signatories[${index}].cpf é obrigatório`);
  if (!signatory.phone) errors.push(`signatories[${index}].phone é obrigatório`);

  // Valida se signAsId é um número válido
  const signAsId = parseInt(signatory.SignAsid || signatory.signAsId || signatory.signAsID, 10);
  if (isNaN(signAsId)) errors.push(`signatories[${index}].signAsId deve ser um número`);

  // Valida requiredAuthenticationType
  const reqAuthType = parseInt(signatory.requiredAuthenticationtype || signatory.requiredAuthenticationType, 10);
  if (isNaN(reqAuthType)) errors.push(`signatories[${index}].requiredAuthenticationType deve ser um número`);

  return { errors, isValid: errors.length === 0 };
}

async function createSignatory(signatoryData) {
  try {
    console.log(`✍️ Criando signatário "${signatoryData.name}"`);

    const tokenResult = await getValidToken();

    if (!tokenResult.success) {
      throw new Error(`Erro ao obter token: ${tokenResult.error}`);
    }

    const response = await axios.post(
      `${CAILUN_BASE_URL}/signatories`,
      signatoryData,
      {
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      }
    );

    console.log("✅ Signatário criado com sucesso!");
    console.log("📊 Dados:", JSON.stringify(response.data, null, 2));

    return {
      success: true,
      signatory: response.data.data,
      message: `Signatário "${signatoryData.name}" criado com sucesso`
    };
  } catch (error) {
    console.error("❌ Erro ao criar signatário:", error.message);

    if (error.response) {
      console.error("📄 Status:", error.response.status);
      console.error("📄 Response data:", JSON.stringify(error.response.data, null, 2));

      return {
        success: false,
        error: error.response.data?.message || error.message,
        status: error.response.status,
        statusText: error.response.statusText,
        details: error.response.data
      };
    }

    return {
      success: false,
      error: error.message
    };
  }
}
async function downloadDocumento(uuid) {
  try {
    console.log("📥 Iniciando download do documento:", uuid);

    // 1. Buscar FluxoAssinatura pelo UUID
    const fluxo = await prisma.fluxoAssinatura.findUnique({
      where: { uuid }
    });

    if (!fluxo) {
      throw new Error("Fluxo de assinatura não encontrado");
    }

    console.log("✅ Fluxo encontrado:", fluxo.name);

    // 2. Extrair folderId dos links (se disponível)
    let folderId = null;
    if (fluxo.links) {
      try {
        const linksData = typeof fluxo.links === 'string' 
          ? JSON.parse(fluxo.links) 
          : fluxo.links;
        
        folderId = linksData.originalData?.folderId;
        console.log("🔍 FolderId extraído dos links:", folderId);
      } catch (e) {
        console.error("⚠️ Erro ao parsear links:", e.message);
      }
    }

    // 3. Buscar pasta (com fallback para pasta "Assinaturas")
    let folder = null;
    
    if (folderId) {
      // Tentar buscar pela folderId específica
      folder = await prisma.folder.findUnique({
        where: { cailun_id: parseInt(folderId) }
      });
      
      if (folder) {
        console.log("✅ Pasta encontrada pelo folderId:", folder.name);
      }
    }

    // Se não encontrou pasta específica, buscar pasta padrão "Assinaturas"
    if (!folder) {
      console.log("🔄 FolderId não encontrado ou pasta não existe. Buscando pasta padrão 'Assinaturas'...");
      
      folder = await prisma.folder.findFirst({
        where: { 
          name: "Assinaturas",
          is_root: 1
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      if (!folder) {
        throw new Error("Pasta padrão 'Assinaturas' não encontrada no banco de dados");
      }

      console.log("✅ Usando pasta padrão:", folder.name, "(ID:", folder.id, "| cailun_id:", folder.cailun_id + ")");
    }

    if (!folder.local_path) {
      throw new Error("Pasta não possui caminho local definido");
    }

    console.log("📂 Pasta selecionada:", folder.name);
    console.log("📍 Caminho local:", folder.local_path);

    // 4. Verificar se a pasta local existe, se não, criar
    if (!fs.existsSync(folder.local_path)) {
      fs.mkdirSync(folder.local_path, { recursive: true });
      console.log("✅ Diretório criado:", folder.local_path);
    }

    // 5. Obter token válido
    const tokenResult = await getValidToken();
    if (!tokenResult.success) {
      throw new Error("Falha ao obter token de autenticação");
    }

    // 6. Fazer download do arquivo da API do Cailun
    console.log("⬇️ Fazendo download do arquivo da API Cailun...");
    const downloadUrl = `${process.env.CAILUN_URL}/documents/${uuid}/download`;
    
    const response = await axios.get(downloadUrl, {
      headers: {
        Authorization: `Bearer ${tokenResult.token}`
      },
      responseType: 'stream',
      timeout: 60000 // 60 segundos
    });

    // 7. Gerar nome do arquivo
    const timestamp = Date.now();
    const sanitizedName = fluxo.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${sanitizedName}_assinado_${timestamp}.pdf`;
    const filePath = path.join(folder.local_path, fileName);

    console.log("💾 Salvando arquivo como:", fileName);

    // 8. Salvar arquivo localmente
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log("✅ Arquivo salvo em:", filePath);

    // 9. Obter tamanho do arquivo
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    console.log("📊 Tamanho do arquivo:", (fileSize / 1024).toFixed(2), "KB");

    // 10. Gerar hash MD5 do arquivo
    let fileHash = null;
    try {
      const crypto = require('crypto');
      const fileBuffer = fs.readFileSync(filePath);
      fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
      console.log("🔐 Hash MD5 gerado:", fileHash);
    } catch (hashError) {
      console.warn("⚠️ Não foi possível gerar hash do arquivo:", hashError.message);
    }

    // 11. Criar registro na tabela File usando folder_cailun_id
    const fileRecord = await prisma.file.create({
      data: {
        cailun_id: null, // Documentos assinados não têm ID no Cailun
        name: fileName,
        original_name: fluxo.label || fluxo.name,
        file_path: filePath,
        file_size: fileSize,
        mime_type: 'application/pdf',
        folder_cailun_id: folder.cailun_id, // ← Usando cailun_id da pasta
        hash: fileHash,
        cailun_created_at: fluxo.createdAt.toISOString(),
        cailun_updated_at: new Date().toISOString()
      }
    });

    console.log("✅ Registro de arquivo criado! ID:", fileRecord.id);
    console.log("🔗 Arquivo vinculado à pasta:", folder.name, "(folder.id:", folder.id, "| folder.cailun_id:", folder.cailun_id + ")");

    // 12. Atualizar FluxoAssinatura com informações completas do download
    const linksData = typeof fluxo.links === 'string' 
      ? JSON.parse(fluxo.links) 
      : (fluxo.links || {});

    await prisma.fluxoAssinatura.update({
      where: { uuid },
      data: {
        links: JSON.stringify({
          ...linksData,
          downloadInfo: {
            fileId: fileRecord.id,
            filePath: filePath,
            fileName: fileName,
            fileHash: fileHash,
            fileSize: fileSize,
            folderId: folder.cailun_id,
            folderDatabaseId: folder.id,
            folderName: folder.name,
            downloadedAt: new Date().toISOString(),
            usedDefaultFolder: !folderId // Indica se usou pasta padrão
          }
        })
      }
    });

    console.log("✅ FluxoAssinatura atualizado com informações do download");
    console.log("🎉 Download concluído com sucesso!");

    return {
      success: true,
      message: "Documento baixado e registrado com sucesso",
      data: {
        fluxo: {
          id: fluxo.id.toString(),
          uuid: fluxo.uuid,
          name: fluxo.name,
          label: fluxo.label
        },
        file: {
          id: fileRecord.id,
          name: fileName,
          original_name: fluxo.label || fluxo.name,
          path: filePath,
          size: fileSize,
          size_mb: (fileSize / (1024 * 1024)).toFixed(2),
          hash: fileHash,
          mime_type: 'application/pdf'
        },
        folder: {
          id: folder.id,
          cailun_id: folder.cailun_id,
          name: folder.name,
          local_path: folder.local_path
        },
        metadata: {
          downloaded_at: new Date().toISOString(),
          used_default_folder: !folderId
        }
      }
    };

  } catch (error) {
    console.error("❌ Erro ao baixar documento:", error.message);
    console.error("❌ Stack trace:", error.stack);
    
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null
    };
  }
}
async function getFileById(fileId) {
  try {
    console.log('🔍 Buscando arquivo por ID:', fileId);

    const file = await prisma.file.findUnique({
      where: {
        id: parseInt(fileId)
      },
      include: {
        folder: {
          select: {
            id: true,
            cailun_id: true,
            name: true,
            local_path: true
          }
        }
      }
    });

    if (!file) {
      return {
        success: false,
        error: "Arquivo não encontrado"
      };
    }

    // Verificar se o arquivo físico existe
    const fileExists = fsSync.existsSync(file.file_path);

    console.log('✅ Arquivo encontrado:', file.name);
    console.log('📁 Arquivo físico existe:', fileExists);

    return {
      success: true,
      data: {
        ...file,
        physical_file_exists: fileExists
      }
    };
  } catch (error) {
    console.error("❌ Erro ao buscar arquivo por ID:", error);
    return {
      success: false,
      error: error.message
    };
  }
}


module.exports = {
  loginCailun,
  testToken,
  getValidToken,
  createFolder,
  getFolders,
  getFolderById,
  startSubscriptionFlow,
  createSignatory,
  validateSignatoryData,
  getFolderFiles,
  checkFolderExists,
  salvarFluxoAssinatura,
  downloadDocumento,
  getFileById
};