import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { sp } from '@pnp/sp/presets/all';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faBars, faChevronDown} from '@fortawesome/free-solid-svg-icons';
import Icons from '../../assets/Icons';
import { withRouter } from './withRouter'; // Adjust the path based on where your HOC lives






interface INavBarState {
  isPermissionChecked: boolean;
  isPAndIAdmin: boolean;
  isDevTeam: boolean;
  isSalesPerson: boolean;
  isBillingTeam: boolean;
  activeAccordion: string | null;
   showSidebar: boolean;
}

class NavBar extends React.Component<any, INavBarState> {
  constructor(props: any) {
    super(props);
    sp.setup({ spfxContext: this.props.context });
    this.state = {
      isPermissionChecked: false,
      isPAndIAdmin: false,
      isDevTeam: false,
      isSalesPerson: false,
      isBillingTeam: false,
      activeAccordion: null,
      showSidebar: true
    };
  }

  private fetchUserGroups = async () => {
    try {
      const groups = await sp.web.currentUser.groups();
      const currentUserGroupsList = groups.map(group => group.Title);
      this.setState({
        isPermissionChecked: true,
        isPAndIAdmin: currentUserGroupsList.includes('P&I Administrators'),
        isDevTeam: currentUserGroupsList.includes('Dev Team'),
        isSalesPerson: currentUserGroupsList.includes('Sales Team'),
        isBillingTeam: currentUserGroupsList.includes('Billing Team')
      });
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  };

  public componentDidMount() {
    this.fetchUserGroups();
    this.setAccordionFromPath();
  }
  //  private setAccordionFromPath = () => {
  //   const path = this.props.router.location.pathname;

  //   if (['/Client2', '/Location2', '/BillingTeam'].includes(path)) {
  //     this.setState({ activeAccordion: 'masters' });
  //   } else if (['/Estimation', '/Proposal', '/PO', '/ProjectStatus', '/InvoiceForm'].includes(path)) {
  //     this.setState({ activeAccordion: 'forms' });
  //   } else if (['/Estimation_view', '/Proposal_View', '/PO_View', '/ProjectStatus_View', '/Invoice_View'].includes(path)) {
  //     this.setState({ activeAccordion: 'views' });
  //   } else if (['/Reports'].includes(path)) {
  //     this.setState({ activeAccordion: 'reports' });
  //   } else {
  //     this.setState({ activeAccordion: null });
  //   }
  // };
private setAccordionFromPath = () => {
  const path = this.props.router.location.pathname;

  if (/^\/(Client|Location|BillingTeam)(\/.*)?$/.test(path)) {
    this.setState({ activeAccordion: 'masters' });
  } else if (/^\/(Estimation|Proposal|PO|ProjectStatus|InvoiceForm)(\/.*)?$/.test(path)) {
    this.setState({ activeAccordion: 'forms' });
  } else if (/^\/(Estimation_view|Proposal_View|PO_View|ProjectStatus_View|Invoice_View)(\/.*)?$/.test(path)) {
    this.setState({ activeAccordion: 'views' });
  } else if (/^\/Reports(\/.*)?$/.test(path)) {
    this.setState({ activeAccordion: 'reports' });
  } else {
    this.setState({ activeAccordion: null });
  }
};



  public componentDidUpdate(prevProps: any) {
    if (prevProps.router.location.pathname !== this.props.router.location.pathname) {
      this.setAccordionFromPath();
    }
  }

    private toggleSidebar = () => {
    this.setState(prevState => ({ showSidebar: !prevState.showSidebar }));
  };

  private toggleAccordion = (section: string) => {
    this.setState(prevState => ({
      activeAccordion: prevState.activeAccordion === section ? null : section
    }));
  };
  
  public render() {
    const {
      isPermissionChecked,
      isPAndIAdmin,
      isDevTeam,
      isSalesPerson,
      isBillingTeam,
      activeAccordion
    } = this.state;

    if (!isPermissionChecked) return <div>Loading...</div>;

    const showForms = isPAndIAdmin || isDevTeam || isSalesPerson || isBillingTeam;
    const showViews = showForms;
    const showReports = showForms;
    

    return (
        <div>
          <span className='click-nav-icon'>
          <FontAwesomeIcon icon={faBars} onClick={this.toggleSidebar}></FontAwesomeIcon>
           </span>
       {this.state.showSidebar && (
       <div className="sidebar">
        <ul className="left-nav nav-list">
          {isPAndIAdmin && (
            <li className="accordion-item">
              <button type='button' role='button' 
                className={`accordion-header ${activeAccordion === 'masters' ? 'active' : ''}`}
                onClick={() => this.toggleAccordion('masters')}
              >
              <img src={Icons.Masters} height={18} width={18} className={`nav-icons ${activeAccordion === 'masters' ? 'icon-white' : ''}`} ></img>Masters {activeAccordion === 'masters' ? <span className='span-angle-right'><FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon></span>:<span className='span-angle-right'><FontAwesomeIcon icon={faAngleRight}></FontAwesomeIcon></span>}
              </button>
              {activeAccordion === 'masters' && (
                <ul className="submenu">
                  <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/Client"> <img src={Icons.Client} height={18} width={18} className='nav-icons' >
                  </img>Clients</NavLink></li>
                  <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/Location"> <img src={Icons.Location} height={18} width={18} className='nav-icons' >
                  </img>Location</NavLink></li>
                  <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/BillingTeam"> <img src={Icons.BillingTeam} height={18} width={18} className='nav-icons'>
                  </img>Billing Team</NavLink></li>
                </ul>
              )}
            </li>
          )}

          {showForms && (
            <li className="accordion-item">
              <button type='button' role='button'
                className={`accordion-header ${activeAccordion === 'forms' ? 'active' : ''}`}
                onClick={() => this.toggleAccordion('forms')}
              >
               <img src={Icons.Forms} height={18} width={18} className={`nav-icons ${activeAccordion === 'forms' ? 'icon-white' : ''}`} ></img> Forms {activeAccordion === 'forms' ?   <span className='span-angle-right'><FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon></span>:<span className='span-angle-right'><FontAwesomeIcon icon={faAngleRight}></FontAwesomeIcon></span>}
              </button>
              {activeAccordion === 'forms' && (
                <ul className="submenu">
                   <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/Estimation"><img src={Icons.Estimation} height={18} width={18} ></img> Estimations</NavLink></li>
                 {(isPAndIAdmin || isSalesPerson || isBillingTeam) && <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/Proposal"><img src={Icons.Proposal} height={18} width={18} className='nav-icons'></img> Proposal</NavLink></li>}
                 {(isPAndIAdmin || isSalesPerson || isBillingTeam) && <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/PO"><img src={Icons.PO} height={18} width={18} ></img> PO</NavLink></li>}
                  <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/ProjectStatus"><img src={Icons.ProjectStatus} height={18} width={18} className='nav-icons' ></img> Project Status</NavLink></li>
                  {(isPAndIAdmin || isBillingTeam) && <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/InvoiceForm"><img src={Icons.Invoice} height={18} width={18} className='nav-icons' ></img> Invoice</NavLink></li>}
                </ul>
              )}
            </li>
          )}

          {showViews && (
            <li className="accordion-item">
              <button type='button' role='button'
                className={`accordion-header ${activeAccordion === 'views' ? 'active' : ''}`}
                onClick={() => this.toggleAccordion('views')}
              >
              <img src={Icons.Views} height={18} width={18} className={`nav-icons ${activeAccordion === 'views' ? 'icon-white' : ''}`} ></img> Views {activeAccordion === 'views' ?<span className='span-angle-right'><FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon></span>:<span className='span-angle-right'><FontAwesomeIcon icon={faAngleRight}></FontAwesomeIcon></span>}
              </button>
              {activeAccordion === 'views' && (
                <ul className="submenu">
                  <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/Estimation_view"><img src={Icons.Estimation} height={18} width={18} className='nav-icons' ></img> Estimations</NavLink></li>
                  <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/Proposal_View"><img src={Icons.Proposal} height={18} width={18} className='nav-icons' ></img> Proposal</NavLink></li>
                  <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/PO_View"><img src={Icons.PO} height={18} width={18} className='nav-icons' ></img> PO</NavLink></li>
                  <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/ProjectStatus_View"><img src={Icons.ProjectStatus} height={18} width={18} className='nav-icons' ></img> Project Status</NavLink></li>
                  {(isPAndIAdmin || isBillingTeam) && <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/Invoice_View"><img src={Icons.Invoice} height={18} width={18} className='nav-icons' ></img> Invoice</NavLink></li>}
                </ul>
              )}
            </li>
          )}

          {showReports && (
            <li className="accordion-item">
              <button type='button' role='button'
                className={`accordion-header ${activeAccordion === 'reports' ? 'active' : ''}`}
                onClick={() => this.toggleAccordion('reports')}
              >
                 <img src={Icons.Reports} height={18} width={18}  className={`nav-icons ${activeAccordion === 'reports' ? 'icon-white' : ''}`} ></img> Reports {activeAccordion === 'reports' ? <span className='span-angle-right'> <FontAwesomeIcon icon={faChevronDown}></FontAwesomeIcon></span>:<span className='span-angle-right'><FontAwesomeIcon icon={faAngleRight}></FontAwesomeIcon></span>}
              </button>
              {activeAccordion === 'reports' && (
                <ul className="submenu">
                  <li><NavLink className={({isActive})=>isActive? 'nav-click':''} to="/Reports"><img src={Icons.Reports} height={18} width={18} className='nav-icons' ></img> PO and Invoice</NavLink></li>
                </ul>
              )}
            </li>
          )}
        </ul>
      </div>
       )}
      </div>
       
      
    );
  }
}

// export default NavBar;
export default withRouter(NavBar);