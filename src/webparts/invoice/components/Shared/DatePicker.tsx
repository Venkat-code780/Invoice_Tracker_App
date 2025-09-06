// import * as React from 'react';
// import { Component } from 'react';
// import { NavLink } from 'react-router-dom';
// import { SPHttpClient } from '@microsoft/sp-http';
// import { WebPartContext } from '@microsoft/sp-webpart-base';
// import { sp } from '@pnp/sp';
// import { Web } from '@pnp/sp/webs';
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import { addDays } from 'office-ui-fabric-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faCalendarAlt} from '@fortawesome/free-solid-svg-icons';


interface DatePickerProps {
  handleChange: (e: any) => void;
  selectedDate: Date;
  className: string;
  id?:string;
  labelName: string;
  isDisabled: boolean;
  ref: any;
  Day: string;
  isDateRange?: boolean;
  isCustomeDateRange?:boolean;
  minDate?:Date;
  maxDate?:Date;
}

//   const [selectedDate,setDate] = React.useState(new Date())
//   console.log(selectedDate);
//   const handleChange = date => {
//      setDate(date)
//   };

const filterDays = (date:any, Day: any) => {
  let currentDate = new Date(date)
  let enableDay = DayCode(Day)
  return currentDate.getDay() === enableDay;
}

const DayCode = (Day:any) => {
  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days.indexOf(Day)
}
const getStartDate = (date:any) => {
  if (new Date(date).getDay() === 1) {
    return new Date(date)
  }
  else {
    let Currentdate = new Date(date)
    while (Currentdate.getDay() !== 1) {
      Currentdate.setDate(Currentdate.getDate() - 1)
    }
    return new Date(Currentdate);
  }
}

const CustomDatePicker = ({ handleChange, selectedDate, className,id='', labelName, isDisabled, ref, Day, isDateRange = true,isCustomeDateRange = false,minDate,maxDate }: DatePickerProps) => {

  return (
      <>
      <label className='z-in-9'>{labelName}<span className="mandatoryhastrick">*</span></label><div className="date-picker-container">
      {/*<FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon-custom" />*/}
      {isCustomeDateRange && <DatePicker
          selected={selectedDate}
          onChange={handleChange}
          minDate={minDate}
          maxDate= {maxDate}
          // filterDate={date => filterDays(date, Day)}
          className={className + " " + (selectedDate == null ? "mandatory-FormContent-focus" : "")}
          disabled={isDisabled}
          ref={ref}
          required={true}
          name={labelName}
          titleText={labelName}
          id={className}
          placeholderText={"MM/DD/YYYY"}
          showIcon
          toggleCalendarOnIconClick
          />
      }
      {isDateRange && !isCustomeDateRange ?
        <DatePicker
          selected={selectedDate}
          onChange={handleChange}
          minDate={addDays(getStartDate(new Date()), -30)}
          maxDate={new Date()}
          filterDate={(date:any) => filterDays(date, Day)}
          className={className + " " + (selectedDate == null ? "mandatory-FormContent-focus" : "")}
          disabled={isDisabled}
          ref={ref}
          required={true}
          name={labelName}
          title={labelName}
          id={id}
          placeholderText={"MM/DD/YYYY"}
          showIcon
          toggleCalendarOnIconClick
        /> :!isCustomeDateRange &&
        <DatePicker
          selected={selectedDate}
          onChange={handleChange}
          // minDate={addDays(getStartDate(new Date()), -30)}
          maxDate={new Date()}
          filterDate={(date:any) => filterDays(date, Day)}
          className={className + " " + (selectedDate == null ? "mandatory-FormContent-focus" : "")}
          disabled={isDisabled}
          ref={ref}
          required={true}
          name={labelName}
          titleText={labelName}
          id={className}
          placeholderText={"MM/DD/YYYY"}
          showIcon
          toggleCalendarOnIconClick
          />} 
    </div>
    </>
  );
}


export default CustomDatePicker
