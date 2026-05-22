import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { 
    Tag, 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    X, 
    Check, 
    Loader2, 
    AlertCircle,
    CheckCircle
} from 'lucide-react';

const CategoriesManagement = () => {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Status & Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Form State
    const [formData, setFormData] = useState({ name: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await api.post('/categories', formData);
            setStatus({ type: 'success', message: 'Category added successfully!' });
            setFormData({ name: '' });
            fetchCategories();
            setTimeout(() => setShowAddModal(false), 1500);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to add category.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditCategory = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await api.put(`/categories/${selectedCategory.id}`, formData);
            setStatus({ type: 'success', message: 'Category updated successfully!' });
            fetchCategories();
            setTimeout(() => setShowEditModal(false), 1500);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to update category.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/categories/${id}`);
            setCategories(categories.filter(c => c.id !== id));
            setShowDeleteConfirm(false);
        } catch (error) {
            alert("Deletion failed");
        }
    };

    const openEditModal = (category) => {
        setSelectedCategory(category);
        setFormData({ name: category.name });
        setShowEditModal(true);
    };

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Categories Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage product categories</p>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 font-semibold"
                    >
                        <Plus size={20} />
                        Add New Category
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search categories..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
                        <p className="text-gray-500 font-medium">Loading categories...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredCategories.map((category) => (
                            <div key={category.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-xl transition-all group">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600">
                                        <Tag size={24} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => openEditModal(category)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={16} /></button>
                                        <button onClick={() => { setSelectedCategory(category); setShowDeleteConfirm(true); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg leading-tight">{category.name}</h3>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Category Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100"><Tag size={20} /></div>
                                <div><h3 className="text-xl font-bold text-gray-900 leading-none mb-1">New Category</h3><p className="text-xs text-gray-500 font-medium">Add a new product category</p></div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleAddCategory} className="p-6">
                            {status.message && (
                                <div className={`p-4 rounded-xl flex items-center gap-3 mb-6 font-semibold text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                    {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                    {status.message}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block pl-1">Category Name</label>
                                    <input required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" placeholder="Ex: Dairy & Eggs" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={22} />
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={22} />
                                        <span>Add Category</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Category Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100"><Edit size={20} /></div>
                                <div><h3 className="text-xl font-bold text-gray-900 leading-none mb-1">Edit Category</h3><p className="text-xs text-gray-500 font-medium">Update category details</p></div>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleEditCategory} className="p-6">
                            {status.message && (
                                <div className={`p-4 rounded-xl flex items-center gap-3 mb-6 font-semibold text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                    {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                    {status.message}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block pl-1">Category Name</label>
                                    <input required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" placeholder="Ex: Dairy & Eggs" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={22} />
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={22} />
                                        <span>Update Category</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 border border-red-200"><AlertCircle size={24} /></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">Remove Category?</h3>
                        <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete <span className="font-bold text-gray-900">{selectedCategory?.name}</span>?</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={() => handleDelete(selectedCategory.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CategoriesManagement;
