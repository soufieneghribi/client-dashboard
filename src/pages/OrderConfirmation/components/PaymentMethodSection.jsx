import React from 'react';
import { FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import { motion } from "framer-motion";

const PaymentMethodSection = ({ formData, handleInputChange }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600">
                        <FaCreditCard size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Moyen de paiement</h2>
                        <p className="text-sm text-slate-400 font-medium">Choisissez comment vous souhaitez régler</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {[
                        { id: 'cash', label: 'Paiement à la livraison', icon: <FaMoneyBillWave />, desc: 'Payez en espèces lors de la réception' },
                        { id: 'card', label: 'Carte Bancaire', icon: <FaCreditCard />, desc: 'Paiement sécurisé en ligne' }
                    ].map((method) => (
                        <label
                            key={method.id}
                            className={`flex items-center p-6 rounded-[1.5rem] border-2 cursor-pointer transition-all hover:shadow-md ${formData.payment_method === method.id
                                ? 'border-orange-500 bg-orange-50 font-bold'
                                : 'border-slate-50 bg-slate-50 text-slate-500'
                                }`}
                        >
                            <input
                                type="radio"
                                name="payment_method"
                                value={method.id}
                                checked={formData.payment_method === method.id}
                                onChange={handleInputChange}
                                className="hidden"
                            />
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mr-4 ${formData.payment_method === method.id ? 'bg-orange-500 text-white' : 'bg-white text-slate-300 shadow-sm'
                                }`}>
                                {method.icon}
                            </div>
                            <div className="flex-1">
                                <div className={`text-lg ${formData.payment_method === method.id ? 'text-slate-900' : 'text-slate-500'}`}>{method.label}</div>
                                <div className="text-xs font-semibold opacity-60 uppercase tracking-wide mt-0.5">{method.desc}</div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.payment_method === method.id ? 'border-orange-500 bg-orange-500' : 'border-slate-200'
                                }`}>
                                {formData.payment_method === method.id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default PaymentMethodSection;
