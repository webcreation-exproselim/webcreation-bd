import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Phone, Wifi, Fingerprint, Plus, Shield } from "lucide-react";
import { format } from "date-fns";

interface BlacklistEntry {
  id: string;
  blocked_value: string;
  block_type: string;
  reason: string | null;
  created_at: string;
}

interface BlacklistManagerProps {
  blacklist: BlacklistEntry[];
  onAdd: (value: string, type: string, reason?: string) => void;
  onRemove: (id: string) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  phone: <Phone className="h-4 w-4" />,
  ip: <Wifi className="h-4 w-4" />,
  device: <Fingerprint className="h-4 w-4" />
};

const typeColors: Record<string, string> = {
  phone: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  ip: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  device: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
};

export function BlacklistManager({ blacklist, onAdd, onRemove }: BlacklistManagerProps) {
  const [value, setValue] = useState("");
  const [type, setType] = useState("phone");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    
    onAdd(value.trim(), type, reason.trim() || undefined);
    setValue("");
    setReason("");
  };

  return (
    <div className="space-y-6">
      {/* Add to Blacklist Form */}
      <Card className="border-red-500/20 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-400">
            <Shield className="h-5 w-5" />
            Add to Blacklist
          </CardTitle>
          <CardDescription>
            Block a phone number, IP address, or device fingerprint from placing orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Phone Number
                      </span>
                    </SelectItem>
                    <SelectItem value="ip">
                      <span className="flex items-center gap-2">
                        <Wifi className="h-4 w-4" /> IP Address
                      </span>
                    </SelectItem>
                    <SelectItem value="device">
                      <span className="flex items-center gap-2">
                        <Fingerprint className="h-4 w-4" /> Device ID
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Value</Label>
                <Input
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === "phone" ? "01XXXXXXXXX" : type === "ip" ? "192.168.1.1" : "device-fingerprint-id"}
                  className="bg-slate-800/50 border-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label>Reason (optional)</Label>
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Fraud attempt"
                  className="bg-slate-800/50 border-slate-600"
                />
              </div>
            </div>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Add to Blacklist
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Blacklist Table */}
      <Card className="border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Blocked Entries ({blacklist.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {blacklist.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No entries in blacklist. Add one above to block fraudulent customers.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Type</TableHead>
                    <TableHead className="text-slate-400">Value</TableHead>
                    <TableHead className="text-slate-400">Reason</TableHead>
                    <TableHead className="text-slate-400">Added</TableHead>
                    <TableHead className="text-slate-400 w-20">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blacklist.map((entry) => (
                    <TableRow key={entry.id} className="border-slate-700 hover:bg-slate-800/50">
                      <TableCell>
                        <Badge className={typeColors[entry.block_type] || typeColors.phone}>
                          <span className="flex items-center gap-1">
                            {typeIcons[entry.block_type]}
                            {entry.block_type}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{entry.blocked_value}</TableCell>
                      <TableCell className="text-muted-foreground">{entry.reason || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(entry.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemove(entry.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
