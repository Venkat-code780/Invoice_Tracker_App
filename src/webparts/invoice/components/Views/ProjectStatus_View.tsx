import * as React from 'react';
import { sp, SPHttpClient } from '@pnp/sp/presets/all';
import TableGenerator from '../Shared/TableGenerator'; // Adjusted path to match the correct module location
import { Navigate, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import DateUtilities from '../Utilities/Dateutilities';
import { showLoader,hideLoader } from '../Shared/Loader';

export interface ProjectStatusViewProps {

    match: any;
    spContext: any;
    spHttpClient: SPHttpClient;
    context: any;
    history: any;
  }
  export interface ProjectStatusViewState {
  

  }
  class ProjectStatus extends React.Component<ProjectStatusViewProps, ProjectStatusViewState> {
    public state={
        data: [],
        allData:[],
        columns: [],
        tableData: {},
        loading: false,
        modalText: '',
        modalTitle: '',
        isSuccess: false,
        showHideModal: false,
        errorMessage: '',
        ItemID: 0,
        selectedYear:'',
        allYears: [],
          redirect: false

    }
      constructor(props:any) {
        super(props);
        sp.setup({
          spfxContext: this.props.context
        });
    
      
      }
    public componentDidMount() {
      document.getElementById('ddlsearch')?.focus();

        //console.log('Project Code:', this.props);
       showLoader();
        this.GetOnloadData();
      }
    private GetOnloadData = () => {
        let TrList = 'ProjectStatus';
        try {
    
          // get all the items from a list
          sp.web.lists.getByTitle(TrList).items.expand("Author").select("Author/Title","Author/Id","*").orderBy("Id", false).get().
            then((response: any[]) => {
              //console.log(response);
              
              this.BindData(response);
            });
        }
        catch (e) {
          this.setState({
            modalTitle: 'Error',
            modalText: 'Sorry! something went wrong',
            showHideModal: true,
            isSuccess: false
          });
          hideLoader();
          console.log('failed to fetch data');
        }
      }
     
      private getYears=(data: any[])=>{
        const years: any[]=[];
        data.forEach(function(item){
          const year = new Date(item.Created).getFullYear();
          if (years.indexOf(year) === -1) {
            years.push(year);
          }
        });
        return years.sort((a, b)=> b - a);
        
      };

      private handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedYear = e.target.value;
        this.setState({ selectedYear });
    
        if (selectedYear === '') {
          // If no year is selected, reset to show all data
          this.setState({ data: this.state.allData });
        } else {
          // Filter data based on the selected year
          const filteredData = this.state.allData.filter(
            (item: { Created: string }) => new Date(item.Created).getFullYear().toString() === selectedYear
          );
          this.setState({ data: filteredData });
        }
      };

      private BindData(response:any) {
        let data:any = [];
    
        response.forEach((Item:any) => {
          data.push({
            Id: Item.Id,
            ProposalFor: Item.ProposalFor,
            ClientName: Item.ClientName,
            Title: Item.Title,
            PONumber: Item.PONumber,
            ExecutionType: Item.ExecutionType,
            StartDate:Item.StartDate,
            EndDate:Item.EndDate,
            ProjectStatus:Item.ProjectStatus,
            Author:Item.Author!=null ? Item.Author.Title:'',
            Created: Item.Created,
           

          });
        });
        const allYears = this.getYears(response);
        this.setState({ data: data,allYears:allYears,allData:data, SaveUpdateText: 'Submit' });
        hideLoader();
      }
    private  handleRowClicked = (row:any,Id?:any) => {
        let ID = row.Id?row.Id:Id;
        this.setState({ItemID:ID,redirect:true});
      }
    public render(){
        let columns = [
              {
                  name: "Edit",
                  //selector: "Id",
                  selector: (row: { Id: any; }, i: any) => row.Id,
                  cell: (record: { Id: any; }) => {
                    return (
                      <React.Fragment>
                        <div style={{ paddingLeft: '10px' }}>
                          <NavLink title="Edit" className="csrLink ms-draggable" to={`/ProjectStatus/${record.Id}`}>
                            <FontAwesomeIcon icon={faEdit} ></FontAwesomeIcon>
                          </NavLink>
                        </div>
                      </React.Fragment>
                    );
                  }
                },
                
          {
            name: "Location",
            selector: (row:any, i:any) => row.ProposalFor,
            sortable: true,
          },
          {
            name: "Client Name",
            selector: (row:any, i:any) => row.ClientName ,
            sortable: true,
          },
          {
            name: "Project Name",
            selector: (row:any, i:any) => row.Title ,
            sortable: true,
          },
          {
            name: "PO Number",
            selector: (row:any, i:any) => row.PONumber,
            sortable: true,
          },
          {
            name: "Execution Type",
            selector: (row:any, i:any) => row.ExecutionType,
            sortable: true,
          },
          {
            name: "Start Date",
            selector: (row:any, i:any) =>DateUtilities.getDateMMDDYYYY(row.StartDate),
            sortable: true,
          },
          {
            name: "End Date",
            selector: (row:any, i:any) =>DateUtilities.getDateMMDDYYYY(row.EndDate),
            sortable: true,
          },
          {
            name: "Project Status",
            selector: (row:any, i:any) => row.ProjectStatus,
            sortable: true,
          },
          {
            name: "Created By",
            selector: (row:any, i:any) => row.Author,
            sortable: true,
          },
          {
            name: "Created Date",
            selector: (row:any, i:any) =>DateUtilities.getDateMMDDYYYY(row.Created),
            sortable: true,
          },


        


        ]
           if(this.state.redirect){
                    let url = `/ProjectStatus/${this.state.ItemID}`;
                return (<Navigate to={url}/>);
                 }
                 else{
         return(
           <React.Fragment>
             <div className='container-fluid'>
            <div className='FormContent ViewTable'>
              <div className='title'> Project Status
                  {/* <div className='mandatory-note'>
                    <span className='mandatoryhastrick'>*</span> indicates a required field
                  </div> */}
          
                
              </div>
              <div className="after-title"></div>
              <div className="row pt-2 px-2">    
              <div className="col-md-4">
              <div className="light-text mt-3 mb-2">
                                                               <label color='#0b3e50'>Year</label>
                                                                <select className="form-control" id='ddlsearch' required={true} name="selectedYear" value={this.state.selectedYear} title="selectedYear" onChange={this.handleYearChange}>
                                                                    <option value=''>All</option>
                                                                    {this.state.allYears.map((year:any)=>{
                                                                      return(
                                                                     <option key={year} value={year}>
                                                                      {year}
                                                                      </option>
                                                                      );
                                                                      
                                                                    })}
                                                                  
                                                                
                                                                </select>
                                                                </div>
                                                                </div>
                                                            </div>
{/*              
              <div className="light-box border-box-shadow mx-2 table-head-1st-td py-2 right-search-table"> */}
                               <div className="mx-2 border-box-shadow light-box table-responsive dataTables_wrapper-overflow right-search-table py-2">
   

            
                    <TableGenerator columns={columns} data={this.state.data} fileName={'Location2'} onRowClick={this.handleRowClicked} ></TableGenerator>
                  </div>
              </div>
              </div>
          
            </React.Fragment>

         )
        }
    }
    }
    
    
  export default ProjectStatus;
