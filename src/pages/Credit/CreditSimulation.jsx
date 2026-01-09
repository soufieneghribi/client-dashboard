import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { simulateCredit, checkEligibility, resetCreditProcess, clearError } from '../../store/slices/credit';
import { useCreditRules, useCredit } from '../../hooks/useCredit';
import CreditSlider from '../../components/Credit/CreditSlider';
import SimulationResult from '../../components/Credit/SimulationResult';
import EligibilityChecker from '../../components/Credit/EligibilityChecker';
import { FaArrowLeft, FaCalculator, FaShoppingCart } from 'react-icons/fa';

const CreditSimulation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { simulation, eligibility, loading, error } = useSelector((state) => state.credit);
    const { validateSimulation } = useCredit();

    // Get cart amount from navigation state if coming from cart
    const cartAmount = location.state?.montantPanier;
    const fromCart = location.state?.fromCart;

    const [selectedType, setSelectedType] = useState('');
    const [montantPanier, setMontantPanier] = useState(cartAmount ? Math.round(cartAmount) : 5000);
    const [apport, setApport] = useState(1000);
    const [duree, setDuree] = useState(12);
    const [validationErrors, setValidationErrors] = useState({});
    const [eligibilityInputs, setEligibilityInputs] = useState(null);

    // Reset process when mounting to allow fresh start
    useEffect(() => {
        dispatch(resetCreditProcess());
    }, [dispatch]);

    const { rules, limits, loading: rulesLoading } = useCreditRules(selectedType);

    // Update limits when type changes
    useEffect(() => {
        if (selectedType && limits) {
            // Clamp values to new limits
            if (montantPanier < limits.montantMin) setMontantPanier(limits.montantMin);
            if (montantPanier > limits.montantMax) setMontantPanier(limits.montantMax);
            if (duree < limits.dureeMin) setDuree(limits.dureeMin);
            if (duree > limits.dureeMax) setDuree(limits.dureeMax);
            if (apport >= montantPanier) setApport(Math.max(0, montantPanier - 100));
        }
    }, [selectedType, limits]);

    const handleTypeChange = (type) => {
        setSelectedType(type);
        dispatch(resetCreditProcess());
        setValidationErrors({});
    };

    const handleSimulate = () => {
        const data = {
            type_credit: selectedType,
            montant_panier: montantPanier,
            apport: apport,
            duree: duree
        };

        const validation = validateSimulation(data, limits);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            return;
        }

        setValidationErrors({});
        dispatch(simulateCredit(data));
    };

    const handleCheckEligibility = (eligibilityData) => {
        setEligibilityInputs(eligibilityData);
        dispatch(checkEligibility({
            ...eligibilityData,
            type_credit: selectedType
        }));
    };

    const handleCreateDossier = () => {
        // Navigate to dossier creation with simulation data
        navigate('/credit/dossier', {
            state: {
                simulation,
                eligibility: {
                    ...eligibility,
                    revenu_net: eligibilityInputs?.salaire_net || 0,
                    charges: eligibilityInputs?.charges || 0
                },
                formData: {
                    type_credit: selectedType,
                    montant_panier: montantPanier,
                    apport: apport,
                    duree: duree
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 py-4 sm:py-6">
            <div className="max-w-4xl mx-auto px-3 sm:px-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-3">
                    <button
                        onClick={() => navigate(fromCart ? '/cart' : '/')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-3 transition-colors text-sm"
                    >
                        <FaArrowLeft size={14} />
                        {fromCart ? 'Retour au panier' : 'Retour à l\'accueil'}
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <FaCalculator className="text-xl text-white" />
                        </div>
                        <div className="flex-grow">
                            <h1 className="text-lg sm:text-xl font-bold text-slate-800 mb-0">
                                Simulateur de Crédit
                            </h1>
                            <p className="text-xs text-slate-500">
                                Calculez votre mensualité et vérifiez votre éligibilité
                            </p>
                        </div>
                        {fromCart && (
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-2 py-1.5 rounded-lg border border-blue-100">
                                <FaShoppingCart size={12} />
                                <span className="font-bold text-[10px] uppercase tracking-wider">Depuis le panier</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4 rounded-lg">
                        <div className="flex items-center justify-between">
                            <p className="text-red-800 font-medium text-sm">{error}</p>
                            <button
                                onClick={() => dispatch(clearError())}
                                className="text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Type Selection */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-3">
                    <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-slate-100 rounded text-slate-600 flex items-center justify-center text-[10px]">1</span>
                        Type de crédit
                    </h2>

                    {rulesLoading ? (
                        <div className="flex items-center justify-center py-6">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="relative">
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Type de crédit
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedType}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                    className="w-full px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg appearance-none cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234B5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 0.75rem center',
                                        backgroundSize: '1.25rem'
                                    }}
                                >
                                    <option value="" disabled>Sélectionnez un type de crédit</option>
                                    {rules.map((rule) => (
                                        <option key={rule.type_credit} value={rule.type_credit}>
                                            {rule.type_credit.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedType && (
                                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs text-blue-800">
                                        <span className="font-semibold">Type sélectionné:</span> {selectedType.toUpperCase()}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Configuration */}
                {selectedType && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-3">
                        <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 bg-slate-100 rounded text-slate-600 flex items-center justify-center text-[10px]">2</span>
                            Configuration du crédit
                        </h2>

                        <div className="space-y-4">
                            {/* Montant du Panier */}
                            {fromCart ? (
                                // Read-only display when coming from cart (like mobile)
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center border border-slate-100">
                                            <span className="text-xl">🛒</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-700 text-xs">Montant du Panier</h3>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Valeur fixe</p>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 text-center border border-slate-100">
                                        <p className="text-2xl font-black text-blue-600 mb-0">{montantPanier.toLocaleString()} DT</p>
                                    </div>
                                </div>
                            ) : (
                                // Editable slider when not from cart
                                <>
                                    <CreditSlider
                                        label="Montant du Panier"
                                        value={montantPanier}
                                        onChange={setMontantPanier}
                                        min={limits.montantMin}
                                        max={limits.montantMax}
                                        step={100}
                                        unit="DT"
                                        icon="💰"
                                    />
                                    {validationErrors.montant_panier && (
                                        <p className="text-red-500 text-sm -mt-4">{validationErrors.montant_panier}</p>
                                    )}
                                </>
                            )}

                            {/* Apport Personnel */}
                            <CreditSlider
                                label="Apport Personnel"
                                value={apport}
                                onChange={setApport}
                                min={0}
                                max={Math.max(0, montantPanier - 100)}
                                step={100}
                                unit="DT"
                                icon="💵"
                                helperText="Optionnel"
                            />
                            {validationErrors.apport && (
                                <p className="text-red-500 text-sm -mt-4">{validationErrors.apport}</p>
                            )}

                            {/* Durée */}
                            <CreditSlider
                                label="Durée du Crédit"
                                value={duree}
                                onChange={setDuree}
                                min={limits.dureeMin}
                                max={limits.dureeMax}
                                step={1}
                                unit="mois"
                                icon="📅"
                            />
                            {validationErrors.duree && (
                                <p className="text-red-500 text-sm -mt-4">{validationErrors.duree}</p>
                            )}

                            {/* Summary Box */}
                            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                <h3 className="font-bold text-slate-700 mb-2 text-xs flex items-center gap-2">
                                    <FaCalculator size={10} className="text-blue-500" />
                                    Récapitulatif
                                </h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                                        <span className="text-slate-500">Panier</span>
                                        <span className="font-bold text-slate-700">{montantPanier.toLocaleString()} DT</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                                        <span className="text-slate-500">Apport</span>
                                        <span className="font-bold text-slate-700">{apport.toLocaleString()} DT</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                                        <span className="text-slate-500">Financé</span>
                                        <span className="font-bold text-blue-600">{(montantPanier - apport).toLocaleString()} DT</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200/50 pb-1">
                                        <span className="text-slate-500">Durée</span>
                                        <span className="font-bold text-slate-700">{duree} mois</span>
                                    </div>
                                </div>
                            </div>

                            {/* Calculate Button */}
                            <button
                                onClick={handleSimulate}
                                disabled={loading}
                                className="w-full py-2.5 rounded-lg font-bold text-sm transition-all duration-200 shadow-sm disabled:opacity-50"
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    color: 'white'
                                }}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Calcul en cours...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <FaCalculator />
                                        Calculer ma Mensualité
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Simulation Result */}
                {simulation && simulation.can_finance && (
                    <div className="mb-3">
                        <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 bg-slate-100 rounded text-slate-600 flex items-center justify-center text-[10px]">3</span>
                            Résultat
                        </h2>
                        <SimulationResult simulation={simulation} />
                    </div>
                )}

                {/* Eligibility Check */}
                {simulation && simulation.can_finance && (
                    <div className="mb-3">
                        <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 bg-slate-100 rounded text-slate-600 flex items-center justify-center text-[10px]">4</span>
                            Éligibilité
                        </h2>
                        <EligibilityChecker
                            simulation={simulation}
                            onCheck={handleCheckEligibility}
                            loading={loading}
                            eligibility={eligibility}
                        />
                    </div>
                )}

                {/* Create Dossier Button */}
                {eligibility && eligibility.eligible && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
                        <h2 className="text-lg font-bold text-slate-800 mb-2">
                            🎉 Prêt à continuer ?
                        </h2>
                        <p className="text-xs text-slate-500 mb-5 uppercase tracking-wider font-semibold">
                            Créez votre dossier de crédit en un clic
                        </p>
                        <button
                            onClick={handleCreateDossier}
                            className="px-8 py-3 rounded-lg font-bold text-sm transition-all duration-200 shadow-md"
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: 'white'
                            }}
                        >
                            Créer mon dossier de crédit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreditSimulation;
