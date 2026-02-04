import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import RECRUITMENT_BG from "../assets/images/recruitment_hero.png";

const Recrutement = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-white min-vh-100">
            {/* --- HERO SECTION --- */}
            <div
                className="position-relative overflow-hidden py-8 py-lg-12"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 40, 85, 0.85), rgba(0, 40, 85, 0.7)), url(${RECRUITMENT_BG})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '40vh',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <Container className="text-center text-white">
                    <Row className="justify-content-center">
                        <Col lg={9}>
                            <Badge
                                bg="transparent"
                                className="mb-4 px-4 py-2 text-uppercase tracking-widest border border-white rounded-pill fw-light"
                                style={{ fontSize: '0.8rem' }}
                            >
                                Rejoignez nos équipes
                            </Badge>
                            <h1 className="display-2 fw-bold mb-4 tracking-tight">
                                Cultivez votre talent <br className="d-none d-lg-block" />
                                <span className="text-info">au cœur de la Tunisie.</span>
                            </h1>
                            <p className="lead px-lg-10 opacity-90 fw-light mb-0">
                                Plus qu'un métier, nous vous proposons une aventure humaine unique au sein du leader de la distribution.
                                Ensemble, construisons le commerce de demain.
                            </p>
                        </Col>
                    </Row>
                </Container>

                {/* Decorative curve at bottom */}
                <div
                    className="position-absolute bottom-0 start-0 w-100 bg-white"
                    style={{ height: '50px', clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}
                ></div>
            </div>

            <Container className="pb-10 mt-n10 position-relative z-index-10">
                <Row className="justify-content-center">
                    <Col lg={11} xl={10}>
                        <Card className="border-0 shadow-2xl rounded-5 overflow-hidden">
                            <Row className="g-0">
                                {/* Left Panel: Information */}
                                <Col md={5} className="bg-primary p-5 p-lg-10 text-white d-flex flex-column justify-content-between">
                                    <div>
                                        <h2 className="fw-bold mb-5 h1">Pourquoi MG ?</h2>

                                        <div className="mb-6 d-flex">
                                            <div className="bg-white bg-opacity-10 rounded-3 p-3 me-4 h-100">
                                                <i className="fas fa-rocket fs-4"></i>
                                            </div>
                                            <div>
                                                <h5 className="fw-bold mb-1">Innovation & Challenge</h5>
                                                <p className="small opacity-75 mb-0">Participez à la transformation digitale du commerce de proximité.</p>
                                            </div>
                                        </div>

                                        <div className="mb-6 d-flex">
                                            <div className="bg-white bg-opacity-10 rounded-3 p-3 me-4 h-100">
                                                <i className="fas fa-graduation-cap fs-4"></i>
                                            </div>
                                            <div>
                                                <h5 className="fw-bold mb-1">Formation Continue</h5>
                                                <p className="small opacity-75 mb-0">Nous investissons dans votre potentiel dès le premier jour.</p>
                                            </div>
                                        </div>

                                        <div className="mb-0 d-flex">
                                            <div className="bg-white bg-opacity-10 rounded-3 p-3 me-4 h-100">
                                                <i className="fas fa-heart fs-4"></i>
                                            </div>
                                            <div>
                                                <h5 className="fw-bold mb-1">Bien-être au travail</h5>
                                                <p className="small opacity-75 mb-0">Un cadre respectueux favorisant l'équilibre pro/perso.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-10 border-top border-white border-opacity-10 d-none d-md-block">
                                        <p className="small mb-0 opacity-60">
                                            "Chez MG, nous ne recrutons pas seulement des CV, nous recrutons des personnalités."
                                        </p>
                                    </div>
                                </Col>

                                {/* Right Panel: Form */}
                                <Col md={7} className="p-5 p-lg-10 bg-white">
                                    <div className="mb-8">
                                        <h3 className="fw-bold mb-2 h2">Candidature Spontanée</h3>
                                        <p className="text-muted">Remplissez ce formulaire pour rejoindre notre base de talents.</p>
                                    </div>

                                    <Form onSubmit={(e) => { e.preventDefault(); toast.success("Candidature envoyée avec succès !"); }}>
                                        <Row className="g-4">
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="small text-muted fw-bold mb-2 tracking-wide uppercase">Nom Complet</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        required
                                                        placeholder="Ahmed Ben Ali"
                                                        className="form-control-lg border-2 border-light bg-light focus-bg-white px-4 py-3"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="small text-muted fw-bold mb-2 tracking-wide uppercase">Adresse Email</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        required
                                                        placeholder="ahmed.benali@email.com"
                                                        className="form-control-lg border-2 border-light bg-light focus-bg-white px-4 py-3"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="small text-muted fw-bold mb-2 tracking-wide uppercase">Votre CV (PDF, Max 5MB)</Form.Label>
                                                    <div className="position-relative">
                                                        <Form.Control
                                                            type="file"
                                                            required
                                                            className="form-control-lg border-2 border-dashed border-light bg-light focus-bg-white px-4 py-3"
                                                        />
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                            <Col md={12} className="pt-4">
                                                <Button
                                                    type="submit"
                                                    variant="primary"
                                                    size="lg"
                                                    className="w-100 fw-bold py-4 shadow-xl border-0 bg-gradient-brand hover-scale transition-all"
                                                    style={{ background: 'linear-gradient(135deg, #0056b3 0%, #002855 100%)' }}
                                                >
                                                    ENVOYER MA CANDIDATURE <i className="fas fa-paper-plane ms-2"></i>
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {/* --- JOB OFFERS SECTION --- */}
                <Row className="mt-12">
                    <Col lg={12}>
                        <div className="text-center mb-10">
                            <Badge bg="primary" className="mb-3 px-3 py-2 text-uppercase fw-bold">Opportunités</Badge>
                            <h2 className="display-5 fw-bold text-dark">Nos Offres d'Emploi</h2>
                            <p className="lead text-muted">Consultez nos postes ouverts et postulez dès maintenant.</p>
                        </div>

                        <Row className="g-4">
                            {[
                                { title: "Chef Comptable (H/F)", type: "CDI", loc: "Siège Tunis", date: "Publié le 24/01/2026" },
                                { title: "Technicien Mécanique", type: "CDI", loc: "Centre de Distribution", date: "Publié le 20/01/2026" },
                                { title: "Directeur Maintenance", type: "CDI", loc: "Tunis", date: "Publié le 18/01/2026" },
                                { title: "Community Manager", type: "SIVP/CDI", loc: "Direction Marketing", date: "Publié le 15/01/2026" }
                            ].map((job, idx) => (
                                <Col lg={6} key={idx}>
                                    <Card className="border-0 shadow-sm hover-shadow-md transition-all rounded-4 overflow-hidden h-100">
                                        <Card.Body className="p-5 d-flex align-items-center justify-content-between">
                                            <div>
                                                <Badge bg="light" className="text-primary mb-2 px-3 py-1 border">{job.type}</Badge>
                                                <h4 className="fw-bold mb-1">{job.title}</h4>
                                                <p className="text-muted small mb-0">
                                                    <i className="fas fa-map-marker-alt me-2 text-info"></i> {job.loc}
                                                    <span className="mx-2 text-light opacity-50">|</span>
                                                    <i className="far fa-calendar-alt me-2 text-info"></i> {job.date}
                                                </p>
                                            </div>
                                            <Button variant="outline-primary" className="rounded-pill px-4 fw-bold">
                                                Voir l'offre
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        <div className="text-center mt-10">
                            <Button variant="link" className="text-primary fw-bold text-decoration-none">
                                Voir toutes les offres <i className="fas fa-arrow-right ms-2"></i>
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* --- STATS SECTION --- */}
                <Row className="mt-15 g-4 text-center">
                    <Col md={4}>
                        <div className="p-8 hover-bg-light transition-all rounded-4">
                            <div className="d-inline-flex align-items-center justify-content-center mb-4 bg-info bg-opacity-10 text-info rounded-circle" style={{ width: '90px', height: '90px' }}>
                                <i className="fas fa-map-marker-alt fs-2"></i>
                            </div>
                            <h3 className="fw-bold h2 mb-1">80+</h3>
                            <p className="text-muted text-uppercase tracking-widest small fw-bold">Points de vente</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="p-8 hover-bg-light transition-all rounded-4">
                            <div className="d-inline-flex align-items-center justify-content-center mb-4 bg-success bg-opacity-10 text-success rounded-circle" style={{ width: '90px', height: '90px' }}>
                                <i className="fas fa-user-friends fs-2"></i>
                            </div>
                            <h3 className="fw-bold h2 mb-1">4000+</h3>
                            <p className="text-muted text-uppercase tracking-widest small fw-bold">Collaborateurs</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="p-8 hover-bg-light transition-all rounded-4">
                            <div className="d-inline-flex align-items-center justify-content-center mb-4 bg-warning bg-opacity-10 text-warning rounded-circle" style={{ width: '90px', height: '90px' }}>
                                <i className="fas fa-shield-alt fs-2"></i>
                            </div>
                            <h3 className="fw-bold h2 mb-1">140 Ans</h3>
                            <p className="text-muted text-uppercase tracking-widest small fw-bold">De savoir-faire</p>
                        </div>
                    </Col>
                </Row>
            </Container>

            <style>{`
                .py-10 { padding-top: 5rem; padding-bottom: 5rem; }
                .py-20 { padding-top: 10rem; padding-bottom: 10rem; }
                .pb-10 { padding-bottom: 5rem; }
                .mt-n10 { margin-top: -8rem !important; }
                .mt-10 { margin-top: 5rem; }
                .z-index-10 { z-index: 10; }
                .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
                .rounded-5 { border-radius: 2rem !important; }
                .tracking-widest { letter-spacing: 0.2em; }
                .tracking-tight { letter-spacing: -0.02em; }
                .bg-gradient-brand { background: linear-gradient(135deg, #0056b3 0%, #002855 100%); }
                .hover-scale { transition: transform 0.3s ease; }
                .hover-scale:hover { transform: translateY(-3px); }
                .hover-bg-light:hover { background-color: #f8f9fa; }
                .italic { font-style: italic; }
                .border-dashed { border-style: dashed !important; }
                
                @media (max-width: 991.98px) {
                    .display-2 { font-size: 3rem; }
                    .mt-n10 { margin-top: -4rem !important; }
                }
            `}</style>
        </div>
    );
};

export default Recrutement;
