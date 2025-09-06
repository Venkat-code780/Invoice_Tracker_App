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
    
}
export default DateUtilities;






