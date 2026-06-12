"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
    updateTempleAdmin, 
    fetchAllTemplesAdmin, 
    fetchAllPoojasAdmin, 
    createPoojaAdmin,
    fetchCommissionSlabsAdmin,
    fetchTempleByIdAdmin
} from "@/api/adminController";
import { TempleForm } from "@/components/admin/temples/TempleForm";
import { getDeduplicatedPoojas, parseLocalizedValue } from "@/utils/textUtils";

export default function EditTemplePage() {
    const router = useRouter();
    const params = useParams();
    const instId = params.id as string;
    const { toast } = useToast();
    
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [templeData, setTempleData] = useState<any>(null);
    const [allPoojas, setAllPoojas] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, [instId]);

    const loadData = async () => {
        setIsFetching(true);
        try {
            const [poojasResponse, templeRes] = await Promise.all([
                fetchAllPoojasAdmin({}),
                fetchTempleByIdAdmin(instId)
            ]);
            const rawPoojas = Array.isArray(poojasResponse) ? poojasResponse : (poojasResponse.data || []);
            const allAvailablePoojas = getDeduplicatedPoojas(rawPoojas);
            // Filter to only master poojas (templates)
            const masterPoojas = allAvailablePoojas.filter(pooja => pooja.isMaster);
            
            if (templeRes.success && templeRes.data) {
                // We only want to show master poojas, so we ignore temple-specific poojas that are not master.
                setAllPoojas(masterPoojas);
                
                console.log('[EditTemple] Raw temple data loaded:', templeRes.data.temple?.name);
                setTempleData(templeRes.data);
                // Update breadcrumb
                const nameStr = templeRes.data.temple?.name;
                let displayName = "Edit Temple";
                if (typeof nameStr === 'string') {
                    if (nameStr.startsWith('{')) {
                        try { displayName = `Edit: ${JSON.parse(nameStr).en || JSON.parse(nameStr).hi}`; } catch(e){}
                    } else {
                        displayName = `Edit: ${nameStr}`;
                    }
                }
                window.dispatchEvent(new CustomEvent('updateBreadcrumb', { detail: displayName }));
            } else {
                toast({ title: "Error", description: "Temple not found", variant: "destructive" });
                router.push('/admin/temples');
            }
        } catch (error) {
            console.error("Final load error:", error);
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
        } finally {
            setIsFetching(false);
        }
    };

    const handleAddMasterPooja = async (name: string) => {
        try {
            const fd = new FormData();
            fd.append("name", name);
            fd.append("isMaster", "true");
            fd.append("category", "General");
            fd.append("price", "0");
            fd.append("status", "APPROVED");

            const res = await createPoojaAdmin(fd);
            if (res.success || res.id) {
                toast({ title: "Success", description: "New pooja added to master list" });
                const poojasResponse = await fetchAllPoojasAdmin({});
                const rawPoojas = Array.isArray(poojasResponse) ? poojasResponse : (poojasResponse.data || []);
                const deduplicated = getDeduplicatedPoojas(rawPoojas);
                const masterPoojas = deduplicated.filter(pooja => pooja.isMaster);
                setAllPoojas(masterPoojas);
                return res.data?.id || res.id;
            }
            return null;
        } catch (error) {
            toast({ title: "Error", description: "Failed to create new pooja", variant: "destructive" });
            return null;
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setIsLoading(true);
        try {
            // In a real scenario, we might need to handle commission slabs here too if they are part of the form
            // Or we could have included them in the TempleForm.
            // For now, let's assume the TempleForm handles the core data.
            
            await updateTempleAdmin(instId, formData);
            toast({ title: "Success", description: "Temple updated successfully" });
            router.push('/admin/temples');
        } catch (error: any) {
            console.error("Update error detail:", error.response?.data);
            const errMsg = error.response?.data?.error || error.message || "Failed to update temple";
            toast({
                title: "Update Failed",
                description: errMsg,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 pt-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">Edit Temple</h1>
                    <p className="text-muted-foreground">Modify administrator account and temple profile details.</p>
                </div>
            </div>

            <TempleForm
                mode="edit"
                initialData={templeData}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                allPoojas={allPoojas}
                onAddMasterPooja={handleAddMasterPooja}
            />
        </div>
    );
}
