import { FormResponsesTable } from "@/components/form-responses-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getForms } from "@/lib/actions/forms.action";
import { FormStatus, Form } from "@/lib/domains/forms.domain";
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  Crown,
} from "lucide-react";

// Force this page to use Node.js runtime instead of Edge Runtime
export const runtime = "nodejs";

export default async function SuperAdminFormResponsesPage() {
  // Fetch form statistics
  const formsResult = await getForms();
  const forms = formsResult.success ? (formsResult.data as Form[]) : [];

  const totalForms = forms?.length || 0;
  const pendingForms = forms?.filter(
    (form) => form.status === FormStatus.SUBMITTED
  ).length;
  const approvedForms = forms?.filter(
    (form) => form.status === FormStatus.APPROVED
  ).length;
  const rejectedForms = forms?.filter(
    (form) => form.status === FormStatus.REJECTED
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
          <Crown className="mr-3 h-8 w-8 text-yellow-500" />
          Super Admin - Form Responses
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete oversight and management of all application submissions.
        </p>
      </div>

      {/* Super Admin Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <Crown className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-semibold text-yellow-800">
            Super Admin Access
          </h3>
        </div>
        <p className="text-yellow-700 mt-2">
          You have complete administrative control over all form responses. You
          can view, approve, reject, and manage all application submissions
          across the system.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalForms}</div>
            <p className="text-xs text-muted-foreground">Total submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <ClockIcon className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingForms}</div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedForms}</div>
            <p className="text-xs text-muted-foreground">
              Successful applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircleIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedForms}</div>
            <p className="text-xs text-muted-foreground">
              Unsuccessful applications
            </p>
          </CardContent>
        </Card>
      </div>

      <FormResponsesTable isSuperAdmin={true} showCreatedBy={true} />
    </div>
  );
}
