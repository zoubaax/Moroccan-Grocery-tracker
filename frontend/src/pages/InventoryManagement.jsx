import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { 
    Package, 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    X, 
    Check, 
    Loader2, 
    Image as ImageIcon,
    Barcode,
    Tag,
    AlertCircle,
    CheckCircle,
    Camera
} from 'lucide-react';

const InventoryManagement = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Status & Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    // Form State
    const [formData, setFormData] = useState({
        name: '', barcode: '', price: '', stockQuantity: '', description: '', category: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (imageFile) data.append('image', imageFile);

        try {
            await api.post('/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus({ type: 'success', message: 'Product added successfully!' });
            setFormData({ name: '', barcode: '', price: '', stockQuantity: '', description: '', category: '' });
            setImageFile(null);
            setImagePreview(null);
            fetchProducts();
            setTimeout(() => setShowAddModal(false), 1500);
        } catch (error) {
            setStatus({ type: 'error', message: 'Failed to add product.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter(p => p.id !== id));
            setShowDeleteConfirm(false);
        } catch (error) {
            alert("Deletion failed");
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.barcode?.includes(searchQuery)
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Inventory Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Add, update and track your store products</p>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 font-semibold"
                    >
                        <Plus size={20} />
                        Add New Product
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name or barcode scanner..."
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
                        <p className="text-gray-500 font-medium">Scanning warehouse...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                                    {product.imageUrl ? (
                                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ImageIcon size={48} />
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-gray-100 shadow-sm">
                                        <p className="text-indigo-600 font-bold text-sm tracking-tight">{product.price} MAD</p>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{product.category || 'NO CATEGORY'}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit size={16} /></button>
                                            <button onClick={() => { setSelectedProduct(product); setShowDeleteConfirm(true); }} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs mt-4 pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-1.5 text-gray-500">
                                            <Barcode size={14} />
                                            <span>{product.barcode || 'NO BARCODE'}</span>
                                        </div>
                                        <div className={`font-bold ${product.stockQuantity < 10 ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'} px-2 py-0.5 rounded-lg`}>
                                            Stock: {product.stockQuantity}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-100"><Package size={20} /></div>
                                <div><h3 className="text-xl font-bold text-gray-900 leading-none mb-1">New Inventory Entry</h3><p className="text-xs text-gray-500 font-medium">Add a digital record for a new product</p></div>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleAddProduct} className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            {status.message && (
                                <div className={`p-4 rounded-xl flex items-center gap-3 mb-6 font-semibold text-sm ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                                    {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                    {status.message}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Left Column: Media */}
                                <div className="space-y-4">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block pl-1">Product Visual</label>
                                    <div 
                                        className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center relative group cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all overflow-hidden"
                                        onClick={() => document.getElementById('image-upload').click()}
                                    >
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Camera className="text-white" size={32} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="bg-white p-4 rounded-2xl shadow-sm text-gray-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all"><Camera size={32} /></div>
                                                <p className="mt-4 text-xs font-bold text-gray-400 group-hover:text-indigo-600">CLICK TO UPLOAD IMAGE</p>
                                            </>
                                        )}
                                        <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </div>
                                </div>

                                {/* Right Column: Core Info */}
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block pl-1">Name</label>
                                        <input required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" placeholder="Ex: Lait Jaouda 1L" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block pl-1">Barcode (EAN-13)</label>
                                        <div className="relative">
                                            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input required className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold tracking-widest" placeholder="Scan or type barcode" value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block pl-1">Price (MAD)</label>
                                            <input required type="number" step="0.01" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block pl-1">Quantity</label>
                                            <input required type="number" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold" placeholder="0" value={formData.stockQuantity} onChange={(e) => setFormData({...formData, stockQuantity: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block pl-1">Category</label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <select className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none appearance-none cursor-pointer font-bold text-gray-800" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                                <option value="">Select Category</option>
                                                <option value="Dairy">Dairy & Eggs</option>
                                                <option value="Bakery">Bakery</option>
                                                <option value="Produce">Produce</option>
                                                <option value="Snacks">Snacks & Sweets</option>
                                                <option value="Beverages">Beverages</option>
                                                <option value="Household">Household</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" size={22} />
                                        <span>Uploading to Cloudinary...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={22} />
                                        <span>Confirm and Save Entry</span>
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
                        <h3 className="text-xl font-bold text-gray-900 mb-1 tracking-tight">Remove Product?</h3>
                        <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete <span className="font-bold text-gray-900">{selectedProduct?.name}</span>? This inventory record will be lost.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                            <button onClick={() => handleDelete(selectedProduct.id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default InventoryManagement;
