"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Package,
    Eye,
    ShoppingBag,
    Layers,
    ArrowUpDown,
    Download
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { fetchSellerProducts, deleteSellerProduct } from "@/api/sellerController";
import { API_URL, BASE_URL } from "@/config/apiConfig";
import { parseLocalizedValue } from "@/utils/textUtils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";



export default function SellerProductsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [products, setProducts] = useState<any[]>([]);
    const [allProductsForStats, setAllProductsForStats] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        loadProducts();
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        loadAllProductsForStats();
    }, []);

    const loadProducts = async () => {
        try {
            setIsLoading(true);
            const response = await fetchSellerProducts({ 
                search: searchQuery, 
                status: statusFilter === "all" ? undefined : statusFilter 
            });
            if (response.success) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error("Load Products Error:", error);
            toast({
                title: "Error",
                description: "Failed to load products.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadAllProductsForStats = async () => {
        try {
            const response = await fetchSellerProducts({ limit: 1000 }); // Get all for simple stats
            if (response.success) {
                setAllProductsForStats(response.data.products);
            }
        } catch (error) {
            console.error("Load Stats Error:", error);
        }
    };

    // Stats
    // Stats from total list
    const totalProducts = allProductsForStats.length;
    const activeProducts = allProductsForStats.filter(p => p.status === 'approved' || p.status === 'active').length;
    const pendingProducts = allProductsForStats.filter(p => p.status === 'pending').length;
    const outOfStockCount = allProductsForStats.filter(p => {
        const totalStock = p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) || 0;
        return totalStock === 0;
    }).length;

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await deleteSellerProduct(id);
            if (response.success) {
                toast({ title: "Success", description: "Product deleted successfully" });
                loadProducts();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to delete product",
                variant: "destructive"
            });
        }
    };

    const handleView = (product: any) => {
        router.push(`/seller/dashboard/products/${product.id}/view`);
    };

    const filteredProducts = products;

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-emerald-500 hover:bg-emerald-600 border-0 shadow-sm">Approved</Badge>;
            case 'pending':
                return <Badge className="bg-amber-500 hover:bg-amber-600 border-0 shadow-sm">Pending</Badge>;
            case 'rejected':
                return <Badge className="bg-red-500 hover:bg-red-600 border-0 shadow-sm">Rejected</Badge>;
            default:
                return <Badge variant="secondary">Unknown</Badge>;
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                        My Products
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base">
                        Manage your store's catalog, inventory, and product details.
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* <Button variant="outline" className="hidden md:flex gap-2 rounded-xl">
                        <Download className="w-4 h-4" />
                        Export
                    </Button> */}
                    <Button
                        onClick={() => router.push('/seller/dashboard/products/create')}
                        className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl px-6"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Product
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: "Total Products", value: totalProducts, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50", filter: "all" },
                    { label: "Active", value: activeProducts, icon: Package, color: "text-emerald-600", bg: "bg-emerald-50", filter: "approved" },
                    { label: "Pending", value: pendingProducts, icon: Layers, color: "text-amber-600", bg: "bg-amber-50", filter: "pending" },
                    { label: "Out of Stock", value: outOfStockCount, icon: Trash2, color: "text-red-600", bg: "bg-red-50", filter: "out_of_stock" },
                ].map((stat) => (
                    <Card 
                        key={stat.label} 
                        onClick={() => setStatusFilter(stat.filter)}
                        className={`border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white overflow-hidden group cursor-pointer ${statusFilter === stat.filter ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    >
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className={`p-4 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search products by name, category, or SKU..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-12 h-12 bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all rounded-xl text-slate-900"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-12 w-[180px] rounded-xl bg-slate-50 border-0 focus:ring-2 focus:ring-primary/20">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <SelectValue placeholder="Filter Status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="all">All Products</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button variant="outline" className="h-12 px-6 rounded-xl gap-2 border-slate-200">
                        <ArrowUpDown className="w-4 h-4" />
                        Sort: Newest
                    </Button>
                </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-[400px] bg-white rounded-3xl animate-pulse border border-slate-100 shadow-sm" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                    <div className="bg-slate-50 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
                        <Package className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">No products found</h3>
                    <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                        We couldn't find any products matching your search. Try adjusting your filters or add a new product.
                    </p>
                    <Button
                        className="mt-8 bg-primary"
                        onClick={() => router.push('/seller/dashboard/products/create')}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Product
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
                                    <Card className="group h-full flex flex-col overflow-hidden border-0 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 rounded-3xl bg-white">
                                        {/* Image Area */}
                                        <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden group/img shrink-0">
                                            {product.image ? (
                                                <img
                                                    src={`${BASE_URL}${product.image}`}
                                                    alt={parseLocalizedValue(product.name, 'en')}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                                                    <div className="text-center">
                                                        <Package className="w-12 h-12 text-slate-200 mx-auto transition-transform duration-500 group-hover/img:scale-110" />
                                                        <p className="text-xs text-slate-400 mt-2 font-medium">No Image</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                                                {getStatusBadge(product.status)}
                                            </div>

                                            <div className="absolute top-4 right-4 z-10">
                                                <Badge variant="secondary" className="bg-white/95 backdrop-blur-md shadow-sm text-[10px] font-bold uppercase tracking-widest text-slate-600 px-2 py-1">
                                                    {variantsCount} Variants
                                                </Badge>
                                            </div>

                                            {/* Hover Actions */}
                                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                                <Button
                                                    size="sm"
                                                    className="bg-white text-slate-900 hover:bg-slate-50 rounded-xl"
                                                    onClick={() => handleView(product)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-primary text-white hover:bg-primary/90 rounded-xl"
                                                    onClick={() => router.push(`/seller/dashboard/products/edit/${product.id}`)}
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <CardContent className="p-5 flex-1 flex flex-col">
                                            <div className="mb-2">
                                                <span className="text-[10px] uppercase tracking-widest font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                    {parseLocalizedValue(product.categoryObj?.name, 'en') || "General"}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-900 line-clamp-1 mb-1 group-hover:text-primary transition-colors" title={parseLocalizedValue(product.name, 'en')}>
                                                {parseLocalizedValue(product.name, 'en')}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10 leading-relaxed">
                                                {parseLocalizedValue(product.description, 'en')}
                                            </p>

                                            <div className="mt-auto">
                                                <Separator className="mb-4 bg-slate-100" />
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Starts from</p>
                                                        <p className="text-xl font-black text-slate-900">₹{minPrice}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Inventory</p>
                                                        <p className={`text-sm font-bold ${totalStock === 0 ? "text-red-500" : "text-emerald-500"}`}>
                                                            {totalStock === 0 ? 'Out of Stock' : `${totalStock} Units`}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Dialog removed – View navigates to dedicated page */}
        </div>
    );
}
