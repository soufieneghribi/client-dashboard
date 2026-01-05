import React from 'react';
import { FaUser, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";

const PersonalInfoSection = ({ formData, handleInputChange }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
        >
            <div className="p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <FaUser size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Informations personnelles</h2>
                        <p className="text-sm text-slate-400 font-medium">Pour vous contacter concernant la livraison</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Nom complet *</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <FaUser size={14} />
                            </div>
                            <input
                                type="text"
                                name="contact_person_name"
                                value={formData.contact_person_name}
                                onChange={handleInputChange}
                                placeholder="Jean Dupont"
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-[1.25rem] focus:ring-4 focus:ring-blue-100 transition-all font-medium placeholder:text-slate-300"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Numéro de téléphone *</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <FaPhone size={14} />
                            </div>
                            <input
                                type="tel"
                                name="contact_person_number"
                                value={formData.contact_person_number}
                                onChange={handleInputChange}
                                placeholder="+216 XX XXX XXX"
                                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-[1.25rem] focus:ring-4 focus:ring-blue-100 transition-all font-medium placeholder:text-slate-300"
                                required
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PersonalInfoSection;
