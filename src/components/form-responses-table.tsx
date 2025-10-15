"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Check,
  X,
  Trash,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getForms,
  getFormsByRefCodes,
  updateFormStatus,
  deleteForm,
  getForm,
  markFormAsViewed,
  markFormAsUnread,
} from "@/lib/actions/forms.action";
import { getReferralCodeValuesByCreator } from "@/lib/actions/referral_codes.action";
import { useAuth } from "@/lib/auth-context";
import { UserRole, UserProfile } from "@/lib/domains/user_profile.domain";
import { getAllUserProfiles } from "@/lib/actions/user_profile.action";
import { getAllReferralCodes } from "@/lib/actions/referral_codes.action";
import { Form, FormStatus, FormGender } from "@/lib/domains/forms.domain";
import { toast } from "sonner";
import { ReferralCode } from "@/lib/domains/referral_codes.domain";

interface FormResponsesTableProps {
  isSuperAdmin?: boolean;
  showCreatedBy?: boolean;
}

export function FormResponsesTable({
  isSuperAdmin = false,
  showCreatedBy = false,
}: FormResponsesTableProps) {
  const { userProfile } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [refCodeCreators, setRefCodeCreators] = useState<{
    [refCodeValue: string]: string;
  }>({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [formsPerPage] = useState(3);
  const [totalForms, setTotalForms] = useState(0);
  const [allForms, setAllForms] = useState<Form[]>([]);

  const paginateForms = useCallback(() => {
    const indexOfLastForm = currentPage * formsPerPage;
    const indexOfFirstForm = indexOfLastForm - formsPerPage;
    const currentForms = allForms.slice(indexOfFirstForm, indexOfLastForm);
    setForms(currentForms);
  }, [currentPage, formsPerPage, allForms]);

  const loadForms = useCallback(async () => {
    setLoading(true);
    try {
      let response;

      // If explicitly marked as superadmin context, load all forms
      if (isSuperAdmin) {
        response = await getForms();
      } else if (userProfile?.role === UserRole.SUPER_ADMIN) {
        response = await getForms();
      } else if (userProfile?.role === UserRole.ADMIN && userProfile.$id) {
        // Get the reference codes created by this admin
        const refCodes = await getReferralCodeValuesByCreator(userProfile.$id);
        if (refCodes.length > 0) {
          response = await getFormsByRefCodes(refCodes);
        } else {
          // No ref codes found, so no forms to show
          setAllForms([]);
          setTotalForms(0);
          setLoading(false);
          return;
        }
      } else {
        // If no valid profile, return empty array
        setAllForms([]);
        setTotalForms(0);
        setLoading(false);
        return;
      }

      if (response.success) {
        const fetchedForms = response.data as unknown as Form[];
        setAllForms(fetchedForms);
        setTotalForms(fetchedForms.length);
        // Don't call paginateForms() here - let the useEffect handle it
      } else {
        toast("Failed to load forms");
      }
    } catch (error) {
      toast("An error occurred while loading forms");
      console.error("Error loading forms:", error);
    } finally {
      setLoading(false);
    }
  }, [userProfile, isSuperAdmin]);

  const loadRefCodeCreators = useCallback(async () => {
    if (!showCreatedBy) return;

    try {
      // Get all reference codes with their creators
      const refCodesResponse = await getAllReferralCodes();
      const usersResponse = await getAllUserProfiles();

      if (refCodesResponse.success && usersResponse.success) {
        const refCodes = refCodesResponse.data as ReferralCode[];
        const users = usersResponse.data as UserProfile[];

        // Create a map of user ID to user name
        const userMap: { [userId: string]: string } = {};
        users.forEach((user) => {
          if (user.$id && user.name) {
            userMap[user.$id] = user.name;
          }
        });

        // Create a map of ref code VALUE to creator name (not document ID)
        const creators: { [refCodeValue: string]: string } = {};
        refCodes.forEach((code) => {
          if (code.code) {
            if (code.createdBy) {
              creators[code.code] = userMap[code.createdBy] || "Unknown Admin";
            } else {
              creators[code.code] = "Super Admin";
            }
          }
        });

        setRefCodeCreators(creators);
      }
    } catch (error) {
      console.error("Error loading reference code creators:", error);
    }
  }, [showCreatedBy]);

  useEffect(() => {
    // Load forms if we have a user profile OR if we're in superadmin context
    if (userProfile || isSuperAdmin) {
      loadForms();
      loadRefCodeCreators();
    }
  }, [userProfile, loadForms, isSuperAdmin, loadRefCodeCreators]);

  // Update displayed forms when page changes
  useEffect(() => {
    paginateForms();
  }, [paginateForms]);

  const handleStatusChange = async (formId: string, status: FormStatus) => {
    try {
      const response = await updateFormStatus(formId, status);
      if (response.success) {
        toast(
          status === FormStatus.APPROVED
            ? "Application approved"
            : "Application rejected"
        );
        loadForms();
      } else {
        toast("Failed to update status");
      }
    } catch (error) {
      toast("An error occurred while updating status");
      console.error("Error updating form status:", error);
    }
  };

  const handleDelete = async () => {
    if (!selectedFormId) return;

    try {
      const response = await deleteForm(selectedFormId);
      if (response.success) {
        toast("Application deleted successfully");
        setShowDeleteDialog(false);
        loadForms();
      } else {
        toast("Failed to delete application");
      }
    } catch (error) {
      toast("An error occurred while deleting application");
      console.error("Error deleting form:", error);
    }
  };

  const viewDetails = async (formId: string) => {
    try {
      setSelectedFormId(formId);

      const response = await getForm(formId);
      if (response.success && response.data) {
        const formData = response.data as Form;
        setSelectedForm(formData);

        // Mark form as viewed if it hasn't been viewed yet
        if (!formData.has_view) {
          await markFormAsViewed(formId);

          // Update local state to reflect the change
          setAllForms((prevForms) =>
            prevForms.map((form) =>
              form.$id === formId ? { ...form, has_view: true } : form
            )
          );
          setForms((prevForms) =>
            prevForms.map((form) =>
              form.$id === formId ? { ...form, has_view: true } : form
            )
          );
        }

        setShowDetailsDialog(true);
      } else {
        toast("Failed to load application details");
      }
    } catch (error) {
      toast("An error occurred while loading details");
      console.error("Error getting form details:", error);
    }
  };

  const handleMarkAsUnread = async (formId: string) => {
    try {
      const response = await markFormAsUnread(formId);
      if (response.success) {
        // Update local state to reflect the change
        setAllForms((prevForms) =>
          prevForms.map((form) =>
            form.$id === formId ? { ...form, has_view: false } : form
          )
        );
        setForms((prevForms) =>
          prevForms.map((form) =>
            form.$id === formId ? { ...form, has_view: false } : form
          )
        );
        toast("Form marked as unread");
      } else {
        toast("Failed to mark form as unread");
      }
    } catch (error) {
      toast("An error occurred while updating form");
      console.error("Error marking form as unread:", error);
    }
  };

  const confirmDelete = (formId: string) => {
    setSelectedFormId(formId);
    setShowDeleteDialog(true);
  };

  const getStatusBadge = (status: FormStatus) => {
    switch (status) {
      case FormStatus.SUBMITTED:
        return <Badge variant="outline">Submitted</Badge>;
      case FormStatus.APPROVED:
        return <Badge className="bg-green-500">Approved</Badge>;
      case FormStatus.REJECTED:
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (
    dateInput: string | Date | { toDate?: () => Date; seconds?: number }
  ) => {
    let date: Date;

    if (typeof dateInput === "string") {
      date = new Date(dateInput);
    } else if (dateInput instanceof Date) {
      date = dateInput;
    } else if (
      dateInput &&
      typeof dateInput === "object" &&
      "toDate" in dateInput &&
      dateInput.toDate
    ) {
      // Handle Firestore Timestamp
      date = dateInput.toDate();
    } else if (
      dateInput &&
      typeof dateInput === "object" &&
      "seconds" in dateInput &&
      dateInput.seconds
    ) {
      // Handle Firestore Timestamp object format
      date = new Date(dateInput.seconds * 1000);
    } else {
      date = new Date(dateInput as string | number | Date);
    }

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGenderString = (gender: FormGender) => {
    switch (gender) {
      case FormGender.MALE:
        return "Male";
      case FormGender.FEMALE:
        return "Female";
      default:
        return "Unknown";
    }
  };

  // Pagination controls
  const totalPages = Math.ceil(totalForms / formsPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) {
    return <div className="py-10 text-center">Loading form responses...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Reference Code</TableHead>
            {showCreatedBy && <TableHead>Created By Admin</TableHead>}
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {forms.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={showCreatedBy ? 7 : 6}
                className="text-center py-10 text-gray-500"
              >
                No form responses found
              </TableCell>
            </TableRow>
          ) : (
            forms.map((form) => (
              <TableRow key={form.$id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {form.name}
                    {!form.has_view && (
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full"
                        title="New - Not viewed yet"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>{form.email}</TableCell>
                <TableCell className="font-mono">{form.ref_code_id}</TableCell>
                {showCreatedBy && (
                  <TableCell>
                    {refCodeCreators[form.ref_code_id] || "Unknown Admin"}
                  </TableCell>
                )}
                <TableCell>{formatDate(form.submitted_at)}</TableCell>
                <TableCell>{getStatusBadge(form.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => viewDetails(form.$id!)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {form.has_view && (
                        <DropdownMenuItem
                          onClick={() => handleMarkAsUnread(form.$id!)}
                        >
                          <EyeOff className="mr-2 h-4 w-4" />
                          Mark as Unread
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(form.$id!, FormStatus.APPROVED)
                        }
                        disabled={form.status === FormStatus.APPROVED}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(form.$id!, FormStatus.REJECTED)
                        }
                        disabled={form.status === FormStatus.REJECTED}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => confirmDelete(form.$id!)}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination UI */}
      <div className="flex items-center justify-between px-4 py-4 border-t">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">{forms.length}</span> of{" "}
          <span className="font-medium">{totalForms}</span> responses
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm">
            Page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages || 1}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Details Drawer */}
      <Sheet open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <SheetContent side="right" className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Application Details</SheetTitle>
            <SheetDescription>
              Detailed information about this application submission.
            </SheetDescription>
          </SheetHeader>
          {selectedForm && (
            <div className="mt-6">
              {/* Timestamp above container */}
              <div className="mb-4 text-sm text-gray-500">
                Submitted: {formatDate(selectedForm.submitted_at)}
              </div>

              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Name
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedForm.name}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Age</span>
                  <span className="text-sm text-gray-900">
                    {selectedForm.age}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Email
                  </span>
                  <span className="text-sm text-gray-900 break-all">
                    {selectedForm.email}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Phone Number
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedForm.phone}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Nationality
                  </span>
                  <span className="text-sm text-gray-900">
                    {selectedForm.nationality ?? "Not specified"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Gender
                  </span>
                  <span className="text-sm text-gray-900">
                    {getGenderString(selectedForm.gender)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Referrer Code
                  </span>
                  <span className="text-sm text-gray-900 font-mono">
                    {selectedForm.ref_code_id}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-sm font-medium text-gray-600">
                    Requirement
                  </span>
                  <span className="text-sm text-gray-900 text-right max-w-xs">
                    {selectedForm.requirement
                      ? "Yes, I have a local bank account to receive wages"
                      : "No, I don't have a local bank account"}
                  </span>
                </div>
              </div>
            </div>
          )}
          <SheetFooter className="mt-6 pt-6 border-t">
            <div className="flex space-x-2 w-full">
              <Button
                variant="secondary"
                onClick={() => setShowDetailsDialog(false)}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  setShowDetailsDialog(false);
                  handleStatusChange(selectedForm!.$id!, FormStatus.APPROVED);
                }}
                disabled={selectedForm?.status === FormStatus.APPROVED}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowDetailsDialog(false);
                  handleStatusChange(selectedForm!.$id!, FormStatus.REJECTED);
                }}
                disabled={selectedForm?.status === FormStatus.REJECTED}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              applicant&apos;s submission from our database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
