import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createComplaint, fetchClaimTypes, clearError } from '../store/slices/complaints';
import { FaArrowLeft, FaPaperPlane, FaUpload, FaTimes } from 'react-icons/fa';

const ReclamationForm = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, claimTypes, typesLoading } = useSelector((state) => state.complaints);

    const [formData, setFormData] = useState({
        subject: '',
        claim_type_id: '',
        description: '',
        priority: 'medium',
        attachment: null,
    });

    const [errors, setErrors] = useState({});

    // Fetch claim types on mount
    useEffect(() => {
        dispatch(fetchClaimTypes());
    }, [dispatch]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, attachment: 'Le fichier ne doit pas dépasser 5MB' }));
                return;
            }
            setFormData(prev => ({ ...prev, attachment: file }));
            setErrors(prev => ({ ...prev, attachment: '' }));
        }
    };

    const removeFile = () => {
        setFormData(prev => ({ ...prev, attachment: null }));
        // Reset file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.subject.trim()) {
            newErrors.subject = 'Le sujet est requis';
        } else if (formData.subject.length < 5) {
            newErrors.subject = 'Le sujet doit contenir au moins 5 caractères';
        }

        if (!formData.claim_type_id) {
            newErrors.claim_type_id = 'Veuillez sélectionner un type de réclamation';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'La description est requise';
        } else if (formData.description.length < 20) {
            newErrors.description = 'La description doit contenir au moins 20 caractères';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await dispatch(createComplaint(formData)).unwrap();
            navigate('/reclamations');
        } catch (err) {

        }
    };

    const getClaimTypeIcon = (name) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes('produit') || lowerName.includes('product')) return '📦';
        if (lowerName.includes('livraison') || lowerName.includes('delivery')) return '🚚';
        if (lowerName.includes('service') || lowerName.includes('support')) return '💬';
        if (lowerName.includes('paiement') || lowerName.includes('payment')) return '💳';
        if (lowerName.includes('compte') || lowerName.includes('account')) return '👤';
        return '📋';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-6">
                    <button
                        onClick={() => navigate('/reclamations')}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
                    >
                        <FaArrowLeft />
                        Retour aux réclamations
                    </button>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                        ✍️ Nouvelle Réclamation
                    </h1>
                    <p className="text-gray-600">
                        Décrivez votre problème et nous vous répondrons dans les plus brefs délais
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                        <div className="flex items-center justify-between">
                            <p className="text-red-800 font-medium">{error}</p>
                            <button
                                onClick={() => dispatch(clearError())}
                                className="text-red-500 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    {/* Subject */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">
                            Sujet de la réclamation *
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.subject ? 'border-red-500' : 'border-gray-200'
                                }`}
                            placeholder="Ex: Produit défectueux reçu"
                        />
                        {errors.subject && (
                            <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                        )}
                    </div>

                    {/* Claim Type */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-3">
                            Type de réclamation *
                        </label>
                        {typesLoading ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-600 mt-2">Chargement des types...</p>
                            </div>
                        ) : claimTypes.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">
                                Aucun type de réclamation disponible
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {claimTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        type="button"
                                        onClick={() => {
                                            setFormData(prev => ({ ...prev, claim_type_id: type.id }));
                                            if (errors.claim_type_id) {
                                                setErrors(prev => ({ ...prev, claim_type_id: '' }));
                                            }
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all text-left ${formData.claim_type_id === type.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{getClaimTypeIcon(type.name)}</span>
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{type.name}</h3>
                                                {type.description && (
                                                    <p className="text-sm text-gray-600">{type.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {errors.claim_type_id && (
                            <p className="text-red-500 text-sm mt-1">{errors.claim_type_id}</p>
                        )}
                    </div>

                    {/* Priority */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">
                            Priorité
                        </label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                            <option value="low">Basse</option>
                            <option value="medium">Moyenne</option>
                            <option value="high">Haute</option>
                            <option value="critical">Critique</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">
                            Description détaillée *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={6}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${errors.description ? 'border-red-500' : 'border-gray-200'
                                }`}
                            placeholder="Décrivez votre problème en détail..."
                        />
                        <div className="flex justify-between items-center mt-1">
                            {errors.description ? (
                                <p className="text-red-500 text-sm">{errors.description}</p>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    Minimum 20 caractères
                                </p>
                            )}
                            <p className="text-gray-500 text-sm">
                                {formData.description.length} caractères
                            </p>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div className="mb-8">
                        <label className="block text-gray-700 font-semibold mb-2">
                            Pièce jointe (optionnel)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-all">
                            <input
                                type="file"
                                id="file-upload"
                                accept="image/*,.pdf,.doc,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer inline-flex flex-col items-center"
                            >
                                <FaUpload className="text-4xl text-gray-400 mb-2" />
                                <p className="text-gray-600 font-medium">
                                    Cliquez pour ajouter un fichier
                                </p>
                                <p className="text-gray-500 text-sm mt-1">
                                    Images, PDF ou documents (max 5MB)
                                </p>
                            </label>
                        </div>

                        {/* File Display */}
                        {formData.attachment && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-600">📎</span>
                                        <span className="text-gray-700 text-sm">{formData.attachment.name}</span>
                                        <span className="text-gray-500 text-xs">
                                            ({(formData.attachment.size / 1024).toFixed(1)} KB)
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            </div>
                        )}
                        {errors.attachment && (
                            <p className="text-red-500 text-sm mt-1">{errors.attachment}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/reclamations')}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <FaPaperPlane />
                                    Envoyer la réclamation
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReclamationForm;
