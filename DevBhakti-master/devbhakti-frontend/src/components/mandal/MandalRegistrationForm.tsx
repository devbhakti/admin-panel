"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
    X,
    User,
    Building2,
    MapPin,
    Phone,
    Globe,
    Check,
    ArrowRight,
    Sparkles,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitMandalRegistration } from "@/api/publicController";

export default function MandalRegistrationForm({ onClose }: { onClose?: () => void }) {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        presidentName: "",
        contactNumber: "",
        email: "",
        name_en: "",
        name_hi: "",
        name_mr: "",
        mandalType: "",
        description_en: "",
        description_hi: "",
        description_mr: "",
        presiding_deity: "",
        festivals: "",
        address: "",
        city: "",
        state: "",
        pinCode: "",
        registrationNumber: "",
        verificationDocUrl: "",
        presidentIdDocUrl: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const payload = {
                ...formData,
                name: formData.name_en, // fallback
                description: formData.description_en, // fallback
            };
            const res = await submitMandalRegistration(payload);
            if (res.success) {
                setShowSuccess(true);
            } else {
                setError(res.message || "Failed to submit registration.");
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="p-12 text-center space-y-6 bg-white rounded-[2rem] w-full max-w-4xl mx-auto shadow-2xl">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200">
                    <Check className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-slate-900">{t("registerMandal.success_title")}</h2>
                <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
                    {t("registerMandal.success_desc")}
                </p>
                <Button onClick={() => window.location.href = "/"} className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-full shadow-lg">
                    {t("registerMandal.btn_return_home")}
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto bg-white rounded-[2rem] overflow-hidden shadow-2xl relative border border-slate-100 font-sans flex flex-col max-h-[90vh]">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#88542b] to-[#88542b] p-8 md:p-10 text-white relative shrink-0">
                <div className="absolute inset-0 opacity-10 pointer-events-none" />
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">{t("registerMandal.page_title")}</h2>
                        <p className="text-orange-50 font-medium">{t("registerMandal.page_subtitle")}</p>
                    </div>
                    {onClose && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full h-10 w-10 shrink-0"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    )}
                </div>
            </div>

            <form
                id="mandal-reg-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 custom-scrollbar"
            >
                {/* 1. Account Identity */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <User className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{t("registerMandal.president_name")}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.president_name")}</label>
                            <Input
                                name="presidentName"
                                value={formData.presidentName}
                                onChange={handleChange}
                                placeholder={t("registerMandal.president_name")}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.contact_number")}</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold border-r pr-2 border-slate-300">
                                    +91
                                </div>
                                <Input
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    type="tel"
                                    maxLength={10}
                                    onChange={handleChange}
                                    placeholder={t("registerMandal.contact_number")}
                                    className="h-12 pl-14 border-slate-200 focus:border-orange-500 rounded-xl"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.email")}</label>
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t("registerMandal.email")}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                            />
                        </div>
                    </div>
                </section>

                {/* 2. Mandal Profile */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{t("registerMandal.section_basic")}</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.name_en")}</label>
                                <Input
                                    name="name_en"
                                    value={formData.name_en}
                                    onChange={handleChange}
                                    placeholder={t("registerMandal.name_en_placeholder")}
                                    className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.name_hi")}</label>
                                <Input
                                    name="name_hi"
                                    value={formData.name_hi}
                                    onChange={handleChange}
                                    placeholder={t("registerMandal.name_hi_placeholder")}
                                    className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.name_mr")}</label>
                                <Input
                                    name="name_mr"
                                    value={formData.name_mr}
                                    onChange={handleChange}
                                    placeholder={t("registerMandal.name_mr_placeholder")}
                                    className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.mandal_type")}</label>
                            <select
                                name="mandalType"
                                value={formData.mandalType}
                                onChange={handleChange}
                                className="w-full h-12 px-3 border border-slate-200 focus:border-orange-500 rounded-xl"
                            >
                                <option value="">{t("registerMandal.mandal_type_select")}</option>
                                <option value="Ganesh">{t("registerMandal.type_ganesh")}</option>
                                <option value="Durga">{t("registerMandal.type_durga")}</option>
                                <option value="Ram">{t("registerMandal.type_ram")}</option>
                                <option value="Other">{t("registerMandal.type_other")}</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.desc_en")}</label>
                                <Textarea
                                    name="description_en"
                                    value={formData.description_en}
                                    onChange={handleChange}
                                    placeholder={t("registerMandal.desc_placeholder")}
                                    className="min-h-[100px] border-slate-200 focus:border-orange-500 rounded-xl resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.desc_hi")}</label>
                                <Textarea
                                    name="description_hi"
                                    value={formData.description_hi}
                                    onChange={handleChange}
                                    placeholder={t("registerMandal.desc_placeholder")}
                                    className="min-h-[100px] border-slate-200 focus:border-orange-500 rounded-xl resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.desc_mr")}</label>
                                <Textarea
                                    name="description_mr"
                                    value={formData.description_mr}
                                    onChange={handleChange}
                                    placeholder={t("registerMandal.desc_placeholder")}
                                    className="min-h-[100px] border-slate-200 focus:border-orange-500 rounded-xl resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Deity & Festivals */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{t("registerMandal.section_deity")}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.presiding_deity")}</label>
                            <Input
                                name="presiding_deity"
                                value={formData.presiding_deity}
                                onChange={handleChange}
                                placeholder={t("registerMandal.presiding_deity_placeholder")}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.festivals")}</label>
                            <Input
                                name="festivals"
                                value={formData.festivals}
                                onChange={handleChange}
                                placeholder={t("registerMandal.festivals_placeholder")}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                            />
                        </div>
                    </div>
                </section>

                {/* 4. Location */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{t("registerMandal.section_location")}</h3>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.address")}</label>
                            <Input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder={t("registerMandal.address_placeholder")}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.city")}</label>
                                <Input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder={t("registerMandal.city")}
                                    className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.state")}</label>
                                <Input
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    placeholder={t("registerMandal.state")}
                                    className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.pincode")}</label>
                                <Input
                                    name="pinCode"
                                    value={formData.pinCode}
                                    onChange={handleChange}
                                    placeholder={t("registerMandal.pincode")}
                                    className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Documents */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">{t("registerMandal.section_contact")}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.reg_number")}</label>
                            <Input
                                name="registrationNumber"
                                value={formData.registrationNumber}
                                onChange={handleChange}
                                placeholder={t("registerMandal.reg_number_placeholder")}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.verification_doc")}</label>
                            <Input
                                name="verificationDocUrl"
                                value={formData.verificationDocUrl}
                                onChange={handleChange}
                                placeholder={t("registerMandal.doc_link_placeholder")}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-600 ml-1">{t("registerMandal.president_id")}</label>
                            <Input
                                name="presidentIdDocUrl"
                                value={formData.presidentIdDocUrl}
                                onChange={handleChange}
                                placeholder={t("registerMandal.doc_link_placeholder")}
                                className="h-12 border-slate-200 focus:border-orange-500 rounded-xl"
                            />
                        </div>
                    </div>
                </section>
                
                {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium">
                        {error}
                    </div>
                )}
            </form>

            {/* Footer Actions */}
            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4 shrink-0">
                {onClose && (
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="h-14 px-8 text-slate-500 font-bold hover:bg-slate-200 rounded-full"
                    >
                        {t('common.discard') || 'Discard'}
                    </Button>
                )}
                <Button
                    type="submit"
                    form="mandal-reg-form"
                    disabled={isLoading}
                    className="h-14 px-12 bg-gradient-to-r from-[#88542b] to-[#794a05] hover:from-[#794a05] hover:to-[#88542b] text-white rounded-full text-lg font-bold shadow-xl shadow-amber-900/20 active:scale-95 transition-all"
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t("registerMandal.btn_submitting")}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            {t("registerMandal.btn_submit")}
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
}
