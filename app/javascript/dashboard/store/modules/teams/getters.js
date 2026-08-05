export const getters = {
  getTeamsError($state) {
    return $state.error;
  },
  getTeams($state) {
    return Object.values($state.records).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  },
  getTeamById: $state => id => {
    return (
      Object.values($state.records).find(
        record => String(record.id) === String(id)
      ) ||
      {}
    );
  },
  getMyTeams($state, $getters) {
    return $getters.getTeams.filter(team => {
      const { is_member: isMember } = team;
      return isMember;
    });
  },
  getUIFlags($state) {
    return $state.uiFlags;
  },
  getTeam: $state => id => {
    const team = $state.records[id];
    return team || {};
  },
};
