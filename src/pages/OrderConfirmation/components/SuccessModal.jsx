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
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[3rem] p-8 sm:p-12 w-full max-w-xl text-center shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"></div>

                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-8 shadow-inner">
                    <FaCheckCircle size={50} />
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Commande confirmée ! 🥳</h2>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    Votre commande a été enregistrée avec succès. <br />
                    Un email de confirmation vous a été envoyé.
                </p>

                <div className="bg-slate-50 rounded-[2rem] p-8 mb-8 space-y-4 text-left border border-slate-100">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-bold uppercase tracking-widest">Paiement</span>
                        <span className="text-slate-900 font-black">
                            {formData.payment_method === "cash" ? "💰 Espèces" : "💳 Carte Bancaire"}
                        </span>
                    </div>
                    {formData.cagnotte_deduction > 0 && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400 font-bold uppercase tracking-widest">Cagnotte</span>
                            <span className="text-blue-600 font-black">-{formData.cagnotte_deduction.toFixed(2)} DT</span>
                        </div>
                    )}
                    <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-slate-900 font-black text-lg">Montant total</span>
                        <span className="text-blue-600 font-black text-2xl tracking-tighter">{totalAmount.toFixed(2)} DT</span>
                    </div>
                </div>

                <button
                    onClick={closeModal}
                    className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-3xl font-black text-lg transition-all shadow-xl shadow-slate-200"
                >
                    VOIR MES COMMANDES
                </button>
            </motion.div>
        </Modal>
    );
};

export default SuccessModal;
