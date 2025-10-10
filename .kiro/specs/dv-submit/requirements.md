# Requirements Document

## Introduction

DVSubmit is a Supabase-backed user-assisted DV (Diversity Visa) lottery submission service that enables Ethiopian users to register, complete official DV forms, upload compliant photos, make payments via Telebirr, and receive professional submission assistance. The service includes admin verification workflows, secure data handling with RLS policies, audit logging, and automated data retention policies.

## Requirements

### Requirement 1

**User Story:** As a DV lottery applicant, I want to register for an account using my email address, so that I can securely access the submission service.

#### Acceptance Criteria

1. WHEN a user visits the registration page THEN the system SHALL provide email-based registration via Supabase Auth
2. WHEN a user submits valid registration credentials THEN the system SHALL create a new user account and send email verification
3. WHEN a user attempts to access protected features without verification THEN the system SHALL redirect to email verification prompt
4. WHEN a user completes email verification THEN the system SHALL grant access to the DV form submission workflow

### Requirement 2

**User Story:** As a registered user, I want to fill out the official DV lottery form with all required information, so that my application can be properly submitted.

#### Acceptance Criteria

1. WHEN a user accesses the DV form THEN the system SHALL present all official DV lottery fields as required by the U.S. State Department
2. WHEN a user enters form data THEN the system SHALL validate all fields according to official DV requirements
3. WHEN a user saves form progress THEN the system SHALL store the data securely with RLS policies ensuring user-only access
4. WHEN a user submits incomplete form data THEN the system SHALL highlight missing required fields and prevent submission
5. IF a user has already submitted a form THEN the system SHALL prevent duplicate submissions for the same DV cycle

### Requirement 3

**User Story:** As a user, I want to upload a compliant DV lottery photo, so that my application meets official photo requirements.

#### Acceptance Criteria

1. WHEN a user uploads a photo THEN the system SHALL validate photo compliance both client-side and server-side
2. WHEN photo validation passes THEN the system SHALL store the photo in a private Supabase Storage bucket
3. WHEN a user needs to view their uploaded photo THEN the system SHALL serve it via signed URLs with appropriate expiration
4. WHEN photo validation fails THEN the system SHALL provide specific feedback on compliance issues
5. WHEN a user uploads a new photo THEN the system SHALL replace the previous photo and update storage accordingly

### Requirement 4

**User Story:** As a user, I want to pay the 399 ETB service fee via Telebirr, so that I can complete my application submission.

#### Acceptance Criteria

1. WHEN a user reaches the payment step THEN the system SHALL display the 399 ETB fee and Telebirr payment instructions
2. WHEN a user enters a Telebirr payment reference THEN the system SHALL store the reference for admin verification
3. WHEN a user submits payment reference THEN the system SHALL update application status to "Payment Pending Verification"
4. WHEN payment verification is pending THEN the system SHALL prevent further application modifications
5. IF a user enters an invalid payment reference format THEN the system SHALL provide format validation feedback

### Requirement 5

**User Story:** As an admin, I want to access a protected dashboard to verify Telebirr payments and manage submissions, so that I can process user applications efficiently.

#### Acceptance Criteria

1. WHEN an admin attempts to access the dashboard THEN the system SHALL authenticate admin credentials via Supabase Auth
2. WHEN an admin views the dashboard THEN the system SHALL display all applications requiring payment verification
3. WHEN an admin verifies a Telebirr payment THEN the system SHALL update the application status to "Payment Verified"
4. WHEN an admin rejects a payment THEN the system SHALL update status to "Payment Rejected" and notify the user
5. WHEN an admin performs any action THEN the system SHALL log the action in the audit trail

### Requirement 6

**User Story:** As an admin, I want to submit official DV entries on behalf of verified users, so that their applications are properly filed with the U.S. State Department.

#### Acceptance Criteria

1. WHEN an admin views verified applications THEN the system SHALL display all applications ready for official submission
2. WHEN an admin submits an official DV entry THEN the system SHALL update the application status to "Submitted to DV System"
3. WHEN an admin receives a confirmation number THEN the system SHALL store the confirmation number and update application status
4. WHEN official submission is complete THEN the system SHALL generate proof of submission for the user
5. WHEN submission fails THEN the system SHALL log the failure and allow retry with admin notes

### Requirement 7

**User Story:** As a user, I want to receive my official DV confirmation number and proof of submission, so that I have documentation of my application.

#### Acceptance Criteria

1. WHEN my application is officially submitted THEN the system SHALL notify me via email with confirmation details
2. WHEN I log into my account after submission THEN the system SHALL display my confirmation number and submission proof
3. WHEN I request proof of submission THEN the system SHALL provide a downloadable document with official details
4. WHEN the DV cycle ends THEN the system SHALL maintain my confirmation record according to retention policies

### Requirement 8

**User Story:** As a system administrator, I want Row Level Security policies implemented, so that users can only access their own data and admins have appropriate access controls.

#### Acceptance Criteria

1. WHEN a user queries their data THEN the system SHALL enforce RLS policies allowing access only to their own records
2. WHEN an admin queries application data THEN the system SHALL allow access to all applications based on admin role
3. WHEN unauthorized access is attempted THEN the system SHALL deny access and log the attempt
4. WHEN RLS policies are applied THEN the system SHALL ensure no data leakage between user accounts

### Requirement 9

**User Story:** As a compliance officer, I want comprehensive audit logging of all admin actions, so that we can maintain accountability and track system usage.

#### Acceptance Criteria

1. WHEN an admin performs any action THEN the system SHALL log the action with timestamp, admin ID, and action details
2. WHEN audit logs are queried THEN the system SHALL provide searchable and filterable audit trails
3. WHEN sensitive actions occur THEN the system SHALL log additional context and require admin confirmation
4. WHEN audit logs reach retention limits THEN the system SHALL archive or purge according to configured policies

### Requirement 10

**User Story:** As a data protection officer, I want configurable data retention policies, so that PII is automatically deleted after the DV cycle ends.

#### Acceptance Criteria

1. WHEN the DV cycle ends THEN the system SHALL automatically identify records eligible for deletion
2. WHEN retention period expires THEN the system SHALL permanently delete PII including photos and personal data
3. WHEN data deletion occurs THEN the system SHALL maintain audit logs of the deletion process
4. WHEN retention policies are configured THEN the system SHALL allow flexible scheduling and scope definition
5. IF legal holds are in place THEN the system SHALL preserve data despite retention policies until holds are lifted

### Requirement 11

**User Story:** As a user, I want clear legal disclosures about the service, so that I understand this is not a government service and selection is not guaranteed.

#### Acceptance Criteria

1. WHEN a user first accesses the service THEN the system SHALL display prominent legal disclaimers
2. WHEN a user registers THEN the system SHALL require acknowledgment of terms stating no government affiliation
3. WHEN a user views any submission-related page THEN the system SHALL display disclaimers about selection not being guaranteed
4. WHEN legal disclosures are updated THEN the system SHALL require re-acknowledgment from existing users
5. WHEN users complete applications THEN the system SHALL include final disclaimer confirmation before payment

### Requirement 12

**User Story:** As a user, I want robust photo validation, so that my uploaded photo meets all DV lottery requirements before submission.

#### Acceptance Criteria

1. WHEN a user selects a photo THEN the system SHALL perform client-side validation for basic requirements (format, size, dimensions)
2. WHEN a photo is uploaded THEN the system SHALL perform server-side validation for compliance with DV photo standards
3. WHEN photo validation fails THEN the system SHALL provide specific, actionable feedback on what needs to be corrected
4. WHEN photo meets all requirements THEN the system SHALL confirm compliance and allow application progression
5. WHEN photo validation is uncertain THEN the system SHALL flag for manual admin review before final submission