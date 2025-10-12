# Fix for Children Photos Not Loading After Reload

## Problem
Children photos were not loading after page reload, even though they were successfully uploaded and stored.

## Root Cause
The `useFormData` hook was not properly initializing children photos from existing application data. It only handled main photo and spouse photo initialization.

## Solution

### 1. Updated `useFormData` Hook (`src/hooks/use-form-data.ts`)

**Added children photo initialization:**
```typescript
// Add children photos if available
if (existingApplication.children && existingApplication.children.length > 0) {
  const childrenPhotos: { [childIndex: number]: { file: File; preview: string; path?: string; signedUrl?: string } } = {}
  existingApplication.children.forEach((child, index) => {
    if (child.photoUrl) {
      childrenPhotos[index] = createPhotoData(child.photoUrl)
    }
  })
  if (Object.keys(childrenPhotos).length > 0) {
    transformedData.childrenPhotos = childrenPhotos
  }
}
```

**Added signed URL fetching for children photos:**
```typescript
// Fetch signed URLs for children photos
if (existingApplication.children && transformedData.childrenPhotos) {
  const childrenPhotosUpdates: { [childIndex: number]: { file: File; preview: string; path?: string; signedUrl?: string } } = {}
  
  for (let index = 0; index < existingApplication.children.length; index++) {
    const child = existingApplication.children[index]
    if (child.photoUrl && transformedData.childrenPhotos[index]) {
      const signedUrl = await getSignedUrl(child.photoUrl)
      if (signedUrl) {
        childrenPhotosUpdates[index] = {
          ...transformedData.childrenPhotos[index],
          signedUrl,
          preview: signedUrl
        }
      }
    }
  }
  
  if (Object.keys(childrenPhotosUpdates).length > 0) {
    updates.childrenPhotos = childrenPhotosUpdates
  }
}
```

**Updated condition to trigger signed URL fetching:**
```typescript
const hasChildrenPhotos = existingApplication.children?.some(child => child.photoUrl)
if (existingApplication.photoUrl || existingApplication.spousePhotoUrl || hasChildrenPhotos) {
  fetchSignedUrls()
}
```

### 2. Enhanced `PersonalPhotoUpload` Component (`src/components/dv-form/personal-photo-upload.tsx`)

**Added effect to handle async initial data updates:**
```typescript
// Handle when initialData changes (for async loading)
useEffect(() => {
  if (initialData && initialData.file !== uploadedFile) {
    setUploadedFile(initialData.file)
    setPreview(initialData.signedUrl || initialData.preview || '')
    setStoragePath(initialData.path)
    setSignedUrl(initialData.signedUrl)
    setIsExistingPhoto(!!initialData.path)
    if (initialData.file) {
      setValidation({ isValid: true, errors: [], warnings: [] })
    }
  }
}, [initialData, uploadedFile])
```

**Fixed signed URL notification logic:**
```typescript
// Notify parent component (for both new uploads and existing photos)
if (uploadedFile || isExistingPhoto) {
  onPhotoChange({
    file: uploadedFile || new File([], 'existing-photo.jpg'),
    preview: signedUrlData.signedUrl,
    path: storagePath,
    signedUrl: signedUrlData.signedUrl
  })
}
```

### 3. Enhanced `ChildrenForm` Component (`src/components/dv-form/children-form.tsx`)

**Added effect to update children photos state when initial data changes:**
```typescript
// Update children photos when initialChildrenPhotos changes
useEffect(() => {
  if (initialChildrenPhotos && Object.keys(initialChildrenPhotos).length > 0) {
    console.log('Updating childrenPhotos state with:', initialChildrenPhotos)
    setChildrenPhotos(initialChildrenPhotos)
  }
}, [initialChildrenPhotos])
```

## Data Flow

1. **Page Load**: `useFormData` hook initializes with existing application data
2. **Photo Initialization**: Children photos are extracted from `application.children[].photoUrl`
3. **Signed URL Fetching**: Async process fetches signed URLs for secure access
4. **State Updates**: Form data is updated with signed URLs
5. **Component Re-render**: Children form receives updated photo data
6. **Photo Display**: Each child's photo component displays the loaded image

## Key Changes Summary

- ✅ Children photos now initialize from database on page reload
- ✅ Signed URLs are properly fetched for existing children photos
- ✅ Photo components handle async data loading
- ✅ State synchronization between form data and photo components
- ✅ Debug logging added for troubleshooting

## Testing

To verify the fix:
1. Upload photos for children in a DV application
2. Save/submit the application
3. Reload the page or navigate away and back
4. Children photos should now display correctly

The fix ensures that children photos persist across page reloads and are properly displayed in the form interface.