import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { createDossier, uploadDocument, clearError, setCurrentDossier } from '../../store/slices/credit';
import DocumentUploader from '../../components/Credit/DocumentUploader';
import { FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

const CreditDossier = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentDossier, loading, uploadLoading, error, success } = useSelector((state) => state.credit);

    const [step, setStep] = useState(1);
    const [documents, setDocuments] = useState({});
    const [dossierCreated, setDossierCreated] = useState(false);

    // Get data from navigation state
    const { simulation, eligibility, formData } = location.state || {};

    useEffect(() => {
        if (!simulation || !eligibility || !formData) {
            navigate('/credit/simulation');
        }
    }, [simulation, eligibility, formData, navigate]);

    useEffect(() => {
        if (success && !dossierCreated && currentDossier) {
            setDossierCreated(true);
            setStep(2);
        }
    }, [success, currentDossier, dossierCreated]);

    const handleCreateDossier = async () => {
        const dossierData = {
            type_credit: formData.type_credit,
            montant_panier: formData.montant_panier,
            apport: formData.apport,
            duree: formData.duree,
            mensualite: simulation.details.mensualite,
            revenu_net: eligibility.revenu_net || 0,
            charges: eligibility.charges || 0
        };

        await dispatch(createDossier(dossierData));
    };

    const handleFileSelect = (typeDocument, file) => {
        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDocuments(prev => ({
                    ...prev,
                    [typeDocument]: { ...file, preview: reader.result }
                }));
            };
            reader.readAsDataURL(file);
        } else {
            setDocuments(prev => ({
                ...prev,
                [typeDocument]: file
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

    const handleUploadDocument = async (typeDocument) => {
        if (!currentDossier || !documents[typeDocument]) return;

        await dispatch(uploadDocument({
            dossierId: currentDossier.dossier_id || currentDossier.id,
            typeDocument,
            file: documents[typeDocument]
        }));
    };

    const handleUploadAll = async () => {
        if (!currentDossier) return;

        for (const [typeDocument, file] of Object.entries(documents)) {
            if (file && !file.uploaded) {
                await dispatch(uploadDocument({
                    dossierId: currentDossier.dossier_id || currentDossier.id,
                    typeDocument,
                    file
                }));
            }
        }
    };

    const handleFinish = () => {
        navigate('/credit/mes-dossiers');
    };

    const documentTypes = [
        { type: 'cin_recto', label: 'CIN Recto', required: true },
        { type: 'cin_verso', label: 'CIN Verso', required: true },
        { type: 'fiche_paie_1', label: 'Fiche de Paie (Mois 1)', required: true },
        { type: 'fiche_paie_2', label: 'Fiche de Paie (Mois 2)', required: true },
        { type: 'fiche_paie_3', label: 'Fiche de Paie (Mois 3)', required: true },
        { type: 'releve_bancaire', label: 'Relevé Bancaire', required: false },
        { type: 'autre', label: 'Autre Document', required: false }
    ];

    if (!simulation || !formData) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <button
                        onClick={() => navigate('/credit/simulation')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                    >
                        <FaArrowLeft />
                        Retour à la simulation
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        📁 Création de Dossier de Crédit
                    </h1>
                    <p className="text-gray-600">
                        Finalisez votre demande en uploadant vos documents
                    </p>
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

                {/* Progress Steps */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-3 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                                }`}>
                                {step > 1 ? '✓' : '1'}
                            </div>
                            <span className="font-semibold hidden sm:inline">Récapitulatif</span>
                        </div>
                        <div className="flex-1 h-1 bg-gray-200 mx-4">
                            <div className={`h-full transition-all ${step >= 2 ? 'bg-blue-600 w-full' : 'w-0'}`}></div>
                        </div>
                        <div className={`flex items-center gap-3 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                                }`}>
                                {step > 2 ? '✓' : '2'}
                            </div>
                            <span className="font-semibold hidden sm:inline">Documents</span>
                        </div>
                        <div className="flex-1 h-1 bg-gray-200 mx-4">
                            <div className={`h-full transition-all ${step >= 3 ? 'bg-blue-600 w-full' : 'w-0'}`}></div>
                        </div>
                        <div className={`flex items-center gap-3 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                                }`}>
                                3
                            </div>
                            <span className="font-semibold hidden sm:inline">Confirmation</span>
                        </div>
                    </div>
                </div>

                {/* Step 1: Summary */}
                {step === 1 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Récapitulatif de votre demande</h2>

                        <div className="space-y-6">
                            {/* Simulation Details */}
                            <div className="bg-blue-50 rounded-xl p-5">
                                <h3 className="font-bold text-gray-800 mb-4">Détails du Crédit</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-600 text-sm">Type</p>
                                        <p className="font-bold text-gray-800 capitalize">{formData.type_credit}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Montant</p>
                                        <p className="font-bold text-gray-800">{formData.montant_panier.toLocaleString()} DT</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Apport</p>
                                        <p className="font-bold text-gray-800">{formData.apport.toLocaleString()} DT</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Durée</p>
                                        <p className="font-bold text-gray-800">{formData.duree} mois</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Mensualité</p>
                                        <p className="font-bold text-blue-600 text-lg">
                                            {simulation.details.mensualite.toLocaleString()} DT
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Coût total</p>
                                        <p className="font-bold text-gray-800">
                                            {simulation.details.cout_total.toLocaleString()} DT
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Eligibility */}
                            <div className="bg-green-50 rounded-xl p-5">
                                <h3 className="font-bold text-gray-800 mb-4">Éligibilité</h3>
                                <div className="flex items-center gap-3">
                                    <FaCheckCircle className="text-green-600 text-2xl" />
                                    <div>
                                        <p className="font-bold text-green-800">Vous êtes éligible</p>
                                        <p className="text-sm text-green-700">
                                            Taux d'endettement: {eligibility.taux_endettement?.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Create Dossier Button */}
                            <button
                                onClick={handleCreateDossier}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Création en cours...
                                    </div>
                                ) : (
                                    'Créer le Dossier'
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Documents */}
                {step === 2 && currentDossier && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload de Documents</h2>

                        <div className="space-y-4 mb-6">
                            {documentTypes.map((docType) => (
                                <DocumentUploader
                                    key={docType.type}
                                    typeDocument={docType.type}
                                    label={docType.label}
                                    onFileSelect={handleFileSelect}
                                    uploadedFile={documents[docType.type]}
                                    onRemove={handleRemoveFile}
                                    loading={uploadLoading}
                                    required={docType.required}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all"
                            >
                                Retour
                            </button>
                            <button
                                onClick={handleUploadAll}
                                disabled={uploadLoading || Object.keys(documents).length === 0}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploadLoading ? 'Upload en cours...' : 'Uploader les Documents'}
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md"
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center sm:p-12">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaCheckCircle className="text-5xl text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Dossier Finalisé !</h2>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Votre demande de crédit a été enregistrée avec succès. Nos conseillers l'examineront dans les plus brefs délais.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/credit/mes-dossiers')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
                            >
                                Voir mes dossiers
                            </button>
                            <button
                                onClick={() => navigate('/credit/simulation')}
                                className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-bold transition-all"
                            >
                                Nouvelle demande
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreditDossier;
