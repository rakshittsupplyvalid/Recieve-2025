

export const formatDate = (date: string): string => {
    const dateObj = new Date(date);
  
  
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'; 
    }
  
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
  
    return `${day}/${month}/${year}`;  // Return formatted date as DD/MM/YYYY
  };
  