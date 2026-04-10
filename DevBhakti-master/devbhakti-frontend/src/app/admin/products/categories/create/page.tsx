"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createCategoryAdmin } from "@/api/adminController";
import { useLanguage } from "@/context/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CreateCategoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("en");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryImage, setCategoryImage] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState<string>("");

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

      // Add category image if exists
      if (categoryImage) {
        formDataToSend.append('image', categoryImage);
      }

      await createCategoryAdmin(formDataToSend);

      toast({
        title: t("admin.categories.success_create") || "Success",
        description: t("admin.categories.success_message") || "Category created successfully",
      });

      router.push("/admin/products/categories");
    } catch (error: any) {
      console.error("Create Category Error:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create category";
      const errorDetails = error?.response?.data?.details;

      toast({
        title: t("admin.categories.error_create") || "Error Creating Category",
        description: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("admin.categories.back") || "Back"}
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("admin.categories.create_title")}</h1>
          <p className="text-muted-foreground">{t("admin.categories.create_desc")}</p>
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
                {categoryImagePreview ? (
                  <div className="relative">
                    <img
                      src={categoryImagePreview}
                      alt="Category preview"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={removeImage}
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
                  <p className="text-[10px] font-semibold text-primary mt-1">{t("admin.categories.rec_size") || "Recommended: 800x800 px (Square)"}</p>

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
                className="bg-primary hover:bg-secondary/40"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t("admin.categories.creating")}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t("admin.categories.add_new")}
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
