import { cn } from "@/lib/utils"

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <path d="M12.94 2.46a2 2 0 0 0-1.88 0L2.52 8.29a2 2 0 0 0-1 1.73v9.54a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V10a2 2 0 0 0-1-1.73Z" />
      <path d="m14 14-4 4 4-4 4 4-4-4" />
      <path d="m14 10-4 4 4-4 4 4-4-4" />
    </svg>
  );
};
