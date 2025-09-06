import * as React from 'react';
// import { forEach } from 'lodash';
import { HashRouter } from 'react-router-dom';
import NavBar from './Navigation/Navbar.component';
import Routesitems from './Navigation/RouteItems';
import { IInvoiceProps } from './IInvoiceProps';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../CSS/style.css';
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import '../CSS/Loader.css';

export default class InvoiceTracker extends React.Component<IInvoiceProps> {
  public state={

  }
  public componentDidMount() {
    // this.removeExtraClasses();
  }
// private removeExtraClasses(){
//   var workbenchElement = document.getElementById("workbenchPageContent");
//   let wbClass = workbenchElement?.classList.value;
//   workbenchElement?.classList.remove(wbClass? wbClass : "");
//   // this.removeAll();
//   workbenchElement?.addEventListener("click", this.removeAll);
 
// }
 
// private removeAll = () => {
//   var workbenchElement = document.getElementById("workbenchPageContent");
//   workbenchElement?.removeEventListener("click",this.removeAll);
 
//   var canvasComponent1 = document.getElementsByClassName("CanvasZoneContainer");
//   forEach( canvasComponent1, (element:any) => {
//     let eleClass = element.classList.value;
//     let eleClassArr = eleClass.split(" ");
 
//     eleClassArr.forEach((elem: string) => {
//       element.classList.remove(elem.trim());
//     });
//   })
//   var canvasComponent1 = document.getElementsByClassName("CanvasZone");
//   forEach( canvasComponent1, (element: { classList: { value: any; remove: (arg0: string) => void; }; }) => {
//     let eleClass = element.classList.value;
//    let eleClassArr = eleClass.split(" ");
 
//     eleClassArr.forEach((elem: string) => {
//       element.classList.remove(elem.trim());
//     });
//   })
//   var canvasComponent1 = document.getElementsByClassName("CanvasSection");
//   forEach( canvasComponent1, (element:any) => {
//     let eleClass = element.classList.value;
//    let eleClassArr = eleClass.split(" ");
 
//     eleClassArr.forEach((elem: string) => {
//       element.classList.remove(elem.trim());
//     });
//   })
// }

  
  
  public render():React.ReactElement<IInvoiceProps> {
    const{

    }=this.props;

    return(
      <HashRouter>
        <div className='menu-hide wrapper d-flex align-items-stretch' id='sideMenuNav'>
          <NavBar {...this.props} {...this.state}></NavBar>
          <Routesitems {...this.state} {...this.props}></Routesitems>
              
              <ToastContainer/>
  
        </div>
      </HashRouter>
    )
  }
     
  }





