import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
import ModalPopUp from '../Shared/ModalPopUp';
import InputText from '../Shared/InputText';
import TableGenerator from '../Shared/TableGenerator';
import formValidation from '../Utilities/Formvalidator';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

import { ControlType } from '../Utilities/Constants';
import { showToast } from '../Utilities/toastHelper';
import { showLoader,hideLoader } from '../Shared/Loader';
import UnAuthorized from '../Shared/UnAuthorized.Component'

export interface LocationProps {
  match: any;
  spContext: any;
  spHttpClient: SPHttpClient;
  context: any;
  history: any;
}

export interface LocationState {

}

class LocationRe extends React.Component<LocationProps, LocationState>{

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
    isAdmin:false,
    isPermissionChecked:false,
    Location: '',
    IsActive: true,
    SaveUpdateText: 'Submit',
    addNewProgram: false,
    ItemID: 0,
    ImportedExcelData: [],
        isUnAuthorized:false

  };

  private inputProgram;
 
  constructor(props:any) {
    super(props);
    sp.setup({
      spfxContext: this.props.context
    });
    this.inputProgram = React.createRef();
  
  }

  public componentDidMount() {
    //console.log('Project Code:', this.props);
        document.getElementById('btnSubmit')?.focus();

    showLoader();

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
  private GetOnloadData = () => {
    let TrList = 'Location';
    try {

      // get all the items from a list
      sp.web.lists.getByTitle(TrList).items.orderBy("Id", false).get().
        then((response: any[]) => {
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
      data.push({
        Id: Item.Id,
        Title: Item.Title,
      });
    });

    this.setState({ data: data, loading: false, SaveUpdateText: 'Submit' });
  }

  // Add New button click event 
  private addNew = () => {
    this.setState({ addNewProgram: true,ItemID:0 },()=>{
      document.getElementById('txtLocation')?.focus();

    });

  }

  private handleChange = (event:any) => {
    let returnObj: Record<string, any> = {};
    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
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
  private SubmitData = () => {
    let data = {
      location: { val: this.state.Location, required: true, Name: 'Location', Type: ControlType.string, Focusid: this.inputProgram },
  
    };
    let isValid = formValidation.checkValidations(data);
    var formdata = {
      Title: this.state.Location,

    };
    if (isValid.status)
      this.checkDuplicates(formdata);
    else
      showToast("error", isValid.message);
      // this.setState({ errorMessage: isValid.message });
  }

  private insertorupdateListitem = (formData:any, list:any) => {
    this.setState({ loading: true });
    if (this.state.ItemID == 0) {
      try {
        sp.web.lists.getByTitle(list).items.add(formData)
          .then((res) => {
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
      catch (e) {
        console.log(e);
      }
    } else {
      sp.web.lists.getByTitle(list).items.getById(this.state.ItemID).update(formData).then((res) => {
        this.onUpdateSucess();
        //console.log(res);
      }, (Error) => {
        console.log(Error);
        this.onError();
      }).catch((err) => {
        this.onError();
        console.log(err);
      });
    }
  }

  private onSucess = () => {
    showToast("success", "Location submitted successfully");
    this.setState({  showHideModal: false,addNewProgram:false, loading: false, isSuccess: true, ItemID: 0, Location: "",errorMessage: "" });
    this.GetOnloadData();
     this.resetProjectForm();
  }

  private onUpdateSucess = () => {
    showToast("success", "Location updated successfully");
    this.setState({ showHideModal: false, loading: false,addNewProgram:false, isSuccess: true, ItemID: 0, Location: "",errorMessage: "" });
       this.GetOnloadData();
     this.resetProjectForm();
  }

  private onError = () => {
    this.setState({
      loading: false, modalTitle: 'Error', modalText: 'Sorry! something went wrong', showHideModal: true, isSuccess: false, ItemID: 0, errorMessage: ""
    });
  }

  private checkDuplicates = (formData:any) => {
    let TrList = 'Location';
    var filterString;
    try {
      if (this.state.ItemID == 0)
        filterString = `Title eq '${formData.Title}'`;
      else
        filterString = `Title eq '${formData.Title}' and Id ne ${this.state.ItemID}`;
      sp.web.lists.getByTitle(TrList).items.filter(filterString).get().
        then((response: any[]) => {
          if (response.length > 0)
            showToast("error", "Duplicate record not accept");
            // this.setState({ errorMessage: 'Duplicate record not accept' });
          else
            this.insertorupdateListitem(formData, TrList);
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
    this.setState({ Location: '',SaveUpdateText: 'Submit', addNewProgram: false });
   // this.props.history.push('/Programs');
  
  }

  private handleClose = () => {
    this.GetOnloadData();
    this.resetProjectForm();
    this.setState({ addNewProgram: false, showHideModal: false, Date: null, pr: '', IsActive: false });
  }

  private onEditClickHandler = (id:any) => {
    console.log('edit clicked', id);
    try {
      sp.web.lists.getByTitle('Location').items.getById(id).get()
        .then((response) => {
          console.log('response:', response);
          this.setState({
            addNewProgram: true,
            Location: response.Title.trim(),
            ItemID: response.Id,
            SaveUpdateText: 'Update',
            errorMessage: "",
        
          },()=>{
             document.getElementById('txtLocation')?.focus();
          });
          console.log(this.state);
        })
        .catch(e => {
          console.log('Failed to fetch :' + e);
        });
    }
    catch (e) {
      console.log('failed to fetch data for record :' + id);
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
//         if (!this.state.isPermissionChecked || !this.state.isAdmin) {
//   const navIcon = document.querySelector('.click-nav-icon') as HTMLElement;
//   if (navIcon) {
//     navIcon.style.display = 'none';
//   }
// }
       
      // if(!this.state.isPermissionChecked){
      //    return null
      // }
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
                <NavLink title="Edit" className="csrLink ms-draggable" to={`/Location2/${record.Id}`}>
                  <FontAwesomeIcon icon={faEdit} onClick={() => { this.onEditClickHandler(record.Id); }}></FontAwesomeIcon>
                </NavLink>
              </div>
            </React.Fragment>
          );
        }
      
      },
      {
        name: "Location",
        //selector: 'Title',
        selector: (row:any, i:any) => row.Title,
        sortable: true
      }
    ];
      if (this.state.isUnAuthorized) {
      return <UnAuthorized spContext={this.props.spContext}></UnAuthorized>
    }
    else{
    //var DatePicker = require("react-bootstrap-date-picker");
    return (
      <React.Fragment>
    

        <ModalPopUp title={this.state.modalTitle} modalText={this.state.modalText} isVisible={this.state.showHideModal} onClose={this.handleClose} isSuccess={this.state.isSuccess}></ModalPopUp>
        <div id="content" className="content p-2 pt-2">
          <div id="clickMenu" className="menu-icon-outer" onClick={(event) => this.onMenuItemClick(event)}>
              <div className="menu-icon">
              </div>
          </div>
          <div className='container-fluid'>
            <div className='FormContent'>
              <div className='title'> Locations
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
                  <div className="light-box border-box-shadow mx-2 pb-2">
                         <div className={this.state.addNewProgram ? 'mx-2 activediv' : 'mx-2'}>
                    <div className="text-end py-2" id="">
                      <button type="button" id="btnSubmit" className="SubmitButtons btn" onClick={this.addNew}>Add</button>
                    </div>
                  </div>
                    <div className={this.state.addNewProgram ? '' : 'activediv'}>
                      <div className="my-2">
                        <div className="p-3">
                          <InputText
                            InpuId='txtLocation'
                            type='text'
                            label={"Location"}
                            name={"Location"}
                            value={this.state.Location}
                            isRequired={true}
                            onChange={this.handleChange}
                            refElement={this.inputProgram}
                            onBlur={this.handleonBlur}
                          />
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
        </div>
      </React.Fragment>
    );
  }
  }
}

export default LocationRe;

