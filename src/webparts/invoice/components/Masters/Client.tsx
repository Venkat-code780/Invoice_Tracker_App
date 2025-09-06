// import * as React from 'react';
// import {
//   PrimaryButton,
//   DefaultButton,
//   TextField,
//   Dropdown,
//   IDropdownOption,
//   Modal,
//   DetailsList,
//   DetailsListLayoutMode,
//   SelectionMode
// } from '@fluentui/react';
// import { sp } from '@pnp/sp/presets/all';
// import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/controls/peoplepicker';
// // import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/controls/peoplepicker";

// interface IClientProps {
//   context: any;
// }

// interface IClientState {
//   locations: IDropdownOption[];
//   formData: {
//     firstName: string;
//     lastName: string;
//     locationId: string;
//   };
//   isModalOpen: boolean;
//   submittedData: any[];
//   selectedUsers: any[];
//   RequisitionerUserId: number | null;
// }

// class Client extends React.Component<IClientProps, IClientState> {
//   constructor(props: IClientProps) {
//     super(props);
//     this.state = {
//       locations: [],
//       formData: {
//         firstName: '',
//         lastName: '',
//         locationId: ''
//       },
//       isModalOpen: false,
//       submittedData: [],
//       selectedUsers: [],
//       RequisitionerUserId: null
//     };
//   }

//   async componentDidMount() {
//     sp.setup({ spfxContext: this.props.context });
//     this.fetchLocations();
//   }

//   fetchLocations = async () => {
//     const items = await sp.web.lists.getByTitle('Location').items.get();
//     const locationOptions: IDropdownOption[] = items.map((item: { ID: number; Title: string }) => ({
//       key: item.ID,
//       text: item.Title
//     }));
//     this.setState({ locations: locationOptions });
//   };

//   handleChange = (
//     event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
//     newValue?: string
//   ) => {
//     const name = (event.target as HTMLInputElement).name;
//     this.setState(prevState => ({
//       formData: { ...prevState.formData, [name]: newValue || '' }
//     }));
//   };

//   handleDropdownChange = (
//     event: React.FormEvent<HTMLDivElement>,
//     option?: IDropdownOption
//   ) => {
//     if (option) {
//       this.setState(prevState => ({
//         formData: { ...prevState.formData, locationId: option.key.toString() }
//       }));
//     }
//   };

//    _getPeoplePickerItems(items: any[], name: string) {
//     let RequisitionerUserId = null;
//     if (items.length > 0) {
//         RequisitionerUserId = items[0].id;
//     }
//     else {
//         RequisitionerUserId = null;
//     }
//     this.setState({ RequisitionerUserId: RequisitionerUserId });
// }

//   handleSubmit = () => {
//     const { firstName, lastName, locationId } = this.state.formData;
//     if (firstName && lastName && locationId) {
//       const locationText = this.state.locations.find(loc => loc.key.toString() === locationId)?.text || '';
//       const newSubmittedData = {
//         'Client Name ': firstName,
//         'Reminder SLA': lastName,
//         location: locationText
//       };
//       this.setState(prevState => ({
//         submittedData: [...prevState.submittedData, newSubmittedData],
//         isModalOpen: false,
//         formData: { firstName: '', lastName: '', locationId: '' },
//         selectedUsers: []
//       }));
//     } else {
//       alert('Please fill out all fields!');
//     }
//   };

//   render() {
//     const { locations, formData, isModalOpen, submittedData } = this.state;

//     const columns = [
//       {
//         key: 'Client Name ',
//         name: 'Client Name ',
//         fieldName: 'Client Name ',
//         minWidth: 100,
//         isMultiline: false
//       },
//       {
//         key: 'Reminder SLA',
//         name: 'Reminder SLA',
//         fieldName: 'Reminder SLA',
//         minWidth: 100,
//         isMultiline: false
//       },
//       {
//         key: 'location',
//         name: 'Location',
//         fieldName: 'location',
//         minWidth: 150,
//         isMultiline: false
//       },
//       {
//         key: 'Sales Person',
//         name: 'Sales Person',
//         fieldName: 'Sales Person',
//         minWidth: 150,
//         isMultiline: false
//       },
//       {
//         key: 'Alternate Sales Person',
//         name: 'Alternate Sales Person',
//         fieldName: 'Alternate Sales Person',
//         minWidth: 150,
//         isMultiline: false
//       }

//     ];

//     return (
//       <div className="componentSection">
//         <h2>Client</h2>
//         <PrimaryButton text="+ Add" onClick={() => this.setState({ isModalOpen: true })} />

//         <Modal isOpen={isModalOpen} onDismiss={() => this.setState({ isModalOpen: false })}>
//           <div style={{ padding: 20 }}>
//             <h3>Fill out your details</h3>

//             <TextField
//               label="Client Name"
//               name="firstName"
//               value={formData.firstName}
//               onChange={this.handleChange}
//               required
//             />
//             <TextField
//               label="Reminder SLA"
//               name="lastName"
//               value={formData.lastName}
//               onChange={this.handleChange}
//               required
//             />
//             <Dropdown
//               label="Location"
//               options={locations}
//               selectedKey={formData.locationId}
//               onChange={this.handleDropdownChange}
//               required
//             />
//             {/* <PeoplePicker
//               context={this.props.context}
//               titleText="Select Users"
//               personSelectionLimit={1}
//               showtooltip={true}
//             //   disabled={true}
//             //   onChange={(items) => this._getPeoplePickerItems(items, 'RequisitionerId')}
//             resolveDelay={1000}
//             ensureUser={true}
//               principalTypes={[PrincipalType.User]} peoplePickerCntrlclassName={"input-peoplePicker-custom"}
//             /> */}
//             <PeoplePicker
                
//                 context={this.props.context}
//                 titleText="Sales Person(s)"
//                 personSelectionLimit={3}
//                 showtooltip={false}
//                 disabled={false}
//                 ensureUser={true}
//                 required={true}
//                 onChange={(items) => this._getPeoplePickerItems(items, 'RequisitionerId')}
//                 principalTypes={[PrincipalType.User]}
//             />
//                  <PeoplePicker
                
//                 context={this.props.context}
//                 titleText="Alternate Sales Person(s)"
//                 personSelectionLimit={3}
//                 showtooltip={false}
//                 disabled={false}
//                 ensureUser={true}
//                 required={true}
//                 onChange={(items) => this._getPeoplePickerItems(items, 'RequisitionerId')}
//                 principalTypes={[PrincipalType.User]}
//             />
//             <PrimaryButton text="Submit" onClick={this.handleSubmit} style={{ marginRight: 10 }} />
//             <DefaultButton text="Cancel" onClick={() => this.setState({ isModalOpen: false })} />
//           </div>
//         </Modal>

//         <div style={{ marginTop: 20 }}>
         
//           <DetailsList
//             items={submittedData}
//             columns={columns}
//             layoutMode={DetailsListLayoutMode.fixedColumns}
//             selectionMode={SelectionMode.none}
//           />
//         </div>
//       </div>
//     );
//   }
// }

// export default Client;



import * as React from 'react';
import {
  PrimaryButton,
  DefaultButton,
  TextField,
  Dropdown,
  IDropdownOption,
  Modal,
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode
} from '@fluentui/react';
import { sp } from '@pnp/sp/presets/all';
import { PeoplePicker, PrincipalType } from '@pnp/spfx-controls-react/lib/controls/peoplepicker';

interface IClientProps {
  context: any;
}

interface IClientState {
  locations: IDropdownOption[];
  formData: {
    ClientName: string;
    ReminderSLA: string;
    locationId: string;
  };
  isModalOpen: boolean;
  submittedData: any[];
  selectedUsers: any[]; // Keep track of selected users
}

class Client extends React.Component<IClientProps, IClientState> {
  constructor(props: IClientProps) {
    super(props);
    this.state = {
      locations: [],
      formData: {
        ClientName: '',
        ReminderSLA: '',
        locationId: ''
      },
      isModalOpen: false,
      submittedData: [],
      selectedUsers: [] // Initialize selectedUsers as an empty array
    };
  }

  async componentDidMount() {
    sp.setup({ spfxContext: this.props.context });
    this.fetchLocations();
  }

  fetchLocations = async () => {
    const items = await sp.web.lists.getByTitle('Location').items.get();
    const locationOptions: IDropdownOption[] = items.map((item: { ID: number; Title: string }) => ({
      key: item.ID,
      text: item.Title
    }));
    this.setState({ locations: locationOptions });
  };

  handleChange = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ) => {
    const name = (event.target as HTMLInputElement).name;
    this.setState(prevState => ({
      formData: { ...prevState.formData, [name]: newValue || '' }
    }));
  };

  handleDropdownChange = (
    event: React.FormEvent<HTMLDivElement>,
    option?: IDropdownOption
  ) => {
    if (option) {
      this.setState(prevState => ({
        formData: { ...prevState.formData, locationId: option.key.toString() }
      }));
    }
  };

  _getPeoplePickerItems = (items: any[]) => {
    this.setState({ selectedUsers: items }); // Store selected users in state
  };

  handleSubmit = async () => {
    const { ClientName } = this.state.formData;
    const { selectedUsers } = this.state;

    // const locationText = this.state.locations.find(loc => loc.key.toString() === locationId)?.text || '';

    // Create a new client entry object
    // const newClientData = {
    //   Title: ClientName,  // Assuming 'Title' is the field for full name
    //   Location: locationId,
    //   Sales_x0020_Person_x0020_Name: { results: selectedUsers.map(user => parseInt(user.id)) }, // Storing user IDs as an array of IDs
    //   Alternate_x0020_Sales_x0020_Person_x0020_Name :{results:selectedUsers.map(user => parseInt(user.id))},  // Can store another field for alternate users
    // };
    let postObject = { 
      Title: ClientName,  // Assuming 'Title' is the field for full name
      Location: location,
      'Sales_x0020_Person_x0020_Name.Id': selectedUsers.map(user => parseInt(user.id)), // Storing user IDs as an array of IDs
      'Alternate_x0020_Sales_x0020_Person_x0020_Name.Id': selectedUsers.map(user => parseInt(user.id)),  // Can store another field for alternate users
    }

    try {
      // Post the data to SharePoint list
      await sp.web.lists.getByTitle('Clients').items.add(postObject);

      // Fetch the updated list data after the item has been added
      const items = await sp.web.lists.getByTitle('Clients').items.get();
      const submittedData = items.map(item => ({
        'Company Name': item.Title,
        'Reminder SLA': item.ReminderSLA,
        location: item.LocationText,
        'Sales Person': item.SalesPersonId,
        'Alternate Sales Person': item.AlternateSalesPersonId
      }));

      // Update the state with the new data
      this.setState(prevState => ({
        submittedData,
        isModalOpen: false,
        formData: { ClientName: '', ReminderSLA: '', locationId: '' },
        selectedUsers: [] // Reset selected users after submission
      }));
    } catch (error) {
      console.error("Error posting data to SharePoint:", error);
      alert("There was an error submitting the data.");
    }
  };

  render() {
    const { locations, formData, isModalOpen, submittedData } = this.state;

    const columns = [
      {
        key: 'Company Name',
        name: 'Company Name',
        fieldName: 'Company Name',
        minWidth: 100,
        isMultiline: false
      },
      {
        key: 'Reminder SLA',
        name: 'Reminder SLA',
        fieldName: 'Reminder SLA',
        minWidth: 100,
        isMultiline: false
      },
      {
        key: 'location',
        name: 'Location',
        fieldName: 'location',
        minWidth: 150,
        isMultiline: false
      },
      {
        key: 'Sales Person',
        name: 'Sales Person',
        fieldName: 'Sales Person',
        minWidth: 150,
        isMultiline: false
      },
      {
        key: 'Alternate Sales Person',
        name: 'Alternate Sales Person',
        fieldName: 'Alternate Sales Person',
        minWidth: 150,
        isMultiline: false
      }
    ];

    return (
      <div className="componentSection">
        <h2>Client</h2>
        <PrimaryButton text="+ Add" onClick={() => this.setState({ isModalOpen: true })} />

        <Modal isOpen={isModalOpen} onDismiss={() => this.setState({ isModalOpen: false })}>
          <div style={{ padding: 20 }}>
            <h3>Fill out your details</h3>

            <TextField
              label="Client Name"
              name="ClientName"
              value={formData.ClientName}
              onChange={this.handleChange}
            />
            <TextField
              label="Reminder SLA"
              name="ReminderSLA"
              value={formData.ReminderSLA}
              onChange={this.handleChange}
            />
            <Dropdown
              label="Location"
              options={locations}
              selectedKey={formData.locationId}

              onChange={this.handleDropdownChange}
            />
            <PeoplePicker
              context={this.props.context}
              titleText="Sales Person(s)"
              personSelectionLimit={3}
              showtooltip={false}
              disabled={false}
              ensureUser={true}
              onChange={(items) => this._getPeoplePickerItems(items)}
              principalTypes={[PrincipalType.User]}
            />
            <PeoplePicker
              context={this.props.context}
              titleText="Alternate Sales Person(s)"
              personSelectionLimit={3}
              showtooltip={false}
              disabled={false}
              ensureUser={true}
              onChange={(items) => this._getPeoplePickerItems(items)}
              principalTypes={[PrincipalType.User]}
            />
            <PrimaryButton text="Submit" onClick={this.handleSubmit} style={{ marginRight: 10 }} />
            <DefaultButton text="Cancel" onClick={() => this.setState({ isModalOpen: false })} />
          </div>
        </Modal>

        <div style={{ marginTop: 20 }}>
          <DetailsList
            items={submittedData}
            columns={columns}
            layoutMode={DetailsListLayoutMode.fixedColumns}
            selectionMode={SelectionMode.none}
          />
        </div>
      </div>
    );
  }
}

export default Client;



