import React from 'react';
import { FaUser, FaPhone, FaEnvelope, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const PersonalInfoSection = ({ formData, handleInputChange }) => {
    const isNameValid = formData.contact_person_name && formData.contact_person_name.trim().length >= 3;
    const isPhoneValid = formData.contact_person_number && formData.contact_person_number.trim().length >= 8;
    const isEmailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

    const fields = [
        {
            name: 'contact_person_name',
            label: 'Nom complet',
            type: 'text',
            placeholder: 'Mohamed Ben Ahmed',
            icon: FaUser,
            required: true,
            isValid: isNameValid,
            hint: 'Prénom et nom de famille'
        },
        {
            name: 'contact_person_number',
            label: 'Numéro de téléphone',
            type: 'tel',
            placeholder: '+216 XX XXX XXX',
            icon: FaPhone,
            required: true,
            isValid: isPhoneValid,
            hint: 'Pour vous contacter lors de la livraison'
        },
        {
            name: 'email',
            label: 'Adresse email',
            type: 'email',
            placeholder: 'votre@email.com',
            icon: FaEnvelope,
            required: false,
            isValid: isEmailValid,
            hint: 'Pour recevoir la confirmation de commande'
        }
    ];

    const completedCount = [isNameValid, isPhoneValid].filter(Boolean).length;
    const progressPercent = (completedCount / 2) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 lg:p-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <FaUser className="text-white text-lg lg:text-xl" />
                    </div>
                    <div>
                        <h2 className="text-xl lg:text-2xl font-black text-white">
                            Informations de contact
                        </h2>
                        <p className="text-slate-400 text-sm mt-0.5">
                            Coordonnées pour la livraison
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="p-6 lg:p-8 space-y-6">
                {fields.map((field, index) => {
                    const Icon = field.icon;
                    const value = formData[field.name] || '';

                    return (
                        <motion.div
                            key={field.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-2"
                        >
                            {/* Label */}
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                {field.label}
                                {field.required && <span className="text-red-500">*</span>}
                                {!field.required && (
                                    <span className="text-xs font-normal text-slate-400">(optionnel)</span>
                                )}
                            </label>

                            {/* Input */}
                            <div className="relative group">
                                {/* Icon */}
                                <div className={`
                                    absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors
                                    ${field.isValid ? 'text-emerald-500' : 'text-slate-400 group-focus-within:text-indigo-500'}
                                `}>
                                    <Icon size={18} />
                                </div>

                                {/* Input Field */}
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={value}
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    className={`
                                        w-full pl-12 pr-12 py-4 bg-slate-50 border-2 rounded-xl
                                        font-medium text-slate-800 placeholder:text-slate-400 placeholder:font-normal
                                        transition-all duration-200
                                        focus:outline-none focus:bg-white
                                        ${field.isValid
                                            ? 'border-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100'
                                            : 'border-transparent focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100'
                                        }
                                    `}
                                />

                                {/* Valid Indicator */}
                                {field.isValid && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", stiffness: 200 }}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <FaCheckCircle className="text-white text-sm" />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Hint */}
                            <p className="text-xs text-slate-400 pl-1">{field.hint}</p>
                        </motion.div>
                    );
                })}

                {/* Progress Section */}
                <div className="pt-6 mt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-slate-600">Progression</span>
                        <span className="text-sm font-bold text-indigo-600">
                            {completedCount}/2 champs requis
                        </span>
                    </div>

                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={`h-full rounded-full ${progressPercent === 100
                                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                                }`}
                        />
                    </div>

                    {/* Completion Message */}
                    {progressPercent === 100 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 flex items-center gap-2 text-emerald-600"
                        >
                            <FaCheckCircle />
                            <span className="text-sm font-semibold">
                                Parfait ! Vos coordonnées sont complètes
                            </span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Security Note */}
            <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <FaShieldAlt className="text-slate-500" />
                    </div>
                    <p className="text-xs text-slate-500">
                        Vos informations personnelles sont protégées et ne seront utilisées que pour la livraison de votre commande.
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default PersonalInfoSection;