# Photo Functionality for DV Form

## Overview

The DV form now supports photo uploads for spouse and children in addition to the main applicant photo. This functionality uses reusable components to ensure consistency and maintainability.

## Components

### PersonalPhotoUpload Component

**Location**: `src/components/dv-form/personal-photo-upload.tsx`

A reusable photo upload component that handles:
- Drag and drop photo upload
- Photo validation (size, format, dimensions)
- Cloud storage integration
- Preview display
- Error handling

**Props**:
- `onPhotoChange`: Callback when photo changes
- `initialData`: Existing photo data
- `applicationId`: Application ID for storage
- `label`: Display label for the photo
- `description`: Optional description text
- `required`: Whether photo is required
- `disabled`: Whether upload is disabled

## Integration

### Marital Status Form

**Location**: `src/components/dv-form/marital-status-form.tsx`

- Added spouse photo upload when marital status is "Married — spouse is NOT a U.S. citizen or U.S. LPR"
- Photo is required for spouse when applicable
- Integrates with existing form validation

### Children Form

**Location**: `src/components/dv-form/children-form.tsx`

- Added photo upload for each child
- Photos are required for all children
- Handles dynamic addition/removal of children and their photos
- Maintains photo indexing when children are removed

### Multi-Step Form

**Location**: `src/components/dv-form/multi-step-form.tsx`

- Updated to handle spouse and children photo data
- Passes application ID to photo components
- Manages photo state separately from form step data

### Review Form

**Location**: `src/components/dv-form/review-form.tsx`

- Displays spouse photo when applicable
- Shows all children photos with their names
- Provides edit links to go back and modify photos

## Data Structure

Photos are stored in the `FormStepData` interface:

```typescript
interface FormStepData {
  // ... other fields
  photo?: PhotoData
  spousePhoto?: PhotoData
  childrenPhotos?: {
    [childIndex: number]: PhotoData
  }
}

interface PhotoData {
  file: File
  preview: string
  path?: string
  signedUrl?: string
}
```

## Features

### Photo Validation
- Square format (equal width and height)
- 600x600 to 1200x1200 pixels
- JPEG or PNG format
- Maximum 5MB file size
- Recent photo requirement

### Cloud Storage
- Automatic upload to secure cloud storage
- Signed URLs for secure access
- Automatic cleanup of old photos when replaced

### User Experience
- Drag and drop interface
- Real-time validation feedback
- Progress indicators during upload
- Error handling with clear messages
- Preview of uploaded photos

## Usage Example

```tsx
<PersonalPhotoUpload
  onPhotoChange={(photoData) => handlePhotoChange(photoData)}
  initialData={existingPhoto}
  applicationId={applicationId}
  label="Spouse Photo"
  description="Upload a recent passport-style photo of your spouse"
  required={true}
  disabled={isLoading}
/>
```

## Benefits

1. **Reusable**: Single component handles all photo upload scenarios
2. **Consistent**: Same validation and UI across all photo uploads
3. **Secure**: Automatic cloud storage with signed URLs
4. **User-friendly**: Clear feedback and error handling
5. **Maintainable**: Centralized photo logic makes updates easier

## Future Enhancements

- Batch photo upload for multiple children
- Photo cropping/editing tools
- Advanced validation (face detection, etc.)
- Photo compression optimization
- Offline photo caching