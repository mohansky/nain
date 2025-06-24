"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { isValidDate, calculateAge, getInitials } from "@/lib/utils";
import type { Relationship, ChildFormProps } from "@/types";
import {
  CalendarDays,
  User,
  Ruler,
  Weight,
  Users,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const relationships: { value: Relationship; label: string; icon: string }[] = [
  { value: "Mom", label: "Mom", icon: "👩‍👧‍👦" },
  { value: "Dad", label: "Dad", icon: "👨‍👧‍👦" },
  { value: "Brother", label: "Brother", icon: "👦" },
  { value: "Sister", label: "Sister", icon: "👧" },
  { value: "Grandparent", label: "Grandparent", icon: "👴" },
  { value: "Babysitter", label: "Babysitter", icon: "👤" },
  // { value: 'Other', label: 'Other', icon: '👤' },
];

// Create validation schema that works in both server and client environments
const createChildFormSchema = () => {
  const baseSchema = {
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((date) => isValidDate(date), "Please enter a valid date")
      .refine(
        (date) => new Date(date) <= new Date(),
        "Date cannot be in the future"
      ),
    gender: z.enum(["Male", "Female", "Other"]),
    headCircumference: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
        "Please enter a valid measurement"
      ),
    height: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
        "Please enter a valid height"
      ),
    weight: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
        "Please enter a valid weight"
      ),
    relationship: z.enum([
      "Mom",
      "Dad",
      "Brother",
      "Sister",
      "Grandparent",
      "Babysitter",
      "Other",
    ]),
    isPrimary: z.boolean(),
  };

  // Only add FileList validation in browser environment
  if (typeof window !== "undefined" && typeof FileList !== "undefined") {
    return z.object({
      ...baseSchema,
      profileImage: z
        .instanceof(FileList)
        .optional()
        .refine((files) => {
          if (!files || files.length === 0) return true; // Optional field
          return files[0]?.size <= 5000000; // 5MB limit
        }, "Image must be less than 5MB")
        .refine((files) => {
          if (!files || files.length === 0) return true; // Optional field
          return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
            files[0]?.type
          );
        }, "Only JPEG, PNG, and WebP images are allowed"),
    });
  } else {
    // Server-side or environments without FileList
    return z.object({
      ...baseSchema,
      profileImage: z.any().optional(),
    });
  }
};

type ChildFormValues = z.infer<ReturnType<typeof createChildFormSchema>>;

// Helper function to safely format date
const formatDateForInput = (date: Date | string | undefined): string => {
  if (!date) return "";

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";
    return dateObj.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export default function ChildForm({
  child,
  onSubmit,
  onCancel,
  isLoading = false,
}: ChildFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ChildFormValues>({
    resolver: zodResolver(createChildFormSchema()),
    defaultValues: {
      name: "",
      dateOfBirth: "",
      gender: "Male",
      profileImage: undefined,
      headCircumference: "",
      height: "",
      weight: "",
      relationship: "Mom",
      isPrimary: false,
    },
  });

  const { watch, reset } = form;
  const watchedDateOfBirth = watch("dateOfBirth");

  // Load child data for editing
  useEffect(() => {
    if (child) {
      reset({
        name: child.name,
        dateOfBirth: formatDateForInput(child.dateOfBirth),
        gender: child.gender,
        profileImage: undefined, // File inputs can't be pre-populated
        headCircumference: child.headCircumference?.toString() || "",
        height: child.height?.toString() || "",
        weight: child.weight?.toString() || "",
        relationship: child.relationship,
        isPrimary: child.isPrimary,
      });

      // Set existing profile image preview if available
      if (child.profileImage) {
        setImagePreview(child.profileImage);
      }
    }
  }, [child, reset]);

  const handleFormSubmit = async (data: ChildFormValues) => {
    let profileImageUrl: string | null = null;

    // Upload profile image if provided
    if (data.profileImage && data.profileImage[0]) {
      try {
        const formData = new FormData();
        formData.append("file", data.profileImage[0]);
        formData.append("folder", "children");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Upload failed");
        }

        const { url } = await response.json();
        profileImageUrl = url;
      } catch (error) {
        console.error("Image upload failed:", error);
        // You might want to show this error to the user
        // For now, we'll continue without the image
        profileImageUrl = null;
      }
    }

    const submitData = {
      name: data.name.trim(),
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      profileImage: profileImageUrl, // Store URL, not file
      headCircumference: data.headCircumference
        ? Number(data.headCircumference)
        : undefined,
      height: data.height ? Number(data.height) : undefined,
      weight: data.weight ? Number(data.weight) : undefined,
      relationship: data.relationship,
      isPrimary: data.isPrimary,
    };

    const success = await onSubmit(submitData);
    if (success && !child) {
      // Reset form if adding new child
      reset();
      setImagePreview(null);
    }
  };

  const handleImageChange = (file: File | undefined) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue("profileImage", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const maxDate = new Date().toISOString().split("T")[0];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader></CardHeader>
      <CardContent>
        <CardTitle className="text-xl flex items-center gap-2 mb-5">
          <User className="w-6 h-6" />
          {child ? "Edit Child" : "Add New Child"}
        </CardTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="space-y-8"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Image */}
                <FormField
                  control={form.control}
                  name="profileImage"
                  render={({ field: { onChange, name, onBlur } }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Profile Picture</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-6">
                          {/* Avatar Preview */}
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={imagePreview || undefined} />
                            <AvatarFallback className="text-xl">
                              {form.watch("name") ? (
                                getInitials(form.watch("name"))
                              ) : (
                                <User className="w-8 h-8" />
                              )}
                            </AvatarFallback>
                          </Avatar>

                          {/* Upload Controls */}
                          <div className="flex flex-col gap-2">
                            <Input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                onChange(e.target.files);
                                handleImageChange(file);
                              }}
                              onBlur={onBlur}
                              name={name}
                              ref={fileInputRef}
                              disabled={isLoading}
                              className="hidden"
                            />

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                                className="flex items-center gap-2"
                              >
                                <Upload className="w-4 h-4" />
                                Upload Photo
                              </Button>

                              {imagePreview && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={removeImage}
                                  disabled={isLoading}
                                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                  Remove
                                </Button>
                              )}
                            </div>

                            <FormDescription className="text-xs">
                              Optional. JPEG, PNG, or WebP. Max 5MB.
                            </FormDescription>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        Childs Name
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter child's name"
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
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        Date of Birth
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
                      {watchedDateOfBirth &&
                        !form.formState.errors.dateOfBirth && (
                          <FormDescription className="text-primary">
                            {calculateAge(watchedDateOfBirth).ageString}
                          </FormDescription>
                        )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="flex gap-4"
                          disabled={isLoading}
                        >
                          {(["Male", "Female" ] as const).map(
                            (option) => (
                              <div
                                key={option}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={option}
                                  id={`gender-${option}`}
                                />
                                <Label
                                  htmlFor={`gender-${option}`}
                                  className="font-normal"
                                >
                                  {option}
                                </Label>
                              </div>
                            )
                          )}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Measurements */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Ruler className="w-4 h-4" />
                Measurements (Optional)
              </div>
              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="headCircumference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">
                        Head Circumference (cm)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 35.5"
                          step="0.1"
                          min="0"
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
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 75.5"
                          step="0.1"
                          min="0"
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
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-xs">
                        <Weight className="w-4 h-4" />
                        Weight (kg)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 9.5"
                          step="0.1"
                          min="0"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Relationship */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="w-4 h-4" />
                Your Relationship
              </div>
              <Separator />

              <FormField
                control={form.control}
                name="relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isLoading}
                        className="flex flex-row gap-2"
                      >
                        {relationships.map((rel) => (
                          <div
                            key={rel.value}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={rel.value}
                              id={`relationship-${rel.value}`}
                            />
                            <Label htmlFor={`relationship-${rel.value}`}>
                              {rel.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />
              <FormField
                control={form.control}
                name="isPrimary"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2 mt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium">
                        Primary caregiver
                      </FormLabel>
                      <FormDescription className="text-xs">
                        Mark this if you are the primary caregiver for this
                        child
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-0">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? child
                    ? "Updating..."
                    : "Adding..."
                  : child
                  ? "Update Child"
                  : "Add Child"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}