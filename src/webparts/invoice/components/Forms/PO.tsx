
import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
import DatePicker from '../Shared/DatePickerField';
import ModalPopUp from '../Shared/ModalPopUp';
import FileUpload from '../Shared/FileUpload';
import InputText from '../Shared/InputText';
import { ControlType } from '../Utilities/Constants';
import formValidation from '../Utilities/Formvalidator';
import { Navigate } from 'react-router-dom';
import DateUtilities from '../Utilities/Dateutilities';
import { showToast } from '../Utilities/toastHelper';
import { showLoader,hideLoader } from '../Shared/Loader';
import UnAuthorized from '../Shared/UnAuthorized.Component';






// import DatePicker from 'react-datepicker';


export interface IPOProps {
  match: any;
  spContext: any;
  spHttpClient: SPHttpClient;
  context: any;
  history: any;
}
interface POHistory {
  PONumber: string;
  POCategory: string;
  AvailableProposalBalance:number;
  POValue: string;
  SubmittedDate:string | null;
  Author: string;
}
export interface IPOState {

}
class PO extends React.Component<IPOProps, IPOState> {
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
        isAdmin: false,
    isPermissionChecked:false,
    isEditMode: false,
    History: [] as POHistory[],
    Location: '',
    Locations: [],
   

    ClientNames: [],
    ClientName: '',
    ProjectName: '',
    ProjectNames: [],
    ClientId: '',
    ProposalId: '',

    IsBulkVariablecheck: false,
    TotalProposalValue: 0,
    AvailableBalance: 0,

    POValue: '',


   
    
    ProposalFor: '',
    POType: '',
    Proposals: [],
    TitleoftheProposal: '',
    TitleOfProposals: [],
    fileArr: [],
    delfileArr: [],
    Homeredirect: false,
    DynamicDisabled: false,
    Title: '',
    Estimations: [],
    Estimation: '',
    EstimationTitle: '',
    Attachment: [],
    RecievedDate: null,
    EffectiveFrom:null,
    EffectiveTo:null,
    PONumber: '',
    Remarks: '',
    IsActive: true,
    SaveUpdateText: 'Submit',
    addNewProgram: false,
    ItemID: 0,
    isUnAuthorized:false  




  };
  private inputLocation: React.RefObject<HTMLSelectElement>;
  inputClientName: React.RefObject<HTMLSelectElement>;
  inputProposalFor: React.RefObject<HTMLSelectElement>;
  inputPOType: React.RefObject<HTMLSelectElement>;
  inputProposalTitle: React.RefObject<HTMLSelectElement>;
  inputTitleoftheProject: React.RefObject<HTMLSelectElement>;
  private PONumber: React.RefObject<HTMLInputElement>;
  private POValue: React.RefObject<HTMLInputElement>;
  private TotalProposalValue: React.RefObject<HTMLInputElement>;
  private AvailableBalance: React.RefObject<HTMLInputElement>;
  private inputReceviedDate: React.RefObject<HTMLInputElement>;
    private inputEffectiveFrom: React.RefObject<HTMLInputElement>;
    private inputEffectiveTo: React.RefObject<HTMLInputElement>;
  private inputRemarks: React.RefObject<HTMLTextAreaElement>;
  
 




  constructor(props: any) {
    super(props);
    sp.setup({
      spfxContext: this.props.context
    })

    this.inputLocation = React.createRef<HTMLSelectElement>();
    this.inputPOType = React.createRef<HTMLSelectElement>();
    this.inputClientName = React.createRef<HTMLSelectElement>();
    this.inputProposalFor = React.createRef<HTMLSelectElement>();
    this.inputProposalTitle = React.createRef<HTMLSelectElement>();
    this.inputTitleoftheProject = React.createRef<HTMLSelectElement>();
    this.inputReceviedDate = React.createRef<HTMLInputElement>();
    this.inputEffectiveFrom = React.createRef<HTMLInputElement>();
    this.inputEffectiveTo = React.createRef<HTMLInputElement>();
    this.PONumber = React.createRef<HTMLInputElement>();
    this.POValue = React.createRef<HTMLInputElement>();
    this.inputRemarks = React.createRef<HTMLTextAreaElement>();
   



  }

  public async componentDidMount() {
    showLoader();
      await this.checkpermisssion();
    await this.getEstimationsListData();
          this.getCurrentUserGroups();

    if (this.props.match.params.id != undefined) {

      this.setState({ isEditMode: true });
      let ItemID = this.props.match.params.id
      this.getOnclickdata(ItemID);
    }
    else {
      document.getElementById('ddlocation')?.focus();
      this.setState({ isEditMode: false });
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


    sp.web.lists.getByTitle('PODetails').items.getById(ItemID).select('Title',
      'Title',
      'ProposalFor',
      'PONumber',
      'POCategory',
      'POType',
      'SubmittedDate',
      'EffectiveFrom',
      'Remarks',
      'EffectiveTo',
      'POValue',
      'ClientName',
      'ProjectTitle',
      'ProposalTitle',
      'AvailableProposalBalance',
      'TotalProposalValue',
      'ProposalID',
      'ClientID',


      'Id').get().then((Response) => {
     
        this.setState({

          addNewProgram: true,
          Location: Response.ProposalFor,
          ClientName: Response.ClientName,
           ProjectName : Response.ProjectTitle,
           
          TitleoftheProposal: Response.ProposalTitle,
          PONumber: Response.PONumber,
          ProposalFor: Response.POCategory,
          TotalProposalValue: Response.TotalProposalValue,
          AvailableBalance: Response.AvailableProposalBalance,
          
          RecievedDate: Response.SubmittedDate,
          EffectiveFrom: Response.EffectiveFrom,
          EffectiveTo: Response.EffectiveTo,
          POValue: Response.POValue,
          POType: Response.POType,
          SaveUpdateText: 'Update',
          errorMessage: "",
          ClientId:Response.ClientID,
          ProposalId:Response.ProposalID

        })
        this.Pohistory(Response.ProposalID)
        this.fetchClientsBasedOnLocation(Response.ProposalFor, Response.ClientName);
         this.fetchProjetsbasedonClientName(Response.ClientName,Response.ProjectTitle);
           this.fetchTitleofProposalBasedOnProjects(Response.ProjectTitle, Response.ProposalTitle);
          this.fetchPocategoryBasedOnproposals(Response.ProposalTitle,Response.POCategory);
    


      })


    let files = await sp.web.lists.getByTitle('PODocs').items.filter('RecordID eq ' + ItemID).expand('File').get()
    let filesArry: { URL: any; IsDeleted: boolean; IsNew: boolean; name: any; FileID: any; }[] = [];
    files.map((selItem: any, index: any) => {
      let name = selItem.File.Name;
      var fileUrl = selItem.File.ServerRelativeUrl;
      let obj = { URL: fileUrl, IsDeleted: false, IsNew: false, name: name, FileID: selItem.Id };
      filesArry.push(obj);
    });
    this.setState({ fileArr: filesArry })
  }

  private Pohistory = (ProposalID: any) => {
    sp.web.lists.getByTitle('PODetails').items.expand('Author').select('Author/Title,*').filter(`ProposalID eq ${ProposalID}`).get().then((Response: any[]) => {
      console.log(Response);
      if (Response.length > 0) {
        this.setState({ History: Response });
      } else {
        this.setState({ History: [] });
      }
    });
  }

  handleDateChange = (date: any,fieldName:string) => {
    if(fieldName === 'ReceivedDate') {
    this.setState({ RecievedDate: date[0] });
    }
    else if(fieldName === 'EffectiveFrom') {
        this.setState({ EffectiveFrom: date[0] });
        }
    else if(fieldName === 'EffectiveTo') {
        this.setState({ EffectiveTo: date[0] });
        }
  };


  private handleChange = (event: any) => {
    let returnObj: any = {};
    if (event.target.name === 'Location') {
      // Reset all dropdowns to "None"
      this.setState({
        Location: '',          // Set Location to "None"
        ClientName: '',        // Reset Client dropdown
        ProposalFor: '',
        TitleoftheProposal: '',     // Reset Project dropdown
        ClientNames: [],       // Clear client options
        ProjectNames: [],
        TitleOfProposals: [],
        Proposals: [],
        IsBulkVariablecheck: false, // Reset IsBulkVariablecheck
        
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



  private handleTitleOfProposal = (event: any) => {

    const selectedLabel = event.target.options[event.target.selectedIndex].text;
    const selectedId = event.target.value;


    let returnObj: any = {};

    if (event.target.name === 'ProjectName') {
      returnObj.originalProjectName = selectedId;
      // Reset all dropdowns to "None"

      this.setState({
 
        ProposalFor: '',
        TitleoftheProposal: '',            

        TitleOfProposals: [],
        Proposals: [],
        IsBulkVariablecheck: false, // Reset IsBulkVariablecheck



        });
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
 private handlePoCategory = (event: any) => {
      let returnObj: any = {};
   const selectedLabel = event.target.options[event.target.selectedIndex].text;
    const selectedId = event.target.value;
    console.log(selectedLabel,selectedId);
    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
    if (event.target.name === 'TitleoftheProposal') {
      this.setState({
        ProposalFor: '', 
        Proposals: [], 
        history: [], // Reset history
        IsBulkVariablecheck: false
      });
      this.fetchPocategoryBasedOnproposals(selectedLabel,'');
      this.fetchProposalId(selectedLabel);
      this.fetchAvailableBalance(selectedLabel);

    }
}

  private handlePoType = (event: any) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });

  }

 private fetchAvailableBalance = (selectedLabel: string) => {
    const Podetailslist = 'PODetails';
    sp.web.lists.getByTitle(Podetailslist).items.filter(`ProposalTitle eq '${selectedLabel}' and ClientName eq '${this.state.ClientName}' and ProposalFor eq '${this.state.Location}'`).select('AvailableProposalBalance','TotalProposalValue').orderBy('Modified',false).top(1).get().then((Response: any[]) => {
      console.log(Response);
      // Response.sort((a, b) => newDate(b.modified).getTime()-newDate(a.modified).getTime()); // Sort by Id in descending order
      if (Response.length > 0) {
        this.setState({ AvailableBalance: Response[0].AvailableProposalBalance || 0 });
      } 
    });
 }

  private fetchProposalId = async (selectedClientName: string) => {

    const TrList = 'ProposalDetails';
  await  sp.web.lists.getByTitle(TrList).items.select("ID", "Proposal").filter(`Proposal eq '${selectedClientName}'`).get().then((Response: any[]) => {
      console.log(Response);
      if (Response.length > 0) {
        this.setState({ ProposalId: Response[0].ID });
      } else {
        this.setState({ ProposalId: '' });
      }
    });
    this.Pohistory(this.state.ProposalId); // Fetch history based on the ProposalId
  }
 
    private fetchPocategoryBasedOnproposals = async (selectedLabel: string,selectedpocategory:string) => {
   
    await sp.web.lists.getByTitle('ProposalDetails').items.filter(`Proposal eq '${selectedLabel}' and ProposalFor eq '${this.state.Location}' and Title eq '${this.state.ProjectName}'`).select('ProposalType','IsBulkProposal','Amount').get().then((Response: any[]) => {
      console.log(Response);
     
      const ProposalOptions = Response.map(item => ({
        label: item.ProposalType,
        value:  item.ProposalType 
      }));
      const{isEditMode}= this.state;
      this.setState({
        Proposals: Response[0].ProposalType ? ProposalOptions : [],
            TotalProposalValue: Response[0].IsBulkProposal? (Response[0].Amount || '') : '', // Set TotalProposalValue based on the response
          //  AvailableBalance:isEditMode==false? Response[0].IsBulkProposal? (Response[0].Amount || '') : '':'',
       AvailableBalance:this.state.isEditMode?this.state.AvailableBalance: (!this.state.AvailableBalance && Response[0].IsBulkProposal )? (Response[0].Amount || ''): this.state.AvailableBalance,
         IsBulkVariablecheck: [null,undefined].includes(Response[0].IsBulkProposal)?false:Response[0].IsBulkProposal, // Set Proposals based on the response
         ProposalFor: isEditMode ? selectedpocategory : Response[0].ProposalType, // Set the selected proposal category if provided
             
      });
       

     });

   
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
        await sp.web.getFolderByServerRelativeUrl(siteAbsoluteURL + "/PODocs").files.add(file.name, file, true);
        const item1 = await sp.web.getFileByServerRelativePath(siteAbsoluteURL + "/PODocs/" + file.name).getItem();

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
    let list = sp.web.lists.getByTitle("PODocs");
    if (this.state.delfileArr.length > 0) {
      this.state.delfileArr.map((selItem, index) => {
        let itemId = selItem['FileID'];
        list.items.getById(itemId).delete();
      });
    }
  }

  private SubmitData = () => {
    let data = {
      location: { val: this.state.Location, required: true, Name: 'Location', Type: ControlType.string, Focusid: this.inputLocation },
      ClientName: { val: this.state.ClientName, required: true, Name: 'Client Name', Type: ControlType.string, Focusid: this.inputClientName },
       ProjectTitle: { val: this.state.ProjectName, required: true, Name: 'Project', Type: ControlType.string, Focusid: this.inputTitleoftheProject },
      ProposalTitle: { val: this.state.TitleoftheProposal, required: true, Name: 'Proposal', Type: ControlType.string, Focusid: this.inputProposalTitle },
      PONumber: { val: this.state.PONumber, required: true, Name: 'PO Number', Type: ControlType.string, Focusid: this.PONumber },
      //  POCategory: { val: this.state.ProposalFor, required: true, Name: 'ProposalFor', Type: ControlType.string, Focusid: this.inputProposalFor },
         POValue: { val: this.state.POValue, required: true, Name: 'PO Value', Type: ControlType.string, Focusid: this.POValue },
      POType: { val: this.state.POType, required: true, Name: 'PO Type', Type: ControlType.string, Focusid: this.inputPOType },
      SubmittedDate: { val: this.state.RecievedDate, required: true, Name: 'Received Date', Type: ControlType.date, Focusid: 'DivReceivedDate' },
      EffectiveFrom: { val: this.state.EffectiveFrom, required: true, Name: 'Effective From', Type: ControlType.date, Focusid: 'DivEffectiveFrom' },
      EffectiveTo: { val: this.state.EffectiveTo, required: true, Name: 'Effective To', Type: ControlType.date, Focusid: 'DivEffectiveTo' },
    
    
     
      Attachment: { val: this.state.fileArr, required: true, Name: '', Type: ControlType.file }
     

       

    }
    if(this.state.IsBulkVariablecheck==true){
       const POValue = parseInt(this.state.POValue);
  const AvailableBalance = (this.state.AvailableBalance);
        if (POValue > AvailableBalance) {
    // Set error message or handle the validation failure
    this.setState({
      errorMessage: "PO Value cannot be more than Available Balance."
      // showToast('error', "PO Value cannot be more than Available Balance.")
    });
     if (this.POValue && this.POValue.current) {
    this.POValue.current.classList.add('mandatory-FormContent-focus');
  }
    return;
   }
      else{
        this.setState({ errorMessage:''});
         if (this.POValue && this.POValue.current) {
    this.POValue.current.classList.remove('mandatory-FormContent-focus');
  }
      }
    }
    let isValid = formValidation.checkValidations(data);

    var formdata = {
       Title: this.state.PONumber,
       ProposalFor:this.state.Location,
       PONumber: this.state.PONumber,
       POCategory: this.state.ProposalFor,
       POType: this.state.POType,
       SubmittedDate:this.state.RecievedDate,
       EffectiveFrom:this.state.EffectiveFrom,
       EffectiveTo:this.state.EffectiveTo,
       POValue:this.state.POValue? parseFloat(this.state.POValue):0,
       Remarks: this.state.Remarks,
       ClientName: this.state.ClientName,
       ProjectTitle: this.state.ProjectName,
       ProposalTitle: this.state.TitleoftheProposal,
       ProposalID:this.state.isEditMode?this.state.ProposalId : this.state.ProposalId.toString(),
       ClientID:this.state.isEditMode?this.state.ClientId: this.state.ClientId.toString(),
       AvailableProposalBalance:(this.state.AvailableBalance) ||null ,
       TotalProposalValue:(this.state.TotalProposalValue) ||null,
       Status: 'In-Progress',
  
  


    }


    if (isValid.status) {
              if(this.state.IsBulkVariablecheck==true){
              let availableBalanceAfterCalculation = this.state.AvailableBalance - parseInt(this.state.POValue);
              formdata.AvailableProposalBalance = availableBalanceAfterCalculation;
              }

          
              this.checkDuplicates(formdata);
    }
    else
    {
      showToast('error', isValid.message);
    }
      // this.setState({ errorMessage: isValid.message });

  }
  private checkDuplicates = (formData: any) => {
    let TrList = 'PODetails';
    var filterString;
    try {
      if (this.state.ItemID == 0)
        filterString = `PONumber eq '${formData.PONumber}'`;
      else
        filterString = `PONumber eq '${formData.PONumber}' and Id ne ${this.state.ItemID}`;
      sp.web.lists.getByTitle(TrList).items.filter(filterString).get().
        then((response: any[]) => {
          if (response.length > 0){
            showToast('error',"'PO Number' already exists");
            // this.setState({ errorMessage: 'Duplicate record not accept' });
          }
          else
          //  this.setState({ errorMessage: '' });
            this.insertorupdateListitem(formData);
        });
    }
    catch (e) {
      this.onError();
      console.log(e);
    }
    // return findduplicates
  }
  // private insertorupdateListitem = (formData:any) => {
  //   this.setState({ loading: true });
  //     try{
  //       showLoader();
  //       let ProposalData={
  //       IsEstimationTagged:true
  //       }
  //     if (this.state.ItemID == 0) { 
        
  //       sp.web.lists.getByTitle('PODetails').items.add(formData)

  //         .then((res) => {
  //          this.AddorUpdatelistItem(res.data.Id);
  //        //   this.onSucess();
  //           //console.log(res);
  //         }, (Error) => {
  //           console.log(Error);
  //           this.onError();
  //         })
  //         .catch((err) => {
  //           console.log(Error);
  //           this.onError();
  //         });
     
  //   }
  //   else {
  //         sp.web.lists.getByTitle('PODetails').items.getById(this.state.ItemID).update(formData).then((res) => {
  //           this.AddorUpdatelistItem(this.state.ItemID)
  //           this.onUpdateSucess();          
  //         }, (Error) => {
  //           console.log(Error);
  //           this.onError();
  //         }).catch((err) => {
  //           this.onError();
  //           console.log(err);
  //         });
  //       }
      
  //     }catch(e){
  //       console.log("Error in Adding data",e)
  //     }finally{
  //       hideLoader();
  //     }
  // }



private insertorupdateListitem = async (formData: any) => {
    this.setState({ loading: true });
   try{
       showLoader();
        let ProposalData={
        IsProposalTagged:true   
   }
     if (this.state.ItemID == 0) { 
         let [PoResponse,ProposalResp] = await Promise.all([ sp.web.lists.getByTitle('PODetails').items.add(formData),
          sp.web.lists.getByTitle('ProposalDetails').items.getById(formData.ProposalID).update(ProposalData)]);
            this.AddorUpdatelistItem(PoResponse.data.Id);
            console.log(ProposalResp);
           this.onSucess();
            //console.log(res);
     }
     else {
            let [PODetailsResp,ProposalResp] = await Promise.all([ sp.web.lists.getByTitle('PODetails').items.getById(this.state.ItemID).update(formData),
              sp.web.lists.getByTitle('ProposalDetails').items.getById(formData.ProposalID).update(ProposalData)]);
              this.AddorUpdatelistItem(this.state.ItemID)
              this.onUpdateSucess();  
              console.log(ProposalResp);
              console.log(PODetailsResp);
            }
  }
   catch(e){
     console.log(e);
   } finally{
     hideLoader();
   }
}









  private handleCancel = () => {
    this.setState({ Homeredirect: true, ItemID: 0, errorMessage: "" });
  }


  private onSucess = () => {
    showToast('success', 'PO Details submitted successfully');

     this.setState({ showHideModal: false,Homeredirect:true,addNewProgram:false, loading: false, isSuccess: true, ItemID: 0,errorMessage: "" });

    // this.setState({ modalTitle: 'Success', modalText: 'Estimation submitted successfully', showHideModal: true, loading: false, isSuccess: true, ItemID: 0, errorMessage: "" });
  }
  private onUpdateSucess = () => {
    showToast('success', 'PO Details updated successfully');
        this.setState({ showHideModal: false,Homeredirect:true,addNewProgram:false, loading: false, isSuccess: true, ItemID: 0,errorMessage: "" });
    // this.setState({ modalTitle: 'Success', modalText: 'Estimation updated successfully', showHideModal: true, loading: false, isSuccess: true, ItemID: 0, errorMessage: "" });
  }
  private onError = () => {
     showToast('error', 'Sorry! something went wrong');
    // this.setState({

    //   loading: false, modalTitle: 'Error', modalText: 'Sorry! something went wrong', showHideModal: true, isSuccess: false, ItemID: 0, errorMessage: ""
    // });
  }


 

  private fetchTitleofProposalBasedOnProjects = (selectedLabel: string, selectedproposal: string) => {

    const EstimationsList = 'ProposalDetails';
    sp.web.lists.getByTitle(EstimationsList).items.filter(`Title eq '${selectedLabel}' and ClientName eq '${this.state.ClientName}'  and Status eq 'Approved' `).select('Proposal', 'Id','IsBulkProposal').get().then((Response: any[]) => {
      console.log(Response);

      const { isEditMode } = this.state;
      const ProposalOptions = Response.map(item => ({
        label: item.Proposal,
        value:  item.Proposal
      }));
      this.setState({
        // Set IsBulkVariablecheck based on the response
        TitleOfProposals: ProposalOptions,
        TitleoftheProposal: isEditMode ? selectedproposal : '', // Set the selected proposal title if provided

      });
    });

  }

  // private fetchProjectsBasedOnProposalfor = (selectedProposal: string, selectedproject: string) => {

  //   let SelectedClientName: string


  //   if (this.state.isEditMode == false) {
  //     let Client = document.getElementById("clientName") as HTMLSelectElement;
  //     SelectedClientName = Client.options[Client.selectedIndex].text;
  //   }
  //   else {
  //     SelectedClientName = this.state.ClientName;
  //   }


  //   const EstimationsList = 'Estimations';
  //   sp.web.lists.getByTitle(EstimationsList).items.select("Id", "TitleOfTheProject", 'ClientName/Title',
  //     'ClientName/Id').expand("ClientName").filter(`EstimationFor eq '${selectedProposal}' and ClientName/Title eq '${SelectedClientName}' and EstimationStatus eq 'Submitted' and Status ne 'Rejected'`).get().then((Response: any[]) => {
  //       console.log(Response);
  //       const { isEditMode } = this.state;
  //       const projectOptions = Response.map(item => ({
  //         label: item.TitleOfTheProject,
  //         value: isEditMode ? item.TitleOfTheProject : item.Id
  //       }));
  //       this.setState({
  //         ProjectNames: projectOptions,
  //         ProjectName: selectedproject ?? '',
  //         isConsultantSelected: selectedProposal === 'Consultant' // Set isConsultantSelected based on the selected proposal
  //         // Set the selected project name if provided
  //       });
  //     });

  // }
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
        ProposalFor: '',
        TitleoftheProposal: '',
        ProjectNames: [],
        TitleOfProposals: [],
        Proposals: [],
        EstimationHours: '',
        ProjectName: '', // Reset Project dropdown
        IsBulkVariablecheck:false, // Reset IsBulkVariablecheck

       
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
  private fetchProjetsbasedonClientName = (selectedClientName: string,selectedproject:string) => {
     const ProposalList = 'ProposalDetails';
    sp.web.lists.getByTitle(ProposalList).items.select("Id", "Title")
      .filter(`ClientName eq '${selectedClientName}' and ProposalFor eq '${this.state.Location}' and Status eq 'Approved'`).get().then((Response: any[]) => {
        console.log(Response);
       const { isEditMode } = this.state;
             const uniqueTitles = Array.from(new Set(Response.map(item => item.Title)));
       const Projectoptions=  uniqueTitles.map(title => ({
          label:title,
          value:title
        }));
         this.setState({
        ProjectNames: Projectoptions,
        ProjectName:isEditMode ? selectedproject : '', // Set the selected project name if provided
      

      

      });
      
      });
  }

 

  handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
      const regex = /^\d{0,10}(\.\d{0,2})?$/;
    // Allow only digits
    if (regex.test(value)) {
      this.setState({ POValue: value });
    }
  };
 private async getCurrentUserGroups(){
    try {
      const currentUser = await sp.web.currentUser.get();
      const userGroups = await sp.web.currentUser.groups.get();
 
       const isAdmin = userGroups.some(g => g.Title === 'P&I Administrators');
      const isBilling = userGroups.some(g => g.Title === 'Billing Team');
      const isSales = userGroups.some(g => g.Title === 'Sales Team');
      const isDev = userGroups.some(g => g.Title === 'Dev Team'); 
      //     const hasFullAccess = isAdmin || isBilling || isSales;
      //  const canSeeSubmitButton = hasFullAccess;
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



 private handlePoNumber = (event:any) => {
    let returnObj: Record<string, any> = {};
    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
  }
private restricthandlePoNumber = (event: any) => {
  let returnObj: Record<string, any> = {};
  const poNumberValue = event.target.value;

  // Regular expression to allow only alphanumeric characters (numbers and letters)
  const alphanumericRegex = /^[a-zA-Z0-9]*$/;

  // Check if the PO number matches the alphanumeric pattern
  if (poNumberValue && !alphanumericRegex.test(poNumberValue)) {
    // If not valid, prevent the change
    return;
  }

  // Proceed if the value is valid
  if (event.target.name !== 'IsActive') {
    returnObj[event.target.name] = poNumberValue;
  } else {
    returnObj[event.target.name] = event.target.checked;
  }

  this.setState(returnObj);
};

  private handleReason = (event:any) => {
        let returnObj: any = {};
        if (event.target.name != 'IsActive')
          returnObj[event.target.name] = event.target.value;
        else
          returnObj[event.target.name] = event.target.checked;
        this.setState(returnObj);
    
      }

  private filesChanged = (selectedFiles: any) => {
    this.setState({ fileArr: selectedFiles[0], delfileArr: selectedFiles[1] });
  }

  _getPeoplePickerItems = (items: any, type: string) => {

    let SubmittedById: any;
    // items.forEach((item: any) => { SubmittedById.push(item.id) });
     SubmittedById  =items[0].id;
    this.setState({ SubmittedById: SubmittedById });


    // Store selected users in state
  };

  private BindComments = () => {
    let rows = (this.state.History || []).map((item:any, index) => {
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{item.PONumber}</td>
          <td>{item.POCategory}</td>
          <td>{item.AvailableProposalBalance}</td>
          <td>{item.POValue}</td>
          <td>{DateUtilities.getDateMMDDYYYY(item.SubmittedDate)}</td>
          <td>{item.Author.Title}</td>
        </tr>
      );
    });
    return rows;

  }











  render() {
//        if (!this.state.isPermissionChecked || !this.state.isAdmin) {
//   const navIcon = document.querySelector('.click-nav-icon') as HTMLElement;
//   if (navIcon) {
//     navIcon.style.display = 'none';
//   }
// }

//     if(!this.state.isPermissionChecked){
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
      let url = `/PO_View`;
      return <Navigate to={url} />;
    }

    else{



    return (

      <>

        <ModalPopUp title={this.state.modalTitle} modalText={this.state.modalText} isVisible={this.state.showHideModal} onClose={this.handleClose} isSuccess={this.state.isSuccess}></ModalPopUp>
          <div className='container-fluid'>
        <div className='FormContent'>
          <div className='title'> PO Details

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
                    <select className="form-control" id='ddlocation' required={true} name="Location" value={this.state.Location} onChange={this.handleChange} disabled={(this.state.isEditMode || this.state.Locations.length === 1)} title="Location" itemRef='Location' ref={this.inputLocation}>
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
                   
                      <select className="form-control" required={true} name="ProjectName" value={this.state.ProjectName} disabled={this.state.isEditMode} onChange={this.handleTitleOfProposal} title="ProjectName" itemRef='ProjectName' ref={this.inputTitleoftheProject}>
                        <option value=''>None</option>
                        {this.state.ProjectNames.map((ProjectName: any, index: any) => (
                          <option key={index} value={ProjectName.label}>{ProjectName.label}</option>
                        ))}

                      </select>

                
                  </div>
                </div>
                  <div className="col-md-3">
                    <div className="light-text">
                      <label >Project Proposal<span className="mandatoryhastrick">*</span></label>          
                   
                        <select className="form-control" required={true} onChange={this.handlePoCategory} name="TitleoftheProposal" disabled={this.state.isEditMode} value={this.state.TitleoftheProposal} title="TitleoftheProposal"  itemRef='TitleoftheProposal' ref={this.inputProposalTitle}>
                          <option value=''>None</option>
                          {this.state.TitleOfProposals.map((TitleOfProposal: any, index: any) => (
                            <option key={index} value={TitleOfProposal.Id}>{TitleOfProposal.label}</option>
                          ))}

                        </select>

                 
                    </div>
                  </div>
              
                      <div className="col-md-3 mt-2">
                    <InputText
                      type='text'
                      label={"PO Number"}
                      name={"PONumber"}
                      value={this.state.PONumber}
                      disabled={this.state.isEditMode}
                      isRequired={true}
                      onChange={this.restricthandlePoNumber}
                      refElement={this.PONumber} onBlur={undefined}
                    />
                  </div>
    
                    <div className="col-md-3 mt-2">
                        <div className="light-text">
                        <label >PO Category<span className="mandatoryhastrick">*</span></label>
                        <select className="form-control" required={true}  name="ProposalFor"  value={this.state.ProposalFor} onChange={this.handleChange} disabled={this.state.isEditMode} title="ProposalFor" itemRef='ProposalFor' ref={this.inputProposalFor}>
                         
                          {this.state.Proposals.map((TitleOfProposal: any, index: any) => (
                            <option key={index} value={TitleOfProposal.label}>{TitleOfProposal.label}</option>
                          ))}

                        </select>
                    
                        </div>
                    </div>
                    {this.state.IsBulkVariablecheck==true && (
                    <div className="col-md-3 mt-2">
                         <InputText
                      type='text'
                      label={"Total Proposal Value"}
                      name={"TotalProposalValue"}
                      value={this.state.TotalProposalValue}
                      disabled={true}
                      isRequired={true}
                      onChange={this.handlePoNumber}
                      refElement={this.TotalProposalValue} onBlur={undefined}
                    />
                    </div>
                    )}
                    {this.state.IsBulkVariablecheck==true && (
                    <div className="col-md-3 mt-2">
                         <InputText
                      type='text'
                      label={"Available Balance"}
                      name={"AvailableBalance"}
                      disabled={true}
                      value={this.state.AvailableBalance}
                      isRequired={true}
                      onChange={this.handlePoNumber}
                      refElement={this.AvailableBalance} onBlur={undefined}
                    />
                    </div>
                    )}

                       <div className="col-md-3 mt-2">
                    <InputText
                      type='text'
                      label={"PO Value"}
                      name={"POValue"}
                      value={this.state.POValue}
                      disabled={this.state.isEditMode}
                      isRequired={true}
                      onChange={this.handleNumericChange}
                      refElement={this.POValue} onBlur={undefined}
                    />
                  </div>
                    
                    <div className="col-md-3 mt-2">
                        <div className="light-text">
                        <label >PO Type<span className="mandatoryhastrick">*</span></label>
                        <select className="form-control" required={true}  name="POType"  value={this.state.POType} onChange={this.handlePoType} disabled={this.state.isEditMode} title="POType" itemRef='POType' ref={this.inputPOType}>
                         
                          <option value=''>None</option>
                          <option value='One-time'>One-time</option>
                          <option value='Monthly'>Monthly</option>
                          <option value='Yearly'>Yearly</option>

                        </select>
                    
                        </div>
                    </div>
                   
                   
                  <div className="col-md-3 mt-2">
                    <div className="light-text div-readonly">
                      <label className="z-in-9">Received Date<span className="mandatoryhastrick">*</span></label>
                      <div className="custom-datepicker" id="DivReceivedDate">
                        <DatePicker onDatechange={(date: any)=>this.handleDateChange(date,'ReceivedDate')}  isDisabled={this.state.isEditMode} ref={this.inputReceviedDate} placeholder="MM/DD/YYYY" selectedDate={this.state.RecievedDate} id={'txtSubmitteddate'} title={"Received Date"} />
                      </div>
                    </div>
                  </div>
                  
                 
                       
                  <div className="col-md-3 mt-2">
                    <div className="light-text div-readonly">
                      <label className="z-in-9">Effective From<span className="mandatoryhastrick">*</span></label>
                      <div className="custom-datepicker" id="DivEffectiveFrom">
                        <DatePicker onDatechange={(date: any)=>this.handleDateChange(date,'EffectiveFrom')} isDisabled={this.state.isEditMode}  ref={this.inputEffectiveFrom} placeholder="MM/DD/YYYY" selectedDate={this.state.EffectiveFrom} id={'txtSubmitteddate'} title={"Effective From"} />
                      </div>
                    </div>
                  </div>
                     <div className="col-md-3 mt-2">
                    <div className="light-text div-readonly">
                      <label className="z-in-9">Effective To<span className="mandatoryhastrick">*</span></label>
                      <div className="custom-datepicker" id="DivEffectiveTo">
                        <DatePicker onDatechange={(date: any)=>this.handleDateChange(date,'EffectiveTo')} isDisabled={this.state.isEditMode} ref={this.inputEffectiveTo} placeholder="MM/DD/YYYY" selectedDate={this.state.EffectiveTo} id={'txtSubmitteddate'} title={"Effective To"} />
                      </div>
                    </div>
                  </div>
              
                  
               
              
              
             
                  <div className="col-md-12 mt-2">
                    <div className="light-text">
                      <label>Reason</label>
                      <textarea className="form-control requiredinput" disabled={this.state.isEditMode} value={this.state.Remarks} onChange={this.handleReason} placeholder="" id="txtTargetDescription" name="Remarks" ref={this.inputRemarks} ></textarea>
                    </div>
                  </div>
             
                <div className="row pt-2 px-2">
                  <div className="col-md-12">
                    <FileUpload ismultiAllowed={true} disabled={this.state.isEditMode} onFileChanges={this.filesChanged} isnewForm={!this.state.DynamicDisabled} files={[this.state.fileArr, this.state.delfileArr]} />
                  </div>
                </div>
                <span className="text-validator" id="spanErrorMessage">{this.state.errorMessage}</span>
                <div className="row mx-1" id="">
                  <div className="col-sm-12 text-center my-4" id="">


                    {!this.state.isEditMode && (
                    <button type="button" id="btnSubmit" className="SubmitButtons btn"  onClick={this.SubmitData} >{this.state.SaveUpdateText}</button>
                    )}               
                    <button type="button" id="btnCancel" className="CancelButtons btn" onClick={this.handleCancel} >Cancel</button>
                  </div>
                </div>
                { (this.state.IsBulkVariablecheck && this.state.History.length>0)&& (
                  <div className="row justify-content-md-left mt-4">
                    <div className="col-md-12">
                      <div className="p-rel">
                        <h6 className="p-2 mb-0 c-bg-title">Proposal History - {this.state.TitleoftheProposal} (₹{this.state.TotalProposalValue})</h6>
                      </div>
                      {/* <h6 className="mb-2">Comments History</h6> */}
                      <div className="px-2">
                        <table className="table border mt-2">
                          <thead>
                            <tr>
                              <th>sl.No</th>
                              <th>PO Number</th>
                              <th>PO Category</th>
                              <th> Available Balance </th>
                              <th>PO Value </th>
                              <th>Recieved Date</th>
                              <th>Submitted By</th>
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
      </>

    )
  }
  }
}


export default PO;