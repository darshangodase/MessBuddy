const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/auto/upload`;

const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append("upload_preset", "BuzzChat");

    const response = await fetch(url, {
        method: 'POST',
        body: formData
    });
    
    const responseData = await response.json();
    return responseData;
};

export default uploadFile;