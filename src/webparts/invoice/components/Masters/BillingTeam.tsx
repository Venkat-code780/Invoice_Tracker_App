import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
import ModalPopUp from '../Shared/ModalPopUp';
import TableGenerator from '../Shared/TableGenerator';
import formValidation from '../Utilities/Formvalidator';
import { Navigate, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { showToast } from '../Utilities/toastHelper';
import { ControlType } from '../Utilities/Constants';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/controls/peoplepicker';
import { showLoader,hideLoader } from '../Shared/Loader';
import UnAuthorized from '../Shared/UnAuthorized.Component'
//import { result } from 'lodash';
//import { sortDate } from '@pnp/spfx-controls-react';


export interface BillingteamProps {
  match: any;
  spContext: any;
  spHttpClient: SPHttpClient;
  context: any;
  history: any;
}

export interface BillingteamState {


}

class BillingTeam extends React.Component<BillingteamProps, BillingteamState> {

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
    peoplePickerKey: 0,
    isPermissionChecked:false,
    isAdmin:false,
    SalesPersonIds: [],
    SalesPersonEmails: [],
    Location: '',
    Locations: [],
    IsActive: true,
    SaveUpdateText: 'Submit',
    addNewProgram: false,
    ItemID: 0,
    redirect: false,
        isUnAuthorized:false



  };



  private inputLocation: React.RefObject<HTMLSelectElement>;
  private inputSalesPersonName: React.RefObject<PeoplePicker>;



  constructor(props: any) {
    super(props);
    sp.setup({
      spfxContext: this.props.context
    });


    this.inputLocation = React.createRef<HTMLSelectElement>();
    this.inputSalesPersonName = React.createRef<PeoplePicker>();

  }

  public componentDidMount() {
    //console.log('Project Code:', this.props);
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
  public componentWillReceiveProps(newProps: any) {
    if (newProps.match.params.id == undefined)
      this.setState({ Location: '', SaveUpdateText: 'Submit', addNewProgram: false });
  }
  private GetOnloadData = () => {
    let Billingteamlist = 'BillingTeamMatrix';
    let locationlist = 'Location';

    try {

      // get all the items from a list
      sp.web.lists.getByTitle(locationlist).items.select('Title').get().then((Locations: any[]) => {
        const locationOptions = Locations.map(item => ({
          label: item.Title,
          value: item.Title
        })).filter(item => item.label !== '').sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }));
        this.setState({ Locations: locationOptions });
      }
      );

      sp.web.lists.getByTitle(Billingteamlist).items.expand("User").select("User/Title", "*").orderBy("Id", false).get().
        then((response: any[]) => {
          //console.log(response);
       
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

  private BindData(response: any) {
    let data: any = [];

    response.forEach((Item: any) => {
      let spNames = '';

      if (Item.User != null && Item.User.length > 0) {
        for (const user of Item.User) {
          spNames += "<div>" + user.Title + "</div>";
        }
      }


      data.push({
        Id: Item.Id,
        Location: Item.Location,
        User: Item.User != null ? spNames : '',





      });
    });


    this.setState({ data: data, loading: false, SaveUpdateText: 'Submit' });
  }

  // Add New button click event 
  private addNew = () => {
    this.setState({ addNewProgram: true,ItemID:0 },()=>{
      document.getElementById('ddlLocation')?.focus();
    });
  }

  private SubmitData = () => {
    let data = {
      location: { val: this.state.Location, required: true, Name: 'Location', Type: ControlType.string, Focusid: this.inputLocation },
      User: { val: this.state.SalesPersonIds, required: true, Name: 'User', Type: ControlType.people, Focusid: 'divPeopleUser' },

      // Sales_x0020_Person_x0020_Name: { val: this.state.SalesPersonIds, required: true, Name: 'Sales Person Name', Type: ControlType.people,focusid: this.inputSalesPersonName },
      // Alternate_x0020_Sales_x0020_Pers: { val: this.state.AlternativeSalesPersonIds, required: true, Name: 'Alternative Sales Person Name', Type: ControlType.string ,focusid: this.inputAlternativeSalesPersonName },


    };
    // let pdata = {
    //     User: { val: this.state.SalesPersonIds, required: true, Name: 'Sales Person Name', Type: ControlType.people,Focusid:'divPeopleUser' },
    // };
    let isValid = formValidation.checkValidations(data);
    // isValid = isValid.status ? formValidation.multiplePeoplePickerValidation(pdata) : isValid;
    var formdata = {
      Location: this.state.Location,
      UserId: { results: this.state.SalesPersonIds },


    };
    if (isValid.status)
      this.checkDuplicates(formdata);
    else
      showToast('error', isValid.message)
    // this.setState({ errorMessage: isValid.message });
  }

  private handleChange = async (event: any) => {
    let returnObj: any = {};
    if (event.target.name != 'IsActive')
      returnObj[event.target.name] = event.target.value;
    else
      returnObj[event.target.name] = event.target.checked;
    this.setState(returnObj);
    showLoader();
    await this.populateUsersForLocation(event.target.value);
  
  }
  private populateUsersForLocation = async (location: string) => {
    try {
      const items = await sp.web.lists.getByTitle('BillingTeamMatrix')
        .items.filter(`Location eq '${location}'`)
        .expand("User")
        .select("User/Id", "User/EMail")
        .get();

      let emails: string[] = [];
      let ids: number[] = [];

      items.forEach(item => {
        if (item.User && item.User.length > 0) {
          item.User.forEach((user: any) => {
            if (!emails.includes(user.EMail)) {
              emails.push(user.EMail);
              ids.push(user.Id);
            }
          });
        }
      });

      this.setState({
        SalesPersonEmails: emails,
        SalesPersonIds: ids,
        // force re-render
      });
         hideLoader();
    } catch (error) {
      console.error('Error fetching users for location:', error);
    }
  };


  // private handlenumberChange = (event:React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = event.target;
  //   const isNumeric = /^[0-9]*$/.test(value);
  //   if(isNumeric || value === '') {
  //     this.setState({ [name]: value });
  //   }
  // }



  //   private handleonBlur = (event:any) => {
  //     let returnObj: Record<string, any> = {};
  //     if (event.target.name != 'IsActive')
  //       returnObj[event.target.name] = event.target.value.trim();
  //     else
  //       returnObj[event.target.name] = event.target.checked;
  //     this.setState(returnObj);
  //   }

  // Submit Form


  private insertorupdateListitem = (formData: any, list: any) => {
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
    showToast('success', 'Billing Team Matrix submitted successfully');
    this.setState({ showHideModal: false, loading: false, addNewProgram: false, isSuccess: true, ItemID: 0, Location: "", errorMessage: "" });
    this.GetOnloadData();
    this.resetProjectForm();
  }

  private onUpdateSucess = () => {
    showToast('success', 'Billing Team Matrix updated successfully');
    this.GetOnloadData();
    this.resetProjectForm();
    this.setState({ addNewProgram: false, showHideModal: false, loading: false, isSuccess: true, ItemID: 0, Location: "", errorMessage: "" });
  }

  private onError = () => {
    showToast('error', 'Sorry! something went wrong');
    this.setState({ addNewProgram: false, showHideModal: false, loading: false, isSuccess: true, ItemID: 0, Location: "", errorMessage: "" })

  }

  // private checkDuplicates = (formData:any) => {
  //   let TrList = 'BillingTeamMatrix';
  //   var filterString;
  //   try {
  //     if (this.state.ItemID == 0)
  //       filterString = `Title eq '${formData.Title}'`;
  //     else
  //       filterString = `Title eq '${formData.Title}' and Id ne ${this.state.ItemID}`;
  //     sp.web.lists.getByTitle(TrList).items.filter(filterString).get().
  //       then((response: any[]) => {
  //         if (response.length > 0)

  //           this.setState({ errorMessage: 'Duplicate record not accept' });
  //         else
  //           this.insertorupdateListitem(formData, TrList);
  //       });
  //   }
  //   catch (e) {
  //     this.onError();
  //     console.log(e);
  //   }
  //   // return findduplicates
  // }

  private checkDuplicates = (formData: any) => {
    const listName = 'BillingTeamMatrix';

    try {
      const filterString = `Location eq '${formData.Location}'`;

      sp.web.lists.getByTitle(listName).items.filter(filterString).get()
        .then((response: any[]) => {
          if (response.length > 0) {
            // Update existing record
            const existingItemId = response[0].Id;
            this.setState({ ItemID: existingItemId }, () => {
              this.insertorupdateListitem(formData, listName);
            });
          } else {
            //  Insert new record
            this.setState({ ItemID: 0 }, () => {
              this.insertorupdateListitem(formData, listName);
            });
          }
        });
    } catch (e) {
      this.onError();
      console.log(e);
    }
  };




  private cancelHandler = () => {
    this.resetProjectForm();
  }

  private resetProjectForm = () => {
    this.setState({ Location: '', SalesPersonIds: [], SalesPersonEmails: [], peoplePickerKey: this.state.peoplePickerKey + 1, SaveUpdateText: 'Submit', addNewProgram: false });
    // this.props.history.push('/Programs');

  }
  _getPeoplePickerItems = (items: any, type: string) => {

    let SalesPersonIds: any = [];
    if (items.length > 0) {
      items.forEach((item: any) => { SalesPersonIds.push(item.id) });
    }
    else {
      SalesPersonIds = [];
    }
    this.setState({ SalesPersonIds: SalesPersonIds });


    // Store selected users in state
  };

  private handleClose = () => {
    this.GetOnloadData();
    this.resetProjectForm();
    this.setState({ addNewProgram: false, showHideModal: false, Date: null, pr: '', IsActive: false });
  }

  private onEditClickHandler = (id: any) => {
    showLoader();
    console.log('edit clicked', id);
    try {

      sp.web.lists.getByTitle('BillingTeamMatrix').items.getById(id).expand("User").select("User/EMail,User/Id,*").get()
        .then((response) => {
          console.log('response:', response);
          let SalesPersonEmails: any = [];
          let salesPersonIds: any = [];
          response.User ? response.User.forEach((person: any) => {
            salesPersonIds.push(person.Id); // Sales Person Ids
            SalesPersonEmails.push(person.EMail); // Sales Person Emails
          }) : '';
          this.setState({
            addNewProgram: true,
            Location: response.Location,
            SalesPersonIds: salesPersonIds,
            SalesPersonEmails: SalesPersonEmails,
            ItemID: response.Id,
            SaveUpdateText: 'Update',
            errorMessage: ""
          },()=>{
            document.getElementById('ddlLocation')?.focus();
          });
          console.log(this.state);
          hideLoader();
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
  // private  handleRowClicked = (row:any,Id?:any) => {
  //         let ID = row.Id?row.Id:Id;
  //         this.setState({ItemID:ID,redirect:true});
  //       }
  public render() {
  
    let columns = [
      {
        name: "Edit",
        //selector: "Id",
        selector: (row: { Id: any; }, i: any) => row.Id,
        cell: (record: { Id: any; }) => {
          return (
            <React.Fragment>
              <div style={{ paddingLeft: '10px' }}>
                <NavLink title="Edit" className="csrLink ms-draggable" to={`/BillingTeam/${record.Id}`}>
                  <FontAwesomeIcon icon={faEdit} onClick={() => { this.onEditClickHandler(record.Id); }}></FontAwesomeIcon>
                </NavLink>
              </div>
            </React.Fragment>
          );
        }
      },

      {
        name: "Location",
        selector: (row: any, i: any) => row.Location,
        sortable: true
      },

      {
        name: "User",
        selector: (row: any, i: any) => row.User,
        cell: (row: any) => <div className='divUser' dangerouslySetInnerHTML={{ __html: row.User }} />,
        sortable: true
      }



    ];
      if (this.state.isUnAuthorized) {
      return <UnAuthorized spContext={this.props.spContext}></UnAuthorized>
    }
    else if (this.state.redirect) {
      let url = `/BillingTeam/${this.state.ItemID}`;
      return (<Navigate to={url} />);
    }
     else{
    //var DatePicker = require("react-bootstrap-date-picker");
    return (
      <React.Fragment>
      

        <ModalPopUp title={this.state.modalTitle} modalText={this.state.modalText} isVisible={this.state.showHideModal} onClose={this.handleClose} isSuccess={this.state.isSuccess}></ModalPopUp>
        <div id="clickMenu" className="menu-icon-outer" onClick={(event) => this.onMenuItemClick(event)}>
          <div className="menu-icon">
          </div>
        </div>
        <div className='container-fluid'>
          <div className='FormContent'>
            <div className='title'> Billing Team Matrix
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
                      <div className="row pt-2 px-2">
                        <div className="col-md-4">
                          <div className="light-text">
                            <label>Location <span className="mandatoryhastrick">*</span></label>
                            <select className="form-control" id='ddlLocation' required={true} name="Location" value={this.state.Location} title="Location" onChange={this.handleChange} itemRef='Location' ref={this.inputLocation}>
                              <option value=''>None</option>
                              {this.state.Locations.map((location: any, index: any) => (
                                <option key={index} value={location.value}>{location.label}</option>
                              ))}

                            </select>
                          </div>
                        </div>
                        <div className="col-md-4" >
                          <div className="light-text c-people-picker">
                            <label className='lblPeoplepicker'>User <span className="mandatoryhastrick">*</span></label>
                            <div className="" id="divPeopleUser">
                              <PeoplePicker
                                context={this.props.context}
                                titleText=""
                                personSelectionLimit={3}
                                showtooltip={false}
                                disabled={false}
                                ensureUser={true}
                                key={this.state.peoplePickerKey}
                                onChange={(items) => this._getPeoplePickerItems(items, 'SalesPerson')}
                                defaultSelectedUsers={this.state.SalesPersonEmails}
                                principalTypes={[PrincipalType.User]}
                                ref={this.inputSalesPersonName}


                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-md-3">

                          <div className="col-sm-12 text-center mt-2 d-flex justify-content-center gap-2" id="">
                     
                            <button type="button" id="btnSubmit" className="SubmitButtons btn" onClick={this.SubmitData}>{this.state.SaveUpdateText}</button>
                      
                            <button type="button" id="btnCancel" className="CancelButtons btn" onClick={this.cancelHandler}>Cancel</button>
                          </div>

                        </div>
                      </div>





                    </div>

                    <span className="text-validator" id="spanErrorMessage">{this.state.errorMessage}</span>


                  </div>
                </div>

                <div className="light-box border-box-shadow mx-2 table-head-1st-td right-search-table py-2">
                  <TableGenerator columns={columns} data={this.state.data} fileName={'Location2'} onRowClick={(row: any) => this.onEditClickHandler(row.Id)} ></TableGenerator>
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

export default BillingTeam;

