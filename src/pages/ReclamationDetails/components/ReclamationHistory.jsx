import React from 'react';

const ReclamationHistory = ({ history }) => {
    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">📜 Historique</h2>
            <div className="space-y-4">
                {history.map((entry, index) => (
                    <div key={entry.id || index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                            {index < history.length - 1 && (
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
    );
};

export default ReclamationHistory;
