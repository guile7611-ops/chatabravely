<script>
import { mapGetters } from 'vuex';
import { useUISettings } from 'dashboard/composables/useUISettings';
import { useAccount } from 'dashboard/composables/useAccount';
import ChatList from '../../../components/ChatList.vue';
import ConversationBox from '../../../components/widgets/conversation/ConversationBox.vue';
import wootConstants from 'dashboard/constants/globals';
import { BUS_EVENTS } from 'shared/constants/busEvents';
import CmdBarConversationSnooze from 'dashboard/routes/dashboard/commands/CmdBarConversationSnooze.vue';
import { emitter } from 'shared/helpers/mitt';
import SidepanelSwitch from 'dashboard/components-next/Conversation/SidepanelSwitch.vue';
import ConversationSidebar from 'dashboard/components/widgets/conversation/ConversationSidebar.vue';
import Button from 'dashboard/components-next/button/Button.vue';

export default {
  components: {
    ChatList,
    ConversationBox,
    CmdBarConversationSnooze,
    SidepanelSwitch,
    ConversationSidebar,
    Button,
  },
  beforeRouteLeave(to, from, next) {
    if (this.conversationId) {
      this.$store.dispatch('clearSelectedState');
    }
    next();
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
    };
  },
  computed: {
    ...mapGetters({
      chatList: 'getAllConversations',
      currentChat: 'getSelectedChat',
      conversationsError: 'getConversationsError',
    }),
    showConversationList() {
      return this.isOnExpandedLayout ? !this.conversationId : true;
    },
    showMessageView() {
      return this.conversationId ? true : !this.isOnExpandedLayout;
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
    this.$store.dispatch('portals/index');
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
    fetchConversationIfUnavailable() {
      if (this.conversationId) {
        const selectedConversation = this.chatList.find(
          c => String(c.id) === String(this.conversationId)
        );
        if (!selectedConversation) {
          this.$store.dispatch('getConversation', this.conversationId);
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
      <ChatList
        :show-conversation-list="showConversationList"
        :conversation-inbox="inboxId"
        :label="label"
        :team-id="teamId"
        :conversation-type="conversationType"
        :folders-id="foldersId"
        :is-on-expanded-layout="isOnExpandedLayout"
        @conversation-load="onConversationLoad"
      />
      <ConversationBox
        v-if="showMessageView"
        :inbox-id="inboxId"
        :is-on-expanded-layout="isOnExpandedLayout"
      >
        <SidepanelSwitch v-if="currentChat.id" />
      </ConversationBox>
      <ConversationSidebar v-if="shouldShowSidebar" :current-chat="currentChat" />
      <CmdBarConversationSnooze />
    </div>
  </section>
</template>
