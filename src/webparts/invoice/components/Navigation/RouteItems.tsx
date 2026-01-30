
import * as React from 'react';
import {Suspense} from 'react';
import { Route,Routes, useLocation, useParams} from 'react-router-dom';
import Estimation from '../Forms/Estimations';
import Location from '../Masters/Location';
import Client from '../Masters/Client';
import BillingTeamMatrix from '../Masters/BillingTeam';
import EstimationView from '../Views/Estimation_view';
import ProposalView from '../Views/Proposal_View';
import POView from '../Views/PO_View';
import ProjectStatus from '../Views/ProjectStatus_View';
import InvoiceView from '../Views/Invoice_View';
import Proposal from '../Forms/Proposal';
import PO from '../Forms/PO';
import ProjectStatuspage from '../Forms/ProjectStatus';
import InvoiceForm from '../Forms/InvoiceForm';
 import Dashboard from '../Dashboards/Dashboard';
 import Reports from '../Reports/Reports';


export interface RoutesProps {
    spContext: any;
    spHttpClient: any;

}
export interface RoutesState {

}
class Routesitems extends React.Component<RoutesProps, RoutesState> {
     public render() {
        const ClientWrapper=(props:any)=>{
            let params=useParams();
            return <Client {...this.context}{...this.props} {...{...props,match: {params}}} />
          
        }
           const LocationWrapper=(props:any)=>{
            let params=useParams();
            return <Location {...this.context}{...this.props} {...{...props,match: {params}}} />
          
        }
        const BillingTeamWrapper=(props:any)=>{
            let params=useParams();
            return <BillingTeamMatrix {...this.context}{...this.props} {...{...props,match: {params}}} />
          
        }
        // const EstimationWrapper=(props:any)=>{
        //     let params=useParams();
        //    return <Estimation {...this.context}{...this.props} {...{...props,match: {params}}} /> 
        // }
        const EstimationWrapperWithKey = (props: any) => {
  const location = useLocation();
  const params = useParams();

  const key = location.pathname + location.search;

  const allProps = {
    ...this.context,
    ...this.props,
    ...props,
    match: { params },
  };

  return <Estimation key={key} {...allProps} />;
};

        const ProposalWrapperWrapperWithKey = (props: any) => {
  const location = useLocation();
  const params = useParams();

  const key = location.pathname + location.search;

  const allProps = {
    ...this.context,
    ...this.props,
    ...props,
    match: { params },
  };

  return <Proposal key={key} {...allProps} />;
};



        //    const ProposalWrapper=(props:any)=>{
        //     let params=useParams();
        //    return <Proposal {...this.context}{...this.props} {...{...props,match: {params}}} /> 
        // }
        const POWrapperWithKey = (props: any) => {
  const location = useLocation();
  const params = useParams();

  const key = location.pathname + location.search;

  const allProps = {
    ...this.context,
    ...this.props,
    ...props,
    match: { params },
  };

  return <PO key={key} {...allProps} />;
};


        // const POWrapper=(props:any)=>{
        //     let params=useParams();
        //    return <PO {...this.context}{...this.props} {...{...props,match: {params}}} /> 
        // }
     const ProjectStatusWrapperWithKey = (props: any) => {
  const location = useLocation();
  const params = useParams();

  const key = location.pathname + location.search;

  const allProps = {
    ...this.context,
    ...this.props,
    ...props,
    match: { params },
  };

  return <ProjectStatuspage key={key} {...allProps} />;
};


        //  const ProjectStatuspageWrapper=(props:any)=>{
        //     let params=useParams();
        //    return <ProjectStatuspage {...this.context}{...this.props} {...{...props,match: {params}}} /> 
        // }

            const InvoicepageWrapperWithKey = (props: any) => {
  const location = useLocation();
  const params = useParams();

  const key = location.pathname + location.search;

  const allProps = {
    ...this.context,
    ...this.props,
    ...props,
    match: { params },
  };

  return <InvoiceForm key={key} {...allProps} />;
};

        //    const InvoicepageWrapper=(props:any)=>{
        //     let params=useParams();
        //    return <InvoiceForm {...this.context}{...this.props} {...{...props,match: {params}}} /> 
        // }
        const EstimationViewWrapper=(props:any)=>{
            let params=useParams();
            return <EstimationView {...this.context}{...this.props} {...{...props,match: {params}}} />
          
        }
        const ProposalViewWrapper=(props:any)=>{
            let params=useParams();
            return <ProposalView {...this.context}{...this.props} {...{...props,match: {params}}} />
          
        }
        const POViewWrapper=(props:any)=>{
            let params=useParams();
            return <POView {...this.context}{...this.props} {...{...props,match: {params}}} />
          
        }
        const ProjectStatusViewWrapper=(props:any)=>{
            let params=useParams();
            return <ProjectStatus {...this.context}{...this.props} {...{...props,match: {params}}} />
          
        }
        const InvoiceViewWrapper=(props:any)=>{  
            let params=useParams();
            return <InvoiceView {...this.context}{...this.props} {...{...props,match: {params}}} />
          
        }
          const DashboadWrapper=(props:any)=>{  
            let params=useParams();
            return <Dashboard {...this.context}{...this.props} {...{...props,match: {params}}} />
          
        }
         const ReportsWrapper=(props:any)=>{  
            let params=useParams();
            return <Reports {...this.context}{...this.props} {...{...props,match: {params}}} />
          
        }
        
        return(
              
        
            <Suspense fallback={<div></div>}>
             <Routes>
                <Route path="/Client/:id?" element={<ClientWrapper {...this.props} />} />
                <Route path="/Location/:id?" element={<LocationWrapper {...this.props} />} />
                <Route path="/BillingTeam/:id?" element={<BillingTeamWrapper {...this.props} />} />
                <Route path='/Estimation/:id?' element={<EstimationWrapperWithKey/>} />
                <Route path='/Proposal/:id?' element={<ProposalWrapperWrapperWithKey/>} />
                <Route path='/InvoiceForm/:id?' element={<InvoicepageWrapperWithKey/>} />
                  
                <Route path='/PO/:id?' element={<POWrapperWithKey/>} />
                <Route path='/ProjectStatus/:id?' element={<ProjectStatusWrapperWithKey/>} />
                 {/* <Route path='/InvoiceForm/:id?' element={<InvoicepageWrapper/>} /> */}
                <Route path="/Estimation_view" element={<EstimationViewWrapper {...this.props} />} />
                <Route path="/Proposal_View" element={<ProposalViewWrapper {...this.props} />} />
                <Route path="/PO_View" element={<POViewWrapper {...this.props} />} />
                <Route path="/ProjectStatus_View" element={<ProjectStatusViewWrapper {...this.props} />} />
                <Route path="/Invoice_View" element={<InvoiceViewWrapper {...this.props} />} />
                  <Route path="/Dashboard" element={<DashboadWrapper {...this.props} />} />
                  <Route path="/" element={<DashboadWrapper {...this.props} />} />
                    <Route path="/Reports" element={<ReportsWrapper {...this.props} />} />
    

             </Routes>
             </Suspense>
     
        )

     }
}
export default Routesitems;