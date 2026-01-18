import React from 'react';
import { FaCreditCard, FaMoneyBillWave, FaWallet } from "react-icons/fa";
import { motion } from "framer-motion";

const PaymentMethodSection = ({ formData, handleInputChange }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden mb-12"
        >
            <div className="p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                        <FaWallet size={20} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#2D2D5F] tracking-tight">Moyen de paiement</h2>
                        <p className="text-slate-400 font-medium mt-1">Sélectionnez votre mode de règlement préféré.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[
                        { id: 'cash', label: 'Espèces', icon: <FaMoneyBillWave />, desc: 'Paiement à la livraison', activeColor: 'amber' },
                        { id: 'card', label: 'Carte Bancaire', icon: <FaCreditCard />, desc: 'Paiement en ligne sécurisé', activeColor: 'indigo' }
                    ].map((method) => {
                        const isSelected = formData.payment_method === method.id;
                        return (
                            <label
                                key={method.id}
                                className={`relative flex flex-col p-8 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 ${isSelected
                                    ? `border-[#2D2D5F] bg-white shadow-2xl shadow-indigo-900/10`
                                    : 'border-slate-100 bg-slate-50/30 text-slate-400 hover:border-slate-200 hover:bg-white'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value={method.id}
                                    checked={isSelected}
                                    onChange={handleInputChange}
                                    className="hidden"
                                />

                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${isSelected ? 'bg-[#2D2D5F] text-white shadow-lg' : 'bg-white text-slate-300 shadow-sm'}`}>
                                        {method.icon}
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-[#2D2D5F] bg-[#2D2D5F]' : 'border-slate-200'}`}>
                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                </div>

                                <div>
                                    <div className={`text-lg font-black tracking-tight ${isSelected ? 'text-[#2D2D5F]' : 'text-slate-600'}`}>{method.label}</div>
                                    <div className={`text-xs font-bold mt-1 uppercase tracking-widest ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`}>{method.desc}</div>
                                </div>
                            </label>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default PaymentMethodSection;
