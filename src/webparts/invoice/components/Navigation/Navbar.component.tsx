import * as React from 'react';
import { NavLink } from 'react-router-dom';

 
export interface NavigationProps {
    onNavItemClick: (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
}
 
 
class Navigation extends React.Component<NavigationProps> {
 
    async componentDidMount() {
 
    }
 
    public render() {
 
        return (
            <nav>
                <ul >
                 <p>Masters</p>
                 <li id="Location" onClick={this.props.onNavItemClick}>
                        <NavLink to="/Location" exact activeClassName="nav-click" className={""}>
                            <span > Location </span>
                        </NavLink>
                    </li>
                <li id="Client" onClick={this.props.onNavItemClick}>
                        <NavLink to="/Client" exact activeClassName="nav-click" className={""}>
                            <span > Client </span>
                        </NavLink>
                    </li>
                  
                    <li id="Billing Team" onClick={this.props.onNavItemClick}>
                        <NavLink to="/Billing Team" exact activeClassName="nav-click" className={""}>
                            <span > Billing Team</span>
                        </NavLink>
                    </li>
                    <p>Forms</p>
                    <li id="Estimations" onClick={this.props.onNavItemClick}>
                        <NavLink to="/Estimation" exact activeClassName="nav-click" className={""}>
                            <span > Estimations</span>
                        </NavLink>
                        
                    </li>
                    <li id="Proposal" onClick={this.props.onNavItemClick}>
                        <NavLink to="/Proposal" exact activeClassName="nav-click" className={""}>
                            <span > Proposal</span>
                        </NavLink>
                        
                    </li>
                    <li id="PO" onClick={this.props.onNavItemClick}>
                        <NavLink to="/PO" exact activeClassName="nav-click" className={""}>
                            <span > PO</span>
                        </NavLink>
                        
                    </li>
                    <li id="Project Status" onClick={this.props.onNavItemClick}>
                        <NavLink to="/Project Status" exact activeClassName="nav-click" className={""}>
                            <span > Project Status</span>
                        </NavLink>
                        
                    </li>
                    <li id="Invoice" onClick={this.props.onNavItemClick}>
                        <NavLink to="/Invoice" exact activeClassName="nav-click" className={""}>
                            <span > Invoice</span>
                        </NavLink>
                        
                    </li>

                                    
                </ul>
            </nav>
        );
    }
}
 
export default Navigation;