"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  ArrowUpDown, 
  Download, 
  Upload,
  X,
  Check,
  Layers,
  DollarSign,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ImageUploadDropzone } from "@/components/upload/ImageUploadDropzone";
import { useAuth } from "@/context/AuthContext";
import { IMedicine, UnitConversion } from "@/lib/types";
import { MEDICINE_UNITS } from "@/lib/constants";
import { toast } from "sonner";
import { auth } from "@/lib/firebase/client";

export default function MedicinesPage() {
  const { hasPermission } = useAuth();
  const [medicines, setMedicines] = useState<IMedicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<IMedicine | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [banglaName, setBanglaName] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [baseUnit, setBaseUnit] = useState<string>("Tablet");
  const [baseSellingPrice, setBaseSellingPrice] = useState<number>(0);
  const [averagePurchaseCost, setAveragePurchaseCost] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [conversions, setConversions] = useState<UnitConversion[]>([]);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFileId, setImageFileId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Restock states
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockCost, setRestockCost] = useState<number>(0);
  const [restockNote, setRestockNote] = useState<string>("");

  // CSV Import states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importFileName, setImportFileName] = useState("");

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (categoryFilter) params.append("category", categoryFilter);
      if (lowStockFilter) params.append("lowStock", "true");

      const res = await fetch(`/api/medicines?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load inventory");
      const data = await res.json();
      setMedicines(data.medicines || []);
      setTotalCount(data.totalCount || data.medicines?.length || 0);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Could not fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchMedicines();
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery, categoryFilter, lowStockFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedicines();
  };

  const resetForm = () => {
    setName("");
    setBanglaName("");
    setCategory("");
    setNotes("");
    setBaseUnit("Tablet");
    setBaseSellingPrice(0);
    setAveragePurchaseCost(0);
    setCurrentStock(0);
    setLowStockThreshold(10);
    setConversions([]);
    setImageUrl("");
    setImageFileId("");
    setSelectedMedicine(null);
  };

  const handleOpenEdit = (med: IMedicine) => {
    setSelectedMedicine(med);
    setName(med.name);
    setBanglaName(med.banglaName || "");
    setCategory(med.category || "");
    setNotes(med.notes || "");
    setBaseUnit(med.baseUnit);
    setBaseSellingPrice(med.baseSellingPrice);
    setAveragePurchaseCost(med.averagePurchaseCost);
    setCurrentStock(med.currentStock);
    setLowStockThreshold(med.lowStockThreshold);
    setConversions(med.conversions || []);
    setImageUrl(med.imageUrl || "");
    setImageFileId(med.imageFileId || "");
    setIsEditModalOpen(true);
  };

  const handleOpenRestock = (med: IMedicine) => {
    setSelectedMedicine(med);
    setRestockQty(10);
    setRestockCost(med.averagePurchaseCost || 0);
    setRestockNote("");
    setIsRestockModalOpen(true);
  };

  const handleAddConversion = () => {
    setConversions([
      ...conversions,
      { unitName: "Strip", conversionFactor: 10, sellingPrice: baseSellingPrice * 10 },
    ]);
  };

  const handleRemoveConversion = (index: number) => {
    setConversions(conversions.filter((_, i) => i !== index));
  };

  const handleUpdateConversion = (index: number, field: keyof UnitConversion, value: any) => {
    const updated = [...conversions];
    updated[index] = { ...updated[index], [field]: value };
    setConversions(updated);
  };

  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Medicine name is required");
      return;
    }

    try {
      setSubmitting(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const payload = {
        name: name.trim(),
        banglaName: banglaName.trim() || undefined,
        category: category.trim() || undefined,
        notes: notes.trim() || undefined,
        baseUnit,
        baseSellingPrice: Number(baseSellingPrice),
        averagePurchaseCost: Number(averagePurchaseCost),
        currentStock: Number(currentStock),
        lowStockThreshold: Number(lowStockThreshold),
        conversions,
        imageUrl: imageUrl || undefined,
        imageFileId: imageFileId || undefined,
      };

      const res = await fetch("/api/medicines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create medicine");

      toast.success(`"${name}" added to stock successfully!`);
      setIsAddModalOpen(false);
      resetForm();
      fetchMedicines();
    } catch (err: any) {
      toast.error(err.message || "Failed to save medicine");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine?._id) return;

    try {
      setSubmitting(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const payload = {
        name: name.trim(),
        banglaName: banglaName.trim() || undefined,
        category: category.trim() || undefined,
        notes: notes.trim() || undefined,
        baseUnit,
        baseSellingPrice: Number(baseSellingPrice),
        lowStockThreshold: Number(lowStockThreshold),
        conversions,
        imageUrl: imageUrl || undefined,
        imageFileId: imageFileId || undefined,
      };

      const res = await fetch(`/api/medicines/${selectedMedicine._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update medicine");

      toast.success("Medicine details updated");
      setIsEditModalOpen(false);
      resetForm();
      fetchMedicines();
    } catch (err: any) {
      toast.error(err.message || "Failed to update medicine");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExecuteRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedicine?._id) return;

    if (restockQty <= 0) {
      toast.error("Restock quantity must be greater than 0");
      return;
    }

    try {
      setSubmitting(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch(`/api/medicines/${selectedMedicine._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          restock: {
            quantity: Number(restockQty),
            costPerBaseUnit: Number(restockCost),
            note: restockNote || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to restock");

      toast.success(`Restocked ${restockQty} ${selectedMedicine.baseUnit}(s) for ${selectedMedicine.name}`);
      setIsRestockModalOpen(false);
      resetForm();
      fetchMedicines();
    } catch (err: any) {
      toast.error(err.message || "Failed to process restock");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMedicine = async (med: IMedicine) => {
    if (!confirm(`Are you sure you want to delete "${med.name}" from inventory?`)) return;

    try {
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch(`/api/medicines/${med._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      toast.success(`"${med.name}" deleted from stock`);
      fetchMedicines();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete medicine");
    }
  };

  const handleExportCSV = () => {
    if (medicines.length === 0) {
      toast.info("No medicine records to export");
      return;
    }

    const headers = ["Name", "Bangla Name", "Category", "Base Unit", "Stock", "Selling Price (BDT)", "Average Cost (BDT)", "Low Stock Alert"];
    const rows = medicines.map((m) => [
      `"${m.name.replace(/"/g, '""')}"`,
      `"${(m.banglaName || "").replace(/"/g, '""')}"`,
      `"${(m.category || "").replace(/"/g, '""')}"`,
      m.baseUnit,
      m.currentStock,
      m.baseSellingPrice,
      m.averagePurchaseCost,
      m.lowStockThreshold,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `LurixPharma_Inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadSampleTemplate = () => {
    const sampleHeaders = [
      "Medicine / Item",
      "Bangla Name",
      "Category",
      "Base Unit",
      "Stock Level",
      "Selling Price",
      "Avg Cost (COGS)",
      "Low Stock Alert",
      "Conversions",
    ];
    const sampleRows = [
      ["Napa Extra 500mg", "নাপা এক্সট্রা", "Paracetamol", "Tablet", "500", "3.50", "2.20", "20", "Strip:10:35;Box:100:320"],
      ["Seclo 20mg", "সেকলো ২০ মিগ্রা", "Omeprazole", "Capsule", "300", "7.00", "5.10", "30", "Strip:10:70;Box:100:680"],
      ["Histacin 4mg", "হিস্টাসিন", "Antihistamine", "Tablet", "1000", "0.50", "0.30", "50", ""],
      ["Tofen 100ml", "টোফেন", "Syrup", "Bottle", "40", "95.00", "76.00", "5", ""],
    ];

    const csvContent =
      "\uFEFF" +
      [
        sampleHeaders.join(","),
        ...sampleRows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")),
      ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "LurixPharma_Medicine_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCsvFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          toast.error("CSV file is empty or missing data rows");
          return;
        }

        const headerLine = lines[0];
        const delimiter = headerLine.includes("\t") ? "\t" : ",";

        const splitRow = (rowStr: string): string[] => {
          const result: string[] = [];
          let cur = "";
          let inQuotes = false;
          for (let i = 0; i < rowStr.length; i++) {
            const ch = rowStr[i];
            if (ch === '"') {
              inQuotes = !inQuotes;
            } else if (ch === delimiter && !inQuotes) {
              result.push(cur.trim().replace(/^"|"$/g, ""));
              cur = "";
            } else {
              cur += ch;
            }
          }
          result.push(cur.trim().replace(/^"|"$/g, ""));
          return result;
        };

        const headers = splitRow(headerLine);
        const parsedRows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = splitRow(lines[i]);
          if (values.length === 0 || values.every((v) => !v)) continue;

          const rowObj: Record<string, string> = {};
          headers.forEach((h, idx) => {
            rowObj[h] = values[idx] || "";
          });
          parsedRows.push(rowObj);
        }

        setImportRows(parsedRows);
        toast.info(`Loaded ${parsedRows.length} medicine records from "${file.name}"`);
      } catch (err: any) {
        toast.error("Failed to parse CSV file: " + err.message);
      }
    };
    reader.readAsText(file, "UTF-8");
  };

  const handleExecuteImport = async () => {
    if (importRows.length === 0) {
      toast.error("No valid medicine rows to import");
      return;
    }

    try {
      setImporting(true);
      const token = await auth?.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/medicines/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rows: importRows }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      toast.success(
        `Import Complete: ${data.summary.insertedCount} added, ${data.summary.updatedCount} updated!`
      );
      if (data.summary.errorCount > 0) {
        toast.warning(`${data.summary.errorCount} row(s) had errors and were skipped.`);
      }

      setIsImportModalOpen(false);
      setImportRows([]);
      setImportFileName("");
      fetchMedicines();
    } catch (err: any) {
      toast.error(err.message || "Failed to process import");
    } finally {
      setImporting(false);
    }
  };

  // Unique categories for filter dropdown
  const categories = Array.from(new Set(medicines.map((m) => m.category).filter(Boolean))) as string[];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F2F5F3]">
      <DashboardHeader title="Medicine Inventory" />

      <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Controls & Filter Bar */}
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-emerald-950/5 shadow-neu-flat space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>Stock & Products</span>
                {totalCount > 0 && (
                  <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {totalCount.toLocaleString("en-BD")} medicines
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage medicine pricing, units, batches, and weighted average costs
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-xs border border-gray-200 shadow-neu-flat transition-all"
              >
                <Download className="w-4 h-4 text-gray-500" />
                <span>Export CSV</span>
              </button>

              {hasPermission("csv_import_export") && (
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200 shadow-neu-flat transition-all"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Import CSV</span>
                </button>
              )}

              {hasPermission("manage_stock") && (
                <button
                  onClick={() => {
                    resetForm();
                    setIsAddModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-neu-flat transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Medicine</span>
                </button>
              )}
            </div>
          </div>

          {/* Search & Filter Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, Bangla name, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50/80 border border-emerald-950/10 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-inner"
              />
            </form>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-gray-50/80 border border-emerald-950/10 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
                lowStockFilter
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${lowStockFilter ? "text-amber-700" : "text-gray-400"}`} />
              <span>Low Stock Only</span>
            </button>

            <button
              onClick={fetchMedicines}
              className="p-2.5 rounded-2xl bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 transition-all self-center"
              title="Refresh table"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-brand-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Medicines Table Card */}
        <div className="bg-white rounded-3xl border border-emerald-950/5 shadow-neu-flat overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-gray-50/90 text-gray-500 font-semibold uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-4 px-5">Medicine / Item</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Base Unit</th>
                  <th className="py-4 px-4">Stock Level</th>
                  <th className="py-4 px-4">Selling Price</th>
                  <th className="py-4 px-4">Avg Cost (COGS)</th>
                  <th className="py-4 px-4">Conversions</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <RefreshCw className="w-6 h-6 mx-auto animate-spin text-brand-600 mb-2" />
                      Loading inventory records...
                    </td>
                  </tr>
                ) : medicines.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                      No medicines found matching the criteria. Click "Add Medicine" to create your first stock item.
                    </td>
                  </tr>
                ) : (
                  medicines.map((med) => {
                    const isLow = med.currentStock <= med.lowStockThreshold;
                    return (
                      <tr key={med._id?.toString()} className="hover:bg-emerald-50/20 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden relative flex-shrink-0 flex items-center justify-center">
                              {med.imageUrl ? (
                                <Image
                                  src={med.imageUrl}
                                  alt={med.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-sm">{med.name}</div>
                              {med.banglaName && (
                                <div className="text-[11px] text-gray-500">{med.banglaName}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700">
                            {med.category || "General"}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-medium text-gray-800">
                          {med.baseUnit}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                                isLow
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {med.currentStock} {med.baseUnit}s
                            </span>
                            {isLow && (
                              <span title="Low stock threshold reached">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-bold text-gray-900">
                          ৳{med.baseSellingPrice.toFixed(2)}
                        </td>

                        <td className="py-4 px-4 text-gray-600">
                          ৳{med.averagePurchaseCost.toFixed(2)}
                        </td>

                        <td className="py-4 px-4">
                          {med.conversions && med.conversions.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {med.conversions.map((c, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200"
                                >
                                  {c.unitName} (৳{c.sellingPrice})
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px]">—</span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hasPermission("manage_stock") && (
                              <button
                                onClick={() => handleOpenRestock(med)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-[11px] border border-emerald-200 transition-all"
                                title="Quick Restock"
                              >
                                Restock
                              </button>
                            )}

                            {hasPermission("manage_stock") && (
                              <button
                                onClick={() => handleOpenEdit(med)}
                                className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-all"
                                title="Edit Medicine"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {hasPermission("manage_stock") && (
                              <button
                                onClick={() => handleDeleteMedicine(med)}
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all"
                                title="Delete Medicine"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Medicine Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Add New Medicine to Stock</h2>
                  <p className="text-xs text-gray-500">Configure base unit, pricing, and package conversions</p>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-2xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMedicine} className="space-y-4">
                {/* Photo Dropzone with Client Compression */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Medicine Photo (Optional)
                  </label>
                  <ImageUploadDropzone
                    currentImageUrl={imageUrl}
                    currentImageFileId={imageFileId}
                    onImageUploaded={(res) => {
                      setImageUrl(res.url);
                      setImageFileId(res.fileId);
                    }}
                    onImageRemoved={() => {
                      setImageUrl("");
                      setImageFileId("");
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Medicine Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Napa Extra 500mg"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Bangla Name (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: নাপা এক্সট্রা ৫০০ মিগ্রা"
                      value={banglaName}
                      onChange={(e) => setBanglaName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Paracetamol, Antibiotic, Vitamin"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Base Stock Unit *
                    </label>
                    <select
                      value={baseUnit}
                      onChange={(e) => setBaseUnit(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    >
                      {MEDICINE_UNITS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Selling Price per {baseUnit} (৳) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={baseSellingPrice}
                      onChange={(e) => setBaseSellingPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Purchase Cost per {baseUnit} (৳) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={averagePurchaseCost}
                      onChange={(e) => setAveragePurchaseCost(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Initial Stock ({baseUnit}s) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={currentStock}
                      onChange={(e) => setCurrentStock(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Low Stock Alert Threshold ({baseUnit}s)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Optional Package Unit Conversions */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-gray-800">Package Unit Conversions</span>
                      <p className="text-[11px] text-gray-500">Sell in Strips or Boxes with explicit selling prices</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddConversion}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Conversion</span>
                    </button>
                  </div>

                  {conversions.map((conv, idx) => (
                    <div key={idx} className="p-3 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] text-gray-500">Unit Name</label>
                        <input
                          type="text"
                          value={conv.unitName}
                          onChange={(e) => handleUpdateConversion(idx, "unitName", e.target.value)}
                          placeholder="e.g. Strip"
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="text-[10px] text-gray-500">Contains ({baseUnit}s)</label>
                        <input
                          type="number"
                          min="2"
                          value={conv.conversionFactor}
                          onChange={(e) => handleUpdateConversion(idx, "conversionFactor", Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="text-[10px] text-gray-500">Selling Price (৳)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={conv.sellingPrice}
                          onChange={(e) => handleUpdateConversion(idx, "sellingPrice", Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveConversion(idx)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 self-end mb-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-neu-flat transition-all"
                  >
                    {submitting ? "Saving..." : "Save Medicine"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Restock Modal with Live Weighted Average Cost Calculation */}
        {isRestockModalOpen && selectedMedicine && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Restock Medicine</h2>
                  <p className="text-xs text-gray-500">{selectedMedicine.name}</p>
                </div>
                <button onClick={() => setIsRestockModalOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleExecuteRestock} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs space-y-1.5 text-emerald-900">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Stock:</span>
                    <span className="font-bold">{selectedMedicine.currentStock} {selectedMedicine.baseUnit}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Average Cost:</span>
                    <span className="font-bold">৳{selectedMedicine.averagePurchaseCost.toFixed(2)} / {selectedMedicine.baseUnit}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Add Quantity ({selectedMedicine.baseUnit}s) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    New Batch Purchase Cost per {selectedMedicine.baseUnit} (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={restockCost}
                    onChange={(e) => setRestockCost(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                {/* Live Weighted Average Preview */}
                {restockQty > 0 && (
                  <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-[11px] text-blue-900">
                    <div className="font-semibold mb-1">Weighted Average Calculation:</div>
                    <div>New Total Stock: <strong>{selectedMedicine.currentStock + restockQty} {selectedMedicine.baseUnit}s</strong></div>
                    <div>
                      New Weighted Avg Cost:{" "}
                      <strong>
                        ৳
                        {(
                          (selectedMedicine.currentStock * selectedMedicine.averagePurchaseCost +
                            restockQty * restockCost) /
                          (selectedMedicine.currentStock + restockQty)
                        ).toFixed(2)}
                      </strong>{" "}
                      / {selectedMedicine.baseUnit}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Restock Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Invoice #PO-982 from Square"
                    value={restockNote}
                    onChange={(e) => setRestockNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsRestockModalOpen(false)}
                    className="px-4 py-2 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-neu-flat"
                  >
                    {submitting ? "Updating..." : "Confirm Restock"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Medicine Modal */}
        {isEditModalOpen && selectedMedicine && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Edit Medicine Details</h2>
                  <p className="text-xs text-gray-500">{selectedMedicine.name}</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)}>
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUpdateMedicine} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Medicine Photo
                  </label>
                  <ImageUploadDropzone
                    currentImageUrl={imageUrl}
                    currentImageFileId={imageFileId}
                    onImageUploaded={(res) => {
                      setImageUrl(res.url);
                      setImageFileId(res.fileId);
                    }}
                    onImageRemoved={() => {
                      setImageUrl("");
                      setImageFileId("");
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Medicine Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Bangla Name
                    </label>
                    <input
                      type="text"
                      value={banglaName}
                      onChange={(e) => setBanglaName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Base Selling Price (৳) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={baseSellingPrice}
                      onChange={(e) => setBaseSellingPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-neu-flat"
                  >
                    {submitting ? "Updating..." : "Update Medicine"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Import CSV Modal */}
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 my-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Import Medicines from CSV</h2>
                  <p className="text-xs text-gray-500">Bulk upload your inventory list with pricing and conversions</p>
                </div>
                <button
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportRows([]);
                    setImportFileName("");
                  }}
                  className="p-2 rounded-2xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step 1: Upload or Download Template */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950">
                  <div>
                    <span className="font-bold block">Need the exact CSV format?</span>
                    <span className="text-[11px] text-emerald-800">
                      Download the pre-formatted template with sample medicine data.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadSampleTemplate}
                    className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 font-bold text-emerald-800 hover:bg-emerald-50 flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Template</span>
                  </button>
                </div>

                {/* File input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Select CSV File (.csv)
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-500/50 bg-gray-50/60 cursor-pointer transition-all">
                    <Upload className="w-8 h-8 text-brand-600 mb-2" />
                    <span className="text-xs font-bold text-gray-800">
                      {importFileName || "Click to browse and choose your CSV file"}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
                      Supports comma or tab-delimited files (.csv, exported from Excel)
                    </span>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleCsvFileSelected}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Parsed Rows Preview */}
                {importRows.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-800">
                      <span>Preview ({importRows.length} items ready to import):</span>
                      <span className="text-[11px] text-brand-600 font-semibold">Showing first 4 rows</span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-gray-200">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-gray-100 text-gray-600 font-semibold">
                          <tr>
                            <th className="py-2 px-3">Item Name</th>
                            <th className="py-2 px-3">Bangla</th>
                            <th className="py-2 px-3">Unit</th>
                            <th className="py-2 px-3">Stock</th>
                            <th className="py-2 px-3">Selling (৳)</th>
                            <th className="py-2 px-3">Cost (৳)</th>
                            <th className="py-2 px-3">Conversions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {importRows.slice(0, 4).map((r, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="py-2 px-3 font-bold text-gray-900">
                                {r["Medicine / Item"] || r.name || "—"}
                              </td>
                              <td className="py-2 px-3 text-gray-600">
                                {r["Bangla Name"] || r.banglaName || "—"}
                              </td>
                              <td className="py-2 px-3 text-gray-700">
                                {r["Base Unit"] || r.baseUnit || "Tablet"}
                              </td>
                              <td className="py-2 px-3 font-semibold text-emerald-800">
                                {r["Stock Level"] || r.currentStock || 0}
                              </td>
                              <td className="py-2 px-3 font-bold text-gray-900">
                                ৳{r["Selling Price"] || r.baseSellingPrice || 0}
                              </td>
                              <td className="py-2 px-3 text-gray-600">
                                ৳{r["Avg Cost (COGS)"] || r.averagePurchaseCost || 0}
                              </td>
                              <td className="py-2 px-3 text-gray-500 font-mono text-[10px]">
                                {r["Conversions"] || r.conversions || "None"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setImportRows([]);
                    setImportFileName("");
                  }}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={importing || importRows.length === 0}
                  onClick={handleExecuteImport}
                  className="px-6 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-xs shadow-neu-flat transition-all"
                >
                  {importing ? "Importing Data..." : `Import ${importRows.length} Medicines`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
