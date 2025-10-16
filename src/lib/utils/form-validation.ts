import { FormStepData } from "@/lib/types/application";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  missingFields: string[];
}

export function validateFormCompletion(
  formData: Partial<FormStepData>
): ValidationResult {
  const errors: string[] = [];
  const missingFields: string[] = [];

  // Personal Information validation
  if (!formData.personal?.familyName) {
    missingFields.push("Family Name");
    errors.push("Family name is required");
  }

  if (!formData.personal?.givenName) {
    missingFields.push("Given Name");
    errors.push("Given name is required");
  }

  if (!formData.personal?.gender) {
    missingFields.push("Gender");
    errors.push("Gender is required");
  }

  if (!formData.personal?.dateOfBirth) {
    missingFields.push("Date of Birth");
    errors.push("Date of birth is required");
  }

  if (!formData.personal?.cityOfBirth) {
    missingFields.push("City of Birth");
    errors.push("City of birth is required");
  }

  if (!formData.personal?.countryOfBirth) {
    missingFields.push("Country of Birth");
    errors.push("Country of birth is required");
  }

  if (!formData.personal?.countryOfEligibility) {
    missingFields.push("Country of Eligibility");
    errors.push("Country of eligibility is required");
  }

  // Mailing Address validation
  if (!formData.address?.addressLine1) {
    missingFields.push("Address Line 1");
    errors.push("Address line 1 is required");
  }

  if (!formData.address?.city) {
    missingFields.push("City");
    errors.push("City is required");
  }

  if (!formData.address?.stateProvince) {
    missingFields.push("State/Province");
    errors.push("State or province is required");
  }

  if (!formData.address?.postalCode) {
    missingFields.push("Postal Code");
    errors.push("Postal code is required");
  }

  if (!formData.address?.country) {
    missingFields.push("Country");
    errors.push("Country is required");
  }

  if (!formData.address?.countryOfResidence) {
    missingFields.push("Country of Residence");
    errors.push("Country of residence is required");
  }

  // Contact Information validation
  if (!formData.contact?.phoneNumber) {
    missingFields.push("Phone Number");
    errors.push("Phone number is required");
  }

  // Education validation
  if (!formData.education?.educationLevel) {
    missingFields.push("Education Level");
    errors.push("Education level is required");
  }

  // Marital Status validation
  if (!formData.marital?.maritalStatus) {
    missingFields.push("Marital Status");
    errors.push("Marital status is required");
  }

  // Spouse validation (if married to non-US citizen/LPR)
  if (formData.marital?.maritalStatus === "MARRIED_SPOUSE_NOT_US_CITIZEN_LPR") {
    if (!formData.marital?.spouseFamilyName) {
      missingFields.push("Spouse Family Name");
      errors.push("Spouse family name is required");
    }
    if (!formData.marital?.spouseGivenName) {
      missingFields.push("Spouse Given Name");
      errors.push("Spouse given name is required");
    }
    if (!formData.marital?.spouseGender) {
      missingFields.push("Spouse Gender");
      errors.push("Spouse gender is required");
    }
    if (!formData.marital?.spouseDateOfBirth) {
      missingFields.push("Spouse Date of Birth");
      errors.push("Spouse date of birth is required");
    }
    if (!formData.marital?.spouseCityOfBirth) {
      missingFields.push("Spouse City of Birth");
      errors.push("Spouse city of birth is required");
    }
    if (!formData.marital?.spouseCountryOfBirth) {
      missingFields.push("Spouse Country of Birth");
      errors.push("Spouse country of birth is required");
    }
  }

  // Photo validation
  if (!formData.photo?.file) {
    missingFields.push("Photo");
    errors.push("Photo is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
    missingFields,
  };
}

export function getFormCompletionPercentage(
  formData: Partial<FormStepData>
): number {
  const stepValidation = getStepValidationStatus(formData);
  const totalSteps = 7; // personal, address, contact, education, marital, children, photo
  const completedSteps = Object.values(stepValidation).filter(Boolean).length;
  return Math.round((completedSteps / totalSteps) * 100);
}

export function getStepValidationStatus(formData: Partial<FormStepData>) {
  return {
    personal: !!(
      formData.personal?.familyName &&
      formData.personal?.givenName &&
      formData.personal?.gender &&
      formData.personal?.dateOfBirth &&
      formData.personal?.cityOfBirth &&
      formData.personal?.countryOfBirth &&
      formData.personal?.countryOfEligibility
    ),
    address: !!(
      formData.address?.addressLine1 &&
      formData.address?.city &&
      formData.address?.stateProvince &&
      formData.address?.postalCode &&
      formData.address?.country &&
      formData.address?.countryOfResidence
    ),
    contact: !!formData.contact?.phoneNumber,
    education: !!formData.education?.educationLevel,
    marital: !!(
      formData.marital?.maritalStatus &&
      (formData.marital.maritalStatus !== "MARRIED_SPOUSE_NOT_US_CITIZEN_LPR" ||
        (formData.marital.spouseFamilyName &&
          formData.marital.spouseGivenName &&
          formData.marital.spouseGender &&
          formData.marital.spouseDateOfBirth &&
          formData.marital.spouseCityOfBirth &&
          formData.marital.spouseCountryOfBirth))
    ),
    children: true, // Children are optional, so always valid
    photo: !!formData.photo?.file,
  };
}
