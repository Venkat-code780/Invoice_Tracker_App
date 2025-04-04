// import * as React from 'react';
// import { Component } from 'react';
// import { sp } from '@pnp/sp';
// import "@pnp/sp/webs";
// import "@pnp/sp/lists";
// import "@pnp/sp/items";
// import "@pnp/sp/attachments";
// import "@pnp/sp/webs";
// import "@pnp/sp/sputilities";
// import "@pnp/sp/files";
// import "@pnp/sp/folders";
// import "@pnp/sp/site-users/web";
// import "@pnp/sp/site-groups";
// import {
//     TextField,
//     Dropdown,
//     IDropdownOption,
//     DatePicker,
//     PrimaryButton,
//     DefaultButton,
//     ChoiceGroup,
//     IChoiceGroupOption,
//     Label,
// } from "@fluentui/react";

// interface IEstimationFormState {
//     formData: {
//         projectType: string;
//         location: string;
//         clientName: string;
//         estimationFor: string;
//         title: string;
//         projectTitle: string;
//         estimatedHours: string;
//         submittedDate: Date | null;
//         remarks: string;
//         attachment: any;
//     };
//     locations: IDropdownOption[];
//     clientNames: IDropdownOption[];
//     existingProjects: IDropdownOption[];

// }

//   export interface IEstimationFormProps {
//     match: any;
//     spContext: any;
//     context: any;
//     history: any;
// }

// class EstimationForm extends Component<IEstimationFormProps, IEstimationFormState> {
//     constructor(props: IEstimationFormProps) {
//         super(props);
//         sp.setup({
//           spfxContext: this.props.context
//       });
//         this.state = {
//             formData: {
//                 projectType: "new",
//                 location: "",
//                 clientName: "",
//                 estimationFor: "",
//                 title: "",
//                 projectTitle: "",
//                 estimatedHours: "",
//                 submittedDate: null,
//                 remarks: "",
//                 attachment: null,
//             },
//             locations: [],
//             clientNames: [],
//             existingProjects: []
            
       
//         };
//     }

//     componentDidMount() {
//         sp.web.lists.getByTitle("Location").items.select("Title", "ID").get().then((items) => {
//             const options = items.map((item) => ({ key: item.Title, text: item.Title }));
//             this.setState({ locations: options });
//         });

//         sp.web.lists.getByTitle("Clients").items.select("Title", "ID").get().then((items) => {
//             const clientOptions = items.map((item) => ({ key: item.ID, text: item.Title }));
//             this.setState({ clientNames: clientOptions});
           
//         })
//     }

    

//     handleChoiceGroupChange = (_event: React.FormEvent<HTMLInputElement>, option?: IChoiceGroupOption) => {
//         this.setState((prevState) => ({
//             formData: {
//                 ...prevState.formData,
//                 projectType: option?.key || "new",
//             }
//         }));
//     };

//     handleChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
//         const value = e.currentTarget.value;
//         this.setState((prevState) => ({
//             formData: {
//                 ...prevState.formData,
//                 [field]: value,
//             }
//         }));
//     };

//     render() {
//         const { formData, locations,clientNames } = this.state;
        

//         const projectOptions: IChoiceGroupOption[] = [
//             { key: "new", text: "New Project" },
//             { key: "existing", text: "Existing Project" },
//         ];
//         const estimationsfor: IDropdownOption[] = [
//             { key: "Project", text: "Project" },
//             { key: "CR", text: "CR" },
//             { key: "Consultant", text: "Consultant" },
//             { key: "Support", text: "Support"},


//         ];

//         return (
//             <div>
//                 <h2 style={{ backgroundColor: "#5C2D91", color: "#fff", padding: "10px 15px", margin: 0 }}>Estimations</h2>

//                 <div style={{ padding: 15 }}>
//                     <label>Estimation Details</label>
//                     <ChoiceGroup
//                         options={projectOptions}
//                         selectedKey={formData.projectType}
//                         onChange={this.handleChoiceGroupChange}
//                     />

//                     <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
//                         <Dropdown
//                             label="Location "
//                             options={locations}
//                             selectedKey={formData.location || null}
//                             required
//                             onChange={(_, option) => this.handleChange({ currentTarget: { value: option?.key || '' } } as React.FormEvent<HTMLInputElement>, 'location')}
//                         />
//                         <Dropdown
//                             label="Client Name "
//                             options={clientNames}
//                             selectedKey={formData.clientName || null}
//                             required
//                             onChange={(_, option) => this.handleChange({ currentTarget: { value: option?.key || '' } } as React.FormEvent<HTMLInputElement>, 'clientName')}
//                         />
//                     </div>
//                     <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
//                         <Dropdown
//                             label="Estimations For"
//                             options={estimationsfor}
//                             selectedKey={formData.estimationFor}
//                             onChange={(_, option) => this.handleChange({ currentTarget: { value: option?.key || '' } } as React.FormEvent<HTMLInputElement>, 'estimationFor')}
//                         />
//                         <TextField
//                             label="Title of the Estimation "
//                             value={formData.title}
//                             required
//                             onChange={(e) => this.handleChange(e, 'title')}
//                         />
//                     </div>
                         
                      






                    
//                     <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
//                         <TextField
//                             label="Title of the Project *"
//                             value={formData.projectTitle}
//                             required
//                             onChange={(e) => this.handleChange(e, 'projectTitle')}
//                         />
//                         <TextField
//                             label="Estimated Hours *"
//                             value={formData.estimatedHours}
//                             placeholder="Please Enter Hours"
//                             required
//                             onChange={(e) => this.handleChange(e, 'estimatedHours')}
//                         />
//                     </div>
//                     <DatePicker
//                         label="Submitted Date *"
//                         placeholder="MM/DD/YYYY"
//                         isRequired
//                         value={formData.submittedDate || undefined}
//                         onSelectDate={(date) => this.setState({ formData: { ...formData, submittedDate: date || null } })}
//                     />
//                     <TextField
//                         label="Remarks"
//                         multiline
//                         rows={4}
//                         value={formData.remarks}
//                         onChange={(e) => this.handleChange(e, 'remarks')}
//                     />
//                     <Label>Attachment *</Label>
//                     <DefaultButton text="Upload a file 📁" />

//                     <div style={{ marginTop: 20 }}>
//                         <PrimaryButton text="Save" styles={{ root: { marginRight: 10 } }} />
//                         <PrimaryButton text="Submit" />
//                         <DefaultButton text="Cancel" styles={{ root: { marginLeft: 10 } }} />
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// }

// export default EstimationForm;




import * as React from 'react';
import { Component } from 'react';
import { sp } from '@pnp/sp';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import "@pnp/sp/webs";
import "@pnp/sp/sputilities";
import "@pnp/sp/files";
import "@pnp/sp/folders";
import "@pnp/sp/site-users/web";
import "@pnp/sp/site-groups";
import {
    TextField,
    Dropdown,
    IDropdownOption,
    DatePicker,
    PrimaryButton,
    DefaultButton,
    ChoiceGroup,
    IChoiceGroupOption,
    Label,
} from "@fluentui/react";

interface IEstimationFormState {
    formData: {
        projectType: string;
        location: string;
        clientName: string;
        estimationFor: string;
        title: string;
        projectTitle: string;
        estimatedHours: string;
        submittedDate: Date | null;
        remarks: string;
        attachment: any;
    };
    locations: IDropdownOption[];
    clientNames: IDropdownOption[];
    existingProjects: IDropdownOption[]; // Added for existing projects
}

export interface IEstimationFormProps {
    match: any;
    spContext: any;
    context: any;
    history: any;
}

class EstimationForm extends Component<IEstimationFormProps, IEstimationFormState> {
    constructor(props: IEstimationFormProps) {
        super(props);
        sp.setup({
            spfxContext: this.props.context
        });
        this.state = {
            formData: {
                projectType: "new",
                location: "",
                clientName: "",
                estimationFor: "",
                title: "",
                projectTitle: "",
                estimatedHours: "",
                submittedDate: null,
                remarks: "",
                attachment: null,
            },
            locations: [],
            clientNames: [],
            existingProjects: [], // Initialize existingProjects
        };
    }

    componentDidMount() {
        sp.web.lists.getByTitle("Location").items.select("Title", "ID").get().then((items) => {
            const options = items.map((item) => ({ key: item.Title, text: item.Title }));
            this.setState({ locations: options });
        });

        sp.web.lists.getByTitle("Clients").items.select("Title", "ID").get().then((items) => {
            const clientOptions = items.map((item) => ({ key: item.ID, text: item.Title }));
            this.setState({ clientNames: clientOptions });
        });

        // Fetch existing projects if 'existing' project type is selected
        sp.web.lists.getByTitle("Estimations").items.select("Title", "ID").get().then((items) => {
            const projectOptions = items.map((item) => ({ key: item.ID, text: item.Title }));
            this.setState({ existingProjects: projectOptions });
        });
    }

    handleChoiceGroupChange = (_event: React.FormEvent<HTMLInputElement>, option?: IChoiceGroupOption) => {
        this.setState((prevState) => ({
            formData: {
                ...prevState.formData,
                projectType: option?.key || "new",
            }
        }));
    };

    handleChange = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
        const value = e.currentTarget.value;
        this.setState((prevState) => ({
            formData: {
                ...prevState.formData,
                [field]: value,
            }
        }));
    };

    render() {
        const { formData, locations, clientNames, existingProjects } = this.state;

        const projectOptions: IChoiceGroupOption[] = [
            { key: "new", text: "New Project" },
            { key: "existing", text: "Existing Project" },
        ];
        const estimationsfor: IDropdownOption[] = [
            { key: "Project", text: "Project" },
            { key: "CR", text: "CR" },
            { key: "Consultant", text: "Consultant" },
            { key: "Support", text: "Support" },
        ];

        return (
            <div className='componentSection'>
                <h2 style={{ backgroundColor: "#5C2D91", color: "#fff", padding: "10px 15px", margin: 0 }}>Estimations</h2>

                <div style={{ padding: 15 }}>
                    <label>Estimation Details</label>
                    <ChoiceGroup
                        options={projectOptions}
                        selectedKey={formData.projectType}
                        onChange={this.handleChoiceGroupChange}
                    />

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        <Dropdown
                            label="Location"
                            options={locations}
                            selectedKey={formData.location || null}
                            required
                            onChange={(_, option) => this.handleChange({ currentTarget: { value: option?.key || '' } } as React.FormEvent<HTMLInputElement>, 'location')}
                        />
                        <Dropdown
                            label="Client Name"
                            options={clientNames}
                            selectedKey={formData.clientName || null}
                            required
                            onChange={(_, option) => this.handleChange({ currentTarget: { value: option?.key || '' } } as React.FormEvent<HTMLInputElement>, 'clientName')}
                        />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        <Dropdown
                            label="Estimations For"
                            options={estimationsfor}
                            selectedKey={formData.estimationFor}
                            onChange={(_, option) => this.handleChange({ currentTarget: { value: option?.key || '' } } as React.FormEvent<HTMLInputElement>, 'estimationFor')}
                        />
                        <TextField
                            label="Title of the Estimation"
                            value={formData.title}
                            required
                            onChange={(e) => this.handleChange(e, 'title')}
                        />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {formData.projectType === "existing" ? (
                            <Dropdown
                                label="Select Existing Project"
                                options={existingProjects}
                                selectedKey={formData.projectTitle || null}
                                required
                                onChange={(_, option) => this.handleChange({ currentTarget: { value: option?.key || '' } } as React.FormEvent<HTMLInputElement>, 'projectTitle')}
                            />
                        ) : (
                            <TextField
                                label="Title of the Project *"
                                value={formData.projectTitle}
                                required
                                onChange={(e) => this.handleChange(e, 'projectTitle')}
                            />
                        )}
                        <TextField
                            label="Estimated Hours *"
                            value={formData.estimatedHours}
                            placeholder="Please Enter Hours"
                            required
                            onChange={(e) => this.handleChange(e, 'estimatedHours')}
                        />
                    </div>
                    <DatePicker
                        label="Submitted Date *"
                        placeholder="MM/DD/YYYY"
                        isRequired
                        value={formData.submittedDate || undefined}
                        onSelectDate={(date) => this.setState({ formData: { ...formData, submittedDate: date || null } })}
                    />
                    <TextField
                        label="Remarks"
                        multiline
                        rows={4}
                        value={formData.remarks}
                        onChange={(e) => this.handleChange(e, 'remarks')}
                    />
                    <Label>Attachment *</Label>
                    <DefaultButton text="Upload a file 📁" />

                    <div style={{ marginTop: 20 }}>
                        <PrimaryButton text="Save" styles={{ root: { marginRight: 10 } }} />
                        <PrimaryButton text="Submit" />
                        <DefaultButton text="Cancel" styles={{ root: { marginLeft: 10 } }} />
                    </div>
                </div>
            </div>
        );
    }
}

export default EstimationForm;
