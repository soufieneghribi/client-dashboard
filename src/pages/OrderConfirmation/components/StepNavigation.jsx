import React from 'react';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StepNavigation = ({
    currentStep,
    totalSteps,
    onNext,
    onPrevious,
    onSubmit,
    isSubmitting,
    canProceed,
    isLastStep
}) => {
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-8">
            {/* Previous Button */}
            {currentStep > 1 ? (
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    whileHover={{ scale: 1.02, x: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onPrevious}
                    className="group flex items-center justify-center gap-3 px-6 py-4 bg-white border-2 border-slate-200 rounded-2xl font-bold text-slate-700 hover:border-indigo-300 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all shadow-sm hover:shadow-md"
                >
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" size={16} />
                    <span className="text-sm uppercase tracking-wider">Précédent</span>
                </motion.button>
            ) : (
                <div className="hidden sm:block"></div>
            )}

            {/* Next/Submit Button */}
            <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={canProceed && !isSubmitting ? { scale: 1.02 } : {}}
                whileTap={canProceed && !isSubmitting ? { scale: 0.98 } : {}}
                onClick={isLastStep ? onSubmit : onNext}
                disabled={!canProceed || isSubmitting}
                className={`group relative overflow-hidden flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl sm:ml-auto w-full sm:w-auto ${!canProceed || isSubmitting
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        : isLastStep
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 shadow-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/50'
                            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-indigo-700 shadow-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/50'
                    }`}
            >
                {/* Animated Background */}
                {canProceed && !isSubmitting && (
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        animate={{
                            x: ['-100%', '100%'],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />
                )}

                <div className="relative z-10 flex items-center gap-3">
                    {isSubmitting ? (
                        <>
                            <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                            <span>Traitement...</span>
                        </>
                    ) : isLastStep ? (
                        <>
                            <FaCheckCircle className="group-hover:scale-110 transition-transform" size={20} />
                            <span>Confirmer l'achat</span>
                            <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <FaArrowRight size={16} />
                            </motion.div>
                        </>
                    ) : (
                        <>
                            <span>Continuer</span>
                            <motion.div
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            >
                                <FaArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                            </motion.div>
                        </>
                    )}
                </div>

                {/* Lock Icon for Disabled State */}
                {!canProceed && !isSubmitting && (
                    <div className="absolute top-2 right-2">
                        <FaLock size={12} className="text-slate-400" />
                    </div>
                )}
            </motion.button>

            {/* Helper Text */}
            {!canProceed && !isSubmitting && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sm:absolute sm:bottom-full sm:right-0 sm:mb-2 w-full sm:w-auto"
                >
                    <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        <span>Veuillez remplir tous les champs requis</span>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default StepNavigation;
