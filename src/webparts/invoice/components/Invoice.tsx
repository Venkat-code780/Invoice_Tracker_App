import * as React from 'react';
//import EstimationForm from './Forms/Estimations';
import { HashRouter as Router } from 'react-router-dom';
import Navigation from './Navigation/Navbar.component';
import Routes from './Navigation/RouteItems';
import { IInvoiceProps } from './IInvoiceProps';
import '../CSS/styles.css';

export default class InvoiceTracker extends React.Component<IInvoiceProps> {
 
  
  public onNavItemClick(event: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    let navLinks = document.querySelectorAll('.nav-click');
    if (navLinks.length > 0) {
        navLinks.forEach(item => {
            item.className = '';
        });
    }}
  public render(): React.ReactElement<IInvoiceProps> {
  

    const {
     
    } = this.props;

    return (
         
      <Router>
          <section id='mainSection' style={{ display: 'flex' }}>
              {/* <Navigation onNavItemClick={this.onNavItemClick} />   */}
              <Navigation onNavItemClick={this.onNavItemClick} />
              <Routes context={this.props.context} spContext={this.props.spContext} props={this.props} />
          </section>
      </Router>
  );
  }
}

// export interface IInvoiceProps {
//   spContext: any;
  
//   currentUserGroups: any;
// }
// export interface IInvoiceState {

// }
// export default class Invoice extends React.Component<IInvoiceProps,IInvoiceState> {
//     public onNavItemClick = (event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
//         let navLinks=document.querySelectorAll('.nav-click');
//         if(navLinks){
//             navLinks.forEach((item)=>{
//               item.className = '';
//             });
//         }
//     }
//   public render(): React.ReactElement<IInvoiceProps> {
//     const Wrapper = () => {
//       return <EstimationForm {...this.context}{...this.props} />
//     }
//     return (
//         <div>

//           {/* <EstimationForm {...this.context}{...this.props}/> */}
//           <Wrapper></Wrapper>
//         </div>
//     );
//   }
// }
