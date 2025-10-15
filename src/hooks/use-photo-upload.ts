import { useState, useCallback } from "react";

interface PhotoUploadState {
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
  uploadedPhoto: {
    path: string;
    signedUrl: string;
    file: File;
    preview: string;
  } | null;
}

interface PhotoUploadResult {
  success: boolean;
  data?: {
    path: string;
    signedUrl: string;
    validation: {
      isValid: boolean;
      warnings: string[];
      metadata?: {
        width: number;
        height: number;
        size: number;
        format: string;
      };
    };
  };
  error?: string;
}

export function usePhotoUpload() {
  const [state, setState] = useState<PhotoUploadState>({
    isUploading: false,
    uploadProgress: 0,
    error: null,
    uploadedPhoto: null,
  });

  const uploadPhoto = useCallback(
    async (file: File, applicationId?: string): Promise<PhotoUploadResult> => {
      setState((prev) => ({
        ...prev,
        isUploading: true,
        uploadProgress: 0,
        error: null,
      }));

      try {
        // Create form data
        const formData = new FormData();
        formData.append("photo", file);
        if (applicationId) {
          formData.append("applicationId", applicationId);
        }

        // Upload photo
        const response = await fetch("/api/photos/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          setState((prev) => ({
            ...prev,
            isUploading: false,
            error: result.error || "Upload failed",
          }));
          return result;
        }

        // Create preview URL
        const preview = URL.createObjectURL(file);

        // Update state with successful upload
        setState((prev) => ({
          ...prev,
          isUploading: false,
          uploadProgress: 100,
          uploadedPhoto: {
            path: result.data.path,
            signedUrl: result.data.signedUrl,
            file,
            preview,
          },
        }));

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setState((prev) => ({
          ...prev,
          isUploading: false,
          error: errorMessage,
        }));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    []
  );

  const deletePhoto = useCallback(
    async (path: string): Promise<boolean> => {
      try {
        const response = await fetch("/api/photos/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path }),
        });

        const result = await response.json();

        if (result.success) {
          // Clean up local state
          if (state.uploadedPhoto?.preview) {
            URL.revokeObjectURL(state.uploadedPhoto.preview);
          }

          setState((prev) => ({
            ...prev,
            uploadedPhoto: null,
            error: null,
          }));
        }

        return result.success;
      } catch (error) {
        console.error("Delete photo error:", error);
        return false;
      }
    },
    [state.uploadedPhoto?.preview]
  );

  const getSignedUrl = useCallback(
    async (path: string, expiresIn?: number): Promise<string | null> => {
      try {
        const params = new URLSearchParams({ path });
        if (expiresIn) {
          params.append("expiresIn", expiresIn.toString());
        }

        const response = await fetch(`/api/photos/signed-url?${params}`);
        const result = await response.json();

        if (result.success) {
          return result.data.signedUrl;
        }

        return null;
      } catch (error) {
        console.error("Get signed URL error:", error);
        return null;
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  const clearPhoto = useCallback(() => {
    if (state.uploadedPhoto?.preview) {
      URL.revokeObjectURL(state.uploadedPhoto.preview);
    }

    setState((prev) => ({
      ...prev,
      uploadedPhoto: null,
      error: null,
    }));
  }, [state.uploadedPhoto?.preview]);

  return {
    // State
    isUploading: state.isUploading,
    uploadProgress: state.uploadProgress,
    error: state.error,
    uploadedPhoto: state.uploadedPhoto,

    // Actions
    uploadPhoto,
    deletePhoto,
    getSignedUrl,
    clearError,
    clearPhoto,
  };
}
