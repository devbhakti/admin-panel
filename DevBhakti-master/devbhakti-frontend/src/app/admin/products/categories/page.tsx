"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Package,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
  Download,
  Upload,
  Loader2
} from "lucide-react";
import * as XLSX from 'xlsx';
import { createCategoryAdmin } from "@/api/adminController";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/config/apiConfig";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { useLanguage } from "@/context/LanguageContext";
import { parseLocalizedValue } from "@/utils/textUtils";


import {
  fetchAllCategoriesAdmin,
  deleteCategoryAdmin,
  toggleCategoryStatusAdmin,
} from "@/api/adminController";

interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: {
    products: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesManagementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { hasPermission } = useAdminAuth();
  const { language, t } = useLanguage();

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [filterStatus]); // Reload when filter changes

  const getL = (field: any, lang: string, fallback: string = "") => {
    if (!field) return fallback;
    if (typeof field === "object") return field[lang] || "";
    if (typeof field === "string") {
        try {
            const parsed = JSON.parse(field);
            if (typeof parsed === "object" && parsed !== null) {
                return parsed[lang] || "";
            }
        } catch (e) { /* ignore */ }
    }
    if (lang === "en") return field;
    return "";
  };

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (filterStatus === "active") params.isActive = "true";
      if (filterStatus === "inactive") params.isActive = "false";
      if (searchTerm) params.search = searchTerm;

      const data = await fetchAllCategoriesAdmin(params);
      setCategories(data);
    } catch (error: any) {
      console.error("Load Categories Error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load categories";
      toast({
        title: t("admin.categories.error_loading") || "Error Loading Categories",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCategories();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("admin.categories.delete_confirm"))) {
      try {
        await deleteCategoryAdmin(id);
        toast({ title: t("admin.categories.success_delete") || "Success", description: "Category deleted successfully" });
        loadCategories();
      } catch (error: any) {
        toast({
          title: "Error Deleting Category",
          description: error?.response?.data?.message || "Failed to delete category",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleCategoryStatusAdmin(id, !currentStatus);
      toast({
        title: "Success",
        description: `Category ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      });
      loadCategories();
    } catch (error: any) {
      toast({
        title: "Error Updating Status",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // --- BULK MANAGEMENT ---
  const downloadTemplate = () => {
    const template = [
      {
        "Name_EN": "Spices",
        "Name_HI": "मसाले",
        "Name_MR": "मसाले",
        "Is_Active": "TRUE",
        "Image_URL": ""
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Category Template");
    XLSX.writeFile(wb, "Product_Category_Template.xlsx");
  };

  const handleExportExcel = () => {
    const exportData = categories.map(c => ({
      "ID": c.id,
      "Name_EN": getL(c.name, "en"),
      "Name_HI": getL(c.name, "hi"),
      "Name_MR": getL(c.name, "mr"),
      "Is_Active": c.isActive ? "TRUE" : "FALSE",
      "Image": c.image || "",
      "Products_Count": c._count?.products || 0,
      "Created_At": c.createdAt
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Categories");
    XLSX.writeFile(wb, `Product_Categories_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws) as any[];

        if (data.length === 0) {
          toast({ title: "Error", description: "Excel file is empty", variant: "destructive" });
          return;
        }

        toast({ title: "Import Started", description: `Importing ${data.length} categories...`, variant: "success" });

        let successCount = 0;
        let failCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < data.length; i++) {
          const row = data[i];
          const rowNum = i + 2;
          try {
            if (!row.Name_EN) throw new Error("English name is required");

            const formData = new FormData();
            formData.append("name_en", String(row.Name_EN || "").trim());
            formData.append("name_hi", String(row.Name_HI || "").trim());
            formData.append("name_mr", String(row.Name_MR || "").trim());
            formData.append("isActive", String(row.Is_Active || "TRUE").toUpperCase() === "TRUE" ? "true" : "false");
            
            if (row.Image_URL) {
                formData.append("image_url", row.Image_URL);
            }

            await createCategoryAdmin(formData);
            successCount++;
          } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || "Unknown error";
            failCount++;
            errors.push(`Row ${rowNum}: ${errorMsg}`);
            console.error(`Import Error Row ${rowNum}:`, errorMsg);
          }
        }

        if (failCount > 0) {
          toast({
            title: "Import Partially Failed",
            description: `Success: ${successCount}, Failed: ${failCount}. Check console or fix these: ${errors.slice(0, 3).join(", ")}${errors.length > 3 ? "..." : ""}`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Import Successful",
            description: `Successfully imported ${successCount} categories.`
          });
        }
        loadCategories();
      } catch (error) {
        toast({ title: "Import Failed", description: "Failed to process Excel file", variant: "destructive" });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <div className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] sm:text-xs font-medium whitespace-nowrap ${isActive
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-red-50 text-red-700 border-red-200"
        }`}>
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-red-500"}`} />
        <span>{isActive ? "ACTIVE" : "INACTIVE"}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("admin.categories.title")}</h1>
          <p className="text-muted-foreground">{t("admin.categories.desc")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* <Button variant="outline" onClick={downloadTemplate} className="text-xs h-9">
            <Download className="w-4 h-4 mr-1.5" />
            Template
          </Button> */}
{/* 
          <div className="relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleImportExcel}
            />
            <Button variant="outline" className="text-xs h-9">
              <Upload className="w-4 h-4 mr-1.5" />
              Import
            </Button>
          </div> */}

          {/* <Button variant="outline" onClick={handleExportExcel} className="text-xs h-9">
            <Download className="w-4 h-4 mr-1.5" />
            Export All
          </Button> */}

          {hasPermission("categories.create") && (
            <Button
              onClick={() => router.push("/admin/products/categories/create")}
              className="bg-[#7b4623] hover:bg-[#5d351a] h-9"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("admin.categories.add_new")}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
            <form onSubmit={handleSearch} className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder={t("admin.categories.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </form>
            <select
                className="h-9 sm:h-10 rounded-md border border-input bg-background px-3 py-2 text-xs sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring w-full sm:w-40"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#7b4623]"></div>
              <p className="mt-2 text-slate-600">{t("admin.categories.loading_data")}</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-12 h-12 opacity-20 mx-auto mb-4" />
              <p>{t("admin.categories.no_categories")}</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">English Name</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">हिंदी</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">मराठी</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">Products</th>
                      <th className="text-left px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">Status</th>
                      <th className="text-right px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {categories.map((category) => (
                      <tr key={category.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                              {category.image ? (
                                <img
                                  src={`${BASE_URL}${category.image}`}
                                  alt={getL(category.name, "en")}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <span className="truncate max-w-[150px]">{getL(category.name, "en") || "—"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {getL(category.name, "hi") || <span className="text-slate-300 italic text-xs">not set</span>}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {getL(category.name, "mr") || <span className="text-slate-300 italic text-xs">not set</span>}
                        </td>
                        <td className="px-6 py-4">
                           <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {category._count?.products || 0}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(category.isActive)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            {hasPermission("categories.edit") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className={`h-8 w-8 ${category.isActive ? 'text-amber-600' : 'text-emerald-600'}`}
                                onClick={() => handleToggleStatus(category.id, category.isActive)}
                                title={category.isActive ? "Deactivate" : "Activate"}
                              >
                                {category.isActive ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-600"
                              onClick={() => {
                                setSelectedCategory(category);
                                setIsPreviewOpen(true);
                              }}
                              title="Quick View"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {hasPermission("categories.edit") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600"
                                onClick={() => router.push(`/admin/products/categories/edit/${category.id}`)}
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                            )}
                            {hasPermission("categories.delete") && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                                onClick={() => handleDelete(category.id)}
                                title="Delete"
                                disabled={category._count?.products > 0}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QUICK VIEW DIALOG */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("admin.categories.details_title")}</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border">
                  {selectedCategory.image ? (
                    <img
                      src={`${BASE_URL}${selectedCategory.image}`}
                      alt={getL(selectedCategory.name, "en")}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{getL(selectedCategory.name, language)}</h3>
                  <div className="mt-1">{getStatusBadge(selectedCategory.isActive)}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 border-t pt-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">English Name</p>
                  <p className="text-sm">{getL(selectedCategory.name, "en") || "—"}</p>
                </div>
                <div>
                   <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">हिंदी नाम</p>
                  <p className="text-sm">{getL(selectedCategory.name, "hi") || "—"}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">मराठी नाव</p>
                  <p className="text-sm">{getL(selectedCategory.name, "mr") || "—"}</p>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-sm text-slate-500">Products in this category:</span>
                  <Badge className="bg-[#7b4623]">{selectedCategory._count?.products || 0}</Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
