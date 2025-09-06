import { sp } from '@pnp/sp/presets/all';

export const checkUserGroupsPnP = async (groupNames: string[]): Promise<{ [group: string]: boolean }> => {
    const result: { [group: string]: boolean } = {};
    const userGroups = await sp.web.currentUser.groups();
  
    const userGroupTitles = userGroups.map(group => group.Title);
  
    groupNames.forEach(groupName => {
      result[groupName] = userGroupTitles.includes(groupName);
    });
  
    return result;
  };