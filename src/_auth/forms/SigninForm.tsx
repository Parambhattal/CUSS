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

import { SigninValidation } from "@/lib/validation";
import { useSignInAccount } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";

const SigninForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const { mutateAsync: signInAccount, isLoading } = useSignInAccount();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignin = async (user: z.infer<typeof SigninValidation>) => {
    try {
      const session = await signInAccount(user);

      if (!session) {
        toast({ title: "Login failed. Please try again." });
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
      toast({ title: "An error occurred. Please try again." });
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center mb-8">
        <img src="/assets/images/logo.svg" alt="Company Logo" className="h-12 mb-2" />
        <h1 className="text-white text-2xl font-bold">Log in</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back! Please enter your details.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSignin)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    {...field}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                    className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full bg-red/50 hover:bg-red-700 text-white">
            {isLoading || isUserLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Log in"
            )}
          </Button>

          <div className="text-center mt-4">
            <p className="text-gray-500 text-sm">Don&apos;t have an account?</p>
            <Link to="/sign-up" className="text-red/50 text-sm font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </Form>

      <Toaster />
    </div>
  );
};

export default SigninForm;
