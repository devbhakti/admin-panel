"use client";

import React, { useState, useEffect } from "react";
import {
    Edit2,
    Upload,
    X,
    LayoutGrid,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { fetchAllCTACardsAdmin, createCTACardAdmin, updateCTACardAdmin } from "@/api/adminController";
import { BASE_URL } from "@/config/apiConfig";
import { useLanguage } from "@/context/LanguageContext";
import { getLocalized, Language } from "@/utils/localization";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Default seed data to ensure cards exist
const DEFAULT_CARDS = [
    {
        title: "For Devotees",
        points: [
            "Book poojas and sevas online",
            "Watch live darshan 24/7",
            "Shop authentic spiritual products",
            "Receive festival notifications",
            "Make secure donations"
        ],
        buttonText: "Sign Up as Devotee",
        buttonLink: "/auth?mode=register",
        cardType: "primary",
        active: true,
        order: 1
    },
    {
        title: "Temples, Devotional Shops & Pandits",
        points: [
            "Manage bookings and services",
            "Stream live darshan",
            "Sell products on marketplace",
            "Track donations and reports",
            "Automated logistics integration"
        ],
        buttonText: "Register Your Temple",
        buttonLink: "/temples/register",
        cardType: "secondary",
        active: true,
        order: 2
    }
];

export default function CTACardsPage() {
    const [ctaCards, setCTACards] = useState<any[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCard, setEditingCard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { t, language } = useLanguage();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("en");

    const [formData, setFormData] = useState({
        title_en: "",
        title_hi: "",
        title_mr: "",
        points_en: ["", "", "", "", ""],
        points_hi: ["", "", "", "", ""],
        points_mr: ["", "", "", "", ""],
        active: true,
        buttonText_en: "",
        buttonText_hi: "",
        buttonText_mr: "",
    });


    const [iconFile, setIconFile] = useState<File | null>(null);
    const [iconPreview, setIconPreview] = useState<string>("");

    useEffect(() => {
        loadCTACards();
    }, []);

    const loadCTACards = async () => {
        try {
            setLoading(true);
            let data = await fetchAllCTACardsAdmin();

            // Auto-seed if empty
            if (!data || data.length === 0) {
                console.log("Seeding default cards...");
                for (const card of DEFAULT_CARDS) {
                    const formData = new FormData();
                    formData.append('title', card.title);
                    formData.append('points', JSON.stringify(card.points));
                    formData.append('buttonText', card.buttonText);
                    formData.append('buttonLink', card.buttonLink);
                    formData.append('cardType', card.cardType);
                    formData.append('active', 'true');
                    formData.append('order', card.order.toString());
                    // Note: Creating without icon initially if seeding, will need manual icon upload later mostly
                    // Or we handle icon validation differently
                    // For now, let's assume admin will upload icon. 
                    // To bypass required icon in backend, we might need to adjust backend or upload dummy.
                    // But for now, let's just show empty state or handle differently.
                    // Actually, let's just let the user see empty and let them create via UI if needed?
                    // No, requirements say fixed 2 cards.
                    // We will just seed them on frontend state if backend is empty to allow creation?
                    // Better: UI shows 2 cards placeholder if empty, and "Initialize" or just "Edit" to create.
                }
                // Reload after seed? Or just use what we have?
                // For simplicity, if empty, we will guide user to "Setup" them or we just show placeholders.
            }

            // Sort by order
            data = data.sort((a: any, b: any) => a.order - b.order);
            setCTACards(data);
        } catch (error) {
            console.error("Error loading CTA cards:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (card: any, index: number) => {
        const preparePoints = (pts: any) => {
            if (!Array.isArray(pts)) pts = [];
            const result = [...pts];
            while (result.length < 5) result.push("");
            return result.slice(0, 5);
        };

        if (card.id) {
            setEditingCard(card);
            setFormData({
                title_en: card.title_en || card.title || "",
                title_hi: card.title_hi || "",
                title_mr: card.title_mr || "",
                points_en: preparePoints(card.points_en || card.points),
                points_hi: preparePoints(card.points_hi),
                points_mr: preparePoints(card.points_mr),
                active: card.active ?? true,
                buttonText_en: card.buttonText_en || card.buttonText || "",
                buttonText_hi: card.buttonText_hi || "",
                buttonText_mr: card.buttonText_mr || "",
            });
            setIconPreview(card.icon ? (card.icon.startsWith('http') ? card.icon : `${BASE_URL}${card.icon}`) : "");
            setIconFile(null);
            setIsDialogOpen(true);
        } else {
            setEditingCard({ ...card, isNew: true });
            setFormData({
                title_en: card.title || "",
                title_hi: "",
                title_mr: "",
                points_en: preparePoints(card.points),
                points_hi: ["", "", "", "", ""],
                points_mr: ["", "", "", "", ""],
                active: card.active ?? true,
                buttonText_en: card.buttonText || "",
                buttonText_hi: "",
                buttonText_mr: "",
            });
            setIconPreview("");
            setIconFile(null);
            setIsDialogOpen(true);
        }
    };

    const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            setIconFile(file);
            setIconPreview(URL.createObjectURL(file));
        }
    };

    const handlePointChange = (index: number, value: string) => {
        const newPoints = [...formData.points];
        newPoints[index] = value;
        setFormData({ ...formData, points: newPoints });
    };

    const handleToggleStatus = async (card: any) => {
        try {
            const data = new FormData();
            data.append('title', card.title);
            data.append('points', JSON.stringify(card.points));
            data.append('buttonText', card.buttonText);
            data.append('buttonLink', card.buttonLink);
            data.append('cardType', card.cardType);
            data.append('active', (!card.active).toString());
            data.append('order', card.order.toString());

            await updateCTACardAdmin(card.id, data);
            loadCTACards();
        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Error toggling status");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('title_en', formData.title_en);
            data.append('title_hi', formData.title_hi);
            data.append('title_mr', formData.title_mr);
            data.append('points_en', JSON.stringify(formData.points_en));
            data.append('points_hi', JSON.stringify(formData.points_hi));
            data.append('points_mr', JSON.stringify(formData.points_mr));
            data.append('buttonText_en', formData.buttonText_en);
            data.append('buttonText_hi', formData.buttonText_hi);
            data.append('buttonText_mr', formData.buttonText_mr);
            
            if (iconFile) data.append('icon', iconFile);

            const fixedData = editingCard;
            data.append('buttonLink', fixedData.buttonLink);
            data.append('cardType', fixedData.cardType);
            data.append('active', formData.active.toString());
            data.append('order', fixedData.order.toString());

            if (editingCard.id) {
                await updateCTACardAdmin(editingCard.id, data);
            } else {
                if (!iconFile) {
                    toast({ title: "Icon Required", description: "Please upload an icon", variant: "destructive" });
                    return;
                }
                await createCTACardAdmin(data);
            }

            setIsDialogOpen(false);
            loadCTACards();
            toast({ title: "Success", description: editingCard.id ? "Card updated" : "Card created" });
        } catch (error) {
            console.error("Error saving CTA card:", error);
            toast({ title: "Error", description: "Error saving CTA card", variant: "destructive" });
        }
    };

    // Merge backend data with default fixed structure to ensure 2 cards always show
    // AND enforce fixed fields (Buttons, Links) from code, ignoring DB for those specific fields
    const displayCards = [0, 1].map(index => {
        const backendCard = ctaCards.find(c => c.order === (index + 1));
        const defaultCard = DEFAULT_CARDS[index];

        if (backendCard) {
            return {
                ...backendCard,
                buttonText: defaultCard.buttonText,
                buttonLink: defaultCard.buttonLink,
                cardType: defaultCard.cardType
            };
        }
        return defaultCard;
    });

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">CTA Cards Management</h1>
                <p className="text-muted-foreground">
                    Manage the two main Call-to-Action cards on the homepage. <br />
                    Structure (Buttons & Links) is fixed. You can update the Title, content points, and icon.
                </p>
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-2 text-center py-12">Loading...</div>
                ) : (
                    displayCards.map((card: any, index) => (
                        <div
                            key={index}
                            className={`relative rounded-2xl overflow-hidden border-2 shadow-sm transition-all
                                ${card.cardType === 'primary' ? 'border-primary/20 bg-orange-50/50' : 'border-gray-200 bg-white'}
                            `}
                        >
                            {/* Card Header Label */}
                            <div className="absolute top-4 right-4 flex items-center gap-2">
                                <Badge variant={card.active ? (card.cardType === 'primary' ? 'default' : 'secondary') : 'outline'}>
                                    {card.active ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge variant={card.cardType === 'primary' ? 'default' : 'secondary'}>
                                    {card.cardType === 'primary' ? 'Devotee Card' : 'Temple Card'}
                                </Badge>
                            </div>


                            <div className="p-6 space-y-6">
                                {/* Icon Preview */}
                                <div className="w-16 h-16 rounded-xl bg-white shadow-sm border flex items-center justify-center p-2">
                                    {card.icon ? (
                                        <img
                                            src={card.icon.startsWith('http') ? card.icon : `${BASE_URL}${card.icon}`}
                                            alt="Icon"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <div className="text-xs text-muted-foreground text-center">No Icon</div>
                                    )}
                                </div>

                                {/* Content Preview */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        {getLocalized(card, 'title', language as Language)}
                                    </h3>
                                    <ul className="space-y-3">
                                        {(card[`points_${language}`] || card.points_en || card.points || []).map((point: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${card.cardType === 'primary' ? 'bg-orange-500' : 'bg-gray-400'}`} />
                                                <span>{point || "..."}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Fixed Button Preview */}
                                <div className="pt-4 border-t">
                                    <Button variant="outline" className="w-full cursor-not-allowed opacity-80" disabled>
                                        {getLocalized(card, 'buttonText', language as Language)}
                                    </Button>
                                    <p className="text-xs text-center text-muted-foreground mt-2">
                                        Links to: <code className="bg-gray-100 px-1 py-0.5 rounded">{card.buttonLink}</code>
                                    </p>
                                </div>

                                {/* Edit Action */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleEdit(card, index)}
                                        className="flex-1 gap-2"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant={card.active ? "destructive" : "default"}
                                        onClick={() => handleToggleStatus(card)}
                                        className="flex-1"
                                        disabled={!card.id}
                                    >
                                        {card.active ? "Deactivate" : "Activate"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                    ))
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Update {editingCard?.cardType === 'primary' ? 'Devotee' : 'Temple'} Card</DialogTitle>
                        <DialogDescription>
                            Update the title, icon, and 5 key points. Buttons and links are fixed.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-3 w-full mb-4">
                                <TabsTrigger value="en">{t('common.english') || "English"}</TabsTrigger>
                                <TabsTrigger value="hi">{t('common.hindi') || "Hindi"}</TabsTrigger>
                                <TabsTrigger value="mr">{t('common.marathi') || "Marathi"}</TabsTrigger>
                            </TabsList>
                            
                            {["en", "hi", "mr"].map((lang) => (
                                <TabsContent key={lang} value={lang} className="space-y-4">
                                    <div className="space-y-3">
                                        <Label htmlFor={`title_${lang}`} className="text-base font-semibold">
                                            {lang === 'hi' ? 'कार्ड शीर्षक' : lang === 'mr' ? 'कार्ड शीर्षक' : 'Card Title'} ({t(`common.${lang}_short`)})
                                        </Label>
                                        <Input
                                            id={`title_${lang}`}
                                            value={(formData as any)[`title_${lang}`]}
                                            onChange={(e) => setFormData({ ...formData, [`title_${lang}`]: e.target.value })}
                                            required={lang === 'en'}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-base font-semibold">
                                            {lang === 'hi' ? 'बुलेट पॉइंट्स' : lang === 'mr' ? 'बुलेट पॉइंट्स' : 'Bullet Points'} ({t(`common.${lang}_short`)})
                                        </Label>
                                        <div className="space-y-3">
                                            {(formData as any)[`points_${lang}`].map((point: string, idx: number) => (
                                                <div key={idx} className="flex gap-3 items-center">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                                                    <Input
                                                        value={point}
                                                        onChange={(e) => {
                                                            const newPoints = [...(formData as any)[`points_${lang}`]];
                                                            newPoints[idx] = e.target.value;
                                                            setFormData({ ...formData, [`points_${lang}`]: newPoints });
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor={`buttonText_${lang}`} className="text-base font-semibold">
                                            {lang === 'hi' ? 'बटन टेक्स्ट' : lang === 'mr' ? 'बटन मजकूर' : 'Button Text'} ({t(`common.${lang}_short`)})
                                        </Label>
                                        <Input
                                            id={`buttonText_${lang}`}
                                            value={(formData as any)[`buttonText_${lang}`]}
                                            onChange={(e) => setFormData({ ...formData, [`buttonText_${lang}`]: e.target.value })}
                                        />
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 py-4">

                        <DialogFooter className="gap-2 sm:gap-0 mt-6 pt-4 border-t">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-primary hover:bg-primary/90">
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
