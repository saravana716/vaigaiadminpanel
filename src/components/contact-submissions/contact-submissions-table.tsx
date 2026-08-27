'use client'

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { ContactSubmission } from "@/lib/types"
import { MoreHorizontal, Eye, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { ContactSubmissionViewDialog } from "./contact-submission-view-dialog";

export function ContactSubmissionsTable() {
  const [submissions, setSubmissions] = React.useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const [selectedSubmission, setSelectedSubmission] = React.useState<ContactSubmission | null>(null);
  const { toast } = useToast();

  const fetchSubmissions = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("contactFormSubmissions")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) throw error;

      const submissionsData = (data || []).map(item => ({
        ...item,
        timestamp: new Date(item.timestamp),
      })) as ContactSubmission[];

      setSubmissions(submissionsData);
    } catch (error) {
      console.error("Error fetching contact form submissions: ", error);
      toast({
        title: "Error fetching submissions",
        description: "Could not load contact form submissions from the database.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const handleView = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);
  };

  React.useEffect(() => {
    if (!isViewDialogOpen) {
      setSelectedSubmission(null);
    }
  }, [isViewDialogOpen]);

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No contact form submissions found.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.name}</TableCell>
                  <TableCell>{submission.email}</TableCell>
                  <TableCell>{submission.phone}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => handleView(submission)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isViewDialogOpen && selectedSubmission && (
        <ContactSubmissionViewDialog
          isOpen={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          submission={selectedSubmission}
        />
      )}
    </>
  );
}
