const validateImage = (image_url) => {
    if (!image_url) return true; // optional field

    const allowedExtensions = ['.jpg', '.jpeg', '.png'];

    return allowedExtensions.some(ext =>
        image_url.toLowerCase().endsWith(ext)
    );
};
export default validateImage;