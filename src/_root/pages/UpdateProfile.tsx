import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Textarea, Input, Button } from "@/components/ui";
import { ProfileUploader, Loader } from "@/components/shared";

import { ProfileValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useUpdateUser } from "@/lib/react-query/queries";

const UpdateProfile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, setUser } = useUserContext();

  // Fetch current user data
  const { data: currentUser, isLoading: isUserLoading } = useGetUserById(id || "");
  const { mutateAsync: updateUser, isLoading: isUpdating } = useUpdateUser();

  // Initialize form with default values
  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      file: [], // Change to null instead of an empty array
      name: user?.name || "",
      uid: user?.uid || "",
      email: user?.email || "",
      bio: user?.bio || "",
    },
  });

  // If user data is still loading, show a loader
  if (isUserLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  // Handle profile update
  const handleUpdate = async (value: z.infer<typeof ProfileValidation>) => {
    try {
      console.log("Submitting update with:", value);

      // Ensure required fields are present
      if (!currentUser?.$id || !value.name || !value.bio) {
        toast({ title: "Missing required fields." });
        return;
      }

      const updatedUser = await updateUser({
        userId: currentUser.$id,
        name: value.name,
        bio: value.bio,
        file: value.file || null, // Ensure a value is always passed
        imageUrl: currentUser?.imageUrl || "",
        imageId: currentUser?.imageId || "",
      });

      console.log("Updated user response:", updatedUser);

      if (!updatedUser) {
        toast({ title: "Update failed. Please try again." });
        return;
      }

      // Update user context
      setUser((prevUser) => ({
        ...prevUser,
        name: updatedUser.name,
        bio: updatedUser.bio,
        imageUrl: updatedUser.imageUrl,
      }));

      toast({ title: "Profile updated successfully!" });

      // Redirect to profile page
      navigate(`/profile/${id}`);
    } catch (error) {
      console.error("Update failed:", error);
      toast({ title: "Something went wrong. Try again." });
    }
  };

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUpdate)}
            className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
          >
            {/* Profile Picture */}
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem className="flex">
                  <FormControl>
                    <ProfileUploader
                      fieldChange={(file) => {
                        field.onChange(file);
                        console.log("File selected:", file);
                      }}
                      mediaUrl={currentUser?.imageUrl}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Name</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* UID Field (Disabled) */}
            <FormField
              control={form.control}
              name="uid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">UID</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field (Disabled) */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio Field */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Bio</FormLabel>
                  <FormControl>
                    <Textarea className="shad-textarea custom-scrollbar" {...field} />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex gap-4 items-center justify-end">
              <Button
                type="button"
                className="shad-button_dark_4"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="shad-button_primary whitespace-nowrap"
                disabled={isUpdating}
              >
                {isUpdating && <Loader />}
                Update Profile
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateProfile;
