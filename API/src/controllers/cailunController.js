// controllers/cailunController.js - Controller unificado para todas as operações Cailun
const cailunService = require("../services/cailunService");

// 🔧 CORREÇÃO DA IMPORTAÇÃO - Remover as chaves {}
const FluxoAssinaturaService = require('../services/fluxoAssinaturaService'); // 👈 SEM CHAVES!

// ==========================================
// CONTROLLERS DE AUTENTICAÇÃO
// ==========================================

// Controller para testar login
async function testLoginController(req, res) {
    try {
        console.log('🚀 Iniciando teste de login...');

        const result = await cailunService.loginCailun();

        if (result.success) {
            res.json({
                success: true,
                message: '✅ Login realizado com sucesso!',
                data: {
                    tokenReceived: !!result.token,
                    expiresAt: result.expiresAt,
                    ttlSeconds: result.ttl,
                    originalExpireAt: result.originalExpireAt,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            res.status(result.status || 400).json({
                success: false,
                message: '❌ Falha no login',
                error: result.error,
                status: result.status,
                statusText: result.statusText
            });
        }

    } catch (error) {
        console.error('💥 Erro inesperado:', error);
        res.status(500).json({
            success: false,
            message: '💥 Erro interno do servidor',
            error: error.message
        });
    }
}

// Controller para testar se o token atual é válido
async function testTokenController(req, res) {
    try {
        const result = await cailunService.testToken();

        res.json({
            success: true,
            message: 'Teste de token concluído',
            data: result
        });

    } catch (error) {
        console.error('💥 Erro ao testar token:', error);
        res.status(500).json({
            success: false,
            message: '💥 Erro ao testar token',
            error: error.message
        });
    }
}

// Controller para obter token válido (cache ou novo)
async function getTokenController(req, res) {
    try {
        const result = await cailunService.getValidToken();

        if (result.success) {
            res.json({
                success: true,
                message: result.fromCache ?
                    '🔄 Token obtido do cache' :
                    '🆕 Novo token obtido',
                data: {
                    tokenReceived: !!result.token,
                    fromCache: result.fromCache,
                    ttlRemaining: result.ttlRemaining || result.ttl,
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: '❌ Falha ao obter token',
                error: result.error
            });
        }

    } catch (error) {
        console.error('💥 Erro ao obter token:', error);
        res.status(500).json({
            success: false,
            message: '💥 Erro interno do servidor',
            error: error.message
        });
    }
}

// Controller para verificar configurações
async function checkConfigController(req, res) {
    const config = {
        hasUrl: !!process.env.CAILUN_URL,
        hasEmail: !!process.env.CAILUN_EMAIL,
        hasPassword: !!process.env.CAILUN_PASSWORD,
        hasRedis: !!process.env.REDIS_URL,
        url: process.env.CAILUN_URL,
        email: process.env.CAILUN_EMAIL ?
            process.env.CAILUN_EMAIL.replace(/(.{2}).*(@.*)/, '$1***$2') :
            'não configurado'
    };

    const allConfigured = config.hasUrl && config.hasEmail && config.hasPassword && config.hasRedis;

    res.json({
        success: true,
        message: allConfigured ?
            '✅ Todas as configurações estão definidas' :
            '⚠️ Algumas configurações estão faltando',
        data: config
    });
}

// ==========================================
// CONTROLLERS DE OPERAÇÕES COM PASTAS
// ==========================================

/**
 * Controller para criar uma nova pasta
 */
async function createFolderController(req, res) {
    try {
        const { name, downward } = req.body;

        // Validações básicas
        if (!name) {
            return res.status(400).json({
                success: false,
                message: '❌ Nome da pasta é obrigatório',
                error: 'Campo "name" não pode estar vazio'
            });
        }

        console.log(`📁 Requisição para criar pasta: "${name}" (pasta pai: ${downward || 'raiz'})`);

        const result = await cailunService.createFolder(name, downward);

        if (result.success) {
            res.status(201).json({
                success: true,
                message: result.message,
                data: result.folder
            });
        } else {
            res.status(result.status || 400).json({
                success: false,
                message: '❌ Falha ao criar pasta',
                error: result.error,
                details: result.details
            });
        }

    } catch (error) {
        console.error('💥 Erro inesperado ao criar pasta:', error);
        res.status(500).json({
            success: false,
            message: '💥 Erro interno do servidor',
            error: error.message
        });
    }
}

async function startSubscriptionFlowController(req, res) {
    try {
        const body = req.body;

        console.log("📥 Dados recebidos:", {
            file: req.file ? req.file.originalname : 'Nenhum arquivo',
            signatories: body.signatories
        });

        // ✅ Todo o código de processamento do signatories continua IGUAL
        if (body.signatories) {
            if (typeof body.signatories === 'string') {
                try {
                    body.signatories = JSON.parse(body.signatories);
                    console.log("🔄 Signatories convertido de string para array");
                } catch (parseError) {
                    return res.status(400).json({
                        success: false,
                        message: "❌ Formato inválido para signatories",
                        error: "Invalid JSON format"
                    });
                }
            }
            
            if (Array.isArray(body.signatories)) {
                body.signatories = body.signatories.map((signatory, index) => {
                    if (!signatory.name || !signatory.email) {
                        throw new Error(`Signatory ${index}: name e email são obrigatórios`);
                    }
                    
                    return {
                        ...signatory,
                        signAsId: parseInt(signatory.SignAsid || signatory.signAsId || signatory.signAsID, 10),
                        requiredAuthenticationType: parseInt(signatory.requiredAuthenticationtype || signatory.requiredAuthenticationType, 10),
                        additionalAuthenticationType: Array.isArray(signatory.additionalAuthenticationType) 
                            ? signatory.additionalAuthenticationType.map(type => parseInt(type, 10))
                            : [parseInt(signatory.additionalAuthenticationType || '1', 10)]
                    };
                });
                console.log("✅ Signatories validados e convertidos:", body.signatories);
            }
        }

        // ✅ Validação do arquivo continua IGUAL
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "❌ Arquivo é obrigatório"
            });
        }

        // ✅ Chamada do service continua IGUAL
        const result = await cailunService.startSubscriptionFlow({
            file: req.file,
            ...body
        });

        // 🔧 PARTE MODIFICADA COM MELHOR TRATAMENTO DE ERRO
        if (result.success) {
            console.log("✅ Fluxo criado com sucesso! Salvando no banco...");
            console.log("🔍 Verificando FluxoAssinaturaService:", typeof FluxoAssinaturaService);
            
            let salvamentoInfo = { success: false, error: "Service não disponível" };
            
            try {
                // 🔍 Verificar se o service e o método existem
                if (FluxoAssinaturaService && typeof FluxoAssinaturaService.salvarFluxoAssinatura === 'function') {
                    console.log("🎯 Chamando FluxoAssinaturaService.salvarFluxoAssinatura...");
                    salvamentoInfo = await FluxoAssinaturaService.salvarFluxoAssinatura(result.data);
                    
                    if (salvamentoInfo.success) {
                        console.log("✅ Dados salvos no banco com sucesso!");
                        console.log("📄 UUID salvo:", result.data.uuid);
                    } else {
                        console.error("⚠️ Fluxo criado mas houve erro ao salvar no banco:", salvamentoInfo.error);
                    }
                } else {
                    console.error("❌ FluxoAssinaturaService ou método salvarFluxoAssinatura não encontrado");
                    console.error("🔍 Tipo do FluxoAssinaturaService:", typeof FluxoAssinaturaService);
                    console.error("🔍 Métodos disponíveis:", FluxoAssinaturaService ? Object.getOwnPropertyNames(FluxoAssinaturaService) : 'Service não existe');
                }
            } catch (bancoError) {
                console.error("⚠️ Erro ao tentar salvar no banco:", bancoError.message);
                console.error("🔍 Stack trace:", bancoError.stack);
                salvamentoInfo = { success: false, error: bancoError.message };
            }

            // ✅ Resposta de sucesso (pode incluir info do banco)
            res.status(200).json({
                success: true,
                message: "✅ Subscription flow iniciado com sucesso!",
                data: result.data,
                // Opcional: adicionar info sobre salvamento no banco
                database: {
                    saved: salvamentoInfo.success,
                    error: salvamentoInfo.success ? null : salvamentoInfo.error
                }
            });
        } else {
            // ✅ Caso de erro continua EXATAMENTE IGUAL
            res.status(result.status || 400).json({
                success: false,
                message: "❌ Falha ao iniciar subscription flow",
                error: result.error,
                details: result.details
            });
        }

    } catch (error) {
        // ✅ Catch continua EXATAMENTE IGUAL
        console.error("💥 Erro no controller:", error);
        res.status(500).json({
            success: false,
            message: "💥 Erro interno no servidor",
            error: error.message
        });
    }
}

async function createSignatory(req, res) {
  const result = await cailunService.createSignatory(req.body);

  if (result.success) {
    res.status(200).json({ data: result.signatory });
  } else {
    res.status(result.status || 500).json({
      success: false,
      message: 'Erro ao criar signatário',
      error: result.error,
      details: result.details
    });
  }
}

module.exports = {
    // Controllers de autenticação
    testLoginController,
    testTokenController,
    getTokenController,
    checkConfigController,
    // Controllers de operações com pastas
    createFolderController,
    //fluxo de assinatura
    startSubscriptionFlowController,
    createSignatory
};