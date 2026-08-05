<script>
import { useAlert } from 'dashboard/composables';
import TeamForm from '../TeamForm.vue';
import router from '../../../../index';
import PageHeader from '../../SettingsSubPageHeader.vue';

export default {
  components: {
    TeamForm,
    PageHeader,
  },
  data() {
    return {
      enabledFeatures: {},
    };
  },
  methods: {
    async createTeam(data) {
      try {
        const team = await this.$store.dispatch('teams/create', {
          ...data,
        });

        router.replace({
          name: 'settings_teams_add_agents',
          params: {
            page: 'new',
            teamId: team.id,
          },
        });
      } catch (error) {
        useAlert(this.$t('TEAMS_SETTINGS.TEAM_FORM.ERROR_MESSAGE'));
      }
    },
  },
};
</script>

<template>
  <div class="h-full w-full p-6 col-span-6 overflow-y-auto">
    <PageHeader
      header-title="Criar departamento"
      header-content="Defina o nome e as regras básicas da nova fila."
    />
    <div class="flex flex-wrap">
      <TeamForm
        :on-submit="createTeam"
        :submit-in-progress="false"
        submit-button-text="Criar departamento"
      />
    </div>
  </div>
</template>
