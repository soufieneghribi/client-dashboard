import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchDossierById, clearError } from '../../store/slices/credit';
import { FaArrowLeft, FaFileAlt, FaCheckCircle, FaClock, FaTimesCircle, FaChartBar, FaUser, FaDownload } from 'react-icons/fa';

const DossierDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentDossier, loading, error } = useSelector((state) => state.credit);

    useEffect(() => {
        dispatch(fetchDossierById(id));
    }, [dispatch, id]);

    const getStatusConfig = (statut) => {
        const configs = {
            depose: {
                label: 'Déposé',
                color: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: <FaFileAlt />,
                progress: 25
            },
            en_examen: {
                label: 'En examen',
                color: 'bg-orange-100 text-orange-800 border-orange-200',
                icon: <FaClock />,
                progress: 50
            },
            en_etude: {
                label: 'En étude',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <FaChartBar />,
                progress: 75
            },
            valide: {
                label: 'Validé',
                color: 'bg-green-100 text-green-800 border-green-200',
                icon: <FaCheckCircle />,
                progress: 100
            },
            refuse: {
                label: 'Refusé',
                color: 'bg-red-100 text-red-800 border-red-200',
                icon: <FaTimesCircle />,
                progress: 100
            }
        };
        return configs[statut] || configs.depose;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Chargement du dossier...</p>
                </div>
            </div>
        );
    }

    if (error || !currentDossier) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Erreur</h2>
                    <p className="text-slate-600 mb-6">{error || 'Dossier non trouvé'}</p>
                    <button
                        onClick={() => navigate('/credit/mes-dossiers')}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold"
                    >
                        Retour à mes dossiers
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(currentDossier.statut);
    const simulation = currentDossier.simulation || {};

    return (
        <div className="min-h-screen bg-slate-50 py-6 sm:py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Header Navigation */}
                <button
                    onClick={() => navigate('/credit/mes-dossiers')}
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors font-medium"
                >
                    <FaArrowLeft />
                    Retour à la liste
                </button>

                {/* Status Bar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 mb-1">
                                Dossier #{currentDossier.id?.substring(0, 8)}...
                            </h1>
                            <p className="text-sm text-slate-500">
                                Soumis le {new Date(currentDossier.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 font-black text-sm ${statusConfig.color}`}>
                            {statusConfig.icon}
                            {statusConfig.label.toUpperCase()}
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between text-xs font-bold uppercase tracking-wider">
                            <span className="text-slate-400">Progression</span>
                            <span className="text-blue-600">{statusConfig.progress}%</span>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100">
                            <div
                                style={{ width: `${statusConfig.progress}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Details & Analysis */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Simulation Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Montant</p>
                                <p className="text-xl font-black text-slate-800">
                                    {parseFloat(simulation.montant_panier || 0).toLocaleString()} <span className="text-sm text-slate-400">DT</span>
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Mensualité</p>
                                <p className="text-xl font-black text-blue-600">
                                    {parseFloat(simulation.mensualite || 0).toLocaleString()} <span className="text-sm text-slate-400">DT</span>
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Durée</p>
                                <p className="text-xl font-black text-slate-800">
                                    {simulation.duree || 0} <span className="text-sm text-slate-400">Mois</span>
                                </p>
                            </div>
                        </div>

                        {/* Financial Analysis */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
                                    <FaChartBar size={14} />
                                </div>
                                Analyse Financière
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                        <span className="text-sm text-slate-500 font-medium">Revenus</span>
                                        <span className="font-bold text-slate-800">{parseFloat(currentDossier.revenu_net || 0).toLocaleString()} DT</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                        <span className="text-sm text-slate-500 font-medium">Charges</span>
                                        <span className="font-bold text-slate-800">{parseFloat(currentDossier.charges || 0).toLocaleString()} DT</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-sm text-blue-600 font-bold">Nouvelle Mensualité</span>
                                        <span className="text-lg font-black text-blue-600">{parseFloat(simulation.mensualite || 0).toLocaleString()} DT</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Taux d'endettement global</p>
                                    <div className="relative flex items-center justify-center">
                                        <span className="text-4xl font-black text-blue-600">
                                            {currentDossier.taux_endettement?.toFixed(1) || '0.0'}%
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 font-medium">Seuil recommandé: 33%</p>
                                </div>
                            </div>
                        </div>

                        {/* Documents Justificatifs */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100">
                                        <FaFileAlt size={14} />
                                    </div>
                                    Documents Justificatifs
                                </h2>
                                <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase">
                                    {currentDossier.documents?.length || 0} Fichiers
                                </span>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document</th>
                                            <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {currentDossier.documents && currentDossier.documents.length > 0 ? (
                                            currentDossier.documents.map((doc, index) => (
                                                <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                                                                <FaFileAlt />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-700 capitalize">
                                                                    {doc.type_document?.replace(/_/g, ' ')}
                                                                </p>
                                                                <p className="text-[10px] text-slate-400 uppercase font-medium">
                                                                    {doc.statut || 'Vérifié'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 text-right">
                                                        <a
                                                            href={doc.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-bold"
                                                        >
                                                            <FaDownload size={12} />
                                                            Ouvrir
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="py-12 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                            <FaFileAlt className="text-slate-200 text-2xl" />
                                                        </div>
                                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wide">
                                                            Aucun document disponible
                                                        </p>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            Les documents uploadés apparaîtront ici.
                                                        </p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Profile & Summary */}
                    <div className="space-y-6">
                        {/* Profile Summary Card */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg p-8 text-white text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <FaUser size={120} />
                            </div>
                            <div className="w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center text-3xl font-black mx-auto mb-4 border border-white/30">
                                {currentDossier.client?.nom?.charAt(0) || 'U'}
                            </div>
                            <h3 className="text-xl font-black mb-1">
                                {currentDossier.client?.nom || 'Utilisateur'}
                            </h3>
                            <p className="text-blue-100 text-sm mb-6">{currentDossier.client?.email}</p>

                            <div className="grid grid-cols-2 gap-4 text-left border-t border-white/20 pt-6">
                                <div>
                                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Membre depuis</p>
                                    <p className="font-black text-sm">2026</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Téléphone</p>
                                    <p className="font-black text-sm">{currentDossier.client?.telephone || '---'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Help Box */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h4 className="font-black text-slate-800 mb-4 text-sm flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Besoin d'aide ?
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed mb-4">
                                Si vous souhaitez modifier votre demande ou si vous avez des questions sur l'état de votre dossier, contactez-nous.
                            </p>
                            <button className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                                Contacter un conseiller
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DossierDetails;
