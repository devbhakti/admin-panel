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
} from "lucide-react";
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

  const getLocalizedName = (item: any) => {
    if (!item) return "";
    return parseLocalizedValue(item.name, language);
  };


  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllCategoriesAdmin();
      setCategories(data);
    } catch (error: any) {
      console.error("Load Categories Error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load categories";
      const errorDetails = error?.response?.data?.details;

      toast({
        title: t("admin.categories.error_loading") || "Error Loading Categories",
        description: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t("admin.categories.delete_confirm"))) {
      try {
        await deleteCategoryAdmin(id);
        toast({ title: t("admin.categories.success_delete") || "Success", description: t("admin.categories.success_delete") || "Category deleted successfully" });
        loadCategories();
      } catch (error: any) {
        console.error("Delete Category Error:", error);
        const errorMessage = error?.response?.data?.message || error?.message || "Failed to delete category";
        const errorDetails = error?.response?.data?.details;

        toast({
          title: "Error Deleting Category",
          description: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
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
      console.error("Toggle Status Error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update status";
      const errorDetails = error?.response?.data?.details;

      toast({
        title: "Error Updating Status",
        description: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <div className={`inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md border text-xs font-medium whitespace-nowrap ${isActive
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-red-50 text-red-700 border-red-200"
        }`}>
        {isActive ? (
          <>
            <ToggleRight className="w-3 h-3" />
            <span>{t("admin.categories.active")}</span>
          </>
        ) : (
          <>
            <ToggleLeft className="w-3 h-3" />
            <span>{t("admin.categories.inactive")}</span>
          </>
        )}
      </div>
    );
  };

  const filteredCategories = categories.filter(category => {
    const s = searchTerm.toLowerCase();
    const matchesField = (field: any) => {
      if (!field) return false;
      if (typeof field === 'string') return field.toLowerCase().includes(s);
      if (typeof field === 'object') {
        return (field.en?.toLowerCase().includes(s) || 
                field.hi?.toLowerCase().includes(s) || 
                field.mr?.toLowerCase().includes(s));
      }
      return false;
    };

    return matchesField(category.name) || matchesField(category.description);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("admin.categories.title")}</h1>
          <p className="text-muted-foreground">{t("admin.categories.desc")}</p>
        </div>
        {hasPermission("categories.create") && (
          <Button
            onClick={() => router.push("/admin/products/categories/create")}
            className="bg-primary hover:bg-secondary/40"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("admin.categories.add_new")}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder={t("admin.categories.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="mt-2 text-slate-600">{t("admin.categories.loading_data")}</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{t("admin.categories.no_categories")}</h3>
              <p className="text-slate-600 mb-4">{t("admin.categories.get_started")}</p>
              <Button
                onClick={() => router.push("/admin/products/categories/create")}
                className="bg-primary hover:bg-secondary/40"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t("admin.categories.add_new")}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.categories.table_category")}</TableHead>
                  <TableHead>{t("admin.categories.table_products")}</TableHead>
                  <TableHead>{t("admin.categories.table_status")}</TableHead>
                  <TableHead className="text-right">{t("admin.categories.table_actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center overflow-hidden">
                          {category.image ? (
                            <img
                              src={`${BASE_URL}${category.image}`}
                              alt={getLocalizedName(category)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-slate-600" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{getLocalizedName(category)}</span>
                          <span className="text-xs text-slate-800">
                            Created {new Date(category.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {category._count.products} {t("admin.categories.table_products") === "admin.categories.table_products" ? "products" : t("admin.categories.table_products")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(category.isActive)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {hasPermission("categories.edit") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-8 w-8 ${category.isActive ? 'text-amber-600' : 'text-emerald-600'}`}
                            onClick={() => handleToggleStatus(category.id, category.isActive)}
                            title={category.isActive ? t("admin.categories.deactivate") : t("admin.categories.activate")}
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
                          title={t("admin.categories.view_details")}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {hasPermission("categories.edit") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            onClick={() => router.push(`/admin/products/categories/edit/${category.id}`)}
                            title={t("admin.categories.edit_category")}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        )}
                        {hasPermission("categories.delete") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(category.id)}
                            title={t("admin.categories.delete_category")}
                            disabled={category._count.products > 0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.categories.details_title")}</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                  {selectedCategory.image ? (
                    <img
                      src={`${BASE_URL}${selectedCategory.image}`}
                      alt={getLocalizedName(selectedCategory)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-10 h-10 text-slate-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{getLocalizedName(selectedCategory)}</h3>
                  <div className="mt-1">{getStatusBadge(selectedCategory.isActive)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">{t("admin.categories.category_id")}</label>
                  <p className="text-slate-900">{selectedCategory.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">{t("admin.categories.sort_order")}</label>
                  <p className="text-slate-900">{selectedCategory.sortOrder}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">{t("admin.categories.products_count")}</label>
                  <p className="text-slate-900">{selectedCategory._count.products}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">{t("admin.categories.table_status")}</label>
                  <div className="mt-1">{getStatusBadge(selectedCategory.isActive)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">{t("admin.categories.created_at")}</label>
                  <p className="text-slate-900">
                    {new Date(selectedCategory.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">{t("admin.categories.updated_at")}</label>
                  <p className="text-slate-900">
                    {new Date(selectedCategory.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
