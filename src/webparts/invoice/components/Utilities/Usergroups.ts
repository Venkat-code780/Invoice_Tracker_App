import * as React from 'react';
import { sp } from '@pnp/sp/presets/all';

interface IUserGroupsFetcherProps {
  siteUrl: string;
  onGroupsFetched: (groups: string[]) => void;
}

interface IUserGroupsFetcherState {
  isPermissionChecked: boolean;
  currentUserGroups: string[];
}

class UserGroupsFetcher extends React.Component<IUserGroupsFetcherProps, IUserGroupsFetcherState> {
  constructor(props: IUserGroupsFetcherProps) {
    super(props);
    this.state = {
      isPermissionChecked: false,
      currentUserGroups: []
    };
  }

  public componentDidMount() {
    // ⚠️ Set up PnPjs context using site URL
    sp.setup({
      sp: {
        baseUrl: this.props.siteUrl
      }
    });

    this.fetchUserGroups();
  }

  private fetchUserGroups = async () => {
    try {
      const groups = await sp.web.currentUser.groups();
      const currentUserGroupsList = groups.map(group => group.Title);

      this.setState({
        isPermissionChecked: true,
        currentUserGroups: currentUserGroupsList
      });

      this.props.onGroupsFetched(currentUserGroupsList);
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  public render() {
    return null; // Invisible component
  }
}

export default UserGroupsFetcher;
