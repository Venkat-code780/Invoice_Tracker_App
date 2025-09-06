//  import * as React from "react";
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
interface InputTextProps {
    label: string;
    name: string;
    checked: boolean;
    onChange: any;
    isforMasters:boolean;
    isdisable:boolean;
    title?:string;
    showIcon?:boolean
    //isRequired: boolean;
    //refElement: any;
}



const InputCheckBox = ({ label, name, checked, onChange,isforMasters,isdisable=false,title='',showIcon=false}: InputTextProps) => {

    return isforMasters?(
        <div className="col-md-4">
            <div className='row mt-3'>
                <div className="col-sm-4">
                    <label title={title} className="col-form-label p-0">{label}</label>
                </div>
                {/* {isRequired && <span className="mandatoryhastrick">*</span>} */}
                <div className="col-sm-7">
                    <input title={title} type='checkbox' checked={checked} required={true} onChange={onChange} name={name} autoComplete="off"/>  
                    {showIcon&&<span className='span-helpIcon'> <FontAwesomeIcon className='helpIcon' icon={faQuestionCircle}></FontAwesomeIcon><span className="span-help-text">Check this checkbox to take approval only from one Approver and the Purchasing Manager.</span></span>}
                </div>
            </div>
        </div>
    ):(
        <div className="col-md-3">
            <div className='mt-3'>
                <input title={title} type='checkbox' checked={checked} required={false} onChange={onChange} name={name} autoComplete="off" disabled={isdisable}/> <label title={title} className="col-form-label pl-1">{label}</label>
                {showIcon&& <span className='span-helpIcon'><FontAwesomeIcon className='helpIcon' icon={faQuestionCircle}></FontAwesomeIcon><span className="span-help-text">Check this checkbox to take approval only from one Approver and the Purchasing Manager.</span></span>}
            </div>
        </div>
    );
};

export default InputCheckBox;