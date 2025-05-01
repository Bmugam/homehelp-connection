// Validates phone numbers in the format 254XXXXXXXXX
const validatePhoneNumber = (phoneNumber) => {
    const regex = /^254[0-9]{9}$/;
    return regex.test(phoneNumber);
};

// Formats phone number to ensure it starts with 254
const formatPhoneNumber = (phoneNumber) => {
    // Remove any spaces, dashes, or plus signs
    let cleaned = phoneNumber.replace(/[\s\-+]/g, '');
    
    // If the number starts with 0, replace it with 254
    if (cleaned.startsWith('0')) {
        cleaned = '254' + cleaned.slice(1);
    }
    
    // If the number starts with 7 or 1, add 254
    if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
        cleaned = '254' + cleaned;
    }
    
    return cleaned;
};

module.exports = {
    validatePhoneNumber,
    formatPhoneNumber
};