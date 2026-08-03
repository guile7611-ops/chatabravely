"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvolutionService = void 0;
const axios_1 = __importDefault(require("axios"));
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'EvolutionApiKey123!';
const evolutionApi = axios_1.default.create({
    baseURL: EVOLUTION_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_API_KEY
    }
});
class EvolutionService {
    /**
     * Criar uma nova instancia na Evolution API GO
     */
    static async createInstance(instanceName) {
        try {
            const response = await evolutionApi.post('/instance/create', {
                instanceName: instanceName,
                qrcode: true,
                integration: 'WHATSAPP-BAILEYS'
            });
            return response.data;
        }
        catch (error) {
            console.error(`❌ [EvolutionService] Erro ao criar instancia ${instanceName}:`, error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Falha ao criar instância no Evolution GO');
        }
    }
    /**
     * Conectar e obter QR Code base64
     */
    static async connectInstance(instanceName) {
        try {
            const response = await evolutionApi.get(`/instance/connect/${instanceName}`);
            return response.data;
        }
        catch (error) {
            console.error(`❌ [EvolutionService] Erro ao obter QR Code da instancia ${instanceName}:`, error.response?.data || error.message);
            throw new Error('Falha ao obter QR Code de conexão');
        }
    }
    /**
     * Consultar estado da conexao da instancia
     */
    static async fetchConnectionState(instanceName) {
        try {
            const response = await evolutionApi.get(`/instance/connectionState/${instanceName}`);
            return response.data;
        }
        catch (error) {
            return { instance: { state: 'close' } };
        }
    }
    /**
     * Disparar mensagem de texto via WhatsApp
     */
    static async sendTextMessage(instanceName, number, text) {
        try {
            const formattedNumber = number.replace(/\D/g, '');
            const response = await evolutionApi.post(`/message/sendText/${instanceName}`, {
                number: formattedNumber,
                text: text,
                options: {
                    delay: 1200,
                    presence: 'composing'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error(`❌ [EvolutionService] Erro ao enviar mensagem para ${number}:`, error.response?.data || error.message);
            throw new Error('Falha no envio de mensagem via Evolution GO');
        }
    }
    /**
     * Disparar mensagem de midia (Imagem, Video, Documento, Audio)
     */
    static async sendMediaMessage(instanceName, number, mediaUrl, mediaType, caption) {
        try {
            const formattedNumber = number.replace(/\D/g, '');
            const response = await evolutionApi.post(`/message/sendMedia/${instanceName}`, {
                number: formattedNumber,
                mediaMessage: {
                    mediatype: mediaType,
                    caption: caption || '',
                    media: mediaUrl
                }
            });
            return response.data;
        }
        catch (error) {
            console.error(`❌ [EvolutionService] Erro ao enviar mídia (${mediaType}) para ${number}:`, error.response?.data || error.message);
            throw new Error('Falha no envio de mídia via Evolution GO');
        }
    }
    /**
     * Desconectar e encerrar sessao da instancia
     */
    static async logoutInstance(instanceName) {
        try {
            const response = await evolutionApi.delete(`/instance/logout/${instanceName}`);
            return response.data;
        }
        catch (error) {
            console.error(`❌ [EvolutionService] Erro ao deslogar instancia ${instanceName}:`, error.response?.data || error.message);
            return { status: 'CLOSED' };
        }
    }
}
exports.EvolutionService = EvolutionService;
