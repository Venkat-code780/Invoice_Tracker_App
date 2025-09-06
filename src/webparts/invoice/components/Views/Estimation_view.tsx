import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
import TableGenerator from '../Shared/TableGenerator'; // Adjusted path to match the correct module location
import { Navigate, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import DateUtilities from '../Utilities/Dateutilities';
import { showLoader, hideLoader } from '../Shared/Loader';

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
    redirect: false

  }
  constructor(props: any) {
    super(props);
    sp.setup({
      spfxContext: this.props.context
    });


  }
  public componentDidMount() {
    document.getElementById('ddlsearch')?.focus();
    //console.log('Project Code:', this.props);

    // this.GetOnloadData();
    showLoader();

    this.getCurrentUserGroups();

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
          .select("Author/Title", "Author/Id", "ClientName/Title", "ClientName/Id", "*")
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
      } else if (isSales) {
        const userEmail = currentUser.Email;
        userClients = masterClientData.filter(c =>
          c.SalesPerson.includes(userEmail)
        );
        userLoc = Array.from(new Set(userClients.map(c => c.Location)));;
      }


      const fetchedestimations = userLoc.map((location: string) => {
        return sp.web.lists.getByTitle("Estimations").items
          .filter(`GDCOrOnsite eq '${location}'`)
          .expand("Author", "ClientName")
          .select("Author/Title", "Author/Id", "ClientName/Title", "ClientName/Id", "*").orderBy("Id", false)
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



  // private GetOnloadData = () => {
  //     let TrList = 'Estimations';
  //     try {

  //       // get all the items from a list
  //       sp.web.lists.getByTitle(TrList).items.expand("Author,ClientName").select("Author/Title","Author/Id","ClientName/Title","ClientName/Id","*").orderBy("Id", false).get().
  //         then((response: any[]) => {
  //           //console.log(response);
  //           this.BindData(response);
  //         });
  //     }
  //     catch (e) {
  //       this.setState({
  //         loading: false,
  //         modalTitle: 'Error',
  //         modalText: 'Sorry! something went wrong',
  //         showHideModal: true,
  //         isSuccess: false
  //       });
  //       console.log('failed to fetch data');
  //     }
  //   }

  private getYears = (data: any[]) => {
    const years: any[] = [];
    data.forEach(function (item) {
      const year = new Date(item.SubmittedDate).getFullYear();
      if (years.indexOf(year) === -1) {
        years.push(year);
      }
    });
    return years.sort((a, b) => b - a);

  };

  private handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = e.target.value;
    this.setState({ selectedYear });

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
  };

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
        }
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
        name: "SubmittedBy",
        selector: (row: any, i: any) => row.Author,
        sortable: true,

      },


    ]
    if (this.state.redirect) {
      let url = `/Estimation/${this.state.ItemID}`;
      return (<Navigate to={url} />);
    }
    else {
      return (
        <React.Fragment>
          <div className='container-fluid'>
            <div className='FormContent ViewTable'>
              <div className='title'> Estimations

              </div>
              <div className="after-title"></div>
              <div className="row pt-2 px-2">
                <div className="col-md-4">
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
              </div>

              {/* <div className="light-box border-box-shadow mx-2 table-head-1st-td py-2 right-search-table"> */}
              <div className="mx-2 border-box-shadow light-box table-responsive dataTables_wrapper-overflow right-search-table py-2">



                <TableGenerator columns={columns} data={this.state.data} fileName={'Location2'} onRowClick={this.handleRowClicked} ></TableGenerator>
              </div>
            </div>
          </div>

        </React.Fragment>
      )
    }
  }
}


export default EstimationView;
