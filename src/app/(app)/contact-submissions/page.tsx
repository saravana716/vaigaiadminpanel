'use client';

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { ContactSubmissionsTable } from "@/components/contact-submissions/contact-submissions-table";

export default function ContactSubmissionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Contact Form Submissions"
        description="View and manage contact form submissions."
      />
      <ContactSubmissionsTable />
    </div>
  );
}
