// Validation utilities for forms and data

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  numeric?: boolean;
  positive?: boolean;
  url?: boolean;
  custom?: (value: string) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateField(value: string, rules: ValidationRule): string | null {
  if (rules.required && (!value || value.trim() === '')) {
    return 'This field is required';
  }

  if (!value || value.trim() === '') {
    return null; // Not required and empty, so valid
  }

  const trimmedValue = value.trim();

  if (rules.minLength && trimmedValue.length < rules.minLength) {
    return `Minimum length is ${rules.minLength} characters`;
  }

  if (rules.maxLength && trimmedValue.length > rules.maxLength) {
    return `Maximum length is ${rules.maxLength} characters`;
  }

  if (rules.pattern && !rules.pattern.test(trimmedValue)) {
    return 'Invalid format';
  }

  if (rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedValue)) {
      return 'Please enter a valid email address';
    }
  }

  if (rules.phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = trimmedValue.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return 'Please enter a valid phone number';
    }
  }

  if (rules.numeric && isNaN(Number(trimmedValue))) {
    return 'Please enter a valid number';
  }

  if (rules.positive && Number(trimmedValue) <= 0) {
    return 'Please enter a positive number';
  }

  if (rules.url) {
    try {
      new URL(trimmedValue);
    } catch {
      return 'Please enter a valid URL';
    }
  }

  if (rules.custom) {
    return rules.custom(trimmedValue);
  }

  return null;
}

export function validateForm(data: Record<string, string>, rules: Record<string, ValidationRule>): ValidationResult {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, value] of Object.entries(data)) {
    const fieldRules = rules[field];
    if (fieldRules) {
      const error = validateField(value, fieldRules);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    }
  }

  return { isValid, errors };
}

// Common validation rules
export const commonValidationRules = {
  required: { required: true } as ValidationRule,
  email: { required: true, email: true } as ValidationRule,
  phone: { required: true, phone: true } as ValidationRule,
  name: { required: true, minLength: 2, maxLength: 50 } as ValidationRule,
  message: { required: true, minLength: 10, maxLength: 500 } as ValidationRule,
  pincode: { required: true, pattern: /^\d{6}$/ } as ValidationRule,
  price: { required: true, numeric: true, positive: true } as ValidationRule,
  coordinates: {
    required: true,
    custom: (value: string) => {
      const coords = value.split(',');
      if (coords.length !== 2) return 'Please enter valid coordinates (lat, lng)';
      const lat = parseFloat(coords[0]);
      const lng = parseFloat(coords[1]);
      if (isNaN(lat) || isNaN(lng)) return 'Coordinates must be valid numbers';
      if (lat < -90 || lat > 90) return 'Latitude must be between -90 and 90';
      if (lng < -180 || lng > 180) return 'Longitude must be between -180 and 180';
      return null;
    }
  } as ValidationRule,
};

// Form field validation for specific use cases
export const validationRules = {
  // Contact form
  contactForm: {
    fullName: commonValidationRules.name,
    email: commonValidationRules.email,
    phone: commonValidationRules.phone,
    area: commonValidationRules.name,
    message: commonValidationRules.message,
  },
  
  // Host registration
  hostRegistration: {
    fullName: commonValidationRules.name,
    email: commonValidationRules.email,
    phone: commonValidationRules.phone,
    address: commonValidationRules.name,
    city: commonValidationRules.name,
    state: commonValidationRules.name,
    pincode: commonValidationRules.pincode,
    outletType: commonValidationRules.required,
    chargingSpeed: commonValidationRules.required,
    availableHours: commonValidationRules.required,
    pricePerHour: commonValidationRules.price,
  },
  
  // Government station
  governmentStation: {
    stationName: commonValidationRules.name,
    governmentDepartment: commonValidationRules.name,
    address: commonValidationRules.name,
    city: commonValidationRules.name,
    state: commonValidationRules.name,
    pincode: commonValidationRules.pincode,
    numberOfChargers: { required: true, numeric: true, positive: true },
    chargerTypes: commonValidationRules.required,
    pricePerHour: commonValidationRules.price,
  },
  
  // User profile
  userProfile: {
    displayName: commonValidationRules.name,
    phone: commonValidationRules.phone,
  },
};

// Utility functions for specific validations
export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const validateIndianPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^[\+]?91[6-9]\d{9}$/;
  return phoneRegex.test(cleanPhone);
};

export const validateIndianPincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitization utilities
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeNumber = (input: string): number | null => {
  const clean = input.replace(/[^\d.-]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
};

export const sanitizeCoordinates = (lat: string, lng: string): { lat: number; lng: number } | null => {
  const sanitizedLat = sanitizeNumber(lat);
  const sanitizedLng = sanitizeNumber(lng);
  
  if (sanitizedLat === null || sanitizedLng === null) {
    return null;
  }
  
  if (!validateCoordinates(sanitizedLat, sanitizedLng)) {
    return null;
  }
  
  return { lat: sanitizedLat, lng: sanitizedLng };
};
