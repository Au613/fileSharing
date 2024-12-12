import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useUser } from "@/hooks/use-user";
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
import { Link } from "wouter";

export default function AdminDashboard() {
  const { logout } = useUser();
  const [, setLocation] = useLocation();
  const { data: bills, isLoading } = useQuery({
    queryKey: ["/api/admin/bills"],
    queryFn: async () => {
      console.log("Fetching admin bills...");
      const response = await fetch("/api/admin/bills", {
        credentials: "include",
      });
      
      if (!response.ok) {
        console.error("Failed to fetch bills:", response.status, response.statusText);
        throw new Error("Failed to fetch bills");
      }
      
      const data = await response.json();
      console.log("Received bills data:", data);
      return data;
    },
  });

  console.log("Current bills state:", bills);

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
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
            <h1 className="text-2xl font-bold text-dark-blue">
              Bill Management
            </h1>
          </div>
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                const result = await logout();
                if (result.ok) {
                  setLocation("/");
                }
              } catch (error) {
                console.error("Failed to sign out:", error);
              }
            }}
          >
            Sign Out
          </Button>
        </div>

        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            Debug Info: {bills ? `Found ${bills.length} bills` : 'No bills loaded'}
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Account Type</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills?.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>{bill.id}</TableCell>
                  <TableCell>{bill.username}</TableCell>
                  <TableCell>{bill.accountType}</TableCell>
                  <TableCell>{bill.accountNumber}</TableCell>
                  <TableCell>${bill.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {bill.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {bill.paymentStatus}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {!bills?.length && (
            <div className="text-center p-4 text-gray-500">
              No bills found
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
