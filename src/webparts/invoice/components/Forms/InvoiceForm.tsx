
import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
import DatePicker from '../Shared/DatePickerField';
import ModalPopUp from '../Shared/ModalPopUp';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/controls/peoplepicker';
import InputText from '../Shared/InputText';
import { ControlType } from '../Utilities/Constants';
import formValidation from '../Utilities/Formvalidator';
import { Navigate } from 'react-router-dom';
import FileUpload from '../Shared/FileUpload';
import DateUtilities from '../Utilities/Dateutilities';
import { showToast } from '../Utilities/toastHelper';
import { showLoader,hideLoader } from '../Shared/Loader';
import UnAuthorized from '../Shared/UnAuthorized.Component';
import Icons from '../../assets/Icons';
// import DateUtilities from '../Utilities/Dateutilities';






  

// import DatePicker from 'react-datepicker';


export interface IInvoiceProps {
  match: any;
  spContext: any;
  spHttpClient: SPHttpClient;
  context: any;
  history: any;
}
interface Invoicehistory {
   InvoiceNumber:string,
   SubmittedDate:null,
   AvailableBalance:number,
   InvoiceAmount:number,
   SubmittedBy:string,
   PaymentStatus:string
}
export interface IinvoiceState {

}
class InvoiceForm extends React.Component<IInvoiceProps, IinvoiceState> {
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
    POId:'',
     currencySymbols: '',
    ClientId:'',
    isEditMode: false,
    Location: '',
    Locations: [],
     inprogressflag:false,
    ClientNames: [],
    ClientName: '',
    PONumber: '',
    PONumbers: [],
    InvoiceFor:'',
    Invoicesfor:[],
    TotalPOValue:'',
    AvailableBalance:0,
    InvoicedAmount:'',
    InvoiceNumber:'',
    InvoicedDate: null,
    PaymentDate: null,
    InvoiceStatus: '',
    Remarks: '',
     SubmittedById: '',
    SubmittedEmail:[],
     History: [] as Invoicehistory[],
    Homeredirect: false,
    DynamicDisabled: false,
    Title: '',
    IsActive: true,
    SaveUpdateText: 'Submit',
    addNewProgram: false,
    ItemID: 0,
       fileArr: [],
    delfileArr: [],
    Receivedflag:'',
       isAdmin: false,
    isPermissionChecked:false,
    isUnAuthorized:false,
    islocationconfigured:true,



  };
  private inputLocation: React.RefObject<HTMLSelectElement>;
  inputClientName: React.RefObject<HTMLSelectElement>;
  inputPonumber:React.RefObject<HTMLSelectElement>;
  inputInvoicefor:React.RefObject<HTMLSelectElement>;
  InvoicedDate: React.RefObject<HTMLInputElement>;
    private inputSubmittedName: React.RefObject<PeoplePicker>;
  inputPaymentDate: React.RefObject<HTMLInputElement>;
  inputInvoiceStatus: React.RefObject<HTMLSelectElement>;
    inputRemarks: React.RefObject<HTMLTextAreaElement>;
  inputInvoicedAmount: React.RefObject<HTMLInputElement>;
  inputTotalPOValue:React.RefObject<HTMLInputElement>;
  inputAvailableBalance:React.RefObject<HTMLInputElement>;
  inputInvoiceNumber:React.RefObject<HTMLInputElement>;

  constructor(props: any) {
    super(props);
    sp.setup({
      spfxContext: this.props.context
    })

    this.inputLocation = React.createRef<HTMLSelectElement>();
    this.inputClientName = React.createRef<HTMLSelectElement>();
    this.inputPonumber = React.createRef<HTMLSelectElement>();
    this.InvoicedDate = React.createRef<HTMLInputElement>();
    this.inputPaymentDate = React.createRef<HTMLInputElement>();
    this.inputInvoiceStatus = React.createRef<HTMLSelectElement>();
    this.inputInvoicefor=React.createRef<HTMLSelectElement>()
    this.inputTotalPOValue=React.createRef<HTMLInputElement>();
    this.inputAvailableBalance=React.createRef<HTMLInputElement>();
    this.inputInvoicedAmount=React.createRef<HTMLInputElement>();
    this.inputInvoiceStatus=React.createRef<HTMLSelectElement>();
    this.inputRemarks = React.createRef<HTMLTextAreaElement>();
    this.inputInvoiceNumber=React.createRef<HTMLInputElement>()
  }

  public async componentDidMount() {
     try{
       showLoader();

        await this.checkpermisssion();
           await this.getEstimationsListData();
       
          await this.getCurrentUserGroups();
   
    if (this.props.match.params.id != undefined) {

      document.getElementById('txtInvoicedAmount')?.focus();
      let ItemID = this.props.match.params.id
       this.setState({ 
        isEditMode: true,
        ItemID:ItemID,
          SubmittedEmail:[],
        SubmittedById:""
       });
     
      await this.getOnclickdata(ItemID);
    
    }
    else {
      document.getElementById('ddllocation')?.focus();
      this.setState({ isEditMode: false,SubmittedEmail:[this.props.spContext.userEmail],SubmittedById:this.props.spContext.userId  });
    }
 
  }
      catch(error){
      console.error("Error in componentDidMount:", error);
      }finally{
        hideLoader();
      }
  
  
  }

    private async checkpermisssion(){
      try {
          const userGroups= await sp.web.currentUser.groups.get();
            const adminGroups = [
        'P&I Administrators',
        'Billing Team'
      ];
      const isAdminuser = userGroups.some(group=>adminGroups.includes(group.Title)
    );
     this.setState({isAdmin:isAdminuser,isPermissionChecked: true,isUnAuthorized:!isAdminuser},()=>{hideLoader();})
  
      }
      catch(error){
             console.error('Error checking admin status:', error);
      this.setState(
        { isAdmin: false, isPermissionChecked: true },
        () => { hideLoader(); }
      );
      }
    }
  

  private async getOnclickdata(ItemID: number) {
     try{
     showLoader();
    await sp.web.lists.getByTitle('Invoices').items.getById(ItemID).select(
      'ProposalFor',
      'ClientName',
        'ProposalID',
        'TotalPo',
       ' AvailableBalance',
       ' InvoiceAmount',
        'SubmittedById',
       ' SubmittedDate',
        'Remarks',
        'InvoiceType',
       ' InvoiceNumber',
       ' PaymentDate',
       ' PaymentStatus',
       'SubmittedBy/EMail',
       'SubmittedBy/Id',
       'POID',
        'ClientID',
    
      'Id').expand('SubmittedBy').get().then( (Response) => {
       console.log(Response);
        this.setState({

          addNewProgram: true,
          Location: Response.ProposalFor,
          ClientName: Response.ClientName,
           ProjectName : Response.Title,
          PONumber: Response.ProposalID,
          InvoiceFor:Response.InvoiceType,
          TotalPOValue:Response.TotalPo,
          AvailableBalance:Response.AvailableBalance,
          InvoicedAmount:Response.InvoiceAmount,
          InvoiceNumber:Response.InvoiceNumber,
          SubmittedEmail:[Response.SubmittedBy.EMail],
          SubmittedById:Response.SubmittedBy.Id,
         InvoicedDate:Response.SubmittedDate,
         InvoiceStatus:Response.PaymentStatus,
         PaymentDate:Response.PaymentDate,
          ItemID:Response.Id,
          SaveUpdateText: 'Update',
          errorMessage: "",
          ClientId:Response.ClientID,
          POId:Response.POID,
          Receivedflag:Response.PaymentStatus
          

        })
              
             this.fetchClientsBasedOnLocation (Response.ProposalFor, Response.ClientName);
              this.fetchPONumberbasedonClientName(Response.ClientName,Response.ProposalID);
              this.fetchInvoiceforsbasedonPONumber(Response.ProposalID,Response.TotalPo,Response.AvailableBalance,Response.InvoiceType);
               this.Pohistory(Response.ProposalID);
         
         

      })
         let files = await sp.web.lists.getByTitle('InvoicesDocs').items.filter('RecordID eq ' + ItemID).expand('File').get()
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
          console.log("error in getonclickdata",error)

        }finally{
          hideLoader();
        }
  }

  handleDateChange = (date: any,fieldName:string) => {
    if(fieldName === 'InvoicedDate') {
    this.setState({ InvoicedDate: date[0] });
    }
    else if(fieldName === 'PaymentDate') {
        this.setState({ PaymentDate: date[0] });
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
    try{
      showLoader();
     const TrList = 'PODetails';
    await sp.web.lists.getByTitle(TrList).items.filter(`PONumber eq '${selectedponumber}'`).select('Title', 'ID').get().then((Response: any[]) => {
      console.log(Response);
  
      this.setState({
        POId:Response[0].ID
   
      });
    });
  }catch(e){
      console.log("Error in POdetailesidbasedonPOnumber",e)
  }finally{
    hideLoader();
  }
  }
  private handleChange = (event: any) => {
    const selectedInvoiceFor = event.target.value;
    let currencySymbol = '';
    if(selectedInvoiceFor === 'AUS')
    {
      currencySymbol = 'AU$';
    }
    else if (selectedInvoiceFor === 'GDC'){
       currencySymbol = '₹';
    }
     else if (selectedInvoiceFor === 'Onsite'){
          currencySymbol = '$';
    }
    let returnObj: any = {};
    if (event.target.name === 'Location') {
      // Reset all dropdowns to "None"
      this.setState({       
        ClientName: '',        // Reset Client dropdown                   
        ClientNames: [],      
         PONumber: '',
         PONumbers: [],
         InvoiceFor:'',
         Invoicesfor:[],
         TotalPOValue:'',
         AvailableBalance:'',
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



private handleinvoicenumber = (e:any) => {

    
    const value = e.target.value;

      this.setState({ InvoiceNumber: value });
    
  

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
          await sp.web.getFolderByServerRelativeUrl(siteAbsoluteURL + "/InvoicesDocs").files.add(file.name, file, true);
          const item1 = await sp.web.getFileByServerRelativePath(siteAbsoluteURL + "/InvoicesDocs/" + file.name).getItem();
  
          item1.update({
            RecordID: ItemID
  
          });
          processedFiles = processedFiles + 1;
          if (newFileArry.length == processedFiles) {
            this.onSucess();
  
          }
  
        }
      }
    }
    private deleteListItem() {
      let list = sp.web.lists.getByTitle("InvoicesDocs");
      if (this.state.delfileArr.length > 0) {
        this.state.delfileArr.map((selItem, index) => {
          let itemId = selItem['FileID'];
          list.items.getById(itemId).delete();
        });
      }
    }


   private handleExecutionType = (e:any) => {

    
  this.setState({ InvoiceFor: e.target.value });
  

  }
 private handleProjectstatus = (event: any) => {
      
          const { name, value } = event.target;
          this.setState({ [name]: value });
  }

  private SubmitData = () => {
    showLoader();
    let data:any={}
    data.location= { val: this.state.Location, required: true, Name: 'Location', Type: ControlType.string, Focusid: this.inputLocation };
    data.ClientName= { val: this.state.ClientName, required: true, Name: 'Client Name', Type: ControlType.string, Focusid: this.inputClientName };
    data.PONumber={val: this.state.PONumber, required: true, Name: 'PO Number', Type: ControlType.string, Focusid: this.inputPonumber};
    data.AvailableBalance={val: (this.state.AvailableBalance), required: true, Name: 'AvailableBalance', Type: ControlType.string, Focusid: this.inputAvailableBalance};
    data.InvoicedAmount={val:parseInt(this.state.InvoicedAmount), required: true, Name: 'Invoiced Amount', Type: ControlType.number, Focusid: this.inputInvoicedAmount};
    data.InvoiceNumber={val: this.state.InvoiceNumber, required: true, Name: 'Invoice Number', Type: ControlType.string, Focusid: this.inputInvoiceNumber};
    data.SubmittedBy= { val: this.state.SubmittedById, required: true, Name: 'Sales Person Name', Type: ControlType.people, Focusid:'divPeopleUser'}
    data.invoicedDate={val: this.state.InvoicedDate, required: true, Name: 'Invoiced Date', Type: ControlType.date, Focusid:'DivInvoicedDate'};
    data.InvoiceStatus={val: this.state.InvoiceStatus, required: true, Name: 'Payment Status', Type: ControlType.string, Focusid: this.inputInvoiceStatus};
    if(this.state.InvoiceStatus=='Received'){
         data.PaymentDate={val: this.state.PaymentDate, required: true, Name: 'Payment Date', Type: ControlType.date, Focusid:'DivPaymentDate'};
    }
    //  data.Remarks={val: this.state.Remarks, required: true, Name: 'Remarks', Type: ControlType.string, Focusid: this.inputRemarks};
      // data.Attachment= { val: this.state.fileArr, required: true, Name: '', Type: ControlType.file };
      
   
     
    
    let isValid = formValidation.checkValidations(data);

    var formdata = {
        ProposalFor:this.state.Location,
        ClientName:this.state.ClientName,
        ProposalID:this.state.PONumber,
        TotalPo:(this.state.TotalPOValue),
        AvailableBalance:this.state.AvailableBalance,
        InvoiceAmount:parseFloat(this.state.InvoicedAmount),
        SubmittedById: this.state.SubmittedById,
        SubmittedDate:this.state.InvoicedDate,
        Remarks:this.state.Remarks,
        InvoiceType: this.state.InvoiceFor,
        ClientID:this.state.isEditMode?this.state.ClientId:this.state.ClientId.toString(),
        InvoiceNumber:this.state.InvoiceNumber,
        PaymentDate:this.state.PaymentDate,
        PaymentStatus:this.state.InvoiceStatus,
        POID:this.state.isEditMode?this.state.POId:this.state.POId.toString(),


      
       
      
    }


    if (isValid.status) {
            //  let availableBalanceAfterCalculation = (this.state.AvailableBalance) - parseInt(this.state.InvoicedAmount);
            //   formdata.AvailableBalance = availableBalanceAfterCalculation; 
              this.checkDuplicates(formdata);
    }
    else
    {
      hideLoader();
       showToast('error',isValid.message);
    }
      // this.setState({ errorMessage: isValid.message });

  }
  private checkDuplicates = async (formData: any) => {
    let TrList = 'Invoices';
    var filterString;
    try {
      if (this.state.ItemID == 0)
        filterString = `InvoiceNumber eq '${formData.InvoiceNumber}'`;
      else
        filterString = `InvoiceNumber eq '${formData.InvoiceNumber}' and Id ne ${this.state.ItemID}`;
       await sp.web.lists.getByTitle(TrList).items.filter(filterString).get().
        then(async (response: any[]) => {
          if (response.length > 0){
            showToast('error',"'Invoice Number' already exists");
            
            // this.setState({ errorMessage: 'Duplicate record not accept' });
          }
          else
           await this.insertorupdateListitem(formData);
        });
    }
    catch (e) {
      this.onError();
      console.log(e);
    }
    // return findduplicates
  }
  private insertorupdateListitem = async (formData:any) => {
    try{
       let PODetails={
          IsPOInvoiceTagged:true
       }
      showLoader();
    this.setState({ loading: true });
      if (this.state.ItemID == 0) { 
        let [InvoiceResp,Pores]=await Promise.all([ sp.web.lists.getByTitle('Invoices').items.add(formData),sp.web.lists.getByTitle('PODetails').items.getById(formData.POID).update(PODetails)])
          
           this.AddorUpdatelistItem(InvoiceResp.data.Id);
            this.onSucess();
            console.log(Pores);
    }
    else {
           let [invoiceResp,Pores]=await Promise.all([sp.web.lists.getByTitle('Invoices').items.getById(this.state.ItemID).update(formData),sp.web.lists.getByTitle('PODetails').items.getById(formData.POID).update(PODetails)])
            console.log(Pores);
              console.log(invoiceResp);
            this.AddorUpdatelistItem(this.state.ItemID)
            this.onUpdateSucess();          
       
    }
  }
    catch(error){
      console.log("error in add Item",error)
    }finally{
      hideLoader();
    }
      
  }

  private filesChanged = (selectedFiles: any) => {
    this.setState({ fileArr: selectedFiles[0], delfileArr: selectedFiles[1] });
  }

  private handleCancel = () => {
    this.setState({ Homeredirect: true, ItemID: 0, errorMessage: "" });
  }
  

  private onSucess = () => {
     showToast('success', 'Invoice submitted successfully');
      this.setState({ showHideModal: false,Homeredirect:true,addNewProgram:false, loading: false, isSuccess: true, ItemID: 0,errorMessage: "" });
    // this.setState({ modalTitle: 'Success', modalText: 'Invoice submitted successfully', showHideModal: true, loading: false, isSuccess: true, ItemID: 0, errorMessage: "" });
  }
  private onUpdateSucess = () => {
    showToast('success', 'Invoice Updated successfully');
      this.setState({ showHideModal: false,Homeredirect:true,addNewProgram:false, loading: false, isSuccess: true, ItemID: 0,errorMessage: "" });
    // this.setState({ modalTitle: 'Success', modalText: 'Invoice updated successfully', showHideModal: true, loading: false, isSuccess: true, ItemID: 0, errorMessage: "" });
  }
  private onError = () => {
      showToast('error', 'Sorry! something went wrong');
    // this.setState({
    //   loading: false, modalTitle: 'Error', modalText: 'Sorry! something went wrong', showHideModal: true, isSuccess: false, ItemID: 0, errorMessage: ""
    // });
  }

  
  private fetchClientsBasedOnLocation =async (selectedLocation: string, slectedclient: string) => {
    try{
      showLoader();
    const TrList = 'Clients';
    await sp.web.lists.getByTitle(TrList).items.filter(`Location eq '${selectedLocation}'`).select('Title', 'Id').get().then((Response: any[]) => {
      console.log(Response);
      const { isEditMode } = this.state;
      const clientOptions = Response.map(item => ({
        label: item.Title,
        value: isEditMode ? item.Title : item.Id
      }));
      this.setState({
        ClientNames: clientOptions,
        ClientName: slectedclient ?? ''
         
         // Set the selected client name if provided

      });
    });
  }
  catch(e){
    console.log("error in fetchClientsBasedOnLocation",e);
  }
  finally{
    hideLoader();
  }
  }


  private getEstimationsListData =async() => {
    let locationsList = 'Location';
    try {
     showLoader();

       let SubmittedById = this.props.spContext.userId; 
      // Get the current user's ID
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
    
      }
      );

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

  private handleClose = () => {
    this.setState({ showHideModal: false, Homeredirect: true, ItemID: 0, errorMessage: "" });
  }
  private handleChange1 = async (event: any) => {
    const selectedClientName = event.target.options[event.target.selectedIndex].text;
 

    if (event.target.name === 'ClientName') {


  
      this.setState({             
         InvoiceFor:'',
         Invoicesfor:[],
         TotalPOValue:'',
         AvailableBalance:'',
       
     
        StartDate:'',
        EndDate:'',
       
        ClientName: selectedClientName
      });
        this.fetchclientidBasedOnClientName(selectedClientName);
        this.fetchPONumberbasedonClientName(selectedClientName,'');
        
  

    }
     


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
    catch(e){
      console.log("error in fetchclientidBasedOnClientName",e);
    }finally{
      hideLoader();
    }
    }

      _getPeoplePickerItems = (items: any, type: string) => {
        try{
          showLoader();
           let SubmittedById: any;
    if( items.length > 0) {
      // items.forEach((item: any) => { SubmittedById.push(item.id) });
      SubmittedById  =items[0].id;
    }
    else{
      SubmittedById = '';
    }
    this.setState({ SubmittedById: SubmittedById });

    // let SubmittedById: any;
    //  SubmittedById  =items[0].id;
    // this.setState({ SubmittedById: SubmittedById });


    // Store selected users in state
  }catch(e){
     console.log("Error in peoplepicker",e)
  }finally{
    hideLoader();
  }
  };
  

//    private handlePONumber = (event: any) => {
//     let returnObj: any = {};
//     if (event.target.name === 'ProjectName') {
//       // Reset all dropdowns to "None"
//       this.setState({
//         PONumber:'',
//          PONumbers:[],
//         StartDate:'',
//         EndDate:'',
        
//       });
//     }
//     if (event.target.name != 'IsActive')
//       returnObj[event.target.name] = event.target.value;
//     else
//       returnObj[event.target.name] = event.target.checked;
//     this.setState(returnObj);
//     if (event.target.name === 'ProjectName') {
//       this.fetchPONumbersbasedonProject(event.target.value,'');
//     }

//   }
    private handleDatefields = async (event: any) => {
    let returnObj: any = {};
    if (event.target.name === 'PONumber') {
      // Reset all dropdowns to "None"
      this.setState({
       InvoiceFor:'',
         Invoicesfor:[],
         TotalPOValue:'',
         AvailableBalance:'',
        
      });
    }
    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
    if (event.target.name === 'PONumber') {
    await this.POdetailesidbasedonPOnumber(event.target.value)
    await this.fetchInvoiceforsbasedonPONumber(event.target.value,'','','');
       await this.Pohistory(event.target.value);
    }

  }

  private fetchInvoiceforsbasedonPONumber=async(selectedponumber:any,selectedtotalpo:any,selectedavailablepo:any,invoicefor:any)=>{
     try{
      showLoader();
     const POList='PODetails';
      await sp.web.lists.getByTitle(POList).items.select("Id", "POCategory","POValue").filter(`PONumber eq '${selectedponumber}' and ProposalFor eq '${this.state.Location}'`).get().then((Response: any[])=>{
            //const { isEditMode } = this.state;
      //     const InvoicesforOptions = Response.map(item => ({
      //   label: item.POCategory,
      //   value:  item.POCategory 
      // }));
      const{isEditMode}= this.state;
      this.setState({
        InvoiceFor:isEditMode?invoicefor: Response[0].POCategory,
        TotalPOValue:isEditMode?selectedtotalpo:Response[0].POValue,
        AvailableBalance:isEditMode?selectedavailablepo:Response[0].POValue
        // AvailableBalance:isEditMode?selectedavailablepo: this.state.AvailableBalance ? this.state.AvailableBalance : Response[0].POValue
                 
      });

         
            
         })
        }catch(e){
          console.log("Error in invoice ",e)
        }finally{
          hideLoader();
        }

  }
   private Pohistory = async (PONumber: any) => {
    try{
      showLoader();
   await sp.web.lists.getByTitle('Invoices').items.expand('SubmittedBy').select('SubmittedBy/Title,*').filter(`ProposalID eq '${PONumber}'`).get().then((Response: any[]) => {
      console.log(Response);

      if (Response.length > 0) {
                    let availableBalanceAfterCalculation = Response[0].TotalPo;
                  if(!this.state.isEditMode)
                  {
                  Response.forEach((Item)=>{
                    availableBalanceAfterCalculation = availableBalanceAfterCalculation - Item.InvoiceAmount;
                        
                  })
              
                  }
                  else{
                     availableBalanceAfterCalculation=this.state.AvailableBalance
                  }
            
        this.setState({ History: Response,AvailableBalance: availableBalanceAfterCalculation});
 
      } else {
        this.setState({ History: [] });
      }
    });
  }
  catch(e){
    console.log("Error in po history",e)
  }finally{
    hideLoader();
  }
  }

  private fetchPONumberbasedonClientName = async(selectedClientName: string,selectedproject:string) => {
     try{
      showLoader();
     const ProposalList = 'PODetails';
    await sp.web.lists.getByTitle(ProposalList).items.select("Id", "PONumber")
      .filter(`ClientName eq '${selectedClientName}'`).get().then((Response: any[]) => {
        console.log(Response);
       const { isEditMode } = this.state;
       
       const POnumbertoptions=  Response.map(item => ({
          label: item.PONumber,
          value: item.PONumber
        }));
         this.setState({
        PONumbers: POnumbertoptions,
        PONumber:isEditMode ? selectedproject : '', // Set the selected project name if provided
      

      

      });
      
      });
    } catch(e){
      console.log("Error in fetching po number",e);
    }finally{
      hideLoader();
    }
  }


  private BindComments = () => {
    let rows = (this.state.History || []).map((item:any, index) => {
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{item.InvoiceNumber}</td>
          <td>{DateUtilities.getDateMMDDYYYY(item.SubmittedDate)}</td>
          <td>{this.state.currencySymbols}&nbsp;{item.AvailableBalance}</td>
          <td>{this.state.currencySymbols}&nbsp;{item.InvoiceAmount}</td>
          <td>{item.SubmittedBy?.Title || ''}</td>
          <td>{item.PaymentStatus}</td>
        </tr>
      );
    });
    return rows;

  }

     private async getCurrentUserGroups(){
        try {
           showLoader();
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
          if(userLoc.length === 0)
          {
            this.setState({isUnAuthorized:true});
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
        });
          if(userLoc.length === 1){
            this.fetchClientsBasedOnLocation(userLoc[0],'');
          }
      
        } catch (error) {
          console.error('Error fetching user groups:', error);
        }finally{
          hideLoader();
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

  handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
         const regex = /^\d{0,10}(\.\d{0,2})?$/;
    // Allow only digits
    if (regex.test(value)) {
      this.setState({ InvoicedAmount: value });
    }
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




  render() {
//        if (!this.state.isPermissionChecked || !this.state.isAdmin) {
//   const navIcon = document.querySelector('.click-nav-icon') as HTMLElement;
//   if (navIcon) {
//     navIcon.style.display = 'none';
//   }
// }

//  if(!this.state.isPermissionChecked){
//          return null
//       }
//       if(!this.state.isAdmin){
//        return <UnAuthorized spContext={this.props.spContext}></UnAuthorized>
//       }
      if (this.state.isUnAuthorized) {
      return <UnAuthorized spContext={this.props.spContext}></UnAuthorized>
    }
    else if (this.state.Homeredirect) {
      // let message = this.state.modalText;
      let url = `/Invoice_View`;
      return <Navigate to={url} />;
    }

    else{



    return (

        <React.Fragment>
        <ModalPopUp title={this.state.modalTitle} modalText={this.state.modalText} isVisible={this.state.showHideModal} onClose={this.handleClose} isSuccess={this.state.isSuccess}></ModalPopUp>
         { this.state.islocationconfigured && ( 

         <div className='container-fluid'>
        <div className='FormContent'>
          <div className='title'> Invoice

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
                    <label >PO Number<span className="mandatoryhastrick">*</span></label>
                   
                      <select className="form-control" required={true} name="PONumber" value={this.state.PONumber} disabled={this.state.isEditMode} onChange={this.handleDatefields} title="PONumber" itemRef='PONUmber' ref={this.inputPonumber}>
                        <option value=''>None</option>
                        {this.state.PONumbers.map((POnumber: any, index: any) => (
                          <option key={index} value={POnumber.label}>{POnumber.label}</option>
                        ))}

                      </select>

                
                  </div>
                </div>
                    
                      <div className="col-md-3">
                    <InputText
                      type='text'
                      label={"Invoice For"}
                      name={"InvoiceFor"}
                      value={this.state.InvoiceFor}
                      disabled={true}
                      isRequired={true}
                      onChange={this.handleExecutionType}
                      refElement={this.inputInvoicefor} onBlur={undefined}
                    />
                  </div>
                          
                     <div className="col-md-3 my-2">
                    <InputText
                      type='text'
                      label={`Total PO Value${this.state.currencySymbols ? ` (${this.state.currencySymbols})` : ''}`}
                      name={"TotalPOValue"}
                      value={this.state.TotalPOValue}
                      disabled={true}
                      isRequired={true}
                      onChange={this.handleCRtitle}
                      refElement={this.inputTotalPOValue} onBlur={undefined}
                    />
                  </div>
                        <div className="col-md-3 my-2">
                    <InputText
                      type='text'
                      label={`Available Balance ${this.state.currencySymbols ? ` (${this.state.currencySymbols})` : ''}`}
                      name={"AvailableBalance"}
                      value={this.state.AvailableBalance}
                      disabled={true}
                      isRequired={true}
                      onChange={this.handleCRtitle}
                      refElement={this.inputAvailableBalance} onBlur={undefined}
                    />
                  </div>
                     <div className="col-md-3 my-2">
                    <InputText
                      type='text'
                      InpuId='txtInvoicedAmount'
                      label={`Invoiced Amount ${this.state.currencySymbols ? ` (${this.state.currencySymbols})` : ''}`}
                      name={"Invoiced Amount"}
                      value={this.state.InvoicedAmount}
                      disabled={this.state.isEditMode && this.state.Receivedflag=='Received'}
                      isRequired={true}
                      onChange={this.handleNumericChange}
                      refElement={this.inputInvoicedAmount} onBlur={undefined}
                    />
                  </div>
                   <div className="col-md-3 my-2">
                    <InputText
                      type='text'
                      label={"Invoice Number"}
                      name={"InvoicedNumber"}
                      value={this.state.InvoiceNumber}
                      disabled={this.state.isEditMode && this.state.Receivedflag=='Received'}
                      isRequired={true}
                      onChange={this.handleinvoicenumber}
                      refElement={this.inputInvoiceNumber} onBlur={undefined}
                    />
                  </div>                       
                                 <div className="col-md-3 my-2">
                                            <div className="light-text c-people-picker">
                                             <label className='lblPeoplepicker'>Submitted By <span className="mandatoryhastrick">*</span></label>
                                              <div className="" id="divPeopleUser">
                                              <PeoplePicker
                                                context={this.props.context}
                                                titleText=""
                                                personSelectionLimit={1}
                                                showtooltip={false}
                                                disabled={true}
                                                ensureUser={true}
                                                onChange={(items) => this._getPeoplePickerItems(items, 'SalesPerson')}
                                                defaultSelectedUsers={this.state.SubmittedEmail}
                                                principalTypes={[PrincipalType.User]}
                                                ref={this.inputSubmittedName}
                        
                                              />
                                              </div>
                                            </div>
                                          </div>
                                      <div className="col-md-3 my-2">
                    <div className="light-text div-readonly">
                      <label className="z-in-9">Invoiced Date<span className="mandatoryhastrick">*</span></label>
                      <div className="custom-datepicker" id="DivInvoicedDate">
                        <DatePicker onDatechange={(date: any)=>this.handleDateChange(date,'InvoicedDate')} name={"Invoiced Date"}  ref={this.InvoicedDate} isDisabled={this.state.isEditMode && this.state.Receivedflag=='Received'} placeholder="MM/DD/YYYY" endDate={new Date()} selectedDate={this.state.InvoicedDate} maxDate={new Date()} id={'txtInvoicedDate'} title={"Invoiced Date"} />
                      </div>
                    </div>
                  </div>
                       <div className="col-md-3 my-2">
                        <div className="light-text">
                        <label >Invoice Status<span className="mandatoryhastrick">*</span></label>
                        <select className="form-control" required={true}  name="InvoiceStatus"  value={this.state.InvoiceStatus} onChange={this.handleProjectstatus} disabled={this.state.isEditMode && this.state.Receivedflag=='Received'}  title="InvoiceStatus" itemRef='InvoiceStatus' ref={this.inputInvoiceStatus}>
                         
                          <option value=''>None</option>
                          <option value='Invoiced'>Invoiced</option>   
                          <option value='Received'>Received</option>
                        </select>
                    
                        </div>
                    </div>
                     <div className="col-md-3 my-2">
                    <div className="light-text div-readonly">
                      <label className="z-in-9">Payment Date {this.state.InvoiceStatus=='Received' &&(<span className="mandatoryhastrick">*</span>)}</label>
                      <div className="custom-datepicker" id="DivPaymentDate">
                        <DatePicker onDatechange={(date: any)=>this.handleDateChange(date,'PaymentDate')} name={"PaymentDate"}   ref={this.inputPaymentDate} placeholder="MM/DD/YYYY" endDate={new Date()} selectedDate={this.state.PaymentDate} disabled={this.state.isEditMode && this.state.Receivedflag=='Received'} readonly={this.state.isEditMode && this.state.Receivedflag=='Received'} maxDate={new Date()} id={'txtPaymentDate'} title={"Payment Date"} />
                      </div>
                    </div>
                  </div>

                                </div>
                                    <div className="row pt-2 px-2">
                  <div className="col-md-12">
                    <div className="light-text">
                      <label>Reason</label>
                      <textarea className="form-control requiredinput" disabled={this.state.isEditMode && this.state.Receivedflag=='Received'} value={this.state.Remarks} placeholder="" id="txtTargetDescription" onChange={this.handleReason} name="Remarks" ref={this.inputRemarks} ></textarea>
                    </div>
                  </div>
                </div>
                <div className="row pt-2 px-2">
                  <div className="col-md-12">
                    <FileUpload ismultiAllowed={true} disabled={this.state.isEditMode && this.state.InvoiceStatus=='Received'} readOnly={this.state.isEditMode && this.state.Receivedflag=='Received'} readonly={this.state.isEditMode && this.state.Receivedflag=='Received'} onFileChanges={this.filesChanged} isnewForm={!this.state.DynamicDisabled} files={[this.state.fileArr, this.state.delfileArr]} />
                  </div>
                </div>
               
              
                <span className="text-validator" id="spanErrorMessage">{this.state.errorMessage}</span>
                <div className="row mx-1" id="">
                  <div className="col-sm-12 text-center my-4" id="">

                    {this.state.Receivedflag!=='Received' &&(
                    <button type="button" id="btnSubmit" className="SubmitButtons btn" onClick={this.SubmitData} >{this.state.SaveUpdateText}</button>
                    )}
                    <button type="button" id="btnCancel" className="CancelButtons btn" onClick={this.handleCancel} >Cancel</button>
                  </div>
                </div>

                 {(this.state.History.length > 0 ) && (
                  <div className="row justify-content-md-left mt-4">
                 
                    <div className="col-md-12">
                      
                      <div className="p-rel">
                        <h6 className="p-2 mb-0 c-bg-title">PO History - {this.state.PONumber} ({this.state.currencySymbols}{this.state.TotalPOValue})</h6>
                      </div>
                      {/* <h6 className="mb-2">Comments History</h6> */}
                      <div className="px-2">
                        <table className="table border mt-2">
                          <thead>
                            <tr>
                              <th>sl.No</th>
                              <th>Invoice Number</th>
                              <th>Invoiced Date</th>
                              <th> Available Balance </th>
                              <th>Invoiced Amount</th>
                              <th>Submitted By</th>
                              <th>Status</th>
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

                )}
               {!this.state.islocationconfigured&& this.configurationValidtion()}


      </React.Fragment>

    )
  }
  }
}


export default InvoiceForm;


