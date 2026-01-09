import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Spinner } from "react-bootstrap";
import { FaPlus, FaEye, FaClock, FaCheckCircle, FaExclamationCircle, FaTimesCircle } from "react-icons/fa";
import axios from "axios";
import { API_ENDPOINTS, getAuthHeaders } from "../../../services/api";

const ClaimsSection = () => {
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_ENDPOINTS.CLAIMS.ALL, {
                headers: getAuthHeaders()
            });

            // Get only the 3 most recent claims
            const recentClaims = response.data.data?.slice(0, 3) || [];
            setClaims(recentClaims);
            setError(null);
        } catch (err) {
            setError("Erreur lors du chargement des réclamations");
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            new: { label: 'Nouveau', color: '#3b82f6', bgColor: '#dbeafe', icon: FaClock },
            pending: { label: 'En attente', color: '#eab308', bgColor: '#fef3c7', icon: FaClock },
            in_progress: { label: 'En cours', color: '#f97316', bgColor: '#fed7aa', icon: FaExclamationCircle },
            pending_info: { label: 'En attente', color: '#a855f7', bgColor: '#f3e8ff', icon: FaClock },
            resolved: { label: 'Résolu', color: '#10b981', bgColor: '#d1fae5', icon: FaCheckCircle },
            closed: { label: 'Clôturé', color: '#6b7280', bgColor: '#f3f4f6', icon: FaTimesCircle },
            rejected: { label: 'Rejeté', color: '#ef4444', bgColor: '#fee2e2', icon: FaTimesCircle },
        };
        return configs[status] || configs.pending;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch {
            return dateString;
        }
    };

    return (
        <Card className="profile-card mb-3 mb-md-4" style={{
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            overflow: 'hidden'
        }}>
            <Card.Body className="p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-2">
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '20px' }}>📝</span>
                        </div>
                        <div>
                            <h3 className="mb-0 fw-bold" style={{ fontSize: '1.1rem', color: '#1f2937' }}>
                                Mes Réclamations
                            </h3>
                            <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>
                                Suivez vos demandes
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/reclamations/new')}
                        className="btn btn-sm d-flex align-items-center gap-2"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <FaPlus size={12} />
                        <span>Nouvelle</span>
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" size="sm" style={{ color: '#667eea' }} />
                    </div>
                ) : error ? (
                    <div className="text-center py-4">
                        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>{error}</p>
                    </div>
                ) : claims.length === 0 ? (
                    <div className="text-center py-4">
                        <div className="mb-3" style={{ fontSize: '3rem', opacity: 0.3 }}>📋</div>
                        <p className="text-muted mb-2" style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                            Aucune réclamation
                        </p>
                        <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                            Créez votre première réclamation
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="d-flex flex-column gap-3">
                            {claims.map((claim) => {
                                const statusConfig = getStatusConfig(claim.status);
                                const StatusIcon = statusConfig.icon;

                                return (
                                    <div
                                        key={claim.id}
                                        className="p-3"
                                        style={{
                                            background: '#f9fafb',
                                            borderRadius: '12px',
                                            border: '1px solid #f3f4f6',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => navigate(`/reclamations/${claim.id}`)}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#f3f4f6';
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = '#f9fafb';
                                            e.currentTarget.style.borderColor = '#f3f4f6';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <div className="flex-grow-1">
                                                <h4 className="mb-1 fw-bold" style={{
                                                    fontSize: '0.9rem',
                                                    color: '#1f2937',
                                                    lineHeight: '1.3'
                                                }}>
                                                    {claim.subject}
                                                </h4>
                                                <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                                                    Réf: {claim.reference}
                                                </p>
                                            </div>
                                            <div
                                                className="d-flex align-items-center gap-1 px-2 py-1"
                                                style={{
                                                    background: statusConfig.bgColor,
                                                    color: statusConfig.color,
                                                    borderRadius: '6px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '600',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <StatusIcon size={10} />
                                                <span>{statusConfig.label}</span>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                {formatDate(claim.created_at)}
                                            </span>
                                            <FaEye size={12} style={{ color: '#667eea' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {claims.length > 0 && (
                            <button
                                onClick={() => navigate('/reclamations')}
                                className="btn btn-link w-100 mt-3 p-0"
                                style={{
                                    color: '#667eea',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    textDecoration: 'none'
                                }}
                            >
                                Voir toutes les réclamations →
                            </button>
                        )}
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default ClaimsSection;
