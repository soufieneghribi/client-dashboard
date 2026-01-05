import React from 'react';
import { FaPaperclip } from 'react-icons/fa';

const MessageList = ({ messages }) => {
    return (
        <div className="space-y-4 mb-6">
            {messages && messages.length > 0 ? (
                messages.map((message) => (
                    <div
                        key={message.id}
                        className={`rounded-xl p-4 ${message.sender_type === 'client' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
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
    );
};

export default MessageList;
