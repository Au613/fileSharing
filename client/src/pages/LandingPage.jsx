import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Receipt, Shield } from "lucide-react";

const formSchema = z.object({
  accountType: z.enum(["residential", "business"]),
  accountNumber: z.string().min(5),
  amount: z.string().regex(/^\d+(\.\d{2})?$/),
  billImage: z.instanceof(File).optional(),
});

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: "residential",
      accountNumber: "",
      amount: "",
    },
  });

  const { toast } = useToast();
  
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("accountType", data.accountType);
      formData.append("accountNumber", data.accountNumber);
      formData.append("amount", data.amount);
      if (data.billImage) {
        formData.append("billImage", data.billImage);
      }

      const response = await fetch("/api/bills", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit bill");
      }

      toast({
        title: "Success!",
        description: "Bill information saved. Let's create your account.",
      });
      
      setLocation("/signup");
    } catch (error) {
      console.error("Error submitting bill:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit bill. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="bg-light-purple p-8 flex items-center justify-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold text-dark-blue mb-4">deferit</h1>
          <p className="text-lg text-gray-600">
            Pay your bills smarter with flexible payment options
          </p>
        </div>
      </div>

      <div className="bg-beige p-8 flex items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="accountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Receipt className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <Input className="pl-10" placeholder="Enter account number" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-400">$</span>
                        <Input className="pl-8" placeholder="0.00" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Image (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          field.onChange(e.target.files ? e.target.files[0] : null)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-[#c1b8f0] hover:bg-[#b3a9e9] mb-4">
                Pay Bill
              </Button>

              <div className="flex justify-center space-x-4">
                <Link href="/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline">Sign Up</Button>
                </Link>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 justify-center mt-4">
                <Shield size={16} />
                <span>Secure Payment</span>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
}
