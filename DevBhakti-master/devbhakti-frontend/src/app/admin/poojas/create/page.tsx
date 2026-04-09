"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPoojaAdmin, fetchAllTemplesAdmin, fetchPoojaCategoriesAdmin } from "@/api/adminController";
import { useToast } from "@/hooks/use-toast";
import { PoojaForm } from "@/components/admin/poojas/PoojaForm";

export default function CreatePoojaPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [temples, setTemples] = useState<any[]>([]);
    const [availableCategories, setAvailableCategories] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadTemples();
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await fetchPoojaCategoriesAdmin({ status: "APPROVED" });
            if (res.success) {
                setAvailableCategories(res.data);
            }
        } catch (error) {
            console.error("Failed to load categories", error);
        }
    };

    const loadTemples = async () => {
        try {
            const data = await fetchAllTemplesAdmin();
            const actualTemples = data
                .filter((user: any) => user.temple)
                .map((user: any) => user.temple);

            setTemples(actualTemples);
        } catch (error) {
            toast({ title: "Error", description: "Failed to load temples", variant: "destructive" });
        }
    };

    const handleSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await createPoojaAdmin(formData);
            toast({ title: "Success", description: "Pooja created successfully", variant: "success" });
            router.push('/admin/poojas');
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.error || "Failed to create pooja",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add New Spiritual Service</h1>
                    <p className="text-slate-500 font-medium">Create a new pooja or ritual template for the platform.</p>
                </div>
            </div>

            <PoojaForm 
                mode="create"
                temples={temples}
                availableCategories={availableCategories}
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
            />
        </div>
    );
}
