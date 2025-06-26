import jwt from "jsonwebtoken";


export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
};

export const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

export const extractNameParts = (fullName, email) => {
  let firstName = '';
  let lastName = '';

  if (fullName?.trim()) {
    const nameParts = fullName.trim().split(' ');
    firstName = nameParts[0];
    lastName = nameParts.slice(1).join(' ');
  } else if (email) {
    const emailPrefix = email.split('@')[0];
    const cleaned = emailPrefix.replace(/\d+/g, '');
    const parts = cleaned.split(/[\.\_\-]/);

    if (parts.length === 1) {
      firstName = parts[0];
      lastName = "";
    } else {
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }

    firstName = capitalize(firstName);
    lastName = lastName ? capitalize(lastName): "";
  }

  return { firstName, lastName };
};

const capitalize = (str) =>
  str?.charAt(0).toUpperCase() + str.slice(1).toLowerCase();