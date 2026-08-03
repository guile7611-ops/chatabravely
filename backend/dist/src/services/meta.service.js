"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaService = void 0;
const axios_1 = __importDefault(require("axios"));
class MetaService {
    /**
     * Buscar detalhes do número de telefone (display_phone_number e name) na Meta Graph API
     */
    static async getPhoneNumberDetails(metaPhoneNumberId, metaAccessToken) {
        try {
            const url = `https://graph.facebook.com/v19.0/${metaPhoneNumberId}`;
            const response = await axios_1.default.get(url, {
                headers: {
                    'Authorization': `Bearer ${metaAccessToken}`
                }
            });
            return response.data; // { display_phone_number, verified_name, id, ... }
        }
        catch (error) {
            console.warn(`⚠️ [MetaService] Não foi possível consultar detalhes do número ${metaPhoneNumberId}:`, error.response?.data || error.message);
            return null;
        }
    }
    /**
     * Enviar mensagem de texto via WhatsApp Meta Cloud API Oficial
     */
    static async sendTextMessage(metaPhoneNumberId, metaAccessToken, toPhone, text) {
        try {
            const formattedPhone = toPhone.replace(/\D/g, '');
            const url = `https://graph.facebook.com/v19.0/${metaPhoneNumberId}/messages`;
            const response = await axios_1.default.post(url, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedPhone,
                type: 'text',
                text: { body: text }
            }, {
                headers: {
                    'Authorization': `Bearer ${metaAccessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error(`❌ [MetaService] Erro ao enviar mensagem oficial para ${toPhone}:`, error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || 'Falha no envio de mensagem via WhatsApp Meta Cloud API');
        }
    }
    /**
     * Enviar midias via WhatsApp Meta Cloud API Oficial
     */
    static async sendMediaMessage(metaPhoneNumberId, metaAccessToken, toPhone, mediaType, mediaUrl, caption) {
        try {
            const formattedPhone = toPhone.replace(/\D/g, '');
            const url = `https://graph.facebook.com/v19.0/${metaPhoneNumberId}/messages`;
            const payload = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedPhone,
                type: mediaType
            };
            payload[mediaType] = {
                link: mediaUrl,
                caption: caption || undefined
            };
            const response = await axios_1.default.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${metaAccessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error(`❌ [MetaService] Erro ao enviar mídia oficial para ${toPhone}:`, error.response?.data || error.message);
            throw new Error('Falha no envio de mídia via Meta Cloud API');
        }
    }
    /**
     * Buscar templates de mensagem aprovados na Meta Graph API
     */
    static async fetchTemplates(wabaId, metaAccessToken) {
        try {
            const url = `https://graph.facebook.com/v19.0/${wabaId}/message_templates?status=APPROVED&limit=100`;
            const response = await axios_1.default.get(url, {
                headers: {
                    'Authorization': `Bearer ${metaAccessToken}`
                }
            });
            return response.data?.data || [];
        }
        catch (error) {
            console.error(`❌ [MetaService] Erro ao buscar templates para WABA ${wabaId}:`, error.response?.data || error.message);
            // Retornar lista de fallback para ambiente de testes/dev caso o WABA ID não esteja configurado
            return [
                {
                    id: 'tpl_boas_vindas',
                    name: 'boas_vindas_atendimento',
                    language: 'pt_BR',
                    status: 'APPROVED',
                    category: 'UTILITY',
                    components: [
                        { type: 'HEADER', format: 'TEXT', text: 'Abravely Atendimento' },
                        { type: 'BODY', text: 'Olá {{1}}, bem-vindo ao nosso suporte. Como podemos ajudar você hoje?' },
                        { type: 'FOOTER', text: 'Responda a esta mensagem para iniciar o atendimento.' }
                    ]
                },
                {
                    id: 'tpl_lembrete_contato',
                    name: 'lembrete_retorno_suporte',
                    language: 'pt_BR',
                    status: 'APPROVED',
                    category: 'UTILITY',
                    components: [
                        { type: 'BODY', text: 'Olá {{1}}, gostaríamos de confirmar se você ainda precisa de ajuda com o chamado {{2}}.' },
                        { type: 'FOOTER', text: 'Abravely Chat - Equipe de Atendimento' }
                    ]
                }
            ];
        }
    }
    /**
     * Enviar mensagem de Template Aprovado (HSM) via WhatsApp Meta Cloud API
     */
    static async sendTemplateMessage(metaPhoneNumberId, metaAccessToken, toPhone, templateName, languageCode = 'pt_BR', parameters = []) {
        try {
            const formattedPhone = toPhone.replace(/\D/g, '');
            const url = `https://graph.facebook.com/v19.0/${metaPhoneNumberId}/messages`;
            const components = [];
            if (parameters.length > 0) {
                components.push({
                    type: 'body',
                    parameters: parameters.map(val => ({ type: 'text', text: val }))
                });
            }
            const response = await axios_1.default.post(url, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to: formattedPhone,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: languageCode },
                    components: components.length > 0 ? components : undefined
                }
            }, {
                headers: {
                    'Authorization': `Bearer ${metaAccessToken}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error(`❌ [MetaService] Erro ao enviar template ${templateName} para ${toPhone}:`, error.response?.data || error.message);
            throw new Error(error.response?.data?.error?.message || 'Falha no envio de Template via WhatsApp Meta Cloud API');
        }
    }
}
exports.MetaService = MetaService;
