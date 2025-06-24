"use client";

import { useState, useEffect, useRef } from "react";
import type { Language } from "@/types";
import { Card, CardContent } from "../ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PenIcon, X, User, Camera } from "lucide-react";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateUserProfile } from "@/app/actions/user-profile";
import { toast } from "sonner";
import { useActionState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { refreshSession, forceSessionReload, useSession } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";

const languages: { value: Language; label: string; flag: string }[] = [
  { value: "English", label: "English", flag: "🇺🇸" },
  { value: "Hindi", label: "हिंदी", flag: "🇮🇳" },
  { value: "Assamese", label: "অসমীয়া", flag: "🇮🇳" },
  { value: "Bengali", label: "বাংলা", flag: "🇮🇳" },
  { value: "Kannada", label: "ಕನ್ನಡ", flag: "🇮🇳" },
  { value: "Tamil", label: "தமிழ்", flag: "🇮🇳" },
  { value: "Marathi", label: "मराठी", flag: "🇮🇳" },
];

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  language: z.enum([
    "English",
    "Hindi",
    "Assamese",
    "Bengali",
    "Kannada",
    "Tamil",
    "Marathi",
  ]),
  avatar: z.any().optional(), // Use z.any() for FileList to avoid SSR issues
});

type ProfileFormData = z.infer<typeof formSchema>;

interface ActionState {
  success: boolean;
  errors: Record<string, string>;
}

interface UserProfileFormProps {
  onProfileUpdate?: () => void;
}

export default function UserProfileForm({
  onProfileUpdate,
}: UserProfileFormProps) {
  const { data: session } = useSession();
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error,
    refetch,
  } = useUserProfile();
  const [open, setOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (
      _prevState: ActionState,
      formData: FormData
    ): Promise<ActionState> => {
      // Handle avatar upload first if provided
      let avatarUrl: string | null = null;
      const avatarFile = formData.get("avatar") as File;

      if (avatarFile && avatarFile.size > 0) {
        try {
          setIsUploadingAvatar(true);
          
          const uploadFormData = new FormData();
          uploadFormData.append("file", avatarFile);
          uploadFormData.append("folder", "avatars");

          const response = await fetch("/api/upload", {
            method: "POST",
            body: uploadFormData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Avatar upload failed");
          }

          const { url } = await response.json();
          avatarUrl = url;
          
          // Add avatar URL to form data for the profile update
          if (avatarUrl) {
            formData.set("avatarUrl", avatarUrl);
          }
        } catch (error) {
          setIsUploadingAvatar(false);
          const errorMessage = error instanceof Error ? error.message : "Avatar upload failed";
          toast.error(errorMessage);
          return {
            success: false,
            errors: { avatar: errorMessage },
          };
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      // Client-side validation
      const validationResult = formSchema.safeParse({
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        language: formData.get("language") as Language,
        avatar: avatarFile && avatarFile.size > 0 ? new DataTransfer().files : undefined,
      });

      if (!validationResult.success) {
        const errors = validationResult.error.errors.reduce((acc, error) => {
          acc[error.path[0] as string] = error.message;
          return acc;
        }, {} as Record<string, string>);

        return { success: false, errors };
      }

      try {
        const result = await updateUserProfile(formData);

        if (result.success) {
          // Refresh the profile data
          await refetch();

          // Refresh the auth session to get updated user data
          try {
            await refreshSession();
            await forceSessionReload(); 
            await new Promise(resolve => setTimeout(resolve, 300));
          } catch {
            // Don't fail the whole operation if session refresh fails
          }

          // Call parent callback to refresh session data
          if (onProfileUpdate) {
            try {
              await onProfileUpdate();
            } catch {
              // Handle callback error silently
            }
          }

          toast.success("Profile updated successfully!");
          setOpen(false);
          setAvatarPreview(null);

          return { success: true, errors: {} };
        } else {
          toast.error(result.error || "Failed to update profile");
          return {
            success: false,
            errors: { general: result.error || "Failed to update profile" },
          };
        }
      } catch {
        const errorMessage = "An unexpected error occurred";
        toast.error(errorMessage);
        return { success: false, errors: { general: errorMessage } };
      }
    },
    { success: false, errors: {} } as ActionState
  );

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      language: "English",
      avatar: undefined,
    },
  });

  // Update form when profile data changes
  useEffect(() => {
    if (profileData) {
      form.reset({
        name: profileData.user?.name || "",
        phone: profileData.userProfile?.phone || "",
        language: profileData.userProfile?.language || "English",
        avatar: undefined,
      });
      
      // Set existing avatar preview if available
      if (profileData.userProfile?.avatar) {
        setAvatarPreview(profileData.userProfile.avatar);
      } else {
        setAvatarPreview(null);
      }
    }
  }, [profileData, form]);

  // Update form errors from server action
  useEffect(() => {
    if (state.errors) {
      Object.entries(state.errors).forEach(([field, message]) => {
        if (field !== "general") {
          form.setError(field as keyof ProfileFormData, {
            message: message,
          });
        }
      });
    }
  }, [state.errors, form]);

  const handleAvatarChange = (file: File | undefined) => {
    if (file) {
      // Validate file before creating preview
      if (file.size > 5000000) {
        form.setError("avatar", {
          type: "manual",
          message: "Avatar must be less than 5MB"
        });
        return;
      }

      if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
        form.setError("avatar", {
          type: "manual",
          message: "Only JPEG, PNG, and WebP images are allowed"
        });
        return;
      }

      // Clear any previous errors
      form.clearErrors("avatar");

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(profileData?.userProfile?.avatar || null);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    form.setValue("avatar", undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentAvatar = avatarPreview || profileData?.userProfile?.avatar;
  const displayName = form.watch("name") || profileData?.user?.name || session?.user?.name || "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <PenIcon className="w-4 h-4" />
          <span className="sr-only">Edit Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>
            Update your profile information and preferences.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6 space-y-6">
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {state.errors?.general && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">
                  {state.errors.general}
                </p>
              </div>
            )}

            <Form {...form}>
              <form action={formAction} className="space-y-6">
                {/* Avatar Upload */}
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field: { onChange, name, onBlur } }) => (
                    <FormItem>
                      <FormLabel>Profile Picture</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-6">
                          {/* Avatar Preview */}
                          <div className="relative">
                            <Avatar className="w-20 h-20">
                              <AvatarImage src={currentAvatar || undefined} />
                              <AvatarFallback className="text-xl">
                                {displayName ? (
                                  getInitials(displayName)
                                ) : (
                                  <User className="w-8 h-8" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* Upload progress indicator */}
                            {isUploadingAvatar && (
                              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                              </div>
                            )}
                          </div>

                          {/* Upload Controls */}
                          <div className="flex flex-col gap-2">
                            <Input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                onChange(e.target.files);
                                handleAvatarChange(file);
                              }}
                              onBlur={onBlur}
                              name={name}
                              ref={fileInputRef}
                              disabled={isPending || isUploadingAvatar}
                              className="hidden"
                            />

                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isPending || isUploadingAvatar}
                                className="flex items-center gap-2"
                              >
                                <Camera className="w-4 h-4" />
                                {currentAvatar ? "Change" : "Upload"}
                              </Button>

                              {currentAvatar && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={removeAvatar}
                                  disabled={isPending || isUploadingAvatar}
                                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                                >
                                  <X className="w-4 h-4" />
                                  Remove
                                </Button>
                              )}
                            </div>

                            <FormDescription className="text-xs">
                              JPEG, PNG, or WebP. Max 5MB.
                            </FormDescription>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your full name"
                          {...field}
                          name="name"
                          disabled={isPending || isUploadingAvatar}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field (Read-only) */}
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      value={session?.user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription>
                    Email cannot be changed here
                  </FormDescription>
                </FormItem>

                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+91 98765 43210"
                          {...field}
                          name="phone"
                          disabled={isPending || isUploadingAvatar}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional - for important notifications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Language Field */}
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Language</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          name="language"
                          disabled={isPending || isUploadingAvatar}
                          className="grid grid-cols-1 md:grid-cols-2 gap-3 h-content overflow-y-auto"
                        >
                          {languages.map((lang) => (
                            <FormItem key={lang.value}>
                              <FormControl>
                                <div
                                  className={`flex items-center space-x-2 p-2 rounded-lg border border-input transition-colors ${
                                    isPending || isUploadingAvatar
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:border-primary/50"
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={lang.value}
                                    id={lang.value}
                                    disabled={isPending || isUploadingAvatar}
                                  />
                                  <FormLabel
                                    htmlFor={lang.value}
                                    className="cursor-pointer flex-1 font-normal"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div>
                                        <div className="font-medium">
                                          {lang.label}
                                        </div>
                                        {lang.value !== lang.label && (
                                          <div className="text-sm text-muted-foreground">
                                            {lang.value}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </FormLabel>
                                </div>
                              </FormControl>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isPending || isUploadingAvatar}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={isPending || isUploadingAvatar}
                  >
                    {isPending || isUploadingAvatar ? "Updating..." : "Update Profile"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}