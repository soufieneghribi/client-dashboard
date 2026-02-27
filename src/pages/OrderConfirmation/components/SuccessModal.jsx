import React from 'react';
import Modal from "react-modal";
import { motion } from "framer-motion";
import { FaCheck, FaShoppingBag, FaArrowRight, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";

const SuccessModal = ({ isOpen, closeModal, formData, totalAmount }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeModal}
            contentLabel="Confirmation de commande"
            className="outline-none"
            overlayClassName="fixed inset-0 bg-[#2D2D5F]/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 40 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-white rounded-[3.5rem] p-8 sm:p-12 w-full max-w-md text-center shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] relative overflow-hidden"
            >
                {/* Decorative gradients top */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400"></div>

                <div className="relative mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-24 h-24 bg-[#10b981] rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-200"
                    >
                        <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
                            <FaCheck size={32} />
                        </div>
                    </motion.div>
                </div>

                <h2 className="text-5xl font-black text-[#2D2D5F] mb-4 tracking-tight">Merci ! 🥳</h2>
                <p className="text-slate-400 font-semibold mb-10 leading-relaxed text-base max-w-[300px] mx-auto">
                    Votre commande est validée ! Nous préparons vos produits avec soin.
                </p>

                <div className="bg-white rounded-[2.5rem] p-8 mb-10 space-y-6 text-left border-2 border-slate-50 shadow-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">PAIEMENT</span>
                        <div className="flex items-center gap-2 font-black text-[#2D2D5F] text-sm">
                            {formData.payment_method === "cash" ? <FaMoneyBillWave className="text-[#f59e0b]" /> : <FaCreditCard className="text-[#6366f1]" />}
                            <span>{formData.payment_method === "cash" ? "En espèces" : "Par carte"}</span>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100 w-full"></div>

                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">TOTAL PAYÉ</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-4xl font-black text-[#2D2D5F] tracking-tighter">{totalAmount.toFixed(2)}</span>
                                <span className="text-sm font-black text-[#6366f1] tracking-widest uppercase">DT</span>
                            </div>
                        </div>
                        <div className="px-5 py-2.5 bg-[#ecfdf5] text-[#10b981] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[#d1fae5]">
                            CONFIRMÉ
                        </div>
                    </div>
                </div>

                <button
                    onClick={closeModal}
                    className="group w-full py-6 bg-[#2D2D5F] hover:bg-[#252550] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-indigo-900/20 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                    <FaShoppingBag size={14} className="opacity-80" />
                    <span>MES COMMANDES</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform opacity-80" size={12} />
                </button>
            </motion.div>
        </Modal>
    );
};

export default SuccessModal;

