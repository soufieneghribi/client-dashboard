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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-blue-900/20 overflow-hidden"
            >
                <div className="p-8">
                    <h3 className="text-2xl font-black mb-8 tracking-tight flex items-center gap-3">
                        <span className="p-2 bg-blue-600 rounded-lg"><FaChevronRight className="animate-pulse" /></span>
                        Résumé
                    </h3>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {orderDetails.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm tracking-tight truncate max-w-[150px]">{item.name}</span>
                                        <span className="text-[10px] bg-blue-600 px-2 py-0.5 rounded-full font-black">X{item.quantity}</span>
                                    </div>
                                    {item.isPromotion && (
                                        <span className="text-[9px] font-black uppercase tracking-tighter text-blue-400">🏷️ EXCLUSIVITÉ WEB</span>
                                    )}
                                </div>
                                <div className="text-right">
                                    {item.isPromotion && item.Initialprice && (
                                        <div className="text-[10px] text-white/30 line-through">{(item.Initialprice * item.quantity).toFixed(2)}</div>
                                    )}
                                    <span className="font-black text-blue-400">{(item.price * item.quantity).toFixed(2)} <span className="text-[10px]">DT</span></span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/10 space-y-4 font-bold text-sm">
                        <div className="flex justify-between text-white/50">
                            <span>Sous-total</span>
                            <span className="text-white">{subtotal.toFixed(2)} DT</span>
                        </div>

                        <div className="flex justify-between text-white/50">
                            <span>Livraison</span>
                            <span className={formData.delivery_fee === 0 && !isCalculatingFee ? 'text-green-400 font-extrabold' : 'text-white uppercase text-[10px]'}>
                                {isCalculatingFee ? (
                                    <span className="flex items-center gap-2 text-orange-400">
                                        <div className="animate-spin h-3 w-3 border-2 border-orange-400 border-t-transparent rounded-full"></div>
                                        CALCUL EN COURS...
                                    </span>
                                ) : (
                                    formData.delivery_fee === 0 ? 'GRATUIT' : `${formData.delivery_fee.toFixed(2)} DT`
                                )}
                            </span>
                        </div>

                        {formData.cagnotte_deduction > 0 && (
                            <div className="flex justify-between text-blue-400 bg-blue-400/10 p-4 rounded-2xl border border-blue-400/20">
                                <div className="flex items-center gap-2">
                                    <FaWallet />
                                    <span>Réduction Cagnotte</span>
                                </div>
                                <span className="font-black">-{parseFloat(formData.cagnotte_deduction).toFixed(2)} DT</span>
                            </div>
                        )}

                        <div className="pt-6 mt-6 border-t-[3px] border-white/5 border-dashed">
                            <div className="flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-black text-white/40 tracking-widest">Total à régler</span>
                                    <span className="text-3xl font-black text-white tracking-tighter">{totalAmount.toFixed(2)} <span className="text-lg">DT</span></span>
                                </div>
                                <div className="text-7xl opacity-5 -mr-4">🛒</div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !tokenValid || (formData.order_type === 'delivery' && geolocationStatus === 'loading')}
                        className={`w-full mt-8 py-5 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${isSubmitting || !tokenValid || (formData.order_type === 'delivery' && geolocationStatus === 'loading')
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white shadow-blue-900/40'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-3">
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                <span className="uppercase tracking-widest">Traitement...</span>
                            </div>
                        ) : formData.order_type === 'delivery' && geolocationStatus === 'loading' ? (
                            '⏳ LOCALISATION...'
                        ) : (
                            <>
                                <FaCheckCircle />
                                <span className="uppercase tracking-widest">Confirmer</span>
                            </>
                        )}
                    </button>

                    {formData.order_type === 'delivery' && geolocationStatus === 'loading' && (
                        <p className="text-center text-[10px] font-bold text-orange-400 mt-4 uppercase tracking-tighter">
                            ⚠️ Validation de position requise
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default OrderSummarySection;
