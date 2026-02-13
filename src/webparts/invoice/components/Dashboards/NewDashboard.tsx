
import * as React from 'react';
import { sp } from '@pnp/sp/presets/all';
import TableGenerator from '../Shared/TableGenerator';
import DateUtilities from '../Utilities/Dateutilities';
import { useNavigate } from 'react-router-dom';
import Icons from '../../assets/Icons';
import { showLoader, hideLoader } from '../Shared/Loader';
import UnAuthorized from '../Shared/UnAuthorized.Component';
interface INewDashboardProps {
  spContext: any;
}
const NewDashboard: React.FC <(INewDashboardProps)>=({spContext}) => {
  const [proposals, setProposals] = React.useState<any[]>([]);
  const [poItems, setPoItems] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState<'PO' | 'INVOICE'>('PO');
  const [isLocationConfigured, setIsLocationConfigured] = React.useState(true);
  const [isSales, setIsSales] = React.useState(false);
  const [isAuthorized, setIsAuthorized] = React.useState<boolean | null>(null);


  const navigate = useNavigate();

  React.useEffect(() => {
    fetchProposalDetails();
    fetchPOInvoiceDetails();
  }, []);

  // Fetch Proposals for Pending PO
  const fetchProposalDetails = async () => {
    try {
      showLoader();
      const currentUser = await sp.web.currentUser.get();
      const userGroups = await sp.web.currentUser.groups.get();

      const isAdmin = userGroups.some(g => g.Title === 'P&I Administrators');
      const isBilling = userGroups.some(g => g.Title === 'Billing Team');
      const isSales = userGroups.some(g => g.Title === 'Sales Team');
      const isDev = userGroups.some(g => g.Title === 'Dev Team');
      const isAuthorized = isAdmin || isBilling || isSales || isDev;
      setIsSales(isSales);
      setIsAuthorized(isAuthorized);
      if (!isAuthorized) {
        // setIsLocationConfigured(false);
        hideLoader();
        return;
      }

      const [billingData, clientData] = await Promise.all([
        sp.web.lists.getByTitle("BillingTeamMatrix").items
          .filter(`User/Id eq ${currentUser.Id}`)
          .select("Location")
          .get(),
        sp.web.lists.getByTitle("Clients").items
          .filter("ISActive eq 1")
          .expand("Sales_x0020_Person_x0020_Name", "Alternate_x0020_Sales_x0020_Pers")
          .select("Title", "ID", "Location", "Sales_x0020_Person_x0020_Name/EMail", "Alternate_x0020_Sales_x0020_Pers/EMail")
          .get()
      ]);

      const masterClientData = clientData.map(c => {
        const salesPersonMails = [
          ...(c.Sales_x0020_Person_x0020_Name?.map((sp: any) => sp.EMail) || []),
          ...(c.Alternate_x0020_Sales_x0020_Pers?.map((sp: any) => sp.EMail) || [])
        ];
        return { Client: c.Title, ClientID: c.ID, SalesPerson: salesPersonMails, Location: c.Location };
      });

      let userLocations: string[] = [];
      let userClients: any[] = [];

      if (isAdmin || isDev) {
        const billingTeamMatrixData = await sp.web.lists.getByTitle("BillingTeamMatrix").items.select("Location").get();
        userLocations = Array.from(new Set(billingTeamMatrixData.map(b => b.Location)));
        userClients = masterClientData;
      } else if (isBilling) {
        userLocations = Array.from(new Set(billingData.map(b => b.Location)));
        userClients = masterClientData.filter(c => userLocations.includes(c.Location));
      } else if (isSales) {
        const userEmail = currentUser.Email;
        userClients = masterClientData.filter(c => c.SalesPerson.includes(userEmail));
        userLocations = Array.from(new Set(userClients.map(c => c.Location)));
      }

      if (userLocations.length === 0) {
        // setIsLocationConfigured(false);
        hideLoader();
        return;
      }

      // Fetch ProposalDetails for each location filtered by IsProposalTagged = 0 and Status = Approved
      const proposalPromises = userLocations.map(location => {
        const clientFilter = userClients.map(c => `ClientName eq '${c.Client}'`).join(' or ');
        const filterQuery = clientFilter
          ? `ProposalFor eq '${location}' and (${clientFilter}) and IsProposalTagged eq 0 and Status eq 'Approved'`
          : `ProposalFor eq '${location}' and IsProposalTagged eq 0 and Status eq 'Approved'`;

        return sp.web.lists.getByTitle("ProposalDetails").items
          .filter(filterQuery)
          .expand("SubmittedBy")
          .select("Id", "Title", "ProposalFor", "ClientName", "SubmittedDate", "Amount", "Status", "Created", "SubmittedBy/Title", "Modified")
          .orderBy("Id", false)
          .top(5000)
          .get();
      });

      const proposalData: any[][] = await Promise.all(proposalPromises);
      const flatData = proposalData.flat();
      flatData.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime());
      setProposals(flatData);
      hideLoader();
    } catch (error) {
      console.error("Error fetching proposals", error);
      hideLoader();
    }
  };

  // Fetch Pending Invoice (PO Details)
  const fetchPOInvoiceDetails = async () => {
    try {
      showLoader();
      const currentUser = await sp.web.currentUser.get();
      const userGroups = await sp.web.currentUser.groups.get();

      const isAdmin = userGroups.some(g => g.Title === 'P&I Administrators');
      const isBilling = userGroups.some(g => g.Title === 'Billing Team');
      const isSales = userGroups.some(g => g.Title === 'Sales Team');
      const isDev = userGroups.some(g => g.Title === 'Dev Team');
      const isAuthorized = isAdmin || isBilling || isSales || isDev;


      if (!isAuthorized) {
        // setIsLocationConfigured(false);     
      return 
    
    }
      
      const [billingData, clientData] = await Promise.all([
        sp.web.lists.getByTitle("BillingTeamMatrix").items
          .filter(`User/Id eq ${currentUser.Id}`)
          .select("Location")
          .get(),
        sp.web.lists.getByTitle("Clients").items
          .filter("ISActive eq 1")
          .expand("Sales_x0020_Person_x0020_Name", "Alternate_x0020_Sales_x0020_Pers")
          .select("Title", "ID", "Location", "Sales_x0020_Person_x0020_Name/EMail", "Alternate_x0020_Sales_x0020_Pers/EMail")
          .get()
      ]);

      const masterClientData = clientData.map(c => {
        const salesPersonMails = [
          ...(c.Sales_x0020_Person_x0020_Name?.map((sp: any) => sp.EMail) || []),
          ...(c.Alternate_x0020_Sales_x0020_Pers?.map((sp: any) => sp.EMail) || [])
        ];
        return { Client: c.Title, ClientID: c.ID, SalesPerson: salesPersonMails, Location: c.Location };
      });

      let userLocations: string[] = [];
      let userClients: any[] = [];

      if (isAdmin || isDev) {
        const billingTeamMatrixData = await sp.web.lists.getByTitle("BillingTeamMatrix").items.select("Location").get();
        userLocations = Array.from(new Set(billingTeamMatrixData.map(b => b.Location)));
        userClients = masterClientData;
      } else if (isBilling) {
        userLocations = Array.from(new Set(billingData.map(b => b.Location)));
        userClients = masterClientData.filter(c => userLocations.includes(c.Location));
      } else if (isSales) {
        const userEmail = currentUser.Email;
        userClients = masterClientData.filter(c => c.SalesPerson.includes(userEmail));
        userLocations = Array.from(new Set(userClients.map(c => c.Location)));
      }

      if (userLocations.length === 0) {
        setIsLocationConfigured(false);
        hideLoader();
        return;
      }

      // Fetch PODetails for each location
      const poPromises = userLocations.map(location => {
        const clientFilter = userClients.map(c => `ClientName eq '${c.Client}'`).join(' or ');
        const filterQuery = clientFilter
          ? `ProposalFor eq '${location}' and (${clientFilter}) and IsPOInvoiceTagged eq 0`
          : `ProposalFor eq '${location}' and IsPOInvoiceTagged eq 0`;

        return sp.web.lists.getByTitle("PODetails").items
          .filter(filterQuery)
          .expand("Author")
          .select("*", "Author/Title", "Author/Id", "Modified")
          .orderBy("Id", false)
          .top(5000)
          .get();
      });

      const poData: any[][] = await Promise.all(poPromises);
      const flatPoData = poData.flat();
      flatPoData.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime());
      setPoItems(flatPoData);
      hideLoader();
    } catch (error) {
      console.error("Error fetching PO items", error);
      hideLoader();
    }
  };
     if (isAuthorized === null) {
     return null; // or loader
     }
     if (isAuthorized === false) {
    return <UnAuthorized spContext={spContext} />;
   
  }

     const configurationValidtion = () => {
      var navBar = document.getElementsByClassName("sidebar");
      var hamburgericon=document.getElementsByClassName("click-nav-icon");
      hamburgericon[0]?.classList.add("d-none");
      navBar[0]?.classList.add("d-none");
      return (
        <div className='noConfiguration w-100'>
          <div className='ImgUnLink'><img src={Icons.unLink} alt="" className='' /></div>
          <b>You are not configured in Masters</b>Please contact Administrator.
        </div>
      );
    }

  const proposalColumns = [
    { name: "Location", selector: (row: any) => row.ProposalFor, sortable: true },
    { name: "Client Name", selector: (row: any) => row.ClientName, sortable: true },
    { name: "Project Title", selector: (row: any) => row.Title, sortable: true },
    { name: "Submitted Date", selector: (row: any) => DateUtilities.getDateMMDDYYYY(row.SubmittedDate), sortable: true },
    {
      name: "Amount",
      selector: (row: any) => {
        const amount = parseFloat(row.Amount);
        return isNaN(amount) ? "-" : new Intl.NumberFormat('en-US').format(amount);
      },
      sortable: true,
    },
    { name: "Status", selector: (row: any) => row.Status, sortable: true },
    { name: "Created By", selector: (row: any) => row.SubmittedBy?.Title || "-", sortable: true },
    { name: "Created Date", selector: (row: any) => DateUtilities.getDateMMDDYYYY(row.Created), sortable: true },
  ];

  const poColumns = [
    { name: "Location", selector: (row: any) => row.ProposalFor, sortable: true },
    { name: "Client Name", selector: (row: any) => row.ClientName, sortable: true },
    { name: "Project Title", selector: (row: any) => row.ProjectTitle, sortable: true },
    { name: "PO Number", selector: (row: any) => row.PONumber, sortable: true },
    { name: "PO Type", selector: (row: any) => row.POType, sortable: true },
    {
      name: "PO Value",
      selector: (row: any) => {
        const amount = parseFloat(row.POValue);
        return isNaN(amount) ? "-" : new Intl.NumberFormat('en-US').format(amount);
      },
      sortable: true,
    },
    { name: "Created By", selector: (row: any) => row.Author?.Title || "-", sortable: true },
    { name: "Created Date", selector: (row: any) => DateUtilities.getDateMMDDYYYY(row.Created), sortable: true },
  ];

  const handlePoRowClick = (row: any) => navigate(`/PO?ProposalId=${row.Id}`);
  const handleInvoiceRowClick = (row: any) => navigate(`/InvoiceForm?POID=${row.Id}`);

  return (
    
  <div>

    {isLocationConfigured && (
      <>
        <div className="tab-header">
          <button
            className={activeTab === 'PO' ? 'active-tab' : ''}
            onClick={() => setActiveTab('PO')}
          >
            Pending for PO - {proposals.length > 0 && (
              <span className="count-badge">{proposals.length}</span>
            )}
          </button>

          {!isSales && (
            <button
              className={activeTab === 'INVOICE' ? 'active-tab' : ''}
              onClick={() => setActiveTab('INVOICE')}
            >
              Pending for Invoice - {poItems.length > 0 && (
                <span className="count-badge">{poItems.length}</span>
              )}
            </button>
          )}
        </div>

        <div className="border-box-shadow light-box table-responsive dataTables_wrapper-overflow right-search-table py-2">
          {activeTab === 'PO' && (
            <TableGenerator
              columns={proposalColumns}
              data={proposals}
              fileName="PendingForPO"
              onRowClick={handlePoRowClick}
            />
          )}

          {activeTab === 'INVOICE' && !isSales && (
            <TableGenerator
              columns={poColumns}
              data={poItems}
              fileName="PendingForInvoice"
              onRowClick={handleInvoiceRowClick}
            />
          )}
        </div>
      </>
    )}

    {!isLocationConfigured && configurationValidtion()}

  </div>
);

};

export default NewDashboard;





