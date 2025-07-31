// formdata.ts

export const createFormData = (form) => {
    // Ensure form.Files exists and is an array
    if (!form.Files) {
      form.Files = [];
    }
  
    const formData = new FormData();
  
    // Append non-file fields
    Object.entries(form).forEach(([key, value]) => {
      if (key !== 'Files' && value !== null && value !== undefined) {
        formData.append(key, value);
      }
    });
  
    // Append files
    form.Files.forEach((file, index) => {
      formData.append('Files', {
        uri: file.uri,
        name: file.fileName || `file_${index}.jpg`,
        type: file.type || 'image/jpeg',
      } ); // 'as any' is used for compatibility in React Native
    });
  
    // Debug output
    formData.forEach((value, key) => {
      console.log('formdata', key, value);
    });
  
    return formData;
  };
  