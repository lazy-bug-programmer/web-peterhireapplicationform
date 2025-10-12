"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

import { createForm } from "@/lib/actions/forms.action";
import { FormGender } from "@/lib/domains/forms.domain";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  gender: z.enum(["male", "female"], {
    message: "Please select a gender.",
  }),
  age: z.number().min(21, { message: "You must be at least 21 years old." }),
  nationality: z.string().min(2, { message: "Please enter your nationality." }),
  refCode: z.string().optional(),
  requirement: z.boolean().refine((val) => val === true, {
    message: "You must have a local bank account to apply.",
  }),
});

export function ApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      gender: undefined,
      age: 21,
      nationality: "",
      refCode: "",
      requirement: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    try {
      // Convert string gender to numeric enum
      const genderValue =
        values.gender === "male" ? FormGender.MALE : FormGender.FEMALE;

      // Ensure phone number has the country code prefix
      const formattedPhone = values.phone.startsWith("+")
        ? values.phone
        : `+${values.phone}`;

      // Submit the form
      const response = await createForm({
        name: values.name,
        email: values.email,
        phone: formattedPhone,
        gender: genderValue,
        age: values.age,
        nationality: values.nationality,
        requirement: values.requirement,
        ref_code_id: values.refCode || "",
      });

      if (response.success) {
        toast("Thank you for your application. We will be in touch soon.");
        setIsSubmitted(true);
      } else {
        toast(response.error || "Failed to submit your application.");
      }
    } catch (error) {
      console.error("Application submission error:", error);
      toast("There was a problem submitting your application.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <Card className="w-full shadow-lg border-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg -z-10"></div>
        <CardContent className="pt-12 pb-10 px-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in joining our team. We&apos;ll review
            your application and get back to you soon.
          </p>
          <Button
            onClick={() => setIsSubmitted(false)}
            variant="outline"
            className="mx-auto"
          >
            Submit Another Application
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-0 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg -z-10"></div>
      <CardHeader className="pb-4 pt-6 px-6">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Application Form
        </CardTitle>
        <CardDescription className="text-gray-600">
          Please fill out all required fields to submit your application.
          Recruiters will contact you thourgh WhatsApp, kindly provide your
          phone numbers with WhatsApp.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-5 px-6">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                      />
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
                    <FormLabel className="text-gray-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        country={"us"}
                        value={field.value}
                        onChange={(phone) => field.onChange(phone)}
                        inputStyle={{
                          width: "100%",
                          height: "40px",
                          fontSize: "16px",
                          borderColor: "rgb(209, 213, 219)",
                        }}
                        containerStyle={{
                          width: "100%",
                        }}
                        buttonStyle={{
                          backgroundColor: "white",
                          borderColor: "rgb(209, 213, 219)",
                          borderWidth: "1px",
                          borderRightWidth: "0px",
                        }}
                        dropdownStyle={{
                          width: "300px",
                        }}
                        enableSearch={true}
                        disableSearchIcon={false}
                        searchPlaceholder="Search countries"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200">
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter your age"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Nationality</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your nationality"
                        {...field}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="refCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      Reference Code
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your reference code (optional)"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value.toUpperCase());
                        }}
                        className="border-gray-300 focus:border-purple-500 focus:ring-purple-500 transition-all duration-200"
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      You may have received a reference code from our team
                      (optional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requirement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-200 p-4 shadow-sm bg-white">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-gray-700">
                      I confirm that I have a local bank account
                    </FormLabel>
                    <FormDescription className="text-xs">
                      A local bank account is required for payroll processing.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="px-6 pb-6 pt-2">
            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 group"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Submit Application
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
