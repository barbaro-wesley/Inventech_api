// 🏗️ SERVICE PARA SALVAR NO BANCO - fluxoAssinaturaService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class FluxoAssinaturaService {
        static async salvarFluxoAssinatura(dadosAPI) {
        try {
            console.log("💾 Salvando fluxo de assinatura no banco...");
            console.log("📋 Dados recebidos da API:", {
                id: dadosAPI.id,
                uuid: dadosAPI.uuid,
                name: dadosAPI.name,
                label: dadosAPI.label,
                status: dadosAPI.status
            });

            const dadosMapeados = {
                // 🚨 REMOVER o campo 'id' do create/update para evitar conflitos
                // id: BigInt(dadosAPI.id), // ❌ NÃO incluir no upsert
                organizationAccountId: BigInt(dadosAPI.organization_account_id),
                documentStatusTypeId: dadosAPI.document_status_type_id,
                documentTypesId: dadosAPI.document_types_id,
                envelopesId: BigInt(dadosAPI.envelopes_id),
                filesId: BigInt(dadosAPI.files_id),
                status: dadosAPI.status,
                name: dadosAPI.name,
                label: dadosAPI.label,
                uuid: dadosAPI.uuid,
                resolution: dadosAPI.resolution || null,
                pages: dadosAPI.pages || null,
                size: dadosAPI.size || null,
                createdAt: new Date(dadosAPI.created_at),
                updatedAt: new Date(dadosAPI.updated_at),
                language: dadosAPI.language || null,
                timezone: dadosAPI.timezone || null,
                versionId: BigInt(dadosAPI.version_id),
                dtTimezoneZero: new Date(dadosAPI.dt_timezone_zero),
                links: dadosAPI.links || null
            };

            console.log("🔍 Tentando upsert com uuid:", dadosAPI.uuid);

            // 💾 Agora o upsert deve funcionar com o @unique no uuid
            const fluxoSalvo = await prisma.fluxoAssinatura.upsert({
                where: { 
                    uuid: dadosAPI.uuid  // Agora funciona porque uuid tem @unique
                },
                update: dadosMapeados,  // Atualiza se já existe
                create: dadosMapeados   // Cria se não existe
            });

            console.log("✅ Fluxo de assinatura salvo com sucesso!");
            console.log("📄 UUID:", fluxoSalvo.uuid);
            console.log("🆔 ID gerado:", fluxoSalvo.id.toString());

            return {
                success: true,
                data: {
                    ...fluxoSalvo,
                    id: fluxoSalvo.id.toString() // Converter BigInt para string
                },
                message: "Fluxo de assinatura salvo no banco de dados"
            };

        } catch (error) {
            console.error("❌ Erro ao salvar fluxo de assinatura:", error);
            console.error("🔍 Nome do erro:", error.name);
            console.error("🔍 Código do erro:", error.code);
            console.error("🔍 Mensagem:", error.message);
            
            // 🔍 Log específico para erros de validação do Prisma
            if (error.name === 'PrismaClientValidationError') {
                console.error("📋 Erro de validação - verifique se:");
                console.error("   1. O campo 'uuid' tem @unique no schema");
                console.error("   2. Todos os campos obrigatórios estão presentes");
                console.error("   3. Os tipos de dados estão corretos");
            }
            
            return {
                success: false,
                error: error.message,
                details: {
                    name: error.name,
                    code: error.code
                }
            };
        }
    }

    // 🔍 BUSCAR FLUXO POR UUID
    static async buscarPorUuid(uuid) {
        try {
            const fluxo = await prisma.fluxoAssinatura.findUnique({
                where: { uuid }
            });

            return {
                success: true,
                data: fluxo ? {
                    ...fluxo,
                    id: fluxo.id.toString()
                } : null,
                exists: !!fluxo
            };
        } catch (error) {
            console.error("❌ Erro ao buscar fluxo:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 🔍 BUSCAR FLUXO POR ID da API (útil para debug)
    static async buscarPorIdAPI(idAPI) {
        try {
            // Busca pelo campo personalizado se você quiser manter o ID da API
            const fluxos = await prisma.fluxoAssinatura.findMany({
                where: {
                    // Como não temos o ID da API salvo, vamos buscar por outros campos
                    OR: [
                        { name: { contains: idAPI.toString() } },
                        { label: { contains: idAPI.toString() } }
                    ]
                },
                take: 5
            });

            return {
                success: true,
                data: fluxos.map(fluxo => ({
                    ...fluxo,
                    id: fluxo.id.toString()
                })),
                total: fluxos.length
            };
        } catch (error) {
            console.error("❌ Erro ao buscar por ID da API:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 📋 LISTAR FLUXOS
    static async listarFluxos(limite = 10) {
        try {
            const fluxos = await prisma.fluxoAssinatura.findMany({
                orderBy: { createdAt: 'desc' },
                take: limite,
                select: {
                    id: true,
                    uuid: true,
                    name: true,
                    label: true,
                    status: true,
                    pages: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            return {
                success: true,
                data: fluxos.map(fluxo => ({
                    ...fluxo,
                    id: fluxo.id.toString()
                })),
                total: fluxos.length
            };
        } catch (error) {
            console.error("❌ Erro ao listar fluxos:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // 🧹 TESTAR CONEXÃO E SCHEMA
    static async testarSchema() {
        try {
            console.log("🔍 Testando schema da tabela fluxosAssinaturas...");
            
            // Teste 1: Conexão básica
            await prisma.$queryRaw`SELECT 1`;
            console.log("✅ Conexão com banco OK");

            // Teste 2: Verificar se a tabela existe
            const tableExists = await prisma.$queryRaw`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_name = 'fluxosAssinaturas'
            `;
            console.log("📋 Tabela encontrada:", tableExists.length > 0 ? "✅ SIM" : "❌ NÃO");

            // Teste 3: Contar registros (se existir)
            try {
                const count = await prisma.fluxoAssinatura.count();
                console.log("📊 Total de registros:", count);
            } catch (countError) {
                console.log("⚠️ Erro ao contar registros:", countError.message);
            }

            return { 
                success: true, 
                message: "Testes concluídos - verifique os logs acima" 
            };
        } catch (error) {
            console.error("❌ Erro nos testes:", error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }
}

module.exports = FluxoAssinaturaService;