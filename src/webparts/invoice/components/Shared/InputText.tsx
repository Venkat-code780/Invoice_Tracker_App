// import * as React from 'react';

interface InputTextProps {
    type: string;
    label: string;
    name: string;
    value: any;
    onChange: any;
    onBlur?:any;
    isRequired: boolean;
    refElement: any;
    disabled?: boolean;
    maxlength?:number;
    InpuId?:string;

}

const InputText = ({ type, label, name, value, isRequired, onChange, refElement,disabled,maxlength,onBlur,InpuId }: InputTextProps) => {

    return (
   
            <div className='light-text'>
                <label>{label}
                    {isRequired && <span className="mandatoryhastrick">*</span>}
                </label>
                
                <input className="form-control" id={InpuId} type={type} title={label} placeholder="" value={value || ''}
                    required={true} onChange={onChange} onBlur={onBlur} name={name} ref={refElement} autoComplete="off" disabled={disabled} maxLength={maxlength}
                />
            </div>
  
    );
};

export default InputText;