"use client";

import { useState, useEffect } from "react";
import { Crown, UserPlus, Users, Settings, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  getAllUserProfiles,
  createUserProfile,
  updateUserProfile,
  updateUserStatus,
  deleteUserProfile,
} from "@/lib/actions/user_profile.action";
import { UserProfile, UserRole } from "@/lib/domains/user_profile.domain";
import { signUpWithEmailAndPassword } from "@/lib/firebase/client";

// Form validation schema
const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(UserRole, { required_error: "Please select a role" }),
});

type CreateUserForm = z.infer<typeof createUserSchema>;

export default function AdminsManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: UserRole.ADMIN,
    },
  });

  const editForm = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema),
  });

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUserProfiles();
      if (response.success) {
        setUsers(response.data as UserProfile[]);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      toast.error("Error loading users");
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const onCreateUser = async (data: CreateUserForm) => {
    setIsSubmitting(true);
    try {
      // First create Firebase authentication user
      const userCredential = await signUpWithEmailAndPassword(
        data.email,
        data.password
      );

      // Then create user profile with Firebase user ID
      const response = await createUserProfile({
        userId: userCredential.user.uid,
        email: data.email,
        name: data.name,
        role: data.role,
        isActive: true,
      });

      if (response.success) {
        toast.success("User created successfully");
        setCreateDialogOpen(false);
        form.reset();
        loadUsers(); // Refresh the list
      } else {
        toast.error("Failed to create user profile");
        console.error("User profile creation failed:", response.error);
      }
    } catch (error) {
      toast.error("Error creating user");
      console.error("Error creating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onUpdateUser = async (data: CreateUserForm) => {
    if (!editingUser) return;

    setIsSubmitting(true);
    try {
      const response = await updateUserProfile(editingUser.$id!, {
        name: data.name,
        email: data.email,
        role: data.role,
      });

      if (response.success) {
        toast.success("User updated successfully");
        setEditingUser(null);
        editForm.reset();
        loadUsers(); // Refresh the list
      } else {
        toast.error("Failed to update user");
      }
    } catch (error) {
      toast.error("Error updating user");
      console.error("Error updating user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleUserStatus = async (user: UserProfile) => {
    try {
      const response = await updateUserStatus(user.$id!, !user.isActive);
      if (response.success) {
        toast.success(
          `User ${!user.isActive ? "activated" : "deactivated"} successfully`
        );
        loadUsers(); // Refresh the list
      } else {
        toast.error("Failed to update user status");
      }
    } catch (error) {
      toast.error("Error updating user status");
      console.error("Error updating user status:", error);
    }
  };

  const deleteUser = async () => {
    if (!deletingUser) return;

    try {
      const response = await deleteUserProfile(deletingUser.$id!);
      if (response.success) {
        toast.success("User deleted successfully");
        setDeletingUser(null);
        loadUsers(); // Refresh the list
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      toast.error("Error deleting user");
      console.error("Error deleting user:", error);
    }
  };

  const openEditDialog = (user: UserProfile) => {
    setEditingUser(user);
    editForm.reset({
      name: user.name || "",
      email: user.email,
      role: user.role,
    });
  };

  const getRoleBadge = (role: UserRole) => {
    return (
      <Badge
        variant={role === UserRole.SUPER_ADMIN ? "destructive" : "secondary"}
        className={
          role === UserRole.SUPER_ADMIN
            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
            : ""
        }
      >
        {role === UserRole.SUPER_ADMIN && <Crown className="mr-1 h-3 w-3" />}
        {role === UserRole.SUPER_ADMIN ? "Super Admin" : "Admin"}
      </Badge>
    );
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            Loading administrators...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center">
            <Crown className="mr-3 h-8 w-8 text-yellow-500" />
            Manage Administrators
          </h1>
          <p className="text-muted-foreground mt-2">
            Create and manage admin users with different access levels.
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCreateUser)}
                className="space-y-4"
              >
                <DialogHeader>
                  <DialogTitle>Create New Administrator</DialogTitle>
                  <DialogDescription>
                    Add a new admin user to the system. They will receive access
                    based on their assigned role.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="john@example.com"
                            type="email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter password"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={UserRole.ADMIN}>
                              <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                Admin
                              </div>
                            </SelectItem>
                            <SelectItem value={UserRole.SUPER_ADMIN}>
                              <div className="flex items-center">
                                <Crown className="mr-2 h-4 w-4" />
                                Super Admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <Crown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.role === UserRole.SUPER_ADMIN).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Settings className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter((u) => u.isActive).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Administrator Accounts</CardTitle>
          <CardDescription>
            Manage all administrator accounts and their permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-10 text-gray-500"
                  >
                    No administrators found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.$id}>
                    <TableCell className="font-medium">
                      {user.name || "Unnamed User"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.isActive)}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user)}
                          className={
                            user.isActive ? "text-red-600" : "text-green-600"
                          }
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingUser(user)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onUpdateUser)}
              className="space-y-4"
            >
              <DialogHeader>
                <DialogTitle>Edit Administrator</DialogTitle>
                <DialogDescription>
                  Update the administrator&apos;s information and role.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UserRole.ADMIN}>
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" />
                              Admin
                            </div>
                          </SelectItem>
                          <SelectItem value={UserRole.SUPER_ADMIN}>
                            <div className="flex items-center">
                              <Crown className="mr-2 h-4 w-4" />
                              Super Admin
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingUser}
        onOpenChange={() => setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              administrator account for &quot;
              {deletingUser?.name || deletingUser?.email}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
