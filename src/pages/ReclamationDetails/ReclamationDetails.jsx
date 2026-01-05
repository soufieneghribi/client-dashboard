import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchComplaintById, sendClaimMessage, submitClaimFeedback, clearCurrentComplaint } from '../../store/slices/complaints';
import { FaClock, FaCheckCircle, FaExclamationCircle, FaTimesCircle } from 'react-icons/fa';

// Sub-components
import ReclamationHeader from './components/ReclamationHeader';
import ReclamationDescription from './components/ReclamationDescription';
import MessageList from './components/MessageList';
import MessageForm from './components/MessageForm';
import ReclamationHistory from './components/ReclamationHistory';
import FeedbackSection from './components/FeedbackSection';

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
        if (lowerName.includes('produit')) return '📦';
        if (lowerName.includes('livraison')) return '🚚';
        if (lowerName.includes('service')) return '💬';
        if (lowerName.includes('paiement')) return '💳';
        if (lowerName.includes('compte')) return '👤';
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
            dispatch(fetchComplaintById(id));
        } catch (err) {

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
            dispatch(fetchComplaintById(id));
        } catch (err) {

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <ReclamationHeader
                    navigate={navigate}
                    getClaimTypeIcon={getClaimTypeIcon}
                    currentComplaint={currentComplaint}
                    statusConfig={statusConfig}
                />

                <ReclamationDescription currentComplaint={currentComplaint} />

                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">💬 Messages</h2>
                    <MessageList messages={currentComplaint.messages} />
                    {currentComplaint.status !== 'closed' && (
                        <MessageForm
                            newMessage={newMessage}
                            setNewMessage={setNewMessage}
                            handleSendMessage={handleSendMessage}
                            handleFileChange={handleFileChange}
                            messageAttachment={messageAttachment}
                        />
                    )}
                </div>

                {currentComplaint.history && currentComplaint.history.length > 0 && (
                    <ReclamationHistory history={currentComplaint.history} />
                )}

                <FeedbackSection
                    currentComplaint={currentComplaint}
                    showFeedbackForm={showFeedbackForm}
                    setShowFeedbackForm={setShowFeedbackForm}
                    feedback={feedback}
                    setFeedback={setFeedback}
                    handleSubmitFeedback={handleSubmitFeedback}
                />
            </div>
        </div>
    );
};

export default ReclamationDetails;
