"use client";

import { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const router = useRouter()
  const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().required("Password is required"),
    rememberMe: Yup.boolean(),
  });

  const searchParams = useSearchParams();
  const errorQuery = searchParams.get("error");
  console.log("🚀 ~ LoginPage ~ errorQuery:", errorQuery)

  useEffect(() => {
    if (errorQuery) {
      toast.error(errorQuery);
      router.replace("/login");

    }
  }, [errorQuery]);

  return (
    <div className="w-full relative min-h-screen max-h-screen flex items-center justify-center overflow-hidden px-2">
      <Card className="w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold text-center my-2">Log in</h2>
        <p className="text-sm text-center text-gray-500">
          New to Debate?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Signup here
          </Link>
        </p>

        <Formik
          initialValues={{ email: "", password: "", rememberMe: false }}
          validationSchema={LoginSchema}
          onSubmit={async (values, actions) => {
            console.log("Form values:", values);
            await signIn("credentials", {
              ...values,
              callbackUrl: "/dashboard",
            });
            actions.setSubmitting(false);
          }}
        >
          {({ values, handleChange, handleBlur, errors, touched, isSubmitting, setFieldValue }) => (
            <Form>
              <CardContent className="mt-4 space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="example@email.com"
                  />
                  {errors.email && touched.email && (
                    <div className="text-red-500 text-sm">{errors.email}</div>
                  )}
                </div>
                <div className="relative">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-[33px] text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {errors.password && touched.password && (
                    <div className="text-red-500 text-sm">{errors.password}</div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-10">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      name="rememberMe"
                      checked={values.rememberMe}
                      onCheckedChange={(checked: boolean) =>
                        setFieldValue("rememberMe", checked)
                      }
                    />
                    <label htmlFor="rememberMe" className="text-sm text-gray-600">
                      Remember me on this device
                    </label>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="animate-spin" size={18} />
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    "Log in"
                  )}
                </Button>
              </CardContent>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
}
