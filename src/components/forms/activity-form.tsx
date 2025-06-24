"use client";
// src/components/forms/activity-form.tsx
import { useEffect, useState, useRef, useActionState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Clock,
  ImageIcon,
  Upload,
  X,
  Calendar,
  Tag, 
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter, 
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; 
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { Activity, ActivityCategories, ActivityFormState } from "@/types";
import { createActivity, updateActivity } from "@/app/actions/activity-actions";
import {
  activityFormSchema,
  ClientActivityFormValues,
} from "@/lib/validations/activity-validation";

// Activity categories with icons
const categories: ActivityCategories[] = [
  {
    value: "play",
    label: "Play",
    icon: "🎮", 
  },
  {
    value: "learning",
    label: "Learning",
    icon: "📚",
  },
  {
    value: "exercise",
    label: "Exercise",
    icon: "🏃",
  },
  {
    value: "meal",
    label: "Meal",
    icon: "🍽️", 
  },
  {
    value: "sleep",
    label: "Sleep",
    icon: "😴", 
  },
  {
    value: "medical",
    label: "Medical",
    icon: "🏥", 
  },
  {
    value: "social",
    label: "Social",
    icon: "👥", 
  },
  {
    value: "creative",
    label: "Creative",
    icon: "🎨", 
  },
  {
    value: "outdoor",
    label: "Outdoor",
    icon: "🌳", 
  },
  {
    value: "other",
    label: "Other",
    icon: "📝", 
  },
];

type ActivityFormValues = ClientActivityFormValues;

interface ActivityFormProps {
  activity?: Activity | null; // Allow null
  childId: string;
  onSuccess?: () => void;
  onCancel: () => void;
}

// Helper function to format datetime for input
const formatDateTimeForInput = (date: Date | string | undefined): string => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObj.getDate().toString().padStart(2, "0");
    const hours = dateObj.getHours().toString().padStart(2, "0");
    const minutes = dateObj.getMinutes().toString().padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return "";
  }
};

export default function ActivityForm({
  activity,
  childId,
  onSuccess,
  onCancel,
}: ActivityFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form state for server actions
  const initialState: ActivityFormState = {
    success: false,
    message: "",
  };

  // Choose the appropriate action based on whether we're editing or creating
  const boundAction = activity
    ? updateActivity.bind(null, activity.id)
    : createActivity;

  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState
  );

  // Client-side form for validation and UX
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: "",
      category: "play",
      recordedAt: formatDateTimeForInput(new Date()),
      childId: childId,
      image: "",
    },
  });

  const { reset } = form;

  // Load activity data for editing
  useEffect(() => {
    if (activity) {
      reset({
        title: activity.title,
        description: activity.description || "",
        duration: activity.duration?.toString() || "",
        category: activity.category,
        recordedAt: formatDateTimeForInput(activity.recordedAt),
        childId: activity.childId,
        image: activity.image || "",
      });

      // Set existing image preview if available
      if (activity.image) {
        setImagePreview(activity.image);
        setUploadedImageUrl(activity.image);
      }
    }
  }, [activity, reset]);

  // Handle successful form submission
  useEffect(() => {
    if (state.success) {
      if (!activity) {
        // Reset form for new activity
        reset({
          title: "",
          description: "",
          duration: "",
          category: "play",
          recordedAt: formatDateTimeForInput(new Date()),
          childId: childId,
          image: "",
        });
        setImagePreview(null);
        setUploadedImageUrl(null);
      }

      // Call success callback
      onSuccess?.();
    }
  }, [state.success, activity, reset, childId, onSuccess]);

  // Enhanced form submission with image upload
  const handleFormSubmit = async (formData: FormData) => {
    let imageUrl = uploadedImageUrl;

    // Handle image upload if a new file is selected
    const imageFile = formData.get("imageFile") as File;
    if (imageFile && imageFile.size > 0) {
      try {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        uploadFormData.append("folder", "activities");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const { url } = await response.json();
        imageUrl = url;
      } catch (error) {
        console.error("Image upload failed:", error);
        // Continue without image on upload failure
        imageUrl = uploadedImageUrl;
      }
    }

    // Set the image URL in the form data
    formData.set("image", imageUrl || "");

    // Remove the file input since we've handled it
    formData.delete("imageFile");

    // Call the server action
    formAction(formData);
  };

  const handleImageChange = (file: File | undefined) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(uploadedImageUrl);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setUploadedImageUrl(null);
    form.setValue("image", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper function to get field errors
  // const getFieldErrors = (
  //   fieldName: keyof NonNullable<ActivityFormState["errors"]>
  // ) => {
  //   if (!state.errors || typeof state.errors === "string") return null;
  //   return state.errors[fieldName];
  // };

  const maxDateTime = formatDateTimeForInput(new Date());

  return (
    <Card className="w-full max-w-4xl mx-auto border-0 shadow-none bg-base-200">
      <CardContent>
        <CardTitle className="text-xl flex items-center gap-2 mb-3">
          <Calendar className="w-6 h-6" />
          {activity ? "Edit Activity" : "Add New Activity"}
        </CardTitle>
        {/* Display server action results */}
        {state.message && (
          <Alert
            className={`mb-6 ${
              state.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <AlertDescription
              className={state.success ? "text-green-800" : "text-red-800"}
            >
              {state.message}
            </AlertDescription>
          </Alert>
        )}

        {/* Display form-level errors */}
        {state.errors && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {typeof state.errors === "string"
                ? state.errors
                : state.errors._form?.join(", ") ||
                  "Please correct the errors below"}
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form action={handleFormSubmit} className="space-y-4">
            {/* Hidden fields for server action */}
            <input type="hidden" name="childId" value={childId} />
            <input
              type="hidden"
              name="category"
              value={form.watch("category")}
            />
            {activity && (
              <input type="hidden" name="activityId" value={activity.id} />
            )}
 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        Activity Title
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Reading time, Park visit, Drawing"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {/* {getFieldErrors("title") && (
                        <p className="text-sm text-destructive">
                          {getFieldErrors("title")?.join(", ")}
                        </p>
                      )} */}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recordedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Date & Time
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          max={maxDateTime}
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        When are you planning to do this?
                      </FormDescription>
                      <FormMessage />
                      {/* {getFieldErrors("recordedAt") && (
                        <p className="text-sm text-destructive">
                          {getFieldErrors("recordedAt")?.join(", ")}
                        </p>
                      )} */}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Timer className="w-4 h-4" />
                        Duration (minutes)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 30"
                          min="1"
                          max="1440"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        How long did this activity last?
                      </FormDescription>
                      <FormMessage />
                      {/* {getFieldErrors("duration") && (
                        <p className="text-sm text-destructive">
                          {getFieldErrors("duration")?.join(", ")}
                        </p>
                      )} */}
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
                          placeholder="Tell us more about this activity..."
                          className="min-h-[60px]"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Optional. Add notes, observations, or details about the
                        activity.
                      </FormDescription>
                      <FormMessage />
                      {/* {getFieldErrors("description") && (
                        <p className="text-sm text-destructive">
                          {getFieldErrors("description")?.join(", ")}
                        </p>
                      )} */}
                    </FormItem>
                  )}
                />
              </div> 

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {" "}
                    <Tag className="w-4 h-4" />
                    Activity Category
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1"
                      disabled={isPending}
                    >
                      {categories.map((category) => (
                        <Label
                          key={category.value}
                          htmlFor={`category-${category.value}`}
                          className={`flex flex-row items-center p-2 rounded-lg border-0 bg-info/10 hover:bg-info/20 cursor-pointer transition-all ${
                            field.value === category.value
                              ? "border-primary bg-info/40"
                              : "border-border"
                          }`}
                        >
                          <RadioGroupItem
                            value={category.value}
                            id={`category-${category.value}`}
                            className="sr-only"
                          />
                          <span className="text-md ">{category.icon}</span>
                          <span className="font-notoSans text-xs text-center text-base-content/70">
                            {category.label}
                          </span> 
                        </Label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                  {/* {getFieldErrors("category") && (
                    <p className="text-sm text-destructive">
                      {getFieldErrors("category")?.join(", ")}
                    </p>
                  )} */}
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <Label>
                <ImageIcon className="w-4 h-4" /> Add Photo
              </Label>
              <div className="flex items-start gap-6">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <Image
                      src={imagePreview}
                      alt="Activity preview"
                      width={128}
                      height={128}
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="error"
                      size="icon"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={removeImage}
                      disabled={isPending}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Upload Controls */}
                <div className="flex flex-col gap-2">
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      handleImageChange(file);
                    }}
                    name="imageFile"
                    ref={fileInputRef}
                    disabled={isPending}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {imagePreview ? "Change Photo" : "Upload Photo"}
                  </Button>
                  <FormDescription className="text-xs">
                    Optional. JPEG, PNG, or WebP. Max 10MB.
                  </FormDescription>
                </div>
              </div>
              {/* {getFieldErrors("image") && (
                <p className="text-sm text-destructive">
                  {getFieldErrors("image")?.join(", ")}
                </p>
              )} */}
            </div>
 
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending} 
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? activity
                    ? "Updating..."
                    : "Adding..."
                  : activity
                  ? "Update Activity"
                  : "Add Activity"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
