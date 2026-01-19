import React, { useState } from 'react';
import { FaShoppingCart, FaChevronDown, FaTruck, FaWallet, FaCheckCircle, FaBox, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingSummary = ({ orderDetails, subtotal, deliveryFee, cagnotteDeduction, totalAmount, isCalculatingFee }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:sticky lg:top-8 self-start"
        >
            {/* Premium Card with Gradient */}
            <div className="relative overflow-hidden rounded-[2rem] shadow-[0_20px_60px_-10px_rgba(79,70,229,0.3)] border border-indigo-100/50">
                {/* Vibrant Purple Gradient Header */}
                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 overflow-hidden">
                    {/* Animated Background Orbs */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl"></div>

                    {/* Header Content */}
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                                    <FaShoppingCart className="text-white" size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black text-white tracking-tight">PANIER</h3>
                                        <div className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                                            <span className="text-xs font-black text-white">{orderDetails.length}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold text-white/70 uppercase tracking-wider mt-0.5">
                                        {orderDetails.length} article{orderDetails.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Toggle Button */}
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all"
                            >
                                <motion.div
                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <FaChevronDown className="text-white" size={14} />
                                </motion.div>
                            </button>
                        </div>

                        {/* Total Amount - Always Visible */}
                        <div className="mt-6 pt-6 border-t border-white/20">
                            <div className="flex items-baseline justify-between">
                                <span className="text-xs font-black text-white/70 uppercase tracking-[0.2em]">Total à régler</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white tabular-nums tracking-tight">
                                        {totalAmount.toFixed(2)}
                                    </span>
                                    <span className="text-lg font-black text-white/80">DT</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expandable Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden bg-white"
                        >
                            <div className="p-6 space-y-6">
                                {/* Items List */}
                                <div>
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <FaBox size={12} className="text-indigo-500" />
                                        Vos articles
                                    </h4>
                                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {orderDetails.map((item, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group flex items-start gap-3 p-3 bg-gradient-to-r from-slate-50 to-indigo-50/30 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all"
                                            >
                                                {/* Quantity Badge */}
                                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                                    <span className="text-sm font-black text-white">×{item.quantity}</span>
                                                </div>

                                                {/* Item Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h5 className="font-bold text-sm text-slate-800 leading-tight line-clamp-2 group-hover:text-indigo-900 transition-colors">
                                                        {item.name}
                                                    </h5>
                                                    {item.isPromotion && (
                                                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full">
                                                            <span className="text-[8px] font-black text-white uppercase tracking-wider">Promo</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Price */}
                                                <div className="flex-shrink-0 text-right">
                                                    <div className="text-base font-black text-indigo-600">
                                                        {(item.price * item.quantity).toFixed(2)}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-slate-400">DT</div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Breakdown */}
                                <div className="pt-6 border-t-2 border-dashed border-slate-200 space-y-4">
                                    {/* Subtotal */}
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-bold text-slate-600">Sous-total</span>
                                        <span className="text-base font-black text-slate-800">{subtotal.toFixed(2)} DT</span>
                                    </div>

                                    {/* Delivery Fee */}
                                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                <FaTruck className="text-indigo-500" size={14} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-600">Livraison</span>
                                        </div>
                                        {isCalculatingFee ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                                                <span className="text-xs text-indigo-500 font-bold">Calcul...</span>
                                            </div>
                                        ) : deliveryFee === 0 ? (
                                            <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-lg shadow-emerald-500/30">
                                                <span className="text-xs font-black text-white uppercase tracking-wider">Gratuit</span>
                                            </div>
                                        ) : (
                                            <span className="text-base font-black text-slate-800">{deliveryFee.toFixed(2)} DT</span>
                                        )}
                                    </div>

                                    {/* Cagnotte Deduction */}
                                    {cagnotteDeduction > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                                    <FaWallet className="text-white" size={12} />
                                                </div>
                                                <span className="text-sm font-bold text-indigo-900">Cagnotte</span>
                                            </div>
                                            <span className="text-base font-black text-indigo-600">-{cagnotteDeduction.toFixed(2)} DT</span>
                                        </motion.div>
                                    )}

                                    {/* Total */}
                                    <div className="pt-4 mt-4 border-t-2 border-slate-200">
                                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200">
                                            <div>
                                                <div className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-1">Total</div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-black text-indigo-900 tabular-nums tracking-tight">
                                                        {totalAmount.toFixed(2)}
                                                    </span>
                                                    <span className="text-sm font-black text-indigo-600">DT</span>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                                                <FaCheckCircle className="text-white" size={24} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Badge */}
                                <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-emerald-700">Paiement 100% sécurisé</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #6366f1, #a855f7);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #4f46e5, #9333ea);
                }
            `}</style>
        </motion.div>
    );
};

export default FloatingSummary;
