import React, { useState, useEffect } from "react";
import { authApi } from "../../api/authApi";
import { useNotification } from "../../context/NotificationContext";
import { Card, CardContent } from "../../components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/Table";
import { formatDate } from "../../utils/formatters";
import { Users, Shield } from "lucide-react";

export const UserManagement = () => {
  const { showToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await authApi.getAllUsers();
        if (res.success) {
          setUsers(res.data.users || []);
        }
      } catch (err) {
        showToast(err.message || "Failed to load users", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "MANAGER":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "LOAN_OFFICER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "CUSTOMER":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            User & Role Management
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Registered system accounts across CUSTOMER, LOAN_OFFICER, MANAGER, and ADMIN permissions.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="font-semibold text-xs text-slate-800">
                    {u.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {u.email}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {u.phone || "—"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(
                        u.role
                      )}`}
                    >
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      ACTIVE
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {formatDate(u.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
