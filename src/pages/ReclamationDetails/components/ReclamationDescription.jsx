import React from 'react';
import { FaPaperclip } from 'react-icons/fa';

const ReclamationDescription = ({ currentComplaint }) => {
    return (
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
    );
};

export default ReclamationDescription;
