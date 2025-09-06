import * as React from 'react';
import { Route } from "react-router-dom";
import UnAuthorized from '../Unauthorized/Unauthorized.component';

interface GuardedRouteProps {
  component: React.ComponentType<any>;
  auth: boolean;
  [key: string]: any; // allows other route-related props like path, exact, etc.
}

const GuardedRoute = ({ component: Component, auth, ...rest }: GuardedRouteProps) => (
  <Route
    {...rest}
    element={auth ? <Component {...rest} /> : <UnAuthorized />}
  />
);

export default GuardedRoute;
