import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchComplaints, deleteComplaint, clearError, clearSuccess } from '../store/slices/complaints';
import { FaPlus, FaEye, FaTrash, FaFilter, FaExclamationCircle, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const Reclamations = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { complaints, loading, error, success } = useSelector((state) => state.complaints);
    const [filterStatus, setFilterStatus] = useState('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [complaintToDelete, setComplaintToDelete] = useState(null);

    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchComplaints());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            setTimeout(() => dispatch(clearSuccess()), 3000);
        }
    }, [success, dispatch]);

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: FaClock },
            in_progress: { label: 'En cours', color: 'bg-blue-100 text-blue-800', icon: FaExclamationCircle },
            resolved: { label: 'Résolue', color: 'bg-green-100 text-green-800', icon: FaCheckCircle },
            closed: { label: 'Fermée', color: 'bg-gray-100 text-gray-800', icon: FaTimesCircle },
        };

        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                <Icon className="text-sm" />
                {config.label}
            </span>
        );
    };

    const getCategoryIcon = (category) => {
        const icons = {
            product: '📦',
            delivery: '🚚',
            service: '💬',
            other: '📋',
        };
        return icons[category] || '📋';
    };

    const filteredComplaints = filterStatus === 'all'
        ? complaints
        : complaints.filter(c => c.status === filterStatus);

    const handleDelete = (id) => {
        setComplaintToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (complaintToDelete) {
            dispatch(deleteComplaint(complaintToDelete));
            setShowDeleteModal(false);
            setComplaintToDelete(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                                📝 Mes Réclamations
                            </h1>
                            <p className="text-gray-600">
                                Gérez vos réclamations et suivez leur statut
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/reclamations/new')}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <FaPlus />
                            Nouvelle Réclamation
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FaFilter className="text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-800">Filtrer par statut</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { value: 'all', label: 'Toutes' },
                            { value: 'pending', label: 'En attente' },
                            { value: 'in_progress', label: 'En cours' },
                            { value: 'resolved', label: 'Résolues' },
                            { value: 'closed', label: 'Fermées' },
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setFilterStatus(filter.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filterStatus === filter.value
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-lg animate-fade-in">
                        <div className="flex items-center gap-2">
                            <FaCheckCircle className="text-green-500" />
                            <p className="text-green-800 font-medium">Opération réussie!</p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaExclamationCircle className="text-red-500" />
                                <p className="text-red-800 font-medium">{error}</p>
                            </div>
                            <button
                                onClick={() => dispatch(clearError())}
                                className="text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Complaints List */}
                {!loading && filteredComplaints.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="text-gray-300 mb-4">
                            <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">
                            Aucune réclamation
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {filterStatus === 'all'
                                ? "Vous n'avez pas encore de réclamations"
                                : `Aucune réclamation avec le statut "${filterStatus}"`}
                        </p>
                        <button
                            onClick={() => navigate('/reclamations/new')}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                        >
                            <FaPlus />
                            Créer une réclamation
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredComplaints.map((complaint) => (
                            <div
                                key={complaint.id}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                            >
                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl">{getCategoryIcon(complaint.category)}</div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-lg line-clamp-1">
                                                    {complaint.subject}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(complaint.created_at).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="mb-4">
                                        {getStatusBadge(complaint.status)}
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {complaint.description}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => navigate(`/reclamations/${complaint.id}`)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                        >
                                            <FaEye />
                                            Voir
                                        </button>
                                        <button
                                            onClick={() => handleDelete(complaint.id)}
                                            className="inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FaTrash className="text-red-600 text-2xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">
                                    Supprimer la réclamation
                                </h3>
                                <p className="text-gray-600">
                                    Êtes-vous sûr de vouloir supprimer cette réclamation ? Cette action est irréversible.
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all duration-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200"
                                >
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reclamations;
