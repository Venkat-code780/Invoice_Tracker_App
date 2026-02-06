
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
              showMonthDropdown
              showYearDropdown
            // Core fix here:
            disabled={props.isDisabled === true}
            readOnly={props.readOnly === true}
        />
    );
};

export default DatePickercontrol;
