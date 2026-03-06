function validateEmail(email){
    //Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
module.exports = validateEmail;