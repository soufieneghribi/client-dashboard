import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';

const ReclamationHeader = ({ navigate, getClaimTypeIcon, currentComplaint, statusConfig }) => {
    const StatusIcon = statusConfig.icon;

    return (
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
    );
};

export default ReclamationHeader;
