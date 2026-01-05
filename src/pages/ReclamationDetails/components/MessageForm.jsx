import React from 'react';
import { FaPaperclip, FaPaperPlane } from 'react-icons/fa';

const MessageForm = ({ newMessage, setNewMessage, handleSendMessage, handleFileChange, messageAttachment }) => {
    return (
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
    );
};

export default MessageForm;
