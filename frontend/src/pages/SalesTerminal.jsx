import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { 
  ShoppingBag, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Printer, 
  X, 
  CheckCircle2, 
  Loader2, 
  Barcode,
  Package,
  ArrowRight,
  AlertCircle,
  Receipt,
  ShoppingCart,
  Zap,
  DollarSign,
  Smartphone,
  QrCode,
  Scan,
  ClipboardList,
  TrendingUp,
  User,
  Clock
} from 'lucide-react';

const SalesTerminal = () => {
    const [cart, setCart] = useState([]);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [customerInfo, setCustomerInfo] = useState(null);
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [customerPhone, setCustomerPhone] = useState('');
    const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
    
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, [cart, barcodeInput]);

    const handleBarcodeSubmit = async (e) => {
        e.preventDefault();
        if (!barcodeInput) return;

        try {
            const response = await api.get(`/products/barcode/${barcodeInput}`);
            const product = response.data;
            
            if (product && product.stock > 0) {
                addToCart(product);
                setBarcodeInput('');
                setStatus({ type: 'success', message: `${product.name} added to cart` });
                setTimeout(() => setStatus({ type: '', message: '' }), 1500);
            } else if (product && product.stock === 0) {
                setStatus({ type: 'error', message: 'Product out of stock!' });
                setTimeout(() => setStatus({ type: '', message: '' }), 2000);
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Product not found. Check barcode.' });
            setTimeout(() => setStatus({ type: '', message: '' }), 2000);
        }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.quantity + 1 > product.stock) {
                    setStatus({ type: 'error', message: 'Not enough stock!' });
                    setTimeout(() => setStatus({ type: '', message: '' }), 2000);
                    return prev;
                }
                return prev.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                if (newQty > item.stock) {
                    setStatus({ type: 'error', message: 'Not enough stock!' });
                    setTimeout(() => setStatus({ type: '', message: '' }), 2000);
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleCustomerSearch = async () => {
        if (!customerPhone) return;
        setIsSearchingCustomer(true);
        try {
            const response = await api.get(`/users/phone/${customerPhone}`);
            if (response.data) {
                setCustomerInfo(response.data);
                setStatus({ type: 'success', message: 'Customer found!' });
                setTimeout(() => setStatus({ type: '', message: '' }), 1500);
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Customer not found' });
            setTimeout(() => setStatus({ type: '', message: '' }), 2000);
        } finally {
            setIsSearchingCustomer(false);
        }
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const tax = total * 0.2; // 20% VAT
    const grandTotal = total + tax;

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);
        setStatus({ type: '', message: '' });

        const saleData = {
            paymentMethod,
            items: cart.map(item => ({
                barcode: item.barcode,
                quantity: item.quantity
            })),
            customerId: customerInfo?.id,
            total: grandTotal
        };

        try {
            const response = await api.post('/sales/process', saleData);
            setStatus({ type: 'success', message: 'Sale completed successfully!' });
            setCart([]);
            setCustomerInfo(null);
            setTimeout(() => {
                setStatus({ type: '', message: '' });
                if (inputRef.current) inputRef.current.focus();
            }, 2000);
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Transaction failed.' });
        } finally {
            setIsProcessing(false);
        }
    };

    const quickProducts = [
        { id: 1, name: 'Bread', price: 5, barcode: '123456' },
        { id: 2, name: 'Milk', price: 8, barcode: '123457' },
        { id: 3, name: 'Eggs', price: 12, barcode: '123458' },
        { id: 4, name: 'Sugar', price: 10, barcode: '123459' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">Point of Sale</h1>
                        <p className="text-gray-500 text-sm mt-1">Fast checkout with barcode scanning</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                        <Scan size={16} />
                        <span>Scan mode active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Side: Scanning & Cart */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Barcode Scanner */}
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <Barcode size={18} className="text-indigo-600" />
                                </div>
                                <h2 className="font-semibold text-gray-900">Scan Products</h2>
                            </div>
                            
                            <form onSubmit={handleBarcodeSubmit} className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Scan barcode or enter product code..."
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-mono"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    autoFocus
                                />
                            </form>

                            {/* Quick Products */}
                            <div className="mt-4">
                                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                                    <Zap size={12} />
                                    Quick add
                                </p>
                                <div className="flex gap-2">
                                    {quickProducts.map(product => (
                                        <button
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-medium text-gray-700 transition-colors"
                                        >
                                            {product.name} - {product.price} DH
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart size={18} className="text-gray-400" />
                                        <h3 className="font-semibold text-gray-900">Current Order</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{itemCount} items</span>
                                    </div>
                                    {cart.length > 0 && (
                                        <button 
                                            onClick={() => setCart([])}
                                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="max-h-[400px] overflow-y-auto">
                                {cart.length === 0 ? (
                                    <div className="py-16 text-center">
                                        <ShoppingBag size={48} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm">Cart is empty</p>
                                        <p className="text-xs text-gray-400 mt-1">Scan products to add them</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-50">
                                        {cart.map((item) => (
                                            <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                            <Package size={18} className="text-gray-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                                                            <p className="text-xs text-gray-400 font-mono">{item.barcode}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                                                            <button 
                                                                onClick={() => updateQuantity(item.id, -1)}
                                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <span className="text-sm font-medium min-w-[30px] text-center">{item.quantity}</span>
                                                            <button 
                                                                onClick={() => updateQuantity(item.id, 1)}
                                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>
                                                        <div className="text-right min-w-[80px]">
                                                            <p className="font-semibold text-gray-900">{(item.price * item.quantity).toFixed(2)} DH</p>
                                                            <p className="text-xs text-gray-400">{item.price} DH each</p>
                                                        </div>
                                                        <button 
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Payment & Checkout */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Receipt size={18} className="text-gray-400" />
                                <h3 className="font-semibold text-gray-900">Order Summary</h3>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal</span>
                                    <span className="font-medium text-gray-900">{total.toFixed(2)} DH</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Tax (20% VAT)</span>
                                    <span className="font-medium text-gray-900">{tax.toFixed(2)} DH</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-gray-900">Total</span>
                                        <span className="text-2xl font-bold text-indigo-600">{grandTotal.toFixed(2)} DH</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Customer Section */}
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <User size={18} className="text-gray-400" />
                                <h3 className="font-semibold text-gray-900">Customer</h3>
                            </div>
                            
                            {customerInfo ? (
                                <div className="bg-indigo-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{customerInfo.name}</p>
                                            <p className="text-xs text-gray-500">{customerInfo.phone}</p>
                                        </div>
                                        <button 
                                            onClick={() => setCustomerInfo(null)}
                                            className="text-xs text-gray-500 hover:text-gray-700"
                                        >
                                            Change
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="tel"
                                        placeholder="Phone number"
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                    />
                                    <button
                                        onClick={handleCustomerSearch}
                                        disabled={isSearchingCustomer}
                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        {isSearchingCustomer ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <CreditCard size={18} className="text-gray-400" />
                                <h3 className="font-semibold text-gray-900">Payment Method</h3>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setPaymentMethod('CASH')}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'CASH' 
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <Banknote size={18} />
                                    <span className="font-medium text-sm">Cash</span>
                                </button>
                                <button 
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                                        paymentMethod === 'CARD' 
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                                            : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <CreditCard size={18} />
                                    <span className="font-medium text-sm">Card</span>
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            {/* Status Message */}
                            {status.message && (
                                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
                                    status.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                }`}>
                                    {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                                    {status.message}
                                </div>
                            )}

                            {/* Checkout Button */}
                            <button 
                                onClick={handleCheckout}
                                disabled={isProcessing || cart.length === 0}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Complete Sale
                                    </>
                                )}
                            </button>

                            {/* Print Receipt */}
                            <button 
                                disabled={cart.length === 0}
                                className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Printer size={18} />
                                Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SalesTerminal;