
import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
import DatePicker from '../Shared/DatePickerField';
import ModalPopUp from '../Shared/ModalPopUp';

import InputText from '../Shared/InputText';
import { ControlType } from '../Utilities/Constants';
import formValidation from '../Utilities/Formvalidator';
import { Navigate } from 'react-router-dom';
import { showToast } from '../Utilities/toastHelper';
import { hideLoader, showLoader } from '../Shared/Loader';
// import DateUtilities from '../Utilities/Dateutilities';








// import DatePicker from 'react-datepicker';


export interface IProjectstatusProps {
  match: any;
  spContext: any;
  spHttpClient: SPHttpClient;
  context: any;
  history: any;
}
export interface IProjectstatusState {

}
class ProjectStatuspage extends React.Component<IProjectstatusProps, IProjectstatusState> {
  public state = {
    data: [],
    columns: [],
    tableData: {},
    loading: true,
    Status: '',
    modalText: '',
    modalTitle: '',
    isSuccess: false,
    ischecked: false,
    showHideModal: false,
    errorMessage: '',
    POId:0,
    isEditMode: false,
    Location: '',
    Locations: [],
    inprogressflag:false,
    ClientNames: [],
    ClientName: '',
    ProjectName: '',
    ProjectNames: [],
    ClientId: '',
    ProposalId: '',
    PONumber: '',
    PONumers: [],
    ExecutionType: '',
    ExecutionTypes: [],
    StartDate: null,
    EndDate: null,
    ProjectStatus: '',
    Remarks: '',
    CRTitle: '',
    NoofSprints: '',
    onLoadStatus:'',
    Homeredirect: false,
    DynamicDisabled: false,
    Title: '',
    IsActive: true,
    SaveUpdateText: 'Submit',
    addNewProgram: false,
    ItemID: 0
  };
  private inputLocation: React.RefObject<HTMLSelectElement>;
  inputClientName: React.RefObject<HTMLSelectElement>;
  inputProjectName: React.RefObject<HTMLSelectElement>;
  inputPonumber:React.RefObject<HTMLSelectElement>;
  inputExecutionType: React.RefObject<HTMLSelectElement>;
  inputStartDate: React.RefObject<HTMLInputElement>;
  inputEndDate: React.RefObject<HTMLInputElement>;
  inputProjectStatus: React.RefObject<HTMLSelectElement>;
    inputRemarks: React.RefObject<HTMLTextAreaElement>;
  inputCRTitle: React.RefObject<HTMLInputElement>;
  inputNoofSprints: React.RefObject<HTMLInputElement>;

  constructor(props: any) {
    super(props);
    sp.setup({
      spfxContext: this.props.context
    })

    this.inputLocation = React.createRef<HTMLSelectElement>();
    this.inputClientName = React.createRef<HTMLSelectElement>();
    this.inputProjectName = React.createRef<HTMLSelectElement>();
    this.inputPonumber = React.createRef<HTMLSelectElement>();
    this.inputExecutionType = React.createRef<HTMLSelectElement>();
    this.inputStartDate = React.createRef<HTMLInputElement>();
    this.inputEndDate = React.createRef<HTMLInputElement>();
    this.inputProjectStatus = React.createRef<HTMLSelectElement>();
    this.inputRemarks = React.createRef<HTMLTextAreaElement>();
    this.inputCRTitle = React.createRef<HTMLInputElement>();
    this.inputNoofSprints=React.createRef<HTMLInputElement>();
  }

  public async componentDidMount() {
    showLoader();
    this.getEstimationsListData();
    if (this.props.match.params.id != undefined) {
      // document.getElementById('ddProjectStatus')?.focus();
      let ItemID = this.props.match.params.id
      this.setState({ 
        isEditMode: true,
        ItemID:ItemID
      });
      await this.getOnclickdata(ItemID);
      document.getElementById('ddProjectStatus')?.focus();
      
      
    }
    else {
      document.getElementById('ddllocation')?.focus();
      
      await this.getCurrentUserGroups();
      this.setState({ isEditMode: false });
    }
    
    
  }

  private async getOnclickdata(ItemID: number) {


    sp.web.lists.getByTitle('ProjectStatus').items.getById(ItemID).select(
      'Title',
      'ProposalFor',
      'ClientName',
      'ExecutionType',
      'StartDate',
       'EndDate',
       'ProjectStatus',
       'Sprints',
       'CRTitle',
       'PONumber',
       'Remarks',
        'ClientID',
     


      'Id').get().then((Response) => {
       console.log(Response);
        this.setState({

          addNewProgram: true,
          Location: Response.ProposalFor,
          ClientName: Response.ClientName,
           ProjectName : Response.Title,
          PONumber: Response.PONumber,
          ExecutionType:Response.ExecutionType,
          StartDate:Response.StartDate,
          EndDate:Response.EndDate,
          ProjectStatus:Response.ProjectStatus,
          onLoadStatus:Response.ProjectStatus,
          Remarks:Response.Remarks,
          CRTitle:Response.CRTitle,
         NoofSprints:Response.Sprints,
         inprogressflag:Response.ProjectStatus == 'In-Progress'? true:false,
          
         
          SaveUpdateText: 'Update',
          errorMessage: "",
          ClientId:Response.ClientID

        })
  
        this.fetchClientsBasedOnLocation(Response.ProposalFor, Response.ClientName);
         this.fetchProjetsbasedonClientName(Response.ClientName,Response.Title);
         this.fetchPONumbersbasedonProject(Response.Title,Response.PONumber);
           this.fetchDatesbasedonPONumber(Response.PONumber,Response.StartDate,Response.EndDate);
        
    


      })
  }

  handleDateChange = (date: any,fieldName:string) => {
    const newDate = date[0];
    if(!newDate || newDate === "" || newDate === null) 
    {
       return;
    }
      // Exit if no date is selected
    if(fieldName === 'StartDate') {
    this.setState({ StartDate: newDate });
    }
    else if(fieldName === 'EndDate') {
        this.setState({ EndDate:newDate });
        }
  };

  private handleCRtitle = (event:any) => {
    let returnObj: Record<string, any> = {};
    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
  }

  private POdetailesidbasedonPOnumber = async (selectedponumber:any) => {
     const TrList = 'PODetails';
    await sp.web.lists.getByTitle(TrList).items.filter(`PONumber eq '${selectedponumber}'`).select('Title', 'ID').get().then((Response: any[]) => {
      console.log(Response);
  
      this.setState({
        POId:Response[0].ID
   
      });
    });
      
  }
  private handleChange = (event: any) => {
    let returnObj: any = {};
    if (event.target.name === 'Location') {
      // Reset all dropdowns to "None"
      this.setState({       
        ClientName: '',        // Reset Client dropdown                   
        ClientNames: [],      
        ProjectNames: [],
         PONumbers:[],
        ProjectName:'',
       
        PONumber:'',
        StartDate:'',
        EndDate:''

        
   

        
      });
    }
    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
    if (event.target.name === 'Location') {
      this.fetchClientsBasedOnLocation(event.target.value, '');
    }

  }






   private handleExecutionType = (event: any) => {

    
    const { name, value } = event.target;
    this.setState({ [name]: value });
  

  }
 private handleProjectstatus = (event: any) => {
      
          const { name, value } = event.target;
          this.setState({ [name]: value });
         

   

  }

  private SubmitData = () => {

    let data:any={}
    data.location= { val: this.state.Location, required: true, Name: 'Location', Type: ControlType.string, Focusid: this.inputLocation };
    data.ClientName= { val: this.state.ClientName, required: true, Name: 'Client Name', Type: ControlType.string, Focusid: this.inputClientName };
    data. ProjectName={val: this.state.ProjectName, required: true, Name: 'Project', Type: ControlType.string, Focusid: this.inputProjectName}
    data.PONumber={val: this.state.PONumber, required: true, Name: 'PO Number', Type: ControlType.string, Focusid: this.inputPonumber}
    data.ExecutionType={val: this.state.ExecutionType, required: true, Name:'Execution Type', Type: ControlType.string, Focusid: this.inputExecutionType}
    if(this.state.ExecutionType==='CR')
     {
       data.CRTitle={val: this.state.CRTitle, required: true, Name: 'CR Title', Type: ControlType.string, Focusid: this.inputCRTitle};
     }
     else if(this.state.ExecutionType==='Sprint'){
      (data).Sprints={val: this.state.NoofSprints, required: true, Name: 'No. of Sprints', Type: ControlType.string, Focusid: this.inputNoofSprints}
     }
     data.StartDate={val: this.state.StartDate, required: true, Name: 'Start Date', Type: ControlType.date, Focusid:'DivStartDate'};
     data.EndDate={val: this.state.EndDate, required: true, Name: 'End Date', Type: ControlType.date, Focusid:'DivEndDate'};
     data.ProjectStatus={val: this.state.ProjectStatus, required: true, Name: 'Project Status', Type: ControlType.string, Focusid: this.inputProjectStatus}
    
    let isValid = formValidation.checkValidations(data);

    var formdata = {
       
       ProposalFor:this.state.Location,
       ClientName: this.state.ClientName,
       Title:this.state.ProjectName,
       PONumber:this.state.PONumber,
       ExecutionType:this.state.ExecutionType,
       StartDate:this.state.StartDate,
       EndDate:this.state.EndDate,
       ProjectStatus:this.state.ProjectStatus,
       Remarks:this.state.Remarks,
       CRTitle:this.state.CRTitle,
       Sprints:this.state.NoofSprints?parseInt(this.state.NoofSprints):null,
       ClientID:this.state.isEditMode?this.state.ClientId:this.state.ClientId.toString()
      
    }


    if (isValid.status) {
             try{
              this.checkDuplicates(formdata);
             }catch(e){
              console.log("Error in Submiting the data",e)
              this.onError();
             }
           
    }
    else
    {
      showToast('error',isValid.message)

    }
      // this.setState({ errorMessage: isValid.message });

  }
  private checkDuplicates = (formData: any) => {
    let TrList = 'ProjectStatus';
    var filterString;
    try {
        showLoader();
      if (this.state.ItemID == 0)
        filterString = `PONumber eq '${formData.PONumber}'`;
      else
        filterString = `PONumber eq '${formData.PONumber}' and Id ne ${this.state.ItemID}`;
      sp.web.lists.getByTitle(TrList).items.filter(filterString).get().
        then((response: any[]) => {
          if (response.length > 0){
            showToast('error','Duplicate record not accept')
            // this.setState({ errorMessage: 'Duplicate record not accept' });
          }
          else
            this.insertorupdateListitem(formData);
        });
    }
    catch (e) {
      this.onError();
      console.log(e);
    }finally{
      hideLoader();
    }
    // return findduplicates
  }
  private insertorupdateListitem =async (formData: any) => {
    this.setState({ loading: true });
    let PODetails={
      Status:formData.ProjectStatus
    }
   await this.POdetailesidbasedonPOnumber(formData.PONumber);
    try {
      showLoader();
    if (this.state.ItemID == 0) {
        let promises = [
              sp.web.lists.getByTitle('ProjectStatus').items.add(formData)
          ] ;
          if (this.state.POId !== 0) {
           promises.push(
                     sp.web.lists.getByTitle('PODetails').items.getById(this.state.POId).update(PODetails)
                     );

            }
      // let [ProposalResp,EstimationResp]=await Promise.all([sp.web.lists.getByTitle('ProjectStatus').items.add(formData),
            
      //       sp.web.lists.getByTitle('PODetails').items.getById(this.state.POId).update(PODetails),
      // ]) 
     
               this.onSucess();

    }
    else {
        let promises = [
             sp.web.lists.getByTitle('ProjectStatus').items.getById(this.state.ItemID).update(formData)
          ] ;
          if (this.state.POId !== 0) {
           promises.push(
                     sp.web.lists.getByTitle('PODetails').items.getById(this.state.POId).update(PODetails)
                     );

            }
        // let [ProposalResp,EstimationResp]=await Promise.all([sp.web.lists.getByTitle('ProjectStatus').items.getById(this.state.ItemID).update(formData),
        // sp.web.lists.getByTitle('PODetails').items.getById(this.state.POId).update(PODetails),
    
    
        this.onUpdateSucess();
     
    }
     }
      catch (e) {
        console.log(e);
  
      }finally{
        hideLoader();
      }
  }
  

   private async getCurrentUserGroups(){
      try {
        const currentUser = await sp.web.currentUser.get();
        const userGroups = await sp.web.currentUser.groups.get();
   
         const isAdmin = userGroups.some(g => g.Title === 'P&I Administrators');
        const isBilling = userGroups.some(g => g.Title === 'Billing Team');
        const isSales = userGroups.some(g => g.Title === 'Sales Team');
        const isDev = userGroups.some(g => g.Title === 'Dev Team'); 
    
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
                 })).filter(item => item.label !=='').sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })),
        loading: false,
        Location: userLoc.length === 1 ? userLoc[0] : '',
      });
        if(userLoc.length === 1){
          this.fetchClientsBasedOnLocation(userLoc[0],'');
        }
    
      } catch (error) {
        console.error('Error fetching user groups:', error);
      }
    }
  

  private handleCancel = () => {
    this.setState({ Homeredirect: true, ItemID: 0, errorMessage: "" });
  }


  private onSucess = () => {
        showToast('success', 'Project Status submitted successfully');
    
         this.setState({ showHideModal: false,Homeredirect:true,addNewProgram:false, loading: false, isSuccess: true, ItemID: 0,errorMessage: "" });
    // this.setState({ modalTitle: 'Success', modalText: 'Estimation submitted successfully', showHideModal: true, loading: false, isSuccess: true, ItemID: 0, errorMessage: "" });
  }
  private onUpdateSucess = () => {
     showToast('success', 'Project Status Updated successfully');
            this.setState({ showHideModal: false,Homeredirect:true,addNewProgram:false, loading: false, isSuccess: true, ItemID: 0,errorMessage: "" });
    // this.setState({ modalTitle: 'Success', modalText: 'Estimation updated successfully', showHideModal: true, loading: false, isSuccess: true, ItemID: 0, errorMessage: "" });
  }
  private onError = () => {
        showToast('error', 'Sorry! something went wrong');
    // this.setState({
    //   loading: false, modalTitle: 'Error', modalText: 'Sorry! something went wrong', showHideModal: true, isSuccess: false, ItemID: 0, errorMessage: ""
    // });
  }

  
  private fetchClientsBasedOnLocation = (selectedLocation: string, slectedclient: string) => {
    const TrList = 'Clients';
    sp.web.lists.getByTitle(TrList).items.filter(`Location eq '${selectedLocation}'`).select('Title', 'Id').get().then((Response: any[]) => {
      console.log(Response);
      const { isEditMode } = this.state;
      const clientOptions = Response.map(item => ({
        label: item.Title,
        value: isEditMode ? item.Title : item.Id
      }));
      this.setState({
        ClientNames: clientOptions,
        ClientName: slectedclient ?? '' // Set the selected client name if provided

      });
    });
  }


  private getEstimationsListData = () => {
    let locationsList = 'Location';
    try {

      let SubmittedById = this.props.spContext.userId;  // Get the current user's ID
      // get all the items from a list
      sp.web.lists.getByTitle(locationsList).items.select('Title').get().then((Locations: any[]) => {
        const locationOptions = Locations.map(item => ({
          label: item.Title,
          value: item.Title
        }));
        this.setState({ 
          Locations: locationOptions,
           SubmittedById: SubmittedById,
         // Initialize IsBulkVariablecheck to false
           });
           hideLoader();
      }
      );



      //  sp.web.lists.getByTitle(TrList).items.expand("Sales_x0020_Person_x0020_Name","Alternate_x0020_Sales_x0020_Pers").select("Sales_x0020_Person_x0020_Name/Title","Alternate_x0020_Sales_x0020_Pers/Title","*"). orderBy("Id", false).get().
      //    then((response: any[]) => {
      //      //console.log(response);
      //      this.BindData(response);
      //    });
    }
    catch (e) {
      this.setState({
        loading: false,
        modalTitle: 'Error',
        modalText: 'Sorry! something went wrong',
        showHideModal: true,
        isSuccess: false
      });
      console.log('failed to fetch data');
    }

  }

  private handleClose = () => {
    this.setState({ showHideModal: false, Homeredirect: true, ItemID: 0, errorMessage: "" });
  }
  private handleChange1 = (event: any) => {
    const selectedClientName = event.target.options[event.target.selectedIndex].text;
 
    // let returnObj: Record<string, any> = {};

    if (event.target.name === 'ClientName') {


      // Reset all dropdowns to "None"
      this.setState({
           // Reset Client dropdown                   
         PONumber:'',
         PONumbers:[],
        ProjectNames: [],
        ProjectName:'',
       
     
        StartDate:'',
        EndDate:'',
       
        ClientName: selectedClientName
      });

        this.fetchProjetsbasedonClientName(selectedClientName,'');
        this.fetchclientidBasedOnClientName(selectedClientName);
  

    }
     


    // if (event.target.name != 'IsActive')
    //   returnObj[event.target.name] = event.target.value;
    // else
    //   returnObj[event.target.name] = event.target.checked;
    // this.setState(returnObj);


  }

    private fetchclientidBasedOnClientName = (selectedClientName: string) => {
  
      const TrList = 'Clients';
      sp.web.lists.getByTitle(TrList).items.select("ID", "Title").filter(`Title eq '${selectedClientName}'`).get().then((Response: any[]) => {
        console.log(Response);
        if (Response.length > 0) {
          this.setState({ ClientId: Response[0].ID });
        } else {
          this.setState({ ClientId: '' });
        }
      });
    }
  

   private handlePONumber = (event: any) => {
    let returnObj: any = {};
    if (event.target.name === 'ProjectName') {
      // Reset all dropdowns to "None"
      this.setState({
        PONumber:'',
         PONumbers:[],
        StartDate:'',
        EndDate:'',
        
      });
    }
    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
    if (event.target.name === 'ProjectName') {
      this.fetchPONumbersbasedonProject(event.target.value,'');
    }

  }

    private handleReason = (event:any) => {
        let returnObj: any = {};
        if (event.target.name != 'IsActive')
          returnObj[event.target.name] = event.target.value;
        else
          returnObj[event.target.name] = event.target.checked;
        this.setState(returnObj);
    
      }
    private handleDatefields = (event: any) => {
    let returnObj: any = {};
    if (event.target.name === 'PONumber') {
      // Reset all dropdowns to "None"
      this.setState({
        StartDate:'',
        EndDate:'',

        
      });
    }
    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
    if (event.target.name === 'PONumber') {
      this.fetchDatesbasedonPONumber(event.target.value,'','');
    }

  }

  private fetchDatesbasedonPONumber(selectedponumber:any,selectedstartdates:any,selectedendDate:any){
     const POList='PODetails';
      sp.web.lists.getByTitle(POList).items.select("Id", "EffectiveFrom","EffectiveTo").filter(`PONumber eq '${selectedponumber}'`).get().then((Response: any[])=>{
            //const { isEditMode } = this.state;
            console.log(Response)
              const {isEditMode}=this.state
             this.setState({
                  StartDate:isEditMode==false? Response[0].EffectiveFrom:selectedstartdates,
                  EndDate:isEditMode==false? Response[0].EffectiveTo:selectedendDate
              });


         
            
         })

  }

  private fetchPONumbersbasedonProject(selectedproject:any,selectedponumber:any)
  {
        const POList='PODetails';
         sp.web.lists.getByTitle(POList).items.select("Id", "PONumber").filter(`ProjectTitle eq '${selectedproject}' and ClientName eq '${this.state.ClientName}'`).get().then((Response: any[])=>{
            const { isEditMode } = this.state;
            const PONumberoptions= Response.map(item=>({
                  label: item.PONumber,
                  value: item.PONumber
            }));

            this.setState({
               PONumers:PONumberoptions,
               PONumber:isEditMode?selectedponumber :''
            })
            
         })
  }

  private fetchProjetsbasedonClientName = (selectedClientName: string,selectedproject:string) => {
     const ProposalList = 'ProposalDetails';
    sp.web.lists.getByTitle(ProposalList).items.select("Id", "Title")
      .filter(`ClientName eq '${selectedClientName}' and Status ne 'Rejected'`).get().then((Response: any[]) => {
        console.log(Response);
       const { isEditMode } = this.state;
       
       const Projectoptions=  Response.map(item => ({
          label: item.Title,
          value: item.Title
        }));
         this.setState({
        ProjectNames: Projectoptions,
        ProjectName:isEditMode ? selectedproject : '', // Set the selected project name if provided
      

      

      });
      
      });
  }

 

  handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only digits
    if (/^\d{0,2}$/.test(value)) {
      this.setState({ NoofSprints: value });
    }
  };





  render() {


    if (this.state.Homeredirect) {
      // let message = this.state.modalText;
      let url = `/ProjectStatus_View`;
      return <Navigate to={url} />;
    }





    return (

      <>

        <ModalPopUp title={this.state.modalTitle} modalText={this.state.modalText} isVisible={this.state.showHideModal} onClose={this.handleClose} isSuccess={this.state.isSuccess}></ModalPopUp>
          <div className='container-fluid'>
        <div className='FormContent'>
          <div className='title'> Project Status

            <div className='mandatory-note'>
              <span className='mandatoryhastrick'>*</span> indicates a required field
            </div>


          </div>


          <div className="after-title"></div>
  
            <div className="light-box border-box-shadow mx-2">
              <div className="row pt-2 px-2">
                <div className="col-md-3">
                  <div className="light-text">
                    <label className="z-in-9">Location <span className="mandatoryhastrick">*</span></label>
                    <select className="form-control" id='ddllocation' required={true} name="Location" value={this.state.Location} onChange={this.handleChange} disabled={this.state.isEditMode || this.state.Locations.length === 1} title="Location" itemRef='Location' ref={this.inputLocation}>
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
                    <select className="form-control" disabled={this.state.isEditMode} required={true} name="ClientName" id="clientName" value={this.state.ClientName} title="Client Name" onChange={this.handleChange1} itemRef='ClientName' ref={this.inputClientName}>
                      <option value=''>None</option>
                      {this.state.ClientNames.map((Clientname: any, index: any) => (
                        <option key={index} value={Clientname.label}>{Clientname.label}</option>
                      ))}

                    </select>
                  </div>
                </div>
                    <div className="col-md-3">
                  <div className="light-text">
                    <label >Project<span className="mandatoryhastrick">*</span></label>
                   
                      <select className="form-control" required={true} name="ProjectName" value={this.state.ProjectName} disabled={this.state.isEditMode} onChange={this.handlePONumber} title="ProjectName" itemRef='ProjectName' ref={this.inputProjectName}>
                        <option value=''>None</option>
                        {this.state.ProjectNames.map((ProjectName: any, index: any) => (
                          <option key={index} value={ProjectName.label}>{ProjectName.label}</option>
                        ))}

                      </select>

                
                  </div>
                </div>
                 <div className="col-md-3">
                  <div className="light-text">
                    <label >PO Number<span className="mandatoryhastrick">*</span></label>
                   
                      <select className="form-control" required={true} name="PONumber" value={this.state.PONumber} disabled={this.state.isEditMode} onChange={this.handleDatefields} title="PONumber" itemRef='PONUmber' ref={this.inputPonumber}>
                        <option value=''>None</option>
                        {this.state.PONumers.map((POnumber: any, index: any) => (
                          <option key={index} value={POnumber.label}>{POnumber.label}</option>
                        ))}

                      </select>

                
                  </div>
                </div>
                 <div className="col-md-3 mt-2">
                        <div className="light-text">
                        <label >Execution Type<span className="mandatoryhastrick">*</span></label>
                        <select className="form-control" required={true}  name="ExecutionType"  value={this.state.ExecutionType} onChange={this.handleExecutionType} disabled={this.state.isEditMode} title="ExecutionType" itemRef='ExecutionType' ref={this.inputExecutionType}>
                         
                          <option value=''>None</option>
                          <option value='CR'>CR</option>
                          <option value='Fixed'>Fixed</option>
                          <option value='Sprint'>Sprint</option>
                          <option value='Support'>Support</option>
                          

                        </select>
                    
                        </div>
                    </div>
                       {(this.state.ExecutionType=='CR' &&
                      <div className="col-md-3 mt-2">
                    <InputText
                      type='text'
                      label={"CR Title"}
                      name={"CRTitle"}
                      value={this.state.CRTitle}
                      disabled={this.state.isEditMode}
                      isRequired={true}
                      onChange={this.handleCRtitle}
                      refElement={this.inputCRTitle} onBlur={undefined}
                    />
                  </div>
                       )}
                       {(this.state.ExecutionType=='Sprint' &&
                      <div className="col-md-3 mt-2">
                    <InputText
                      type='text'
                      label={"No. of Sprints"}
                      name={"Sprints"}
                      value={this.state.NoofSprints}
                      disabled={this.state.isEditMode}
                      isRequired={true}
                      onChange={this.handleNumericChange}
                      refElement={this.inputNoofSprints} onBlur={undefined}
                    />
                  </div>
                       )}
                      <div className="col-md-3 mt-2">
                    <div className="light-text div-readonly">
                      <label className="z-in-9">Start Date<span className="mandatoryhastrick">*</span></label>
                      <div className="custom-datepicker" id="DivStartDate">
                        <DatePicker onDatechange={(date: any)=>this.handleDateChange(date,'StartDate')} name={"StartDate"} isDisabled={this.state.isEditMode?(this.state.onLoadStatus != "In-Progress" && this.state.onLoadStatus != "" ):false}  ref={this.inputStartDate} placeholder="MM/DD/YYYY" selectedDate={this.state.StartDate} id={'txtStartDate'} title={"Start Date"} />
                      </div>
                    </div>
                    {/* isDisabled={this.state.isEditMode?!this.state.inprogressflag:this.state.inprogressflag} */}
                  </div>
                     <div className="col-md-3 mt-2">
                    <div className="light-text div-readonly">
                      <label className="z-in-9">End Date<span className="mandatoryhastrick">*</span></label>
                      <div className="custom-datepicker" id="DivEndDate">
                        <DatePicker onDatechange={(date: any)=>this.handleDateChange(date,'EndDate')} name={"EndDate"} isDisabled={this.state.isEditMode?(this.state.onLoadStatus != "In-Progress" && this.state.onLoadStatus != "" ):false} ref={this.inputEndDate} placeholder="MM/DD/YYYY" selectedDate={this.state.EndDate} id={'txtEndDate'} title={"End Date"} />
                      </div>
                    </div>
                  </div>
                     <div className="col-md-3 mt-2">
                        <div className="light-text">
                        <label >Project Status<span className="mandatoryhastrick">*</span></label>
                        <select className="form-control" required={true} id='ddProjectStatus'  name="ProjectStatus"  value={this.state.ProjectStatus} onChange={this.handleProjectstatus} disabled={this.state.isEditMode?(this.state.onLoadStatus != "In-Progress" && this.state.onLoadStatus != "" ):false} title="Project Status" itemRef='ProjectStatus' ref={this.inputProjectStatus}>
                        {/* <select className="form-control" required={true} id='ddProjectStatus'  name="ProjectStatus"  value={this.state.ProjectStatus} onChange={this.handleProjectstatus} disabled={this.state.isEditMode?(this.state.ProjectStatus!== 'In-Progress' && this.state.ProjectStatus!== '' ):false} title="Project Status" itemRef='ProjectStatus' ref={this.inputProjectStatus}> */}
                         
                          <option value=''>None</option>
                          <option value='In-Progress'>In-Progress</option>
                          {this.state.ExecutionType=='Support'?
                          <option value='Completed'>Completed</option>:
                          <option value='Delivered'>Delivered</option>
                           }
                       
                          

                        </select>
                    
                        </div>
                    </div>
                
                    <div className={this.state.ExecutionType == "CR" || this.state.ExecutionType == "Sprint"?"col-md-9 mt-2" : "col-md-12 mt-2"}>
                        <div className="light-text">
                        <label>Remarks</label>
                        <textarea className="form-control requiredinput" disabled={this.state.isEditMode?(this.state.onLoadStatus != "In-Progress" && this.state.onLoadStatus != "" ):false} value={this.state.Remarks} placeholder="" id="txtTargetDescription" name="Remarks" ref={this.inputRemarks} onChange={this.handleReason} ></textarea>
                        </div>
                    </div>
                   
                    </div>
                         

               
              
              
               
              
                {/* <span className="text-validator" id="spanErrorMessage">{this.state.errorMessage}</span> */}
                <div className="row mx-1" id="">
                  <div className="col-sm-12 text-center my-4" id="">


                    {
                    ((!this.state.isEditMode || this.state.inprogressflag)&&(
                    <button type="button" id="btnSubmit" className="SubmitButtons btn"  onClick={this.SubmitData} >{this.state.SaveUpdateText}</button>
                    ))}
                    <button type="button" id="btnCancel" className="CancelButtons btn" onClick={this.handleCancel} >Cancel</button>
                  </div>
                </div>
              
              </div>


          




          </div>





        </div>
      </>

    )
  }
}


export default ProjectStatuspage;