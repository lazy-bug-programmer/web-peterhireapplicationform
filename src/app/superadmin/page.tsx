import Link from "next/link";
import { FileText, KeyRound, Crown } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
          <Crown className="mr-3 h-8 w-8 text-yellow-500" />
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Complete control over applications, reference codes, and system
          administration.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/superadmin/ref_code">
          <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-purple-50 cursor-pointer overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-500/0 rounded-lg -z-10"></div>
            <CardHeader>
              <div className="flex items-center mb-2">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <KeyRound className="h-5 w-5 text-purple-600" />
                </div>
                <CardTitle className="text-xl">Reference Codes</CardTitle>
              </div>
              <CardDescription>
                Generate and manage reference codes for applicants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create, view, and manage reference codes used by applicants
                during the application process.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/superadmin/form_responses">
          <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-blue-50 cursor-pointer overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/0 rounded-lg -z-10"></div>
            <CardHeader>
              <div className="flex items-center mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Form Responses</CardTitle>
              </div>
              <CardDescription>
                Review and manage application submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                View, approve, reject, and manage all submitted application
                forms from users.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <Crown className="h-5 w-5 text-yellow-600 mr-2" />
          <h3 className="text-lg font-semibold text-yellow-800">
            Super Admin Privileges
          </h3>
        </div>
        <p className="text-yellow-700 mt-2">
          As a Super Admin, you have full access to all system features and
          administrative functions. You can manage all aspects of the
          application system including user management, system configuration,
          and data oversight.
        </p>
      </div>
    </div>
  );
}
