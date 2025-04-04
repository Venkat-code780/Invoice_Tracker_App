// 



import * as React from 'react';
import { Route, Switch} from 'react-router-dom';
import Estimation from '../Forms/Estimations';
import Location from '../Masters/Location';
import Client from '../Masters/Client';
 
interface RoutesProps {
    context: any;
    spContext: any;
    props: any;
}
 
const Routes: React.FC<RoutesProps> = ({ context, spContext, props}) => {
 
    const WrapperEstimatioForm = (innerProps: any) => {
        return <Estimation {...props} {...innerProps} />;
    };
   
    const WrapperLocation = (innerProps: any) => {
        return <Location {...props} {...innerProps} />;
    };
    const WrapperClient = (innerprops: any) => {
        return <Client {...props} {...innerprops} />;
    }
   
    return (
        <Switch>
            <Route exact path="/Estimation" component={WrapperEstimatioForm} />
            <Route exact path="/Location" component={WrapperLocation} />
            <Route exact path="/Client" component={WrapperClient} />
        </Switch>
    );
};
 
export default Routes;
 
 