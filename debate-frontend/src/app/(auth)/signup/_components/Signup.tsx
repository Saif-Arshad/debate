"use client";

import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import axios from "axios";
import toast from "react-hot-toast";

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const SignupSchema = Yup.object().shape({
        firstName: Yup.string().required("First name is required"),
        lastName: Yup.string().required("Last name is required"),
        email: Yup.string()
            .email("Invalid email address")
            .required("Email is required"),
        password: Yup.string()
            .min(6, "Password must be at least 6 characters")
            .required("Password is required"),
        agree: Yup.boolean().oneOf([true], "You must agree to the terms"),
        // userType: Yup.string()
        //     .oneOf(["TEACHER", "STUDENT"], "Invalid user type")
        //     .required("User type is required"),
    });

    return (
        <div className="w-full relative min-h-screen flex items-center justify-center px-2">
            <Card className="w-full max-w-lg shadow-lg p-2 md:p-6">
                <h2 className="text-xl font-semibold text-center mb-2">
                    Signup for Debate
                </h2>
                <p className="text-sm text-center text-gray-500">
                    Already have an account?{" "}
                    <Link href="/login" className="text-blue-500 hover:underline">
                        Login here
                    </Link>
                </p>

                <Formik
                    initialValues={{
                        firstName: "",
                        lastName: "",
                        email: "",
                        password: "",
                        agree: false,
                        userType: "TEACHER",
                    }}
                    validationSchema={SignupSchema}
                    onSubmit={async (values, actions) => {
                        console.log(values);
                        try {
                            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/register`, values);
                            console.log("Registration successful:", res.data);
                            if(res.data){
                                toast.success("Register Successfull")
                                window.location.pathname="/login"
                            }
                        } catch (error:any) {
                            console.log("Registration error:", error);
                            if (error.response.data.message){
                                toast.error(error.response.data.message)
                            }
                        }
                        actions.setSubmitting(false);
                    }}
                >
                    {({
                        values,
                        handleChange,
                        handleBlur,
                        setFieldValue,
                        errors,
                        touched,
                        isSubmitting,
                    }) => (
                        <Form>
                            <CardContent className="mt-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            value={values.firstName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Mark"
                                        />
                                        {errors.firstName && touched.firstName && (
                                            <div className="text-red-500 text-sm">
                                                {errors.firstName}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            value={values.lastName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="Paul"
                                        />
                                        {errors.lastName && touched.lastName && (
                                            <div className="text-red-500 text-sm">
                                                {errors.lastName}
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                        className="absolute right-3 top-8 text-gray-500"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    {errors.password && touched.password && (
                                        <div className="text-red-500 text-sm">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>
                                {/* <div className="space-y-2">
                                    <Label>Select Account Type</Label>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div
                                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${values.userType === "TEACHER"
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-blue-300"
                                                }`}
                                            onClick={() => setFieldValue("userType", "TEACHER")}
                                        >
                                            <div className="flex flex-col items-center space-y-2">
                                                <svg
                                                    className="w-8 h-8 text-blue-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"
                                                    />
                                                </svg>
                                                <span className="font-medium">Join as Teacher</span>
                                            </div>
                                        </div>
                                        <div
                                            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${values.userType === "STUDENT"
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-blue-300"
                                                }`}
                                            onClick={() => setFieldValue("userType", "STUDENT")}
                                        >
                                            <div className="flex flex-col items-center space-y-2">
                                                <svg
                                                    className="w-8 h-8 text-blue-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 14l9-5-9-5-9 5 9 5z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 14l9-5-9-5-9 5 9 5z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 14v7"
                                                    />
                                                </svg>
                                                <span className="font-medium">Join as Student</span>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.userType && touched.userType && (
                                        <div className="text-red-500 text-sm">{errors.userType}</div>
                                    )}
                                </div> */}
                                <div className="flex flex-col items-start space-x-2 mt-2">
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Checkbox
                                            id="agree"
                                            name="agree"
                                            checked={values.agree}
                                            onCheckedChange={(checked: boolean) =>
                                                setFieldValue("agree", checked)
                                            }
                                        />
                                        <label
                                            htmlFor="agree"
                                            className="text-xs sm:text-sm text-gray-600"
                                        >
                                            I agree to the Terms of Use and Privacy Policy
                                        </label>
                                    </div>
                                    {errors.agree && touched.agree && (
                                        <div className="text-red-500 text-sm">{errors.agree}</div>
                                    )}
                                </div>
                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <Loader2 className="animate-spin" size={18} />
                                            <span>Submitting...</span>
                                        </div>
                                    ) : (
                                        "Sign up"
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
