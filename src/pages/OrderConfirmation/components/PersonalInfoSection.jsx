import React from 'react';
import { FaUser, FaPhone, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";

const PersonalInfoSection = ({ formData, handleInputChange }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-50 overflow-hidden"
        >
            {/* Context Banner */}
            <div className="bg-slate-50/50 px-8 py-4 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-600">
                    <FaShieldAlt size={12} />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em]">Données Sécurisées</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-200"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                </div>
            </div>

            <div className="p-8 sm:p-10">
                <div className="mb-10">
                    <h2 className="text-2xl font-black text-[#2D2D5F] tracking-tight">Informations de livraison</h2>
                    <p className="text-slate-400 font-medium mt-1">Saisissez vos coordonnées pour faciliter la remise de votre colis.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Nom complet *</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                                <FaUser size={16} />
                            </div>
                            <input
                                type="text"
                                name="contact_person_name"
                                value={formData.contact_person_name}
                                onChange={handleInputChange}
                                placeholder="votre nom"
                                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-100/20 transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Mobile *</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                                <FaPhone size={16} />
                            </div>
                            <input
                                type="tel"
                                name="contact_person_number"
                                value={formData.contact_person_number}
                                onChange={handleInputChange}
                                placeholder="+216 00 000 000"
                                className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-emerald-100 focus:ring-4 focus:ring-emerald-100/20 transition-all font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
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
