import React from 'react';
import { FaUser, FaTruck, FaWallet, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const StepProgress = ({ currentStep, completedSteps }) => {
    const steps = [
        { id: 1, label: 'Informations', shortLabel: 'Info', icon: FaUser, color: 'from-indigo-500 to-purple-600' },
        { id: 2, label: 'Livraison', shortLabel: 'Livraison', icon: FaTruck, color: 'from-purple-500 to-pink-600' },
        { id: 3, label: 'Paiement', shortLabel: 'Paiement', icon: FaWallet, color: 'from-pink-500 to-rose-600' },
        { id: 4, label: 'Confirmation', shortLabel: 'Confirmer', icon: FaCheckCircle, color: 'from-emerald-500 to-teal-600' }
    ];

    return (
        <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 p-6 sm:p-8 mb-8">
            {/* Desktop Progress */}
            <div className="hidden sm:block relative">
                {/* Progress Line */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-slate-100 rounded-full mx-8">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg shadow-indigo-500/30"
                    />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                    {steps.map((step, index) => {
                        const isActive = currentStep === step.id;
                        const isCompleted = completedSteps.includes(step.id);
                        const isPast = step.id < currentStep;
                        const Icon = step.icon;

                        return (
                            <div key={step.id} className="flex flex-col items-center" style={{ zIndex: steps.length - index }}>
                                {/* Circle */}
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1.1 : 1,
                                    }}
                                    transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                                    className="relative"
                                >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all ${isCompleted || isPast
                                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 ring-4 ring-emerald-100'
                                            : isActive
                                                ? `bg-gradient-to-br ${step.color} ring-4 ring-indigo-100`
                                                : 'bg-slate-100'
                                        }`}>
                                        {isCompleted || isPast ? (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: "spring", stiffness: 200 }}
                                            >
                                                <FaCheckCircle className="text-white" size={28} />
                                            </motion.div>
                                        ) : (
                                            <Icon
                                                className={isActive ? 'text-white' : 'text-slate-400'}
                                                size={24}
                                            />
                                        )}
                                    </div>

                                    {/* Step Number Badge */}
                                    {!isCompleted && !isPast && (
                                        <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-lg ${isActive
                                                ? `bg-gradient-to-br ${step.color} text-white ring-2 ring-white`
                                                : 'bg-slate-200 text-slate-500'
                                            }`}>
                                            {step.id}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Label */}
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: isActive ? 1.05 : 1,
                                        opacity: isActive ? 1 : 0.7
                                    }}
                                    className="mt-4 text-center"
                                >
                                    <div className={`text-sm font-black uppercase tracking-wider ${isActive
                                            ? 'text-indigo-600'
                                            : isCompleted || isPast
                                                ? 'text-emerald-600'
                                                : 'text-slate-400'
                                        }`}>
                                        {step.label}
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            className={`h-1 bg-gradient-to-r ${step.color} rounded-full mt-2 shadow-lg`}
                                        />
                                    )}
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Progress */}
            <div className="sm:hidden">
                {/* Current Step Display */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        {steps.map((step) => {
                            if (step.id !== currentStep) return null;
                            const Icon = step.icon;
                            return (
                                <React.Fragment key={step.id}>
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl shadow-indigo-500/30`}>
                                        <Icon className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Étape {currentStep}/4</div>
                                        <div className="text-lg font-black text-indigo-900">{step.label}</div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black text-indigo-600">{Math.round((currentStep / steps.length) * 100)}%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Complété</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
                    />
                </div>

                {/* Mini Steps Indicators */}
                <div className="flex justify-between mt-4">
                    {steps.map((step) => {
                        const isCompleted = completedSteps.includes(step.id) || step.id < currentStep;
                        const isActive = currentStep === step.id;
                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${isCompleted
                                        ? 'bg-emerald-500 text-white'
                                        : isActive
                                            ? 'bg-indigo-500 text-white ring-2 ring-indigo-200'
                                            : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {isCompleted ? '✓' : step.id}
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-indigo-600' : 'text-slate-400'
                                    }`}>
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
