"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaService = void 0;
const axios_1 = __importDefault(require("axios"));
class MetaService {
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
}
exports.MetaService = MetaService;
