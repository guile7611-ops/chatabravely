"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando a semente inicial de dados do Abravely Chat 1.0...');
    const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
    // 1. Criar Workspace Padrão (SaaS Tenant)
    const workspace = await prisma.workspace.upsert({
        where: { id: 'workspace-demo-1' },
        update: {},
        create: {
            id: 'workspace-demo-1',
            name: 'Abravely Demo Org',
            plan: 'ENTERPRISE',
            maxUsers: 50,
            maxChannels: 10
        }
    });
    console.log(`✅ Workspace criado: ${workspace.name} (${workspace.id})`);
    // 2. Criar Departamentos
    const deptSuporte = await prisma.department.upsert({
        where: { id: 'dept-suporte-1' },
        update: {},
        create: {
            id: 'dept-suporte-1',
            name: 'Suporte Técnico',
            workspaceId: workspace.id
        }
    });
    const deptVendas = await prisma.department.upsert({
        where: { id: 'dept-vendas-1' },
        update: {},
        create: {
            id: 'dept-vendas-1',
            name: 'Vendas & Comercial',
            workspaceId: workspace.id
        }
    });
    console.log(`✅ Departamentos criados: ${deptSuporte.name}, ${deptVendas.name}`);
    // 3. Criar Usuário Admin / Atendente Padrão
    const user = await prisma.user.upsert({
        where: { email: 'guilherme@abravely.com' },
        update: {
            password: hashedPassword
        },
        create: {
            name: 'Guilherme Tenorio (Atendente)',
            email: 'guilherme@abravely.com',
            password: hashedPassword,
            role: 'ADMIN',
            workspaceId: workspace.id,
            departments: {
                connect: [{ id: deptSuporte.id }]
            },
            isOnline: true
        }
    });
    console.log(`✅ Usuário Atendente criado: ${user.name} (${user.email})`);
    // 4. Criar Canais de Atendimento (Evolution API GO & Meta Cloud API)
    const channelEvolution = await prisma.channel.create({
        data: {
            name: 'WhatsApp Vendas (Evolution GO)',
            type: 'EVOLUTION',
            connectionStatus: 'CONNECTED',
            evolutionInstanceName: 'abravely_vendas',
            evolutionApiKey: 'EvolutionApiKey123!',
            workspaceId: workspace.id
        }
    });
    const channelMeta = await prisma.channel.create({
        data: {
            name: 'WhatsApp Oficial (Meta Cloud API)',
            type: 'META_CLOUD',
            connectionStatus: 'CONNECTED',
            metaPhoneNumberId: '109283746501928',
            metaToken: 'EAAG_MOCK_META_TOKEN',
            workspaceId: workspace.id
        }
    });
    console.log(`✅ Canais criados: ${channelEvolution.name} e ${channelMeta.name}`);
    // 5. Criar Contatos de Demonstração
    const contact1 = await prisma.contact.upsert({
        where: {
            workspaceId_phone: { workspaceId: workspace.id, phone: '+55 91 99000-1187' }
        },
        update: {},
        create: {
            name: 'Fernanda Lima',
            phone: '+55 91 99000-1187',
            email: 'fernanda.lima@motorespioneiro.com.br',
            company: 'Motores Pioneiro',
            location: 'Belém, Brasil 🇧🇷',
            biography: 'Analista de Dados na Motores Pioneiro.',
            workspaceId: workspace.id
        }
    });
    const contact2 = await prisma.contact.upsert({
        where: {
            workspaceId_phone: { workspaceId: workspace.id, phone: '+55 11 98888-7766' }
        },
        update: {},
        create: {
            name: 'Roberto Alves',
            phone: '+55 11 98888-7766',
            email: 'roberto@empresa.com.br',
            company: 'Empresa Parceira',
            workspaceId: workspace.id
        }
    });
    const contact3 = await prisma.contact.upsert({
        where: {
            workspaceId_phone: { workspaceId: workspace.id, phone: '+55 21 97777-6655' }
        },
        update: {},
        create: {
            name: 'Juliana Costa',
            phone: '+55 21 97777-6655',
            email: 'juliana@techsol.com',
            company: 'Tech Solutions',
            workspaceId: workspace.id
        }
    });
    // 6. Conversa na Fila RECEPTION (Recepção - IA respondendo)
    const convReception = await prisma.conversation.create({
        data: {
            idNumber: '#101',
            queue: 'RECEPTION',
            status: 'UNATTENDED',
            priority: 'Nenhuma',
            assignedTeam: 'Sem departamento',
            slaTimer: '1h 10m',
            workspaceId: workspace.id,
            channelId: channelEvolution.id,
            contactId: contact2.id,
            agentId: null,
            departmentId: null
        }
    });
    await prisma.message.create({
        data: {
            conversationId: convReception.id,
            senderType: 'CUSTOMER',
            senderName: contact2.name,
            content: 'Olá! Gostaria de saber os preços e planos da Abravely.'
        }
    });
    // 7. Conversa na Fila DEPARTMENT (Aguardando Atendente do Setor Suporte Técnico)
    const convDepartment = await prisma.conversation.create({
        data: {
            idNumber: '#102',
            queue: 'DEPARTMENT',
            status: 'UNATTENDED',
            priority: 'Média',
            assignedTeam: 'Suporte Técnico',
            departmentId: deptSuporte.id,
            slaTimer: '2h 45m',
            workspaceId: workspace.id,
            channelId: channelEvolution.id,
            contactId: contact3.id,
            agentId: null
        }
    });
    await prisma.message.create({
        data: {
            conversationId: convDepartment.id,
            senderType: 'CUSTOMER',
            senderName: contact3.name,
            content: 'Preciso de auxílio técnico com a integração da API.'
        }
    });
    // 8. Conversa na Fila CONVERSATION (Atendimento Humano Ativo)
    const convConversation = await prisma.conversation.create({
        data: {
            idNumber: '#16',
            queue: 'CONVERSATION',
            status: 'OPEN',
            priority: 'Urgente',
            assignedTeam: 'Suporte Técnico',
            departmentId: deptSuporte.id,
            agentId: user.id,
            slaTimer: '9d 22h',
            workspaceId: workspace.id,
            channelId: channelEvolution.id,
            contactId: contact1.id
        }
    });
    await prisma.message.createMany({
        data: [
            {
                conversationId: convConversation.id,
                senderType: 'CUSTOMER',
                senderName: contact1.name,
                content: 'Olá, o painel está bem lento para carregar hoje.',
                createdAt: new Date(Date.now() - 1000 * 60 * 30)
            },
            {
                conversationId: convConversation.id,
                senderType: 'AGENT',
                senderName: user.name,
                avatarPill: 'GT',
                content: 'Oi Fernanda, aqui é o Guilherme. Vamos verificar. Lento em tudo ou numa página só?',
                createdAt: new Date(Date.now() - 1000 * 60 * 20)
            }
        ]
    });
    // 9. Resposta Pronta Demonstrativa
    await prisma.cannedResponse.upsert({
        where: {
            workspaceId_shortcut: {
                workspaceId: workspace.id,
                shortcut: 'boasvindas'
            }
        },
        update: {},
        create: {
            shortcut: 'boasvindas',
            content: 'Olá! Seja bem-vindo ao suporte do Abravely Chat. Como posso te ajudar hoje?',
            workspaceId: workspace.id
        }
    });
    console.log('🎉 Seed com filas RECEPTION, DEPARTMENT e CONVERSATION concluído com sucesso!');
}
main()
    .catch((e) => {
    console.error('❌ Erro durante a execução do seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
