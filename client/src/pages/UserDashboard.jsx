import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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
import { Receipt } from "lucide-react";
import { formatDistance } from "date-fns";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  accountType: z.enum(["residential", "business"]),
  accountNumber: z.string().min(5),
  amount: z.string().regex(/^\d+(\.\d{2})?$/),
  billImage: z.instanceof(File).optional(),
});

export default function UserDashboard() {
  const { user, logout } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountType: "residential",
      accountNumber: "",
      amount: "",
    },
  });

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
        description: "Bill has been added to your account.",
      });
      
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
    } catch (error) {
      console.error("Error submitting bill:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to submit bill. Please try again.",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      const result = await logout();
      if (result.ok) {
        setLocation("/");
      }
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const queryClient = useQueryClient();
  const { data: bills, isLoading } = useQuery({
    queryKey: ["/api/bills"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-purple p-8">
      <Card className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-dark-blue">My Bills</h1>
          <div className="flex gap-4">
            {user?.isAdmin && (
              <Button variant="outline" onClick={() => setLocation("/admin")}>
                Admin Dashboard
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add New Bill</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Bill</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="accountType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                    <Button type="submit" className="w-full">
                      Add Bill
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Bill Image</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills?.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{bill.accountType}</div>
                    <div className="text-sm text-gray-500">
                      {bill.accountNumber}
                    </div>
                  </div>
                </TableCell>
                <TableCell>${bill.amount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      bill.status === "pending"
                        ? "secondary"
                        : bill.status === "approved"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {bill.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      bill.paymentStatus === "unpaid"
                        ? "destructive"
                        : "default"
                    }
                  >
                    {bill.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatDistance(new Date(bill.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  {bill.billImage && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button 
                          className="text-primary hover:underline"
                          onClick={(e) => e.preventDefault()}
                        >
                          {bill.billImage.split('/').pop()}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Bill Image</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <img
                            src={bill.billImage}
                            alt="Bill"
                            className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                          />
                          <Button
                            className="mt-4 w-full"
                            onClick={() => window.open(bill.billImage)}
                          >
                            Download
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={bill.paymentStatus === "paid"}
                      >
                        Pay Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pay Bill</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium">Account Type</p>
                            <p className="text-sm text-gray-500">{bill.accountType}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Account Number</p>
                            <p className="text-sm text-gray-500">{bill.accountNumber}</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm font-medium">Amount Due</p>
                            <p className="text-2xl font-bold">${bill.amount}</p>
                          </div>
                          {bill.billImage && (
                            <div>
                              <p className="text-sm font-medium mb-2">Bill Image</p>
                              <img
                                src={bill.billImage}
                                alt="Bill"
                                className="w-full h-auto rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                        <Button 
                          className="w-full" 
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/bills/${bill.id}/pay`, {
                                method: 'POST',
                                credentials: 'include'
                              });
                              
                              if (!response.ok) {
                                throw new Error('Failed to process payment');
                              }
                              
                              queryClient.invalidateQueries({ queryKey: ['/api/bills'] });
                              toast({
                                title: "Success!",
                                description: "Payment processed successfully.",
                              });
                            } catch (error) {
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Failed to process payment. Please try again.",
                              });
                            }
                          }}
                        >
                          Pay ${bill.amount}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
