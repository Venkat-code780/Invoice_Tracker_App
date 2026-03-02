
import * as React from 'react';
import { sp } from '@pnp/sp/presets/all';
// import TableGenerator from '../Shared/TableGenerator';
import DateUtilities from '../Utilities/Dateutilities';
import { useNavigate } from 'react-router-dom';
import Icons from '../../assets/Icons';
import { showLoader, hideLoader } from '../Shared/Loader';
import UnAuthorized from '../Shared/UnAuthorized.Component';
import AGGridDataTable from '../Shared/AGGridDataTable'
interface INewDashboardProps {
  spContext: any;
}
const NewDashboard: React.FC<(INewDashboardProps)> = ({ spContext }) => {
  const [proposals, setProposals] = React.useState<any[]>([]);
  const [poItems, setPoItems] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState<'PO' | 'INVOICE'>('PO');
  const [isLocationConfigured, setIsLocationConfigured] = React.useState(true);
  const [isDevUser, setIsDevUser] = React.useState(false);
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
      const isReadOnlyDev = isDev && !isAdmin;
      setIsDevUser(isReadOnlyDev);
     
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
  // const fetchPOInvoiceDetails = async () => {
  //   try {
  //     showLoader();
  //     const currentUser = await sp.web.currentUser.get();
  //     const userGroups = await sp.web.currentUser.groups.get();

  //     const isAdmin = userGroups.some(g => g.Title === 'P&I Administrators');
  //     const isBilling = userGroups.some(g => g.Title === 'Billing Team');
  //     const isSales = userGroups.some(g => g.Title === 'Sales Team');
  //     const isDev = userGroups.some(g => g.Title === 'Dev Team');
  //     const isAuthorized = isAdmin || isBilling || isSales || isDev;


  //     if (!isAuthorized) {
  //       // setIsLocationConfigured(false);     
  //     return 

  //   }

  //     const [billingData, clientData] = await Promise.all([
  //       sp.web.lists.getByTitle("BillingTeamMatrix").items
  //         .filter(`User/Id eq ${currentUser.Id}`)
  //         .select("Location")
  //         .get(),
  //       sp.web.lists.getByTitle("Clients").items
  //         .filter("ISActive eq 1")
  //         .expand("Sales_x0020_Person_x0020_Name", "Alternate_x0020_Sales_x0020_Pers")
  //         .select("Title", "ID", "Location", "Sales_x0020_Person_x0020_Name/EMail", "Alternate_x0020_Sales_x0020_Pers/EMail")
  //         .get()
  //     ]);

  //     const masterClientData = clientData.map(c => {
  //       const salesPersonMails = [
  //         ...(c.Sales_x0020_Person_x0020_Name?.map((sp: any) => sp.EMail) || []),
  //         ...(c.Alternate_x0020_Sales_x0020_Pers?.map((sp: any) => sp.EMail) || [])
  //       ];
  //       return { Client: c.Title, ClientID: c.ID, SalesPerson: salesPersonMails, Location: c.Location };
  //     });

  //     let userLocations: string[] = [];
  //     let userClients: any[] = [];

  //     if (isAdmin || isDev) {
  //       const billingTeamMatrixData = await sp.web.lists.getByTitle("BillingTeamMatrix").items.select("Location").get();
  //       userLocations = Array.from(new Set(billingTeamMatrixData.map(b => b.Location)));
  //       userClients = masterClientData;
  //     } else if (isBilling) {
  //       userLocations = Array.from(new Set(billingData.map(b => b.Location)));
  //       userClients = masterClientData.filter(c => userLocations.includes(c.Location));
  //     } else if (isSales) {
  //       const userEmail = currentUser.Email;
  //       userClients = masterClientData.filter(c => c.SalesPerson.includes(userEmail));
  //       userLocations = Array.from(new Set(userClients.map(c => c.Location)));
  //     }

  //     if (userLocations.length === 0) {
  //       setIsLocationConfigured(false);
  //       hideLoader();
  //       return;
  //     }

  //     // Fetch PODetails for each location
  //     const poPromises = userLocations.map(location => {
  //       const clientFilter = userClients.map(c => `ClientName eq '${c.Client}'`).join(' or ');
  //       const filterQuery = clientFilter
  //         ? `ProposalFor eq '${location}' and (${clientFilter}) and IsPOInvoiceTagged eq 0`
  //         : `ProposalFor eq '${location}' and IsPOInvoiceTagged eq 0`;

  //       return sp.web.lists.getByTitle("PODetails").items
  //         .filter(filterQuery)
  //         .expand("Author")
  //         .select("*", "Author/Title", "Author/Id", "Modified")
  //         .orderBy("Id", false)
  //         .top(5000)
  //         .get();
  //     });

  //     const poData: any[][] = await Promise.all(poPromises);
  //     const flatPoData = poData.flat();
  //     flatPoData.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime());
  //     setPoItems(flatPoData);
  //     hideLoader();
  //   } catch (error) {
  //     console.error("Error fetching PO items", error);
  //     hideLoader();
  //   }
  // };

  const fetchPOInvoiceDetails = async () => {
    try {
      const currentUser = await sp.web.currentUser.get();
      const userGroups = await sp.web.currentUser.groups.get();

      const isAdmin = userGroups.some(g => g.Title === 'P&I Administrators');
      const isBilling = userGroups.some(g => g.Title === 'Billing Team');
      const isSales = userGroups.some(g => g.Title === 'Sales Team');
      const isDev = userGroups.some(g => g.Title === 'Dev Team');
      const isAuthorized = isAdmin || isBilling || isSales || isDev;
       setIsSales(isSales);
      if (!isAuthorized) {
        setIsLocationConfigured(false);
        return

      }

      const [billingData, clientData] = await Promise.all([
        sp.web.lists.getByTitle("BillingTeamMatrix").items
          .filter(`User/Id eq ${currentUser.Id}`)
          .expand("User")
          .select("User/EMail", "Location")
          .get(),

        sp.web.lists.getByTitle("Clients").items
          .filter("ISActive eq 1")
          .expand("Sales_x0020_Person_x0020_Name", "Alternate_x0020_Sales_x0020_Pers")
          .select("Title", "ID", "Location", "Sales_x0020_Person_x0020_Name/EMail", "Alternate_x0020_Sales_x0020_Pers/EMail")
          .orderBy("Title")
          .top(5000)
          .get()
      ]);
      const masterClientData = clientData.map(c => {
        let salesPersonMails: string[] = [];

        if (c.Sales_x0020_Person_x0020_Name?.length) {
          salesPersonMails.push(...c.Sales_x0020_Person_x0020_Name.map((sp: { EMail: any; }) => sp.EMail));
        }
        if (c.Alternate_x0020_Sales_x0020_Pers?.length) {
          salesPersonMails.push(...c.Alternate_x0020_Sales_x0020_Pers.map((sp: { EMail: any; }) => sp.EMail));
        }

        return {
          Client: c.Title,
          ClientID: c.ID,
          SalesPerson: salesPersonMails,
          Location: c.Location
        };
      });

      let userLoc: string[] = [];
      let userClients: any[] = [];

      // For Admin or Dev, we need to fetch billing team locations
      if (isAdmin) {
        // Fetch billing team matrix locations if Dev or Admin
        const billingTeamMatrixData = await sp.web.lists
          .getByTitle("BillingTeamMatrix")
          .items.select("Location")
          .get();

        // Collect all unique locations from Billing Team Matrix
        userLoc = Array.from(new Set(billingTeamMatrixData.map(b => b.Location)));;
        userClients = masterClientData; // Admins and Devs can see all clients
      }
      else if (isDev) {
        const [estimations, proposals, PODetails] = await Promise.all([sp.web.lists.getByTitle("Estimations").items
          .filter(`SubmittedBy eq 'Dev Team'`)
          .expand("Author", "ClientName")
          .select("Author/Title", "Author/Id", "ClientName/Title", "ClientName/Id", "*").top(5000)
          .get(),
        sp.web.lists.getByTitle('ProposalDetails').items.expand("SubmittedBy").select("SubmittedBy/Title", "SubmittedBy/Id", "*").orderBy("Id", false).top(5000).get(),
        sp.web.lists.getByTitle('PODetails').items.expand("Author").select("Author/Title", "Author/Id", "*").filter("Status eq 'In-Progress' and IsPOInvoiceTagged eq 0").orderBy("Id", false).top(5000).get()
        ]);

        const estimationIds = new Set(estimations.map((est: any) => est.Id.toString()));
        const matchedProposals: any[] = proposals.filter(
          (proposal: any) => estimationIds.has(proposal.EstID?.trim())
        );
        const matchedProposalIds = new Set(matchedProposals.map((p: any) => p.Id.toString()));
        const matchedPODetails = PODetails.filter((po: any) =>
          matchedProposalIds.has(po.ProposalID?.toString().trim()) // adjust this field name if needed
        );
        // matchedPODetails.sort((a, b) => b.Id - a.Id)
        matchedPODetails.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime())
        setPoItems(matchedPODetails);
        return;


      }

      else if (isBilling) {
        // Fetch user locations from the billing team
        userLoc = Array.from(new Set(billingData.map(b => b.Location)));
        userClients = masterClientData.filter(c => userLoc.includes(c.Location));
        if (userLoc.length === 0) {
           setIsLocationConfigured(false);
        }
      } else if (isSales) {
        const userEmail = currentUser.Email;
        userClients = masterClientData.filter(c =>
          c.SalesPerson.includes(userEmail)
        );
        userLoc = Array.from(new Set(userClients.map(c => c.Location)));
        if (userLoc.length === 0) {
          setIsLocationConfigured(false);
        }
        const clientIds = userClients.map(c => c.Client);

        const fetchedEstimations = userLoc.map((location: string) => {

          const clientFilter = clientIds
            .map(Title => `ClientName eq '${Title}'`)
            .join(' or ');
          console.log("Client Filter Query:", clientFilter);
          const filterQuery = `ProposalFor eq '${location}' and (${clientFilter})`;
          console.log("Filter Query:", filterQuery);
          return sp.web.lists.getByTitle("PODetails").items
            .filter(filterQuery)
            .expand("Author")
            .select("Author/Title", "Author/Id", "*").orderBy("Id", false).top(5000) // Select required fields
            .get();
        });
        const estimationData: any[][] = await Promise.all(fetchedEstimations);
        const flatEstimationData = estimationData.reduce((acc, curr) => acc.concat(curr), []);
        flatEstimationData.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime());
         setPoItems(flatEstimationData);
       
        return;

      }
      const fetchedestimations = userLoc.map((location: string) => {
        return sp.web.lists.getByTitle('PODetails').items.filter(`ProposalFor eq '${location}' and Status eq 'In-Progress' and IsPOInvoiceTagged eq 0`).expand("Author").select("Author/Title", "Author/Id", "*").orderBy("Id", false).top(5000).get()

      });
      const estimationData: any[][] = await Promise.all(fetchedestimations);
      const flatEstimationData = estimationData.reduce((acc, curr) => {
        return acc.concat(curr);  // Concatenates each sub-array into a single array
      }, []);
      //  flatEstimationData.sort((a, b) => b.Id - a.Id);
      flatEstimationData.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime())
       setPoItems(flatEstimationData);
  
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  }

  if (isAuthorized === null) {
    return null; // or loader
  }
  if (isAuthorized === false) {
    return <UnAuthorized spContext={spContext} />;

  }

  const configurationValidtion = () => {
    var navBar = document.getElementsByClassName("sidebar");
    var hamburgericon = document.getElementsByClassName("click-nav-icon");
    hamburgericon[0]?.classList.add("d-none");
    navBar[0]?.classList.add("d-none");
    return (
      <div className='noConfiguration w-100'>
        <div className='ImgUnLink'><img src={Icons.unLink} alt="" className='' /></div>
        <b>You are not configured in Masters</b>Please contact Administrator.
      </div>
    );
  }
  // const proposalColumns = [
  //   { name: "Location", selector: (row: any) => row.ProposalFor, sortable: true },
  //   { name: "Client Name", selector: (row: any) => row.ClientName, sortable: true },
  //   { name: "Project Title", selector: (row: any) => row.Title, sortable: true },
  //   { name: "Submitted Date", selector: (row: any) => DateUtilities.getDateMMDDYYYY(row.SubmittedDate), sortable: true },
  //   {
  //     name: "Amount",
  //     selector: (row: any) => {
  //       const amount = parseFloat(row.Amount);
  //       return isNaN(amount) ? "-" : new Intl.NumberFormat('en-US').format(amount);
  //     },
  //     sortable: true,
  //   },
  //   // { name: "Status", selector: (row: any) => row.Status, sortable: true },
  //   { name: "Created By", selector: (row: any) => row.SubmittedBy?.Title || "-", sortable: true },
  //   { name: "Created Date", selector: (row: any) => DateUtilities.getDateMMDDYYYY(row.Created), sortable: true,
  //                   sortFunction: (a: any, b: any) =>
  //             new Date(a.Created).getTime() -
  //             new Date(b.Created).getTime() },
  // ];

  const proposalColumns = [
    {
      field: "ProposalFor",
      headerName: "Location",
      sortable: true,
      filter: "agTextColumnFilter",
      resizable: true,
      minWidth: 150,
      width: 150,
      getQuickFilterText: (params: any) => params.value || "",
    },
    {
      field: "ClientName",
      headerName: "Client Name",
      sortable: true,
      filter: "agTextColumnFilter",
      resizable: true,
      minWidth: 200,
      width: 200,
      getQuickFilterText: (params: any) => params.value || "",
    },
    {
      field: "Title",
      headerName: "Project Title",
      sortable: true,
      filter: "agTextColumnFilter",
      resizable: true,
      minWidth: 250,
      width: 250,
      getQuickFilterText: (params: any) => params.value || "",
    },
    {
      field: "SubmittedDate",
      headerName: "Submitted Date",
      sortable: true,
      filter: "agDateColumnFilter",
      minWidth: 150,
      width: 150,
      valueFormatter: (params: any) =>
        params.value ? DateUtilities.getDateMMDDYYYY(params.value) : "-",
    },
    {
      field: "Amount",
      headerName: "Amount",
      sortable: true,
      filter: "agNumberColumnFilter",
      minWidth: 120,
      width: 120,
      valueFormatter: (params: any) => {
        const amount = parseFloat(params.value);
        return isNaN(amount) ? "-" : new Intl.NumberFormat("en-US").format(amount);
      },
    },
    {
      field: "SubmittedBy",
      headerName: "Created By",
      sortable: true,
      filter: "agTextColumnFilter",
      minWidth: 150,
      width: 150,
      valueGetter: (params: any) => params.data.SubmittedBy?.Title || "-",
    },
    {
      field: "Created",
      headerName: "Created Date",
      sortable: true,
      filter: "agDateColumnFilter",
      minWidth: 150,
      width: 150,
      valueFormatter: (params: any) =>
        params.value ? DateUtilities.getDateMMDDYYYY(params.value) : "-",
      comparator: (valueA: any, valueB: any) =>
        new Date(valueA).getTime() - new Date(valueB).getTime(),
    },




  ]



  // const poColumns = [
  //   { name: "Location", selector: (row: any) => row.ProposalFor, sortable: true },
  //   { name: "Client Name", selector: (row: any) => row.ClientName, sortable: true },
  //   { name: "Project Title", selector: (row: any) => row.ProjectTitle, sortable: true },
  //   { name: "PO Number", selector: (row: any) => row.PONumber, sortable: true },
  //   { name: "PO Type", selector: (row: any) => row.POType, sortable: true },
  //   {
  //     name: "PO Value",
  //     selector: (row: any) => {
  //       const amount = parseFloat(row.POValue);
  //       return isNaN(amount) ? "-" : new Intl.NumberFormat('en-US').format(amount);
  //     },
  //     sortable: true,
  //   },
  //   { name: "Created By", selector: (row: any) => row.Author?.Title || "-", sortable: true },
  //   { name: "Created Date", selector: (row: any) => DateUtilities.getDateMMDDYYYY(row.Created), sortable: true, sortFunction: (a: any, b: any) =>
  //             new Date(a.SubmittedDate).getTime() -
  //             new Date(b.SubmittedDate).getTime() },
  // ];

  const poColumns = [
    {
      field: "ProposalFor",
      headerName: "Location",
      sortable: true,
      filter: "agTextColumnFilter",
      resizable: true,
      minWidth: 150,
      width: 150,
      getQuickFilterText: (params: any) => params.value || "",
    },
    {
      field: "ClientName",
      headerName: "Client Name",
      sortable: true,
      filter: "agTextColumnFilter",
      resizable: true,
      minWidth: 200,
      width: 200,
      getQuickFilterText: (params: any) => params.value || "",
    },
    {
      field: "ProjectTitle",
      headerName: "Project Title",
      sortable: true,
      filter: "agTextColumnFilter",
      resizable: true,
      minWidth: 250,
      width: 250,
      getQuickFilterText: (params: any) => params.value || "",
    },
    {
      field: "PONumber",
      headerName: "PO Number",
      sortable: true,
      filter: "agTextColumnFilter",
      resizable: true,
      minWidth: 150,
      width: 150,
    },
    {
      field: "POType",
      headerName: "PO Type",
      sortable: true,
      filter: "agTextColumnFilter",
      resizable: true,
      minWidth: 120,
      width: 120,
    },
    {
      field: "POValue",
      headerName: "PO Value",
      sortable: true,
      filter: "agNumberColumnFilter",
      resizable: true,
      minWidth: 120,
      width: 120,
      valueFormatter: (params: any) => {
        const amount = parseFloat(params.value);
        return isNaN(amount) ? "-" : new Intl.NumberFormat("en-US").format(amount);
      },
    },
    {
      field: "Author",
      headerName: "Created By",
      sortable: true,
      filter: "agTextColumnFilter",
      resizable: true,
      minWidth: 150,
      width: 150,
      valueGetter: (params: any) => params.data.Author?.Title || "-",
    },
    {
      field: "Created",
      headerName: "Created Date",
      sortable: true,
      filter: "agDateColumnFilter",
      resizable: true,
      minWidth: 150,
      width: 150,
      valueFormatter: (params: any) =>
        params.value ? DateUtilities.getDateMMDDYYYY(params.value) : "-",
      comparator: (valueA: any, valueB: any) =>
        new Date(valueA).getTime() - new Date(valueB).getTime(),
    },

  ]


  const handlePoRowClick = (event: any) => {
    // event.data contains the full row object
    const row = event.data;
    // navigate(`/PO?ProposalId=${row.Id}`);
       navigate(`/PO?ProposalId=${row.Id}&from=dashboard`);

  };
  const handleInvoiceRowClick = (event: any) => {
    const row = event.data; // important in AG Grid
    // navigate(`/InvoiceForm?POID=${row.Id}`);
navigate(`/InvoiceForm?POID=${row.Id}&from=dashboard`);

  };
  // const handlePoRowClick = (row: any) => navigate(`/PO?ProposalId=${row.Id}`);
  // const handleInvoiceRowClick = (row: any) => navigate(`/InvoiceForm?POID=${row.Id}`);

  return (
    <>
      {isLocationConfigured && (

        <div className='container-fluid'>
          <div className='FormContent ViewTable'>
            <div className='title'> Dashboard</div>
            <div className='after-title'></div>
            <div className='border-box-shadow m-2 p-2'>
              <div className='mt-4'>
                <div className="tab-header">
                  <button type='button'
                    className={activeTab === 'PO' ? 'active-tab' : ''}
                    onClick={() => setActiveTab('PO')}
                  >
                    Pending for PO - {proposals.length > 0 && (
                      <span className="count-badge">{proposals.length}</span>
                    )}
                  </button>

              
                    <button type='button'
                      className={activeTab === 'INVOICE' ? 'active-tab' : ''}
                      onClick={() => setActiveTab('INVOICE')}
                    >
                      Pending for Invoice - {poItems.length > 0 && (
                        <span className="count-badge">{poItems.length}</span>
                      )}
                    </button>
               
                </div>

                <div className="border-box-shadow light-box table-responsive dataTables_wrapper-overflow right-search-table py-2">
                  {activeTab === 'PO' && (
                    // <TableGenerator
                    //   columns={proposalColumns}
                    //   data={proposals}
                    //   fileName="PendingForPO"
                    //   onRowClick={handlePoRowClick}
                    // />

                    <AGGridDataTable
                      data={proposals}
                      columns={proposalColumns}
                      showExportExcel={false}
                      showAddButton={false}
                      customBtnClass='px-1 text-right'
                      // navigateOnBtnClick={this.state.ItemId > 0 ? ((this.state.formStatus == "In-Draft" || this.state.formStatus == "Rejected") ? `/ExpenseMultiStepForm/${this.state.ItemId}` : `/ExpenseForm/${this.state.ItemId}`) : ((this.state.formStatus == "In-Draft" || this.state.formStatus == "Rejected") ? "/ExpenseMultiStepForm" : "/ExpenseForm")}
                      btnDivID=''
                      btnSpanID=''
                      btnCaption=" New"
                      btnTitle=''
                      searchBoxLeft={true}
                      onRowClicked={!isDevUser? handlePoRowClick:undefined}
                      domLayout="normal"
                      suppressColumnVirtualization={true}
                      ensureDomOrder={true}
                      suppressHorizontalScroll={false}
                      suppressSizeToFit={true}
                      suppressColumnHiding={true}
                      suppressAutoSize={true}
                      suppressColumnMoveAnimation={true}
                      suppressMovableColumns={true}
                    />

                  )}

                  {activeTab === 'INVOICE' && (
                    // <TableGenerator
                    //   columns={poColumns}
                    //   data={poItems}
                    //   fileName="PendingForInvoice"
                    //   onRowClick={handleInvoiceRowClick}
                    // />
                    <AGGridDataTable
                      data={poItems}
                      columns={poColumns}
                      showExportExcel={false}
                      showAddButton={false}
                      customBtnClass='px-1 text-right'
                      // navigateOnBtnClick={this.state.ItemId > 0 ? ((this.state.formStatus == "In-Draft" || this.state.formStatus == "Rejected") ? `/ExpenseMultiStepForm/${this.state.ItemId}` : `/ExpenseForm/${this.state.ItemId}`) : ((this.state.formStatus == "In-Draft" || this.state.formStatus == "Rejected") ? "/ExpenseMultiStepForm" : "/ExpenseForm")}
                      btnDivID=''
                      btnSpanID=''
                      btnCaption=" New"
                      btnTitle=''
                      searchBoxLeft={true}
                      onRowClicked={!isDevUser && !isSales? handleInvoiceRowClick:undefined}
                      domLayout="normal"
                      suppressColumnVirtualization={true}
                      ensureDomOrder={true}
                      suppressHorizontalScroll={false}
                      suppressSizeToFit={true}
                      suppressColumnHiding={true}
                      suppressAutoSize={true}
                      suppressColumnMoveAnimation={true}
                      suppressMovableColumns={true}
                    />

                  )}


                </div>
              </div>
            </div>
          </div>
        </div>

      )}

      {!isLocationConfigured && configurationValidtion()}

    </>
  );

};

export default NewDashboard;





