<script>
import { mapGetters } from 'vuex';
import { useUISettings } from 'dashboard/composables/useUISettings';
import { useAccount } from 'dashboard/composables/useAccount';
import AbravelyQueueList from '../../../components/AbravelyQueueList.vue';
import AbravelyConversationPanel from '../../../components/AbravelyConversationPanel.vue';
import ConversationEmptyState from '../../../components/widgets/conversation/EmptyState/EmptyState.vue';
import wootConstants from 'dashboard/constants/globals';
import { BUS_EVENTS } from 'shared/constants/busEvents';
import CmdBarConversationSnooze from 'dashboard/routes/dashboard/commands/CmdBarConversationSnooze.vue';
import { emitter } from 'shared/helpers/mitt';
import ConversationSidebar from 'dashboard/components/widgets/conversation/ConversationSidebar.vue';
import Button from 'dashboard/components-next/button/Button.vue';

export default {
  components: {
    AbravelyQueueList,
    AbravelyConversationPanel,
    ConversationEmptyState,
    CmdBarConversationSnooze,
    ConversationSidebar,
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
    };
  },
  computed: {
    ...mapGetters({
      chatList: 'getAllConversations',
      currentChat: 'getSelectedChat',
      conversationsError: 'getConversationsError',
      currentUserId: 'getCurrentUserID',
      attendants: 'agents/getAgents',
      departments: 'teams/getTeams',
    }),
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

    shouldShowSidebar() {
      if (!this.currentChat.id) {
        return false;
      }

      const { is_contact_sidebar_open: isContactSidebarOpen } = this.uiSettings;
      return isContactSidebarOpen;
    },
  },
  watch: {
    conversationId() {
      this.fetchConversationIfUnavailable();
    },
  },

  created() {
    if (!this.conversationId && this.currentChat?.id) {
      this.$store.dispatch('clearSelectedState');
    }
  },

  mounted() {
    this.$store.dispatch('agents/get');
    this.initialize();
    this.$watch('$route.params', (newParams, oldParams) => {
      if (JSON.stringify(newParams) !== JSON.stringify(oldParams)) {
        this.initialize();
      }
    });
    this.$watch('chatList.length', (newLen, oldLen) => {
      if (newLen !== oldLen) {
        this.setActiveChat();
      }
    });
  },
  unmounted() {
    if (this.conversationId) {
      this.$store.dispatch('clearSelectedState');
    }
  },
  methods: {
    retryConnection() {
      if (window.__abravelySocketConnector) {
        window.__abravelySocketConnector.connect();
      }
      this.$store.dispatch('fetchAllConversations');
    },
    onConversationLoad() {
      this.fetchConversationIfUnavailable();
    },
    initialize() {
      this.$store.dispatch('setActiveInbox', this.inboxId);
      this.setActiveChat();
    },
    setActiveChat() {
      // A route change can happen before its conversation is present in the
      // list. The existing selector handles both cases: it fetches a missing
      // conversation or selects the matching one. Keeping that behavior in a
      // component method also makes the initial mount and list watcher safe.
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
          return;
        }
        const selectedConversation = this.chatList.find(
          c => String(c.id) === String(this.conversationId)
        );
        if (!selectedConversation) {
          const loadedConversation = await this.$store.dispatch(
            'getConversation',
            this.conversationId
          );
          if (loadedConversation) {
            await this.$store.dispatch('setActiveChat', {
              data: loadedConversation,
              after: this.$route.query.messageId,
            });
          }
          return;
        }

        if (
          !selectedConversation ||
          selectedConversation.id === this.currentChat.id
        ) {
          return;
        }
        const { messageId } = this.$route.query;
        this.$store
          .dispatch('setActiveChat', {
            data: selectedConversation,
            after: messageId,
          })
          .then(() => {
            emitter.emit(BUS_EVENTS.SCROLL_TO_MESSAGE, { messageId });
          });
      } else if (this.currentChat?.id) {
        this.$store.dispatch('clearSelectedState');
      }
    },
    onSearch() {
      this.showSearchModal = true;
    },
    closeSearch() {
      this.showSearchModal = false;
    },
    async refreshCurrentConversation() {
      await this.$store.dispatch('getConversation', this.conversationId);
      await this.$store.dispatch('fetchAllConversations');
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
    async selectNativeConversation(conversation) {
      const loadedConversation = await this.$store.dispatch(
        'getConversation',
        conversation.id
      );
      if (!loadedConversation) return;
      await this.$store.dispatch('setActiveChat', { data: loadedConversation });
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
        :is-submitting="isConversationActionRunning"
        @claim="claimConversation"
        @transfer="transferConversation"
        @close="closeConversation"
        @reopen="reopenConversation"
        @send-message="sendNativeMessage"
      />
      <ConversationEmptyState
        v-else
        :is-on-expanded-layout="isOnExpandedLayout"
      />
      <ConversationSidebar v-if="shouldShowSidebar" :current-chat="currentChat" />
      <CmdBarConversationSnooze />
    </div>
  </section>
</template>
