import React from 'react';
import { FaStar } from 'react-icons/fa';

const FeedbackSection = ({
    currentComplaint,
    showFeedbackForm,
    setShowFeedbackForm,
    feedback,
    setFeedback,
    handleSubmitFeedback
}) => {
    if (currentComplaint.status === 'resolved' && !currentComplaint.feedback && !showFeedbackForm) {
        return (
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
        );
    }

    if (showFeedbackForm) {
        return (
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">⭐ Donner votre avis</h2>
                <form onSubmit={handleSubmitFeedback}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Note</label>
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
                        <label className="block text-gray-700 font-semibold mb-2">Commentaire</label>
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
        );
    }

    if (currentComplaint.feedback) {
        return (
            <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">⭐ Votre avis</h2>
                <div className="flex gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                            key={star}
                            className={`text-2xl ${star <= currentComplaint.feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
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
        );
    }

    return null;
};

export default FeedbackSection;
