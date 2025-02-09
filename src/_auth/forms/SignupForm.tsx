import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import Loader from "@/components/shared/Loader";

import { SignupValidation } from "@/lib/validation";
import { useCreateUserAccount, useSignInAccount } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";

const SignupForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const { mutateAsync: createUserAccount, isLoading: isCreatingAccount } = useCreateUserAccount();
  const { mutateAsync: signInAccount, isLoading: isSigningInUser } = useSignInAccount();

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: "",
      uid: "",
      email: "",
      password: "",
      section: ""
    },
  });

  const handleSignup = async (user: z.infer<typeof SignupValidation>) => {
    try {
      const newUser = await createUserAccount(user);

      if (!newUser) {
        toast({ title: "Sign up failed. Please try again." });
        return;
      }

      const session = await signInAccount({
        email: user.email,
        password: user.password,
      });

      if (!session) {
        toast({ title: "Account created! Please log in." });
        navigate("/sign-in");
        return;
      }

      const isLoggedIn = await checkAuthUser();
      if (isLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        toast({ title: "Login failed. Please try again." });
      }
    } catch (error) {
      toast({ title: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center mb-8">
        <img src="/assets/images/logo.svg" alt="Company Logo" className="h-12 mb-2" />
        <h1 className="text-white text-2xl font-bold">Sign Up</h1>
        <p className="text-gray-400 text-sm mt-1">Join us today! Enter your details below.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-6">
          {["name", "uid", "section", "email", "password"].map((field) => (
            <FormField
              key={field}
              control={form.control}
              name={field as "name" | "uid" | "email" | "password" | "section"}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type={field.name === "password" ? "password" : "text"}
                      placeholder={`Enter your ${field.name}`}
                      {...field}
                      className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          ))}

          <Button type="submit" className="w-full bg-red/50 hover:bg-red-700 text-white">
            {isCreatingAccount || isSigningInUser || isUserLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Sign Up"
            )}
          </Button>

          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">Already have an account?</p>
            <Link to="/sign-in" className="text-red/50 text-sm font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </Form>

      <Toaster />
    </div>
  );
};

export default SignupForm;