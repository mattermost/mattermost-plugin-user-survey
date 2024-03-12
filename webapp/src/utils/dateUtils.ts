export function formatDate(date: Date): string {
    // Get day, month, and year components
    var day = date.getDate();
    var month = date.getMonth() + 1; // Months are zero-based
    var year = date.getFullYear();

    // Add leading zero if day or month is a single digit
    day = (day < 10) ? '0' + day : day;
    month = (month < 10) ? '0' + month : month;

    // Concatenate the components in "dd/mm/yyyy" format
    return day + '/' + month + '/' + year;
}
