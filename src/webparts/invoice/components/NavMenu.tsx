import * as React from "react";
import { Nav, INavLinkGroup } from "@fluentui/react";

const NavMenu: React.FunctionComponent = () => {

    const navLinks: INavLinkGroup[] = [
      {
        links: [
          {
            name: 'Estimation',
            url: 'https://synergycomcom.sharepoint.com/sites/SynergyDev/InvoiceTracker/SitePages/Estimation.aspx',
            key: 'Estimation',
          },
          {
            name: 'Proposal',
            url: 'https://synergycomcom.sharepoint.com/sites/SynergyDev/InvoiceTracker/_layouts/workbench.aspx#Proposal',
            key: 'Proposal',
          },
          {
            name: 'PO',
            url: 'https://synergycomcom.sharepoint.com/sites/SynergyDev/InvoiceTracker/_layouts/workbench.aspx#P',
            key: 'PO',
          },
          {
            name: 'Project Status',
            url: '#update',
            key: 'Project Status',
          },
          {
            name: 'Invoice',
            url: '#delete',
            key: 'Invoice',
          },
        ],
      },
    ];
  
    return (
      <div style={{ width: '250px', height: '100%', backgroundColor: '#f4f4f4', padding: '10px' }}>
        <Nav groups={navLinks} />
      </div>
    );
  };
  
  export default NavMenu;