import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchComplaintById, updateComplaint, clearCurrentComplaint } from '../store/slices/complaints';
import { FaArrowLeft, FaClock, FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaPaperPlane } from 'react-icons/fa';

const ReclamationDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentComplaint, loading } = useSelector((state) => state.complaints);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        dispatch(fetchComplaintById(id));
        return () => {
            dispatch(clearCurrentComplaint());
        };
    }, [dispatch, id]);

    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                label: 'En attente',
                color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                icon: FaClock,
                iconColor: 'text-yellow-600',
            },
            in_progress: {
                label: 'En cours de traitement',
                color: 'bg-blue-100 text-blue-800 border-blue-300',
                icon: FaExclamationCircle,
                iconColor: 'text-blue-600',
            },
            resolved: {
                label: 'Résolue',
                color: 'bg-green-100 text-green-800 border-green-300',
                icon: FaCheckCircle,
                iconColor: 'text-green-600',
            },
            closed: {
                label: 'Fermée',
                color: 'bg-gray-100 text-gray-800 border-gray-300',
                icon: FaTimesCircle,
                iconColor: 'text-gray-600',
            },
        };
        return configs[status] || configs.pending;
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

    const getCategoryLabel = (category) => {
        const labels = {
            product: 'Produit',
            delivery: 'Livraison',
            service: 'Service client',
            other: 'Autre',
        };
        return labels[category] || category;
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            // In production, you'd send this to the backend
            const updatedComments = [
                ...(currentComplaint.comments || []),
                {
                    id: Date.now(),
                    text: newComment,
                    author: 'Client',
                    created_at: new Date().toISOString(),
                },
            ];

            await dispatch(updateComplaint({
                id: currentComplaint.id,
                data: { comments: updatedComments },
            })).unwrap();

            setNewComment('');
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!currentComplaint) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 font-medium">Réclamation non trouvée</p>
                    <button
                        onClick={() => navigate('/reclamations')}
                        className="mt-4 text-blue-600 hover:text-blue-700"
                    >
                        Retour aux réclamations
                    </button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(currentComplaint.status);
    const StatusIcon = statusConfig.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <button
                        onClick={() => navigate('/reclamations')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                    >
                        <FaArrowLeft />
                        Retour aux réclamations
                    </button>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">{getCategoryIcon(currentComplaint.category)}</div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                                    {currentComplaint.subject}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                    <span>📅 {new Date(currentComplaint.created_at).toLocaleDateString('fr-FR')}</span>
                                    <span>•</span>
                                    <span>🏷️ {getCategoryLabel(currentComplaint.category)}</span>
                                </div>
                            </div>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-semibold ${statusConfig.color}`}>
                            <StatusIcon className={statusConfig.iconColor} />
                            {statusConfig.label}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">📝 Description</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {currentComplaint.description}
                    </p>
                </div>

                {/* Timeline / Comments */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">💬 Historique</h2>

                    {/* Comments List */}
                    <div className="space-y-4 mb-6">
                        {currentComplaint.comments && currentComplaint.comments.length > 0 ? (
                            currentComplaint.comments.map((comment) => (
                                <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-800">{comment.author}</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                    <p className="text-gray-700">{comment.text}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Aucun commentaire pour le moment
                            </div>
                        )}
                    </div>

                    {/* Add Comment Form */}
                    {currentComplaint.status !== 'closed' && (
                        <form onSubmit={handleAddComment} className="border-t pt-6">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Ajouter un commentaire
                            </label>
                            <div className="flex gap-3">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    rows={3}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Ajoutez des informations supplémentaires..."
                                />
                                <button
                                    type="submit"
                                    disabled={!newComment.trim()}
                                    className="px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Actions */}
                {currentComplaint.status !== 'closed' && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ Actions</h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    dispatch(updateComplaint({
                                        id: currentComplaint.id,
                                        data: { status: 'closed' },
                                    }));
                                }}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                            >
                                Fermer la réclamation
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReclamationDetails;
