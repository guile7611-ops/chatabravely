import { createStore } from 'vuex';

import accounts from './modules/accounts';
import agents from './modules/agents';
import articles from './modules/helpCenterArticles';
import attributes from './modules/attributes';
import auditlogs from './modules/auditlogs';
import auth from './modules/auth';
import cannedResponse from './modules/cannedResponse';
import categories from './modules/helpCenterCategories';
import campaigns from './modules/campaigns';
import contactConversations from './modules/contactConversations';
import contactLabels from './modules/contactLabels';
import contactNotes from './modules/contactNotes';
import contacts from './modules/contacts';
import customViews from './modules/customViews';
import conversationLabels from './modules/conversationLabels';
import conversationMetadata from './modules/conversationMetadata';
import conversationPage from './modules/conversationPage';
import conversations from './modules/conversations';
import conversationSearch from './modules/conversationSearch';
import conversationStats from './modules/conversationStats';
import conversationTypingStatus from './modules/conversationTypingStatus';
import conversationUnreadCounts from './modules/conversationUnreadCounts';
import conversationWatchers from './modules/conversationWatchers';
import csat from './modules/csat';
import draftMessages from './modules/draftMessages';
import globalConfig from 'shared/store/globalConfig';
import inboxes from './modules/inboxes';
import inboxAssignableAgents from './modules/inboxAssignableAgents';
import integrations from './modules/integrations';
import labels from './modules/labels';
import macros from './modules/macros';
import notifications from './modules/notifications';
import portals from './modules/helpCenterPortals';
import reports from './modules/reports';
import sidebarSortPreferences from './modules/sidebarSortPreferences';
import teamMembers from './modules/teamMembers';
import teams from './modules/teams';
import captainTools from './captain/tools';

const plugins = [];

export default createStore({
  modules: {
    accounts,
    agents,
    articles,
    attributes,
    auditlogs,
    auth,
    cannedResponse,
    categories,
    campaigns,
    contactConversations,
    contactLabels,
    contactNotes,
    contacts,
    customViews,
    conversationLabels,
    conversationMetadata,
    conversationPage,
    conversations,
    conversationSearch,
    conversationStats,
    conversationTypingStatus,
    conversationUnreadCounts,
    conversationWatchers,
    csat,
    draftMessages,
    globalConfig,
    inboxes,
    inboxAssignableAgents,
    integrations,
    labels,
    macros,
    notifications,
    portals,
    reports,
    sidebarSortPreferences,
    teamMembers,
    teams,
    captainTools,
  },
  plugins,
});
