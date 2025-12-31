import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchComplaintById, sendClaimMessage, submitClaimFeedback, clearCurrentComplaint } from '../store/slices/complaints';
import { FaArrowLeft, FaClock, FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaPaperPlane, FaPaperclip, FaStar } from 'react-icons/fa';

const ReclamationDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentComplaint, loading } = useSelector((state) => state.complaints);
    const [newMessage, setNewMessage] = useState('');
    const [messageAttachment, setMessageAttachment] = useState(null);
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [feedback, setFeedback] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        dispatch(fetchComplaintById(id));
        return () => {
            dispatch(clearCurrentComplaint());
        };
    }, [dispatch, id]);

    const getStatusConfig = (status) => {
        const configs = {
            new: {
                label: 'Nouvelle',
                color: 'bg-purple-100 text-purple-800 border-purple-300',
                icon: FaExclamationCircle,
                iconColor: 'text-purple-600',
            },
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
        return configs[status] || configs.new;
    };

    const getClaimTypeIcon = (type) => {
        if (!type) return '📋';
        const name = type.name || type;
        const lowerName = name.toLowerCase();
        if (lowerName.includes('produit') || lowerName.includes('product')) return '📦';
        if (lowerName.includes('livraison') || lowerName.includes('delivery')) return '🚚';
        if (lowerName.includes('service') || lowerName.includes('support')) return '💬';
        if (lowerName.includes('paiement') || lowerName.includes('payment')) return '💳';
        if (lowerName.includes('compte') || lowerName.includes('account')) return '👤';
        return '📋';
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !messageAttachment) return;

        try {
            await dispatch(sendClaimMessage({
                id: currentComplaint.id,
                message: newMessage,
                attachment: messageAttachment
            })).unwrap();
            setNewMessage('');
            setMessageAttachment(null);
            // Refresh claim details
            dispatch(fetchComplaintById(id));
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        try {
            await dispatch(submitClaimFeedback({
                id: currentComplaint.id,
                rating: feedback.rating,
                comment: feedback.comment
            })).unwrap();
            setShowFeedbackForm(false);
            // Refresh claim details
            dispatch(fetchComplaintById(id));
        } catch (err) {
            console.error('Error submitting feedback:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('Le fichier ne doit pas dépasser 10MB');
                return;
            }
            setMessageAttachment(file);
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
                            <div className="text-4xl">{getClaimTypeIcon(currentComplaint.type)}</div>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                                    {currentComplaint.subject}
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                    <span>🔖 {currentComplaint.reference || `#${currentComplaint.id}`}</span>
                                    <span>•</span>
                                    <span>📅 {new Date(currentComplaint.created_at).toLocaleDateString('fr-FR')}</span>
                                    {currentComplaint.type && (
                                        <>
                                            <span>•</span>
                                            <span>🏷️ {currentComplaint.type.name}</span>
                                        </>
                                    )}
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
                    {currentComplaint.attachment_path && (
                        <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-gray-600 mb-2">Pièce jointe:</p>
                            <a
                                href={currentComplaint.attachment_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
                            >
                                <FaPaperclip />
                                Voir la pièce jointe
                            </a>
                        </div>
                    )}
                </div>

                {/* Messages / Chat */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">💬 Messages</h2>

                    {/* Messages List */}
                    <div className="space-y-4 mb-6">
                        {currentComplaint.messages && currentComplaint.messages.length > 0 ? (
                            currentComplaint.messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`rounded-xl p-4 ${message.sender_type === 'client'
                                        ? 'bg-blue-50 ml-8'
                                        : 'bg-gray-50 mr-8'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-gray-800">
                                            {message.sender_type === 'client' ? 'Vous' : 'Support'}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(message.created_at).toLocaleString('fr-FR')}
                                        </span>
                                    </div>
                                    {message.message && (
                                        <p className="text-gray-700 mb-2">{message.message}</p>
                                    )}
                                    {message.attachment_path && (
                                        <a
                                            href={message.attachment_path}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            <FaPaperclip />
                                            Pièce jointe
                                        </a>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                Aucun message pour le moment
                            </div>
                        )}
                    </div>

                    {/* Add Message Form */}
                    {currentComplaint.status !== 'closed' && (
                        <form onSubmit={handleSendMessage} className="border-t pt-6">
                            <label className="block text-gray-700 font-semibold mb-2">
                                Ajouter un message
                            </label>
                            <div className="space-y-3">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Ajoutez des informations supplémentaires..."
                                />
                                <div className="flex items-center gap-3">
                                    <input
                                        type="file"
                                        id="message-attachment"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept="image/*,.pdf,.doc,.docx"
                                    />
                                    <label
                                        htmlFor="message-attachment"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors"
                                    >
                                        <FaPaperclip />
                                        {messageAttachment ? messageAttachment.name : 'Joindre un fichier'}
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={!newMessage.trim() && !messageAttachment}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                                    >
                                        <FaPaperPlane />
                                        Envoyer
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* History */}
                {currentComplaint.history && currentComplaint.history.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">📜 Historique</h2>
                        <div className="space-y-4">
                            {currentComplaint.history.map((entry, index) => (
                                <div key={entry.id || index} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                                        {index < currentComplaint.history.length - 1 && (
                                            <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 pb-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-800">
                                                {entry.old_status || 'Nouveau'} → {entry.new_status}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(entry.created_at).toLocaleString('fr-FR')}
                                            </span>
                                        </div>
                                        {entry.comment && (
                                            <p className="text-gray-600 text-sm">{entry.comment}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Feedback */}
                {currentComplaint.status === 'resolved' && !currentComplaint.feedback && !showFeedbackForm && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">⭐ Feedback</h2>
                        <p className="text-gray-600 mb-4">
                            Votre réclamation a été résolue. Merci de nous faire part de votre avis.
                        </p>
                        <button
                            onClick={() => setShowFeedbackForm(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                        >
                            Donner mon avis
                        </button>
                    </div>
                )}

                {/* Feedback Form */}
                {showFeedbackForm && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">⭐ Donner votre avis</h2>
                        <form onSubmit={handleSubmitFeedback}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Note
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                                            className="text-3xl transition-colors"
                                        >
                                            <FaStar className={star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-semibold mb-2">
                                    Commentaire
                                </label>
                                <textarea
                                    value={feedback.comment}
                                    onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Partagez votre expérience..."
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowFeedbackForm(false)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                                >
                                    Envoyer mon avis
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Display Existing Feedback */}
                {currentComplaint.feedback && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">⭐ Votre avis</h2>
                        <div className="flex gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    className={`text-2xl ${star <= currentComplaint.feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        {currentComplaint.feedback.comment && (
                            <p className="text-gray-700">{currentComplaint.feedback.comment}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-3">
                            Soumis le {new Date(currentComplaint.feedback.created_at).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReclamationDetails;
