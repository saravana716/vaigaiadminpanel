'use client'

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { ContactSubmission } from "@/lib/types";

interface ContactSubmissionViewDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  submission: ContactSubmission;
}

export function ContactSubmissionViewDialog({ isOpen, onOpenChange, submission }: ContactSubmissionViewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Submission Details</DialogTitle>
          <DialogDescription>
            Full details of the contact form submission.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm font-medium leading-none">Name:</p>
            <p className="col-span-3 text-sm text-muted-foreground">{submission.name}</p>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm font-medium leading-none">Email:</p>
            <p className="col-span-3 text-sm text-muted-foreground">{submission.email}</p>
          </div>
          {submission.phone && (
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm font-medium leading-none">Phone:</p>
              <p className="col-span-3 text-sm text-muted-foreground">{submission.phone}</p>
            </div>
          )}
          {submission.company && (
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm font-medium leading-none">Company:</p>
              <p className="col-span-3 text-sm text-muted-foreground">{submission.company}</p>
            </div>
          )}
          {submission.subject && (
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">Subject:</p>
              <p className="text-sm text-muted-foreground">{submission.subject}</p>
            </div>
          )}
          {submission.inquiryType && (
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm font-medium leading-none">Inquiry Type:</p>
              <p className="col-span-3 text-sm text-muted-foreground">{submission.inquiryType}</p>
            </div>
          )}
          {submission.eventDate && (
            <div className="grid grid-cols-4 items-center gap-4">
              <p className="text-sm font-medium leading-none">Event Date:</p>
              <p className="col-span-3 text-sm text-muted-foreground">{submission.eventDate}</p>
            </div>
          )}
          {submission.message && (
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">Message:</p>
              <p className="text-sm text-muted-foreground">{submission.message}</p>
            </div>
          )}
          <Separator className="my-2" />
          <div className="grid grid-cols-4 items-center gap-4">
            <p className="text-sm font-medium leading-none">Timestamp:</p>
            <p className="col-span-3 text-sm text-muted-foreground">
              {new Date(submission.timestamp as Date).toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
