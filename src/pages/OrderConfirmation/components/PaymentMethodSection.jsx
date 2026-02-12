import React from 'react';
import { FaMoneyBillWave, FaCreditCard, FaLock, FaShieldAlt, FaCheckCircle, FaWallet, FaPercent } from "react-icons/fa";
import { motion } from "framer-motion";

const PaymentMethodSection = ({ formData, handleInputChange, userProfile, setFormData }) => {
    const paymentMethods = [
        {
            id: 'cash',
            label: 'Paiement à la livraison',
            subtitle: 'Espèces',
            icon: FaMoneyBillWave,
            description: 'Payez en espèces au livreur',
            gradient: 'from-emerald-500 to-teal-600',
            lightBg: 'from-emerald-50 to-teal-50',
            borderColor: 'border-emerald-300',
            iconColor: 'text-emerald-600'
        },
        {
            id: 'card',
            label: 'Carte bancaire',
            subtitle: 'Visa, Mastercard',
            icon: FaCreditCard,
            description: 'Paiement sécurisé en ligne',
            gradient: 'from-blue-500 to-indigo-600',
            lightBg: 'from-blue-50 to-indigo-50',
            borderColor: 'border-blue-300',
            iconColor: 'text-blue-600'
        }
    ];

    const cagnotteBalance = userProfile ? parseFloat(userProfile.cagnotte_balance) : 0;
    const hasCagnotte = cagnotteBalance > 0;
    const isCagnotteApplied = formData.cagnotte_deduction > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Payment Methods Card */}
            <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 lg:p-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                            <FaWallet className="text-white text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl lg:text-2xl font-black text-white">
                                Mode de paiement
                            </h2>
                            <p className="text-slate-400 text-sm">
                                Choisissez votre méthode préférée
                            </p>
                        </div>
                    </div>
                </div>

                {/* Payment Options */}
                <div className="p-6 lg:p-8">
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
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleInputChange({ target: { name: 'payment_method', value: method.id } })}
                                    className={`
                                        relative p-5 lg:p-6 rounded-2xl border-2 transition-all duration-300 text-left
                                        ${isSelected
                                            ? `bg-gradient-to-br ${method.lightBg} ${method.borderColor} shadow-lg`
                                            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                                        }
                                    `}
                                >
                                    {/* Selected Check */}
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <FaCheckCircle className="text-white text-sm" />
                                        </motion.div>
                                    )}

                                    {/* Icon */}
                                    <div className={`
                                        w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all
                                        ${isSelected
                                            ? `bg-gradient-to-br ${method.gradient} shadow-lg`
                                            : 'bg-slate-100'
                                        }
                                    `}>
                                        <Icon className={`text-2xl ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                                    </div>

                                    {/* Content */}
                                    <h3 className={`text-base font-bold mb-0.5 ${isSelected ? method.iconColor : 'text-slate-700'}`}>
                                        {method.label}
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-3">{method.subtitle}</p>
                                    <p className="text-xs text-slate-400">{method.description}</p>

                                    {/* Security Badge */}
                                    <div className={`
                                        mt-4 flex items-center gap-2 p-2.5 rounded-lg
                                        ${isSelected ? 'bg-white/70' : 'bg-slate-50'}
                                    `}>
                                        <FaShieldAlt className={isSelected ? method.iconColor : 'text-slate-400'} size={12} />
                                        <span className="text-[10px] font-semibold text-slate-600">Paiement sécurisé</span>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Cagnotte Section */}
            {hasCagnotte && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden"
                >
                    <div className="p-6 lg:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <FaWallet className="text-white text-lg" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Ma Cagnotte</h3>
                                <p className="text-sm text-slate-500">Utilisez votre solde disponible</p>
                            </div>
                        </div>

                        <div className={`
                            p-5 rounded-2xl border-2 transition-all
                            ${isCagnotteApplied
                                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                                : 'bg-slate-50 border-slate-200'
                            }
                        `}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-14 h-14 rounded-xl flex items-center justify-center transition-all
                                        ${isCagnotteApplied
                                            ? 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30'
                                            : 'bg-white shadow-sm'
                                        }
                                    `}>
                                        <FaPercent className={`text-lg ${isCagnotteApplied ? 'text-white' : 'text-purple-500'}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">Solde disponible</p>
                                        <p className={`text-2xl font-black ${isCagnotteApplied ? 'text-purple-600' : 'text-slate-800'}`}>
                                            {cagnotteBalance.toFixed(2)} <span className="text-sm">DT</span>
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setFormData(prev => ({
                                            ...prev,
                                            cagnotte_deduction: isCagnotteApplied ? 0 : cagnotteBalance
                                        }));
                                    }}
                                    className={`
                                        px-5 py-3 rounded-xl font-bold text-sm transition-all
                                        ${isCagnotteApplied
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                            : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl'
                                        }
                                    `}
                                >
                                    {isCagnotteApplied ? 'Retirer' : 'Appliquer'}
                                </button>
                            </div>

                            {isCagnotteApplied && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="mt-4 pt-4 border-t border-purple-200"
                                >
                                    <div className="flex items-center gap-2 text-purple-700">
                                        <FaCheckCircle />
                                        <span className="text-sm font-semibold">
                                            Réduction de {cagnotteBalance.toFixed(2)} DT appliquée
                                        </span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Security Notice */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-5 lg:p-6"
            >
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <FaLock className="text-white text-lg" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-emerald-800 mb-1">
                            Paiement 100% Sécurisé
                        </h4>
                        <p className="text-sm text-emerald-700 leading-relaxed">
                            Vos informations de paiement sont protégées par un cryptage SSL de niveau bancaire.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <span className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-emerald-700 border border-emerald-200">
                                🔒 SSL 256-bit
                            </span>
                            <span className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-emerald-700 border border-emerald-200">
                                ✓ 3D Secure
                            </span>
                            <span className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-emerald-700 border border-emerald-200">
                                🛡️ PCI-DSS
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PaymentMethodSection;