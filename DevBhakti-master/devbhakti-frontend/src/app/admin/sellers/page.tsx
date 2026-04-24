"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Plus,
    Eye,
    Edit2,
    Trash2,
    Store,
    CheckCircle,
    XCircle,
    Clock,
    Mail,
    Phone,
    Calendar,
    Download,
    Upload,
    Loader2
} from "lucide-react";
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
    deleteSellerAdmin,
    toggleSellerStatusAdmin,
    fetchAllSellersAdmin,
    createSellerAdmin
} from "@/api/adminController";
import { parseLocalizedValue } from "@/utils/textUtils";

export default function SellersManagementPage() {
    const router = useRouter();
    const [sellers, setSellers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSeller, setSelectedSeller] = useState<any>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadSellers();
    }, []);

    const loadSellers = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllSellersAdmin();
            const localizedSellers = (data || []).map((s: any) => ({
                ...s,
                storeName: parseLocalizedValue(s.storeName),
                address: parseLocalizedValue(s.address)
            }));
            setSellers(localizedSellers);
        } catch (error: any) {
            console.error("Load Sellers Error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to load sellers",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (sellerId: string) => {
        // Find seller to get stats
        const seller = sellers.find(s => s.id === sellerId);
        if (!seller) return;

        // Show warning toast instead of popup
        toast({
            title: " Seller Deletion Warning",
            description: `This will permanently delete ${seller.storeName} and all associated data including ${seller.totalProducts || 0} products and ${seller.totalOrders || 0} orders. Click delete again to confirm.`,
            variant: "destructive",
            action: (
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                        try {
                            const response = await deleteSellerAdmin(sellerId);

                            // Show detailed success message
                            const deletedData = response?.deletedData;
                            let successMessage = "Seller deleted successfully";

                            if (deletedData) {
                                successMessage = `Deleted: ${deletedData.seller}, ${deletedData.productsDeleted} products, ${deletedData.ordersDeleted} orders, ${deletedData.ledgerEntriesDeleted} ledger entries, ${deletedData.withdrawalsDeleted} withdrawal requests`;
                            }

                            toast({
                                title: " Seller Deleted",
                                description: successMessage
                            });
                            loadSellers(); // Refresh list
                        } catch (error: any) {
                            toast({
                                title: "Error",
                                description: error.message || "Failed to delete seller",
                                variant: "destructive",
                            });
                        }
                    }}
                >
                    Delete
                </Button>
            ),
        });
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            await toggleSellerStatusAdmin(id, newStatus);
            toast({ title: "Success", description: `Seller status updated to ${newStatus}` });
            loadSellers();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update status",
                variant: "destructive",
            });
        }
    };

    // --- BULK MANAGEMENT ---
    const downloadTemplate = () => {
        const template = [
            {
                "Store_Name": "Divine Items Store",
                "Seller_Full_Name": "Rajesh Kumar",
                "Email": "rajesh@example.com",
                "Phone": "9876543210",
                "Physical_Address": "123 Temple Road, Ayodhya, UP",
                "Status": "active"
            }
        ];
        const ws = XLSX.utils.json_to_sheet(template);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Seller Template");
        XLSX.writeFile(wb, "Sellers_Import_Template.xlsx");
    };

    const handleExportExcel = () => {
        const exportData = sellers.map(s => ({
            "ID": s.id,
            "Store_Name": s.storeName,
            "Seller_Full_Name": s.name,
            "Email": s.email,
            "Phone": s.phone,
            "Physical_Address": s.address,
            "Status": s.status,
            "Join_Date": new Date(s.joinDate).toLocaleDateString(),
            "Total_Products": s.totalProducts || 0
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sellers");
        XLSX.writeFile(wb, `Sellers_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
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

                toast({ title: "Import Started", description: `Importing ${data.length} sellers...`, variant: "success" });

                let successCount = 0;
                let failCount = 0;
                const errors: string[] = [];

                for (let i = 0; i < data.length; i++) {
                    const row = data[i];
                    const rowNum = i + 2;
                    try {
                        const payload = {
                            storeName: String(row.Store_Name || "").trim(),
                            sellerName: String(row.Seller_Full_Name || "").trim(),
                            email: String(row.Email || "").trim(),
                            phone: String(row.Phone || "").trim(),
                            address: String(row.Physical_Address || "").trim(),
                            status: String(row.Status || "active").toLowerCase(),
                            commissionSlabs: []
                        };

                        if (!payload.storeName) throw new Error("Store Name is missing");
                        if (!payload.email) throw new Error("Email is missing");
                        if (!payload.phone) throw new Error("Phone is missing");

                        await createSellerAdmin(payload);
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
                        description: `Success: ${successCount}, Failed: ${failCount}. Check console for details or fix the first few errors: ${errors.slice(0, 3).join(", ")}${errors.length > 3 ? "..." : ""}`,
                        variant: "destructive"
                    });
                } else {
                    toast({
                        title: "Import Successful",
                        description: `Successfully imported ${successCount} sellers.`,
                    });
                }
                loadSellers();
            } catch (error) {
                toast({ title: "Import Failed", description: "Failed to process Excel file", variant: "destructive" });
            }
        };
        reader.readAsBinaryString(file);
        e.target.value = '';
    };

    const filteredSellers = sellers.filter(
        (seller) =>
            seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.storeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return (
                    <div className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 text-xs font-medium whitespace-nowrap">
                        <CheckCircle className="w-3 h-3" />
                        <span>Active</span>
                    </div>
                );
            case "pending":
                return (
                    <div className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-md border border-amber-200 text-xs font-medium whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                    </div>
                );
            default:
                return (
                    <div className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-md border border-red-200 text-xs font-medium whitespace-nowrap">
                        <XCircle className="w-3 h-3" />
                        <span>Inactive</span>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Seller Management</h1>
                    <p className="text-muted-foreground">Manage your marketplace sellers and their applications.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" onClick={downloadTemplate} className="text-xs h-9">
                        <Download className="w-4 h-4 mr-1.5" />
                        Template
                    </Button>

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
                    </div>

                    <Button variant="outline" onClick={handleExportExcel} className="text-xs h-9">
                        <Download className="w-4 h-4 mr-1.5" />
                        Export All
                    </Button>

                    <Button onClick={() => router.push('/admin/sellers/create')} className="bg-[#7b4623] hover:bg-[#5d351a] h-9">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Seller
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, store name, or email..."
                        className="pl-10 h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead>Seller & Store</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Join Date</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        <span>Loading sellers...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredSellers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                    No sellers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredSellers.map((seller) => (
                                <TableRow key={seller.id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Store className="w-5 h-5" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{seller.storeName}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {seller.name}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Mail className="w-3 h-3" />
                                                <span>{seller.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <Phone className="w-3 h-3" />
                                                <span>{seller.phone || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>{new Date(seller.joinDate).toLocaleDateString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-medium">
                                            {seller.totalProducts} Products
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {getStatusBadge(seller.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-8 w-8 ${seller.status === 'active' ? 'text-emerald-600' : 'text-slate-400'}`}
                                                onClick={() => handleToggleStatus(seller.id, seller.status)}
                                                title={seller.status === 'active' ? "Deactivate Seller" : "Activate Seller"}
                                            >
                                                {seller.status === 'active' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-600"
                                                onClick={() => router.push(`/admin/sellers/view/${seller.id}`)}
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-600"
                                                onClick={() => router.push(`/admin/sellers/edit/${seller.id}`)}
                                                title="Edit Seller"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive"
                                                onClick={() => handleDelete(seller.id)}
                                                title="Delete Seller"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                {/* Keeping old dialog format but reusing new selectedSeller state, although Eye button now redirects. 
            Can optionally remove this part if we fully switched to new page. 
            Keeping it for backup/consistency with original code structure. */}
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Seller Details</DialogTitle>
                    </DialogHeader>
                    {selectedSeller && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Store className="w-10 h-10" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-slate-900">{selectedSeller.storeName}</h3>
                                    <p className="text-slate-600">{selectedSeller.name}</p>
                                    <div className="mt-1">{getStatusBadge(selectedSeller.status)}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Seller ID</label>
                                    <p className="text-slate-900">{selectedSeller.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Join Date</label>
                                    <p className="text-slate-900">{new Date(selectedSeller.joinDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                                    <p className="text-slate-900">{selectedSeller.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                    <p className="text-slate-900">{selectedSeller.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 mb-2 block">Store Address</label>
                                <p className="text-slate-900 mt-1 p-3 bg-slate-50 rounded-lg border border-slate-100 italic">
                                    {selectedSeller.address || 'No address provided'}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
