"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    Plus,
    Edit,
    Trash2,
    Package,
    Eye,
    MoreVertical,
    ShoppingBag,
    Layers,
    Download,
    Upload,
    Loader2,
    FileText
} from "lucide-react";
import * as XLSX from 'xlsx';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { fetchMyProducts, deleteMyProduct, createMyProduct, fetchCategories } from "@/api/templeAdminController";
import { useToast } from "@/hooks/use-toast";
import { BASE_URL } from "@/config/apiConfig";
import { parseLocalizedValue } from '@/utils/textUtils';



export default function TempleProductsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [isViewOpen, setIsViewOpen] = useState(false);

    // Stats
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'approved').length;
    const pendingProducts = products.filter(p => p.status === 'pending').length;

    // Calculate out of stock
    const outOfStockCount = products.filter(p => {
        const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
        return totalStock === 0;
    }).length;

    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await fetchCategories();
            setCategories(data || []);
        } catch (error) {
            console.error("Load Categories Error:", error);
        }
    };

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const data = await fetchMyProducts();
            if (data.success) {
                setProducts(data.data.products);
            }
        } catch (error) {
            console.error("Load Products Error:", error);
            toast({ title: "Error", description: "Failed to load products", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        try {
            await deleteMyProduct(id);
            toast({ title: "Success", description: "Product deleted successfully" });
            loadProducts();
        } catch (error) {
            console.error("Delete Error:", error);
            toast({ title: "Error", description: "Failed to delete product", variant: "destructive" });
        }
    };

    const handleView = (product: any) => {
        router.push(`/temples/dashboard/products/${product.id}/view`);
    };

    const filteredProducts = products.filter((p) =>
        parseLocalizedValue(p.name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        parseLocalizedValue(p.categoryObj?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- BULK MANAGEMENT ---
    const downloadTemplate = () => {
        const template = [
            {
                "Name_EN": "Sandalwood Mala",
                "Name_HI": "चंदन की माला",
                "Name_MR": "चंदन माळ",
                "Category": categories[0]?.name || "General",
                "Short_Description_EN": "Pure sandalwood beads.",
                "Short_Description_HI": "शुद्ध चंदन के मोती।",
                "Short_Description_MR": "शुद्ध चंदनाचे मणी.",
                "Highlights_EN": "108 beads, Fragrant",
                "Highlights_HI": "108 मोती, सुगंधित",
                "Highlights_MR": "108 मणी, सुवासिक",
                "Origin": "India",
                "Base_Rating": 4.5,
                "Weight": 0.1,
                "Length": 10,
                "Width": 10,
                "Height": 2,
                "Variants_JSON": JSON.stringify([{ name_en: "Standard", name_hi: "मानक", name_mr: "प्रमाणित", price: 350, stock: 100 }])
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Product Template");
        XLSX.writeFile(wb, "Temple_Product_Import_Template.xlsx");
    };

    const handleExportExcel = () => {
        const exportData = products.map(p => ({
            "ID": p.id,
            "Name_EN": p.name?.en || p.name || "",
            "Name_HI": p.name?.hi || "",
            "Name_MR": p.name?.mr || "",
            "Category": p.categoryObj?.name || "",
            "Status": p.status,
            "Price_Starting": p.variants?.[0]?.price || 0,
            "Total_Stock": p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0,
            "Short_Description_EN": p.description?.en || p.description || "",
            "Highlights_EN": p.highlights?.en || p.highlights || "",
            "Origin": p.origin || "India",
            "Base_Rating": p.rating || 4.5,
            "Weight": p.weight || 0,
            "Variants_Data": JSON.stringify(p.variants || [])
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "My Products");
        XLSX.writeFile(wb, `My_Products_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
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

                toast({ title: "Import Started", description: `Importing ${data.length} products...`, variant: "success" });

                let successCount = 0;
                let failCount = 0;
                const errors: string[] = [];

                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
                    const rowNum = i + 2;
                    try {
                        if (!row.Name_EN) throw new Error("Product Name (EN) is required");
                        
                        // Find category ID
                        const categoryName = String(row.Category || "").trim();
                        const foundCategory = categories.find(c => 
                            c.name.toLowerCase() === categoryName.toLowerCase() || 
                            c.id === categoryName
                        );
                        
                        if (!foundCategory && row.Category) {
                            throw new Error(`Category '${categoryName}' not found`);
                        }

                        const formDataToSend = new FormData();
                        formDataToSend.append('name_en', String(row.Name_EN || "").trim());
                        formDataToSend.append('name_hi', String(row.Name_HI || "").trim());
                        formDataToSend.append('name_mr', String(row.Name_MR || "").trim());
                        formDataToSend.append('description_en', String(row.Short_Description_EN || "").trim());
                        formDataToSend.append('description_hi', String(row.Short_Description_HI || "").trim());
                        formDataToSend.append('description_mr', String(row.Short_Description_MR || "").trim());
                        formDataToSend.append('category', foundCategory?.id || categories[0]?.id || "");
                        formDataToSend.append('highlights_en', String(row.Highlights_EN || "").trim());
                        formDataToSend.append('highlights_hi', String(row.Highlights_HI || "").trim());
                        formDataToSend.append('highlights_mr', String(row.Highlights_MR || "").trim());
                        formDataToSend.append('origin', String(row.Origin || "India").trim());
                        formDataToSend.append('rating', String(row.Base_Rating || "4.5"));
                        formDataToSend.append('weight', String(row.Weight || "0.5"));
                        formDataToSend.append('length', String(row.Length || "10"));
                        formDataToSend.append('width', String(row.Width || "10"));
                        formDataToSend.append('height', String(row.Height || "10"));
                        formDataToSend.append('shippingInfo', "Ships in 24-48 Hours");

                        // Variants handling
                        let variantsArray = [];
                        try {
                            if (row.Variants_JSON) {
                                variantsArray = JSON.parse(row.Variants_JSON);
                            } else {
                                variantsArray = [{
                                    name_en: "Standard",
                                    name_hi: "मानक",
                                    name_mr: "प्रमाणित",
                                    price: Number(row.Price_Starting || 0),
                                    stock: Number(row.Total_Stock || 0)
                                }];
                            }
                        } catch (e) {
                            throw new Error("Invalid Variants_JSON format");
                        }
                        
                        formDataToSend.append('variants', JSON.stringify(variantsArray));

                        await createMyProduct(formDataToSend);
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
                        description: `Successfully imported ${successCount} products.`
                    });
                }
                loadProducts();
            } catch (error) {
                toast({ title: "Import Failed", description: "Failed to process Excel file", variant: "destructive" });
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600">Approved</Badge>;
            case 'pending':
                return <Badge className="bg-amber-500 hover:bg-amber-600">Pending</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Product Management
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm md:text-base">
                        Manage your temple's marketplace inventory, track stock, and organize variants.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                    <Button
                        onClick={downloadTemplate}
                        variant="outline"
                        className="flex-1 md:flex-initial border-[#7b4623]/20 hover:bg-[#7b4623]/5"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Template
                    </Button>
                    <div className="relative flex-1 md:flex-initial">
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            className="hidden"
                            id="import-excel"
                            onChange={handleImportExcel}
                        />
                        <Button
                            onClick={() => document.getElementById('import-excel')?.click()}
                            variant="outline"
                            className="w-full border-[#7b4623]/20 hover:bg-[#7b4623]/5"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                        </Button>
                    </div>
                    <Button
                        onClick={handleExportExcel}
                        variant="outline"
                        className="flex-1 md:flex-initial border-[#7b4623]/20 hover:bg-[#7b4623]/5"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        onClick={() => router.push('/temples/dashboard/products/create')}
                        className="bg-[#7b4623] hover:bg-[#5d351a] text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 flex-1 md:flex-initial"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Product
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Products", value: totalProducts, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active", value: activeProducts, icon: Package, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Pending", value: pendingProducts, icon: Layers, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Out of Stock", value: outOfStockCount, icon: Trash2, color: "text-red-600", bg: "bg-red-50" },
                ].map((stat) => (
                    <Card key={stat.label} className="border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search products by name or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                </div>
                {/* Future: Add more sophisticated filters here */}
            </div>

            {/* Products Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center shadow-sm mb-4">
                        <Package className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900">No products found</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                        Get started by adding your first product to the marketplace.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-6"
                        onClick={() => router.push('/temples/dashboard/products/create')}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredProducts.map((product, index) => {
                            const totalStock = product.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
                            const minPrice = product.variants?.length > 0
                                ? Math.min(...product.variants.map((v: any) => v.price))
                                : 0;
                            const variantsCount = product.variants?.length || 0;

                            return (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <Card className="group h-full flex flex-col overflow-hidden border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                                        {/* Image Area */}
                                        <div className="relative aspect-video bg-slate-50 overflow-hidden cursor-pointer" onClick={() => handleView(product)}>
                                            {product.image ? (
                                                <img
                                                    src={`${BASE_URL}${product.image}`}
                                                    alt={parseLocalizedValue(product.name)}
                                                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-12 h-12 text-slate-300" />
                                                </div>
                                            )}

                                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                                {getStatusBadge(product.status)}
                                            </div>

                                            <div className="absolute top-3 left-3">
                                                <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm text-xs font-semibold">
                                                    {variantsCount} {variantsCount === 1 ? 'Variant' : 'Variants'}
                                                </Badge>
                                            </div>

                                            {/* Hover Qucik Actions */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                                <Button
                                                    size="sm"
                                                    className="bg-white text-slate-900 hover:bg-white/90"
                                                    onClick={(e) => { e.stopPropagation(); handleView(product); }}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-white text-slate-900 hover:bg-white/90"
                                                    onClick={(e) => { e.stopPropagation(); router.push(`/temples/dashboard/products/edit/${product.id}`); }}
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <CardContent className="p-4 flex-1">
                                            <div className="mb-2">
                                                <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded-full">
                                                {parseLocalizedValue(product.categoryObj?.name || "General")}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1" title={parseLocalizedValue(product.name)}>
                                            {parseLocalizedValue(product.name)}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-3 h-10">
                                            {parseLocalizedValue(product.description)}
                                        </p>

                                            <Separator className="my-3" />

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-slate-500">Starting from</p>
                                                    <p className="text-lg font-bold text-slate-900">₹{minPrice}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-slate-500">Total Stock</p>
                                                    <p className={`font-medium ${totalStock === 0 ? "text-red-600" : "text-emerald-600"}`}>
                                                        {totalStock} units
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>

                                        {/* Footer Actions (Visible on mobile/tap) */}
                                        <div className="md:hidden p-3 border-t bg-slate-50 flex justify-between gap-2">
                                            <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleView(product)}>View</Button>
                                            <Button variant="ghost" size="sm" className="flex-1" onClick={() => router.push(`/temples/dashboard/products/edit/${product.id}`)}>Edit</Button>
                                            <Button variant="ghost" size="sm" className="flex-1 text-red-600" onClick={() => handleDelete(product.id)}>Delete</Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

        </div>
    );
}
