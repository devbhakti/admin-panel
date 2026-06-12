"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createTempleAdmin, fetchAllPoojasAdmin, createPoojaAdmin } from "@/api/adminController";
import { useLanguage } from "@/context/LanguageContext";
import { TempleForm } from "@/components/admin/temples/TempleForm";
import { getDeduplicatedPoojas } from "@/utils/textUtils";

export default function CreateTemplePage() {
    const router = useRouter();
    const { toast } = useToast();
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [allPoojas, setAllPoojas] = useState<any[]>([]);

    useEffect(() => {
        loadPoojas();
    }, []);

    const loadPoojas = async () => {
        try {
            // Fetch ALL poojas from admin API
            const data = await fetchAllPoojasAdmin({});
            const rawPoojas = Array.isArray(data) ? data : (data.data || []);
            
            // Deduplicate by name, preferring Master poojas
            const deduplicated = getDeduplicatedPoojas(rawPoojas);
            // Filter to only master poojas (templates)
            const masterPoojas = deduplicated.filter(pooja => pooja.isMaster);
            setAllPoojas(masterPoojas);
        } catch (error) {
            console.error("Failed to load poojas");
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
                loadPoojas();
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
            await createTempleAdmin(formData);
            toast({ title: "Success", description: "Temple account and profile created successfully" });
            router.push('/admin/temples');
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create temple. Ensure unique email/phone.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-20 px-4 pt-10">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-serif">
                        {t('registration_form.header.title')}
                    </h1>
                    <p className="text-muted-foreground">{t('registration_form.header.description')}</p>
                </div>
            </div>

            <TempleForm
                mode="create"
                onSubmit={handleSubmit}
                isLoading={isLoading}
                allPoojas={allPoojas}
                onAddMasterPooja={handleAddMasterPooja}
            />
        </div>
    );
}
