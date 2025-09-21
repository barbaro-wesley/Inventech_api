// services/cailunService.js - Service completo com autenticação e operações de pastas
const axios = require("axios");
const Redis = require("ioredis");
const fs = require("fs");
const redis = new Redis(process.env.REDIS_URL);

const CAILUN_BASE_URL = process.env.CAILUN_URL;
const CAILUN_EMAIL = process.env.CAILUN_EMAIL;
const CAILUN_PASSWORD = process.env.CAILUN_PASSWORD;

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

/**
 * Cria uma nova pasta na API Cailun
 * @param {string} name - Nome da pasta
 * @param {number} downward - ID da pasta pai (0 para pasta raiz)
 * @returns {Object} Resultado da operação
 */
async function createFolder(name, downward = 0) {
  try {
    console.log(`📁 Criando pasta "${name}" (pasta pai: ${downward || 'raiz'})`);
    const tokenResult = await getValidToken();

    if (!tokenResult.success) {
      throw new Error(`Erro ao obter token: ${tokenResult.error}`);
    }

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

    console.log("✅ Pasta criada com sucesso!");
    console.log("📊 Dados da pasta:", JSON.stringify(response.data, null, 2));

    return {
      success: true,
      folder: response.data.data,
      message: `Pasta "${name}" criada com sucesso`
    };
  } catch (error) {
    console.error("❌ Erro ao criar pasta:", error.message);

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
    try {
        const tokenResult = await getValidToken();
        if (!tokenResult.success) throw new Error(tokenResult.error);

        const FormData = require("form-data");
        const fs = require("fs");
        const axios = require("axios");
        const form = new FormData();

        // 1. Arquivo
        const fileStream = fs.createReadStream(data.file.path);
        form.append("file", fileStream, {
            filename: data.file.originalname,
            contentType: data.file.mimetype
        });

        // 2. Outros campos
        if (data.folderId) form.append("folderId", String(data.folderId));
        if (data.signatureLimitDate) form.append("signatureLimitDate", data.signatureLimitDate);
        if (data.reminder !== undefined) form.append("reminder", String(data.reminder));
        if (data.reminderDays) form.append("reminderDays", String(data.reminderDays));
        if (data.notificationDescription) form.append("notificationDescription", data.notificationDescription);
        if (data.notificationDate) form.append("notificationDate", data.notificationDate);
        if (data.message) form.append("message", data.message);

        // 3. 🔧 SIGNATORIES CORRIGIDO - Agora com tipos corretos
        if (data.signatories && Array.isArray(data.signatories)) {
            data.signatories.forEach((signatory, i) => {
                // Campos básicos
                form.append(`signatories[${i}][name]`, signatory.name);
                form.append(`signatories[${i}][email]`, signatory.email);
                form.append(`signatories[${i}][cpf]`, signatory.cpf);
                form.append(`signatories[${i}][phone]`, formatarTelefone(signatory.phone));
                
                // 🔧 CAMPOS QUE CAUSAVAM ERRO - Agora como integers
                form.append(`signatories[${i}][signAsId]`, signatory.signAsId); // Já convertido no controller
                form.append(`signatories[${i}][requiredAuthenticationType]`, signatory.requiredAuthenticationType); // Já convertido no controller
                
                // 🔧 additionalAuthenticationType como array de integers
                if (Array.isArray(signatory.additionalAuthenticationType)) {
                    signatory.additionalAuthenticationType.forEach(type => {
                        form.append(`signatories[${i}][additionalAuthenticationType][]`, type); // Já convertido no controller
                    });
                }
            });
        }

        // 4. Debug melhorado
        console.log("📤 Dados sendo enviados:");
        console.log("- Arquivo:", data.file.originalname);
        data.signatories?.forEach((sig, i) => {
            console.log(`- Signatory ${i}:`, {
                name: sig.name,
                signAsId: `${sig.signAsId} (${typeof sig.signAsId})`,
                requiredAuthenticationType: `${sig.requiredAuthenticationType} (${typeof sig.requiredAuthenticationType})`,
                additionalAuthenticationType: sig.additionalAuthenticationType?.map(type => `${type} (${typeof type})`)
            });
        });

        // 5. Requisição
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

        fs.unlinkSync(data.file.path);
        return { success: true, data: response.data.data };

    } catch (error) {
        console.error("❌ ERRO DETALHADO:");
        console.error("- Message:", error.message);
        console.error("- Status:", error.response?.status);
        console.error("- Response Data:", JSON.stringify(error.response?.data, null, 2));

        // 🔧 Cleanup do arquivo mesmo em caso de erro
        try {
            if (data.file?.path && fs.existsSync(data.file.path)) {
                fs.unlinkSync(data.file.path);
            }
        } catch (cleanupError) {
            console.error("❌ Erro ao limpar arquivo:", cleanupError.message);
        }

        return {
            success: false,
            error: error.message,
            details: error.response?.data,
            status: error.response?.status
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




module.exports = {
  loginCailun,
  testToken,
  getValidToken,
  createFolder,
  startSubscriptionFlow,
  createSignatory,
  validateSignatoryData
};