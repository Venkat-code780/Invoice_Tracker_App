import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
import TableGenerator from '../Shared/TableGenerator'; // Adjusted path to match the correct module location
import { Navigate, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import DateUtilities from '../Utilities/Dateutilities';
import { showLoader, hideLoader } from '../Shared/Loader';
import UnAuthorized from '../Shared/UnAuthorized.Component';
import Icons from '../../assets/Icons';

export interface ProjectStatusViewProps {

  match: any;
  spContext: any;
  spHttpClient: SPHttpClient;
  context: any;
  history: any;
}
export interface ProjectStatusViewState {


}
class ProjectStatus extends React.Component<ProjectStatusViewProps, ProjectStatusViewState> {
  public state = {
    data: [],
    allData: [],
    columns: [],
    tableData: {},
    loading: false,
    modalText: '',
    modalTitle: '',
    isSuccess: false,
    showHideModal: false,
    errorMessage: '',
    ItemID: 0,
    selectedYear: '',
    allYears: [],
    redirect: false,
    unauthorized: false,
    islocationconfigured: true,

  }
  constructor(props: any) {
    super(props);
    sp.setup({
      spfxContext: this.props.context
    });


  }
  public async componentDidMount() {
    document.getElementById('ddlsearch')?.focus();

    //console.log('Project Code:', this.props);
    showLoader();

    await this.getCurrentUserGroups();

    //  await this.GetOnloadData();
  }

  private async getCurrentUserGroups() {

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
        this.setState({
          unauthorized: true,
          loading: false
        });
        return;
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
      console.log('User Locations:', userClients);
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
        const [estimations, ProjectStatus] = await Promise.all([sp.web.lists.getByTitle("Estimations").items
          .filter(`SubmittedBy eq 'Dev Team'`)
          .expand("Author", "ClientName")
          .select("Author/Title", "Author/Id", "ClientName/Title", "ClientName/Id", "*")
          .get(),
        sp.web.lists.getByTitle('ProjectStatus').items.expand("Author").select("Author/Title", "Author/Id", "*").orderBy("Id", false).top(5000).get()
        ]);
        console.log('Dev Estimations:', estimations);
        // const estimationIds = new Set(estimations.map((est: any) => est.Id.toString()));
        //     const matchedProposals: any[] = ProjectStatus.filter(
        //  (proposal: any) => estimationIds.has(proposal.EstID?.trim())
        //   );
        // matchedProposals.sort((a, b) => b.Id - a.Id)
        ProjectStatus.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime())
        this.BindData(ProjectStatus);
        return;


      }
      else if (isSales) {
        const userEmail = currentUser.Email;
        userClients = masterClientData.filter(c =>
          c.SalesPerson.includes(userEmail)
        );
        userLoc = Array.from(new Set(userClients.map(c => c.Location)));;
         if (userLoc.length === 0) {
          this.setState({ islocationconfigured: false });
        }
          const clientIds = userClients.map(c => c.Client); 
                                    
                                  const fetchedEstimations = userLoc.map((location: string) => {
                                  
                                  const clientFilter = clientIds
                                      .map(Title  => `ClientName eq '${Title}'`)  
                                      .join(' or '); 
                                         console.log("Client Filter Query:", clientFilter);
                                  const filterQuery = `ProposalFor eq '${location}' and (${clientFilter})`;
                                   console.log("Filter Query:", filterQuery);
                                    return sp.web.lists.getByTitle("ProjectStatus").items
                                      .filter(filterQuery) 
                                      .expand("Author") 
                                      .select("Author/Title","Author/Id","*").orderBy("Id", false).top(5000) // Select required fields
                                      .get();
                                  });
                                     const estimationData: any[][] = await Promise.all(fetchedEstimations);
                                    const flatEstimationData = estimationData.reduce((acc, curr) => acc.concat(curr), []);
                                    flatEstimationData.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime());
                                    this.BindData(flatEstimationData);
                                    return;
        
      }

      else if (isBilling) {
        // Fetch user locations from the billing team
        userLoc = Array.from(new Set(billingData.map(b => b.Location)));
        userClients = masterClientData.filter(c => userLoc.includes(c.Location));
        if (userLoc.length === 0) {
          this.setState({ islocationconfigured: false });
        }
        
      }
      const fetchedestimations = userLoc.map((location: string) => {
        return sp.web.lists.getByTitle('ProjectStatus').items.filter(`ProposalFor eq '${location}'`).expand("Author").select("Author/Title", "Author/Id", "*").orderBy("Id", false).top(5000).get()
      });
      const estimationData: any[][] = await Promise.all(fetchedestimations);
      const flatEstimationData = estimationData.reduce((acc, curr) =>
        acc.concat(curr)  // Concatenates each sub-array into a single array
        , []);
      flatEstimationData.sort((a, b) => b.Id - a.Id);
      flatEstimationData.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime())
      this.BindData(flatEstimationData);


    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  }










  // private GetOnloadData = async () => {
  //     let TrList = 'ProjectStatus';

  //     try {

  //       // get all the items from a list
  //       await sp.web.lists.getByTitle(TrList).items.expand("Author").select("Author/Title","Author/Id","*").orderBy("Id", false).get().
  //         then((response: any[]) => {
  //           response.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime())
  //           //console.log(response);

  //           this.BindData(response);
  //         });
  //     }
  //     catch (e) {
  //       this.setState({
  //         modalTitle: 'Error',
  //         modalText: 'Sorry! something went wrong',
  //         showHideModal: true,
  //         isSuccess: false
  //       });
  //       hideLoader();
  //       console.log('failed to fetch data');
  //     }
  //   }

  //   private getYears=(data: any[])=>{
  //     const years: any[]=[];
  //     data.forEach(function(item){
  //       const year = new Date(item.Created).getFullYear();
  //       if (years.indexOf(year) === -1) {
  //         years.push(year);
  //       }
  //     });
  //     return years.sort((a, b)=> b - a);

  //   };
  private getYears = (data: any[]) => {
    const currentYear = new Date().getFullYear();
    const startYear = 2021;
    const yearsSet = new Set<number>();

    // Add years from data, but only if they are >= 2021
    data.forEach(item => {
      const year = new Date(item.SubmittedDate).getFullYear();
      if (year >= startYear) {
        yearsSet.add(year);
      }
    });

    // Ensure all years from 2021 to current year are included
    for (let year = startYear; year <= currentYear; year++) {
      yearsSet.add(year);
    }

    // Convert to array and sort descending
    return Array.from(yearsSet).sort((a, b) => b - a);
  };

  private handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    showLoader();
    const selectedYear = e.target.value;
    this.setState({ selectedYear });
     setTimeout(() => {
    // if (selectedYear === '') {
    //   // If no year is selected, reset to show all data
    //   this.setState({ data: this.state.allData });
    // } else {
      // Filter data based on the selected year
      const filteredData = this.state.allData.filter(
        (item: { EndDate: string }) => new Date(item.EndDate).getFullYear().toString() === selectedYear
      );
      this.setState({ data: filteredData });
    // }
    hideLoader();
  }, 100); // Simulate a delay for loading effect
  };

  private BindData(response: any) {
    let data: any = [];

    response.forEach((Item: any) => {
      data.push({
        Id: Item.Id,
        ProposalFor: Item.ProposalFor,
        ClientName: Item.ClientName,
        Title: Item.Title,
        PONumber: Item.PONumber,
        ExecutionType: Item.ExecutionType,
        StartDate: Item.StartDate,
        EndDate: Item.EndDate,
        ProjectStatus: Item.ProjectStatus,
        Author: Item.Author != null ? Item.Author.Title : '',
        Created: Item.Created,


      });
    });
    const allYears = this.getYears(response);
      const selectedYear = allYears[0].toString();
        const filteredData = selectedYear
        ? data.filter((item: { EndDate: string }) => new Date(item.EndDate).getFullYear().toString() === selectedYear)
        : data;
    this.setState({ data: filteredData, allYears: allYears, allData: data, SaveUpdateText: 'Submit' });
    hideLoader();
  }
  private handleRowClicked = (row: any, Id?: any) => {
    let ID = row.Id ? row.Id : Id;
    this.setState({ ItemID: ID, redirect: true });
  }


  // private async getCurrentUserGroups() {
  //   try {
  //     // const currentUser = await sp.web.currentUser.get();
  //     // const userGroups = await sp.web.currentUser.groups.get();
  //     const [currentUser, userGroups, ] = await Promise.all([
  //       sp.web.currentUser.get(),
  //       sp.web.currentUser.groups.get(),
  //     ])
  //     console.log('Current User:', currentUser);
  //     const isAdmin = userGroups.some(g => g.Title === 'P&I Administrators');
  //     const isBilling = userGroups.some(g => g.Title === 'Billing Team');
  //     const isSales = userGroups.some(g => g.Title === 'Sales Team');
  //     const isDev = userGroups.some(g => g.Title === 'Dev Team');
  //     const isAuthorized = isAdmin || isBilling || isSales || isDev;
  //         if (!isAuthorized) {
  //       this.setState({
  //         unauthorized: true, 
  //         loading: false
  //       });
  //         return;
  //     }

  //   }
  //   catch (error) {
  //     console.error('Error fetching user groups:', error);
  //     this.setState({
  //       unauthorized: true,
  //       loading: false
  //     });
  //   }
  // }
  private configurationValidtion = () => {
    var navBar = document.getElementsByClassName("sidebar");
    var hamburgericon = document.getElementsByClassName("click-nav-icon");
    hamburgericon[0]?.classList.add("d-none");
    navBar[0]?.classList.add("d-none");
    return (
      <div className='noConfiguration w-100'>
        <div className='ImgUnLink'><img src={Icons.unLink} alt="" className='' /></div>
        <b>You are not configured in Masters.</b>Please contact Administrator.
      </div>
    );
  }

  // private async getCurrentUserGroups() {
  //   try {
  //     // const currentUser = await sp.web.currentUser.get();
  //     // const userGroups = await sp.web.currentUser.groups.get();
  //     const [currentUser, userGroups, clientData] = await Promise.all([
  //       sp.web.currentUser.get(),
  //       sp.web.currentUser.groups.get(),
  //       sp.web.lists.getByTitle("Clients").items
  //         .filter("ISActive eq 1")
  //         .expand("Sales_x0020_Person_x0020_Name", "Alternate_x0020_Sales_x0020_Pers")
  //         .select("Title", "ID", "Location", "Sales_x0020_Person_x0020_Name/EMail", "Alternate_x0020_Sales_x0020_Pers/EMail")
  //         .orderBy("Title")
  //         .top(5000)
  //         .get()
  //     ])

  //     const isAdmin = userGroups.some(g => g.Title === 'P&I Administrators');
  //     const isBilling = userGroups.some(g => g.Title === 'Billing Team');
  //     const isSales = userGroups.some(g => g.Title === 'Sales Team');
  //     const isDev = userGroups.some(g => g.Title === 'Dev Team');
  //     const isAuthorized = isAdmin || isBilling || isSales || isDev;
  //     if (!isAuthorized) {
  //   this.setState({
  //     unauthorized: true, 
  //     loading: false
  //   });
  //     return;
  // }
  //     const masterClientData = clientData.map(c => {
  //       let salesPersonMails: string[] = [];

  //       if (c.Sales_x0020_Person_x0020_Name?.length) {
  //         salesPersonMails.push(...c.Sales_x0020_Person_x0020_Name.map((sp: { EMail: any; }) => sp.EMail));
  //       }
  //       if (c.Alternate_x0020_Sales_x0020_Pers?.length) {
  //         salesPersonMails.push(...c.Alternate_x0020_Sales_x0020_Pers.map((sp: { EMail: any; }) => sp.EMail));
  //       }

  //       return {
  //         Client: c.Title,
  //         ClientID: c.ID,
  //         SalesPerson: salesPersonMails,
  //         Location: c.Location
  //       };
  //     });

  //     let userLoc: string[] = [];
  //     let userClients: any[] = [];

  //     // For Admin or Dev, we need to fetch billing team locations
  //     if (isAdmin) {
  //       // Fetch billing team matrix locations if Dev or Admin
  //       const billingTeamMatrixData = await sp.web.lists
  //         .getByTitle("BillingTeamMatrix")
  //         .items.select("Location")
  //         .get();

  //       // Collect all unique locations from Billing Team Matrix
  //       userLoc = Array.from(new Set(billingTeamMatrixData.map(b => b.Location)));;
  //       userClients = masterClientData; // Admins and Devs can see all clients
  //     }
  //     else if (isDev) {
  //       await sp.web.lists.getByTitle("Estimations").items
  //         .filter(`SubmittedBy eq 'Dev Team'`)
  //         .expand("Author", "ClientName")
  //         .select("Author/Title", "Author/Id", "ClientName/Title", "ClientName/Id", "*")
  //         .get().then((billingTeamMatrixData: any[]) => {
  //           // billingTeamMatrixData.sort((a, b) => b.Id - a.Id);
  //           billingTeamMatrixData.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime())
  //           this.BindData(billingTeamMatrixData);
  //         });
  //       return;
  //     }
  //     else if (isBilling) {
  //       const [billingData] = await Promise.all([
  //         sp.web.lists.getByTitle("BillingTeamMatrix").items
  //           .filter(`User/Id eq ${currentUser.Id}`)
  //           .expand("User")
  //           .select("User/EMail", "Location")
  //           .get(),
  //       ]);
  //       // Fetch user locations from the billing team
  //       userLoc = Array.from(new Set(billingData.map(b => b.Location)));
  //       userClients = masterClientData.filter(c => userLoc.includes(c.Location));
  //       if(userLoc.length === 0){
  //         this.setState({islocationconfigured:false})
  //       }
  //     } else if (isSales) {
  //       const userEmail = currentUser.Email;
  //       userClients = masterClientData.filter(c =>
  //         c.SalesPerson.includes(userEmail)
  //       );
  //       userLoc = Array.from(new Set(userClients.map(c => c.Location)));;
  //     }


  //     const fetchedestimations = userLoc.map((location: string) => {
  //       return sp.web.lists.getByTitle("Estimations").items
  //         .filter(`GDCOrOnsite eq '${location}'`)
  //         .expand("Author", "ClientName")
  //         .select("Author/Title", "Author/Id", "ClientName/Title", "ClientName/Id", "*").orderBy("Id", false)
  //         .get()
  //     });

  //     const estimationData: any[][] = await Promise.all(fetchedestimations);
  //     const flatEstimationData = estimationData.reduce((acc, curr) => {
  //       return acc.concat(curr);  // Concatenates each sub-array into a single array
  //     }, []);
  //     // flatEstimationData.sort((a, b) => b.Id - a.Id)
  //     flatEstimationData.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime())
  //     this.BindData(flatEstimationData);


  //   } catch (error) {
  //     console.error('Error fetching user groups:', error);
  //   }
  // }



  public render() {

    let columns = [
      {
        name: "Edit",
        //selector: "Id",
        selector: (row: { Id: any; }, i: any) => row.Id,
        cell: (record: { Id: any; }) => {
          return (
            <React.Fragment>
              <div style={{ paddingLeft: '10px' }}>
                <NavLink title="Edit" className="csrLink ms-draggable" to={`/ProjectStatus/${record.Id}`}>
                  <FontAwesomeIcon icon={faEdit} ></FontAwesomeIcon>
                </NavLink>
              </div>
            </React.Fragment>
          );
        },
        width:'60px',
      },

      {
        name: "Location",
        selector: (row: any, i: any) => row.ProposalFor,
        sortable: true,
      },
      {
        name: "Client Name",
        selector: (row: any, i: any) => row.ClientName,
        sortable: true,
      },
      {
        name: "Project Name",
        selector: (row: any, i: any) => row.Title,
        sortable: true,
      },
      {
        name: "PO Number",
        selector: (row: any, i: any) => row.PONumber,
        sortable: true,
      },
      {
        name: "Execution Type",
        selector: (row: any, i: any) => row.ExecutionType,
        sortable: true,
      },
      {
        name: "Start Date",
        selector: (row: any, i: any) => DateUtilities.getDateMMDDYYYY(row.StartDate),
        sortable: true,
           sortFunction: (a: any, b: any) =>
              new Date(a.StartDate).getTime() -
              new Date(b.StartDate).getTime()
      },
      {
        name: "End Date",
        selector: (row: any, i: any) => DateUtilities.getDateMMDDYYYY(row.EndDate),
        sortable: true,
         sortFunction: (a: any, b: any) =>
              new Date(a.EndDate).getTime() -
              new Date(b.EndDate).getTime()
      },
      {
        name: "Project Status",
        selector: (row: any, i: any) => row.ProjectStatus,
        sortable: true,
      },
      {
        name: "Created By",
        selector: (row: any, i: any) => row.Author,
        sortable: true,
      },
      {
        name: "Created Date",
        selector: (row: any, i: any) => DateUtilities.getDateMMDDYYYY(row.Created),
        sortable: true,
                 sortFunction: (a: any, b: any) =>
              new Date(a.Created).getTime() -
              new Date(b.Created).getTime()
      },





    ]
    if (this.state.unauthorized) {
      hideLoader();
      return <UnAuthorized spContext={this.props.spContext}></UnAuthorized>
    }
    if (this.state.redirect) {
      let url = `/ProjectStatus/${this.state.ItemID}`;
      return (<Navigate to={url} />);
    }
    else {
      return (
        <React.Fragment>
          {this.state.islocationconfigured && (
            <div className='container-fluid'>
              <div className='FormContent ViewTable'>
                <div className='title'> Project Status
                  {/* <div className='mandatory-note'>
                    <span className='mandatoryhastrick'>*</span> indicates a required field
                  </div> */}


                </div>
                <div className="after-title"></div>
                <div className="px-3 View-Table">
                  <div className="col-md-4 px-0">
                    <div className="light-text mt-3 mb-2">
                      <label color='#0b3e50'>Year</label>
                      <select className="form-control" id='ddlsearch' required={true} name="selectedYear" value={this.state.selectedYear} title="selectedYear" onChange={this.handleYearChange}>
             
                        {this.state.allYears.map((year: any) => {
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );

                        })}


                      </select>
                    </div>
                  </div>
               
                {/*              
              <div className="light-box border-box-shadow mx-2 table-head-1st-td py-2 right-search-table"> */}
              <div className="border-box-shadow light-box table-responsive dataTables_wrapper-overflow right-search-table py-2">



                  <TableGenerator columns={columns} data={this.state.data} fileName={'Location2'} onRowClick={this.handleRowClicked} ></TableGenerator>
                </div>
                 </div>
                </div>
              </div>
          )}
          {!this.state.islocationconfigured && this.configurationValidtion()}
        </React.Fragment>

      )
    }
  }
}


export default ProjectStatus;
