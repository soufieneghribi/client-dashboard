import React from 'react';
import { FaMoneyBillWave, FaCreditCard, FaLock, FaShieldAlt, FaCheckCircle, FaPiggyBank, FaWallet, FaTag } from "react-icons/fa";
import { motion } from "framer-motion";

const PaymentMethodSection = ({ formData, handleInputChange, userProfile, setFormData }) => {
    const paymentMethods = [
        {
            id: 'cash',
            label: 'Paiement à la livraison',
            subtitle: 'Espèces',
            icon: FaMoneyBillWave,
            description: 'Payez en espèces lors de la réception',
            security: 'Paiement en main propre au livreur',
            color: 'from-green-500 to-emerald-600',
            bgColor: 'from-green-50 to-emerald-50',
            borderColor: 'border-green-200',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600'
        },
        {
            id: 'card',
            label: 'Carte bancaire',
            subtitle: 'Visa, Mastercard',
            icon: FaCreditCard,
            description: 'Paiement sécurisé en ligne',
            security: 'Cryptage SSL 256-bit • 3D Secure',
            color: 'from-blue-500 to-cyan-600',
            bgColor: 'from-blue-50 to-cyan-50',
            borderColor: 'border-blue-200',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Payment Methods */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method, index) => {
                    const Icon = method.icon;
                    const isSelected = formData.payment_method === method.id;

                    return (
                        <motion.button
                            key={method.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleInputChange({ target: { name: 'payment_method', value: method.id } })}
                            className={`relative p-6 rounded-2xl border-2 transition-all text-left ${isSelected
                                ? `bg-gradient-to-br ${method.bgColor} ${method.borderColor} shadow-lg sm:scale-105 scale-102`
                                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                                }`}
                        >
                            {/* Selected Indicator */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <FaCheckCircle className="text-white" size={16} />
                                </motion.div>
                            )}

                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-4 shadow-lg`}>
                                <Icon className="text-white" size={24} />
                            </div>

                            {/* Content */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    {method.label}
                                </h3>
                                <p className="text-sm text-gray-600 mb-1">{method.subtitle}</p>
                                <p className="text-xs text-gray-500 mb-4">{method.description}</p>

                                {/* Security Badge */}
                                <div className={`flex items-center gap-2 p-2.5 rounded-lg ${isSelected ? 'bg-white border border-gray-200' : 'bg-gray-50'
                                    }`}>
                                    <FaShieldAlt className={isSelected ? method.iconColor : 'text-gray-400'} size={14} />
                                    <span className="text-xs font-semibold text-gray-700">{method.security}</span>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Cagnotte Section */}
            {userProfile && parseFloat(userProfile.cagnotte_balance) > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm space-y-4"
                >
                    <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                        <div className="p-2.5 bg-pink-50 rounded-xl text-pink-600">
                            <FaPiggyBank size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Ma Cagnotte</h3>
                            <p className="text-sm text-gray-500 font-medium">Réduisez le montant de votre commande</p>
                        </div>
                    </div>

                    <div className={`p-5 rounded-2xl border-2 transition-all ${formData.cagnotte_deduction > 0
                        ? 'bg-green-50 border-green-200'
                        : 'bg-green-50/50 border-green-100/50'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${formData.cagnotte_deduction > 0 ? 'bg-green-500 text-white' : 'bg-white text-green-600'
                                    }`}>
                                    <FaWallet size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-green-900">Cagnotte disponible</p>
                                    <p className={`text-lg font-black ${formData.cagnotte_deduction > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                        {parseFloat(userProfile.cagnotte_balance).toFixed(2)} DT
                                    </p>
                                    <p className="text-xs text-green-600/70 font-semibold">disponible</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const isApplied = formData.cagnotte_deduction > 0;
                                    setFormData(prev => ({
                                        ...prev,
                                        cagnotte_deduction: isApplied ? 0 : parseFloat(userProfile.cagnotte_balance)
                                    }));
                                }}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm ${formData.cagnotte_deduction > 0
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-white text-green-600 border border-green-100 hover:bg-green-50'
                                    }`}
                            >
                                {formData.cagnotte_deduction > 0 ? 'Retirer' : '+ Appliquer'}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Savings Note if no promotions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4"
            >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                    <FaTag size={20} />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-gray-800">Aucune économie</h4>
                    <p className="text-sm text-gray-500">Ajoutez des articles en promotion pour économiser plus</p>
                </div>
            </motion.div>

            {/* Security Notice */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200 p-6"
            >
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                        <FaLock className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-lg font-bold text-emerald-900 mb-2">Paiement 100% Sécurisé</h4>
                        <p className="text-sm text-emerald-800 leading-relaxed">
                            Vos informations de paiement sont protégées par un cryptage SSL de niveau bancaire.
                            Nous ne stockons jamais vos données bancaires sur nos serveurs.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <div className="px-3 py-1.5 bg-white rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-700">
                                🔒 SSL 256-bit
                            </div>
                            <div className="px-3 py-1.5 bg-white rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-700">
                                ✓ 3D Secure
                            </div>
                            <div className="px-3 py-1.5 bg-white rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-700">
                                🛡️ PCI-DSS
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentMethodSection;
