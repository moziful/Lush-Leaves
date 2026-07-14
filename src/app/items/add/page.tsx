"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FiChevronLeft, FiPlus, FiTrash2, FiUpload, FiImage,
  FiInfo, FiDroplet, FiSun, FiAlertTriangle,
} from "react-icons/fi";
import ConfirmModal from "@/components/ConfirmModal";
import SuggestionInput from "@/components/SuggestionInput";
import CustomSelect from "@/components/CustomSelect";

interface CommonProblem { problem: string; solution: string; }

const CATEGORIES = ["Foliage", "Succulents", "Flowers", "Pet Friendly"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const;

const SUGGESTIONS = {
  watering: [
    "Once a week",
    "Every 2 weeks",
    "Every 2–3 weeks",
    "Once a month",
    "Keep moist",
    "When soil is dry",
  ],
  sunlight: [
    "Full Sun",
    "Bright Indirect",
    "Low to Bright Indirect",
    "Partial Shade",
    "Full Shade",
    "Filtered Light",
  ],
  temperature: [
    "10°C – 20°C",
    "15°C – 25°C",
    "15°C – 29°C",
    "18°C – 27°C",
    "20°C – 30°C",
    "Above 15°C",
  ],
};

const inputClass =
  "w-full rounded-xl border border-sage/25 bg-white px-4 py-3 text-sm font-medium text-forest-dark outline-none transition focus:border-forest focus:ring-2 focus:ring-forest/15 placeholder:text-slate-400";
const labelClass =
  "block text-[11px] font-black uppercase tracking-wider text-forest-dark/40 mb-1.5";

function SectionCard({ icon: Icon, title, children }: {
  icon: React.ElementType; title: string; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-sage/15 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-sage/10 bg-sage/5">
        <Icon className="h-4 w-4 text-forest" />
        <h2 className="text-xs font-black uppercase tracking-widest text-forest-dark/60">{title}</h2>
      </div>
      <div className="p-6 space-y-5">{children}</div>
    </div>
  );
}

export default function AddPlantPage() {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [authChecking, setAuthChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    scientificName: "",
    category: "Foliage",
    short: "",
    description: "",
    price: "",
    image: "",
    difficulty: "Easy" as "Easy" | "Medium" | "Hard",
    watering: "",
    sunlight: "",
    temperature: "",
  });
  const [detailedCare, setDetailedCare] = useState<string[]>([""]);
  const [commonProblems, setCommonProblems] = useState<CommonProblem[]>([
    { problem: "", solution: "" },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!token || !storedUser) { router.replace("/login"); return; }
    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "admin") { router.replace("/explore"); return; }
    } catch { router.replace("/login"); return; }
    setAuthChecking(false);
  }, [router]);

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        setForm((prev) => ({ ...prev, image: data.url }));
      } else {
        setError(data.message || "Image upload failed.");
      }
    } catch { setError("Network error during photo upload."); }
    finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const updateCare = (i: number, val: string) =>
    setDetailedCare((prev) => prev.map((v, idx) => (idx === i ? val : v)));
  const addCare = () => setDetailedCare((prev) => [...prev, ""]);
  const removeCare = (i: number) => setDetailedCare((prev) => prev.filter((_, idx) => idx !== i));

  const updateProblem = (i: number, field: keyof CommonProblem, val: string) =>
    setCommonProblems((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  const addProblem = () => setCommonProblems((prev) => [...prev, { problem: "", solution: "" }]);
  const removeProblem = (i: number) => setCommonProblems((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) { setError("Please upload or enter a plant image."); return; }
    setShowConfirm(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          detailedCare: detailedCare.filter(Boolean),
          commonProblems: commonProblems.filter((p) => p.problem || p.solution),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create plant.");
      setSuccess("Plant added successfully! Redirecting…");
      setTimeout(() => router.push("/items/manage"), 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally { setSubmitting(false); }
  };

  if (authChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-forest border-t-transparent" />
      </div>
    );
  }

  const difficultyColor = { Easy: "text-emerald-600 bg-emerald-50", Medium: "text-amber-600 bg-amber-50", Hard: "text-rose-600 bg-rose-50" };

  return (
    <div className="min-h-screen bg-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/items/manage"
              className="flex items-center gap-1.5 text-sm font-bold text-forest-dark/60 hover:text-forest transition-colors">
              <FiChevronLeft className="h-4 w-4" /> Dashboard
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-bold text-forest-dark">Add New Plant</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/items/manage"
              className="px-4 py-2 text-sm font-bold text-forest-dark/60 bg-white border border-sage/20 rounded-xl hover:bg-slate-50 transition-all">
              Cancel
            </Link>
            <button
              form="add-plant-form"
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-forest rounded-xl hover:bg-forest-dark shadow-sm shadow-forest/20 transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98]"
            >
              <FiPlus className="h-4 w-4" />
              {submitting ? "Adding…" : "Add Plant"}
            </button>
          </div>
        </div>
        {error && (
          <div className="rounded-xl bg-rose/10 border border-rose/20 px-4 py-3 text-xs font-bold text-rose animate-fadeIn">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl bg-forest/10 border border-forest/20 px-4 py-3 text-xs font-bold text-forest animate-fadeIn">
            {success}
          </div>
        )}
        <form id="add-plant-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-1 space-y-6">
              <SectionCard icon={FiImage} title="Plant Image">
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-sage/25 bg-sage/5 flex items-center justify-center">
                  {form.image ? (
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-forest/30 p-6 text-center">
                      <FiImage className="h-12 w-12" />
                      <span className="text-xs font-bold">No image yet</span>
                    </div>
                  )}
                </div>

                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-sage/25 bg-sage/10 px-4 py-3 text-sm font-bold text-forest hover:bg-sage/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {uploadingPhoto
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-forest border-t-transparent" />
                    : <FiUpload className="h-4 w-4" />}
                  {uploadingPhoto ? "Uploading…" : "Upload from Device"}
                </button>

                <div className="relative">
                  <FiImage className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-forest/30" />
                  <input name="image" type="url" value={form.image} onChange={handleField}
                    placeholder="…or paste image URL" className={inputClass + " pl-10"} />
                </div>
              </SectionCard>
              <SectionCard icon={FiDroplet} title="Care Snapshot">
                <div>
                  <label className={labelClass}>💧 Watering</label>
                  <SuggestionInput
                    name="watering"
                    value={form.watering}
                    onChange={(val) => setForm((p) => ({ ...p, watering: val }))}
                    suggestions={SUGGESTIONS.watering}
                    placeholder="e.g. Every 2–3 weeks"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>☀️ Sunlight</label>
                  <SuggestionInput
                    name="sunlight"
                    value={form.sunlight}
                    onChange={(val) => setForm((p) => ({ ...p, sunlight: val }))}
                    suggestions={SUGGESTIONS.sunlight}
                    placeholder="e.g. Low to Bright Indirect"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>🌡️ Temperature</label>
                  <SuggestionInput
                    name="temperature"
                    value={form.temperature}
                    onChange={(val) => setForm((p) => ({ ...p, temperature: val }))}
                    suggestions={SUGGESTIONS.temperature}
                    placeholder="e.g. 15°C – 29°C"
                    className={inputClass}
                  />
                </div>
              </SectionCard>
            </div>
            <div className="xl:col-span-2 space-y-6">
              <SectionCard icon={FiInfo} title="Basic Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Plant Title *</label>
                    <input name="title" required value={form.title} onChange={handleField}
                      placeholder="e.g. Snake Plant Laurentii" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Scientific Name</label>
                    <input name="scientificName" value={form.scientificName} onChange={handleField}
                      placeholder="e.g. Sansevieria trifasciata" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Category</label>
                    <CustomSelect
                      name="category"
                      value={form.category}
                      onChange={(val) => setForm((p) => ({ ...p, category: val }))}
                      options={CATEGORIES}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Difficulty</label>
                    <CustomSelect
                      name="difficulty"
                      value={form.difficulty}
                      onChange={(val) => setForm((p) => ({ ...p, difficulty: val as "Easy" | "Medium" | "Hard" }))}
                      options={DIFFICULTIES}
                      className={`${inputClass} font-bold ${difficultyColor[form.difficulty]}`}
                      optionClassName={(opt) => difficultyColor[opt as "Easy" | "Medium" | "Hard"] || ""}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Price (USD) *</label>
                    <input name="price" type="number" step="0.01" min="0" required value={form.price}
                      onChange={handleField} placeholder="29.99" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Short Description <span className="normal-case text-slate-400">(shown on card — max 120 chars)</span></label>
                  <input name="short" value={form.short} onChange={handleField} maxLength={120}
                    placeholder="One-line summary shown under the plant name on cards…" className={inputClass} />
                  <p className="mt-1 text-right text-[10px] text-slate-400">{form.short.length}/120</p>
                </div>
                <div>
                  <label className={labelClass}>Full Description</label>
                  <textarea name="description" value={form.description} onChange={handleField} rows={5}
                    placeholder="Detailed overview — origin, toxicity, potting needs, growth habits…"
                    className={inputClass + " resize-none"} />
                </div>
              </SectionCard>
              <SectionCard icon={FiSun} title="Detailed Care Tips">
                <div className="space-y-3">
                  {detailedCare.map((tip, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-forest/10 text-[10px] font-black text-forest">
                        {i + 1}
                      </span>
                      <input value={tip} onChange={(e) => updateCare(i, e.target.value)}
                        placeholder={`Care tip ${i + 1}…`} className={inputClass} />
                      {detailedCare.length > 1 && (
                        <button type="button" onClick={() => removeCare(i)}
                          className="shrink-0 rounded-lg p-2 text-slate-400 hover:text-rose hover:bg-rose/5 transition-all cursor-pointer">
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addCare}
                  className="flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-dark transition-colors cursor-pointer">
                  <FiPlus className="h-3.5 w-3.5" /> Add Care Tip
                </button>
              </SectionCard>
              <SectionCard icon={FiAlertTriangle} title="Common Problems">
                <div className="space-y-4">
                  {commonProblems.map((p, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-sage/5 border border-sage/15 relative">
                      {commonProblems.length > 1 && (
                        <button type="button" onClick={() => removeProblem(i)}
                          className="absolute top-3 right-3 rounded-lg p-1.5 text-slate-400 hover:text-rose hover:bg-rose/10 transition-all cursor-pointer">
                          <FiTrash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <div>
                        <label className={labelClass}>Problem</label>
                        <input value={p.problem} onChange={(e) => updateProblem(i, "problem", e.target.value)}
                          placeholder="e.g. Mushy leaves or yellowing base" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Solution</label>
                        <input value={p.solution} onChange={(e) => updateProblem(i, "solution", e.target.value)}
                          placeholder="e.g. Stop watering, improve drainage" className={inputClass} />
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addProblem}
                  className="flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-dark transition-colors cursor-pointer">
                  <FiPlus className="h-3.5 w-3.5" /> Add Problem
                </button>
              </SectionCard>
            </div>
          </div>
        </form>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Add this plant?"
        message="This will publish the plant to the catalog immediately and it will be visible to all users."
        confirmLabel="Yes, Add Plant"
        cancelLabel="Review Again"
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
