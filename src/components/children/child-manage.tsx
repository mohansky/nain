"use client";

import { useState } from "react";
import { formatDate, calculateAge } from "@/lib/utils"; 
import Image from "next/image";
import EditIcon from "../icons/edit";
import DeleteIcon from "../icons/delete";
import { ChildCardProps } from "@/types";

export default function ChildManageCard({ child, onEdit, onDelete }: ChildCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const age = calculateAge(child.dateOfBirth);

  const getRelationshipIcon = (relationship: string) => {
    const icons: Record<string, string> = {
      Mom: "👩‍👧‍👦",
      Dad: "👨‍👧‍👦",
      Brother: "👦",
      Sister: "👧",
      Grandparent: "👴",
      Babysitter: "👤",
      Other: "👤",
    };
    return icons[relationship] || "👤";
  };

  const getGenderEmoji = (gender: string) => {
    return gender === "Male" ? "👦" : gender === "Female" ? "👧" : "🧒";
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-12">
                {child.profileImage ? (
                  <Image
                    src={child.profileImage}
                    alt={child.name}
                    className="rounded-full"
                    fill
                  />
                ) : (
                  <span className="text-xl m-auto">
                    {getGenderEmoji(child.gender)}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h3 className="card-title text-lg">{child.name}</h3>
              <p className="text-base-content/70 text-sm">{age.ageString}</p>
            </div>
          </div>

          {child.isPrimary && (
            <div className="badge badge-primary badge-sm">Primary</div>
          )}
        </div>

        {/* Details */}
         <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-base-content/70">Gender:</span>
            <span className="font-medium">{child.gender}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-base-content/70">Born:</span>
            <span className="font-medium">{formatDate(child.dateOfBirth)}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-base-content/70">Your relationship:</span>
            <div className="flex items-center space-x-1">
              <span>{getRelationshipIcon(child.relationship)}</span>
              <span className="font-medium">{child.relationship}</span>
            </div>
          </div>

          {/* Measurements */}
            {(child.height || child.weight || child.headCircumference) && (
            <div className="divider my-3"></div>
          )}

          {child.height && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-base-content/70">Height:</span>
              <span className="font-medium">{child.height} cm</span>
            </div>
          )}

          {child.weight && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-base-content/70">Weight:</span>
              <span className="font-medium">{child.weight} kg</span>
            </div>
          )}

          {child.headCircumference && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-base-content/70">Head circumference:</span>
              <span className="font-medium">{child.headCircumference} cm</span>
            </div>
          )}  
        </div>   

        {(child.height || child.weight || child.headCircumference) && (
          <div className="divider my-3"></div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {child.headCircumference && (
            <div className="card bg-neutral text-neutral-content">
              <div className="card-body">
                <span className="flex items-baseline justify-start  gap-2">
                  <p className="font-bold text-4xl max-w-fit">
                    {child.headCircumference}{" "}
                  </p>
                  <p> cm </p>
                </span>
                <span className="text-xs">Head circumference</span>
              </div>
            </div>
          )}

          {child.weight && (
            <div className="card bg-base-300">
              <div className="card-body">
                <span className="flex items-baseline justify-start  gap-2">
                  <p className="font-bold text-4xl max-w-fit">{child.weight}</p>
                  <p> kg </p>
                </span>
                <span className="text-xs">Weight</span>
              </div>
            </div>
          )}

          {child.height && (
            <div className="col-span-2 card bg-base-300">
              <div className="card-body">
                <span className="flex items-baseline justify-start gap-2">
                  <p className="font-bold text-4xl max-w-fit">{child.height}</p>
                  <p> cm </p>
                </span>
                <span className="text-xs">Height</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          {child.updatedAt && (
            <div className="text-xs text-error">
              Last updated: {formatDate(child.updatedAt)}
            </div>
          )}

          <button
            className="btn btn-primary btn-outline btn-sm"
            onClick={() => onEdit(child)}
          >
            {/* <EditIcon className="w-4 h-4" /> */}
            Update Stats
          </button>
        </div>

        {/* Actions */}
        <div className="card-actions justify-end mt-6">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <DeleteIcon className="w-4 h-4" />
            Delete
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onEdit(child)}
          >
            <EditIcon className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Delete Child</h3>
            <p className="py-4">
              Are you sure you want to remove <strong>{child.name}</strong> from
              your children list? This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-ghost"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-error"
                onClick={() => {
                  onDelete(child);
                  setShowDeleteConfirm(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
