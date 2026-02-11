"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Package } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Called no respond"
  | "Cancelled"
  | "Packaged"
  | "Shipped"
  | "Delivered";

interface Order {
  _id: Id<"orders">;
  _creationTime: number;
  orderNumber: string;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerWilaya: string;
  productName: string;
  deliveryType: "Domicile" | "Stopdesk";
  totalAmount: number;
}

interface OrderTableProps {
  orders: Order[];
  onOrderClick: (orderId: Id<"orders">) => void;
}

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "Confirmed":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "Called no respond":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-300";
    case "Packaged":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "Shipped":
      return "bg-indigo-100 text-indigo-800 border-indigo-300";
    case "Delivered":
      return "bg-green-100 text-green-800 border-green-300";
  }
};

export function OrderTable({ orders, onOrderClick }: OrderTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-20 text-center">
        <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No orders found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Delivery</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order._id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => onOrderClick(order._id)}
            >
              <TableCell className="font-mono text-sm">{order.orderNumber}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.customerPhone}</p>
                </div>
              </TableCell>
              <TableCell className="text-sm">{order.productName}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm">{order.deliveryType}</p>
                  <p className="text-xs text-gray-500">{order.customerWilaya}</p>
                </div>
              </TableCell>
              <TableCell className="font-semibold">
                {order.totalAmount.toLocaleString()} DA
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {new Date(order._creationTime).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button size="sm" variant="ghost" onClick={() => onOrderClick(order._id)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
