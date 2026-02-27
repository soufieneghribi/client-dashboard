import React from 'react';
import { FaUser, FaTruck, FaWallet, FaCheckCircle, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StepProgress = ({ currentStep, completedSteps }) => {
    const steps = [
        { id: 1, label: 'Coordonnées', shortLabel: 'Info', icon: FaUser },
        { id: 2, label: 'Livraison', shortLabel: 'Livraison', icon: FaTruck },
        { id: 3, label: 'Paiement', shortLabel: 'Paiement', icon: FaWallet },
        { id: 4, label: 'Confirmation', shortLabel: 'Confirmer', icon: FaCheckCircle }
    ];

    const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

    return (
        <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 p-4 sm:p-6 lg:p-8 mb-6 lg:mb-8">
            {/* Desktop Progress */}
            <div className="hidden md:block">
                {/* Progress Line Container */}
                <div className="relative">
                    {/* Background Line */}
                    <div className="absolute top-7 left-8 right-8 h-1 bg-slate-100 rounded-full" />

                    {/* Active Progress Line */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `calc(${progressPercentage}% - 4rem)` }}
                        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute top-7 left-8 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                        style={{ maxWidth: 'calc(100% - 4rem)' }}
                    />

                    {/* Steps */}
                    <div className="relative flex justify-between">
                        {steps.map((step, index) => {
                            const isActive = currentStep === step.id;
                            const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
                            const Icon = step.icon;

                            return (
                                <div key={step.id} className="flex flex-col items-center" style={{ zIndex: steps.length - index }}>
                                    {/* Circle */}
                                    <motion.div
                                        initial={false}
                                        animate={{ scale: isActive ? 1.1 : 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        className="relative"
                                    >
                                        <div className={`
                                            w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300
                                            ${isCompleted
                                                ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30'
                                                : isActive
                                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-100'
                                                    : 'bg-slate-100'
                                            }
                                        `}>
                                            {isCompleted ? (
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -180 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                                                >
                                                    <FaCheck className="text-white text-lg" />
                                                </motion.div>
                                            ) : (
                                                <Icon className={`text-lg ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                            )}
                                        </div>

                                        {/* Step Number Badge */}
                                        {!isCompleted && (
                                            <div className={`
                                                absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black
                                                ${isActive
                                                    ? 'bg-white text-indigo-600 shadow-md ring-2 ring-indigo-100'
                                                    : 'bg-slate-200 text-slate-500'
                                                }
                                            `}>
                                                {step.id}
                                            </div>
                                        )}

                                        {/* Pulse Animation for Active */}
                                        {isActive && (
                                            <motion.div
                                                className="absolute inset-0 rounded-2xl bg-indigo-500/20"
                                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            />
                                        )}
                                    </motion.div>

                                    {/* Label */}
                                    <motion.div
                                        initial={false}
                                        animate={{ y: isActive ? 0 : 4, opacity: isActive ? 1 : 0.7 }}
                                        className="mt-3 text-center"
                                    >
                                        <span className={`
                                            text-xs font-bold uppercase tracking-wider
                                            ${isActive
                                                ? 'text-indigo-600'
                                                : isCompleted
                                                    ? 'text-emerald-600'
                                                    : 'text-slate-400'
                                            }
                                        `}>
                                            {step.label}
                                        </span>

                                        {/* Active Indicator Line */}
                                        {isActive && (
                                            <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: '100%', opacity: 1 }}
                                                className="h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-2"
                                            />
                                        )}
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Mobile Progress */}
            <div className="md:hidden">
                {/* Current Step Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {steps.map((step) => {
                            if (step.id !== currentStep) return null;
                            const Icon = step.icon;
                            return (
                                <React.Fragment key={step.id}>
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                        <Icon className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Étape {currentStep} sur {steps.length}
                                        </p>
                                        <h3 className="text-base font-black text-slate-800">{step.label}</h3>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Percentage */}
                    <div className="text-right">
                        <span className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {Math.round((currentStep / steps.length) * 100)}%
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
                    />
                </div>

                {/* Mini Steps */}
                <div className="flex justify-between">
                    {steps.map((step) => {
                        const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
                        const isActive = currentStep === step.id;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-1.5">
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all
                                    ${isCompleted
                                        ? 'bg-emerald-500 text-white'
                                        : isActive
                                            ? 'bg-indigo-500 text-white ring-2 ring-indigo-200'
                                            : 'bg-slate-100 text-slate-400'
                                    }
                                `}>
                                    {isCompleted ? <FaCheck size={12} /> : step.id}
                                </div>
                                <span className={`
                                    text-[9px] font-bold uppercase tracking-wider
                                    ${isActive ? 'text-indigo-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}
                                `}>
                                    {step.shortLabel}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StepProgress;