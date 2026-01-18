import React from 'react';
import { FaChevronRight, FaBoxOpen, FaWallet, FaCheckCircle, FaShoppingBag, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

const OrderSummarySection = ({
    orderDetails,
    subtotal,
    formData,
    isCalculatingFee,
    totalAmount,
    handleSubmit,
    isSubmitting,
    tokenValid,
    geolocationStatus
}) => {
    return (
        <div className="lg:col-span-4 lg:sticky lg:top-8 self-start">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(45,45,95,0.12)] border border-slate-50 overflow-hidden"
            >
                {/* Header Decoration */}
                <div className="bg-[#2D2D5F] p-10 text-white relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 opacity-10 rotate-12 scale-150">
                        <FaShoppingBag size={120} />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                            <FaBoxOpen size={20} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Résumé</h3>
                            <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mt-2">{orderDetails.length} articles</p>
                        </div>
                    </div>
                </div>

                <div className="p-10">
                    {/* Items List */}
                    <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar custom-scrollbar-light">
                        {orderDetails.map((item, index) => (
                            <div key={index} className="flex justify-between items-start group">
                                <div className="flex gap-4 min-w-0">
                                    <div className="flex-shrink-0 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                                        <span className="text-[10px] font-black text-slate-400 group-hover:text-indigo-600">x{item.quantity}</span>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-slate-700 text-sm leading-tight truncate group-hover:text-indigo-900 transition-colors">{item.name}</span>
                                        {item.isPromotion && (
                                            <div className="flex items-center gap-1 mt-1">
                                                <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                                                <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Exclu Web</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                    <div className="font-black text-[#2D2D5F] text-sm">
                                        {(item.price * item.quantity).toFixed(2)}
                                        <span className="text-[10px] text-slate-300 ml-1">DT</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Financial Breakdown */}
                    <div className="mt-10 pt-10 border-t border-slate-50 space-y-5">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Sous-total</span>
                            <span className="font-black text-slate-600 text-sm">{subtotal.toFixed(2)} DT</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Livraison</span>
                            <div className="font-black">
                                {isCalculatingFee ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                                        <span className="text-indigo-500 text-[10px] uppercase tracking-widest">Calcul...</span>
                                    </div>
                                ) : (
                                    formData.delivery_fee === 0 ? (
                                        <span className="text-emerald-500 text-[10px] font-black tracking-[0.2em] bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">GRATUIT</span>
                                    ) : (
                                        <span className="text-slate-600 text-sm font-black">{formData.delivery_fee.toFixed(2)} DT</span>
                                    )
                                )}
                            </div>
                        </div>

                        {formData.cagnotte_deduction > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex justify-between items-center bg-indigo-50/50 p-5 rounded-[2rem] border border-indigo-100/50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                                        <FaWallet size={14} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#2D2D5F]">Cagnotte appliquée</span>
                                </div>
                                <span className="font-black text-indigo-600 text-sm">-{parseFloat(formData.cagnotte_deduction).toFixed(2)} DT</span>
                            </motion.div>
                        )}

                        <div className="pt-10 mt-6 border-t-2 border-dashed border-slate-100 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 pl-1">Total à régler</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-[#2D2D5F] tracking-tighter tabular-nums">{totalAmount.toFixed(2)}</span>
                                    <span className="text-sm font-black text-indigo-500">DT</span>
                                </div>
                            </div>
                            <div className="text-emerald-500 bg-emerald-50 w-14 h-14 rounded-3xl flex items-center justify-center border border-emerald-100 shadow-sm">
                                <FaCheckCircle size={28} />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !tokenValid || (formData.order_type === 'delivery' && geolocationStatus === 'loading')}
                        className={`group w-full mt-10 py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-4 ${isSubmitting || !tokenValid || (formData.order_type === 'delivery' && geolocationStatus === 'loading')
                                ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none'
                                : 'bg-[#2D2D5F] text-white hover:bg-[#1a1a3a] shadow-indigo-900/20'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                                <span>Traitement...</span>
                            </>
                        ) : (
                            <>
                                <span>Confirmer l'achat</span>
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {formData.order_type === 'delivery' && geolocationStatus === 'loading' && (
                        <p className="text-center text-[9px] font-black text-amber-500 tracking-[0.2em] uppercase mt-5 animate-pulse">
                            Veuillez autoriser la localisation
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSummarySection;
