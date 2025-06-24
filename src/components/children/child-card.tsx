"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";
import type { ChildWithRelation } from "@/types";
import SyringeIcon from "../icons/syringe";

interface ChildCardProps {
  child: ChildWithRelation;
  onEdit: (child: ChildWithRelation) => void;
  onDelete: (child: ChildWithRelation) => void;
}

export default function ChildCard({ child, onEdit, onDelete }: ChildCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  return (
    <div className="card">
      <div className="card-body">
        <div className="grid grid-cols-2 gap-3 mb-3">
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

        <div className="flex items-center justify-between mb-5">
          {child.updatedAt && (
            <div className="text-xs text-error">
              Last updated: {formatDate(child.updatedAt)}
            </div>
          )}

          <button
            className="btn btn-primary btn-outline btn-sm"
            onClick={() => onEdit(child)}
          >
            Update Stats
          </button>
        </div>

        <h3 className="text-lg font-bold">Upcoming events</h3>
        <div className="border-2 border-base-300 rounded-xl">
          <div className="flex flex-row items-center justify-between py-2 px-4">
            <div className="flex flex-col">
              <span className="flex flex-row gap-2 place-items-center justify-center mb-2">
                <SyringeIcon className="w-3 h-3" />{" "}
                <p className="font-semibold text-xs"> Hepatitis B vaccine </p>
              </span>
              <span className="font-medium ml-5">27th May 2025</span>
            </div>

            <button
              className="btn btn-primary btn-outline btn-sm"
              onClick={() => onEdit(child)}
            >
              Add to calender
            </button>
          </div>
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
