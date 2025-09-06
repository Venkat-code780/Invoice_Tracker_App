import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
import TableGenerator from '../Shared/TableGenerator';
import DateUtilities from '../Utilities/Dateutilities';
import { Chart } from "react-google-charts";
import { showLoader,hideLoader } from '../Shared/Loader';
import Icons from '../../assets/Icons';
import UnAuthorized from '../Shared/UnAuthorized.Component';


export interface IDashboardProps {
  match: any;
  spContext: any;
  spHttpClient: SPHttpClient;
  context: any;
  history: any;
}

export interface IDashboardState {
  Locations: any[];
  Clients: any[];
  selectedLocation: string;
  Pomaster: any[],
  openClientId: number | null;
  POlist: any[];
  openProposalIds: string[]; // for multiple open proposal IDs
  Invoicetabledata: any[],
  SelectedInvoices: any[],
  SelectedPoValue: number | null;
  loading: boolean;
  isDev: boolean;
  islocationconfigured: boolean;
  isAuthorized: boolean
}

class Dashboard extends React.Component<IDashboardProps, IDashboardState> {
  constructor(props: IDashboardProps) {
    super(props);
    sp.setup({ spfxContext: this.props.context });

    this.state = {
      Locations: [],
      Clients: [],
      selectedLocation: '',
      openClientId: null,
      POlist: [],
      Pomaster: [],
      loading: true,
      openProposalIds: [],
      Invoicetabledata: [],
      SelectedInvoices: [],
      SelectedPoValue: null,
      isDev: false,
       islocationconfigured:true,
       isAuthorized:false            // Assuming you want to track if the user is part of the Dev Team
    };
  }

  public async componentDidMount() {
    showLoader();
    await this.getCurrentUserGroups();
    await this.loadLocationsAndClients();
    hideLoader();

  }
  private async getCurrentUserGroups() {
    try {
      const currentUser = await sp.web.currentUser.get();
      const userGroups = await sp.web.currentUser.groups.get();

      const isAdmin = userGroups.some(g => g.Title === 'P&I Administrators');
      const isBilling = userGroups.some(g => g.Title === 'Billing Team');
      const isSales = userGroups.some(g => g.Title === 'Sales Team');
      const isDev = userGroups.some(g => g.Title === 'Dev Team');
      const isAuthorized =isAdmin || isBilling || isSales || isDev;
        this.setState({ isAuthorized,loading: false });  
        if(!isAuthorized){
          return;
        } 
      // If user is in any of the groups, they are authorized
      

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
      if (isAdmin || isDev) {
          if(isDev) {
            this.setState({ isDev: true });
          }
          if(isAdmin){
              this.setState({ isDev: false });
          }
        // Fetch billing team matrix locations if Dev or Admin
        const billingTeamMatrixData = await sp.web.lists
          .getByTitle("BillingTeamMatrix")
          .items.select("Location")
          .get();

        // Collect all unique locations from Billing Team Matrix
        userLoc = Array.from(new Set(billingTeamMatrixData.map(b => b.Location)));;
        userClients = masterClientData; // Admins and Devs can see all clients
      } else if (isBilling) {
        // Fetch user locations from the billing team
        userLoc = Array.from(new Set(billingData.map(b => b.Location)));
        userClients = masterClientData.filter(c => userLoc.includes(c.Location));
         if (userLoc.length === 0) {
          this.setState({ islocationconfigured: false });
         }

      } else if (isSales) {
        const userEmail = currentUser.Email;
        userClients = masterClientData.filter(c =>
          c.SalesPerson.includes(userEmail)
        );
        userLoc = Array.from(new Set(userClients.map(c => c.Location)));;
      }
       const sortedLocations = userLoc.sort((a, b) => a.localeCompare(b));
      this.setState({
        Locations: userLoc.map(item => ({ Title: item })),
        selectedLocation: userLoc.length > 0 ? userLoc[0] :sortedLocations[0] || '',

      });


    } catch (error) {
      console.error('Error fetching user groups:', error);
      this.setState({ isAuthorized: false });
    }
  }

  private loadLocationsAndClients = async () => {
    try {
      const [clients, pomaster, invoicesdata] = await Promise.all([
        sp.web.lists.getByTitle('Clients').items.getAll(),
        sp.web.lists.getByTitle('PODetails').items.select('ClientName').filter(`Status eq 'In-Progress'`).getAll(),
        sp.web.lists.getByTitle('Invoices').items.getAll()
      ]);

      const activeClientNames = new Set(pomaster.map(po => po.ClientName));
      const filteredClients = clients.filter(client => activeClientNames.has(client.Title));

      //  const defaultLocation = locations.length > 0 ? locations[0].Title : '';
      this.setState({ Clients: filteredClients, Pomaster: pomaster, Invoicetabledata: invoicesdata });

    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  private onClientClick = async (clientId: number) => {
    if (this.state.openClientId === clientId) {
      this.setState({ openClientId: null, POlist: [], openProposalIds: [] });
    } else {
      try {
        const invoices = await sp.web.lists
          .getByTitle('PODetails')
          .items.filter(`ClientID eq '${clientId}' and Status eq 'In-Progress'`)
          .getAll();

        this.setState({
          openClientId: clientId,
          POlist: invoices,
          openProposalIds: [],
        });
      } catch (err) {
        console.log('Error fetching invoices:', err);
      }
    }
  };

  private renderInvoiceTable = (data: any[]) => {
    const columns = [
      {
        name: 'AU$ Invoiced Amount',
        selector: (row: any) => `AU$ ${row.InvoiceAmount ?? 0}`,
        sortable: true,
      },
      {
        name: 'AU$ Balance',
        selector: (row: any) => `AU$ ${row.AvailableBalance ?? 0}`,
        sortable: true,
      },
      {
        name: 'Invoiced Date',
        selector: (row: any) => DateUtilities.getDateMMDDYYYY(row.SubmittedDate),
        sortable: true,
      },
      {
        name: 'Status',
        selector: (row: any) => row.PaymentStatus,
        sortable: true,
      },
    ];
    //        const customStyles = {
    //   headCells: {
    //     style: {
    //       backgroundColor: '#eee',
    //       color: '#572ba7',
    //       fontWeight: 'bold',
    //     },
    //   },
    //   rows: {
    //     style: {
    //       fontSize: '14px',
    //       minHeight: '48px',
    //     },
    //   },
    // };
    return (
      <TableGenerator columns={columns} data={data} fileName={'Invoices'} ></TableGenerator>
    )

  }





  private toggleProposalAccordion = (PONumber: string) => {
    const selectedPO = this.state.POlist.find(po => po.PONumber === PONumber);
    if (selectedPO) {
      this.setState({
        SelectedPoValue: selectedPO.POValue ?? 0
      })
    }
    const { openProposalIds, Invoicetabledata } = this.state;
    if (openProposalIds.includes(PONumber)) {
      this.setState({
        // openProposalIds: openProposalIds.filter((id) => id !== PONumber),
        openProposalIds: [], SelectedInvoices: []
      });
    } else {
      const filtered = Invoicetabledata.filter(inv => inv.ProposalID === PONumber);
      this.setState({
        // openProposalIds: [...openProposalIds, PONumber],

        openProposalIds: [PONumber],
        SelectedInvoices: filtered
      });
    }
  };

  private getSelectedInvoiceSummary = () => {
    const invoices = this.state.SelectedInvoices;
    const totalpovalues = this.state.SelectedPoValue ?? 0;
    let invoicedStatusAmount = 0;
    let receivedStatusAmount = 0;
    let BalanceAmount = 0;
    let totalpovalue = 0;
    if (invoices.length === 0) {
      BalanceAmount = totalpovalues
    }
    else {
      invoices.forEach(inv => {
        const status = (inv.PaymentStatus ?? "").toLowerCase();
        const invoiceVal = inv.InvoiceAmount ?? 0;
        totalpovalue = inv.TotalPo ?? 0;

        if (status === "invoiced") {
          invoicedStatusAmount += invoiceVal;
        } else if (status === "received") {
          receivedStatusAmount += invoiceVal;
        }
      });


      BalanceAmount = totalpovalue - (invoicedStatusAmount + receivedStatusAmount)
    }
    return {
      invoicedStatusAmount,
      receivedStatusAmount,
      BalanceAmount
    };
  };

  private configurationValidtion = () => {
    var navBar = document.getElementsByClassName("sidebar");
    var hamburgericon=document.getElementsByClassName("click-nav-icon");
    hamburgericon[0]?.classList.add("d-none");
    navBar[0]?.classList.add("d-none");
    return (
      <div className='noConfiguration'>
        <div className='ImgUnLink'><img src={Icons.unLink} alt="" className='' /></div>
        <b>You are not configured in Billing Team Matrix.</b>Please contact Administrator.
      </div>
    );
  }

  public render() {
   
    const {
      Locations,
      Clients,
      selectedLocation,
      openClientId,
      POlist,
      openProposalIds,
      

    } = this.state;

    const filteredClients = Clients.filter(
      (client) => client.Location === selectedLocation
    );

    const groupedInvoices: { [key: string]: any[] } = {};
    POlist.forEach((POlist) => {
      const pid = POlist.PONumber || 'Unknown';
      if (!groupedInvoices[pid]) {
        groupedInvoices[pid] = [];
      }
      groupedInvoices[pid].push(POlist);
    });

    const { invoicedStatusAmount, receivedStatusAmount, BalanceAmount } = this.getSelectedInvoiceSummary();

    const pieData = [
      ["Category", "Amount (AU$)"],
      ["Received Amount", receivedStatusAmount],
      ["Invoiced Amount", invoicedStatusAmount],
      ["Balance Amount", BalanceAmount]
    ];

    const pieOptions = {
      // title: "PO Details",
      pieHole: 0.4,
      is3D: true,
      // slices: {
      //   1: { offset: 0.2 }, // Explodes the second slice
      // },
      pieStartAngle: 100, // Rotates the chart
      // sliceVisibilityThreshold: 0.02, // Hides slices smaller than 2%
      legend: {
        position: "right",
        alignment: "center",
        textStyle: {
          color: "#233238",
          fontSize: 10,
        },
      },
      chartArea: {
        left: 20,
        top: 20,
        width: '70%',  // Reduce pie width to make room for legend
        height: '75%'
      },
      colors: ["#008000", "#ffa500", "#ff0000"],
    };
      if (this.state.loading) {
    return <div></div>;  
  }
    if(!this.state.isAuthorized){
      return <UnAuthorized spContext={this.props.spContext} />
    }
  
    return (
      <React.Fragment>
        {this.state.islocationconfigured &&(
        <div className="container-fluid">
          <div className="FormContent">
            <div className="title">Dashboard</div>
            <div className="after-title"></div>
            <div className="pt-2 px-2">
              {/* Location Pills */}
              {/* <div className="row pt-2 px-2">
            <div className="col-md-4"> */}

              <div className="light-text" style={{marginLeft: '7px'}}>
                <ul className="nav nav-pills c-tab-pills">

                  {Locations.length === 1 ? (
                    <li className="nav-item" key={Locations[0].Title}>
                      <span className="pill active">{Locations[0].Title}</span>
                    </li>
                  ) : (
                   Locations.map((loc) => (

                      <li className='nav-item' key={loc.Id || loc.Title}>
                        <button
                          key={loc.Id || loc.Title} // Fallback in case Id is missing
                          type="button"
                          role='button'
                          className={`pill ${selectedLocation === loc.Title ? 'active' : ''}`}
                          onClick={() =>
                            this.setState({
                              selectedLocation: loc.Title,
                              openClientId: null,
                              POlist: [],
                              openProposalIds: [],
                            })
                          }
                        >
                          {loc.Title}
                        </button>
                      </li>

                    ))
                  )}
                </ul>
              </div>
              {/* </div>
          </div> */}

              {/* Client Accordion */}
              <div className="row pt-2 px-2">
                <div className="col-md-12 light-text">
                  {filteredClients.length === 0 ? (
                    <p></p>
                  ) : (
                    filteredClients.map((client) => (
                      <div key={client.Id} className="accordion-item mb-1">
                        <div
                          className="accordion-header"
                          style={{
                            cursor: 'pointer',
                            backgroundColor: '#eee',
                            padding: '10px',
                            fontWeight: 'bold',
                          }}
                          onClick={() =>{
                            if(!this.state.isDev){
                             this.onClientClick(client.Id)
                            }
                            }}
                        >
                          {client.Title}
                        </div>

                        {openClientId === client.Id && (
                          <div className="accordion-body m-2 border">
                            {Object.keys(groupedInvoices).length === 0 ? (
                              <p>No Proposal IDs found.</p>
                            ) : (
                              Object.keys(groupedInvoices).map((pid) => (
                                <div key={pid} className="nested-accordion mt-0 mb-2">
                                  <div
                                    className="nested-header"
                                    style={{
                                      backgroundColor: '#1c507b',
                                      padding: '8px 12px',
                                      color: 'white',
                                      marginBottom: '5px',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      //  borderRadius: '4px',
                                    }}
                                    // onClick={() =>
                                    //    this.toggleProposalAccordion(pid)
                                    //   }
                                      onClick={() =>
                                       
                                       this.toggleProposalAccordion(pid)
                                        
                                      }
  
                                  >
                                    {client.Title}-{pid}
                                    <span className='badge text-bg-info' >
                                      {groupedInvoices[pid][0].ProposalFor === "AUS"
                                        ? `AU$ ${groupedInvoices[pid][0].POValue}`
                                        : groupedInvoices[pid][0].ProposalFor === "GDC" ?
                                          `₹ ${groupedInvoices[pid][0].POValue}`
                                          : groupedInvoices[pid][0].ProposalFor === "Onsite" ?
                                            `$ ${groupedInvoices[pid][0].POValue}`
                                            : groupedInvoices[pid][0].POValue
                                      }

                                    </span>
                                  </div>

                                  {openProposalIds.includes(pid) && (
                                    <div className='p-2'>
                                      {groupedInvoices[pid].map((inv, i) => (
                                        <div key={i}>
                                          <div className='row'>
                                            <div className='col-md-7'>
                                              <div className='table-outer'>
                                                <div className='t-title'>Invoices</div>
                                                {this.renderInvoiceTable(this.state.SelectedInvoices)}
                                              </div>




                                            </div>
                                            <div className='col-md-5'>
                                              <div className='table-outer'>
                                                <div className='t-title'>PO Details</div>
                                                 <Chart
                                                chartType="PieChart"
                                                data={pieData}
                                                options={pieOptions}
                                                width={"100%"}
                                                height={"300px"}
                                              />
                                              </div>

                                             

                                            </div>

                                          </div>

                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
       {!this.state.islocationconfigured&& this.configurationValidtion()}
      </React.Fragment>
    );
  
  
  }
}

export default Dashboard;
