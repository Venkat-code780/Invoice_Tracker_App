import * as EmailValidator from 'email-validator';
import { ControlType } from './Constants';
//import { ControlType } from '../Constants/Constants';
 
function validate(data:any){
    let status = true;
    let message ="";
    let propertieTypes={Number:ControlType.number,String:ControlType.string,MobileNumber:ControlType.mobileNumber,Email:ControlType.email,People:ControlType.people,Date:ControlType.date,compareDates:ControlType.compareDates,reactSelect:ControlType.reactSelect};
    var element = document.getElementsByClassName("mandatory-FormContent-focus");
    if( element.length > 0 ){
        for( let i=0;i<element.length;i++){
            element[i].classList.remove("mandatory-FormContent-focus");
        }
    }
    var element = document.getElementsByClassName("searchMandatory");
    if( element.length > 0 ){
        for( let i=0;i<element.length;i++){
            element[i].classList.remove("searchMandatory");
        }
    }
    for (let key in data) {
        let value = data[key].val;
        let type =data[key].Type;
        let isrequired =data[key].required;
        if([undefined,null,'',-1].includes(value) && propertieTypes.reactSelect==type && isrequired)
        {
            // let prpel =data[key].divId;
            // message =data[key].Name+" cannot be blank.";
            // prpel.current.classList.add('searchMandatory');
            // //prpel.current.props.classNames={control:'mandatory-FormContent-focus'} searchMandatory;
            // prpel.current.focus();
            // status = false;
            message =data[key].Name+" cannot be blank.";
            let ddlSearchId =data[key].Focusid;
            document.getElementById(ddlSearchId)?.getElementsByTagName('input')[0].focus();
            document.getElementById(ddlSearchId)?.classList.add('searchMandatory');
            status = false;
            break;
        }
       else if([undefined,null,'',-1].includes(value) && propertieTypes.People!=type && propertieTypes.Date!=type && isrequired)
        {
            let prpel =data[key].Focusid;
            message =data[key].Name+" cannot be blank.";
            prpel.current.focus();
            prpel.current.classList.add('mandatory-FormContent-focus');
            status = false;
            break;
        }
        //--- Commented on 4/12/2024 start
        // else if(![undefined,null,''].includes(value) && propertieTypes.People!=type && propertieTypes.Date!=type && propertieTypes.String==type && value.includes(','))
        // {
        //     let prpel =data[key].Focusid;
        //     message ="Commas(,) are not allowed in "+ data[key].Name +".";
        //     prpel.current.focus();
        //     prpel.current.classList.add('mandatory-FormContent-focus');
        //     status = false;
        //     break;
        // }
        //---End
        // else if(propertieTypes.People!=type && propertieTypes.Date!=type && value.includes(','))
        // {
        //     let prpel =data[key].Focusid;
        //     message = "Comma's(,) are not allowed in "+ data[key].Name +".";
        //     prpel.current.focus();
        //     prpel.current.classList.add('mandatory-FormContent-focus');
        //     status = false;
        //     break;
        // }
        // else if((propertieTypes.People==type && isrequired) && [undefined,null,''].includes(value))
        // {
        //     message =data[key].Name+" cannot be blank.";
        //     let prpIsreq =data[key].Focusid;
        //     document.getElementById(prpIsreq)?.getElementsByTagName('input')[0].focus();
        //     document.getElementById(prpIsreq)?.getElementsByTagName('input')[0].classList.add('mandatory-FormContent-focus');
        //     status = false;
        //     break;
        // }
        else if((propertieTypes.Date==type && isrequired) && [undefined,null,''].includes(value))
        {
            message =data[key].Name+" cannot be blank.";
            let prpData =data[key].Focusid;
            document.getElementById(prpData)?.getElementsByTagName('input')[0].focus();
            setTimeout(()=>{document.getElementById(prpData)?.getElementsByTagName('input')[0].classList.add('mandatory-FormContent-focus')},0);
            status = false;
            break;
        }
        else if (type === ControlType.file && isrequired) {
            if (!value || value.length === 0) {
                message = data[key].Name + " Please upload any one file.";
                let prpFile = data[key].Focusid;
                prpFile?.current?.focus?.();
                prpFile?.current?.classList?.add('mandatory-FormContent-focus');
                status = false;
                break;
            }
        }
        else if(propertieTypes.MobileNumber ==type && ![undefined,null,''].includes(value)&& (!isNaN(value) || Math.floor(value) !=value))
        {
            let prpMob =data[key].Focusid;
            message =data[key].Name+" enter valid number.";
            prpMob.current.focus();
            prpMob.current.classList.add('mandatory-FormContent-focus');
            status = false;
            break;
        }
         else if((propertieTypes.People==type && isrequired) && value.length == 0 )
        {
            message =data[key].Name+" cannot be blank.";
            let prpIsreq =data[key].Focusid;
            document.getElementById(prpIsreq)?.getElementsByTagName('input')[0].focus();
            document.getElementById(prpIsreq)?.getElementsByTagName('input')[0].classList.add('mandatory-FormContent-focus');
            status = false;
            break;
            // message = "'"+data[key].Name+"' cannot be blank.";
            // let prpIsreq =data[key].Focusid;
            // let element = document.getElementById(prpIsreq);
 
            // if( element ){
            //     element.focus();
            //     // element.classList.add('mandatory-FormContent-focus');
            //     element.classList.add('focus-Div');
            // }
            // status = false;
            // break;
        }
 
        else if(propertieTypes.Number ==type && ![undefined,null,''].includes(value)&& isNaN(value))
        {
            let prpNum =data[key].Focusid;
            message =data[key].Name+" enter valid number.";
            prpNum.current.focus();
            prpNum.current.classList.add('mandatory-FormContent-focus');
            status = false;
            break;
        }
        else if(propertieTypes.Email ==type&& !EmailValidator.validate(value) && ![undefined,null,''].includes(value))
        {
            let prpEmail =data[key].Focusid;
            message =data[key].Name+" enter valid email.";
            prpEmail.current.focus();
            prpEmail.current.classList.add('mandatory-FormContent-focus');
            status = false;
            break;
        }
        else if (key === "InvoicedAmount" && data["AvailableBalance"]) {
          const invoicedAmount = (value);
           const availableBalance = (data["AvailableBalance"].val);
  if (!isNaN(invoicedAmount) && !isNaN(availableBalance) && invoicedAmount > availableBalance) {
    message = "Invoiced Amount cannot be greater than Available Balance.";
    let prpInvAmount = data[key].Focusid;
    prpInvAmount.current.focus();
    prpInvAmount.current.classList.add('mandatory-FormContent-focus');
    status = false;
    break;
  }
}


        else if(propertieTypes.compareDates ==type)
        {
            let startDate = data[key].startDate;
            let EndDate = data[key].EndDate;
            if(startDate.getTime() > EndDate.getTime()){
                message =data[key].startDateName+" must be greater than "+data[key].EndDatename+".";
                let prpData =data[key].Focusid;
                document.getElementById(prpData)?.getElementsByTagName('input')[0].focus();
                document.getElementById(prpData)?.getElementsByTagName('input')[0].classList.add('mandatory-FormContent-focus');
                status = false;
                break;
            }
        }
    }
    let retunobject ={message,status};
    return retunobject;
}
 
// function peoplePickerValidation(data:any){
//     let status = true;
//     let message ="";
//     let propertieTypes={Number:ControlType.number,String:ControlType.string,MobileNumber:ControlType.mobileNumber,Email:ControlType.email,People:ControlType.people,Date:ControlType.date,compareDates:ControlType.compareDates};
//     for (let key in data) {
//         let value = data[key].val.length
//         value = value>0?value:null
//         let type =data[key].Type;
//         let isrequired =data[key].required;
 
//      if((propertieTypes.People==type && isrequired) && [undefined,null,''].includes(value))
//     {
//         message =data[key].Name+" cannot be blank.";
//         let prpIsreq =data[key].Focusid;
//         document.getElementById(prpIsreq)?.getElementsByTagName('input')[0].focus();
//         document.getElementById(prpIsreq)?.getElementsByTagName('input')[0].classList.add('mandatory-FormContent-focus');
//         status = false;
//         break;
//     }
// }
// let retunobject ={message,status};
// return retunobject;
// }
 function ValidateInputFiles( fileArray: any, isRequired: boolean ){
    let status = true;
    let message ="";
    var regex = /^[A-Za-z0-9_\- ()#]+$/;
 
    if( fileArray.length  == 0 && isRequired ){
        message = "Please upload any document";
        status =  false;
        let retunobject ={message,status};
        return retunobject;
    }
 
    var element = document.getElementsByClassName("focus-Div");
    if( element.length > 0 ){
        for( let i=0;i<element.length;i++){
            element[i].classList.remove("focus-Div");
        }
    }
 
    for (let i in  fileArray) {
        const fileName = fileArray[i].name;
        if(!(regex.test(fileName.replace(/\.[^/.]+$/, "")))){
            message = "Special characters are not allowed in uploaded File '" + fileName + "'";
            status = false;
 
            let element = document.getElementById("li_"+i);
            if( element ){
                element.focus();
                element.classList.add('focus-Div');
            }
            break;
        }
    }
    let retunobject ={message,status};
    return retunobject;
}

class formValidation {
   public static checkValidations=(formData:any)=>{
       let status= validate(formData);
       return status;
     }
  public static FilesValidation = ( filesArray: any, isRequired:boolean ) =>{
        let status = ValidateInputFiles(filesArray, isRequired);
        return status;
    }
 }

 export default formValidation;