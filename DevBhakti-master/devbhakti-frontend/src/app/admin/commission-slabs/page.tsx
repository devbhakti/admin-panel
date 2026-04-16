'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { API_URL } from '@/config/apiConfig';

interface CommissionSlab {
    id: string;
    minAmount: number;
    maxAmount: number | null;
    platformFee: number;
    percentage: number;
    slabType: 'GLOBAL' | 'TEMPLE' | 'SELLER';
    targetId: string | null;
    isActive: boolean;
}

export default function CommissionSlabsPage() {
    const [slabs, setSlabs] = useState<CommissionSlab[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<'MARKETPLACE' | 'POOJA' | 'DONATION'>('MARKETPLACE');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        minAmount: '0',
        maxAmount: '',
        platformFee: '0',
        percentage: '',
    });

    useEffect(() => {
        fetchSlabs();
    }, [activeCategory]);

    const fetchSlabs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`${API_URL}/admin/commission-slabs?type=GLOBAL&category=${activeCategory}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setSlabs(data.data);
                // If it's donation and we have slabs, use the one that starts at 0
                if (activeCategory === 'DONATION') {
                    const catchAllSlab = data.data.find((s: any) => s.minAmount === 0) || data.data[0];
                    if (catchAllSlab) {
                        setFormData({
                            minAmount: '0',
                            maxAmount: '',
                            platformFee: '0',
                            percentage: catchAllSlab.percentage.toString()
                        });
                        // If we found a catch-all but there are others, we show only this one in the slabs state
                        setSlabs([catchAllSlab]);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching slabs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const body = activeCategory === 'DONATION' 
                ? { minAmount: 0, maxAmount: null, platformFee: 0, percentage: parseFloat(formData.percentage), slabType: 'GLOBAL', category: 'DONATION' }
                : { ...formData, slabType: 'GLOBAL', category: activeCategory };

            const response = await fetch(`${API_URL}/admin/commission-slabs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();

            if (data.success) {
                fetchSlabs();
                setIsCreating(false);
                if (activeCategory !== 'DONATION') {
                    setFormData({ minAmount: '0', maxAmount: '', platformFee: '0', percentage: '' });
                }
                alert('Success!');
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            alert('Failed: ' + error);
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            const token = localStorage.getItem('admin_token');
            const body = activeCategory === 'DONATION'
                ? { minAmount: 0, maxAmount: null, platformFee: 0, percentage: parseFloat(formData.percentage), category: 'DONATION' }
                : { ...formData, category: activeCategory };

            const response = await fetch(`${API_URL}/admin/commission-slabs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (data.success) {
                fetchSlabs();
                setEditingId(null);
                alert('Updated successfully!');
            }
        } catch (error) {
            alert('Failed to update');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`${API_URL}/admin/commission-slabs/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (data.success) fetchSlabs();
        } catch (error) {
            console.error(error);
        }
    };

    const startEdit = (slab: CommissionSlab) => {
        setEditingId(slab.id);
        setFormData({
            minAmount: slab.minAmount.toString(),
            maxAmount: slab.maxAmount?.toString() || '',
            platformFee: slab.platformFee.toString(),
            percentage: slab.percentage.toString(),
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsCreating(false);
        if (activeCategory !== 'DONATION') {
            setFormData({ minAmount: '0', maxAmount: '', platformFee: '0', percentage: '' });
        }
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Commission Slabs</h1>
                    <p className="text-gray-600 mt-2 text-sm sm:text-base">
                        Manage platform fees for Marketplace, Pooja, and Donations.
                    </p>
                </div>
                {activeCategory !== 'DONATION' && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition shadow-lg shadow-orange-200"
                    >
                        <Plus size={20} />
                        Add New Slab
                    </button>
                )}
            </div>

            {/* Category Tabs */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
                {['MARKETPLACE', 'POOJA', 'DONATION'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => {
                            setActiveCategory(cat as any);
                            setEditingId(null);
                            setIsCreating(false);
                        }}
                        className={`whitespace-nowrap px-6 py-3 font-semibold text-sm transition-all duration-200 border-b-2 ${activeCategory === cat
                            ? 'border-orange-600 text-orange-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {cat === 'MARKETPLACE' ? 'Marketplace (Products)' : cat === 'POOJA' ? 'Pooja Bookings' : 'Donations'}
                    </button>
                ))}
            </div>

            {/* Donation Config (Internal Only) */}
            {activeCategory === 'DONATION' && (
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-orange-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-500" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
                                <Save className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Platform Split Percentage</h3>
                                <p className="text-gray-500 text-sm italic">Internal setting for administrative commission</p>
                            </div>
                        </div>

                        <div className="max-w-md">
                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                                Commission Percentage (%)
                            </label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={formData.percentage}
                                        onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                                        className="w-full pl-6 pr-12 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl outline-none transition-all text-xl font-bold"
                                        placeholder="0.0"
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xl">%</span>
                                </div>
                                <button
                                    onClick={() => slabs.length > 0 ? handleUpdate(slabs[0].id) : handleCreate()}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-2xl font-bold transition shadow-lg shadow-orange-200 active:scale-95"
                                >
                                    Save
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <span className="text-blue-600 font-bold text-xl">!</span>
                            </div>
                            <p className="text-sm text-blue-800 leading-relaxed font-medium">
                                This percentage is only for internal accounting between Admin and Temple Admin. 
                                <strong> Devotees (Users) will not see this deduction</strong> — they will always see the full amount they donated.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Marketplace/Pooja Slabs Form */}
            {activeCategory !== 'DONATION' && isCreating && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-orange-500 animate-in fade-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-bold mb-6">Create New {activeCategory} Slab</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Min Amount (₹)</label>
                            <input
                                type="number"
                                value={formData.minAmount}
                                onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Max Amount (₹)</label>
                            <input
                                type="number"
                                value={formData.maxAmount}
                                onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 outline-none"
                                placeholder="Unlimited"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Fixed Fee (₹)</label>
                            <input
                                type="number"
                                value={formData.platformFee}
                                onChange={(e) => setFormData({ ...formData, platformFee: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Percentage (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={formData.percentage}
                                onChange={(e) => setFormData({ ...formData, percentage: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 mt-8">
                        <button onClick={handleCreate} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-100">Save Slab</button>
                        <button onClick={cancelEdit} className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
                    </div>
                </div>
            )}

            {/* Slabs Table for Marketplace/Pooja */}
            {activeCategory !== 'DONATION' && (
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Amount Range</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Platform Fee (₹)</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Commission (%)</th>
                                    <th className="px-6 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {slabs.map((slab) => (
                                    <tr key={slab.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <span className="font-bold text-gray-700">₹{slab.minAmount} - {slab.maxAmount ? `₹${slab.maxAmount}` : 'No Limit'}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm">₹{slab.platformFee}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-bold text-sm">{slab.percentage}%</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => startEdit(slab)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition"><Edit2 size={18} /></button>
                                                <button onClick={() => handleDelete(slab.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}