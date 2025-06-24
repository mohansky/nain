"use client";
// src/app/dashboard/activity/page.tsx 
import { useState, useEffect } from "react";
import { format, isToday, isYesterday } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Tag,
  ChevronDown,
  SortAsc,
  SortDesc,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ActivityForm from "@/components/forms/activity-form";
import { useChildren } from "@/hooks/useChildren";
import { useActivities } from "@/hooks/useActivities";
import Image from "next/image";
import { Activity, ActivityCategory } from "@/types";

const categoryConfig: Record<
  ActivityCategory,
  { label: string; icon: string; color: string }
> = {
  play: {
    label: "Play",
    icon: "🎮",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  learning: {
    label: "Learning",
    icon: "📚",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  exercise: {
    label: "Exercise",
    icon: "🏃",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  meal: {
    label: "Meal",
    icon: "🍽️",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  sleep: {
    label: "Sleep",
    icon: "😴",
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  medical: {
    label: "Medical",
    icon: "🏥",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  social: {
    label: "Social",
    icon: "👥",
    color: "bg-pink-100 text-pink-800 border-pink-200",
  },
  creative: {
    label: "Creative",
    icon: "🎨",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  outdoor: {
    label: "Outdoor",
    icon: "🌳",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  other: {
    label: "Other",
    icon: "📝",
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
};

// Helper functions
const formatActivityDate = (date: Date): string => {
  if (isToday(date)) {
    return `Today, ${format(date, "h:mm a")}`;
  } else if (isYesterday(date)) {
    return `Yesterday, ${format(date, "h:mm a")}`;
  } else {
    return format(date, "MMM d, yyyy h:mm a");
  }
};

const formatDuration = (minutes?: number): string => {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

export default function ActivitiesPage() {
  // Use hooks for data management
  const { children } = useChildren();
  const {
    activities,
    isLoading: activitiesLoading,
    error: activitiesError, 
    deleteActivity,
    refreshActivities,
  } = useActivities();

  // Local state for UI
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "title" | "category">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dialogs and modals
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [deletingActivity, setDeletingActivity] = useState<Activity | null>(
    null
  );

  // Apply filters and search
  useEffect(() => {
    let filtered = [...activities];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (activity) =>
          activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Child filter
    if (selectedChild !== "all") {
      filtered = filtered.filter(
        (activity) => activity.childId === selectedChild
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (activity) => activity.category === selectedCategory
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredActivities(filtered);
  }, [
    activities,
    searchQuery,
    selectedChild,
    selectedCategory,
    sortBy,
    sortOrder,
  ]);

  // Handle form success - refresh activities and close dialogs
  const handleFormSuccess = () => {
    refreshActivities();
    setShowAddDialog(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = async () => {
    if (!deletingActivity) return;

    try {
      const success = await deleteActivity(deletingActivity.id);
      if (success) {
        setDeletingActivity(null);
        refreshActivities();
      }
    } catch (error) {
      console.error("Failed to delete activity:", error);
    }
  };

  const getChildName = (childId: string) => {
    const child = children.find((c) => c.id === childId);
    return child?.name || "Unknown Child";
  };

  const getChildAvatar = (childId: string) => {
    const child = children.find((c) => c.id === childId);
    return child?.profileImage;
  };

  // Show error state if there's an error
  if (activitiesError) {
    return ( 
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2 text-destructive">
              Error Loading Activities
            </h3>
            <p className="text-muted-foreground mb-4">{activitiesError}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card> 
    );
  }

  return (
    <div className="container max-w-lg mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Activities</h1>
          <p className="text-muted-foreground">
            Track and manage your childrens daily activities
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2"
          disabled={children.length === 0}
        >
          <Plus className="w-4 h-4" />
          Add Activity
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Child Filter */}
            <Select value={selectedChild} onValueChange={setSelectedChild} >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Children" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Children</SelectItem>
                {children.length > 0 ? (
                  children.map((child) => (
                    <SelectItem key={child.id} value={child.id}>
                      {child.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-children" disabled>
                    No children available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {sortOrder === "asc" ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                  Sort
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setSortBy("date")}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Date {sortBy === "date" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("title")}>
                  <Tag className="w-4 h-4 mr-2" />
                  Title {sortBy === "title" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("category")}>
                  <Filter className="w-4 h-4 mr-2" />
                  Category {sortBy === "category" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                >
                  {sortOrder === "asc" ? (
                    <SortDesc className="w-4 h-4 mr-2" />
                  ) : (
                    <SortAsc className="w-4 h-4 mr-2" />
                  )}
                  {sortOrder === "asc" ? "Descending" : "Ascending"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <div className="space-y-4">
        {activitiesLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading activities...</p>
            </CardContent>
          </Card>
        ) : filteredActivities.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No activities found
              </h3>
              <p className="text-muted-foreground mb-4">
                {activities.length === 0
                  ? children.length === 0
                    ? "Add a child first, then start tracking their activities!"
                    : "Start tracking activities by adding your first one!"
                  : "Try adjusting your search or filters."}
              </p>
              {activities.length === 0 && children.length > 0 && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Activity
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredActivities.map((activity) => {
            const categoryInfo = categoryConfig[activity.category];
            return (
              <Card
                key={activity.id}
                className={`hover:shadow-md transition-shadow border-0 ${categoryInfo.color}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={getChildAvatar(activity.childId) || " "}
                          />
                          <AvatarFallback className="text-xs">
                            {getChildName(activity.childId).slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {activity.title}
                            </h3>
                            <Badge
                              variant="secondary"
                              className={categoryInfo.color}
                            >
                              {categoryInfo.icon} {categoryInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getChildName(activity.childId)} •{" "}
                            {formatActivityDate(activity.recordedAt)}
                            {activity.duration &&
                              ` • ${formatDuration(activity.duration)}`}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {activity.description && (
                        <p className="text-sm leading-relaxed pl-11">
                          {activity.description}
                        </p>
                      )}

                      {/* Image */}
                      {activity.image && (
                        <div className="pl-11">
                          <Image
                            src={activity.image}
                            alt={activity.title}
                            width={128}
                            height={128}
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setEditingActivity(activity)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingActivity(activity)}
                          className="text-error-content bg-error focus:bg-error/70"
                        >
                          <Trash2 className="w-4 h-4 mr-2 text-error-content" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Activity Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[98vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Add Activity</DialogTitle>
          </DialogHeader>
          <div className="">
            {children.length > 0 ? (
              <ActivityForm
                childId={children[0]?.id}
                onSuccess={handleFormSuccess}
                onCancel={() => setShowAddDialog(false)}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No children available. Please add a child first before
                  creating activities.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog
        open={!!editingActivity}
        onOpenChange={() => setEditingActivity(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          <ActivityForm
            childId={editingActivity?.childId || children[0]?.id}
            activity={editingActivity || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setEditingActivity(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingActivity}
        onOpenChange={() => setDeletingActivity(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingActivity?.title}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteActivity}
              className="bg-error text-error-content hover:bg-error/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter> 
      </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}