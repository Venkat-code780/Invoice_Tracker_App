class DateUtilities {
public static getDateMMDDYYYY(givenDate:any) //for Displaying
    {
        let date=new Date(givenDate);
          return (date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + "/" + (date.getDate() <= 9 ? "0" + date.getDate() : date.getDate()) + "/" + date.getFullYear();
    }
public static getDateDDMMYYYY(givenDate:any) //for Displaying
    {
        let date=new Date(givenDate);
          return (date.getDate() <= 9 ? "0" + date.getDate() : date.getDate())+"/"+(date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1) + "/" + date.getFullYear();
    }
    public static addBrowserwrtServer(date: Date, webTimeZoneData: any) {
    var utcOffsetMinutes = date.getTimezoneOffset();
    var newDate = new Date(date.getTime());
    newDate.setTime(newDate.getTime() + ((webTimeZoneData.Bias - utcOffsetMinutes + webTimeZoneData.DaylightBias) * 60 * 1000));
    return newDate;
  }
}
export default DateUtilities;






