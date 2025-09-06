
import * as React from 'react';
import { sp,  SPHttpClient } from '@pnp/sp/presets/all';
import InputText from '../Shared/InputText';
import DatePicker from '../Shared/DatePickerField';
import FileUpload from '../Shared/FileUpload';
import { ControlType } from '../Utilities/Constants';
import formValidation from '../Utilities/Formvalidator';
import { Navigate } from 'react-router-dom';
import ModalPopUp from '../Shared/ModalPopUp';
import SearchableDropdown from '../Shared/Searchbledropdown';
import { showToast } from '../Utilities/toastHelper';
import { showLoader,hideLoader } from '../Shared/Loader';
import DateUtilities from '../Utilities/Dateutilities';
// import Loader from '../Shared/Loader';
// import DatePicker from 'react-datepicker';


export interface IEstimationsProps {
    match: any;
    spContext: any;
    spHttpClient: SPHttpClient;
    context: any;
    history: any;
}
interface EstimationHistory {
  EstimationTitle: string;
  Project: string;
  Status: string;
  EstimationHour: string;
  CreatedOn: string;
}
export interface IEstimationsState {

}
class Estimation extends React.Component<IEstimationsProps, IEstimationsState> {
    public state={
        data: [],
        columns: [],
        tableData: {},
        loading: false,
        Status: '',
        modalText: '',
        modalTitle: '',
        isSuccess: false,
        showHideModal: false,
        errorMessage: '',
        isExistingProject: false,
        isEditMode:false,
        History:[] as EstimationHistory[],
        Location: '',
        Locations: [],
        ClientNames:[],
        ClientName:'',
        ProjectName:'',
        ProjectNames:[],
        fileArr: [],
        delfileArr: [],
        Homeredirect: false,
        DynamicDisabled: false,
        Title:'',
        Hours:'',
        Estimations:[],
        Estimation:'',
        EstimationTitle:'',
        Attachment  :[],
        SubmittedDate:null,
        isdevonly: false,
        isSalesonly: false,
        Remarks:'',
        IsActive: true,
        SaveUpdateText: 'Submit',
        addNewProgram: false,
        ItemID: 0,
        SubmittedBy:'',
        BulkProposals:[],
        BulkProposal:'',
        IsBulkProposal:false,
        BulkProposalId:''
       
      
        
    };
    private inputLocation: React.RefObject<HTMLSelectElement>;
    inputClientName: React.RefObject<HTMLSelectElement>;
      private ProjectName;
      inputBulkProposal: React.RefObject<HTMLSelectElement>;

      private inputTitle;
      private inputHours:any;
     private inputEstimation: React.RefObject<HTMLSelectElement>;

    private inputRemarks: React.RefObject<HTMLTextAreaElement>;
  isExistingProject: React.RefObject<unknown>;

    private inputSubmittedDate:React.RefObject<HTMLInputElement>;

    
    constructor(props:any){
        super(props);
        sp.setup({
            spfxContext: this.props.context
        })

        this.inputLocation = React.createRef<HTMLSelectElement>();
        this.inputBulkProposal = React.createRef<HTMLSelectElement>();
        this.ProjectName=React.createRef<HTMLSelectElement>();
         this.inputClientName = React.createRef<HTMLSelectElement>();
         this.inputTitle = React.createRef();
         this.inputHours = React.createRef();
         this.isExistingProject=React.createRef();
        this.inputRemarks = React.createRef<HTMLTextAreaElement>();
       this.inputEstimation = React.createRef<HTMLSelectElement>();
        this.inputSubmittedDate = React.createRef<HTMLInputElement>();
        // this.inputHours = React.createRef();
        // this.inputEstimationTitle = React.createRef();
        // this.inputAttachment = React.createRef();
        // this.inputSubmittedDate = React.createRef();
        // this.inputRemarks = React.createRef();
    }
    public componentDidMount() {
       showLoader();
        this.getEstimationsListData();
          if (this.props.match.params.id != undefined) { 
            //  const inputEl = document.querySelector<HTMLInputElement>('input[name="Hours"]');
            //      inputEl?.focus();
            // document.getElementById("txtHours")?.focus();
            this.inputHours.current.focus();
              this.setState({ isEditMode: false });       
             this.setState({ isEditMode: true });
             let ItemID = this.props.match.params.id
             this.getOnclickdata(ItemID);
                

         
          }
          else{
             this.setState({ isEditMode: false });
             document.getElementById("newProject")?.focus();
             this.getCurrentUserGroups();

          }
    }
    private filesChanged = (selectedFiles:any) => {
      this.setState({ fileArr: selectedFiles[0], delfileArr: selectedFiles[1] });
 
  }
   private async getOnclickdata(ItemID: number){
      
        showLoader();
          sp.web.lists.getByTitle('Estimations').items.getById(ItemID).select('GDCOrOnsite',
    'ClientName/Title',  
    'ClientName/Id', 
    'TitleOfTheProject',
    'EstimatedHour',
    'EstimationFor',
    'TitleoftheEstimation',
    'SubmittedDate',
    'EstimationStatus',
    'Remarks',
    'History',
    'SubmittedBy',
    'BulkProposal',
    'Id').expand('ClientName').get().then((Response)=>{
            const buttontext= Response.EstimationStatus =='In-Draft'?'Submit':'Update';
            const historyData = JSON.parse(Response.History);
               this.setState({
            addNewProgram: true,
            Location: Response.GDCOrOnsite,
            ClientName:Response.ClientName?Response.ClientName.Id:'',
            ProjectName:Response.TitleOfTheProject,
            Hours:Response.EstimatedHour,
            Estimation:Response.EstimationFor,
            Title:Response.TitleoftheEstimation,
            SubmittedDate:Response.SubmittedDate,
            Remarks:Response.Remarks,
            ItemID: Response.Id,
            Status:Response.EstimationStatus,
            History: historyData,
            // BulkProposal:Response.BulkProposal || '',
            SubmittedBy:Response.SubmittedBy ||'',
            SaveUpdateText:buttontext,
            errorMessage: "",
            // IsBulkProposal:Response.BulkProposal
            
          
          })

          this.fetchClientNames();
          this.fetchBulkProposalValues(Response.BulkProposal);
          hideLoader();
          })
              let files= await sp.web.lists.getByTitle('EstimationsDocs').items.filter('RecordID eq ' + ItemID).expand('File').get()
             let filesArry: { URL: any; IsDeleted: boolean; IsNew: boolean; name: any; FileID: any; }[] = [];
            files.map((selItem:any, index:any) => {
                let name = selItem.File.Name;
                var fileUrl = selItem.File.ServerRelativeUrl;
                let obj = { URL: fileUrl, IsDeleted: false, IsNew: false, name:name, FileID: selItem.Id };
                filesArry.push(obj);
            });
            this.setState({fileArr:filesArry})
     }
   
   fetchClientNames() {
    sp.web.lists.getByTitle('Clients').items
      .select('Id', 'Title') // Select ID and Title for the Clients list
      .get()
      .then((response) => {
        // Map the Clients list to the format { value: ID, label: Title }
        const ClientNames = response.map(client => ({
          value: client.Id,
          label: client.Title
        }));

        // Set the ClientNames state for the dropdown options
        this.setState({ ClientNames });
      });
  }

private addBrowserwrtServer(date:Date) {
        // if (date != '') {
            var utcOffsetMinutes = date.getTimezoneOffset();
            var newDate = new Date(date.getTime());
            newDate.setTime(newDate.getTime() + ((this.props.spContext.webTimeZoneData.Bias - utcOffsetMinutes + this.props.spContext.webTimeZoneData.DaylightBias) * 60 * 1000));
            return newDate;
        // }
    }

 
//  private fetchBulkProposalValues(bulkProposal: any) {
//     sp.web.lists.getByTitle('ProposalDetails').items.filter(`ID eq '${bulkProposal}'`).select('Proposal','ID').get().then((Response: any[]) => {
//         console.log(Response);
//         let uniqueProposals = Array.from(new Set(Response.map(item => item.Proposal))); 
//         const BulkProposalOptions = uniqueProposals.map(Proposal => ({
//             label:Proposal,
//             value: Proposal
//         }));
//         this.setState({ BulkProposals: BulkProposalOptions },()=>{
//           const selectedProposal = BulkProposalOptions.find(option => option.label === bulkProposal);
//           if (selectedProposal) {
//                     this.setState({ BulkProposal: selectedProposal.value });
//                 } else {
//                     this.setState({ BulkProposal: '' }); 
//                 }
//         });

      
//     });
//  }

private fetchBulkProposalValues(bulkProposal: any) {
    sp.web.lists.getByTitle('ProposalDetails')
        .items
        .filter(`ID eq '${bulkProposal}'`)
        .select('Proposal', 'ID')
        .get()
        .then((Response: any[]) => {
            console.log(Response);

            // Build options directly from the response
            const BulkProposalOptions = Response.map(item => ({
                label: item.Proposal,
                value: item.Proposal,
                id: item.ID
            }));

            this.setState({ BulkProposals: BulkProposalOptions }, () => {
                const selectedProposal = BulkProposalOptions.find(option => option.id === parseInt(bulkProposal));
                if (selectedProposal) {
                    this.setState({ BulkProposal: selectedProposal.value });
                } else {
                    this.setState({ BulkProposal: '' });
                }
            });
        });
}



  // private getInputDeatils(event:any) {
  //   var key = event.target.name;
  //   var val = key !='IsActive'?event.target.value:event.target.checked;
  //   var obj: Record<string, any> = {};
  //   obj[key] = val;
  //   this.setState(obj);
  // }

  private SubmitData=async (action: 'save' | 'submit')=>{
     let data={
          location: { val: this.state.Location, required: true, Name: 'Location', Type: ControlType.string, Focusid: this.inputLocation },
          ClientName: { val: this.state.ClientName, required: true, Name: 'Client Name', Type: ControlType.reactSelect, Focusid:'Client' },
          Project: { val: this.state.ProjectName, required: true, Name: 'Title of the Project', Type: ControlType.string, Focusid: this.ProjectName },
          EstimatedHours:{ val: this.state.Hours, required: true, Name: 'Estimated Hours', Type: ControlType.string, Focusid: this.inputHours },
          Estimationsfor:{ val: this.state.Estimation, required: true, Name: 'Estimations For', Type: ControlType.string, Focusid: this.inputEstimation },
          TitleofEstimation:{ val: this.state.Title, required: true, Name: 'Title of the Estimation', Type: ControlType.string, Focusid: this.inputTitle },
          SubmittedDate:{ val: this.state.SubmittedDate, required: true, Name: 'Submitted Date', Type: ControlType.date, Focusid: 'DivSubmittedDate'},
          // Reason:{ val: this.state.Remarks, required: true, Name: 'Reason', Type: ControlType.string, Focusid: this.inputRemarks},
          Attachment:{ val: this.state.fileArr, required: true,Name:'', Type: ControlType.file}
     }
      
      let isValid = formValidation.checkValidations(data);
      
       var formdata={
          ClientNameId:parseInt(this.state.ClientName),
          GDCOrOnsite:this.state.Location,
          TitleOfTheProject:this.state.ProjectName,
          EstimatedHour:this.state.Hours,
          EstimationFor:this.state.Estimation,
          TitleoftheEstimation:this.state.Title,
          SubmittedDate:this.state.SubmittedDate,
          Remarks:this.state.Remarks,
          Status:'Open',
          // BulkProposal:this.state.BulkProposalId || '',
          SubmittedBy: this.state.isdevonly?'Dev Team':(this.state.SubmittedBy ||''),
          EstimationStatus:action == 'save' ? 'In-Draft':'Submitted',
          History:JSON.stringify(this.state.History)
  }
 formdata.SubmittedDate = this.addBrowserwrtServer( new Date(DateUtilities.getDateMMDDYYYY(formdata.SubmittedDate))).toISOString() as unknown as null;

  if(isValid.status){
      try{
       await this.checkDuplicates(formdata);
      }catch(e){
        console.log("Error in Submiting the data",e)
        showToast('error', 'Sorry! something went wrong');
      }
  }
  else
  {
   hideLoader();
    showToast('error', isValid.message);
  }
    // this.setState({ errorMessage: isValid.message });


}
handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value;
  // Allow only digits
  if (/^\d*$/.test(value)) {
     if(value.length > 5){
             value = value.slice(0, 5);

     }
    this.setState({ Hours: value });
  }
};

private  async AddorUpdatelistItem(ItemID:number){
   let processedFiles = 0;
    let newFileArry = [];
    newFileArry=this.state.fileArr.filter((file:any)=>{
      return file.IsNew == true; 
    })
     this.deleteListItem();
        if (newFileArry.length > 0) {0
            for (const i in newFileArry) {
                let file:any = newFileArry[i];
                let siteAbsoluteURL = this.props.context.pageContext.web.serverRelativeUrl;
         await sp.web.getFolderByServerRelativeUrl(siteAbsoluteURL + "/EstimationsDocs").files.add(file.name, file, true);
                const item1 =  await sp.web.getFileByServerRelativePath(siteAbsoluteURL + "/EstimationsDocs/" + file.name).getItem();

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

  private async getCurrentUserGroups(){
    try {
      const currentUser = await sp.web.currentUser.get();
      const userGroups = await sp.web.currentUser.groups.get();
 
       const isAdmin = userGroups.some(g => g.Title === 'P&I Administrators');
      const isBilling = userGroups.some(g => g.Title === 'Billing Team');
      const isSales = userGroups.some(g => g.Title === 'Sales Team');
      const isDev = userGroups.some(g => g.Title === 'Dev Team'); 
      const isOnlyDev = isDev && !isAdmin && !isBilling && !isSales;
      const isOnlySales = isSales && !isAdmin && !isBilling && !isDev;
      
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
      isdevonly: isOnlyDev,
      isSalesonly: isOnlySales,
  
    });
      if(userLoc.length === 1){
        this.fetchClientsBasedOnLocation(userLoc[0]);
      }
  
    } catch (error) {
      console.error('Error fetching user groups:', error);
    }
  }


private deleteListItem(){
  let list=sp.web.lists.getByTitle("EstimationsDocs");
  if(this.state.delfileArr.length>0){
  this.state.delfileArr.map((selItem, index) => {
                let itemId = selItem['FileID'];
              list.items.getById(itemId).delete();
            });
  }
}

  private checkDuplicates = (formData:any) => 
    {
    let TrList = 'Estimations';
    var filterString;
    try {
      showLoader();
      if (this.state.ItemID == 0)
        filterString = `ClientNameId eq '${formData.ClientNameId}' and TitleoftheEstimation eq '${formData.TitleoftheEstimation}'`;
      else
        filterString = `ClientNameId eq '${formData.ClientNameId}' and TitleoftheEstimation eq '${formData.TitleoftheEstimation}' and Id ne ${this.state.ItemID}`;
      sp.web.lists.getByTitle(TrList).items.filter(filterString).get().
        then((response: any[]) => {
          if (response.length > 0){
                showToast('error',"Duplicate 'Title of the Estimation' not accepted/Proposal for this Item is alreday Approved or Rejected" );
                this.setState({loading:false})
          }
            // this.setState({ errorMessage: "Duplicate 'Title of the Estimation' not accepted/Proposal for this Item is alreday Approved or Rejected" });
          else{
                 this.insertorupdateListitem(formData);
                  this.state.History.push({"EstimationTitle": formData.TitleoftheEstimation,"Project": formData.TitleOfTheProject, "Status": formData.EstimationStatus,"EstimationHour":formData.EstimatedHour, "CreatedOn":new Date().toLocaleString('en-GB',{hour12:false})})
      formData['History']=JSON.stringify(this.state.History);
         

          }
        });
    }
    catch (e) {
      this.onError();
      console.log(e);
    }
    finally{
      hideLoader();
    }
    // return findduplicates
  }



  private insertorupdateListitem = (formData:any) => {
    this.setState({ loading: true });
    try{
       showLoader();
      if (this.state.ItemID == 0) { 
      
        sp.web.lists.getByTitle('Estimations').items.add(formData)

          .then((res) => {
           this.AddorUpdatelistItem(res.data.Id);
           this.onSucess();
            //console.log(res);
          }, (Error) => {
            console.log(Error);
            this.onError();
          })
          .catch((err) => {
            console.log(Error);
            this.onError();
          });
    
    }
    else {
          sp.web.lists.getByTitle('Estimations').items.getById(this.state.ItemID).update(formData).then((res) => {
            this.AddorUpdatelistItem(this.state.ItemID)
            this.onUpdateSucess();          
          }, (Error) => {
            console.log(Error);
            this.onError();
          }).catch((err) => {
            this.onError();
            console.log(err);
          });
        }
      
    }catch(e){
      console.log("Error in Uploading the data",e)
    }finally{
      hideLoader();
    }
  }
  private handleCancel = () => {
    this.setState({Homeredirect:true,ItemID: 0,errorMessage: "" });
  }
  private handleClose = () => {
    this.setState({ showHideModal: false,Homeredirect:true,ItemID: 0,errorMessage: "" });
  }

  private onSucess = () => {
    showToast('success', 'Estimation submitted successfully');
    this.getEstimationsListData();
    this.setState({ showHideModal: false,Homeredirect:true,addNewProgram:false, loading: false, isSuccess: true, ItemID: 0,errorMessage: "" });

        
  }
    private onUpdateSucess = () => {
    showToast('success', 'Estimation updated successfully');
    this.setState({showHideModal: false, loading: false,addNewProgram:false,Homeredirect:true, isSuccess: true, ItemID: 0,errorMessage: "" });
     this.getEstimationsListData();
  }
   private onError = () => {
    showToast('error', 'Sorry! something went wrong');
    this.setState({showHideModal: true, loading: false,addNewProgram:false, isSuccess: true, ItemID: 0,errorMessage: "" });
    
  }
    
  private BindComments=()=>{
    let rows = this.state.History.map((item, index) => {
      return (
        <tr key={index}>
          <td>{index + 1}</td>
          <td>{item.EstimationTitle}</td>
          <td>{item.Project}</td>
          <td>{item.Status}</td>
          <td>{item.EstimationHour}</td>
          <td>{item.CreatedOn}</td>
        </tr>
      );
    });
    return rows;
     
  }
    private handleonBlur = (event:any) => {
        let returnObj: Record<string, any> = {};
        if (event.target.name != 'IsActive')
          returnObj[event.target.name] = event.target.value.trim();
        else
          returnObj[event.target.name] = event.target.checked;
        this.setState(returnObj);
      }
    private handleChange = (event:any) => {
        let returnObj: any = {};
        if (event.target.name != 'IsActive')
          returnObj[event.target.name] = event.target.value;
        else
          returnObj[event.target.name] = event.target.checked;
        this.setState(returnObj);
        if(event.target.name === 'Location'){
            this.setState({ ProjectName:'', ProjectNames:[] }); 
            this.fetchClientsBasedOnLocation(event.target.value);
        }
    
      }
      // private handleChangeClient = (event:any,actionMeta?:any) => {
      //   let returnObj: any = {};
      //   if (event.target.name != 'IsActive')
      //     returnObj[event.target.name] = event.target.value;
      //   else
      //     returnObj[event.target.name] = event.target.checked;
      //   this.setState(returnObj);
      //    let  name,inputvalue,value;
      //   //Below is condition for handle common change function for both react select dropdown  and normal controls
      //   if(![null, undefined].includes(event) && event.target != undefined)
      //   {
      //       name = event.target.name;
      //       inputvalue = event.target.value;
      //       value = event.target.type == 'checkbox' ? event.target.checked : inputvalue;
      //   }
      //   else if(actionMeta!= undefined)
      //   {
      //       name = actionMeta.name;
      //       value =actionMeta.action =='clear'?'': event.value;
      //   }
      //   if(name === 'ClientName'){
      //     // let SelClientTitle=event.target.options[event.target.selectedIndex].text;
      //     let SelClientTitle=value;
      //       this.fetchProjectBasedOnClient(SelClientTitle);
      //   }
    
      // }
       
    

private handleChangeClient = (event: any, actionMeta?: any) => {
    let returnObj: any = {};
    let name: string | undefined;
    let value: any;
      let label: string | undefined;

    if (event && event.target) {
        name = event.target.name;
        value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    } else if (actionMeta && actionMeta.name) {
        name = actionMeta.name;
        value = actionMeta.action === 'clear' ? '' : event?.value;
        label = actionMeta.action === 'clear' ? '' : event?.label;
    }

    if (name !== undefined) {
        returnObj[name] = value;
        this.setState(returnObj);

        if (name === 'ClientName' && label !== undefined) {
            this.fetchProjectBasedOnClient(label);
            this.fetchBulkProposals(label);
        }
    }
};

private fetchBulkProposals = (selectedClient: string) => {
   try{
    sp.web.lists.getByTitle('ProposalDetails').items.filter(`ClientName eq '${selectedClient}' and IsBulkProposal eq 1`).select('Proposal').get().then((Response: any[]) => {
        console.log(Response);
        let uniqueProposals = Array.from(new Set(Response.map(item => item.Proposal))); 
        const BulkProposalOptions = uniqueProposals.map(Proposal => ({
            label:Proposal,
            value: Proposal
        }));
        this.setState({ BulkProposals: BulkProposalOptions,IsBulkProposal: Response.length > 0 });
    });
  }catch(e){
    console.log("Error in fetching Bulk Proposals",e)
  }
}















    // private UpdateDate = (dateprops:any) => {
    //     let fildname = dateprops[1].split('_')[1];
    //     this.setState({ [fildname]:dateprops[0] });
    // }
    //  private handleDateChange = ( dateProps:any ) => {
    //     const dateValue = dateProps.target.value;
    //     this.setState({ SubmittedDate: dateValue});
    // }
    handleDateChange = (date: any) => {
    this.setState({ SubmittedDate: date[0] });
  };
private fetchProjectBasedOnClient = (selectedClient: string) => {
  const TrList = 'Estimations';

  sp.web.lists.getByTitle(TrList).items
    .filter(`ClientName/Title eq '${selectedClient}'`).expand('ClientName')
    .select('TitleOfTheProject', 'Id','ClientName/Title')
    .get()
    .then((Response: any[]) => {
      // Create a Map to ensure uniqueness by Title
      const uniqueProjectsMap = new Map<string, any>();

      Response.forEach(item => {
        if (!uniqueProjectsMap.has(item.TitleOfTheProject)) {
          uniqueProjectsMap.set(item.TitleOfTheProject, {
            label: item.TitleOfTheProject,
            value: item.Id
          });
        }
      });

      const ProjectOptions = Array.from(uniqueProjectsMap.values());
      this.setState({ ProjectNames: ProjectOptions });
    });
}

      private handleChange1 = (event:any) => {
        let returnObj: Record<string, any> = {};
        if (event.target.name != 'IsActive')
          returnObj[event.target.name] = event.target.value;
        else
          returnObj[event.target.name] = event.target.checked;
        this.setState(returnObj);
      }
      // private fetchClientsBasedOnLocation = (selectedLocation: string) => {
      //   const TrList = 'Clients';
      //   sp.web.lists.getByTitle(TrList).items.filter(`Location eq '${selectedLocation}'`).select('Title','Id').get().then((Response: any[]) => {
      //       console.log(Response);
      //       const clientOptions = Response.map(item => ({
      //           label: item.Title,
      //           value: item.Id
      //       }));
      //       this.setState({ ClientNames: clientOptions });
      //   });
      // }

 private fetchClientsBasedOnLocation = async (selectedLocation: string) => {
  try {
    const TrList = "Clients";
      const currentUser = await sp.web.currentUser.get();
    const userEmail = currentUser.Email;

    // Base filter
    let filterQuery = `Location eq '${selectedLocation}'`;

    if (this.state.isSalesonly) {
      // Check both SalesPerson and AlternateSalesPerson fields
      filterQuery += ` and (Sales_x0020_Person_x0020_Name/EMail eq '${userEmail}' or Alternate_x0020_Sales_x0020_Pers/EMail eq '${userEmail}')`;
    }

    const response: any[] = await sp.web.lists
      .getByTitle(TrList)
      .items
      .filter(filterQuery)
      .select("Id", "Title", "Sales_x0020_Person_x0020_Name/EMail", "Alternate_x0020_Sales_x0020_Pers/EMail")
      .expand("Sales_x0020_Person_x0020_Name", "Alternate_x0020_Sales_x0020_Pers")
      .get();

    const clientOptions = response.map(item => ({
      label: item.Title,
      value: item.Id
    }));

    this.setState({
      ClientNames: clientOptions,
      ClientName: clientOptions.length === 1 ? clientOptions[0].value : "" // auto-select if only one
    });

  } catch (err) {
    console.error("Error fetching clients:", err);
  }
};


// private handleProjectstatus = (event: any) => {
      
//           const { name, value } = event.target;
//           this.setState({ [name]: value });
//   }

// private handleIsBulk=(event: any)=> {
   
//   const returnObj: any = {};

//   if (event.target.name !== 'IsActive') {
//     returnObj[event.target.name] = event.target.value;
//   } else {
//     returnObj[event.target.name] = event.target.checked;
//   }

//   this.setState(returnObj);

//   if (event.target.name === 'BulkProposal') {
//     this.getBulkproposalId(event.target.value);
//   }
// }
// private async getBulkproposalId(proposal: string) {
//   try {
//     const response = await sp.web.lists.getByTitle('ProposalDetails').items.filter(`Proposal eq '${proposal}'`).select('Id').get();
//     if (response.length > 0) {
//       this.setState({ BulkProposalId: response[0].Id });
//     } else {
//       this.setState({ BulkProposalId: '' });
//     }
//   } catch (error) {
//     console.error('Error fetching proposal ID:', error);  
//     this.setState({ BulkProposalId: '' });
//   }
// }











    private getEstimationsListData=async () => {
       let locationsList= 'Location';
    
           try {
              const currentUser = await sp.web.currentUser.get();
               const currentUserId = currentUser.Id;
               console.log('Current User ID:', currentUserId);
             // get all the items from a list
             await sp.web.lists.getByTitle(locationsList).items.select('Title').get().then((Locations: any[]) => {
               const locationOptions = Locations.map(item=>({
                 label: item.Title ? item.Title.trim() : ''  ,
                 value: item.Title ? item.Title.trim() : ''
               })) .filter(item => item.label !=='').sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
              
               this.setState({Locations: locationOptions});
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
       render() {
     
    const { ItemID,Status} = this.state;
 
   
    const showSaveButton = ItemID === 0 || ItemID === undefined || ItemID! ===0 || Status==='In-Draft';

            if (this.state.Homeredirect) {
              // let message = this.state.modalText;
                   let url = `/Estimation_view`;
                return <Navigate to={url} />;
            }
        
               
           return (
     
                <>
                 
                   <ModalPopUp title={this.state.modalTitle} modalText={this.state.modalText} isVisible={this.state.showHideModal} onClose={this.handleClose} isSuccess={this.state.isSuccess}></ModalPopUp>                            
                  {/* {this.state.loading && <Loader />} */}
                  <div className='container-fluid'>
                  <div className='FormContent'>
              <div className='title'> Estimations
         
                  <div className='mandatory-note'>
                    <span className='mandatoryhastrick'>*</span> indicates a required field
                  </div>
                
              </div>
              
              <div className="after-title"></div>
              <div className='pt-2'>
    
                  <div className="light-box border-box-shadow mx-2">
                     {!this.state.isEditMode && (
                  <div className="row pt-2 px-2"> 
                  <div className="col-md-4">  
                       <input type='radio' name='IsActive' id='newProject' checked={!this.state.isExistingProject} onChange={()=>this.setState({isExistingProject:false,ProjectNames:[],ProjectName:'',ClientName:'',Hours:'',Estimation:''})} /> <label htmlFor='newProject'>New Project </label>
                       </div>
                        <div className="col-md-3">
                        <input type='radio' name='IsActive' id='existingProject' checked={this.state.isExistingProject} onChange={()=>this.setState({isExistingProject:true,ProjectNames:[],ProjectName:'',ClientName:'',Estimation:'',Hours:''})}  /> <label htmlFor='existingProject'>Existing Project</label>
                        </div>
                    </div>
                     )}
                  <div className="row pt-2 px-2">      
                  <div className="col-md-3">
                                                            <div className="light-text">
                                                               <label className="z-in-9">Location <span className="mandatoryhastrick">*</span></label>
                                                                <select className="form-control" required={true} name="Location" value={this.state.Location} title="Location" onChange={this.handleChange} disabled={this.state.isEditMode || this.state.Locations.length === 1} itemRef='Location' ref={this.inputLocation}>
                                                                    <option value=''>None</option>
                                                                    
                                                                    {this.state.Locations.map((location:any, index:any) => (
                                                                      <option key={index} value={location.value}>{location.label}</option>
                                                                    ))}
                                                                
                                                                </select>
                                                            </div>
                </div>
                <div className="col-md-3">
                    <div className="light-text">
                        <label >Client Name<span className="mandatoryhastrick">*</span></label>
                        {/* <select className="form-control" required={true} name="ClientName" value={this.state.ClientName} title="Client Name" onChange={this.handleChangeClient} disabled={this.state.isEditMode} itemRef='ClientName' ref={this.inputClientName}>
                            <option value=''>None</option>
                            {this.state.ClientNames.map((Clientname:any, index:any) => (
                                <option key={index} value={Clientname.value}>{Clientname.label}</option>
                            ))}
                        
                        </select> */}
                               <div className="custom-dropdown">
                                                <SearchableDropdown label="Client Name" Title="ClientName" name="ClientName" id="Client" placeholderText="Select Client" disabled={this.state.isEditMode} className="" selectedValue={this.state.ClientName} optionLabel={'label'} optionValue={'value'} OptionsList={this.state.ClientNames} onChange={(selectedOption:any, actionMeta:any) => { this.handleChangeClient(selectedOption, actionMeta) }} isRequired={true} refElement={this.inputClientName} noOptionsMessage="No Client"></SearchableDropdown>

                           
                          </div>
                    </div>
                </div>
                       {/* {this.state.IsBulkProposal && (
                      <div className="col-md-3">
                  <div className="light-text">
                    <label >Bulk Proposal<span className="mandatoryhastrick"></span></label>
                   
                      <select className="form-control" required={true} name="BulkProposal" value={this.state.BulkProposal} onChange={this.handleIsBulk} title="BulkProposal" itemRef='BulkProposal' ref={this.inputBulkProposal}>
                        <option value=''>None</option>
                        {this.state.BulkProposals.map((BulkProposal: any, index: any) => (
                          <option key={index} value={BulkProposal.label}>{BulkProposal.label}</option>
                        ))}

                      </select>

                
                  </div>
                </div>
                      )} */}
                <div className="col-md-3">
                {!this.state.isExistingProject ? (
  <InputText
    type='text'
    label={"Title of the Project"}
    name={"ProjectName"}
    value={this.state.ProjectName}
      
    isRequired={true}
    onChange={this.handleChange}
    disabled={this.state.isEditMode}
    refElement={this.ProjectName}
    onBlur={this.handleonBlur}
  />
) : (
  <div className="light-text">
    <label>Title of the Project <span className="mandatoryhastrick">*</span></label>
    <select
      className="form-control"
      required
      name="ProjectName"
      onChange={this.handleChange1}
      disabled={this.state.isEditMode}
      value={this.state.ProjectName}
      itemRef='ProjectName'
      ref={this.ProjectName}
      
    >
      <option value=''>None</option>
      {this.state.ProjectNames.map((est: any, index: number) => (
        <option key={index} value={est.label}>{est.label}</option>
      ))}
    </select>
  </div>
)}

                 </div>
                <div className="col-md-3" id='txtEstimatedHours'>
                  <InputText 
                            type='text'
                            InpuId='txtHours'
                            label={"Estimated Hours"}
                            name={"Hours"}
                            value={this.state.Hours}
                            isRequired={true}
                            onChange={this.handleNumericChange}
                            refElement={this.inputHours}
                            onBlur={this.handleonBlur}
                          />
                   </div>
                     
                  
                     <div className="row pt-2 px-2">                       
                  <div className="col-md-3">
                  <div className="light-text">
                        <label >Estimations for<span className="mandatoryhastrick">*</span></label>
                        <select className="form-control" required={true} name="Estimation" value={this.state.Estimation} title="Estimationsfor" onChange={this.handleChange1} itemRef='Estimation' ref={this.inputEstimation}>
                            <option value=''>None</option>
                            <option value='Project'>Project</option>  
                            <option value='CR'>CR</option>
                            <option value='Consultant'>Consultant</option>
                            <option value='Support'>Support</option>
                        
                        </select>
                    </div>
                    </div>
                    <div className="col-md-3">
                    <InputText
                            type='text'
                            label={"Title of the Estimation"}
                            name={"Title"}
                            value={this.state.Title}
                            isRequired={true}
                            onChange={this.handleChange}
                            refElement={this.inputTitle}
                            onBlur={this.handleonBlur}
                          />
                    </div>
                            <div className="col-md-3">
                                            <div className="light-text div-readonly">
                                                <label className="z-in-9">Submitted Date<span className="mandatoryhastrick">*</span></label>
                                                <div className="custom-datepicker" id="DivSubmittedDate">
                                                  <DatePicker onDatechange={this.handleDateChange} ref={this.inputSubmittedDate}  endDate={new Date()} selectedDate={this.state.SubmittedDate} placeholder="MM/DD/YYYY" maxDate={new Date()} id={'txtSubmitteddate'} title={"Submitted Date"}/>
                                                </div>
                                            </div>
                                        </div>
               
                    </div>
                    </div>
                 
                    <div className="row pt-2 px-2">   
                  <div className="col-md-12">
                  <div className="light-text">
                                                    <label>Reason</label>
                                                    <textarea className="form-control requiredinput" onChange={this.handleChange} value={this.state.Remarks} placeholder="" maxLength={750} id="txtTargetDescription" name="Remarks" ref={this.inputRemarks} ></textarea>
                                                </div>
                    </div>
                      </div>
                      <div className="row pt-2 px-2">   
                      <div className="col-md-12">
            
                                                     <FileUpload ismultiAllowed={true} onFileChanges={this.filesChanged} isnewForm={!this.state.DynamicDisabled} files={[this.state.fileArr, this.state.delfileArr]} />
                                            </div>
                        </div>
                        
                      
     
                      <span className="text-validator" id="spanErrorMessage">{this.state.errorMessage}</span>

                      <div className="row mx-1" id="">
                        <div className="col-sm-12 text-center my-4" id="">
                          {showSaveButton && (
                         <button type="button" id="btnCancel" className="SaveButtons btn btn-secondary" onClick={()=>this.SubmitData('save')}>Save</button>
                          )}
                          <button type="button" id="btnSubmit" className="SubmitButtons btn" onClick={()=>this.SubmitData('submit')} >{this.state.SaveUpdateText}</button>
                          <button type="button" id="btnCancel" className="CancelButtons btn" onClick={this.handleCancel}>Cancel</button>
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
                                                            <th>Estimation Title</th>
                                                            <th>Project</th>
                                                            <th>Status</th>
                                                            <th>Estimation Hour </th>
                                                            <th>Created On </th>
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


export default Estimation;