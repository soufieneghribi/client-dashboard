import React from 'react';
import { FaChevronRight, FaBoxOpen, FaWallet, FaCheckCircle } from "react-icons/fa";
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
        <div className="lg:col-span-4 sticky top-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#0f172a] text-white rounded-[2.5rem] shadow-2xl shadow-blue-900/40 relative overflow-hidden border border-white/5"
            >
                {/* Decorative background flare */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 blur-[80px] rounded-full"></div>

                <div className="p-7 sm:p-9 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                            <span className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-xs shadow-lg shadow-blue-600/40">
                                <FaChevronRight />
                            </span>
                            Résumé
                        </h3>
                        <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                            {orderDetails.length} articles
                        </div>
                    </div>

                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                        {orderDetails.map((item, index) => (
                            <div key={index} className="flex justify-between items-center group bg-white/[0.03] hover:bg-white/[0.05] p-3.5 rounded-2xl border border-white/5 transition-all duration-300">
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm tracking-tight truncate max-w-[140px] text-white/90 group-hover:text-white transition-colors">{item.name}</span>
                                        <div className="flex items-center justify-center min-w-[24px] h-5 bg-blue-600/20 text-blue-400 rounded-lg text-[9px] font-black border border-blue-400/20">
                                            ×{item.quantity}
                                        </div>
                                    </div>
                                    {item.isPromotion && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-600/10 rounded-md w-fit">
                                            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                                            <span className="text-[8px] font-black uppercase tracking-wider text-blue-400">Exclu Web</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    {item.isPromotion && item.Initialprice && (
                                        <div className="text-[10px] text-white/20 line-through decoration-blue-500/30">{(item.Initialprice * item.quantity).toFixed(2)}</div>
                                    )}
                                    <div className="font-extrabold text-white text-sm">{(item.price * item.quantity).toFixed(2)} <span className="text-[9px] text-white/40">DT</span></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold px-2">
                            <span className="text-white/40 uppercase tracking-widest">Sous-total</span>
                            <span className="text-white/90 font-black tabular-nums">{subtotal.toFixed(2)} DT</span>
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold px-2">
                            <span className="text-white/40 uppercase tracking-widest">Livraison</span>
                            <div className={formData.delivery_fee === 0 && !isCalculatingFee ? 'bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20' : 'text-white tabular-nums'}>
                                {isCalculatingFee ? (
                                    <div className="flex items-center gap-2 text-orange-400 text-[10px] animate-pulse">
                                        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping"></div>
                                        CALCUL...
                                    </div>
                                ) : (
                                    formData.delivery_fee === 0 ? <span className="text-[10px] font-black tracking-widest">GRATUIT</span> : <span className="tabular-nums font-black">{formData.delivery_fee.toFixed(2)} DT</span>
                                )}
                            </div>
                        </div>

                        {formData.cagnotte_deduction > 0 && (
                            <div className="flex justify-between items-center bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20 transition-all duration-300">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm shadow-inner">
                                        <FaWallet />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 -mb-1">Cagnotte</div>
                                        <span className="text-xs font-bold text-white/90">Réduction appliquée</span>
                                    </div>
                                </div>
                                <span className="font-black text-blue-400 tabular-nums">-{parseFloat(formData.cagnotte_deduction).toFixed(2)} DT</span>
                            </div>
                        )}

                        <div className="pt-7 mt-7 border-t-[2px] border-white/5 border-dashed relative">
                            {/* Decorative total flare */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-20 bg-blue-600/5 blur-3xl -z-10"></div>

                            <div className="flex justify-between items-end">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] uppercase font-black text-white/30 tracking-[0.2em]">Total Final</span>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-4xl font-black text-white tracking-tighter tabular-nums">{totalAmount.toFixed(2)}</span>
                                        <span className="text-sm font-black text-blue-500 uppercase">DT</span>
                                    </div>
                                </div>
                                <div className="text-7xl absolute -right-4 -bottom-4 opacity-5 pointer-events-none select-none grayscale invert">🛒</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !tokenValid || (formData.order_type === 'delivery' && geolocationStatus === 'loading')}
                        className={`w-full mt-8 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.15em] transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group shadow-2xl ${isSubmitting || !tokenValid || (formData.order_type === 'delivery' && geolocationStatus === 'loading')
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40 active:scale-[0.98]'
                            }`}
                    >
                        {/* Shine effect for button */}
                        <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shine"></div>

                        {isSubmitting ? (
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                <span className="animate-pulse">Traitement...</span>
                            </div>
                        ) : formData.order_type === 'delivery' && geolocationStatus === 'loading' ? (
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
                                <span>Localisation...</span>
                            </div>
                        ) : (
                            <>
                                <FaCheckCircle className="text-lg" />
                                <span>Commander</span>
                            </>
                        )}
                    </button>

                    {formData.order_type === 'delivery' && geolocationStatus === 'loading' && (
                        <div className="mt-4 flex items-center justify-center gap-2 py-2 px-4 bg-orange-400/10 rounded-xl border border-orange-400/20">
                            <div className="w-1 h-1 bg-orange-400 rounded-full"></div>
                            <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Validation de position requise</span>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSummarySection;
