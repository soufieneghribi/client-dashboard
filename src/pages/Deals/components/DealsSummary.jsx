import React from "react";
import { Row, Col } from "react-bootstrap";
import { FiTrendingUp, FiClock } from "react-icons/fi";
import { FaWallet } from "react-icons/fa";

const DealsSummary = ({ cagnotteBalance, totalEarned, totalPending }) => {
    return (
        <div className="deals-summary-card">
            <Row className="g-4">
                <Col xs={12} md={4}>
                    <div className="deals-summary-item" style={{ background: "#fff9eb" }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon-wrapper" style={{ backgroundColor: "#fbbf24", padding: "12px", borderRadius: "12px", color: "white" }}>
                                <FaWallet size={20} />
                            </div>
                            <div>
                                <p className="mb-0 text-muted small fw-bold text-uppercase ls-wide" style={{ letterSpacing: '0.05em' }}>Ma Cagnotte</p>
                                <h3 className="mb-0 fw-800" style={{ fontSize: "1.5rem", color: "#1e293b" }}>{Number(cagnotteBalance).toFixed(1)} <span style={{ fontSize: '0.9rem' }}>DT</span></h3>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col xs={12} md={4}>
                    <div className="deals-summary-item" style={{ background: "#f0fdf4" }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon-wrapper" style={{ backgroundColor: "#22c55e", padding: "12px", borderRadius: "12px", color: "white" }}>
                                <FiTrendingUp size={20} />
                            </div>
                            <div>
                                <p className="mb-0 text-muted small fw-bold text-uppercase ls-wide" style={{ letterSpacing: '0.05em' }}>Gains Total</p>
                                <h3 className="mb-0 fw-800" style={{ fontSize: "1.5rem", color: "#1e293b" }}>{Number(totalEarned).toFixed(1)} <span style={{ fontSize: '0.9rem' }}>DT</span></h3>
                            </div>
                        </div>
                    </div>
                </Col>
                <Col xs={12} md={4}>
                    <div className="deals-summary-item" style={{ background: "#f8fafc" }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="stat-icon-wrapper" style={{ backgroundColor: "#64748b", padding: "12px", borderRadius: "12px", color: "white" }}>
                                <FiClock size={20} />
                            </div>
                            <div>
                                <p className="mb-0 text-muted small fw-bold text-uppercase ls-wide" style={{ letterSpacing: '0.05em' }}>En Attente</p>
                                <h3 className="mb-0 fw-800" style={{ fontSize: "1.5rem", color: "#1e293b" }}>{Number(totalPending).toFixed(1)} <span style={{ fontSize: '0.9rem' }}>DT</span></h3>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default DealsSummary;
