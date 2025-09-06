// // import * as React from "react";
// import { useState } from "react";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
 
 
 
// const DatePickercontrol = (props : any) => {
//     var [selectedDay,setDate] = useState(null);
//     let selectedDate = props.selectedDate!=null?props.selectedDate:null;
//     // let selDate=null;
//     if(selectedDate !=null)
//     {
//       selectedDay=selectedDate;
//     }
//     else{
//       selectedDay=null;
//     }
 
//     if(props.isDisabled){
//       setTimeout(() => {
//         var DatePickers = document.getElementsByClassName("DatePicker");
//         for (var i = 0; i < DatePickers.length; i++) {
//             (DatePickers[i] as HTMLInputElement).disabled  = true;
//         }
//       }, 1000);
//     }else{
//       setTimeout(() => {
//         var DatePickers = document.getElementsByClassName("DatePicker");
//         for (var i = 0; i < DatePickers.length; i++) {
//             (DatePickers[i] as HTMLInputElement).disabled  = false;
//         }
//       }, 1000);
//     }
 
//     function handlechangeevent(seldate:any){
//       setDate(seldate);
//       props.onDatechange([seldate,props.id, props.name]);  
//     }
//     return (
//       <DatePicker
//         selected={selectedDay }
//         dateFormat={'MM/dd/yyyy'}
//         showBorder ={true}      
//         onChange={handlechangeevent}
//         highlightDates={[props.highlightDate]}
//         placeholderText={props.placeholder}
//         className="form-control DatePicker"
//         maxDate={new Date()}
//         id={props.id}
//         readOnly={props.readOnly || false}
//         disabled={props.disabled || false}
//         showIcon={props.showIcon}
//       />
//      );
//   };
 
//   export default DatePickercontrol;
  import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DatePickercontrol = (props: any) => {
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);

    // Update internal state if selectedDate prop changes
    useEffect(() => {
        setSelectedDay(props.selectedDate || null);
    }, [props.selectedDate]);

    function handleChange(selDate: any) {
        setSelectedDay(selDate);
        props.onDatechange([selDate, props.id, props.name]);
    }

    return (
        <DatePicker
            selected={selectedDay}
            onChange={handleChange}
            dateFormat="MM/dd/yyyy"
            placeholderText={props.placeholder}
            className="form-control DatePicker"
            maxDate={props.maxDate}
            minDate={props.minDate}
            highlightDates={[props.highlightDate]}
            id={props.id}
            showIcon={props.showIcon}
            // Core fix here:
            disabled={props.isDisabled === true}
            readOnly={props.readOnly === true}
        />
    );
};

export default DatePickercontrol;
