import React from 'react';
import Modal from "react-modal";
import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";

const SuccessModal = ({ isOpen, closeModal, formData, totalAmount }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Confirmation de commande"
            className="outline-none"
            overlayClassName="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-[3.5rem] p-10 sm:p-14 w-full max-w-xl text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] relative overflow-hidden border border-slate-100"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-green-500/5 blur-[80px] rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full"></div>

                <div className="relative mb-10">
                    <div className="w-24 h-24 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-500 mx-auto shadow-inner border border-green-100/50">
                        <FaCheckCircle size={48} className="drop-shadow-sm" />
                    </div>
                    {/* Pulsing rings around success icon */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-green-500/10 rounded-full animate-ping pointer-events-none"></div>
                </div>

                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Merci ! 🥳</h2>
                <p className="text-slate-500 font-bold mb-10 leading-relaxed text-sm max-w-[280px] mx-auto">
                    Votre commande a été confirmée. <br />
                    Elle est en cours de préparation.
                </p>

                <div className="bg-slate-50/80 backdrop-blur-sm rounded-[2.5rem] p-8 mb-10 space-y-5 text-left border border-slate-200/50 shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paiement</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-xs font-black text-slate-900">
                                {formData.payment_method === "cash" ? "💰 ESPÈCES" : "💳 CARTE BANCAIRE"}
                            </span>
                        </div>
                    </div>

                    {formData.cagnotte_deduction > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cagnotte</span>
                            <span className="text-sm font-black text-blue-600">-{parseFloat(formData.cagnotte_deduction).toFixed(2)} DT</span>
                        </div>
                    )}

                    <div className="pt-5 border-t border-slate-200/80 flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total payé</span>
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">{totalAmount.toFixed(2)} <span className="text-sm font-black text-slate-400 uppercase">DT</span></span>
                        </div>
                        <div className="px-4 py-2 bg-green-500/10 text-green-600 rounded-2xl text-[10px] font-black uppercase tracking-wider border border-green-500/20">
                            Validé
                        </div>
                    </div>
                </div>

                <button
                    onClick={closeModal}
                    className="w-full py-5.5 bg-slate-900 hover:bg-[#0f172a] text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 shadow-2xl shadow-slate-900/20 active:scale-[0.98] relative overflow-hidden group"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -skew-x-12 -translate-x-full group-hover:animate-shine"></div>
                    <span className="relative z-10">Voir mes commandes</span>
                </button>
            </motion.div>
        </Modal>
    );
};

export default SuccessModal;
