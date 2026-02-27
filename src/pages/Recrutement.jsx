import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Spinner, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, applyForJob, clearMessages } from '../store/slices/recruitment';
import { toast } from 'react-hot-toast';
import RECRUITMENT_BG from "../assets/images/recruitment_hero.png";

const Recrutement = () => {
    const dispatch = useDispatch();
    const { jobs, loading, submitting, error, successMessage } = useSelector((state) => state.recruitment);

    const [showApplyModal, setShowApplyModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        cover_letter: '',
        resume: null
    });

    useEffect(() => {
        window.scrollTo(0, 0);
        dispatch(fetchJobs());
    }, [dispatch]);

    useEffect(() => {
        if (successMessage) {
            toast.success(successMessage || "Candidature envoyée avec succès !");
            setShowApplyModal(false);
            setFormData({ first_name: '', last_name: '', email: '', phone: '', cover_letter: '', resume: null });
            dispatch(clearMessages());
        }
        if (error) {
            const errorMsg = typeof error === 'string' ? error : error.message || "Erreur lors de l'opération.";
            toast.error(errorMsg);
            dispatch(clearMessages());
        }
    }, [successMessage, error, dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleSubmit = async (e, jobId = null) => {
        e.preventDefault();
        const finalJobId = jobId || selectedJob?.id;
        if (!finalJobId && !jobId) { toast.error("Veuillez sélectionner un poste."); return; }
        if (!formData.resume) { toast.error("Veuillez joindre votre CV."); return; }

        const data = new FormData();
        data.append('job_offer_id', finalJobId);
        data.append('first_name', formData.first_name);
        data.append('last_name', formData.last_name);
        data.append('email', formData.email);
        data.append('phone', formData.phone);
        data.append('cover_letter', formData.cover_letter);
        data.append('resume', formData.resume);
        dispatch(applyForJob(data));
    };

    const openApplyModal = (job) => {
        setSelectedJob(job);
        setShowApplyModal(true);
    };

    return (
        <div className="recrutement-page bg-white min-vh-100">
            {/* Hero */}
            <div
                className="position-relative overflow-hidden d-flex align-items-center"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 40, 85, 0.85), rgba(0, 40, 85, 0.7)), url(${RECRUITMENT_BG})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '420px',
                    paddingTop: '80px',
                    paddingBottom: '120px',
                }}
            >
                <Container className="text-center text-white">
                    <Row className="justify-content-center">
                        <Col lg={9}>
                            <Badge
                                bg="transparent"
                                className="mb-3 px-4 py-2 text-uppercase border border-white rounded-pill fw-light"
                                style={{ fontSize: '0.8rem', letterSpacing: '0.2em' }}
                            >
                                Rejoignez nos équipes
                            </Badge>
                            <h1 className="fw-bold mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '-0.02em' }}>
                                Cultivez votre talent <br className="d-none d-lg-block" />
                                <span className="text-info">au cœur de la Tunisie.</span>
                            </h1>
                            <p className="lead px-lg-5 opacity-90 fw-light mb-0" style={{ maxWidth: '700px', margin: '0 auto' }}>
                                Plus qu'un métier, nous vous proposons une aventure humaine unique au sein du leader de la distribution.
                            </p>
                        </Col>
                    </Row>
                </Container>
                <div className="position-absolute bottom-0 start-0 w-100 bg-white" style={{ height: '50px', clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }} />
            </div>

            {/* Main Card */}
            <Container style={{ marginTop: '-80px', position: 'relative', zIndex: 10, paddingBottom: '60px' }}>
                <Row className="justify-content-center">
                    <Col lg={11} xl={10}>
                        <Card className="border-0 overflow-hidden" style={{ borderRadius: '1.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)' }}>
                            <Row className="g-0">
                                {/* Left Panel */}
                                <Col md={5} className="text-white d-flex flex-column" style={{ background: 'linear-gradient(135deg, #0056b3 0%, #002855 100%)', padding: 'clamp(2rem, 4vw, 3.5rem)' }}>
                                    <div>
                                        <h2 className="fw-bold mb-4" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>Pourquoi MG ?</h2>

                                        <div className="d-flex mb-4">
                                            <div className="rounded-3 p-3 me-3 flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                                <i className="fas fa-rocket fs-5"></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Innovation & Challenge</h6>
                                                <p className="small opacity-75 mb-0">Participez à la transformation digitale du commerce de proximité.</p>
                                            </div>
                                        </div>

                                        <div className="d-flex mb-4">
                                            <div className="rounded-3 p-3 me-3 flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                                <i className="fas fa-graduation-cap fs-5"></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Formation Continue</h6>
                                                <p className="small opacity-75 mb-0">Nous investissons dans votre potentiel dès le premier jour.</p>
                                            </div>
                                        </div>

                                        <div className="d-flex">
                                            <div className="rounded-3 p-3 me-3 flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                                <i className="fas fa-heart fs-5"></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-bold mb-1">Bien-être au travail</h6>
                                                <p className="small opacity-75 mb-0">Un cadre respectueux favorisant l'équilibre pro/perso.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 d-none d-md-block" style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: '2rem' }}>
                                        <p className="small mb-0 fst-italic opacity-60">
                                            "Chez MG, nous ne recrutons pas seulement des CV, nous recrutons des personnalités."
                                        </p>
                                    </div>
                                </Col>

                                {/* Right Panel: Form */}
                                <Col md={7} className="bg-white" style={{ padding: 'clamp(2rem, 4vw, 3.5rem)' }}>
                                    <div className="mb-4">
                                        <h3 className="fw-bold mb-2" style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)' }}>Candidature Spontanée</h3>
                                        <p className="text-muted mb-0">Remplissez ce formulaire pour rejoindre notre base de talents.</p>
                                    </div>

                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="small text-muted fw-bold mb-1">PRÉNOM</Form.Label>
                                                    <Form.Control
                                                        type="text" required name="first_name"
                                                        value={formData.first_name} onChange={handleInputChange}
                                                        placeholder="Ahmed"
                                                        className="border-2 bg-light px-3 py-2"
                                                        style={{ borderColor: '#e9ecef', borderRadius: '0.75rem' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="small text-muted fw-bold mb-1">NOM</Form.Label>
                                                    <Form.Control
                                                        type="text" required name="last_name"
                                                        value={formData.last_name} onChange={handleInputChange}
                                                        placeholder="Ben Ali"
                                                        className="border-2 bg-light px-3 py-2"
                                                        style={{ borderColor: '#e9ecef', borderRadius: '0.75rem' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="small text-muted fw-bold mb-1">ADRESSE EMAIL</Form.Label>
                                                    <Form.Control
                                                        type="email" required name="email"
                                                        value={formData.email} onChange={handleInputChange}
                                                        placeholder="ahmed.benali@email.com"
                                                        className="border-2 bg-light px-3 py-2"
                                                        style={{ borderColor: '#e9ecef', borderRadius: '0.75rem' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label className="small text-muted fw-bold mb-1">VOTRE CV (PDF, Max 5MB)</Form.Label>
                                                    <Form.Control
                                                        type="file" required accept=".pdf,.doc,.docx"
                                                        onChange={handleFileChange}
                                                        className="border-2 bg-light px-3 py-2"
                                                        style={{ borderColor: '#e9ecef', borderRadius: '0.75rem', borderStyle: 'dashed' }}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={12} className="mt-3">
                                                <Button
                                                    type="submit" size="lg" disabled={submitting}
                                                    className="w-100 fw-bold border-0 py-3"
                                                    style={{ background: 'linear-gradient(135deg, #0056b3 0%, #002855 100%)', borderRadius: '0.75rem' }}
                                                >
                                                    {submitting ? <Spinner size="sm" /> : "ENVOYER MA CANDIDATURE"} <i className="fas fa-paper-plane ms-2"></i>
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>

                {/* Job Offers */}
                <div style={{ marginTop: '4rem' }}>
                    <div className="text-center mb-5">
                        <Badge bg="primary" className="mb-3 px-3 py-2 text-uppercase fw-bold">Opportunités</Badge>
                        <h2 className="fw-bold text-dark" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>Nos Offres d'Emploi</h2>
                        <p className="lead text-muted">Consultez nos postes ouverts et postulez dès maintenant.</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="mt-3 text-muted">Chargement des offres...</p>
                        </div>
                    ) : (
                        <Row className="g-4">
                            {jobs.length > 0 ? (
                                jobs.map((job) => (
                                    <Col lg={6} key={job.id}>
                                        <Card className="border-0 shadow-sm h-100" style={{ borderRadius: '1rem', transition: 'box-shadow 0.3s' }}>
                                            <Card.Body className="p-4 d-flex align-items-center justify-content-between gap-3">
                                                <div className="flex-grow-1">
                                                    <Badge bg="light" className="text-primary mb-2 px-3 py-1 border">{job.type}</Badge>
                                                    <h5 className="fw-bold mb-1">{job.title}</h5>
                                                    <p className="text-muted small mb-0">
                                                        <i className="fas fa-map-marker-alt me-2 text-info"></i>{job.location}
                                                        <span className="mx-2 opacity-25">|</span>
                                                        <i className="far fa-calendar-alt me-2 text-info"></i>{new Date(job.published_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <Button variant="outline-primary" className="rounded-pill px-4 fw-bold flex-shrink-0" onClick={() => openApplyModal(job)}>
                                                    Postuler
                                                </Button>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))
                            ) : (
                                <Col className="text-center py-5">
                                    <i className="fas fa-briefcase fa-3x text-muted mb-3 d-block opacity-25"></i>
                                    <p className="text-muted">Aucune offre d'emploi disponible pour le moment.</p>
                                </Col>
                            )}
                        </Row>
                    )}
                </div>

                {/* Stats */}
                <Row className="g-4 text-center" style={{ marginTop: '4rem' }}>
                    {[
                        { icon: 'fa-map-marker-alt', color: '#0dcaf0', bg: 'rgba(13,202,240,0.1)', value: '80+', label: 'Points de vente' },
                        { icon: 'fa-user-friends', color: '#198754', bg: 'rgba(25,135,84,0.1)', value: '4000+', label: 'Collaborateurs' },
                        { icon: 'fa-shield-alt', color: '#ffc107', bg: 'rgba(255,193,7,0.1)', value: '140 Ans', label: 'De savoir-faire' },
                    ].map((stat, i) => (
                        <Col md={4} key={i}>
                            <div className="p-4 rounded-4" style={{ transition: 'background 0.3s' }}>
                                <div
                                    className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
                                    style={{ width: '80px', height: '80px', backgroundColor: stat.bg, color: stat.color }}
                                >
                                    <i className={`fas ${stat.icon} fs-3`}></i>
                                </div>
                                <h3 className="fw-bold mb-1">{stat.value}</h3>
                                <p className="text-muted text-uppercase small fw-bold mb-0" style={{ letterSpacing: '0.15em' }}>{stat.label}</p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* Apply Modal */}
            <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
                    <Modal.Title className="fw-bold">Postuler pour : {selectedJob?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-muted fw-bold mb-1">Prénom</Form.Label>
                                    <Form.Control type="text" required name="first_name" value={formData.first_name} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-muted fw-bold mb-1">Nom</Form.Label>
                                    <Form.Control type="text" required name="last_name" value={formData.last_name} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small text-muted fw-bold mb-1">Email</Form.Label>
                                    <Form.Control type="email" required name="email" value={formData.email} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small text-muted fw-bold mb-1">Message / Lettre de motivation</Form.Label>
                                    <Form.Control as="textarea" rows={4} name="cover_letter" value={formData.cover_letter} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small text-muted fw-bold mb-1">Votre CV (PDF)</Form.Label>
                                    <Form.Control type="file" required accept=".pdf" onChange={handleFileChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12} className="text-end mt-3">
                                <Button variant="secondary" className="me-2 rounded-pill px-4" onClick={() => setShowApplyModal(false)}>Annuler</Button>
                                <Button variant="primary" type="submit" disabled={submitting} className="rounded-pill px-4">
                                    {submitting ? <Spinner size="sm" /> : "Envoyer ma candidature"}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Recrutement;
