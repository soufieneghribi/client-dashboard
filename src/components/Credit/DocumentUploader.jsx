import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaUpload, FaFile, FaFilePdf, FaFileImage, FaTimes, FaCheckCircle } from 'react-icons/fa';

const DocumentUploader = ({
    typeDocument,
    label,
    onFileSelect,
    uploadedFile,
    onRemove,
    loading = false,
    required = false
}) => {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Le fichier ne doit pas dépasser 5MB');
                return;
            }
            onFileSelect(typeDocument, file);
        }
    }, [typeDocument, onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        disabled: loading || !!uploadedFile
    });

    const getFileIcon = (fileName) => {
        if (!fileName) return FaFile;
        const ext = fileName.split('.').pop().toLowerCase();
        if (ext === 'pdf') return FaFilePdf;
        if (['png', 'jpg', 'jpeg'].includes(ext)) return FaFileImage;
        return FaFile;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-2">
            {/* Label */}
            <label className="block text-gray-700 font-semibold">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {/* Upload Area or Uploaded File */}
            {!uploadedFile ? (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${isDragActive
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <input {...getInputProps()} />
                    <FaUpload className="text-4xl text-gray-400 mx-auto mb-3" />
                    {isDragActive ? (
                        <p className="text-blue-600 font-medium">Déposez le fichier ici...</p>
                    ) : (
                        <>
                            <p className="text-gray-600 font-medium mb-1">
                                Cliquez ou glissez-déposez
                            </p>
                            <p className="text-gray-500 text-sm">
                                PNG, JPG ou PDF (max 5MB)
                            </p>
                        </>
                    )}
                    {loading && (
                        <div className="mt-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-sm text-gray-600 mt-2">Upload en cours...</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="border-2 border-green-300 bg-green-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* File Icon */}
                            <div className="flex-shrink-0">
                                {React.createElement(getFileIcon(uploadedFile.name || uploadedFile.url), {
                                    className: 'text-3xl text-green-600'
                                })}
                            </div>

                            {/* File Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-gray-800 font-medium truncate">
                                    {uploadedFile.name || 'Document uploadé'}
                                </p>
                                <p className="text-gray-600 text-sm">
                                    {uploadedFile.size ? formatFileSize(uploadedFile.size) : 'Taille inconnue'}
                                </p>
                            </div>

                            {/* Success Icon */}
                            <FaCheckCircle className="text-green-600 text-xl flex-shrink-0" />
                        </div>

                        {/* Remove Button */}
                        {onRemove && !loading && (
                            <button
                                type="button"
                                onClick={() => onRemove(typeDocument)}
                                className="ml-3 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                title="Supprimer"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        )}
                    </div>

                    {/* Preview for images */}
                    {uploadedFile.preview && (
                        <div className="mt-3">
                            <img
                                src={uploadedFile.preview}
                                alt="Preview"
                                className="max-h-40 rounded-lg mx-auto"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DocumentUploader;
