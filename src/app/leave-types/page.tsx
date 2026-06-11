"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";
import { getAllLeaveTypes, createLeaveType, updateLeaveType, deleteLeaveType } from "@/services/leave-type-storage";
import { type LeaveType } from "@/types/leave";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";

export default function LeaveTypesPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState({ name: "", defaultBalance: 12, description: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Redirect non-admin
  useEffect(() => {
    if (session && session.role !== "admin") {
      router.push(ROUTES.DASHBOARD);
    }
  }, [session, router]);

  const fetchLeaveTypes = useCallback(async () => {
    setLoading(true);
    const data = await getAllLeaveTypes();
    setLeaveTypes(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLeaveTypes();
  }, [fetchLeaveTypes]);

  const handleOpenCreate = () => {
    setEditingType(null);
    setFormData({ name: "", defaultBalance: 12, description: "" });
    setError("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (lt: LeaveType) => {
    setEditingType(lt);
    setFormData({
      name: lt.name,
      defaultBalance: lt.defaultBalance,
      description: lt.description || "",
    });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Nama jenis cuti wajib diisi");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingType) {
        await updateLeaveType(editingType.id, formData);
      } else {
        await createLeaveType(formData);
      }
      setDialogOpen(false);
      fetchLeaveTypes();
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lt: LeaveType) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus jenis cuti "${lt.name}"?`)) return;
    try {
      await deleteLeaveType(lt.id);
      fetchLeaveTypes();
    } catch (err: any) {
      alert(err.message || "Gagal menghapus jenis cuti");
    }
  };

  if (session?.role !== "admin") return null;

  return (
    <div className="min-h-screen p-4 sm:p-8 pt-24 md:pt-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">
              Master Data — Jenis Cuti
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola jenis cuti dan kuota default</p>
          </div>
          <Button
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white rounded-xl shadow-md shadow-red-500/20 font-semibold transition-all duration-300 border-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Jenis Cuti
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading...</div>
        ) : leaveTypes.length === 0 ? (
          <div className="text-center py-16 bg-[#09090b] rounded-2xl border border-white/5 p-8 max-w-md mx-auto shadow-lg shadow-red-500/5">
            <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-4 text-purple-500">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-heading font-bold text-white">Belum ada jenis cuti</h3>
            <p className="text-sm text-muted-foreground mt-2">Tambahkan jenis cuti pertama untuk memulai.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#09090b] shadow-xl shadow-blue-500/5">
            <Table>
              <TableHeader className="bg-black/40 border-b border-white/5">
                <TableRow className="border-b border-white/5 hover:bg-transparent">
                  <TableHead className="font-heading font-semibold text-white tracking-wider">Nama Jenis Cuti</TableHead>
                  <TableHead className="font-heading font-semibold text-white tracking-wider">Kuota Default</TableHead>
                  <TableHead className="font-heading font-semibold text-white tracking-wider">Deskripsi</TableHead>
                  <TableHead className="font-heading font-semibold text-white tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveTypes.map((lt) => (
                  <TableRow
                    key={lt.id}
                    className="border-b border-white/5 hover:bg-blue-500/5 transition-colors duration-300"
                  >
                    <TableCell className="font-medium text-white">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {lt.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{lt.defaultBalance} Hari</TableCell>
                    <TableCell className="text-muted-foreground max-w-[250px] truncate">{lt.description || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(lt)}
                          className="h-8 w-8 rounded-lg hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(lt)}
                          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Dialog for Create / Edit Leave Type */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#09090b] border border-white/10 text-white rounded-2xl max-w-md w-full shadow-2xl shadow-blue-500/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">
              {editingType ? "Edit Jenis Cuti" : "Tambah Jenis Cuti"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editingType
                ? "Ubah data jenis cuti di bawah ini"
                : "Isi data jenis cuti baru. Kuota default akan otomatis diberikan ke semua employee."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-white tracking-wide">Nama Jenis Cuti</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Cuti Tahunan"
                className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-white tracking-wide">Kuota Default (Hari)</Label>
              <Input
                type="number"
                value={formData.defaultBalance}
                onChange={(e) => setFormData({ ...formData, defaultBalance: Number(e.target.value) })}
                placeholder="12"
                className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-white tracking-wide">Deskripsi (Opsional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi singkat tentang jenis cuti"
                className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
              />
            </div>

            {error && (
              <div className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white rounded-xl shadow-md shadow-red-500/20 py-2.5 font-semibold transition-all duration-300 border-0"
              >
                {saving ? "Menyimpan..." : editingType ? "Update" : "Simpan"}
              </Button>
              <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 border-white/10 hover:border-white/20 bg-transparent text-muted-foreground hover:text-white rounded-xl py-2.5 transition-all duration-300"
                >
                  Batal
                </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
