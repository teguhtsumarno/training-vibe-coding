"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Plus, Pencil, Trash2, FileText, Loader2 } from "lucide-react";

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan data";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lt: LeaveType) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus jenis cuti "${lt.name}"?`)) return;
    try {
      await deleteLeaveType(lt.id);
      fetchLeaveTypes();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus jenis cuti";
      toast.error(message);
    }
  };

  if (session?.role !== "admin") return null;

  return (
    <div className="min-h-screen p-4 sm:p-8 pt-24 md:pt-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-medium tracking-tight text-[#121317]">
              Master Data — Jenis Cuti
            </h1>
            <p className="text-sm text-[#6A6A71] mt-1">Kelola jenis cuti dan kuota default</p>
          </div>
          <Button
            variant="cta"
            onClick={handleOpenCreate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Tambah Jenis Cuti
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#6A6A71]">Loading...</div>
        ) : leaveTypes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E1E6EC] p-8 max-w-md mx-auto ">
            <div className="mx-auto w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 mb-4 text-purple-500">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-heading font-bold text-[#121317]">Belum ada jenis cuti</h3>
            <p className="text-sm text-[#6A6A71] mt-2">Tambahkan jenis cuti pertama untuk memulai.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#E1E6EC]">
            <Table>
              <TableHeader className="border-b border-[#E1E6EC]">
                <TableRow className="border-b border-[#E1E6EC] hover:bg-transparent">
                  <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">Nama Jenis Cuti</TableHead>
                  <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">Kuota Default</TableHead>
                  <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">Deskripsi</TableHead>
                  <TableHead className="font-heading font-semibold text-[#121317] tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveTypes.map((lt) => (
                  <TableRow
                    key={lt.id}
                    className="border-b border-[#E1E6EC] hover:bg-blue-500/5 transition-colors duration-300"
                  >
                    <TableCell className="font-medium text-[#121317]">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        {lt.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-[#6A6A71]">{lt.defaultBalance} Hari</TableCell>
                    <TableCell className="text-[#6A6A71] max-w-[250px] truncate">{lt.description || "—"}</TableCell>
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
                          className="h-8 w-8 rounded-lg text-[#6A6A71] hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
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
        <DialogContent className="bg-white border border-[#E1E6EC] text-[#121317] rounded-[16px] max-w-md w-full p-0 overflow-hidden">
          <div className="p-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-heading font-medium text-[#121317]">
                {editingType ? "Edit Jenis Cuti" : "Tambah Jenis Cuti"}
              </DialogTitle>
              <DialogDescription className="text-[14.5px] text-[#6A6A71] mt-1">
                {editingType
                  ? "Ubah data jenis cuti di bawah ini"
                  : "Isi data jenis cuti baru. Kuota default akan otomatis diberikan ke semua employee."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 pb-2 space-y-5">
            <div className="space-y-1.5">
              <Label className="text-[14.5px] font-medium text-[#121317]">Nama Jenis Cuti</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Cuti Tahunan"
                className="h-11 bg-white border-[#E1E6EC] rounded-lg px-3.5 text-[16px] placeholder:text-[#AAB1CC] focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[14.5px] font-medium text-[#121317]">Kuota Default (Hari)</Label>
              <Input
                type="number"
                value={formData.defaultBalance}
                onChange={(e) => setFormData({ ...formData, defaultBalance: Number(e.target.value) })}
                placeholder="12"
                className="h-11 bg-white border-[#E1E6EC] rounded-lg px-3.5 text-[16px] placeholder:text-[#AAB1CC] focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[14.5px] font-medium text-[#121317]">Deskripsi (Opsional)</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi singkat tentang jenis cuti"
                className="h-11 bg-white border-[#E1E6EC] rounded-lg px-3.5 text-[16px] placeholder:text-[#AAB1CC] focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-200"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-[#FF0000] bg-[rgba(255,0,0,0.02)] px-4 py-3">
                <div className="h-1.5 w-1.5 rounded-full bg-[#FF0000] shrink-0" />
                <p className="text-[14.5px] text-[#FF0000]">{error}</p>
              </div>
            )}
          </div>

          <div className="border-t border-[#E1E6EC] bg-[#F8F9FC] px-6 py-4 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
              className="px-5"
            >
              Batal
            </Button>
            <Button
              variant="cta"
              onClick={handleSave}
              disabled={saving}
              className="px-5"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </span>
              ) : (
                editingType ? "Update" : "Simpan"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}