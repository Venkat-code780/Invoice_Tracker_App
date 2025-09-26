 import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
import ModalPopUp from '../Shared/ModalPopUp';
import InputText from '../Shared/InputText';
import TableGenerator from '../Shared/TableGenerator';
import formValidation from '../Utilities/Formvalidator';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { showToast } from '../Utilities/toastHelper';
import { ControlType } from '../Utilities/Constants';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/controls/peoplepicker';
import { showLoader,hideLoader } from '../Shared/Loader';
import UnAuthorized from '../Shared/UnAuthorized.Component';
//import { result } from 'lodash';
//import { sortDate } from '@pnp/spfx-controls-react';


export interface ClientProps {
  match: any;
  spContext: any;
  spHttpClient: SPHttpClient;
  context: any;
  history: any;
}

export interface ClientState {
  

}

class Client2 extends React.Component<ClientProps, ClientState>{

  // Onload
  public state = {
    data: [],
    columns: [],
    tableData: {},
    loading: true,
    modalText: '',
    modalTitle: '',
    isSuccess: false,
    showHideModal: false,
    errorMessage: '',
    isPermissionChecked:false,
    isAdmin:false,
    ClientName: '',
    SalesPersonIds:[],
    SalesPersonEmails:[],
    AlternativeSalesPersonEmails:[],
    AlternativeSalesPersonIds:[],
    Location: '',
    Locations: [],
    Reminder: '',
    IsActive: true,
    SaveUpdateText: 'Submit',
    addNewProgram: false,
    ItemID: 0,
    isUnAuthorized:false,
    pickerKey:null
 
  };


  private inputClientName;
  private inputReminder;
  private inputLocation: React.RefObject<HTMLSelectElement>;
  private inputSalesPersonName: React.RefObject<PeoplePicker>;
  private inputAlternativeSalesPersonName: React.RefObject<PeoplePicker>;

 
  constructor(props:any) {
    super(props);
    sp.setup({
      spfxContext: this.props.context
    });
    this.inputClientName = React.createRef();
    this.inputReminder = React.createRef();
    this.inputLocation = React.createRef<HTMLSelectElement>();
    this.inputSalesPersonName = React.createRef<PeoplePicker>();
    this.inputAlternativeSalesPersonName = React.createRef<PeoplePicker>();
  }

  public componentDidMount() {
    document.getElementById('btnSubmit')?.focus();
    showLoader();
    // this.GetOnloadData();
       this.getCurrentUserGroups();
  }

    private async getCurrentUserGroups(){
          try{
             const userGroups= await sp.web.currentUser.groups.get();
            const isAdminUser = userGroups.some(
          g => g.Title === 'P&I Administrators'
        );
        if(isAdminUser){
              this.GetOnloadData();
        }
        this.setState({isAdmin:isAdminUser,isPermissionChecked:true,isUnAuthorized:!isAdminUser},()=>{hideLoader();})
           
          }
          catch(error){
               console.error('Error checking admin status:', error);
                this.setState({ isAdmin: false, isPermissionChecked:true},()=>{hideLoader()});
          }
    }
  public componentWillReceiveProps(newProps:any) {
    if (newProps.match.params.id == undefined)
      this.setState({ Location: '', SaveUpdateText: 'Submit', addNewProgram: false });
  }
  private GetOnloadData = async () => {
    let locationsList= 'Location';
    let TrList = 'Clients';
    try {

      // get all the items from a list
     await sp.web.lists.getByTitle(locationsList).items.select('Title').get().then((Locations: any[]) => {
        const locationOptions = Locations.map(item=>({
          label: item.Title,
          value: item.Title
        })).filter(item => item.label !=='').sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
        this.setState({Locations: locationOptions});
      }
      );

      await sp.web.lists.getByTitle(TrList).items.expand("Sales_x0020_Person_x0020_Name","Alternate_x0020_Sales_x0020_Pers").select("Sales_x0020_Person_x0020_Name/Title","Alternate_x0020_Sales_x0020_Pers/Title","*"). orderBy("Id", false).get().
        then((response: any[]) => {
          response.sort((a: any, b: any) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime());
          this.BindData(response);
          hideLoader();
        });
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

  private BindData(response:any) {
    let data:any = [];

    response.forEach((Item:any) => {
      let spNames ='';
      let spNames1 ='';
      if( Item.Sales_x0020_Person_x0020_Name!=null && Item.Sales_x0020_Person_x0020_Name.length>0){
        for (const user of Item.Sales_x0020_Person_x0020_Name) {
          spNames +="<div>"+user.Title+"</div>";
        }
      }
      if( Item.Alternate_x0020_Sales_x0020_Pers!=null && Item.Alternate_x0020_Sales_x0020_Pers.length>0){
        for (const user of Item.Alternate_x0020_Sales_x0020_Pers) {
          spNames1 +="<div>"+user.Title +"</div> ";
        }
      }
     
      data.push({
        Id: Item.Id,
        Title: Item.Title,
        Location: Item.Location,
        Reminder: Item.Reminder,
        Sales_x0020_Person_x0020_Name: Item.Sales_x0020_Person_x0020_Name!=null ? spNames:'',
        Alternate_x0020_Sales_x0020_Pers: Item.Alternate_x0020_Sales_x0020_Pers!=null ? spNames1:'',

  
      

      });
    });


    this.setState({ data: data, loading: false, SaveUpdateText: 'Submit' });
  }

  // Add New button click event 
  private addNew = () => {
    this.setState({ addNewProgram: true,ItemID:0,SalesPersonIds:[],SalesPersonEmails:[], AlternativeSalesPersonEmails:[],AlternativeSalesPersonIds:[]},()=>{
      document.getElementById('txtclient')?.focus();
    });
  }

  private SubmitData = () => {
    showLoader();
    let data = {
      ClientName: { val: this.state.ClientName, required: true, Name: 'Client Name', Type: ControlType.string, Focusid: this.inputClientName },
      location: { val: this.state.Location, required: true, Name: 'Location', Type: ControlType.string, Focusid: this.inputLocation },
      Reminder: { val: this.state.Reminder, required: true, Name: 'Reminder SLA', Type: ControlType.string, Focusid: this.inputReminder },
      Sales_x0020_Person_x0020_Name: { val: this.state.SalesPersonIds, required: true, Name: 'Sales Person(s)', Type: ControlType.people,Focusid:'DivPPSalesperson'},
   
      // Sales_x0020_Person_x0020_Name: { val: this.state.SalesPersonIds, required: true, Name: 'Sales Person Name', Type: ControlType.string,focusid: this.inputSalesPersonName },
      // Alternate_x0020_Sales_x0020_Pers: { val: this.state.AlternativeSalesPersonIds, required: true, Name: 'Alternative Sales Person Name', Type: ControlType.string ,focusid: this.inputAlternativeSalesPersonName },

  
    };
    // let pdata = {
    //   Sales_x0020_Person_x0020_Name: { val: this.state.SalesPersonIds, required: true, Name: 'Sales Person Name', Type: ControlType.people,Focusid:'DivPPSalesperson'},
    // };
    let isValid = formValidation.checkValidations(data);
    // isValid = isValid.status ? formValidation.multiplePeoplePickerValidation(pdata) : isValid;
    var formdata = {
      Title: this.state.ClientName,
      Location: this.state.Location,
      Reminder: parseInt(this.state.Reminder),
      Sales_x0020_Person_x0020_NameId: {results:this.state.SalesPersonIds},
      Alternate_x0020_Sales_x0020_PersId:{results:this.state.AlternativeSalesPersonIds},

    };
    if (isValid.status)
      this.checkDuplicates(formdata);
    else
    {
      hideLoader();
      showToast("error", isValid.message);
    }
      // this.setState({ errorMessage: isValid.message });
  }

  private handleChange = (event:any) => {
    let returnObj: any = {};
    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
  }

private handlenumberChange = (event:React.ChangeEvent<HTMLInputElement>) => {
 
 
  let value = event.target.value;
  // Allow only digits
  if (/^\d*$/.test(value)) {
     if(value.length > 4){
             value = value.slice(0, 4);

     }
    this.setState({ Reminder: value });
  }

  
}



  private handleonBlur = (event:any) => {
    let returnObj: Record<string, any> = {};
    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value.trim();
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
  }

  // Submit Form
private async insertorupdateListitem(formData: any, list: any) {
  this.setState({ loading: true });
  showLoader();

  try {
    if (this.state.ItemID === 0) {
      // Add new item
      const res = await sp.web.lists.getByTitle(list).items.add(formData);
      this.onSucess();
      console.log("Item added:", res);
    } else {
      // Update existing item
      const res = await sp.web.lists.getByTitle(list).items.getById(this.state.ItemID).update(formData);
      this.onUpdateSucess();
      console.log("Item updated:", res);
    }
  } catch (error) {
    console.error("Error inserting/updating item:", error);
   
  }finally{
    hideLoader();
  }
}


  // private insertorupdateListitem = (formData:any, list:any) => {
  //   this.setState({ loading: true });
  //    showLoader();
  //   if (this.state.ItemID == 0) {
       
  //     try {
  //       sp.web.lists.getByTitle(list).items.add(formData)
  //         .then((res) => {
  //           this.onSucess();
  //           //console.log(res);
  //         }, (Error) => {
  //           console.log(Error);
  //           this.onError();
  //         })
  //         .catch((err) => {
  //           console.log(Error);
  //           this.onError();
  //         });
  //     }
  //     catch (e) {
  //       console.log(e);
  //     }
  //   } else {
  //     sp.web.lists.getByTitle(list).items.getById(this.state.ItemID).update(formData).then((res) => {
  //       this.onUpdateSucess();
  //       //console.log(res);
  //     }, (Error) => {
  //       console.log(Error);
  //       this.onError();
  //     }).catch((err) => {
  //       this.onError();
  //       console.log(err);
  //     });
      
  //   }
  // }

  private onSucess = () => {
    showToast("success", "Client submitted successfully");
      this.setState({  showHideModal: false,addNewProgram:false, loading: false, isSuccess: true, ItemID: 0, Location: "",errorMessage: "" });
        this.GetOnloadData();
    this.resetProjectForm();
    // this.setState({ modalTitle: 'Success', modalText: 'Location submitted successfully', showHideModal: true, loading: false, isSuccess: true, ItemID: 0, Location: "",errorMessage: "" });
  }

  private onUpdateSucess = () => {
    showToast("success", "Client updated successfully");
           this.GetOnloadData();
    this.resetProjectForm();
    this.setState({  showHideModal: false, loading: false,addNewProgram:false, isSuccess: true, ItemID: 0, Location: "",errorMessage: "" });
  }

  private onError = () => {
    this.setState({
      loading: false, modalTitle: 'Error', modalText: 'Sorry! something went wrong', showHideModal: true, isSuccess: false, ItemID: 0, errorMessage: ""
    });
  }

  private checkDuplicates = async (formData:any) => {
    let TrList = 'Clients';
    var filterString;
    try {
      if (this.state.ItemID == 0)
        filterString = `Title eq '${formData.Title}'`;
      else
        filterString = `Title eq '${formData.Title}' and Id ne ${this.state.ItemID}`;
      await sp.web.lists.getByTitle(TrList).items.filter(filterString).get().
        then(async (response: any[]) => {
          if (response.length > 0)
           showToast("error", "Duplicate record not accept");
          else
           await this.insertorupdateListitem(formData, TrList);
        });
    }
    catch (e) {
      this.onError();
      console.log(e);
    }
    // return findduplicates
  }

  private cancelHandler = () => {
    this.resetProjectForm();
  }

  private resetProjectForm = () => {
    this.setState({ Location: '',Reminder:"",  SalesPersonEmails:[],SalesPersonIds:[], AlternativeSalesPersonEmails:[], AlternativeSalesPersonIds:[], ClientName:"",SaveUpdateText: 'Submit', addNewProgram: false,ItemID:0,pickerKey:Date.now() });
   // this.props.history.push('/Programs');
  
  }
  _getPeoplePickerItems = (items:any,type:string) => {

    if(type=='SalesPerson'){
      let SalesPersonIds:any=[];
       if(items.length > 0){
      items.forEach((item:any) => {SalesPersonIds.push(item.id)});
      this.setState({ SalesPersonIds: SalesPersonIds });
       }
       else{
        this.setState({ SalesPersonIds: [] });
       }
    }
    else if(type=='AlternativeSalesPerson'){
    let AlternativeSalesPersonIds:any= [];
      if(items.length > 0)
      {
    items.forEach((item:any)=> {AlternativeSalesPersonIds.push(item.id)});
     this.setState({ AlternativeSalesPersonIds: AlternativeSalesPersonIds });
      }
      else{
        this.setState({ AlternativeSalesPersonIds: [] });
      }
     
    }
      
   
            // Store selected users in state
  };

  private handleClose = () => {
    this.GetOnloadData();
    this.resetProjectForm();
    this.setState({ addNewProgram: false, showHideModal: false, Date: null, pr: '', IsActive: false });
  }

  private onEditClickHandler = async (id:any) => {
     showLoader();
    console.log('edit clicked', id);
    try {
 
       await sp.web.lists.getByTitle('Clients').items.getById(id).expand("Sales_x0020_Person_x0020_Name,Alternate_x0020_Sales_x0020_Pers").select("Sales_x0020_Person_x0020_Name/Id,Sales_x0020_Person_x0020_Name/EMail,Alternate_x0020_Sales_x0020_Pers/EMail,Alternate_x0020_Sales_x0020_Pers/Id,*").get()
        .then((response) => {
          console.log('response:', response);
          let SalesPersonEmails:any =[];
          let salesPersonIds:any =[];
          response.Sales_x0020_Person_x0020_Name ? response.Sales_x0020_Person_x0020_Name.forEach((person: any) =>{
            salesPersonIds.push(person.Id); // Sales Person Ids
            SalesPersonEmails.push(person.EMail); // Sales Person Emails
          }) : '';
          let AlternativeSalesPersonEmails:any =[];
          let AlternativeSalesPersonIds:any =[];
          response.Alternate_x0020_Sales_x0020_Pers ? response.Alternate_x0020_Sales_x0020_Pers.forEach((person: any) =>{
            AlternativeSalesPersonIds.push(person.Id); // Sales Person Ids
            AlternativeSalesPersonEmails.push(person.EMail); // Sales Person Emails
          }) : '';
          this.setState({
            addNewProgram: true,
            ClientName: response.Title,
            Location: response.Location,
            Reminder: response.Reminder,
            SalesPersonIds:salesPersonIds,
            SalesPersonEmails: SalesPersonEmails,
            AlternativeSalesPersonIds: AlternativeSalesPersonIds,
            AlternativeSalesPersonEmails: AlternativeSalesPersonEmails,
            ItemID: response.Id,
            SaveUpdateText: 'Update',
            errorMessage: ""
          },()=>{
            document.getElementById('txtclient')?.focus();
          });
         
        })
     
    }
    catch (e) {
      console.log('failed to fetch data for record :' + id);
    }finally{
      hideLoader();
    }
  }

  public resetImportField = () => {
    // var fileEle = document.getElementById("inputFile");
    (document.getElementById("inputFile") as HTMLInputElement).value = '';
  }

  public ErrorFileSelect = () => {
    this.resetImportField();
    this.setState({
      loading: false,
      modalTitle: 'Alert',
      modalText: 'Invalid Programs file selected',
      showHideModal: true,
      isSuccess: false
    });
  }
  private onMenuItemClick(event: any) {
    let item = document.getElementById('sideMenuNav');
    if (item) {
      item.classList.toggle('menu-hide');
    }
}
  public render() {
//     if (!this.state.isPermissionChecked || !this.state.isAdmin) {
//   const navIcon = document.querySelector('.click-nav-icon') as HTMLElement;
//   if (navIcon) {
//     navIcon.style.display = 'none';
//   }
// // }
//         if(!this.state.isPermissionChecked){
//          return null
//       }
      // if(!this.state.isAdmin){
      //  return <UnAuthorized spContext={this.props.spContext}></UnAuthorized>

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
                <NavLink title="Edit" className="csrLink ms-draggable" to={`/Client2/${record.Id}`}>
                  <FontAwesomeIcon icon={faEdit} onClick={() => { this.onEditClickHandler(record.Id); }}></FontAwesomeIcon>
                </NavLink>
              </div>
            </React.Fragment>
          );
        }
      },
      {
        name: "Client Name",
        //selector: 'Title',
        selector: (row:any, i:any) => row.Title,
        sortable: true
      },
      {
        name:"Location",
        selector: (row:any, i:any) => row.Location,
        sortable: true
      },
      {
        name: "Remainder SLA (#)",
        selector: (row:any, i:any) => row.Reminder,
        sortDate: true,
      },
      {
        name: "Sales Person(s)",
        selector: (row:any, i:any) => row.Sales_x0020_Person_x0020_Name,
        cell: (row:any)=> <div className='divSalesPerson' dangerouslySetInnerHTML={{ __html: row.Sales_x0020_Person_x0020_Name }}  />,
        sortable: true
      },
      {
        name: "Alternate Sales Person(s)",
        selector: (row:any, i:any) => row.Alternate_x0020_Sales_x0020_Pers,
        cell: (row:any)=> <div className='divAlterSalesPerson' dangerouslySetInnerHTML={{ __html: row.Alternate_x0020_Sales_x0020_Pers }}  />,
        sortable: true
      }
    

    ];
     if (this.state.isUnAuthorized) {
      return <UnAuthorized spContext={this.props.spContext}></UnAuthorized>
    }
    //var DatePicker = require("react-bootstrap-date-picker");
    else{
    return (
      <React.Fragment>
    

        <ModalPopUp title={this.state.modalTitle} modalText={this.state.modalText} isVisible={this.state.showHideModal} onClose={this.handleClose} isSuccess={this.state.isSuccess}></ModalPopUp>
          <div id="clickMenu" className="menu-icon-outer" onClick={(event) => this.onMenuItemClick(event)}>
              <div className="menu-icon">
              </div>
          </div>
          <div className='container-fluid'>
            <div className='FormContent'>
              <div className='title'> Clients
                {this.state.addNewProgram &&
                  <div className='mandatory-note'>
                    <span className='mandatoryhastrick'>*</span> indicates a required field
                  </div>
                }
              </div>

              <div className="after-title"></div>
              <div className="row justify-content-md-left">
                <div className="col-12 col-md-12">

                  {/* <div className={this.state.addNewProgram ? 'mx-2 activediv' : 'mx-2'}>
                    <div className="text-end py-2" id="">
                      <button type="button" id="btnSubmit" className="SubmitButtons btn" onClick={this.addNew}>Add</button>
                    </div>
                  </div> */}
                  <div className="light-box border-box-shadow m-2 pb-2">
                      <div className={this.state.addNewProgram ? 'mx-2 activediv' : 'mx-2'}>
                    <div className="text-end py-2" id="">
                      <button type="button" id="btnSubmit" className="SubmitButtons btn" onClick={this.addNew}>Add</button>
                    </div>
                  </div>
                    <div className={this.state.addNewProgram ? '' : 'activediv'}>
                      <div className="my-2">
                        <div className="row pt-2 px-2">
                           <div className="col-md-3">
                          <InputText
                            type='text'
                            label={"Client Name"}
                            name={"ClientName"}
                            InpuId='txtclient'
                            value={this.state.ClientName}
                            isRequired={true}
                            onChange={this.handleChange}
                            refElement={this.inputClientName}
                            onBlur={this.handleonBlur}
                          />


                          </div>
                              <div className="col-md-3">
                                                            <div className="light-text">
                                                               <label>Location <span className="mandatoryhastrick">*</span></label>
                                                                <select className="form-control" required={true} name="Location" value={this.state.Location} title="Location" onChange={this.handleChange} itemRef='Location' ref={this.inputLocation}>
                                                                    <option value=''>None</option>
                                                                    {this.state.Locations.map((location:any, index:any) => (
                                                                      <option key={index} value={location.value}>{location.label}</option>
                                                                    ))}
                                                                
                                                                </select>
                                                            </div>
                                                        </div>
                               <div className="col-md-3">
                           <InputText
                            type='text'
                            label={"Reminder SLA"}
                            name={"Reminder"}
                            value={this.state.Reminder}
                            isRequired={true}
                            onChange={this.handlenumberChange}
                            refElement={this.inputReminder}
                            onBlur={this.handleonBlur}
                          />
                           </div>
                           
                             <div className="col-md-3">
                               <div className="light-text c-people-picker">
                                  <label className='lblPeoplepicker'>Sales Person(s)<span className="mandatoryhastrick">*</span></label>
                              <div className="" id='DivPPSalesperson'>
                              <PeoplePicker
                                      context={this.props.context}
                                      titleText=""
                                      personSelectionLimit={3}
                                      showtooltip={false}
                                      disabled={false}
                                      ensureUser={true}
                                       key={this.state.pickerKey}
                                      onChange={(items) => this._getPeoplePickerItems(items,'SalesPerson')}
                                      defaultSelectedUsers={this.state.SalesPersonEmails}
                                     
                                      principalTypes={[PrincipalType.User]}
                                      ref={this.inputSalesPersonName}
                                     
                                    />
                         </div>
                         </div>
                         </div>
                        </div>
                     
                                                        
                       
      <div className="row pt-2 px-2">
                           <div className="col-md-3">
                            <div className="light-text c-people-picker">
                             <label className='lblPeoplepicker'>Alternate Sales Person(s)</label>
                                      <PeoplePicker
                                      context={this.props.context}
                                      titleText=""
                                      key={this.state.pickerKey}
                                      personSelectionLimit={3}
                                      showtooltip={false}
                                      disabled={false}
                                      ensureUser={true}
                                      onChange={(items) => this._getPeoplePickerItems(items,'AlternativeSalesPerson')}
                                      defaultSelectedUsers={this.state.AlternativeSalesPersonEmails}
                                      principalTypes={[PrincipalType.User]}
                                      ref={this.inputAlternativeSalesPersonName}
                                    />
                                    </div>
                        </div>
                    
                        </div>
                      </div>

                      <span className="text-validator" id="spanErrorMessage">{this.state.errorMessage}</span>

                      <div className="row mx-1" id="">
                        <div className="col-sm-12 text-center mt-2" id="">
                          <button type="button" id="btnSubmit" className="SubmitButtons btn" onClick={this.SubmitData}>{this.state.SaveUpdateText}</button>
                          <button type="button" id="btnCancel" className="CancelButtons btn" onClick={this.cancelHandler}>Cancel</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="light-box border-box-shadow mx-2 table-head-1st-td right-search-table py-2">
                    <TableGenerator columns={columns} data={this.state.data} fileName={'Location2'} onRowClick={(row:any)=>this.onEditClickHandler(row.Id)} ></TableGenerator>
                  </div>
                </div>
              </div>
            </div>
          </div>
       
      </React.Fragment>
    );
  }
  }
}

export default Client2;

