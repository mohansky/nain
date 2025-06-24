"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarDays, Star, Upload, X, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardTitle } from "@/components/ui/card"; 
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { MilestoneData, MilestoneFormProps } from "@/types";
import { Label } from "../ui/label";

// Improved validation schema
const milestoneFormSchema = z.object({
  title: z
    .string()
    .min(1, "Milestone title is required")
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  achievedAt: z
    .string()
    .min(1, "Achievement date is required")
    .refine(
      (date) => !isNaN(new Date(date).getTime()),
      "Please enter a valid date"
    )
    .refine(
      (date) => new Date(date) <= new Date(),
      "Date cannot be in the future"
    ),
  photos: z
    .array(z.instanceof(FileList))
    .optional()
    .refine((files) => {
      if (!files || files.length === 0) return true;
      return files.every(
        (fileList) =>
          !fileList ||
          fileList.length === 0 ||
          Array.from(fileList).every((file) => file.size <= 10000000)
      );
    }, "Each image must be less than 10MB")
    .refine((files) => {
      if (!files || files.length === 0) return true;
      return files.every(
        (fileList) =>
          !fileList ||
          fileList.length === 0 ||
          Array.from(fileList).every((file) =>
            ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
              file.type
            )
          )
      );
    }, "Only JPEG, PNG, and WebP images are allowed"),
});

type MilestoneFormValues = z.infer<typeof milestoneFormSchema>;

// Helper function to format date for input
const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    // Format as YYYY-MM-DD for date input
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
};

export default function MilestoneForm({
  milestone,
  childId,
  onSubmit,
  onCancel,
  isLoading = false,
}: MilestoneFormProps) {
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState<boolean[]>([]);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      title: "",
      description: "",
      achievedAt: formatDateForInput(new Date()), // Default to today
      photos: [],
    },
  });

  const { reset } = form;

  // Load milestone data for editing
  useEffect(() => {
    if (milestone) {
      reset({
        title: milestone.title,
        description: milestone.description || "",
        achievedAt: formatDateForInput(milestone.achievedAt),
        photos: [], // File inputs can't be pre-populated
      });

      // Set existing photos for display
      if (milestone.photos && milestone.photos.length > 0) {
        setExistingPhotos(milestone.photos);
        setPhotoPreviews(milestone.photos);
      }
    }
  }, [milestone, reset]);

  const handleFormSubmit = async (data: MilestoneFormValues) => {
    let uploadedPhotoUrls: string[] = [...existingPhotos];

    // Upload new photos if provided
    if (data.photos && data.photos.length > 0) {
      try {
        setUploadingPhotos(new Array(data.photos.length).fill(true));
        
        const newPhotoUploads = await Promise.all(
          data.photos.map(async (fileList, index) => {
            if (fileList && fileList.length > 0) {
              const file = fileList[0];
              const formData = new FormData();
              formData.append("file", file);
              formData.append("folder", "milestones");

              const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Upload failed");
              }

              const { url } = await response.json();
              
              // Update upload status for this photo
              setUploadingPhotos(prev => {
                const newStatus = [...prev];
                newStatus[index] = false;
                return newStatus;
              });
              
              return url;
            }
            return null;
          })
        );

        // Filter out null values and add to existing photos
        const validUploads = newPhotoUploads.filter(
          (url) => url !== null
        ) as string[];
        uploadedPhotoUrls = [...uploadedPhotoUrls, ...validUploads];
        
        setUploadingPhotos([]);
      } catch (error) {
        console.error("Photo upload failed:", error);
        setUploadingPhotos([]);
        // Show error to user
        form.setError("photos", {
          type: "manual",
          message: "Photo upload failed. Please try again."
        });
        return;
      }
    }

    const submitData: MilestoneData = {
      childId,
      title: data.title.trim(),
      description: data.description?.trim() || undefined,
      achievedAt: new Date(data.achievedAt),
      photos: uploadedPhotoUrls,
    };

    const success = await onSubmit(submitData);
    if (success && !milestone) {
      // Reset form if adding new milestone
      reset({
        title: "",
        description: "",
        achievedAt: formatDateForInput(new Date()),
        photos: [],
      });
      setPhotoPreviews([]);
      setExistingPhotos([]);
      setUploadingPhotos([]);
      // Clear all file inputs
      fileInputRefs.current.forEach((ref) => {
        if (ref) ref.value = "";
      });
    }
  };

  const handleAddPhoto = () => {
    const currentPhotos = form.getValues("photos") || [];
    if (existingPhotos.length + currentPhotos.length < 5) {
      form.setValue("photos", [...currentPhotos, new DataTransfer().files]);
    }
  };

  const handlePhotoChange = (index: number, files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      
      // Validate file size and type
      if (file.size > 10000000) {
        form.setError(`photos.${index}`, {
          type: "manual",
          message: "Image must be less than 10MB"
        });
        return;
      }
      
      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        form.setError(`photos.${index}`, {
          type: "manual",
          message: "Only JPEG, PNG, and WebP images are allowed"
        });
        return;
      }
      
      // Clear any previous errors
      form.clearErrors(`photos.${index}`);
      
      // Update form data
      const currentPhotos = form.getValues("photos") || [];
      const newPhotos = [...currentPhotos];
      newPhotos[index] = files;
      form.setValue("photos", newPhotos);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreviews((prev) => {
          const newPreviews = [...prev];
          const previewIndex = existingPhotos.length + index;
          newPreviews[previewIndex] = reader.result as string;
          return newPreviews;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    if (index < existingPhotos.length) {
      // Removing existing photo
      setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
      setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Removing new photo
      const newPhotoIndex = index - existingPhotos.length;
      const currentPhotos = form.getValues("photos") || [];
      const newPhotos = currentPhotos.filter((_, i) => i !== newPhotoIndex);
      form.setValue("photos", newPhotos);

      // Update previews
      setPhotoPreviews((prev) => {
        const newPreviews = [...prev];
        newPreviews.splice(index, 1);
        return newPreviews;
      });

      // Clear the file input
      const fileInput = fileInputRefs.current[newPhotoIndex];
      if (fileInput) {
        fileInput.value = "";
      }
      
      // Clear any errors for this field
      form.clearErrors(`photos.${newPhotoIndex}`);
    }
  };

  const maxDate = formatDateForInput(new Date());
  const photos = form.watch("photos") || [];

  return (
    <Card className="w-full max-w-4xl mx-auto border-0 shadow-none bg-base-200">
      <CardContent>
        <CardTitle className="text-xl flex items-center gap-2 mb-3">
          <Star className="w-6 h-6" />
          {milestone ? "Edit Milestone" : "Add New Milestone"}
        </CardTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-4"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        Milestone Title
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., First steps, First word, Potty trained"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="achievedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Achievement Date
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          max={maxDate}
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us more about this milestone..."
                          className="min-h-[100px]"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Add details about how this milestone was achieved or why
                        its special.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div> 
            
            {/* Photos Section */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Camera className="w-4 h-4" /> 
                Milestone Photos
              </Label>
              
              {/* Photo Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={preview}
                        width={200}
                        height={200}
                        alt={`Milestone photo ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="error"
                        size="icon"
                        className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removePhoto(index)}
                        disabled={isLoading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      {/* Upload progress indicator */}
                      {uploadingPhotos[index - existingPhotos.length] && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Photo Upload Inputs */}
              <div className="space-y-4">
                {photos.map((_, index) => (
                  <FormField
                    key={index}
                    control={form.control}
                    name={`photos.${index}` as `photos.${number}`}
                    render={({ field: { name, onBlur }, fieldState: { error } }) => (
                      <FormItem>
                        <div className="flex items-center gap-4 p-4 border rounded-lg">
                          <Camera className="w-6 h-6 text-muted-foreground" />
                          <div className="flex-1">
                            <Input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={(e) => handlePhotoChange(index, e.target.files)}
                              onBlur={onBlur}
                              name={name}
                              ref={(el) => {
                                fileInputRefs.current[index] = el;
                              }}
                              disabled={isLoading || uploadingPhotos[index]}
                            />
                            {uploadingPhotos[index] && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Uploading...
                              </p>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePhoto(existingPhotos.length + index)}
                            disabled={isLoading}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <FormMessage>{error?.message}</FormMessage>
                      </FormItem>
                    )}
                  />
                ))}

                {/* Add Photo Button */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPhoto}
                  disabled={
                    isLoading || 
                    existingPhotos.length + photos.length >= 5 ||
                    uploadingPhotos.some(Boolean)
                  }
                  className="w-full flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Add Photo ({existingPhotos.length + photos.length}/5)
                </Button>

                <FormDescription className="text-xs">
                  Upload up to 5 photos. JPEG, PNG, or WebP. Max 10MB each.
                </FormDescription>
              </div>
            </div>
 
            <div className="flex justify-end gap-4 pt-6 border-0">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || uploadingPhotos.some(Boolean)}
              >
                {isLoading || uploadingPhotos.some(Boolean)
                  ? milestone
                    ? "Updating..."
                    : "Adding..."
                  : milestone
                  ? "Update Milestone"
                  : "Add Milestone"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}