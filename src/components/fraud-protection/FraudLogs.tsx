import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface FraudLog {
  id: string;
  phone_number: string | null;
  ip_address: string | null;
  device_fingerprint: string | null;
  status: string;
  created_at: string;
}

interface FraudLogsProps {
  logs: FraudLog[];
  onRefresh: () => void;
}

const maskPhone = (phone: string | null): string => {
  if (!phone) return "-";
  if (phone.length < 6) return phone;
  return phone.slice(0, 4) + "***" + phone.slice(-3);
};

const truncateDeviceId = (id: string | null): string => {
  if (!id) return "-";
  if (id.length <= 12) return id;
  return id.slice(0, 8) + "..." + id.slice(-4);
};

const statusConfig: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
  allowed: {
    icon: <CheckCircle className="h-3 w-3" />,
    className: "bg-green-500/20 text-green-400 border-green-500/30",
    label: "Allowed"
  },
  blocked_cooldown: {
    icon: <Clock className="h-3 w-3" />,
    className: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    label: "Cooldown"
  },
  blocked_blacklist: {
    icon: <XCircle className="h-3 w-3" />,
    className: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "Blacklisted"
  }
};

export function FraudLogs({ logs, onRefresh }: FraudLogsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredLogs = logs.filter((log) => {
    const search = searchTerm.toLowerCase();
    return (
      log.phone_number?.toLowerCase().includes(search) ||
      log.ip_address?.toLowerCase().includes(search) ||
      log.device_fingerprint?.toLowerCase().includes(search) ||
      log.status.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: logs.length,
    allowed: logs.filter((l) => l.status === "allowed").length,
    blockedCooldown: logs.filter((l) => l.status === "blocked_cooldown").length,
    blockedBlacklist: logs.filter((l) => l.status === "blocked_blacklist").length
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Checks</div>
          </CardContent>
        </Card>
        <Card className="border-green-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-400">{stats.allowed}</div>
            <div className="text-sm text-muted-foreground">Allowed</div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-orange-400">{stats.blockedCooldown}</div>
            <div className="text-sm text-muted-foreground">Blocked (Cooldown)</div>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-400">{stats.blockedBlacklist}</div>
            <div className="text-sm text-muted-foreground">Blocked (Blacklist)</div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Order Check Logs</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 w-48 bg-slate-800/50 border-slate-600"
              />
            </div>
            <Button variant="outline" size="icon" onClick={onRefresh} className="border-slate-600">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paginatedLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "No matching logs found." : "No order checks logged yet."}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Date/Time</TableHead>
                      <TableHead className="text-slate-400">Phone</TableHead>
                      <TableHead className="text-slate-400">IP Address</TableHead>
                      <TableHead className="text-slate-400">Device ID</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => {
                      const status = statusConfig[log.status] || statusConfig.allowed;
                      return (
                        <TableRow key={log.id} className="border-slate-700 hover:bg-slate-800/50">
                          <TableCell className="text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.created_at), "MMM d, HH:mm")}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {maskPhone(log.phone_number)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {log.ip_address || "-"}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {truncateDeviceId(log.device_fingerprint)}
                          </TableCell>
                          <TableCell>
                            <Badge className={status.className}>
                              <span className="flex items-center gap-1">
                                {status.icon}
                                {status.label}
                              </span>
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-slate-600"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-slate-600"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
