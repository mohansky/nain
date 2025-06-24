"use client";

import { useState, useEffect } from "react";
import { format, isToday, isYesterday } from "date-fns";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Star,
  ChevronDown,
  SortAsc,
  SortDesc,
  Camera,
  Award,
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
import { useChildren } from "@/hooks/useChildren";
import { useMilestones } from "@/hooks/useMilestones";
import Image from "next/image";
import MilestoneForm from "@/components/forms/milestone-form";

// Types
interface Milestone {
  id: string;
  childId: string;
  title: string;
  description?: string;
  achievedAt: Date;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper functions
const formatMilestoneDate = (date: Date): string => {
  if (isToday(date)) {
    return `Today`;
  } else if (isYesterday(date)) {
    return `Yesterday`;
  } else {
    return format(date, "MMM d, yyyy");
  }
};

const calculateAge = (birthDate: Date, achievementDate: Date): string => {
  const months =
    (achievementDate.getFullYear() - birthDate.getFullYear()) * 12 +
    (achievementDate.getMonth() - birthDate.getMonth());

  if (months < 12) {
    return `${months} month${months !== 1 ? "s" : ""} old`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return `${years} year${years !== 1 ? "s" : ""} old`;
    } else {
      return `${years}y ${remainingMonths}m old`;
    }
  }
};

export default function MilestonesPage() {
  // Use hooks for data management
  const { children } = useChildren();
  const {
    milestones,
    isLoading: milestonesLoading,
    error: milestonesError,
    addMilestone,
    updateMilestone,
    deleteMilestone,
  } = useMilestones();

  // Local state for UI
  const [filteredMilestones, setFilteredMilestones] = useState<Milestone[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dialogs and modals
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(
    null
  );
  const [deletingMilestone, setDeletingMilestone] = useState<Milestone | null>(
    null
  );

  // Apply filters and search
  useEffect(() => {
    let filtered = [...milestones];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (milestone) =>
          milestone.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          milestone.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Child filter
    if (selectedChild !== "all") {
      filtered = filtered.filter(
        (milestone) => milestone.childId === selectedChild
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime();
          break;
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredMilestones(filtered);
  }, [milestones, searchQuery, selectedChild, sortBy, sortOrder]);

  // Handlers using the hook methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddMilestone = async (milestoneData: any) => {
    setIsSubmitting(true);
    try {
      const success = await addMilestone(milestoneData);
      if (success) {
        setShowAddDialog(false);
      }
      return success;
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateMilestone = async (milestoneData: any) => {
    if (!editingMilestone) return false;

    setIsSubmitting(true);
    try {
      const success = await updateMilestone(editingMilestone.id, milestoneData);
      if (success) {
        setEditingMilestone(null);
      }
      return success;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMilestone = async () => {
    if (!deletingMilestone) return;

    try {
      const success = await deleteMilestone(deletingMilestone.id);
      if (success) {
        setDeletingMilestone(null);
      }
    } catch (error) {
      console.error("Failed to delete milestone:", error);
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

  const getChildBirthDate = (childId: string) => {
    const child = children.find((c) => c.id === childId);
    return child?.dateOfBirth;
  };

  // Show error state if there's an error
  if (milestonesError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-2 text-destructive">
              Error Loading Milestones
            </h3>
            <p className="text-muted-foreground mb-4">{milestonesError}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-lg mx-auto mb-32 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Milestones</h1>
          <p className="text-muted-foreground">
            Celebrate and track your childrens important achievements
          </p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2"
          disabled={children.length === 0}
        >
          <Plus className="w-4 h-4" />
          Add Milestone
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Child Filter */}
            <Select value={selectedChild} onValueChange={setSelectedChild}>
              <SelectTrigger className="w-full md:w-[180px]">
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
                  <Star className="w-4 h-4 mr-2" />
                  Title {sortBy === "title" && "✓"}
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

      {/* Milestones List */}
      <div className="space-y-4">
        {milestonesLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading milestones...</p>
            </CardContent>
          </Card>
        ) : filteredMilestones.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No milestones found
              </h3>
              <p className="text-muted-foreground mb-4">
                {milestones.length === 0
                  ? children.length === 0
                    ? "Add a child first, then start celebrating their milestones!"
                    : "Start celebrating achievements by adding your first milestone!"
                  : "Try adjusting your search or filters."}
              </p>
              {milestones.length === 0 && children.length > 0 && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Milestone
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMilestones.map((milestone) => {
            const childBirthDate = getChildBirthDate(milestone.childId);
            return (
              <Card
                key={milestone.id}
                className="hover:shadow-md transition-shadow border-0 bg-info/30"
              >
                {/* Photos */}
                {milestone.photos && milestone.photos.length > 0 && (
                  <div className="">
                    <div className="flex gap-2 flex-wrap">
                      {milestone.photos.slice(0, 4).map((photo, index) => (
                        <Image
                          key={index}
                          src={photo}
                          width={360}
                          height={360}
                          alt={`${milestone.title} photo ${index + 1}`}
                          className="w-full aspect-square object-cover rounded-t-lg border-0"
                        />
                      ))}
                      {milestone.photos.length > 4 && (
                        <div className="w-20 h-20 bg-muted rounded-lg border flex items-center justify-center">
                          <div className="text-center">
                            <Camera className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              +{milestone.photos.length - 4}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={getChildAvatar(milestone.childId) || " "}
                          />
                          <AvatarFallback className="text-xs">
                            {getChildName(milestone.childId).slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {milestone.title}
                            </h3>
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-yellow-800 border-yellow-200"
                            >
                              <Star className="w-3 h-3 mr-1" />
                              Milestone
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getChildName(milestone.childId)} •{" "}
                            {formatMilestoneDate(milestone.achievedAt)}
                            {childBirthDate &&
                              ` • ${calculateAge(
                                new Date(childBirthDate),
                                milestone.achievedAt
                              )}`}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      {milestone.description && (
                        <p className="text-sm leading-relaxed pl-11">
                          {milestone.description}
                        </p>
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
                          onClick={() => setEditingMilestone(milestone)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeletingMilestone(milestone)}
                          className="text-error focus:text-error"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
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

      {/* Add Milestone Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-4xl max-h-[98vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Add Milestone</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {children.length > 0 ? (
              <MilestoneForm
                childId={children[0]?.id}
                onSubmit={handleAddMilestone}
                onCancel={() => setShowAddDialog(false)}
                isLoading={isSubmitting}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No children available. Please add a child first before
                  creating milestones.
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

      {/* Edit Milestone Dialog */}
      <Dialog
        open={!!editingMilestone}
        onOpenChange={() => setEditingMilestone(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
          </DialogHeader>
          <MilestoneForm
            childId={editingMilestone?.childId || children[0]?.id}
            milestone={editingMilestone}
            onSubmit={handleUpdateMilestone}
            onCancel={() => setEditingMilestone(null)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingMilestone}
        onOpenChange={() => setDeletingMilestone(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Milestone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingMilestone?.title}? This
              action cannot be undone and will also delete all associated
              photos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMilestone}
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
