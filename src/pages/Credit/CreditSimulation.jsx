import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { simulateCredit, checkEligibility, resetCreditProcess, clearError, createDossier, uploadDocument } from '../../store/slices/credit';
import { useCreditRules, useCredit } from '../../hooks/useCredit';
import CreditSlider from '../../components/Credit/CreditSlider';
import SimulationResult from '../../components/Credit/SimulationResult';
import EligibilityChecker from '../../components/Credit/EligibilityChecker';
import DocumentUploader from '../../components/Credit/DocumentUploader';
import { FaArrowLeft, FaCalculator, FaShoppingCart, FaCheckCircle, FaFileAlt, FaSearch, FaMinus, FaPlus } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { getImageUrl } from '../../utils/imageHelper';

const STEPS = [
    { id: 1, label: 'Articles', icon: FaShoppingCart },
    { id: 2, label: 'Simulation', icon: FaCalculator },
    { id: 3, label: 'Validation', icon: FaCheckCircle },
    { id: 4, label: 'Documents', icon: FaFileAlt }
];

const DOCUMENT_TYPES = [
    { type: 'cin_recto', label: 'CIN Recto', required: true },
    { type: 'cin_verso', label: 'CIN Verso', required: true },
    { type: 'fiche_paie_1', label: 'Fiche de Paie (Mois 1)', required: true },
    { type: 'fiche_paie_2', label: 'Fiche de Paie (Mois 2)', required: true },
    { type: 'fiche_paie_3', label: 'Fiche de Paie (Mois 3)', required: true },
    { type: 'releve_bancaire', label: 'Relevé Bancaire', required: false },
];

const CreditSimulation = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { simulation, eligibility, loading, uploadLoading, error, currentDossier } = useSelector((state) => state.credit);
    const { validateSimulation } = useCredit();

    // Steps state
    const [currentStep, setCurrentStep] = useState(1);
    const [documents, setDocuments] = useState({});

    // Get simulation context from navigation state
    const state = location.state || {};
    const product = state.product;

    // Cart items for Step 1
    const cart = useMemo(() => {
        const rawCart = Cookies.get('cart');
        return rawCart ? JSON.parse(rawCart) : [];
    }, []);

    // Determine initial amount based on context
    const initialAmount = useMemo(() => {
        if (state.montantPanier) return Math.round(state.montantPanier);
        if (product) {
            const price = product.isPromotion && product.pivot
                ? parseFloat(product.pivot.promo_price)
                : parseFloat(product.price);
            return Math.round(price);
        }
        return cart.reduce((acc, item) => acc + parseFloat(item.total), 0) || 5000;
    }, [state.montantPanier, product, cart]);

    const [selectedType, setSelectedType] = useState('');
    const [montantPanier, setMontantPanier] = useState(initialAmount);
    const [apport, setApport] = useState(Math.round(initialAmount * 0.2));
    const [duree, setDuree] = useState(12);
    const [validationErrors, setValidationErrors] = useState({});
    const [eligibilityInputs, setEligibilityInputs] = useState(null);

    // Reset process when mounting
    useEffect(() => {
        dispatch(resetCreditProcess());
    }, [dispatch]);

    const { rules, limits, loading: rulesLoading } = useCreditRules(selectedType);

    useEffect(() => {
        if (selectedType && limits) {
            if (montantPanier < limits.montantMin) setMontantPanier(limits.montantMin);
            if (montantPanier > limits.montantMax) setMontantPanier(limits.montantMax);
            if (duree < limits.dureeMin) setDuree(limits.dureeMin);
            if (duree > limits.dureeMax) setDuree(limits.dureeMax);
            if (apport >= montantPanier) setApport(Math.max(0, montantPanier - 100));
        }
    }, [selectedType, limits]);

    useEffect(() => {
        setMontantPanier(initialAmount);
        setApport(Math.round(initialAmount * 0.2));
    }, [initialAmount]);

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

    const handleCreateDossier = async () => {
        const dossierData = {
            type_credit: selectedType,
            montant_panier: montantPanier,
            apport: apport,
            duree: duree,
            mensualite: simulation.details.mensualite,
            revenu_net: eligibilityInputs?.salaire_net || 0,
            charges: eligibilityInputs?.charges || 0
        };

        const result = await dispatch(createDossier(dossierData)).unwrap();
        if (result) {
            setCurrentStep(4);
        }
    };

    const handleFileSelect = (typeDocument, file) => {
        if (!(file instanceof File)) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDocuments(prev => ({
                    ...prev,
                    [typeDocument]: {
                        file: file,
                        preview: reader.result,
                        name: file.name,
                        size: file.size,
                        uploaded: false
                    }
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setDocuments(prev => ({
                ...prev,
                [typeDocument]: {
                    file: file,
                    preview: null,
                    name: file.name,
                    size: file.size,
                    uploaded: false
                }
            }));
        }
    };

    const handleRemoveFile = (typeDocument) => {
        setDocuments(prev => {
            const newDocs = { ...prev };
            delete newDocs[typeDocument];
            return newDocs;
        });
    };

    const handleUploadAll = async () => {
        if (!currentDossier) return;

        for (const typeDocument of Object.keys(documents)) {
            const docData = documents[typeDocument];
            if (docData && !docData.uploaded) {
                try {
                    await dispatch(uploadDocument({
                        dossierId: currentDossier.dossier_id || currentDossier.id,
                        typeDocument,
                        file: docData.file
                    })).unwrap();

                    setDocuments(prev => ({
                        ...prev,
                        [typeDocument]: { ...prev[typeDocument], uploaded: true }
                    }));
                } catch (err) {
                    console.error(`Failed to upload ${typeDocument}:`, err);
                }
            }
        }

        // Final success navigation
        navigate('/credit/mes-dossiers', { state: { success: true } });
    };

    const nextStep = () => {
        if (currentStep === 1) {
            setCurrentStep(2);
        } else if (currentStep === 2 && simulation?.can_finance) {
            setCurrentStep(3);
        } else if (currentStep === 3 && eligibility?.eligible) {
            handleCreateDossier();
        }
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
        else navigate(-1);
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header style image */}
            <div className="bg-[#2D2D5F] text-white pt-10 pb-6 px-6">
                <div className="max-w-4xl mx-auto flex items-center gap-4">

                    <h1 className="text-xl font-bold">Simulation Crédit</h1>
                </div>
            </div>

            {/* Stepper style image */}
            <div className="bg-white border-b py-6 px-4">
                <div className="max-w-4xl mx-auto flex justify-between relative">
                    {/* Connecting lines */}
                    <div className="absolute top-5 left-8 right-8 h-[2px] bg-slate-100 -z-0"></div>

                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive
                                        ? 'bg-[#2D2D5F] text-white shadow-lg'
                                        : isCompleted
                                            ? 'bg-green-500 text-white'
                                            : 'bg-white border-2 border-slate-100 text-slate-300'
                                        }`}
                                >
                                    <Icon size={18} />
                                </div>
                                <span className={`text-[10px] font-bold ${isActive ? 'text-[#2D2D5F]' : 'text-slate-400'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 py-8">
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-6 rounded-lg flex items-center justify-between">
                        <p className="text-red-800 font-medium text-sm">{error}</p>
                        <button onClick={() => dispatch(clearError())} className="text-red-500">✕</button>
                    </div>
                )}

                {/* STEP 1: Articles */}
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-slate-700">Sélection des Articles</h2>

                        {/* Search Bar - Visual only as per image */}
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un article..."
                                className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2D2D5F]/10 transition-all"
                            />
                        </div>

                        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b flex items-center gap-2 text-[#2D2D5F]">
                                <FaShoppingCart />
                                <span className="font-bold">Articles Sélectionnés ({product ? 1 : cart.length})</span>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {product ? (
                                    <div className="p-4 flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center p-2">
                                            <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{product.name}</h3>
                                            <p className="text-xs text-slate-400">{montantPanier.toFixed(2)} DT × 1</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><FaMinus size={10} /></button>
                                            <span className="font-bold text-sm">1</span>
                                            <button className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><FaPlus size={10} /></button>
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                            <span className="font-bold text-sm">{montantPanier.toFixed(2)} DT</span>
                                        </div>
                                    </div>
                                ) : cart.map((item) => (
                                    <div key={item.id} className="p-4 flex items-center gap-4">
                                        <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center p-2">
                                            <img src={getImageUrl(item)} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</h3>
                                            <p className="text-xs text-slate-400">{parseFloat(item.price).toFixed(2)} DT × {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><FaMinus size={10} /></button>
                                            <span className="font-bold text-sm">{item.quantity}</span>
                                            <button className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><FaPlus size={10} /></button>
                                        </div>
                                        <div className="text-right min-w-[80px]">
                                            <span className="font-bold text-sm">{parseFloat(item.total).toFixed(2)} DT</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Summary Bar */}
                        <div className="bg-[#2D2D5F] p-5 rounded-3xl flex items-center justify-between text-white shadow-xl shadow-[#2D2D5F]/20">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider opacity-80 mb-1">Montant Total</p>
                                <p className="text-xl font-bold">{montantPanier.toFixed(2)} DT</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <FaCalculator size={20} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                onClick={nextStep}
                                className="bg-[#2D2D5F] text-white px-12 py-3 rounded-2xl font-bold shadow-lg hover:bg-[#1a1a45] transition-all"
                            >
                                Continuer
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Simulation */}
                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-[#2D2D5F] rounded-lg text-white flex items-center justify-center text-[10px]">1</span>
                                Type de crédit
                            </h2>

                            {rulesLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2D2D5F]"></div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <select
                                        value={selectedType}
                                        onChange={(e) => handleTypeChange(e.target.value)}
                                        className="w-full px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2D2D5F]/10"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234B5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 1rem center',
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
                            )}
                        </div>

                        {selectedType && (
                            <>
                                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                                    <h2 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-[#2D2D5F] rounded-lg text-white flex items-center justify-center text-[10px]">2</span>
                                        Configuration
                                    </h2>

                                    <div className="space-y-8">
                                        <div className="bg-[#2D2D5F] p-5 rounded-3xl flex items-center justify-between text-white shadow-lg mb-4">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider opacity-80 mb-1">{product ? 'Prix du Produit' : 'Total Panier'}</p>
                                                <p className="text-xl font-bold">{montantPanier.toLocaleString()} DT</p>
                                            </div>
                                            <div className="text-2xl">{product ? '📱' : '🛒'}</div>
                                        </div>

                                        <CreditSlider
                                            label="Apport Personnel"
                                            value={apport}
                                            onChange={setApport}
                                            min={0}
                                            max={Math.max(0, montantPanier - 100)}
                                            step={100}
                                            unit="DT"
                                            icon="💵"
                                        />

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

                                        <button
                                            onClick={handleSimulate}
                                            disabled={loading}
                                            className="w-full py-4 rounded-2xl font-bold text-white shadow-lg bg-[#2D2D5F] disabled:opacity-50 transition-all hover:scale-[1.02]"
                                        >
                                            {loading ? 'Calcul...' : 'Calculer ma Mensualité'}
                                        </button>
                                    </div>
                                </div>

                                {simulation && simulation.can_finance && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <SimulationResult simulation={simulation} />
                                        <div className="flex justify-end gap-4 pt-6">
                                            <button onClick={() => setCurrentStep(1)} className="px-6 py-3 font-bold text-slate-400">Retour</button>
                                            <button
                                                onClick={nextStep}
                                                className="bg-[#2D2D5F] text-white px-12 py-3 rounded-2xl font-bold shadow-lg"
                                            >
                                                Continuer
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* STEP 3: Validation */}
                {currentStep === 3 && (
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 mb-6">Vérification d'Éligibilité</h2>
                            <EligibilityChecker
                                simulation={simulation}
                                onCheck={handleCheckEligibility}
                                loading={loading}
                                eligibility={eligibility}
                            />
                        </div>

                        {eligibility && eligibility.eligible && (
                            <div className="bg-green-50 rounded-3xl p-8 border border-green-100 text-center animate-bounce-short">
                                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                                    <FaCheckCircle size={30} />
                                </div>
                                <h3 className="text-xl font-bold text-green-800 mb-2">Félicitations !</h3>
                                <p className="text-sm text-green-600 mb-6">Vous êtes éligible pour cette offre de crédit.</p>
                                <button
                                    onClick={nextStep}
                                    className="bg-[#2D2D5F] text-white px-10 py-4 rounded-2xl font-bold shadow-xl shadow-[#2D2D5F]/20 hover:scale-105 transition-all"
                                >
                                    Créer mon dossier
                                </button>
                            </div>
                        )}

                        <div className="flex justify-start">
                            <button onClick={() => setCurrentStep(2)} className="px-6 py-3 font-bold text-slate-400">Retour</button>
                        </div>
                    </div>
                )}
                {/* STEP 4: Documents */}
                {currentStep === 4 && currentDossier && (
                    <div className="space-y-6">
                        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-800 mb-6">Upload des Documents</h2>
                            <p className="text-sm text-slate-500 mb-6">Pour finaliser votre dossier, veuillez uploader les documents suivants :</p>

                            <div className="space-y-4">
                                {DOCUMENT_TYPES.map((doc) => (
                                    <DocumentUploader
                                        key={doc.type}
                                        typeDocument={doc.type}
                                        label={doc.label}
                                        onFileSelect={handleFileSelect}
                                        uploadedFile={documents[doc.type]}
                                        onRemove={handleRemoveFile}
                                        loading={uploadLoading}
                                        required={doc.required}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="bg-[#2D2D5F] p-8 rounded-3xl text-center text-white shadow-xl shadow-[#2D2D5F]/20">
                            <h3 className="text-xl font-bold mb-4">Prêt à envoyer ?</h3>
                            <p className="text-sm opacity-80 mb-6">Assurez-vous que tous les documents requis sont bien lisibles.</p>
                            <button
                                onClick={handleUploadAll}
                                disabled={uploadLoading || Object.keys(documents).length < 5}
                                className="bg-white text-[#2D2D5F] px-10 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                {uploadLoading ? 'Upload en cours...' : 'Finaliser ma demande'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .animate-bounce-short {
                    animation: bounce 1s ease-in-out;
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default CreditSimulation;
