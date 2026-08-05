import axios from 'axios';

export class MetaService {
  /**
   * Buscar detalhes do número de telefone (display_phone_number e name) na Meta Graph API
   */
  static async getPhoneNumberDetails(metaPhoneNumberId: string, metaAccessToken: string) {
    try {
      const url = `https://graph.facebook.com/v19.0/${metaPhoneNumberId}`;
      const response = await axios.get(url, {
        params: {
          fields: 'id,display_phone_number,verified_name,whatsapp_business_account',
        },
        headers: {
          'Authorization': `Bearer ${metaAccessToken}`
        }
      });
      return response.data; // { display_phone_number, verified_name, id, ... }
    } catch (error: any) {
      console.warn(`⚠️ [MetaService] Não foi possível consultar detalhes do número ${metaPhoneNumberId}:`, error.response?.data || error.message);
      return null;
    }
  }

  static getWabaId(phoneNumberDetails: any): string | null {
    return phoneNumberDetails?.whatsapp_business_account?.id || null;
  }

  /**
   * Enviar mensagem de texto via WhatsApp Meta Cloud API Oficial
   */
  static async sendTextMessage(
    metaPhoneNumberId: string,
    metaAccessToken: string,
    toPhone: string,
    text: string
  ) {
    try {
      const formattedPhone = toPhone.replace(/\D/g, '');
      const url = `https://graph.facebook.com/v19.0/${metaPhoneNumberId}/messages`;

      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'text',
          text: { body: text }
        },
        {
          headers: {
            'Authorization': `Bearer ${metaAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(`❌ [MetaService] Erro ao enviar mensagem oficial para ${toPhone}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Falha no envio de mensagem via WhatsApp Meta Cloud API');
    }
  }

  /**
   * Enviar midias via WhatsApp Meta Cloud API Oficial
   */
  static async sendMediaMessage(
    metaPhoneNumberId: string,
    metaAccessToken: string,
    toPhone: string,
    mediaType: 'image' | 'audio' | 'document' | 'video',
    mediaUrl: string,
    caption?: string
  ) {
    try {
      const formattedPhone = toPhone.replace(/\D/g, '');
      const url = `https://graph.facebook.com/v19.0/${metaPhoneNumberId}/messages`;

      const payload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: mediaType
      };

      payload[mediaType] = {
        link: mediaUrl,
        caption: caption || undefined
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${metaAccessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error(`❌ [MetaService] Erro ao enviar mídia oficial para ${toPhone}:`, error.response?.data || error.message);
      throw new Error('Falha no envio de mídia via Meta Cloud API');
    }
  }

  /**
   * Buscar templates de mensagem aprovados na Meta Graph API
   */
  static async fetchTemplates(wabaId: string, metaAccessToken: string) {
    try {
      const url = `https://graph.facebook.com/v19.0/${wabaId}/message_templates?status=APPROVED&limit=100`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${metaAccessToken}`
        }
      });

      return response.data?.data || [];
    } catch (error: any) {
      console.error(`❌ [MetaService] Erro ao buscar templates para WABA ${wabaId}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Não foi possível buscar os templates aprovados na Meta.');
    }
  }

  /**
   * Enviar mensagem de Template Aprovado (HSM) via WhatsApp Meta Cloud API
   */
  static async sendTemplateMessage(
    metaPhoneNumberId: string,
    metaAccessToken: string,
    toPhone: string,
    templateName: string,
    languageCode: string = 'pt_BR',
    parameters: string[] = []
  ) {
    try {
      const formattedPhone = toPhone.replace(/\D/g, '');
      const url = `https://graph.facebook.com/v19.0/${metaPhoneNumberId}/messages`;

      const components: any[] = [];
      if (parameters.length > 0) {
        components.push({
          type: 'body',
          parameters: parameters.map(val => ({ type: 'text', text: val }))
        });
      }

      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: formattedPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: languageCode },
            components: components.length > 0 ? components : undefined
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${metaAccessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(`❌ [MetaService] Erro ao enviar template ${templateName} para ${toPhone}:`, error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Falha no envio de Template via WhatsApp Meta Cloud API');
    }
  }
}
