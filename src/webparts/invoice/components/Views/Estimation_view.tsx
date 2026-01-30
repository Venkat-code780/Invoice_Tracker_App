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
export interface EstimationViewProps {

  match: any;
  spContext: any;
  spHttpClient: SPHttpClient;
  context: any;
  history: any;
}
export interface EstimationViewState {


}
class EstimationView extends React.Component<EstimationViewProps, EstimationViewState> {
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
    islocationconfigured:true,

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

    // this.GetOnloadData();
    showLoader();
        await this.getCurrentUserGroups();

     
    
    

  }



  private async getCurrentUserGroups() {
    try {
      // const currentUser = await sp.web.currentUser.get();
      // const userGroups = await sp.web.currentUser.groups.get();
      const [currentUser, userGroups, clientData] = await Promise.all([
        sp.web.currentUser.get(),
        sp.web.currentUser.groups.get(),
        sp.web.lists.getByTitle("Clients").items
          .filter("ISActive eq 1")
          .expand("Sales_x0020_Person_x0020_Name", "Alternate_x0020_Sales_x0020_Pers")
          .select("Title", "ID", "Location", "Sales_x0020_Person_x0020_Name/EMail", "Alternate_x0020_Sales_x0020_Pers/EMail")
          .orderBy("Title")
          .top(5000)
          .get()
      ])

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
        await sp.web.lists.getByTitle("Estimations").items
          .filter(`SubmittedBy eq 'Dev Team'`)
          .expand("Author", "ClientName")
          .select("Author/Title", "Author/Id", "ClientName/Title", "ClientName/Id", "*").top(5000)
          .get().then((billingTeamMatrixData: any[]) => {
            // billingTeamMatrixData.sort((a, b) => b.Id - a.Id);
            billingTeamMatrixData.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime())
            this.BindData(billingTeamMatrixData);
          });
        return;
      }
      else if (isBilling) {
        const [billingData] = await Promise.all([
          sp.web.lists.getByTitle("BillingTeamMatrix").items
            .filter(`User/Id eq ${currentUser.Id}`)
            .expand("User")
            .select("User/EMail", "Location")
            .get(),
        ]);
        // Fetch user locations from the billing team
        userLoc = Array.from(new Set(billingData.map(b => b.Location)));
        userClients = masterClientData.filter(c => userLoc.includes(c.Location));
        if(userLoc.length === 0){
          this.setState({islocationconfigured:false})
        }
      } else if (isSales) {
        const userEmail = currentUser.Email;
        userClients = masterClientData.filter(c =>
          c.SalesPerson.includes(userEmail)
        );
        userLoc = Array.from(new Set(userClients.map(c => c.Location)));
         if (userLoc.length === 0) {
          this.setState({ islocationconfigured: false });
        }
       const clientIds = userClients.map(c => c.ClientID); 
  

const fetchedEstimations = userLoc.map((location: string) => {

const clientFilter = clientIds
    .map(id => `ClientName/Id eq ${id}`) 
    .join(' or '); 
       console.log("Client Filter Query:", clientFilter);
const filterQuery = `GDCOrOnsite eq '${location}' and (${clientFilter})`;
 console.log("Filter Query:", filterQuery);
  return sp.web.lists.getByTitle("Estimations").items
    .filter(filterQuery) 
    .expand("Author", "ClientName") 
    .select("Author/Title", "Author/Id", "ClientName/Title", "ClientName/Id", "*").orderBy("Id", false).top(5000) // Select required fields
    .get();
});
   const estimationData: any[][] = await Promise.all(fetchedEstimations);
  const flatEstimationData = estimationData.reduce((acc, curr) => acc.concat(curr), []);
  flatEstimationData.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime());
  this.BindData(flatEstimationData);
  return;
  }

      const fetchedestimations = userLoc.map((location: string) => {
        return sp.web.lists.getByTitle("Estimations").items
          .filter(`GDCOrOnsite eq '${location}'`)
          .expand("Author", "ClientName")
          .select("Author/Title", "Author/Id", "ClientName/Title", "ClientName/Id", "*").orderBy("Id", false).top(5000)
          .get()
      });

      const estimationData: any[][] = await Promise.all(fetchedestimations);
      const flatEstimationData = estimationData.reduce((acc, curr) => {
        return acc.concat(curr);  // Concatenates each sub-array into a single array
      }, []);
      // flatEstimationData.sort((a, b) => b.Id - a.Id)
      
      flatEstimationData.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime())
      this.BindData(flatEstimationData);

     
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  }



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
    if (selectedYear === '') {
      // If no year is selected, reset to show all data
      this.setState({ data: this.state.allData });
    } else {
      // Filter data based on the selected year
      const filteredData = this.state.allData.filter(
        (item: { SubmittedDate: string }) => new Date(item.SubmittedDate).getFullYear().toString() === selectedYear
      );
      this.setState({ data: filteredData });

    }
    hideLoader();
  },100);
  };
   private configurationValidtion = () => {
        var navBar = document.getElementsByClassName("sidebar");
        var hamburgericon=document.getElementsByClassName("click-nav-icon");
        hamburgericon[0]?.classList.add("d-none");
        navBar[0]?.classList.add("d-none");
        return (
          <div className='noConfiguration w-100'>
            <div className='ImgUnLink'><img src={Icons.unLink} alt="" className='' /></div>
            <b>You are not configured in Masters.</b>Please contact Administrator.
          </div>
        );
      }

  private BindData(response: any) {
    let data: any = [];
    
    response.forEach((Item: any) => {
      data.push({
        Id: Item.Id,
        GDCOrOnsite: Item.GDCOrOnsite,
        ClientName: Item.ClientName != null ? Item.ClientName.Title : '',
        TitleOfTheProject: Item.TitleOfTheProject,
        EstimatedHour: Item.EstimatedHour,
        TitleoftheEstimation: Item.TitleoftheEstimation,
        Author: Item.Author != null ? Item.Author.Title : '',
        EstimationStatus: Item.EstimationStatus,
        Status: Item.Status,
        SubmittedDate: Item.SubmittedDate,


      });
    });
    const allYears = this.getYears(response);
    this.setState({ data: data, allYears: allYears, allData: data, SaveUpdateText: 'Submit' });
    hideLoader();
  }
  private handleRowClicked = (row: any, Id?: any) => {
    let ID = row.Id ? row.Id : Id;
    this.setState({ ItemID: ID, redirect: true });
  }
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
                <NavLink title="Edit" className="csrLink ms-draggable" to={`/Estimation/${record.Id}`}>
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
        selector: (row: any, i: any) => row.GDCOrOnsite,
        sortable: true,

      },
      {
        name: "Client Name",
        selector: (row: any, i: any) => row.ClientName,
        sortable: true,
      },
      {
        name: "Title of the Project",
        selector: (row: any, i: any) => row.TitleOfTheProject,
        sortable: true,

      },
      {
        name: "Estimated Hours",
        selector: (row: any, i: any) => row.EstimatedHour,
        sortable: true,
        wrap: true,
      },
      {
        name: "Title of the Estimation",
        selector: (row: any, i: any) => row.TitleoftheEstimation,
        sortable: true,

      },
      {
        name: "Estimation Status",
        selector: (row: any, i: any) => row.EstimationStatus,
        sortable: true,

      },
      {
        name: "Proposal Status",
        selector: (row: any, i: any) => row.Status,
        sortable: true,

      },
      {
        name: "Submitted Date",
        selector: (row: any, i: any) => DateUtilities.getDateMMDDYYYY(row.SubmittedDate),
        sortable: true,

      },
      {
        name: "Submitted By",
        selector: (row: any, i: any) => row.Author,
        sortable: true,

      },


    ]
    if(this.state.unauthorized){
      hideLoader();
      return <UnAuthorized spContext={this.props.spContext}></UnAuthorized>
    }
    if (this.state.redirect) {
      let url = `/Estimation/${this.state.ItemID}`;
      return (<Navigate to={url} />);
    }
    else {
      return (
        <React.Fragment>
          {this.state.islocationconfigured && (
          <div className='container-fluid'>
            <div className='FormContent ViewTable'>
              <div className='title'> Estimations

              </div>
              <div className="after-title"></div>
              <div className="px-3 View-Table">
                <div className="col-md-4 px-0">
                  <div className="light-text mt-3 mb-2">
                    <label color='#0b3e50'>Year</label>
                    <select className="form-control" id='ddlsearch' required={true} name="selectedYear" value={this.state.selectedYear} title="selectedYear" onChange={this.handleYearChange}>
                      <option value=''>All</option>
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
            

              {/* <div className="light-box border-box-shadow mx-2 table-head-1st-td py-2 right-search-table"> */}
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


export default EstimationView;
