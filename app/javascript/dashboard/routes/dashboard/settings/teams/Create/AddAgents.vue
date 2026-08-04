<script>
import { mapGetters } from 'vuex';
import { useAlert } from 'dashboard/composables';

import router from '../../../../index';
import PageHeader from '../../SettingsSubPageHeader.vue';
import AgentSelector from '../AgentSelector.vue';
import Button from 'dashboard/components-next/button/Button.vue';
import { useVuelidate } from '@vuelidate/core';

export default {
  components: {
    PageHeader,
    AgentSelector,
    Button,
  },
  validations: {
    selectedAgents: {
      isEmpty() {
        return !!this.selectedAgents.length;
      },
    },
  },

  setup() {
    return { v$: useVuelidate() };
  },

  data() {
    return {
      selectedAgents: [],
      isCreating: false,
    };
  },

  computed: {
    ...mapGetters({
      agentList: 'agents/getAgents',
      uiFlags: 'teamMembers/getUIFlags',
      memberError: 'teamMembers/getError',
    }),

    teamId() {
      return this.$route.params.teamId;
    },
    headerTitle() {
      return this.$t('TEAMS_SETTINGS.ADD.TITLE', {
        teamName: this.currentTeam.name,
      });
    },
    currentTeam() {
      return this.$store.getters['teams/getTeam'](this.teamId);
    },
  },

  mounted() {
    this.$store.dispatch('agents/get');
  },

  methods: {
    updateSelectedAgents(newAgentList) {
      this.v$.selectedAgents.$touch();
      this.selectedAgents = [...newAgentList];
    },
    selectAllAgents() {
      this.selectedAgents = this.agentList.map(agent => agent.id);
    },
    async addAgents() {
      this.isCreating = true;
      const { teamId, selectedAgents } = this;

      try {
        await this.$store.dispatch('teamMembers/create', {
          teamId,
          agentsList: selectedAgents,
        });
        router.replace({
          name: 'settings_teams_finish',
          params: {
            page: 'new',
            teamId,
          },
        });
        this.$store.dispatch('teams/get');
      } catch (error) {
        useAlert(error.message || this.memberError);
      } finally {
        this.isCreating = false;
      }
    },
  },
};
</script>

<template>
  <div class="h-full w-full px-8 pt-8 col-span-6 overflow-auto">
    <form class="flex flex-col gap-4 mx-0" @submit.prevent="addAgents">
      <PageHeader
        :header-title="headerTitle"
        :header-content="$t('TEAMS_SETTINGS.ADD.DESC')"
      />

      <div
        v-if="memberError"
        class="mb-4 p-4 rounded-xl bg-n-ruby-2 border border-n-ruby-5 text-n-ruby-11 flex items-center justify-between gap-4"
      >
        <span class="text-body-main">{{ memberError }}</span>
        <Button
          :label="$t('TEAMS_SETTINGS.RETRY') || 'Tentar novamente'"
          size="sm"
          variant="secondary"
          :disabled="isCreating || uiFlags.isCreating"
          @click="addAgents"
        />
      </div>

      <div class="w-full h-full">
        <div v-if="v$.selectedAgents.$error">
          <p class="error-message pb-2">
            {{ $t('TEAMS_SETTINGS.ADD.AGENT_VALIDATION_ERROR') }}
          </p>
        </div>
        <AgentSelector
          :agent-list="agentList"
          :selected-agents="selectedAgents"
          :update-selected-agents="updateSelectedAgents"
          :is-working="isCreating || uiFlags.isCreating"
          :submit-button-text="$t('TEAMS_SETTINGS.ADD.BUTTON_TEXT')"
        />
      </div>
    </form>
  </div>
</template>
