"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/config/apiConfig";
import {
  fetchCategoryByIdAdmin,
  updateCategoryAdmin
} from "@/api/adminController";
import { useLanguage } from "@/context/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { parseLocalizedValue } from "@/utils/textUtils";

interface Category {
  id: string;
  name_en: string;
  name_hi: string | null;
  name_mr: string | null;
  description_en: string | null;
  description_hi: string | null;
  description_mr: string | null;
  image: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("en");

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>("");
  const [existingImage, setExistingImage] = useState<string>("");

  const [formData, setFormData] = useState({
    name_en: "",
    name_hi: "",
    name_mr: "",
    description_en: "",
    description_hi: "",
    description_mr: "",
    isActive: true,
    sortOrder: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (params.id) {
      loadCategory(params.id as string);
    }
  }, [params.id]);

  const loadCategory = async (id: string) => {
    setIsLoading(true);
    try {
      const data = await fetchCategoryByIdAdmin(id);

      setCategory(data);

      setFormData({
        name_en: data.name?.en || data.name_en || "",
        name_hi: data.name?.hi || data.name_hi || "",
        name_mr: data.name?.mr || data.name_mr || "",
        description_en: data.description?.en || data.description_en || "",
        description_hi: data.description?.hi || data.description_hi || "",
        description_mr: data.description?.mr || data.description_mr || "",
        isActive: data.isActive,
        sortOrder: data.sortOrder || 0,
      });

      // Set existing image if available
      if (data.image) {
        setExistingImage(data.image);
      }

    } catch (error: any) {
      console.error("Load Category Error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to load category";
      const errorDetails = error?.response?.data?.details;

      toast({
        title: t("admin.categories.error_loading") || "Error Loading Category",
        description: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
        variant: "destructive",
      });
      router.push("/admin/products/categories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Image size should be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setCategoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCategoryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setCategoryImage(null);
    setCategoryImagePreview("");
  };

  const removeExistingImage = () => {
    setExistingImage("");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name_en.trim()) {
      newErrors.name_en = t("admin.categories.name_required") || "Category name (English) is required";
    }

    if (formData.sortOrder < 0) {
      newErrors.sortOrder = "Sort order cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: t("admin.categories.validation_error") || "Validation Error",
        description: t("admin.categories.fill_required") || "Please fill all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add basic category data
      formDataToSend.append('name_en', formData.name_en);
      formDataToSend.append('name_hi', formData.name_hi);
      formDataToSend.append('name_mr', formData.name_mr);
      formDataToSend.append('description_en', formData.description_en);
      formDataToSend.append('description_hi', formData.description_hi);
      formDataToSend.append('description_mr', formData.description_mr);
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('sortOrder', formData.sortOrder.toString());

      // Add category image if new one is uploaded
      if (categoryImage) {
        formDataToSend.append('image', categoryImage);
      }

      // Add flag to remove existing image if needed
      if (!existingImage && !categoryImage && category?.image) {
        formDataToSend.append('removeImage', 'true');
      }

      await updateCategoryAdmin(params.id as string, formDataToSend);

      toast({
        title: t("admin.categories.success_update") || "Success",
        description: t("admin.categories.update_message") || "Category updated successfully",
      });

      router.push("/admin/products/categories");
    } catch (error: any) {
      console.error("Update Category Error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to update category";
      const errorDetails = error?.response?.data?.details;

      toast({
        title: t("admin.categories.error_update") || "Error Updating Category",
        description: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
         <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-slate-600">{t("admin.categories.loading_data")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
           onClick={() => router.back()}
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("admin.categories.back")}
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("admin.categories.edit_title")}</h1>
          <p className="text-muted-foreground">{t("admin.categories.edit_desc")}</p>
        </div>
      </div>

      <Card>
         <CardHeader>
          <CardTitle>{t("admin.categories.info")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="hi">हिन्दी (Hindi)</TabsTrigger>
                <TabsTrigger value="mr">मराठी (Marathi)</TabsTrigger>
              </TabsList>

              <TabsContent value="en" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name_en">{t("admin.categories.name")} *</Label>
                    <Input
                      id="name_en"
                      value={formData.name_en}
                      onChange={(e) => handleInputChange("name_en", e.target.value)}
                      placeholder="Enter category name in English"
                      className={errors.name_en ? "border-red-500" : ""}
                    />
                    {errors.name_en && <p className="text-sm text-red-500">{errors.name_en}</p>}
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="description_en">{t("admin.products.description")} (EN)</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => handleInputChange("description_en", e.target.value)}
                    placeholder="Enter category description in English"
                    rows={4}
                  />
                </div> */}
              </TabsContent>

              <TabsContent value="hi" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name_hi">श्रेणी का नाम</Label>
                    <Input
                      id="name_hi"
                      value={formData.name_hi}
                      onChange={(e) => handleInputChange("name_hi", e.target.value)}
                      placeholder="श्रेणी का नाम (हिन्दी)"
                    />
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="description_hi">{t("admin.products.description")} (HI)</Label>
                  <Textarea
                    id="description_hi"
                    value={formData.description_hi}
                    onChange={(e) => handleInputChange("description_hi", e.target.value)}
                    placeholder="श्रेणी का विवरण (हिन्दी)"
                    rows={4}
                  />
                </div> */}
              </TabsContent>

              <TabsContent value="mr" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name_mr">श्रेणीचे नाव</Label>
                    <Input
                      id="name_mr"
                      value={formData.name_mr}
                      onChange={(e) => handleInputChange("name_mr", e.target.value)}
                      placeholder="श्रेणीचे नाव (मराठी)"
                    />
                  </div>
                </div>

                {/* <div className="space-y-2">
                  <Label htmlFor="description_mr">{t("admin.products.description")} (MR)</Label>
                  <Textarea
                    id="description_mr"
                    value={formData.description_mr}
                    onChange={(e) => handleInputChange("description_mr", e.target.value)}
                    placeholder="श्रेणीचे वर्णन (मराठी)"
                    rows={4}
                  />
                </div> */}
              </TabsContent>
            </Tabs>

             <div className="space-y-2">
              <Label>{t("admin.categories.image")}</Label>
              <div className="flex items-center gap-4">
                {(categoryImagePreview || existingImage) ? (
                  <div className="relative">
                    <img
                      src={categoryImagePreview || (existingImage ? `${BASE_URL}${existingImage}` : '')}
                      alt="Category preview"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={categoryImagePreview ? removeImage : removeExistingImage}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                   <p className="text-xs text-slate-500 mt-1">
                    {t("admin.categories.file_hint") || "JPG, PNG, GIF up to 5MB"}
                  </p>
                  {existingImage && !categoryImagePreview && (
                    <p className="text-xs text-green-600 mt-1">
                      {t("admin.categories.current_image_loaded") || "Current image loaded"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                 onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
              <Label htmlFor="isActive">{t("admin.categories.active")}</Label>
              <p className="text-sm text-slate-500">
                {t("admin.categories.status_inactive_hint")}
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                 onClick={() => router.back()}
                disabled={isSubmitting}
              >
                {t("admin.categories.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                 {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t("admin.categories.saving")}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t("admin.categories.save_changes")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
