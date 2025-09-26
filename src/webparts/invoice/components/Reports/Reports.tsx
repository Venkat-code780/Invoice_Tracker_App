import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
// import TableGenerator from '../Shared/TableGenerator';
import DateUtilities from '../Utilities/Dateutilities';
import { Chart } from "react-google-charts";
import DatePicker from '../Shared/DatePickerField';
import { Navigate } from 'react-router-dom';
import { ControlType } from '../Utilities/Constants';
import formValidation from '../Utilities/Formvalidator';

import { showToast } from '../Utilities/toastHelper';
import { showLoader,hideLoader } from '../Shared/Loader';
import UnAuthorized from '../Shared/UnAuthorized.Component';
 

// import DateUtilities from '../Utilities/Dateutilities';

export interface IReportProps {
  match: any;
  spContext: any;
  spHttpClient: SPHttpClient;
  context: any;
  history: any;

}

export interface IReportState {
  Locations: any[];
  Location: string
  ClientNames: any[];
  ClientName: string,
  StartDate: Date | null,
  EndDate: Date | null,
  errorMessage: string
  Homeredirect: boolean,
  items: any[],
  POresultData: any[],
  InvoiceresultData: any[],
  combinedTotalData: any[],
    chartData: any;
  pieData: any;
  loading: boolean;
  unauthorized: boolean;
}

class Reports extends React.Component<IReportProps, IReportState> {
    private tempPOResults: any[] = [];
  private tempInvoiceResults: any[] = [];
  private noOfServiceCalls: number = 0;
  private completedCallsCount: number = 0;

  

  constructor(props: any) {
    super(props);
            const currentyear = new Date().getFullYear();
            const startDate = new Date(`${currentyear}-01-01`);  // Start date: 01/01/2025
        const endDate = new Date(); 
    sp.setup({ spfxContext: this.props.context });
     this.inputLocation = React.createRef();
  this.inputClientName = React.createRef();
  this.inputStartDate = React.createRef();
  this.inputEndDate = React.createRef();
    this.state = {
      Location: '',
      Locations: [],
      ClientNames: [],
      ClientName: '',
      StartDate: startDate,
      EndDate: endDate,
      errorMessage: '',
      Homeredirect: false,
      items: [],
      combinedTotalData: [],
      POresultData: [],
      InvoiceresultData: [],
        chartData: null,
  pieData: null,
      loading: false,
      unauthorized: false

    };
  }
  private inputLocation: React.RefObject<HTMLSelectElement>;
  inputClientName: React.RefObject<HTMLSelectElement>;
  private inputStartDate: React.RefObject<HTMLInputElement>;
  private inputEndDate: React.RefObject<HTMLInputElement>;


  public componentDidMount() {
     document.getElementById('ddlLocation')?.focus();
     this.getCurrentUserGroups();
    this.getEstimationsListData()
 
  setTimeout(() => {
    const startDateInput = document.getElementById('DivStartDate') as HTMLInputElement;
    const endDateInput = document.getElementById('DivEndDate') as HTMLInputElement;

    if (startDateInput) {
      startDateInput.readOnly = true;
      startDateInput.addEventListener('keydown', e => e.preventDefault());
    }

    if (endDateInput) {
      endDateInput.readOnly = true;
      endDateInput.addEventListener('keydown', e => e.preventDefault());
    }
  }, 0);



  }
  private async getCurrentUserGroups(){
    try {
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
          .select( "User/EMail","Location")
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
    } else if (isSales) {
      const userEmail = currentUser.Email;
      userClients = masterClientData.filter(c =>
        c.SalesPerson.includes(userEmail)
      );
      userLoc = Array.from(new Set(userClients.map(c => c.Location))); ;
    }

    this.setState({
      Locations: userLoc.map(item=>({
                 label: item,
                 value: item
               })),
      
      Location: userLoc.length === 1 ? userLoc[0] : '',
    });
    hideLoader();
      if(userLoc.length === 1){
        this.fetchClientsBasedOnLocation(userLoc[0]);
   
      }
  
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  }


  private handleChange1 = (event: any) => {
    const selectedClientName = event.target.options[event.target.selectedIndex].text;
    if (event.target.name === 'ClientName') {


      this.setState({
        ClientName: selectedClientName
      });

    }


  }

  private SubmitData = () => {
        this.tempInvoiceResults = [];
         this.tempPOResults = [];
      let data = {
           location: { val: this.state.Location, required: true, Name: 'Location', Type: ControlType.string, Focusid: this.inputLocation },
            clientName: { val: this.state.ClientName, required: true, Name: 'ClientName', Type: ControlType.string, Focusid: this.inputClientName },
            startDate: { val: this.state.StartDate, required: true, Name: 'StartDate', Type: ControlType.date, Focusid:'DivStartDate' },
            endDate: { val: this.state.EndDate, required: true, Name:' EndDate', Type: ControlType.date, Focusid:'DivEndDate' }
           
           
         };
     

    // let data={
       
    // }
      let isValid = formValidation.checkValidations(data);
    if (isValid.status) {
          this.getReportData()
    } else {
            //  this.setState({ errorMessage: isValid.message });
            showToast('error', isValid.message);
          }
  }
  private mmddyyyyhhmmtoDateTime(dateTimeStr: string): Date | null {
    if (dateTimeStr !== "") {
      // Split the date and time parts
      const dateTime = dateTimeStr.split(" ");  // Split by space between date and time

      if (dateTime.length !== 2) {
        console.error("Invalid date-time format:", dateTimeStr);
        return null;
      }

      // Split the date part into month, day, year
      const dateArr = dateTime[0].split("/");

      if (dateArr.length === 3) {
        const [month, day, year] = dateArr;

        // Ensure the date is formatted as "YYYY-MM-DD"
        const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

        // If we have a valid time part, append it
        const isoString = `${isoDate}T${dateTime[1]}`;

        // Create a new Date object from the ISO string
        const parsedDate = new Date(isoString);

        // Check if the parsed date is valid
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        } else {
          console.error("Invalid ISO string:", isoString);
        }
      }
    }
    return null;  // Return null if the input format is invalid
  }



  private getReportData = async () => {
    try {
      const Start: string | null = this.state.StartDate ? new Date(this.state.StartDate).toISOString() : null;
      const End: string | null = this.state.EndDate ? new Date(this.state.EndDate).toISOString() : null;
      console.log(Start, End);

      let yearArray: number[] = [];

      if (this.state.StartDate && this.state.EndDate) {
        const startYear = this.state.StartDate.getFullYear();
        const endYear = this.state.EndDate.getFullYear();

        for (let year = startYear; year <= endYear; year++) {
          yearArray.push(year);
        }
      }
      const queryArr: string[] = [];
      for (let i = 0; i < yearArray.length; i++) {
        let query = `ISActive eq 1 and ProposalFor eq '${this.state.Location}'`;
        if (this.state.ClientName !== "All" ) {
          query += ` and ClientName eq '${this.state.ClientName}'`
        }
        let isoStartDate: string | null;
        let isoEndDate: string | null;
        if (i === 0) {
          isoStartDate = this.state.StartDate ? new Date(`${this.state.StartDate.getMonth() + 1}/${this.state.StartDate.getDate()}/${this.state.StartDate.getFullYear()} 00:00`).toISOString() : null;
          console.log(isoStartDate)
        } else {
          isoStartDate = new Date(`01/01/${yearArray[i]} 00:00`).toISOString();

        }
        if (i === yearArray.length - 1) {
          isoEndDate = this.state.EndDate ? new Date(`${this.state.EndDate.getMonth() + 1}/${this.state.EndDate.getDate()}/${this.state.EndDate.getFullYear()} 23:59`).toISOString() : null;
          console.log(isoEndDate)
        } else
          isoEndDate = new Date(`12/31/${yearArray[i]} 23:59`).toISOString();

        query += " and (Modified ge '" + isoStartDate + "' and Modified le '" + isoEndDate + "')";
        queryArr.push(query);
      }
      for (let q = 0; q < queryArr.length; q++) {
        this.noOfServiceCalls++;
        this.getCollMgmtDatabyQuery(queryArr[q], yearArray); 
      }

    }
    catch (error) {
      console.error("Error fetching report data:", error);
      this.setState({ errorMessage: "An error occurred while fetching the data." });
    }
  }

  private async getCollMgmtDatabyQuery(filterQuery: string, yearArray: number[]): Promise<void> {

    try {
      const POList = "PODetails";
      let allItems: any[] = [];
      let Pageditems = await sp.web.lists.getByTitle(POList).items.select("*").top(2000).filter(filterQuery).getPaged();
      allItems = [...allItems, ...Pageditems.results];
      while (Pageditems.hasNext) {
        Pageditems = await Pageditems.getNext();
        allItems = [...allItems, ...Pageditems.results];
      }
      this.tempPOResults = [...this.tempPOResults, ...allItems];

      this.completedCallsCount++;

      if (this.completedCallsCount === this.noOfServiceCalls) {
    
        this.noOfServiceCalls = 0;
        this.completedCallsCount = 0;
      

        // this.setState({ POresultData: resultData });
        const StartDate = DateUtilities.getDateMMDDYYYY(this.state.StartDate);
        const EndDate = DateUtilities.getDateMMDDYYYY(this.state.EndDate);



        const queryArr: string[] = [];
        for (let i = 0; i < yearArray.length; i++) {
          let query = `ISACTIVE eq 1`;
          if (this.state.ClientName !== "All") {
            query += ` and ClientName eq '${this.state.ClientName}'`;
          }
          let isoStartDate: string | null;
          if (i === 0) {
            isoStartDate = this.mmddyyyyhhmmtoDateTime(StartDate + " 00:00")?.toISOString() ?? null;

          } else {
            isoStartDate = this.mmddyyyyhhmmtoDateTime(`01/01/${yearArray[i]} 00:00`)?.toISOString() ?? null;
          }
          let isoEndDate: string | null;
          if (i === yearArray.length - 1) {
            isoEndDate = this.mmddyyyyhhmmtoDateTime(EndDate + " 23:59")?.toISOString() ?? null;
          } else
            isoEndDate = this.mmddyyyyhhmmtoDateTime(`12/31/${yearArray[i]} 23:59`)?.toISOString() ?? null;

          query += ` and (Modified ge '${isoStartDate}' and Modified le '${isoEndDate}')`;

          queryArr.push(query);



        }
        for (var q = 0; q < queryArr.length; q++) {
          this.noOfServiceCalls++;
          this.getCollMgmtDatabyQueryInvoice(queryArr[q]);
        }
       this.setState({POresultData:this.tempPOResults});
      }


    }
    catch (error) {
      console.error("Error in getCollMgmtDatabyQuery:", error);


    }
  }

  private async getCollMgmtDatabyQueryInvoice(queryArr: string) {
    try {
          let allItems: any[] = [];
      let pagedItems  = await sp.web.lists.getByTitle('Invoices').items.select("*").top(2000).filter(queryArr).getPaged();
      allItems = [...allItems, ...pagedItems.results];
      while (pagedItems.hasNext) {
        pagedItems = await pagedItems.getNext();
        allItems = [...allItems, ...pagedItems.results];
      }
      this.tempInvoiceResults = [...this.tempInvoiceResults, ...allItems];
      this.completedCallsCount++;

      if (this.completedCallsCount === this.noOfServiceCalls) {
          this.setState({InvoiceresultData: this.tempInvoiceResults},
            ()=>{
                this.getCombindData(this.tempPOResults, this.tempInvoiceResults);
            }
          );
       
      }

      

    }
    catch (error) {

    }
  }
private getCombindData = (poList: any[], invoiceList: any[]) => {
  if (!poList || !invoiceList) return;

  const chartData: any[][] = [
    ["PO Number", "Total Amount", "Received Amount", "Invoiced Amount", "Balance Amount"]
  ];

    let totalAllPO = 0;
  let totalReceived = 0;
  let totalInvoiced = 0;
  let totalBalance = 0;

  poList.forEach(po => {
    const poNumber = po.PONumber?.trim();
    if (!poNumber) return;

    // Get matching invoices
    const matchingInvoices = invoiceList.filter(inv =>
      inv.ProposalID?.trim() === poNumber
    );

    if (matchingInvoices.length === 0) {
      //  No matching invoice found
      const totalPo = parseFloat(po.POValue) || 0;
       const balance = totalPo;
      chartData.push([
        poNumber,
        totalPo,     // Total Amount
        0,           // Received Amount
        0,           // Invoiced Amount
        balance      // Balance Amount
      ]);

        totalAllPO += totalPo;
        totalBalance += balance;
    } else {
      // ✅ Matching invoice(s) found
      let totalPo = 0;
      let invoiceAmount = 0;
      let receivedAmount = 0;

      matchingInvoices.forEach(inv => {
        const invAmount = parseFloat(inv.InvoiceAmount) || 0;
        const status = inv.PaymentStatus;

        // Try to get TotalPo once (from invoice or PO)
        if (!totalPo) {
          totalPo = parseFloat(inv.TotalPo) || parseFloat(po.POValue) || 0;
        }

        if (status === "Received") {
          receivedAmount += invAmount;
        } else {
          invoiceAmount += invAmount;
        }
      });

      const balanceAmount = totalPo - (receivedAmount + invoiceAmount);

      chartData.push([
        poNumber,
        totalPo,     // Total Amount
        receivedAmount,  // Received
        invoiceAmount,   // Invoiced
        balanceAmount    // Balance
      ]);
          totalAllPO += totalPo;
      totalReceived += receivedAmount;
      totalInvoiced += invoiceAmount;
      totalBalance += balanceAmount;
    }
  });

  // If no data found, show empty row
  if (chartData.length === 1) {
    chartData.push(["No Data", 0, 0, 0, 0]);
  }

    const pieData = [
    ["Status", "Amount"],
    ["Total Amount", totalAllPO],
    ["Received Amount", totalReceived],
    ["Invoiced Amount", totalInvoiced],
    ["Balance Amount", totalBalance]
  ];
    

  this.setState({ 
    chartData: chartData,
    pieData: pieData

   });
    
  console.log("✅ Final Chart Data:", chartData);
};




  private handleChange = (event: any) => {
    let returnObj: any = {};

    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
    if (event.target.name === 'Location') {
         const selectedLocation = event.target.value;
            if (selectedLocation === '') {
            this.setState({
                ClientName: 'None', 
                ClientNames: [{ label: 'None', value: 'None' }]
            });
        } else {
      this.setState({
        ClientName: 'All',
        ClientNames: [{ label: 'All', value: 'All' }],
      });
      this.fetchClientsBasedOnLocation(event.target.value);

    }
  }

  }
  private fetchClientsBasedOnLocation = (selectedLocation: string) => {
    const TrList = 'Clients';
    sp.web.lists.getByTitle(TrList).items.filter(`Location eq '${selectedLocation}'`).select('Title', 'Id').get().then((Response: any[]) => {
      console.log(Response);

      const clientOptions = Response.map(item => ({
        label: item.Title,
        value: item.Title
      }));
    
      clientOptions.unshift({ label: 'All', value: 'All' });
   
      this.setState({
        ClientNames: clientOptions,

      });
      
    });
  }

  private getEstimationsListData = () => {
    let locationsList = 'Location';
    try {
         showLoader();
      sp.web.lists.getByTitle(locationsList).items.select('Title').get().then((Locations: any[]) => {
        const locationOptions = Locations.map(item => ({
          label: item.Title,
          value: item.Title
        }));
        this.setState({
          Locations: locationOptions,

        });
      }
      );
    }
    catch (e) {
      console.log('failed to fetch data');
    }

  }
  handleDateChange = (date: any, fieldName: string) => {
  const newDate = date?.[0]; // safely access first element

  // Prevent clearing
  if (!newDate) return;

  if (fieldName === 'StartDate') {
    this.setState({ StartDate: newDate });
  } else if (fieldName === 'EndDate') {
    this.setState({ EndDate: newDate });
  }
};

  // handleDateChange = (date: any, fieldName: string) => {
  //   const newDate=date[0];
  //   if (fieldName === 'StartDate') {
  //      if (this.state.StartDate && !newDate) {
  //     return;
  //   }

  //     this.setState({ StartDate: newDate });
      
  //   }
  //   else if (fieldName === 'EndDate') {
  //      if (this.state.EndDate && !newDate) {
  //     return;
  //   }
  //   this.setState({ EndDate: newDate });
  //   }
  // };
  private handleCancel = () => {
    this.setState({ Homeredirect: true, errorMessage: "" });
  }


  public render() {
    if(this.state.unauthorized) {
      hideLoader();
      return <UnAuthorized spContext={this.props.spContext}></UnAuthorized>
    }
    if (this.state.Homeredirect) {
      // let message = this.state.modalText;
      let url = `/Dashboard`;
      return <Navigate to={url} />;
    }


    const pieOptions = {
    title: '',
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
  colors: ["#808080", "#008000", "#ffa500", "#ff0000"],
};

const chartOptions = {
  isStacked: true, 
  // stacked: true, 
  title: "PO and Invoice",
  chartArea: { width: '70%' },



  legend: {
    position: 'right',
    alignment: 'center',
    maxLines: 2,
    textStyle: {
      color: "#233238",
      fontSize: 12,
    }
  },
  
  hAxis: {
    title: 'PO and Invoice',
    minValue: 0,
  },
  bar: { groupWidth: '70%' },
  colors:["#808080", "#008000", "#ffa500", "#ff0000"],

};
// const chartOptions = {
//       isStacked: true,
//       legend: { position: 'top', alignment: 'start' },
//       width: 900,
//       height: 400,
//       vAxis: {
//         viewWindow: {
//           min: 0,
//         },
//       },
//       colors: ['Gray', 'lightGreen', 'Yellow', 'Red'],
//       vAxes: {
//         0: {},
//         1: {
//           gridlines: {
//             color: 'transparent',
//           },
//           textStyle: {
//             color: 'transparent',
//           },
//         },
//       },
//       series: {
//         1: {
//           targetAxisIndex: 1,
//           color: 'Green',
//         },
//         2: {
//           targetAxisIndex: 1,
//           color: 'Orange',
//         },
//         3: {
//           targetAxisIndex: 1,
//           color: 'Red',
//         },
//         4: {
//           targetAxisIndex: 1,
//         },
//       },
//     };

    return (
      <React.Fragment>
      <div className='container-fluid'>
        <div className='FormContent'>
          <div className='title'> PO and Invoice
          </div>


          <div className="after-title"></div>
     

            <div className="light-box border-box-shadow mx-2">
              <div className="row pt-2 px-2">
                <div className="col-md-3">
                  <div className="light-text">
                    <label className="z-in-9">Location <span className="mandatoryhastrick">*</span></label>
                    <select className="form-control" id='ddlLocation' required={true} name="Location" value={this.state.Location} onChange={this.handleChange} title="Location" itemRef='Location' ref={this.inputLocation}>
                      <option value=''>None</option>
                      {this.state.Locations.map((location: any, index: any) => (
                        <option key={index} value={location.value}>{location.label}</option>
                      ))}

                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="light-text">
                    <label >Client Name<span className="mandatoryhastrick">*</span></label>
                    <select className="form-control" required={true} name="ClientName" id="clientName" value={this.state.ClientName} title="Client Name" onChange={this.handleChange1} itemRef='ClientName' ref={this.inputClientName}>
                      <option value=''>None</option>
                      {this.state.ClientNames.map((Clientname: any, index: any) => (
                        <option key={index} value={Clientname.label}>{Clientname.label}</option>
                      ))}

                    </select>
                  </div>
                </div>
 
                <div className="col-md-3">
                  <div className="light-text div-readonly">
                    <label className="z-in-9">Start Date<span className="mandatoryhastrick">*</span></label>
                    <div className="custom-datepicker" id="DivStartDate">

                      <DatePicker onDatechange={(date: any) => this.handleDateChange(date, 'StartDate')} placeholder="MM/DD/YYYY" ref={this.inputEndDate} endDate={new Date()} selectedDate={this.state.StartDate} maxDate={new Date()} id={'txtStartDate'} title={"Start Date"} />
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="light-text div-readonly">
                    <label className="z-in-9">End Date<span className="mandatoryhastrick">*</span></label>
                    <div className="custom-datepicker" id="DivEndDate">
                      <DatePicker onDatechange={(date: any) => this.handleDateChange(date, 'EndDate')} ref={this.inputStartDate} placeholder="MM/DD/YYYY" endDate={new Date()} selectedDate={this.state.EndDate} maxDate={new Date()} id={'txtEndDate'} title={"End Date"} />
                    </div>
                  </div>

 

                </div>



                <span className="text-validator" id="spanErrorMessage">{this.state.errorMessage}</span>
                <div className="row mx-1" id="">
                  <div className="col-sm-12 text-center my-2" id="">



                    <button type="button" id="btnSubmit" className="SubmitButtons btn" onClick={this.SubmitData} >Submit</button>

                    <button type="button" id="btnCancel" className="CancelButtons btn" onClick={this.handleCancel} >Cancel</button>
                  </div>
                </div>


              </div>

              {this.state.chartData && this.state.pieData.length > 1 && (
              <Chart chartType="Bar" width="100%" height="400px" data={this.state.chartData} options={chartOptions} />
              )}
              {this.state.pieData && this.state.pieData.length > 1 && ( 
              <Chart chartType="PieChart" width="100%" height="400px" data={this.state.pieData} options={pieOptions} />
              )}
             


            </div>


    
        </div>
      </div>

        </React.Fragment>
    );
  }
}

export default Reports;
