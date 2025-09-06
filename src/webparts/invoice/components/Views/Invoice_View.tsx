import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
import TableGenerator from '../Shared/TableGenerator'; // Adjusted path to match the correct module location
import { Navigate, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import DateUtilities from '../Utilities/Dateutilities';
import { showLoader, hideLoader } from '../Shared/Loader';
import UnAuthorized from '../Shared/UnAuthorized.Component';

export interface InvoiceViewProps {

  match: any;
  spContext: any;
  spHttpClient: SPHttpClient;
  context: any;
  history: any;
}
export interface InvoiceViewState {


}
class InvoiceView extends React.Component<InvoiceViewProps, InvoiceViewState> {
  public state = {
    data: [],
    allData: [],
    columns: [],
    tableData: {},
    loading: true,
    modalText: '',
    modalTitle: '',
    isSuccess: false,
    showHideModal: false,
    errorMessage: '',
    ItemID: 0,
    selectedYear: '',
    allYears: [],
    redirect: false,
    isAdmin: false,
    isPermissionChecked: false,
    isUnAuthorized: false,

  }
  constructor(props: any) {
    super(props);
    sp.setup({
      spfxContext: this.props.context
    });


  }
  public componentDidMount() {

    
    showLoader();
    this.checkpermisssion();
    
    this.GetOnloadData();
    document.getElementById('ddlsearch')?.focus();

  }
  private GetOnloadData = () => {


    let TrList = 'Invoices';
    try {

      // get all the items from a list
      sp.web.lists.getByTitle(TrList).items.expand("Author").select("Author/Title", "Author/Id", "*").orderBy("Id", false).get().
        then((response: any[]) => {
          //console.log(response);
          this.BindData(response);
        });
    }
    catch (e) {
      this.setState({
        modalTitle: 'Error',
        modalText: 'Sorry! something went wrong',
        showHideModal: true,
        isSuccess: false
      });
      hideLoader();
      console.log('failed to fetch data');
    }
  }
  private async checkpermisssion() {
    try {
      const userGroups = await sp.web.currentUser.groups.get();
      const adminGroups = [
        'P&I Administrators',
        'Billing Team'
      ];
      const isAdminuser = userGroups.some(group => adminGroups.includes(group.Title)
      );
      this.setState({ isAdmin: isAdminuser, isPermissionChecked: true, isUnAuthorized: !isAdminuser }, () => { hideLoader(); })

    }
    catch (error) {
      console.error('Error checking admin status:', error);
      this.setState(
        { isAdmin: false, isPermissionChecked: true },
        () => { hideLoader(); }
      );
    }
  }




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
        ProposalFor: Item.ProposalFor,
        ClientName: Item.ClientName,
        InvoiceType: Item.InvoiceType,
        ProposalID: Item.ProposalID,
        TotalPo: Item.TotalPo,
        InvoiceAmount: Item.InvoiceAmount,
        AvailableBalance: Item.AvailableBalance,
        PaymentStatus: Item.PaymentStatus,
        SubmittedDate: Item.SubmittedDate,
        Author: Item.Author != null ? Item.Author.Title : '',
        Created: Item.Created,


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
    // if (!this.state.isPermissionChecked || !this.state.isAdmin) {
    //   const navIcon = document.querySelector('.click-nav-icon') as HTMLElement;
    //   if (navIcon) {
    //     navIcon.style.display = 'none';
    //   }
    // }
    // if (!this.state.isPermissionChecked) {
    //   return null
    // }
    

    let columns = [
      {
        name: "Edit",
        //selector: "Id",
        selector: (row: { Id: any; }, i: any) => row.Id,
        cell: (record: { Id: any; }) => {
          return (
            <React.Fragment>
              <div style={{ paddingLeft: '10px' }}>
                <NavLink title="Edit" className="csrLink ms-draggable" to={`/InvoiceForm/${record.Id}`}>
                  <FontAwesomeIcon icon={faEdit} ></FontAwesomeIcon>
                </NavLink>
              </div>
            </React.Fragment>
          );
        }
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
        name: "Invoice For",
        selector: (row: any, i: any) => row.InvoiceType,
        sortable: true,
      },
      {
        name: "PO Number",
        selector: (row: any, i: any) => row.ProposalID,
        sortable: true,
      },
      // {
      //   name: "Total PO Value",
      //   selector: (row: any, i: any) => row.TotalPo,
      //   sortable: true,
      // },
                            {
  name: "Total PO Value",
  selector: (row: any, i: any) => {
    const amount = parseFloat(row.TotalPo);
    if (isNaN(amount)) return "-";

    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },
  sortable: true,
},
      // {
      //   name: "Invoiced Amount",
      //   selector: (row: any, i: any) => row.InvoiceAmount,
      //   sortable: true,
      // },
                                 {
  name: "Invoiced Amount",
  selector: (row: any, i: any) => {
    const amount = parseFloat(row.InvoiceAmount);
    if (isNaN(amount)) return "-";

    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },
  sortable: true,
},
      // {
      //   name: "Available Balance",
      //   selector: (row: any, i: any) => row.AvailableBalance,
      //   sortable: true,
      // },
                                       {
  name: "Available Balance",
  selector: (row: any, i: any) => {
    const amount = parseFloat(row.AvailableBalance);
    if (isNaN(amount)) return "-";

    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },
  sortable: true,
},


      {
        name: "Payment Status",
        selector: (row: any, i: any) => row.PaymentStatus,
        sortable: true,
      },
      {
        name: "Invoiced Date",
        selector: (row: any, i: any) => DateUtilities.getDateMMDDYYYY(row.SubmittedDate),
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
      },

    ]
    if (this.state.isUnAuthorized) {
      return <UnAuthorized spContext={this.props.spContext}></UnAuthorized>
    }
    else if (this.state.redirect) {
      let url = `/InvoiceForm/${this.state.ItemID}`;
      return (<Navigate to={url} />);
    }
    else {
      return (
        <React.Fragment>
          <div className='container-fluid'>
            <div className='FormContent ViewTable'>
              <div className='title'> Invoice
                {/* <div className='mandatory-note'>
                    <span className='mandatoryhastrick'>*</span> indicates a required field
                  </div> */}


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


export default InvoiceView;
