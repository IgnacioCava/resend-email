const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateEmail = (email, maxLength) => {
  if (!email.trim()) return "EMAIL_MISSING";
  if (email.length > maxLength) return "EMAIL_TOO_LONG";
  if (!emailRegExp.test(email)) return "EMAIL_INVALID_FORMAT";
  return "";
};

const validateMessage = (message, maxLength) => {
  if (!message.trim()) return "MESSAGE_MISSING";
  if (message.length > maxLength) return "MESSAGE_TOO_LONG";
  if (typeof message !== "string") return "MESSAGE_INVALID_FORMAT";
  return "";
};

export const validateForm = (
  { email, emailMaxLength },
  { message, messageMaxLength }
) => {
  const errors = { email: "", message: "" };

  errors.email = validateEmail(email, emailMaxLength);
  errors.message = validateMessage(message, messageMaxLength);
  if (Object.values(errors).filter((e) => e).length) throw {error: errors, status: 400};
  return true;
};