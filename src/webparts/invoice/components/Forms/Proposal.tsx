
import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
import DatePicker from '../Shared/DatePickerField';
import ModalPopUp from '../Shared/ModalPopUp';
import FileUpload from '../Shared/FileUpload';
import InputText from '../Shared/InputText';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/controls/peoplepicker';
// import InputCheckBox from '../Shared/InputCheckBox';
import { ControlType } from '../Utilities/Constants';
import formValidation from '../Utilities/Formvalidator';
import { Navigate } from 'react-router-dom';
import { showToast } from '../Utilities/toastHelper';
import DateUtilities from '../Utilities/Dateutilities';
import { showLoader,hideLoader } from '../Shared/Loader';
import UnAuthorized from '../Shared/UnAuthorized.Component';
import Icons from '../../assets/Icons';



// import DatePicker from 'react-datepicker';


export interface IProposalProps {
  match: any;
  spContext: any;
  spHttpClient: SPHttpClient;
  context: any;
  history: any;
}
interface ProposalHistory {
  Project: string;
  Proposal: string;
  "Estimation Hour": string;
  "Submitted Date": string | null;
  Amount: number;
  "Created On": string;
}
export interface IProposalState {

}
class Proposal extends React.Component<IProposalProps, IProposalState> {
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
    isExistingProject: false,
    isEditMode: false,
    History: [] as ProposalHistory[],
    Location: '',
    Locations: [],
    isConsultantSelected: false,
    ClientNames: [],
    ClientName: '',
    ProjectName: '',
    ProjectNames: [],
    isdevTeam: false,
    isAdmin: false,
    isAdminUser:false,
    isPermissionChecked:false,
    originalProjectName: '',
    originalTitleoftheProposal: '',
    prevEstimationHours: '',
    Approvalflag:false, 
    isUnAuthorized:false,
    EstId: '',
    ClientId: '',
    ProposalFor: '',
    Proposals: [],
    TitleoftheProposal: '',
    TitleOfProposals: [],
    fileArr: [],
    delfileArr: [],
    Homeredirect: false,
    DynamicDisabled: false,
    Title: '',
    EstimationHours: '',
    SubmittedById: '',
    SubmittedEmail: [],
    Estimations: [],
    Estimation: '',
    EstimationTitle: '',
    Attachment: [],
    SubmittedDate: null,
    Amount: '',
    Remarks: '',
    IsActive: true,
    SaveUpdateText: 'Submit',
    addNewProgram: false,
    ItemID: 0,
    onLoadStatus:'',
    currencySymbols: '',
islocationconfigured:true,
    


  };
  private inputLocation: React.RefObject<HTMLSelectElement>;
  inputClientName: React.RefObject<HTMLSelectElement>;
  inputProposalFor: React.RefObject<HTMLSelectElement>;
  inputProposalTitle: React.RefObject<HTMLSelectElement>;
  inputTitleoftheProject: React.RefObject<HTMLSelectElement>;
  private inputSubmittedName: React.RefObject<PeoplePicker>;
  private inputAmount: any;
  private inputsubmittedDate: React.RefObject<HTMLInputElement>;
  private inputEstimatedHours: React.RefObject<HTMLInputElement>;
  private inputRemarks: React.RefObject<HTMLTextAreaElement>;
  private inputStatus: React.RefObject<HTMLSelectElement>;




  constructor(props: any) {
    super(props);
    sp.setup({
      spfxContext: this.props.context
    })

    this.inputLocation = React.createRef<HTMLSelectElement>();
    this.inputClientName = React.createRef<HTMLSelectElement>();
    this.inputProposalFor = React.createRef<HTMLSelectElement>();
    this.inputProposalTitle = React.createRef<HTMLSelectElement>();
    this.inputTitleoftheProject = React.createRef<HTMLSelectElement>();
    this.inputsubmittedDate = React.createRef<HTMLInputElement>();
    this.inputAmount = React.createRef();
    this.inputRemarks = React.createRef<HTMLTextAreaElement>();
    this.inputEstimatedHours = React.createRef<HTMLInputElement>();
    this.inputStatus = React.createRef<HTMLSelectElement>();



  }

  public async componentDidMount() {
    try{
    showLoader();
   await this.checkpermisssion();
    await this.getEstimationsListData();
      await this.getCurrentUserGroups();

   
    if (this.props.match.params.id != undefined) {
      //  document.getElementById("txtAmount")?.focus();
      this.inputAmount.current.focus();
      this.setState({ 
        isEditMode: true,
        SubmittedEmail:[],
        SubmittedById:""
       });
       
      let ItemID = this.props.match.params.id
  
     await this.getOnclickdata(ItemID);
    }
    else {
      this.setState({ isEditMode: false,SubmittedEmail:[this.props.spContext.userEmail],SubmittedById:this.props.spContext.userId });
      document.getElementById('ddlocation')?.focus();
    }
  }
  catch(error){
      console.error("Error in componentDidMount:", error);
  }
  finally{
    hideLoader();
  }


  }

   private async checkpermisssion(){
      try {
          const userGroups= await sp.web.currentUser.groups.get();
            let adminGroups = [
        'P&I Administrators',
        'Sales Team',
        'Billing Team',
        'Dev Team'
      ];
       const itemId=Number(this.props.match.params.id);
        if (!itemId) {
      adminGroups = adminGroups.filter(group => group !== 'Dev Team');
    }
      const isAdminuser = userGroups.some(group=>adminGroups.includes(group.Title)
    );
     this.setState({isAdminUser:isAdminuser,isPermissionChecked: true,isUnAuthorized:!isAdminuser},()=>{hideLoader();})
  
      }
      catch(error){
             console.error('Error checking admin status:', error);
      this.setState(
        { isAdminUser: false, isPermissionChecked: true },
        () => { hideLoader(); }
      );
      }
    }

  private async getOnclickdata(ItemID: number) {
    try{
    showLoader();
     
    sp.web.lists.getByTitle('ProposalDetails').items.getById(ItemID).select('Title',
      'ClientName',
      'ProposalFor',
      'SubmittedBy/EMail',
      'SubmittedBy/Id',
      'SubmittedDate',
      'Amount',
      'Status',
      'Proposal',
      'Remarks',
      'History',
      'EstimatedHour',
      'ProposalType',
      'IsBulkProposal',
       'ClientID',
       'EstID',
      'Id','*').expand('SubmittedBy').get().then((Response) => {
        const historyData = JSON.parse(Response.History);
        this.setState({

          addNewProgram: true,
          Location: Response.ProposalFor,
          ClientName: Response.ClientName,
          ProposalFor: Response.ProposalType,
          ProjectName: Response.Title,
          SubmittedById: Response.SubmittedBy.Id,
          SubmittedEmail: [Response.SubmittedBy.EMail],
          TitleoftheProposal: Response.Proposal,
          EstimationHours: Response.EstimatedHour,
          SubmittedDate: Response.SubmittedDate,
          Amount: Response.Amount,
          ItemID:Response.Id,
          EstId: Response.EstID,
          Status: Response.Status,
          ischecked: Response.IsBulkProposal,
          Remarks: Response.Remarks,
          History: historyData,

          SaveUpdateText: 'Update',
          errorMessage: "",
          onLoadStatus:Response.Status,
         ClientId:Response.ClientID

        })

        if(this.state.isEditMode){
           if(Response.Status === 'Approved'){  
            this.setState({ Approvalflag:true });
          }
          this.setState({
              originalProjectName: this.state.ProjectName,
              originalTitleoftheProposal: this.state.TitleoftheProposal,
              prevEstimationHours: this.state.EstimationHours
            
    });
        }
        this.fetchClientsBasedOnLocation(Response.ProposalFor, Response.ClientName);
        this.fetchProjectsBasedOnProposalfor(Response.ProposalType, Response.Title);

        this.fetchTitleofProposalBasedOnProjects(Response.Title, Response.Proposal);
 

      })
    let files = await sp.web.lists.getByTitle('ProposalDocs').items.filter('RecordID eq ' + ItemID).expand('File').get()
    let filesArry: { URL: any; IsDeleted: boolean; IsNew: boolean; name: any; FileID: any; }[] = [];
    files.map((selItem: any, index: any) => {
      let name = selItem.File.Name;
      var fileUrl = selItem.File.ServerRelativeUrl;
      let obj = { URL: fileUrl, IsDeleted: false, IsNew: false, name: name, FileID: selItem.Id };
      filesArry.push(obj);
    });
    this.setState({ fileArr: filesArry })
  }
  catch(error){
     console.error("Error in getOnclickdata:", error);
  }finally{
    hideLoader();
  }
  }

  handleDateChange = (date: any) => {
    this.setState({ SubmittedDate: date[0] });
  };

  private handleText = (event: any) => {
   
    const { name, value } = event.target;
    this.setState({ [name]: value });

  }
  private handleChange = (event: any) => {
  const selectedInvoiceFor = event.target.value;
  let currencySymbol='';
    if(selectedInvoiceFor ==='AUS'){
       currencySymbol = 'AU$';
    }
    else if(selectedInvoiceFor ==='GDC'){
        currencySymbol = '₹';
    }
    else if(selectedInvoiceFor ==='Onsite'){
        currencySymbol = '$';
    }
    let returnObj: any = {};
    if (event.target.name === 'Location') {
      this.setState({
        Location: '',          
        ClientName: '',        
        ProposalFor: '',
        TitleoftheProposal: '',    
        ClientNames: [],   
        ProjectNames: [],
        TitleOfProposals: [],
        Proposals: [],
        EstimationHours: '',
        currencySymbols:currencySymbol
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

  private handleTiofPro = (event: any) => {

    const selectedProposal = event.target.value;
    if (selectedProposal === 'Consultant') {
      this.setState({ isConsultantSelected: true })
    }
    else {
      this.setState({ isConsultantSelected: false })
    }
    let returnObj: any = {};
    if (event.target.name === 'ProposalFor') {
      // Reset all dropdowns to "None"
      this.setState({


        TitleoftheProposal: '',
        ProjectName: '',
        // ProjectNames: [],
        TitleOfProposals: [],

        EstimationHours: ''
      });
    }

    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
    if (event.target.name === 'ProposalFor') {
      this.fetchProjectsBasedOnProposalfor(event.target.value, '');
    }
  }

  private handleTitleOfProposal = (event: any) => {

    const selectedLabel = event.target.options[event.target.selectedIndex].text;
    const selectedId = event.target.value;


    let returnObj: any = {};

    if (event.target.name === 'ProjectName') {
      returnObj.originalProjectName = selectedId;
      // Reset all dropdowns to "None"

      this.setState({ EstimationHours: '' });
    }

    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;

    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
    if (event.target.name === 'ProjectName') {
      this.fetchTitleofProposalBasedOnProjects(selectedLabel, '');
    }
  }

  private async AddorUpdatelistItem(ItemID: number) {
    let processedFiles = 0;
    let newFileArry = [];
    newFileArry = this.state.fileArr.filter((file: any) => {
      return file.IsNew == true;
    })
    this.deleteListItem();
    if (newFileArry.length > 0) {
      0
      for (const i in newFileArry) {
        let file: any = newFileArry[i];
        let siteAbsoluteURL = this.props.context.pageContext.web.serverRelativeUrl;
        await sp.web.getFolderByServerRelativeUrl(siteAbsoluteURL + "/ProposalDocs").files.add(file.name, file, true);
        const item1 = await sp.web.getFileByServerRelativePath(siteAbsoluteURL + "/ProposalDocs/" + file.name).getItem();

        item1.update({
          RecordID: ItemID

        });
        processedFiles = processedFiles + 1;
        if (newFileArry.length == processedFiles) {
          // this.onSucess();

        }

      }
    }
  }
  private deleteListItem() {
    let list = sp.web.lists.getByTitle("ProposalDocs");
    if (this.state.delfileArr.length > 0) {
      this.state.delfileArr.map((selItem, index) => {
        let itemId = selItem['FileID'];
        list.items.getById(itemId).delete();
      });
    }
  }

  private SubmitData = async () => {
    showLoader();
    let data = {
      location: { val: this.state.Location, required: true, Name: 'Location', Type: ControlType.string, Focusid: this.inputLocation },
      ClientName: { val: this.state.ClientName, required: true, Name: 'Client Name', Type: ControlType.string, Focusid: this.inputClientName },
      ProposalFor: { val: this.state.ProposalFor, required: true, Name: 'Proposal For', Type: ControlType.string, Focusid: this.inputProposalFor },
      ProjectName: { val: this.state.ProjectName, required: true, Name: 'Title of the Project', Type: ControlType.string, Focusid: this.inputTitleoftheProject },
      TitleoftheProposal: { val: this.state.TitleoftheProposal, required: true, Name: 'Title of the Proposal', Type: ControlType.string, Focusid: this.inputProposalTitle },
      EstimationHours: { val: this.state.EstimationHours, required: true, Name: 'EstimationHours', Type: ControlType.string, Focusid: this.inputEstimatedHours },
      // SubmittedById: { val: this.state.SubmittedById, required: true, Name: 'SubmittedById', Type: ControlType.string, Focusid: this.inputSubmittedName },
      SubmittedBy: { val: this.state.SubmittedById, required: true, Name: 'Sales Person Name', Type: ControlType.people, Focusid:'divPeopleUser'},
      SubmittedDate: { val: this.state.SubmittedDate, required: true, Name: 'Submitted Date', Type: ControlType.date, Focusid: 'DivSubmittedDate' },
      Amount: { val: this.state.Amount, required: true, Name: 'Amount', Type: ControlType.string, Focusid: this.inputAmount },
      Status: { val: this.state.Status, required: true, Name: 'Status', Type: ControlType.string, Focusid: this.inputStatus },
      // Remarks: { val: this.state.Remarks, required: false, Name: 'Remarks', Type: ControlType.string, Focusid: this.inputRemarks },
      // Attachment: { val: this.state.fileArr, required: true, Name: '', Type: ControlType.file }
    }
    let isValid = formValidation.checkValidations(data);
    var formdata = {
      ProposalFor: this.state.Location,
      ClientName: this.state.ClientName,
      ProposalType: this.state.ProposalFor,
      SubmittedDate: this.state.SubmittedDate,
      Amount:this.state.Amount? parseFloat(this.state.Amount):0,
      Status: this.state.Status,
      Proposal: this.state.TitleoftheProposal,
      Title: this.state.ProjectName,
      // IsBulkProposal: this.state.ischecked,
      Remarks: this.state.Remarks,
      SubmittedById: this.state.SubmittedById,
      EstimatedHour: this.state.EstimationHours,
      ClientID:this.state.isEditMode? this.state.ClientId : this.state.ClientId.toString(),
      EstID:this.state.isEditMode!=null? (this.state.isEditMode?this.state.EstId:this.state.EstId.toString()):"",
      History: JSON.stringify(this.state.History)

    }


    if (isValid.status) {
        await this.checkDuplicates(formdata);
           this.state.History.push({ "Project": formdata.Title, "Proposal": formdata.Proposal, "Estimation Hour": formdata.EstimatedHour, "Submitted Date": DateUtilities.getDateDDMMYYYY(formdata.SubmittedDate), "Amount": formdata.Amount, "Created On": new Date().toLocaleString('en-GB', { hour12: false }) })
           formdata['History'] = JSON.stringify(this.state.History);
    }
    else
    {
      hideLoader();
      showToast('error', isValid.message);
    }
      // this.setState({ errorMessage: isValid.message });

  }
  private checkDuplicates = (formData: any) => {

    let TrList = 'ProposalDetails';
    var filterString;
    try {
      showLoader();
      if (this.state.ItemID == 0)
        filterString = `Proposal eq '${formData.Proposal}' and Status eq 'In-Progress' `;
      else
        filterString = `Proposal eq '${formData.Proposal}' and Status eq 'In-Progress' and Id ne ${this.state.ItemID}`;
      sp.web.lists.getByTitle(TrList).items.filter(filterString).get().
        then(async (response: any[]) => {
          if (response.length > 0){
            showToast('error', "Duplicate 'Title of the Proposal' not accepted.");
            // this.setState({ errorMessage: 'Duplicate record not accept' });
          }
          else
          {
                        await this.insertorupdateListitem(formData);

         
          }
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
  private insertorupdateListitem = async (formData: any) => {
  try {
    showLoader();

    const EstimationData = {
      Status: formData.Status,
      IsEstimationTagged: true,
    };

    const shouldUpdateEstimation = !this.state.ischecked;
    let ProposalResp: any;
    let EstimationResp: any;

    if (this.state.ItemID === 0) {
      // ADD ProposalDetails
      ProposalResp = await sp.web.lists
        .getByTitle('ProposalDetails')
        .items.add(formData);

      // Conditionally UPDATE Estimations
      if (shouldUpdateEstimation) {
        EstimationResp = await sp.web.lists
          .getByTitle('Estimations')
          .items.getById(formData.EstID)
          .update(EstimationData);
      }

      this.AddorUpdatelistItem(ProposalResp.data.Id);
      this.onSucess();
    } else {
      // UPDATE ProposalDetails
      ProposalResp = await sp.web.lists
        .getByTitle('ProposalDetails')
        .items.getById(this.state.ItemID)
        .update(formData);

      // Conditionally UPDATE Estimations
      if (shouldUpdateEstimation) {
        EstimationResp = await sp.web.lists
          .getByTitle('Estimations')
          .items.getById(formData.EstID)
          .update(EstimationData);
      }

      this.AddorUpdatelistItem(this.state.ItemID);
      this.onUpdateSucess();
    }

    console.log('Proposal Response:', ProposalResp);
    if (shouldUpdateEstimation) {
      console.log('Estimation Response:', EstimationResp);
    }
  } catch (e) {
    console.log(e);
    this.onError();
  } finally {
    hideLoader();
  }
};

  // private insertorupdateListitem =async (formData: any) => {
  //       try {
  //         showLoader();
  //   // this.setState({ loading: true });
  //   let EstimationData={
  //     Status:formData.Status,
  //     IsEstimationTagged:true

  //   }

  //   if (this.state.ItemID == 0) {
     
  //     let [ProposalResp,EstimationResp]=await Promise.all([sp.web.lists.getByTitle('ProposalDetails').items.add(formData),
        
  //       sp.web.lists.getByTitle('Estimations').items.getById(formData.EstID).update(EstimationData),

  //     ]) 

  //           this.AddorUpdatelistItem(ProposalResp.data.Id);
  //           this.onSucess();
  //            console.log(EstimationResp);
              
          
  //   }
  //   else {
  //       let [ProposalResp,EstimationResp]=await Promise.all([sp.web.lists.getByTitle('ProposalDetails').items.getById(this.state.ItemID).update(formData),
  //       sp.web.lists.getByTitle('Estimations').items.getById(formData.EstID).update(EstimationData),
  //     ]) 
   
  //       this.AddorUpdatelistItem(this.state.ItemID);
  //       this.onUpdateSucess();
  //       console.log(ProposalResp);
  //       console.log(EstimationResp);
    
  //   }
  //    }
  //     catch (e) {
  //       console.log(e);
  //        this.onError();
  //     }finally{
  //       hideLoader();
  //     }
  // }

 private async getCurrentUserGroups(){
    try {
       showLoader();
      const currentUser = await sp.web.currentUser.get();
      const userGroups = await sp.web.currentUser.groups.get();
 
       const isAdmin = userGroups.some(g => g.Title === 'P&I Administrators');
      const isBilling = userGroups.some(g => g.Title === 'Billing Team');
      const isSales = userGroups.some(g => g.Title === 'Sales Team');
      const isDev = userGroups.some(g => g.Title === 'Dev Team'); 
       const hasFullAccess = isAdmin || isBilling || isSales;
       const canSeeSubmitButton = hasFullAccess;
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
      this.setState({ isAdmin: true });
      userClients = masterClientData; // Admins and Devs can see all clients
  
    }
   
    
    else if (isBilling) {
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
      userLoc = Array.from(new Set(userClients.map(c => c.Location))); ;
    }

    this.setState({
      Locations: userLoc.map(item=>({
                 label: item,
                 value: item
               })).filter(item => item.label !=='').sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' })),
      loading: false,
      Location: userLoc.length === 1 ? userLoc[0] : '',
      isdevTeam: canSeeSubmitButton
    });
      if(userLoc.length === 1){
        await this.fetchClientsBasedOnLocation(userLoc[0],'');
      }
  
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }finally{
      hideLoader();
    }
  }






  private handleCancel = () => {
    this.setState({ Homeredirect: true, ItemID: 0, errorMessage: "" });
  }


  private onSucess = () => {
     showToast('success', 'Proposal submitted successfully');
        this.getEstimationsListData();
        this.setState({ showHideModal: false,Homeredirect:true,addNewProgram:false, loading: false, isSuccess: true, ItemID: 0,errorMessage: "" });
    
    // this.setState({ modalTitle: 'Success', modalText: 'Estimation submitted successfully', showHideModal: true, loading: false, isSuccess: true, ItemID: 0, errorMessage: "" });
  }
  private onUpdateSucess = () => {
      showToast('success', 'Proposal updated successfully');
        this.setState({showHideModal: false, loading: false,addNewProgram:false,Homeredirect:true, isSuccess: true, ItemID: 0,errorMessage: "" });
         this.getEstimationsListData();
    // this.setState({ modalTitle: 'Success', modalText: 'Estimation updated successfully', showHideModal: true, loading: false, isSuccess: true, ItemID: 0, errorMessage: "" });
  }
  private onError = () => {
      showToast('error', 'Sorry! something went wrong');
       this.setState({showHideModal: false, loading: false,addNewProgram:false,Homeredirect:true, isSuccess: true, ItemID: 0,errorMessage: "" });
            //  this.setState({showHideModal: false, loading: false,addNewProgram:false,Homeredirect:true, isSuccess: true, ItemID: 0,errorMessage: "" });
    // this.setState({

    //   loading: false, modalTitle: 'Error', modalText: 'Sorry! something went wrong', showHideModal: true, isSuccess: false, ItemID: 0, errorMessage: ""
    // });
  }


  private changeEstHour = async (event: any) => {
    const selectedTitleofproposal = event.target.options[event.target.selectedIndex].text;
    const selectedId = event.target.value;
    let returnObj: any = {};
    if (event.target.name === 'TitleoftheProposal') {
      returnObj.originalTitleoftheProposal = selectedId;
      // Reset all dropdowns to "None"

      this.setState({
        EstimationHours: '',
        TitleoftheProposal: ''



      });

    }

    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
    if (event.target.name === 'TitleoftheProposal') {
      await this.fetchHoursBasedOnProposalfor(selectedTitleofproposal);
      await this.fetchsEstimationidBasedOnTitleofprop(selectedTitleofproposal);
    }
  }
  private fetchHoursBasedOnProposalfor = (selectedTitleofproposal: string) => {
    try{
      showLoader();
    const EstimationsList = 'Estimations';
    sp.web.lists.getByTitle(EstimationsList).items.filter(`TitleoftheEstimation eq '${selectedTitleofproposal}'`).select('EstimatedHour', 'Id').get().then((Response: any[]) => {
      console.log(Response);
      if (Response.length > 0) {
        this.setState({ EstimationHours: Response[0].EstimatedHour,prevEstimationHours:Response[0].EstimatedHour });
      } else {
        this.setState({ EstimationHours: '' });
      }
    }).catch((error) => {
      console.error("Error fetching estimation hours:", error);
      this.setState({ EstimationHours: '' });


    });
  }
  catch(error){
       console.log("Error in data fetching" + error);
  }finally{
    hideLoader();
  }
  }

  private fetchTitleofProposalBasedOnProjects = (selectedLabel: string, selectedproposal: string) => {
     try{
    const EstimationsList = 'Estimations';
    sp.web.lists.getByTitle(EstimationsList).items.filter(`TitleOfTheProject eq '${selectedLabel}' and EstimationStatus eq 'Submitted' and Status ne 'Rejected' `).select('TitleoftheEstimation', 'Id').get().then((Response: any[]) => {
      console.log(Response);
      const { isEditMode } = this.state;
      const ProposalOptions = Response.map(item => ({
        label: item.TitleoftheEstimation,
        value: isEditMode ? item.TitleoftheEstimation : item.Id
      }));
      this.setState({
        TitleOfProposals: ProposalOptions,
        TitleoftheProposal: selectedproposal ?? '' // Set the selected proposal name if provided

      });
    });
     }
     catch (error){
        console.log("Error in data fetching" + error);
     }finally{
      hideLoader();
     }
  }

  private fetchProjectsBasedOnProposalfor = (selectedProposal: string, selectedproject: string) => {
    try{
    let SelectedClientName: string


    if (this.state.isEditMode == false) {
      let Client = document.getElementById("clientName") as HTMLSelectElement;
      SelectedClientName = Client.options[Client.selectedIndex].text;
    }
    else {
      SelectedClientName = this.state.ClientName;
    }


    const EstimationsList = 'Estimations';
    sp.web.lists.getByTitle(EstimationsList).items.select("Id", "TitleOfTheProject", 'ClientName/Title',
      'ClientName/Id').expand("ClientName").filter(`EstimationFor eq '${selectedProposal}' and ClientName/Title eq '${SelectedClientName}' and EstimationStatus eq 'Submitted' and Status ne 'Rejected'`).get().then((Response: any[]) => {
        console.log(Response);
        const { isEditMode } = this.state;

        // const projectOptions = Response.map(item => ({
        //   label: item.TitleOfTheProject,
        //   value: isEditMode ? item.TitleOfTheProject : item.Id
        // }));
            const uniqueProjectsMap = new Map<string, any>();
        Response.forEach(item => {
          if (!uniqueProjectsMap.has(item.TitleOfTheProject)) {
            uniqueProjectsMap.set(item.TitleOfTheProject, {
              label: item.TitleOfTheProject,
              value: isEditMode ? item.TitleOfTheProject : item.Id
            });
          }
        });

        const projectOptions = Array.from(uniqueProjectsMap.values());
        this.setState({
          ProjectNames: projectOptions,
          ProjectName: selectedproject ?? '',
          isConsultantSelected: selectedProposal === 'Consultant' // Set isConsultantSelected based on the selected proposal
          // Set the selected project name if provided
        });
      });
    }
    catch(error){
      console.log("Error in loading data"+ error)
    }finally{
      hideLoader();
    }
  }
  private fetchClientsBasedOnLocation = (selectedLocation: string, slectedclient: string) => {
    try{
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
  catch(error){
    console.log("Error in data" +error);
  }finally{
    hideLoader();
  }
  }

  private getEstimationsListData = () => {
    let locationsList = 'Location';
    try {
         showLoader();
      let SubmittedById = this.props.spContext.userId;  // Get the current user's ID
      // get all the items from a list
      sp.web.lists.getByTitle(locationsList).items.select('Title').get().then((Locations: any[]) => {
        const locationOptions = Locations.map(item => ({
          label: item.Title,
          value: item.Title
        }));
        this.setState({ Locations: locationOptions, SubmittedById: SubmittedById });
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
    }finally{
      hideLoader();
    }

  }
  handleNumericChangeHours = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Allow only digits
    if (/^\d*$/.test(value)) {
       if(value.length > 5){
               value = value.slice(0, 5);
       }
   
      this.setState({ EstimationHours: value });
     
    }
  };
  private handleClose = () => {
    this.setState({ showHideModal: false, Homeredirect: true, ItemID: 0, errorMessage: "" });
  }
  private handleChange1 = (event: any) => {
    const selectedClientName = event.target.options[event.target.selectedIndex].text;
    
    // let returnObj: Record<string, any> = {};

    if (event.target.name === 'ClientName') {


      // Reset all dropdowns to "None"
      this.setState({
        ProposalFor: '',
        TitleoftheProposal: '',
        ProjectNames: [],
        TitleOfProposals: [],
        Proposals: [],
        EstimationHours: '',
      
        ClientName: selectedClientName
      });
      this.fetchclientidBasedOnClientName(selectedClientName);

    }

    // if (event.target.name != 'IsActive')
    //   returnObj[event.target.name] = event.target.value;
    // else
    //   returnObj[event.target.name] = event.target.checked;
    // this.setState(returnObj);


  }
  private fetchclientidBasedOnClientName = (selectedClientName: string) => {
    try{
      showLoader();
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
  catch(error){

  }finally{
    hideLoader();
  }
  }
  private fetchsEstimationidBasedOnTitleofprop = (selectedProposal: string) => {
    try{
    const EstimationsList = 'Estimations';
    sp.web.lists.getByTitle(EstimationsList).items.select("ID", "TitleoftheEstimation").filter(`TitleoftheEstimation eq '${selectedProposal}'`).get().then((Response: any[]) => {
      console.log(Response);
      if (Response.length > 0) {
        this.setState({ EstId: Response[0].ID });
      } else {
        this.setState({ EstId: '' });
      }

    });
  }
  catch(error){
    console.log("Error in fetching data"+error)
  }finally{
    hideLoader();
  }
  }

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


  handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^\d{0,10}(\.\d{0,2})?$/;

    // Allow only digits
    if (regex.test(value) || value === '') {
      this.setState({ Amount: value });
    }
  };

  // private handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   let stateobj = this.state;
  //   this.setState({ ischecked: event.target.checked });
  //   const isChecked = event.target.checked;
 
  //   if (isChecked) {
  //     // If checked, set ProjectName and TitleoftheProposal to empty strings
  //     this.setState({
  //       ProjectName: '',
  //       TitleoftheProposal: '',
  //       EstimationHours: ''
  //     });
  //   }
    
  //   else {
  //     // If unchecked, reset the state as needed
  //     this.setState({
  //       ProjectName: stateobj.originalProjectName,
  //       TitleoftheProposal: stateobj.originalTitleoftheProposal,
  //       EstimationHours: stateobj.prevEstimationHours,

  //     });
  //   }




  // }



  private filesChanged = (selectedFiles: any) => {
    this.setState({ fileArr: selectedFiles[0], delfileArr: selectedFiles[1] });
  }

  _getPeoplePickerItems = (items: any, type: string) => {
    
    let SubmittedById: any;
    if( items.length > 0) {
      // items.forEach((item: any) => { SubmittedById.push(item.id) });
      SubmittedById  =items[0].id;
    }
    else{
      SubmittedById = '';
    }
    this.setState({ SubmittedById: SubmittedById });


    // Store selected users in state
  };

  private BindComments = () => {
    let rows = this.state.History.map((item, index) => {
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{item.Project}</td>
          <td>{item.Proposal}</td>
          <td>{item["Estimation Hour"]}</td>
          <td>{item["Submitted Date"]}</td>
          <td>{item.Amount}</td>
          <td>{item['Created On']}</td>
        </tr>
      );
    });
    return rows;

  }











  render() {

//  if (!this.state.isPermissionChecked || !this.state.isAdminUser) {
//   const navIcon = document.querySelector('.click-nav-icon') as HTMLElement;
//   if (navIcon) {
//     navIcon.style.display = 'none';
//   }
// }

//     if(!this.state.isPermissionChecked){
//          return null
//       }
//       if(!this.state.isAdminUser){
//        return <UnAuthorized spContext={this.props.spContext}></UnAuthorized>
//       }
      if (this.state.isUnAuthorized) {
      return <UnAuthorized spContext={this.props.spContext}></UnAuthorized>
    }
    else if (this.state.Homeredirect) {
      // let message = this.state.modalText;
      let url = `/Proposal_View`;
      return <Navigate to={url} />;
    }


  else{


    return (

      <>

        <ModalPopUp title={this.state.modalTitle} modalText={this.state.modalText} isVisible={this.state.showHideModal} onClose={this.handleClose} isSuccess={this.state.isSuccess}></ModalPopUp>
            {this.state.islocationconfigured &&(
          <div className='container-fluid'>
        <div className='FormContent'>
          <div className='title'> New Proposal

            <div className='mandatory-note'>
              <span className='mandatoryhastrick'>*</span> indicates a required field
            </div>


          </div>


          <div className="after-title"></div>
          <div>
          

            <div className="light-box border-box-shadow mx-2">
              <div className="row pt-2 px-2">
                <div className="col-md-3">
                  <div className="light-text mb-2">
                    <label className="z-in-9">Location <span className="mandatoryhastrick">*</span></label>
                    <select className="form-control" required={true} id='ddlocation' name="Location" value={this.state.Location} onChange={this.handleChange} disabled={(this.state.isEditMode || this.state.Locations.length === 1)||!this.state.isdevTeam} title="Location" itemRef='Location' ref={this.inputLocation}>
                      <option value=''>None</option>
                      {this.state.Locations.map((location: any, index: any) => (
                        <option key={index} value={location.value}>{location.label}</option>
                      ))}

                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="light-text mb-2">
                    <label >Client Name<span className="mandatoryhastrick">*</span></label>
                    <select className="form-control" disabled={this.state.isEditMode ||!this.state.isdevTeam} required={true} name="ClientName" id="clientName" value={this.state.ClientName} title="Client Name" onChange={this.handleChange1} itemRef='ClientName' ref={this.inputClientName}>
                      <option value=''>None</option>
                      {this.state.ClientNames.map((Clientname: any, index: any) => (
                        <option key={index} value={Clientname.label}>{Clientname.label}</option>
                      ))}

                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="light-text mb-2">
                    <label >Proposal For<span className="mandatoryhastrick">*</span></label>
                    <select className="form-control" required={true} name="ProposalFor" value={this.state.ProposalFor} disabled={this.state.isEditMode ||!this.state.isdevTeam} onChange={this.handleTiofPro} title="Client Name" itemRef='ClientName' ref={this.inputProposalFor}>
                      <option value=''>None</option>
                      <option value='Project'>Project</option>
                      <option value='CR'>CR</option>
                      <option value='Consultant'>Consultant</option>
                      <option value='Support'>Support</option>

                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="light-text">
                    <label >Title of the Project<span className="mandatoryhastrick">*</span></label>
                    {(this.state.isConsultantSelected) ? (
                      <InputText
                        type='text'
                        label="Title of the Project"
                        name={"ProjectName"}
                        value={this.state.ProjectName}
                        isRequired={true}
                        onChange={this.handleText}
                        // disabled={!this.state.ischecked} 

                        refElement={this.inputTitleoftheProject} onBlur={undefined}
                      />
                    ) : (

                      <select className="form-control" required={true} name="ProjectName" value={this.state.ProjectName} disabled={this.state.isEditMode || !this.state.isdevTeam} onChange={this.handleTitleOfProposal} title="ProjectName" itemRef='ProjectName' ref={this.inputTitleoftheProject}>
                        <option value=''>None</option>
                        {this.state.ProjectNames.map((ProjectName: any, index: any) => (
                          <option key={index} value={ProjectName.label}>{ProjectName.label}</option>
                        ))}

                      </select>

                    )}
                  </div>
                </div>
             
                  <div className="col-md-3 my-1">
                    <div className="light-text">
                      <label >Title of the Proposal<span className="mandatoryhastrick">*</span></label>
                      {(this.state.isConsultantSelected || this.state.ischecked) ? (
                        <InputText
                          type='text'
                          label="Title of the Proposal"
                          name={"TitleoftheProposal"}
                          value={this.state.TitleoftheProposal}
                          isRequired={true}
                          // disabled={!this.state.ischecked}
                          onChange={this.handleText}

                          refElement={this.inputProposalTitle} onBlur={undefined}
                        />
                      ) : (

                        <select className="form-control" required={true} name="TitleoftheProposal" disabled={this.state.isEditMode || !this.state.isdevTeam } value={this.state.TitleoftheProposal} title="TitleoftheProposal" onChange={this.changeEstHour} itemRef='TitleoftheProposal' ref={this.inputProposalTitle}>
                          <option value=''>None</option>
                          {this.state.TitleOfProposals.map((TitleOfProposal: any, index: any) => (
                            <option key={index} value={TitleOfProposal.label}>{TitleOfProposal.label}</option>
                          ))}

                        </select>

                      )}
                    </div>
                  </div>
                  <div className="col-md-3 my-1">
                    <InputText
                      type='text'
                      label={"Estimation Hours"}
                      name={"Estimation Hours"}
                      value={this.state.EstimationHours}
                      disabled={!this.state.ischecked}
                      isRequired={true}
                      onChange={this.handleNumericChangeHours}

                      refElement={this.inputEstimatedHours} onBlur={undefined}
                    />
                  </div>
                  <div className="col-md-3 my-1">
                    <div className="light-text c-people-picker">
                     <label className='lblPeoplepicker'>Submitted By <span className="mandatoryhastrick">*</span></label>
                      <div className="" id="divPeopleUser">
                      <PeoplePicker
                        context={this.props.context}
                        titleText=""
                        personSelectionLimit={1}
                        showtooltip={false}
                        disabled={!this.state.isAdmin || this.state.isEditMode}
                        ensureUser={true}
                        onChange={(items) => this._getPeoplePickerItems(items, 'SalesPerson')}
                        defaultSelectedUsers={this.state.SubmittedEmail}
                        principalTypes={[PrincipalType.User]}
                        ref={this.inputSubmittedName}

                      />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 my-1">
                    <div className="light-text div-readonly">
                      <label className="z-in-9">Submitted Date<span className="mandatoryhastrick">*</span></label>
                      <div className="custom-datepicker" id="DivSubmittedDate">
                        <DatePicker onDatechange={this.handleDateChange} isDisabled={this.state.isEditMode||!this.state.isdevTeam} ref={this.inputsubmittedDate} placeholder="MM/DD/YYYY" endDate={new Date()} selectedDate={this.state.SubmittedDate} maxDate={new Date()} id={'txtSubmitteddate'} title={"Submitted Date"} />
                      </div>
                    </div>
                  </div>

              
             
                  <div className="col-md-3 my-1">
                    <InputText
                      InpuId='txtAmount'
                      type='text'
                      label={`Amount ${this.state.currencySymbols ? ` (${this.state.currencySymbols})` : ''}` } 
                      name={"Amount"}
                      value={this.state.Amount}
                      // disabled={false}
                      disabled={(this.state.isEditMode && this.state.onLoadStatus !== 'In-Progress' && this.state.onLoadStatus !== "" ) || !this.state.isdevTeam}
                      // disabled={(this.state.isEditMode && this.state.onLoadStatus !== 'In-Progress')||!this.state.isdevTeam}
                      isRequired={true}
                      onChange={this.handleNumericChange}
                      refElement={this.inputAmount} 
                      
                    />
                  </div>
                  <div className="col-md-3 my-1">
                    <div className="light-text">
                      <label >Status <span className="mandatoryhastrick">*</span></label>
                      <select className="form-control" required={true} onChange={this.handleText} disabled={(this.state.isEditMode && this.state.onLoadStatus !== 'In-Progress')||!this.state.isdevTeam} name="Status" value={this.state.Status} title="Status" itemRef='Status' ref={this.inputStatus}>
                        <option value=''>None</option>
                        <option value='In-Progress'>In-Progress</option>
                        <option value='Approved'>Approved</option>
                        <option value='Rejected'>Rejected</option>

                      </select>
                    </div>
                  </div>

                  {/* <InputCheckBox
                    name={"Is Bulk Proposal"}
                    checked={this.state.ischecked}

                    isforMasters={false} onChange={this.handleCheckbox} isdisable={(this.state.isEditMode && this.state.onLoadStatus !== 'In-Progress')||!this.state.isdevTeam}  label={' Is Bulk Proposal'} /> */}
           
                  <div className="col-md-12 my-1">
                    <div className="light-text">
                      <label>Reason</label>
                      <textarea className="form-control requiredinput" value={this.state.Remarks} onChange={this.handleChange} disabled={(this.state.isEditMode && this.state.onLoadStatus !== 'In-Progress')||!this.state.isdevTeam}  placeholder="" id="txtTargetDescription" name="Remarks" ref={this.inputRemarks} ></textarea>
                    </div>
                  </div>
           
              
              
                  <div className="col-md-12">
                    <FileUpload ismultiAllowed={true} onFileChanges={this.filesChanged} disabled={(this.state.isEditMode && this.state.onLoadStatus !== 'In-Progress') || !this.state.isdevTeam} isnewForm={!this.state.DynamicDisabled} files={[this.state.fileArr, this.state.delfileArr]} />
                  </div>
          
                {/* <span className="text-validator" id="spanErrorMessage">{this.state.errorMessage}</span> */}
                <div className="row mx-1" id="">
                  <div className="col-sm-12 text-center my-4" id="">


                   {(!this.state.isEditMode||  this.state.onLoadStatus == 'In-Progress') &&
                   (this.state.isdevTeam || this.state.Approvalflag )&&( <button type="button" id="btnSubmit" className="SubmitButtons btn" onClick={this.SubmitData} >{this.state.SaveUpdateText}</button>)}
                    <button type="button" id="btnCancel" className="CancelButtons btn" onClick={this.handleCancel} >Cancel</button>
                  </div>
                </div>
                {this.state.isEditMode && (
                  <div className="row justify-content-md-left mt-4">
                    <div className="col-md-12">
                      <div className="p-rel">
                        <h6 className="p-2 mb-0 c-bg-title">Comments History</h6>
                      </div>
                      {/* <h6 className="mb-2">Comments History</h6> */}
                      <div className="px-2">
                        <table className="table border mt-2">
                          <thead>
                            <tr>
                              <th>Version</th>
                              <th>Project</th>
                              <th>Proposal</th>
                              <th>Estimation Hours </th>
                              <th>Submitted Date </th>
                              <th>Amount</th>
                              <th>Created On</th>
                            </tr>
                          </thead>
                          <tbody>
                            {this.BindComments()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

              </div>


            </div>




          </div>


        </div>
        
       </div>
                    )}
        {!this.state.islocationconfigured && this.configurationValidtion()}
      </>

    )
  }
  }
}


export default Proposal;