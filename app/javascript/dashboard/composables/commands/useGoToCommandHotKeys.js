import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMapGetter } from 'dashboard/composables/store';
import { useRouter } from 'vue-router';
import { useAdmin } from 'dashboard/composables/useAdmin';
import {
  ICON_ACCOUNT_SETTINGS,
  ICON_AGENT_REPORTS,
  ICON_CANNED_RESPONSE,
  ICON_CONTACT_DASHBOARD,
  ICON_CONVERSATION_DASHBOARD,
  ICON_INBOXES,
  ICON_LABELS,
  ICON_REPORTS_OVERVIEW,
  ICON_TEAM_REPORTS,
  ICON_USER_PROFILE,
} from 'dashboard/helper/commandbar/icons';
import { frontendURL } from 'dashboard/helper/URLHelper';

// Keep the command palette aligned with the routes that are part of Abravely.
// Removed Chatwoot modules must never remain reachable through a hidden command.
const GO_TO_COMMANDS = [
  {
    id: 'goto_conversation_dashboard',
    title: 'COMMAND_BAR.COMMANDS.GO_TO_CONVERSATION_DASHBOARD',
    section: 'COMMAND_BAR.SECTIONS.GENERAL',
    icon: ICON_CONVERSATION_DASHBOARD,
    path: accountId => `accounts/${accountId}/dashboard`,
    role: ['administrator', 'agent'],
  },
  {
    id: 'goto_contacts_dashboard',
    title: 'COMMAND_BAR.COMMANDS.GO_TO_CONTACTS_DASHBOARD',
    section: 'COMMAND_BAR.SECTIONS.GENERAL',
    icon: ICON_CONTACT_DASHBOARD,
    path: accountId => `accounts/${accountId}/contacts`,
    role: ['administrator', 'agent'],
  },
  {
    id: 'open_reports_overview',
    section: 'COMMAND_BAR.SECTIONS.REPORTS',
    title: 'COMMAND_BAR.COMMANDS.GO_TO_REPORTS_OVERVIEW',
    icon: ICON_REPORTS_OVERVIEW,
    path: accountId => `accounts/${accountId}/reports/overview`,
    role: ['administrator'],
  },
  {
    id: 'open_attendant_settings',
    section: 'COMMAND_BAR.SECTIONS.SETTINGS',
    title: 'COMMAND_BAR.COMMANDS.GO_TO_SETTINGS_AGENTS',
    icon: ICON_AGENT_REPORTS,
    path: accountId => `accounts/${accountId}/settings/attendants/list`,
    role: ['administrator'],
  },
  {
    id: 'open_department_settings',
    section: 'COMMAND_BAR.SECTIONS.SETTINGS',
    title: 'COMMAND_BAR.COMMANDS.GO_TO_SETTINGS_TEAMS',
    icon: ICON_TEAM_REPORTS,
    path: accountId => `accounts/${accountId}/settings/departments/list`,
    role: ['administrator'],
  },
  {
    id: 'open_channel_settings',
    section: 'COMMAND_BAR.SECTIONS.SETTINGS',
    title: 'COMMAND_BAR.COMMANDS.GO_TO_SETTINGS_INBOXES',
    icon: ICON_INBOXES,
    path: accountId => `accounts/${accountId}/settings/channels/list`,
    role: ['administrator'],
  },
  {
    id: 'open_label_settings',
    section: 'COMMAND_BAR.SECTIONS.SETTINGS',
    title: 'COMMAND_BAR.COMMANDS.GO_TO_SETTINGS_LABELS',
    icon: ICON_LABELS,
    path: accountId => `accounts/${accountId}/settings/labels/list`,
    role: ['administrator'],
  },
  {
    id: 'open_canned_response_settings',
    section: 'COMMAND_BAR.SECTIONS.SETTINGS',
    title: 'COMMAND_BAR.COMMANDS.GO_TO_SETTINGS_CANNED_RESPONSES',
    icon: ICON_CANNED_RESPONSE,
    path: accountId => `accounts/${accountId}/settings/canned-response/list`,
    role: ['administrator', 'agent'],
  },
  {
    id: 'open_account_settings',
    title: 'COMMAND_BAR.COMMANDS.GO_TO_SETTINGS_ACCOUNT',
    section: 'COMMAND_BAR.SECTIONS.SETTINGS',
    icon: ICON_ACCOUNT_SETTINGS,
    path: accountId => `accounts/${accountId}/settings/general`,
    role: ['administrator'],
  },
  {
    id: 'open_profile_settings',
    title: 'COMMAND_BAR.COMMANDS.GO_TO_SETTINGS_PROFILE',
    section: 'COMMAND_BAR.SECTIONS.SETTINGS',
    icon: ICON_USER_PROFILE,
    path: accountId => `accounts/${accountId}/profile/settings`,
    role: ['administrator', 'agent'],
  },
];

export function useGoToCommandHotKeys() {
  const { t } = useI18n();
  const router = useRouter();
  const { isAdmin } = useAdmin();
  const currentAccountId = useMapGetter('getCurrentAccountId');

  const goToCommandHotKeys = computed(() => {
    const commands = isAdmin.value
      ? GO_TO_COMMANDS
      : GO_TO_COMMANDS.filter(command => command.role.includes('agent'));

    return commands.map(command => ({
      id: command.id,
      section: t(command.section),
      title: t(command.title),
      icon: command.icon,
      handler: () =>
        router.push(frontendURL(command.path(currentAccountId.value))),
    }));
  });

  return { goToCommandHotKeys };
}
