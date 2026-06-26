"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Globe,
  Image as ImageIcon,
  FileText,
  Building2,
  MapPin,
  Phone,
  Sparkles,
  Info,
  CheckCircle,
  AlertCircle,
  Languages,
} from "lucide-react";
import { createMandalAdmin, updateMandalAdmin, fetchMandalByIdAdmin } from "@/api/adminController";

function getJsonVal(val: any, lang: string) {
  if (!val) return "";
  if (typeof val === "string") {
    try { val = JSON.parse(val); } catch { return val; }
  }
  return val?.[lang] || "";
}

interface MandalFormProps {
  mandalId?: string;
}

// Language tabs configuration
const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
];

export default function MandalFormPage({ mandalId }: MandalFormProps) {
  const router = useRouter();
  const params = useParams();
  const id = mandalId || (params?.id as string);
  const isEdit = !!id;

  const [activeLang, setActiveLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [existingImage, setExistingImage] = useState<string>("");
  const [bannerFiles, setBannerFiles] = useState<File[]>([]);
  const [existingBanners, setExistingBanners] = useState<string[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name_en: "", name_hi: "", name_mr: "",
    mandalType: "",
    description_en: "", description_hi: "", description_mr: "",
    presiding_deity: "", festivals: "",
    address: "", city: "", state: "", pinCode: "",
    contactNumber: "", email: "", presidentName: "",
    registrationNumber: "", verificationDocUrl: "", presidentIdDocUrl: "",
    slug: "", status: "PENDING", isActive: true, adminNotes: "",
  });

  // Load existing data if editing
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    fetchMandalByIdAdmin(id)
      .then(res => {
        if (res.success) {
          const m = res.data;
          setForm({
            name_en: getJsonVal(m.name, "en"),
            name_hi: getJsonVal(m.name, "hi"),
            name_mr: getJsonVal(m.name, "mr"),
            mandalType: m.mandalType || "",
            description_en: getJsonVal(m.description, "en"),
            description_hi: getJsonVal(m.description, "hi"),
            description_mr: getJsonVal(m.description, "mr"),
            presiding_deity: m.presiding_deity || "",
            festivals: m.festivals || "",
            address: m.address || "",
            city: m.city || "",
            state: m.state || "",
            pinCode: m.pinCode || "",
            contactNumber: m.contactNumber || "",
            email: m.email || "",
            presidentName: m.presidentName || "",
            registrationNumber: m.registrationNumber || "",
            verificationDocUrl: m.verificationDocUrl || "",
            presidentIdDocUrl: m.presidentIdDocUrl || "",
            slug: m.slug || "",
            status: m.status || "PENDING",
            isActive: m.isActive ?? true,
            adminNotes: m.adminNotes || "",
          });
          if (m.image) setExistingImage(m.image);
          if (m.bannerImages?.length) setExistingBanners(m.bannerImages);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleBannersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setBannerFiles(prev => [...prev, ...files]);
  };

  const removeBanner = (idx: number, existing: boolean) => {
    if (existing) {
      setExistingBanners(prev => prev.filter((_, i) => i !== idx));
    } else {
      setBannerFiles(prev => prev.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
    fd.set("isActive", String(form.isActive));
    if (imageFile) fd.append("image", imageFile);
    bannerFiles.forEach(f => fd.append("bannerImages", f));
    fd.append("existingBannerImages", JSON.stringify(existingBanners));
    if (docFile) fd.append("documentUrl", docFile);

    try {
      const res = isEdit
        ? await updateMandalAdmin(id, fd)
        : await createMandalAdmin(fd);

      if (res.success) {
        setSuccess(true);
        setTimeout(() => router.push("/admin/mandals"), 1200);
      } else {
        setError(res.message || "Failed to save mandal.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const InputClass = "w-full px-4 py-2.5 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all";
  const TextAreaClass = `${InputClass} resize-none`;
  const LabelClass = "block text-sm font-medium text-foreground mb-1.5";
  const SectionTitle = ({ children, icon }: any) => (
    <h3 className="text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border flex items-center gap-2">
      <span className="text-primary">{icon}</span>
      {children}
    </h3>
  );
  const SectionWrapper = ({ children, className = "" }: any) => (
    <div className={`bg-card border border-border rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );

  // Get current language field prefix
  const getLangField = (field: string) => {
    return `${field}_${activeLang}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/mandals" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEdit ? "Edit Mandal" : "Create Mandal"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Update mandal details" : "Fill all details to register a new mandal"}
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Mandal {isEdit ? "updated" : "created"} successfully! Redirecting…
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Section 1: Basic Information ── */}
        <SectionWrapper>
          <SectionTitle icon={<Building2 className="w-5 h-5" />}>1. Basic Information</SectionTitle>

          {/* Language Tabs */}
          <div className="flex gap-2 mb-4 border-b border-border">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setActiveLang(lang.code)}
                className={`px-4 py-2 text-sm font-medium transition-all border-b-2 ${
                  activeLang === lang.code
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="mr-1">{lang.flag}</span> {lang.label}
              </button>
            ))}
          </div>

          {/* Dynamic Language Fields */}
          <div className="space-y-4">
            <div>
              <label className={LabelClass}>
                <span className="inline-flex items-center gap-1">
                  <Globe className="w-3 h-3 text-muted-foreground" />
                  Name ({activeLang === "en" ? "English" : activeLang === "hi" ? "Hindi" : "Marathi"})
                </span>
              </label>
              <input
                type="text"
                name={getLangField("name")}
                value={(form as any)[getLangField("name")]}
                onChange={handleChange}
                className={InputClass}
                placeholder={`Mandal name in ${activeLang}`}
              />
            </div>

            <div>
              <label className={LabelClass}>
                Description ({activeLang === "en" ? "English" : activeLang === "hi" ? "Hindi" : "Marathi"})
              </label>
              <textarea
                name={getLangField("description")}
                value={(form as any)[getLangField("description")]}
                onChange={handleChange}
                rows={4}
                className={TextAreaClass}
                placeholder={`Description in ${activeLang}…`}
              />
            </div>
          </div>

          {/* Non-language fields */}
          <div className="mt-4">
            <label className={LabelClass}>Mandal Type</label>
            <select name="mandalType" value={form.mandalType} onChange={handleChange} className={InputClass}>
              <option value="">Select Type</option>
              <option value="Ganesh">Ganesh Mandal</option>
              <option value="Durga">Durga Puja Samiti</option>
              <option value="Ram">Ram Leela Samiti</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </SectionWrapper>

        {/* ── Section 2: Deity & Festivals ── */}
        <SectionWrapper>
          <SectionTitle icon={<Sparkles className="w-5 h-5" />}>2. Deity & Festival Details</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LabelClass}>Presiding Deity</label>
              <input
                type="text"
                name="presiding_deity"
                value={form.presiding_deity}
                onChange={handleChange}
                className={InputClass}
                placeholder="e.g. Lord Ganesha"
              />
              <p className="text-xs text-muted-foreground mt-1">The main deity worshipped by the mandal</p>
            </div>
            <div>
              <label className={LabelClass}>Major Festivals</label>
              <input
                type="text"
                name="festivals"
                value={form.festivals}
                onChange={handleChange}
                className={InputClass}
                placeholder="e.g. Ganesh Chaturthi, Navratri"
              />
              <p className="text-xs text-muted-foreground mt-1">Separate multiple festivals with commas</p>
            </div>
          </div>
        </SectionWrapper>

        {/* ── Section 3: Location ── */}
        <SectionWrapper>
          <SectionTitle icon={<MapPin className="w-5 h-5" />}>3. Location Details</SectionTitle>

          <div>
            <label className={LabelClass}>Full Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={3}
              className={TextAreaClass}
              placeholder="Street, landmark…"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={LabelClass}>City</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className={InputClass}
                placeholder="City"
              />
            </div>
            <div>
              <label className={LabelClass}>State</label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                className={InputClass}
                placeholder="State"
              />
            </div>
            <div>
              <label className={LabelClass}>Pincode</label>
              <input
                type="text"
                name="pinCode"
                value={form.pinCode}
                onChange={handleChange}
                className={InputClass}
                placeholder="Pincode"
              />
            </div>
          </div>
        </SectionWrapper>

        {/* ── Section 4: Contact & Documents ── */}
        <SectionWrapper>
          <SectionTitle icon={<Phone className="w-5 h-5" />}>4. Contact & Documents</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LabelClass}>Contact Number *</label>
              <input
                required
                type="text"
                name="contactNumber"
                value={form.contactNumber}
                onChange={handleChange}
                className={InputClass}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
            <div>
              <label className={LabelClass}>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={InputClass}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className={LabelClass}>President Name</label>
              <input
                type="text"
                name="presidentName"
                value={form.presidentName}
                onChange={handleChange}
                className={InputClass}
                placeholder="Name of Mandal President"
              />
            </div>
            <div>
              <label className={LabelClass}>Registration Number</label>
              <input
                type="text"
                name="registrationNumber"
                value={form.registrationNumber}
                onChange={handleChange}
                className={InputClass}
                placeholder="NGO / Trust registration no."
              />
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <div>
              <label className={LabelClass}>Verification Doc URL</label>
              <input
                type="text"
                name="verificationDocUrl"
                value={form.verificationDocUrl}
                onChange={handleChange}
                className={InputClass}
                placeholder="Link to trust/NGO document"
              />
            </div>
            <div>
              <label className={LabelClass}>President ID Proof URL</label>
              <input
                type="text"
                name="presidentIdDocUrl"
                value={form.presidentIdDocUrl}
                onChange={handleChange}
                className={InputClass}
                placeholder="Link to ID proof"
              />
            </div>
            <div>
              <label className={LabelClass}>Upload Document (PDF/Image)</label>
              <input
                ref={docInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={e => setDocFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors w-full"
              >
                <FileText className="w-4 h-4" />
                {docFile ? docFile.name : "Choose file…"}
              </button>
            </div>
          </div>
        </SectionWrapper>

        {/* ── Section 5: Media ── */}
        <SectionWrapper>
          <SectionTitle icon={<ImageIcon className="w-5 h-5" />}>5. Media</SectionTitle>

          {/* Main Image */}
          <div>
            <label className={LabelClass}>Main Image</label>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            <div
              onClick={() => imageInputRef.current?.click()}
              className="relative cursor-pointer group w-48 h-48 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center bg-muted/30 overflow-hidden"
            >
              {(imagePreview || existingImage) ? (
                <img
                  src={imagePreview || `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${existingImage}`}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <span className="text-xs text-muted-foreground">Click to upload</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Banner Images */}
          <div>
            <label className={LabelClass}>Banner Images (max 10)</label>
            <input ref={bannerInputRef} type="file" accept="image/*" multiple onChange={handleBannersChange} className="hidden" />
            <div className="flex flex-wrap gap-3 mb-3">
              {existingBanners.map((url, i) => (
                <div key={`ex-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group">
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeBanner(i, true)}
                    className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {bannerFiles.map((f, i) => (
                <div key={`new-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-border group">
                  <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeBanner(i, false)}
                    className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors flex flex-col items-center justify-center text-muted-foreground hover:text-primary"
              >
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-xs">Add</span>
              </button>
            </div>
          </div>
        </SectionWrapper>

        {/* ── Section 6: Settings ── */}
        <SectionWrapper>
          <SectionTitle icon={<Info className="w-5 h-5" />}>6. Settings</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={LabelClass}>URL Slug</label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                className={InputClass}
                placeholder="mandal-name-slug"
              />
              <p className="text-xs text-muted-foreground mt-1">URL-friendly name (auto-generated if empty)</p>
            </div>
            <div>
              <label className={LabelClass}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={InputClass}>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/40 rounded-lg">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="w-4 h-4 rounded text-primary"
            />
            <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">
              Active (visible to public)
            </label>
          </div>

          <div>
            <label className={LabelClass}>Admin Notes</label>
            <textarea
              name="adminNotes"
              value={form.adminNotes}
              onChange={handleChange}
              rows={4}
              className={TextAreaClass}
              placeholder="Internal notes…"
            />
          </div>
        </SectionWrapper>

        {/* ── Submit Buttons ── */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/admin/mandals"
            className="px-6 py-2.5 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : isEdit ? "Update Mandal" : "Create Mandal"}
          </button>
        </div>
      </form>
    </div>
  );
}