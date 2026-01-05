import React from "react";
import { Modal, Row, Col, Button } from "react-bootstrap";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import { FiDownload, FiCopy } from "react-icons/fi";

const QRCodeModal = ({ show, onHide, loyaltyCard, displayCode, downloadQRCode, copyToClipboard }) => {
    return (
        <Modal show={show} onHide={onHide} centered size="lg">
            <Modal.Header closeButton style={{ border: "none", paddingBottom: 0 }}>
                <Modal.Title style={{ fontWeight: "700", color: "#212529" }}>
                    Votre Carte Fidélité Complète
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-5">
                <div className="text-center mb-4">
                    <p style={{ fontSize: "0.875rem", color: "#6c757d", marginBottom: "0.5rem", fontWeight: "600" }}>
                        CODE DE LA CARTE
                    </p>
                    <p style={{ fontWeight: "700", fontSize: "1.75rem", fontFamily: "monospace", color: "#212529", letterSpacing: "3px" }}>
                        {displayCode}
                    </p>
                </div>

                <Row className="justify-content-center">
                    <Col md={6} className="text-center mb-4">
                        <div className="mb-3">
                            <h5 style={{ fontWeight: "600", color: "#212529", fontSize: "1rem" }}>QR Code</h5>
                            <p style={{ fontSize: "0.75rem", color: "#6c757d" }}>Scannez avec votre téléphone</p>
                        </div>
                        <div className="loyalty-qr-container">
                            <QRCodeSVG
                                id="loyalty-qr-code"
                                value={loyaltyCard?.code || ""}
                                size={200}
                                level="H"
                                includeMargin={true}
                            />
                        </div>
                    </Col>

                    <Col md={6} className="text-center mb-4">
                        <div className="mb-3">
                            <h5 style={{ fontWeight: "600", color: "#212529", fontSize: "1rem" }}>Code-Barres</h5>
                            <p style={{ fontSize: "0.75rem", color: "#6c757d" }}>Présentez en caisse</p>
                        </div>
                        <div className="loyalty-qr-container">
                            <Barcode
                                id="loyalty-barcode"
                                value={loyaltyCard?.code || ""}
                                format="CODE128"
                                width={2}
                                height={80}
                                displayValue={true}
                                fontSize={14}
                                background="white"
                                lineColor="#000"
                            />
                        </div>
                    </Col>
                </Row>

                <div style={{ background: "#f8f9fa", padding: "1.5rem", borderRadius: "12px", marginTop: "1.5rem" }}>
                    <h6 style={{ fontWeight: "600", color: "#212529", marginBottom: "0.75rem" }}>
                        💡 Comment utiliser votre carte ?
                    </h6>
                    <ul style={{ fontSize: "0.875rem", color: "#6c757d", marginBottom: 0, paddingLeft: "1.25rem" }}>
                        <li>Présentez le QR Code ou le code-barres lors de vos achats en magasin</li>
                        <li>Téléchargez l'image pour l'avoir toujours sur vous</li>
                        <li>Vous pouvez aussi simplement communiquer le code numérique</li>
                    </ul>
                </div>

                <div className="d-flex gap-2 justify-content-center flex-wrap mt-4">
                    <Button
                        onClick={downloadQRCode}
                        className="loyalty-button loyalty-button-primary"
                    >
                        <FiDownload size={18} />
                        Télécharger
                    </Button>
                    <Button
                        onClick={() => copyToClipboard(loyaltyCard?.code)}
                        className="loyalty-button"
                        style={{ background: "#6c757d", color: "white", border: "none" }}
                    >
                        <FiCopy size={18} />
                        Copier le code
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default QRCodeModal;
