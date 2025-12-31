import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchDossiers } from '../../store/slices/credit';
import DossierCard from '../../components/Credit/DossierCard';
import { FaArrowLeft, FaPlus, FaFilter } from 'react-icons/fa';

const MesDossiers = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { dossiers, loading } = useSelector((state) => state.credit);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        dispatch(fetchDossiers());
    }, [dispatch]);

    const filteredDossiers = filterStatus === 'all'
        ? dossiers
        : dossiers.filter(d => d.statut === filterStatus);

    const statusFilters = [
        { value: 'all', label: 'Tous' },
        { value: 'depose', label: 'Déposés' },
        { value: 'en_cours', label: 'En cours' },
        { value: 'valide', label: 'Validés' },
        { value: 'refuse', label: 'Refusés' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                    >
                        <FaArrowLeft />
                        Retour à l'accueil
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                📂 Mes Dossiers de Crédit
                            </h1>
                            <p className="text-gray-600">
                                Suivez l'état de vos demandes de crédit
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/credit/simulation')}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                        >
                            <FaPlus />
                            Nouvelle Demande
                        </button>
                    </div>
                </div>

                {/* Stats Summary - Moved to Top for visibility */}
                {!loading && dossiers.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-2xl shadow-md p-4 text-center border-t-4 border-blue-600">
                            <p className="text-2xl font-bold text-blue-600">{dossiers.length}</p>
                            <p className="text-gray-600 text-xs font-semibold uppercase">Total</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-md p-4 text-center border-t-4 border-yellow-500">
                            <p className="text-2xl font-bold text-yellow-600">
                                {dossiers.filter(d => d.statut === 'en_cours').length}
                            </p>
                            <p className="text-gray-600 text-xs font-semibold uppercase">En cours</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-md p-4 text-center border-t-4 border-green-500">
                            <p className="text-2xl font-bold text-green-600">
                                {dossiers.filter(d => d.statut === 'valide').length}
                            </p>
                            <p className="text-gray-600 text-xs font-semibold uppercase">Validés</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-md p-4 text-center border-t-4 border-red-500">
                            <p className="text-2xl font-bold text-red-600">
                                {dossiers.filter(d => d.statut === 'refuse').length}
                            </p>
                            <p className="text-gray-600 text-xs font-semibold uppercase">Refusés</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <FaFilter className="text-blue-600" />
                            <h2 className="font-bold text-gray-800">Filtrer par statut</h2>
                        </div>
                        {filterStatus !== 'all' && (
                            <button
                                onClick={() => setFilterStatus('all')}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Effacer les filtres
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setFilterStatus(filter.value)}
                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${filterStatus === filter.value
                                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {filter.label}
                                {filter.value !== 'all' && (
                                    <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${filterStatus === filter.value ? 'bg-white text-blue-600' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {filter.value === 'all' ? dossiers.length : dossiers.filter(d => d.statut === filter.value).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Dossiers List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">Chargement des dossiers...</p>
                        </div>
                    </div>
                ) : filteredDossiers.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            Aucun dossier trouvé
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {filterStatus === 'all'
                                ? 'Vous n\'avez pas encore de dossier de crédit'
                                : `Aucun dossier avec le statut "${statusFilters.find(f => f.value === filterStatus)?.label}"`}
                        </p>
                        <button
                            onClick={() => navigate('/credit/simulation')}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                        >
                            Créer une nouvelle demande
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDossiers.map((dossier) => (
                            <DossierCard key={dossier.id} dossier={dossier} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MesDossiers;
