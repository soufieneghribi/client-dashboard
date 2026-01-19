import React from 'react';
import { FaUser, FaPhone, FaEnvelope, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";

const PersonalInfoSection = ({ formData, handleInputChange }) => {
    // Validation helpers
    const isNameValid = formData.contact_person_name && formData.contact_person_name.trim().length >= 3;
    const isPhoneValid = formData.contact_person_number && formData.contact_person_number.trim().length >= 8;
    const isEmailValid = formData.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
            {/* Header */}
            <div className="pb-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Informations de livraison</h3>
                <p className="text-sm text-gray-600">Saisissez vos coordonnées pour faciliter la remise de votre colis</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
                {/* Name Field */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nom complet <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaUser className={`${isNameValid ? 'text-green-500' : 'text-gray-400'} transition-colors`} size={18} />
                        </div>
                        <input
                            type="text"
                            name="contact_person_name"
                            value={formData.contact_person_name}
                            onChange={handleInputChange}
                            placeholder="Entrez votre nom complet"
                            className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 rounded-xl focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400 ${isNameValid
                                    ? 'border-green-300 focus:border-green-400 focus:ring-4 focus:ring-green-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                                }`}
                            required
                        />
                        {isNameValid && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            >
                                <FaCheckCircle className="text-green-500" size={20} />
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Phone Field */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Numéro de téléphone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaPhone className={`${isPhoneValid ? 'text-green-500' : 'text-gray-400'} transition-colors`} size={18} />
                        </div>
                        <input
                            type="tel"
                            name="contact_person_number"
                            value={formData.contact_person_number}
                            onChange={handleInputChange}
                            placeholder="+216 00 000 000"
                            className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 rounded-xl focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400 ${isPhoneValid
                                    ? 'border-green-300 focus:border-green-400 focus:ring-4 focus:ring-green-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                                }`}
                            required
                        />
                        {isPhoneValid && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            >
                                <FaCheckCircle className="text-green-500" size={20} />
                            </motion.div>
                        )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Nous vous contacterons sur ce numéro pour la livraison
                    </p>
                </div>

                {/* Email Field (Optional) */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Adresse email <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FaEnvelope className={`${isEmailValid ? 'text-green-500' : 'text-gray-400'} transition-colors`} size={18} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            placeholder="votre@email.com"
                            className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 rounded-xl focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400 ${isEmailValid
                                    ? 'border-green-300 focus:border-green-400 focus:ring-4 focus:ring-green-100'
                                    : 'border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100'
                                }`}
                        />
                        {isEmailValid && (
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center"
                            >
                                <FaCheckCircle className="text-green-500" size={20} />
                            </motion.div>
                        )}
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Pour recevoir la confirmation de commande
                    </p>
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm mb-3">
                    <span className="font-semibold text-gray-700">Progression</span>
                    <span className="font-bold text-blue-600">
                        {[isNameValid, isPhoneValid].filter(Boolean).length}/2 complété
                    </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${([isNameValid, isPhoneValid].filter(Boolean).length / 2) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    />
                </div>
            </div>
        </div>
    );
};

export default PersonalInfoSection;
