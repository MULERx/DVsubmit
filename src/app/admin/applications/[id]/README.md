# Admin Application Detail Page

This page provides a comprehensive view of individual DV lottery applications for administrators. It has been completely rewritten to use TanStack Query with proper Prisma typing and includes all fields from the application form.

## Features

### Copy-to-Clipboard Functionality
This page is specifically designed as a reference tool for filling out official DV lottery forms. Every piece of application data can be easily copied:

- **Individual Field Copy**: Hover over any field to reveal a copy button
- **Copy All Information**: Single button to copy all basic applicant information
- **Visual Feedback**: Copy buttons show a checkmark when successfully copied
- **Automatic Reset**: Copy confirmation resets after 2 seconds

### Complete Application Data Display

The page now shows all fields that users can fill in the DV form:

#### Personal Information
- Given Name, Family Name, Middle Name
- Gender
- Date of Birth
- City and Country of Birth
- Country of Eligibility
- Eligibility Claim Type (if applicable)

#### Contact Information
- Email Address
- Phone Number (optional)

#### Mailing Address
- In Care Of (optional)
- Address Line 1 & 2
- City, State/Province, Postal Code
- Country and Country of Residence

#### Education
- Highest Education Level (formatted with human-readable labels)

#### Marital Status
- Current Marital Status (formatted with human-readable labels)
- Spouse Information (when applicable):
  - Full name, gender, date of birth
  - City and country of birth
  - Spouse photo status

#### Children Information
- Complete details for each child:
  - Full name, gender, date of birth
  - City and country of birth
  - Individual photo status

### Photo Management
- **Signed URL Integration**: Photos are loaded using secure signed URLs from Supabase storage
- **Loading States**: Shows loading indicators while fetching signed URLs
- **Error Handling**: Graceful fallback when photos fail to load
- **Download Functionality**: Each photo has a download button for offline access
- **Main Applicant Photo**: Large display (128x128px) with validation status
- **Spouse Photo**: Displayed when married to non-US citizen/LPR
- **Children Photos**: Individual photos for each child (96x96px)
- **Photo Validation**: Shows validation status for main applicant photo
- **Clean Interface**: Simple, focused display without preview modals

### Payment Tracking
- **Payment Reference**: Transaction number submitted by applicant
- **Payment Status**: Pending, Verified, or Rejected
- **Verification Details**: Who verified and when
- **Payment Actions**: Approve/Reject buttons for pending payments

### Application Status Management
- **Current Status**: Visual badges for all status types
- **Status History**: Creation, updates, and submission timestamps
- **DV Confirmation**: Shows confirmation number when submitted
- **Submitted By**: Tracks who submitted the application

### Admin Actions
- **Payment Management**: Approve or reject payment submissions
- **Application Rejection**: Reject entire applications for corrections
- **Data Export**: Download complete application data
- **Photo Access**: View all uploaded photos
- **Audit Trail**: Access to application audit logs
- **Proof Download**: Generate proof of submission documents

### User Account Information
- **User Details**: Email, ID, account creation date
- **Application Ownership**: Clear link between user and application

## Technical Implementation

### TanStack Query Integration
- **Type-Safe Queries**: Uses Prisma-generated types for complete type safety
- **Automatic Caching**: Efficient data fetching with automatic cache management
- **Mutation Handling**: Optimistic updates with automatic cache invalidation
- **Error Handling**: Comprehensive error states with retry functionality
- **Loading States**: Proper loading indicators throughout the interface

### Data Formatting
- **Date Formatting**: Consistent date/time display across all fields
- **Enum Translation**: Human-readable labels for education and marital status
- **Status Badges**: Visual indicators for all status types
- **Photo Status**: Clear indicators for photo upload and validation states

### Responsive Design
- **Mobile Friendly**: Responsive grid layouts that work on all screen sizes
- **Sidebar Layout**: Main content with sidebar for status and actions
- **Card-Based UI**: Organized sections using shadcn/ui Card components
- **Visual Hierarchy**: Clear information hierarchy with proper spacing

### Security & Permissions
- **Admin Only**: Protected route requiring admin authentication
- **Action Permissions**: Contextual action buttons based on application state
- **Secure Photo Access**: Proper photo URL handling with error fallbacks

## Usage

### Using as DV Form Reference
1. Open the application detail page for the applicant
2. Use the "Copy All Info" button to get basic information quickly
3. For individual fields, hover over any data field to see the copy button
4. Click the copy button to copy that specific information to clipboard
5. Paste the information directly into the official DV form

### Viewing Applications
1. Navigate to `/admin/applications` to see the applications list
2. Click on any application to view its detailed information
3. Use the refresh button to reload data if needed

### Managing Payments
1. Applications with payment references show approval/rejection buttons
2. Click "Approve Payment" to verify the payment
3. Click "Reject Payment" to reject and request resubmission
4. Payment status updates automatically across all views

### Application Actions
1. Use "Reject Application" to send applications back for corrections
2. Download proof of submission for completed applications
3. Export application data for external processing
4. View audit logs to track all changes

### Photo Management
1. **View Photos**: Photos are displayed directly in the interface, similar to the DV form
2. **Download Photos**: Click the download button under each photo to save locally
3. **Photo Validation**: Check validation status for the main applicant photo
4. **Multiple Photos**: View main applicant, spouse, and children photos in organized sections
5. **Clean Display**: Photos are shown at appropriate sizes without complex preview systems

## Data Flow

1. **Query**: `useAdminApplication(id)` fetches complete application data
2. **Mutations**: 
   - `usePaymentStatusMutation()` for payment approval/rejection
   - `useApplicationRejectionMutation()` for application rejection
3. **Cache Management**: Automatic invalidation ensures fresh data after mutations
4. **Error Handling**: Comprehensive error states with retry options

## Future Enhancements

- Real-time updates using WebSocket connections
- Bulk actions for multiple applications
- Advanced filtering and search capabilities
- Photo validation automation
- Integration with external payment verification systems
- Automated email notifications for status changes