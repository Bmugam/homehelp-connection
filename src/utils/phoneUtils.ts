/**
 * Validates Safaricom phone numbers in the format 2547XXXXXXXX or 2541XXXXXXXX
 * @param phoneNumber - phone number string to validate
 * @returns boolean indicating if phone number is valid
 */
export const validateSafaricomPhoneNumber = (phoneNumber: string): boolean => {
  const regex = /^254[71][0-9]{8}$/;
  return regex.test(phoneNumber);
};

/**
 * Formats phone number to start with 254 and removes spaces, dashes, plus signs
 * Handles input formats: 0712..., +254712..., 254712...
 * @param phoneNumber - phone number string to format
 * @returns formatted phone number string
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  let cleaned = phoneNumber.replace(/[\s\-+]/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }

  return cleaned;
};
