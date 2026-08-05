<script>
import { mapGetters } from 'vuex';
import { useUISettings } from 'dashboard/composables/useUISettings';
import { useAccount } from 'dashboard/composables/useAccount';
import AbravelyQueueList from '../../../components/AbravelyQueueList.vue';
import AbravelyConversationPanel from '../../../components/AbravelyConversationPanel.vue';
import ConversationEmptyState from '../../../components/widgets/conversation/EmptyState/EmptyState.vue';
import wootConstants from 'dashboard/constants/globals';
import Button from 'dashboard/components-next/button/Button.vue';
import InboxesAPI from 'dashboard/api/inboxes';

export default {
  components: {
    AbravelyQueueList,
    AbravelyConversationPanel,
    ConversationEmptyState,
    Button,
  },
  props: {
    inboxId: {
      type: [String, Number],
      default: 0,
    },
    conversationId: {
      type: [String, Number],
      default: 0,
    },
    label: {
      type: String,
      default: '',
    },
    teamId: {
      type: String,
      default: '',
    },
    conversationType: {
      type: String,
      default: '',
    },
    foldersId: {
      type: [String, Number],
      default: 0,
    },
  },
  setup() {
    const { uiSettings, updateUISettings } = useUISettings();
    const { accountId } = useAccount();

    return {
      uiSettings,
      updateUISettings,
      accountId,
    };
  },
  data() {
    return {
      showSearchModal: false,
      isConversationActionRunning: false,
      metaTemplates: [],
    };
  },
  computed: {
    ...mapGetters({
      conversationsError: 'getConversationsError',
      currentUserId: 'getCurrentUserID',
      attendants: 'agents/getAgents',
      departments: 'teams/getTeams',
    }),
    currentChat() {
      return (
        this.$store.getters[
          'abravelyConversationPanel/getSelectedConversation'
        ] || {}
      );
    },
    showConversationList() {
      return this.isOnExpandedLayout ? !this.conversationId : true;
    },
    showMessageView() {
      return Boolean(this.conversationId);
    },
    isOnExpandedLayout() {
      const {
        LAYOUT_TYPES: { CONDENSED },
      } = wootConstants;
      const { conversation_display_type: conversationDisplayType = CONDENSED } =
        this.uiSettings;
      return conversationDisplayType !== CONDENSED;
    },

  },
  watch: {
    conversationId() {
      this.fetchConversationIfUnavailable();
    },
  },

  created() {
    if (!this.conversationId) {
      this.$store.dispatch('abravelyConversationPanel/clearSelectedConversation');
    }
  },

  mounted() {
    this.$store.dispatch('agents/get');
    this.initialize();
    document.addEventListener('keydown', this.handleGlobalKeydown);
    this.$watch('$route.params', (newParams, oldParams) => {
      if (JSON.stringify(newParams) !== JSON.stringify(oldParams)) {
        this.initialize();
      }
    });
  },
  unmounted() {
    document.removeEventListener('keydown', this.handleGlobalKeydown);
    this.$store.dispatch('abravelyConversationPanel/clearSelectedConversation');
  },
  methods: {
    handleGlobalKeydown(event) {
      if (event.key !== 'Escape' || !this.conversationId) {
        return;
      }

      event.preventDefault();
      this.closeSelectedConversation();
    },
    async closeSelectedConversation() {
      await this.$store.dispatch(
        'abravelyConversationPanel/clearSelectedConversation'
      );
      await this.$router.replace({
        name: 'home',
        params: { accountId: this.$route.params.accountId },
      });
    },
    retryConnection() {
      if (window.__abravelySocketConnector) {
        window.__abravelySocketConnector.connect();
      }
      this.$store.dispatch('abravelyConversationPanel/refreshActiveQueue');
    },
    onConversationLoad() {
      this.fetchConversationIfUnavailable();
    },
    initialize() {
      this.fetchConversationIfUnavailable();
    },
    toggleConversationLayout() {
      const { LAYOUT_TYPES } = wootConstants;
      const {
        conversation_display_type:
          conversationDisplayType = LAYOUT_TYPES.CONDENSED,
      } = this.uiSettings;
      const newViewType =
        conversationDisplayType === LAYOUT_TYPES.CONDENSED
          ? LAYOUT_TYPES.EXPANDED
          : LAYOUT_TYPES.CONDENSED;
      this.updateUISettings({
        conversation_display_type: newViewType,
        previously_used_conversation_display_type: newViewType,
      });
    },
    async fetchConversationIfUnavailable() {
      if (this.conversationId) {
        if (String(this.currentChat?.id) === String(this.conversationId)) {
          await this.fetchMetaTemplates();
          return;
        }
        try {
          await this.$store.dispatch(
            'abravelyConversationPanel/openConversation',
            this.conversationId
          );
          await this.fetchMetaTemplates();
        } catch (error) {
          this.$store.commit(
            'SET_CONVERSATIONS_ERROR',
            error?.response?.data?.message ||
              error?.message ||
              'Não foi possível carregar a conversa.'
          );
        }
      } else if (this.currentChat?.id) {
        this.$store.dispatch(
          'abravelyConversationPanel/clearSelectedConversation'
        );
      }
    },
    onSearch() {
      this.showSearchModal = true;
    },
    closeSearch() {
      this.showSearchModal = false;
    },
    async refreshCurrentConversation() {
      await this.$store.dispatch(
        'abravelyConversationPanel/openConversation',
        this.conversationId
      );
      await this.$store.dispatch('abravelyConversationPanel/refreshActiveQueue');
      await this.fetchMetaTemplates();
    },
    async fetchMetaTemplates() {
      const channelType =
        this.currentChat?.channel?.type || this.currentChat?.meta?.channel;
      const channelId =
        this.currentChat?.channelId ||
        this.currentChat?.channel_id ||
        this.currentChat?.inbox_id;
      if (channelType !== 'META_CLOUD' || !channelId) {
        this.metaTemplates = [];
        return;
      }

      try {
        const response = await InboxesAPI.getApprovedTemplates(channelId);
        this.metaTemplates = response.data?.templates || [];
      } catch (error) {
        this.metaTemplates = [];
        this.$store.commit(
          'SET_CONVERSATIONS_ERROR',
          error?.response?.data?.message ||
            'Não foi possível carregar os templates Meta aprovados.'
        );
      }
    },
    async runConversationAction(action, payload) {
      if (!this.conversationId || this.isConversationActionRunning) return;

      this.isConversationActionRunning = true;
      try {
        await this.$store.dispatch(`abravelyConversationPanel/${action}`, payload);
        await this.refreshCurrentConversation();
      } catch (error) {
        this.$store.commit(
          'SET_CONVERSATIONS_ERROR',
          error?.response?.data?.message ||
            error?.message ||
            'Não foi possível concluir a ação na conversa.'
        );
      } finally {
        this.isConversationActionRunning = false;
      }
    },
    claimConversation() {
      return this.runConversationAction('claim', this.conversationId);
    },
    transferConversation(destination) {
      return this.runConversationAction('transfer', {
        conversationId: this.conversationId,
        ...destination,
      });
    },
    closeConversation() {
      return this.runConversationAction('close', {
        conversationId: this.conversationId,
        reason: 'Resolvido pelo atendente',
      });
    },
    reopenConversation() {
      return this.runConversationAction('reopen', this.conversationId);
    },
    sendNativeMessage(message) {
      return this.runConversationAction('sendMessage', {
        conversationId: this.conversationId,
        ...message,
      });
    },
    sendNativeTemplate(template) {
      return this.runConversationAction('sendTemplate', {
        conversationId: this.conversationId,
        ...template,
      });
    },
    async selectNativeConversation(conversation) {
      await this.$store.dispatch(
        'abravelyConversationPanel/openConversation',
        conversation.id
      );
      await this.$router.push({
        name: 'inbox_conversation',
        params: {
          accountId: this.$route.params.accountId,
          conversation_id: conversation.id,
        },
      });
    },
  },
};
</script>

<template>
  <section class="flex flex-col w-full h-full min-w-0">
    <div
      v-if="conversationsError"
      class="p-3 bg-n-ruby-2 border-b border-n-ruby-5 text-n-ruby-11 flex items-center justify-between z-10"
    >
      <span class="text-sm font-medium">{{ conversationsError }}</span>
      <Button
        label="Tentar novamente"
        size="sm"
        slate
        @click="retryConnection"
      />
    </div>

    <div class="flex w-full h-full min-w-0 flex-1">
      <AbravelyQueueList
        :show-conversation-list="showConversationList"
        :is-on-expanded-layout="isOnExpandedLayout"
        :selected-conversation-id="conversationId"
        @conversation-load="onConversationLoad"
        @select-conversation="selectNativeConversation"
      />
      <AbravelyConversationPanel
        v-if="showMessageView"
        :conversation="currentChat"
        :current-user-id="currentUserId"
        :attendants="attendants"
        :departments="departments"
        :meta-templates="metaTemplates"
        :is-submitting="isConversationActionRunning"
        @claim="claimConversation"
        @transfer="transferConversation"
        @close="closeConversation"
        @reopen="reopenConversation"
        @send-message="sendNativeMessage"
        @send-template="sendNativeTemplate"
      />
      <ConversationEmptyState
        v-else
        :is-on-expanded-layout="isOnExpandedLayout"
      />
    </div>
  </section>
</template>
