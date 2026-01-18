import React from 'react';
import Modal from "react-modal";
import { motion } from "framer-motion";
import { FaCheckCircle, FaShoppingBag, FaArrowRight, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";

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
                {/* Decorative gradients */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-indigo-500 to-emerald-400"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-50 blur-[60px] rounded-full opacity-50"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-50 blur-[60px] rounded-full opacity-50"></div>

                <div className="relative mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-emerald-200"
                    >
                        <FaCheckCircle size={40} />
                    </motion.div>
                </div>

                <h2 className="text-4xl font-black text-[#2D2D5F] mb-3 tracking-tight">Merci ! 🥳</h2>
                <p className="text-slate-400 font-bold mb-10 leading-relaxed text-sm max-w-[280px] mx-auto">
                    Votre commande est validée ! Nous préparons vos produits avec soin.
                </p>

                <div className="bg-slate-50/50 rounded-[2.5rem] p-8 mb-10 space-y-5 text-left border border-slate-100/50">
                    <div className="flex justify-between items-center text-xs">
                        <span className="font-black uppercase tracking-widest text-slate-400">Paiement</span>
                        <div className="flex items-center gap-2 font-black text-[#2D2D5F]">
                            {formData.payment_method === "cash" ? <FaMoneyBillWave className="text-amber-500" /> : <FaCreditCard className="text-indigo-500" />}
                            <span>{formData.payment_method === "cash" ? "En espèces" : "Par carte"}</span>
                        </div>
                    </div>

                    <div className="h-px bg-slate-200/30 w-full"></div>

                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total payé</span>
                            <div className="flex items-baseline gap-1 mt-0.5">
                                <span className="text-3xl font-black text-[#2D2D5F] tracking-tighter">{totalAmount.toFixed(2)}</span>
                                <span className="text-xs font-black text-indigo-500">DT</span>
                            </div>
                        </div>
                        <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                            Confirmé
                        </div>
                    </div>
                </div>

                <button
                    onClick={closeModal}
                    className="group w-full py-5 bg-[#2D2D5F] hover:bg-[#1a1a3a] text-white rounded-[1.75rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-900/10 flex items-center justify-center gap-3 active:scale-95"
                >
                    <FaShoppingBag size={14} />
                    <span>Mes Commandes</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" size={12} />
                </button>
            </motion.div>
        </Modal>
    );
};

export default SuccessModal;
