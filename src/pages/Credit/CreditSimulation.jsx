import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { simulateCredit, checkEligibility, resetCreditProcess, clearError } from '../../store/slices/credit';
import { useCreditRules, useCredit } from '../../hooks/useCredit';
import CreditTypeSelector from '../../components/Credit/CreditTypeSelector';
import CreditSlider from '../../components/Credit/CreditSlider';
import SimulationResult from '../../components/Credit/SimulationResult';
import EligibilityChecker from '../../components/Credit/EligibilityChecker';
import { FaArrowLeft, FaCalculator } from 'react-icons/fa';

const CreditSimulation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { simulation, eligibility, loading, error } = useSelector((state) => state.credit);
    const { validateSimulation } = useCredit();

    const [selectedType, setSelectedType] = useState('');
    const [montantPanier, setMontantPanier] = useState(5000);
    const [apport, setApport] = useState(1000);
    const [duree, setDuree] = useState(12);
    const [validationErrors, setValidationErrors] = useState({});

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
                eligibility,
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                    >
                        <FaArrowLeft />
                        Retour à l'accueil
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                            <FaCalculator className="text-3xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
                                Simulateur de Crédit
                            </h1>
                            <p className="text-gray-600">
                                Calculez votre mensualité et vérifiez votre éligibilité
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                        <div className="flex items-center justify-between">
                            <p className="text-red-800 font-medium">{error}</p>
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
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        1️⃣ Choisissez votre type de crédit
                    </h2>
                    <CreditTypeSelector
                        selectedType={selectedType}
                        onTypeChange={handleTypeChange}
                        types={rules}
                        loading={rulesLoading}
                    />
                </div>

                {/* Configuration */}
                {selectedType && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            2️⃣ Configurez votre crédit
                        </h2>

                        <div className="space-y-6">
                            {/* Montant du Panier */}
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
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                                <h3 className="font-bold text-gray-800 mb-3">Récapitulatif</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-600">Montant total</p>
                                        <p className="font-bold text-gray-800">{montantPanier.toLocaleString()} DT</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Apport</p>
                                        <p className="font-bold text-gray-800">{apport.toLocaleString()} DT</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">À financer</p>
                                        <p className="font-bold text-blue-600">{(montantPanier - apport).toLocaleString()} DT</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Durée</p>
                                        <p className="font-bold text-gray-800">{duree} mois</p>
                                    </div>
                                </div>
                            </div>

                            {/* Calculate Button */}
                            <button
                                onClick={handleSimulate}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            3️⃣ Résultat de la simulation
                        </h2>
                        <SimulationResult simulation={simulation} />
                    </div>
                )}

                {/* Eligibility Check */}
                {simulation && simulation.can_finance && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            4️⃣ Vérifiez votre éligibilité
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
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                🎉 Prêt à continuer ?
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Créez votre dossier de crédit et uploadez vos documents
                            </p>
                            <button
                                onClick={handleCreateDossier}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Créer mon Dossier de Crédit
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreditSimulation;
