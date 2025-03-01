import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import api from "@/lib/axios";
import { logout, updateUser } from "@/redux/user/userSlice";
import { Lock, Menu, Search, User, Edit2 } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { NotificationsPopover } from "./NotificationsPopover";
import { ChangePasswordForm } from "@/components/forms/auth/ChangePasswordForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

const profileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email").optional(),
    contactNumber: z.string().min(10, "Contact number must be at least 10 characters"),
    dateOfBirth: z.string().optional(),
});

export function Header() {
    const { currentUser } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: currentUser?.name || "",
            email: currentUser?.email || "",
            contactNumber: currentUser?.contactNumber || "",
            dateOfBirth: currentUser?.dateOfBirth
                ? new Date(currentUser.dateOfBirth).toISOString().split("T")[0]
                : "",
        },
    });

    const handleLogout = async () => {
        try {
            const res = await api.post("/auth/logout", {
                id: currentUser._id,
            });

            if (res.status === 200) {
                localStorage.removeItem("token");
                dispatch(logout());
                navigate("/sign-in");
                toast.success("Logged out successfully");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred. Please try again later");
        }
    };

    const handleUpdateProfile = async (data) => {
        try {
            setIsLoading(true);
            const res = await api.patch(`/users/${currentUser._id}/update-profile`, data);

            if (res.data.success) {
                dispatch(updateUser(res.data.data));
                setIsEditing(false);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Error updating profile");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <header className="bg-green-700 border-b px-0 py-3 sticky top-0 z-10">
            <div className="flex items-center sm:justify-between">
                <div className="flex items-center gap-4 w-full max-w-[300px] sm:max-w-md pl-3">
                    <SidebarTrigger>
                        <div className="p-2 hover:bg-green-600 rounded-md cursor-pointer">
                            <Menu className="h-5 w-5 text-white" />
                        </div>
                    </SidebarTrigger>
                    {/* <div className="relative w-full pr-4">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                        <Input type="search" placeholder="Search..." className="pl-8 w-full" />
                    </div> */}
                </div>
                <div className="flex items-center space-x-4 mx-4">
                    <NotificationsPopover />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/avatars/01.png" alt={currentUser?.name} />
                                    <AvatarFallback>
                                        {currentUser?.name
                                            ? currentUser.name[0].toUpperCase()
                                            : "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end" forceMount>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {currentUser?.name}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {currentUser?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsChangePasswordOpen(true)}>
                                <Lock className="mr-2 h-4 w-4" />
                                Change Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Profile Dialog */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogContent className="max-w-[600px] p-0">
                    {/* Header Section */}
                    <div className="relative h-32 bg-gradient-to-r from-green-600 to-green-700 rounded-t-lg">
                        <div className="absolute -bottom-16 left-6">
                            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                                <AvatarImage src="/avatars/01.png" alt={currentUser?.name} />
                                <AvatarFallback className="text-4xl bg-green-100 text-green-700">
                                    {currentUser?.name ? currentUser.name[0].toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="px-6 pt-20 pb-6">
                        {isEditing ? (
                            <Form {...form}>
                                <form
                                    onSubmit={form.handleSubmit(handleUpdateProfile)}
                                    className="space-y-4"
                                >
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {currentUser?.role === "superAdmin" && (
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="contactNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Number</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="dateOfBirth"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Date of Birth</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex justify-end space-x-2 mt-6">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                    Saving...
                                                </div>
                                            ) : (
                                                "Save Changes"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        ) : (
                            <>
                                {/* User Name and Role */}
                                <div className="mb-6">
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        {currentUser?.name}
                                    </h2>
                                    <div className="flex items-center mt-1">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                            {currentUser?.role
                                                ? currentUser.role.charAt(0).toUpperCase() +
                                                  currentUser.role.slice(1)
                                                : ""}
                                        </span>
                                        <span className="mx-2 text-gray-300">•</span>
                                        <span className="text-sm text-gray-500">
                                            {currentUser?.barangay}
                                        </span>
                                    </div>
                                </div>

                                {/* Grid Layout for Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Contact Information Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            Contact Information
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500">Email</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {currentUser?.email}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500">
                                                    Phone Number
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {currentUser?.contactNumber || "Not provided"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Information Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            Personal Information
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500">
                                                    Date of Birth
                                                </span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {currentUser?.dateOfBirth
                                                        ? new Date(
                                                              currentUser.dateOfBirth
                                                          ).toLocaleDateString("en-US", {
                                                              month: "long",
                                                              day: "numeric",
                                                              year: "numeric",
                                                          })
                                                        : "Not provided"}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-500">
                                                    Account Status
                                                </span>
                                                <span className="inline-flex items-center text-sm font-medium text-green-700">
                                                    <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Move edit button to bottom */}
                                <div className="mt-8 flex justify-end">
                                    <Button
                                        onClick={() => setIsEditing(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit Profile
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Change Password Dialog */}
            <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                <ChangePasswordForm
                    onClose={() => setIsChangePasswordOpen(false)}
                    userId={currentUser?._id}
                />
            </Dialog>
        </header>
    );
}
