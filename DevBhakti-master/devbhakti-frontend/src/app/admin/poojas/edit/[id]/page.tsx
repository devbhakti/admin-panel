"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updatePoojaAdmin, fetchAllTemplesAdmin, fetchPoojaCategoriesAdmin, fetchPoojaByIdAdmin } from "@/api/adminController";
import { useToast } from "@/hooks/use-toast";
import { PoojaForm } from "@/components/admin/poojas/PoojaForm";

export default function EditPoojaPage() {
    const router = useRouter();
    const params = useParams();
    const poojaId = params.id as string;
    const { toast } = useToast();
    
    const [temples, setTemples] = useState<any[]>([]);
    const [availableCategories, setAvailableCategories] = useState<any[]>([]);
    const [poojaData, setPoojaData] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, [poojaId]);

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const [templesRes, categoriesRes, poojaRes] = await Promise.all([
                fetchAllTemplesAdmin(),
                fetchPoojaCategoriesAdmin({ status: "APPROVED" }),
                fetchPoojaByIdAdmin(poojaId)
            ]);

            const actualTemples = templesRes
                .filter((user: any) => user.temple)
                .map((user: any) => user.temple);
            setTemples(actualTemples);

            if (categoriesRes.success) {
                setAvailableCategories(categoriesRes.data);
            }

            if (poojaRes.success && poojaRes.data) {
                setPoojaData(poojaRes.data);
                // Update breadcrumb with pooja name
                const poojaName = poojaRes.data.name?.en || poojaRes.data.name_en || "Edit Pooja";
                window.dispatchEvent(new CustomEvent('updateBreadcrumb', { detail: `Edit: ${poojaName}` }));
            } else {
                toast({ title: "Error", description: "Pooja not found", variant: "destructive" });
                router.push('/admin/poojas');
            }
        } catch (error) {
            console.error('Load initial data error:', error);
            toast({ title: "Error", description: "Failed to load pooja data", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await updatePoojaAdmin(poojaId, formData);
            toast({ title: "Success", description: "Pooja updated successfully", variant: "success" });
            router.push('/admin/poojas');
        } catch (error) {
            toast({ title: "Error", description: "Failed to update pooja", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Pooja</h1>
                    <p className="text-slate-500 font-medium">Modify existing spiritual service details and localization.</p>
                </div>
            </div>

            <PoojaForm 
                mode="edit"
                initialData={poojaData}
                temples={temples}
                availableCategories={availableCategories}
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
            />
        </div>
    );
}
