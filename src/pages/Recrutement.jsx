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

    // Form data state
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
            setFormData({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                cover_letter: '',
                resume: null
            });
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

        if (!finalJobId && !jobId) {
            toast.error("Veuillez sélectionner un poste.");
            return;
        }

        if (!formData.resume) {
            toast.error("Veuillez joindre votre CV.");
            return;
        }

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

                                {/* Right Panel: Form (Candidature Spontanée) */}
                                <Col md={7} className="p-5 p-lg-10 bg-white">
                                    <div className="mb-8">
                                        <h3 className="fw-bold mb-2 h2">Candidature Spontanée</h3>
                                        <p className="text-muted">Remplissez ce formulaire pour rejoindre notre base de talents.</p>
                                    </div>

                                    <Form onSubmit={handleSubmit}>
                                        <Row className="g-4">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="small text-muted fw-bold mb-2 tracking-wide uppercase">Prénom</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        required
                                                        name="first_name"
                                                        value={formData.first_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Ahmed"
                                                        className="form-control-lg border-2 border-light bg-light focus-bg-white px-4 py-3"
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label className="small text-muted fw-bold mb-2 tracking-wide uppercase">Nom</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        required
                                                        name="last_name"
                                                        value={formData.last_name}
                                                        onChange={handleInputChange}
                                                        placeholder="Ben Ali"
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
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
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
                                                            accept=".pdf,.doc,.docx"
                                                            onChange={handleFileChange}
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
                                                    disabled={submitting}
                                                    className="w-100 fw-bold py-4 shadow-xl border-0 bg-gradient-brand hover-scale transition-all"
                                                    style={{ background: 'linear-gradient(135deg, #0056b3 0%, #002855 100%)' }}
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

                {/* --- JOB OFFERS SECTION --- */}
                <Row className="mt-12">
                    <Col lg={12}>
                        <div className="text-center mb-10">
                            <Badge bg="primary" className="mb-3 px-3 py-2 text-uppercase fw-bold">Opportunités</Badge>
                            <h2 className="display-5 fw-bold text-dark">Nos Offres d'Emploi</h2>
                            <p className="lead text-muted">Consultez nos postes ouverts et postulez dès maintenant.</p>
                        </div>

                        {loading ? (
                            <div className="text-center py-10">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3 text-muted">Chargement des offres...</p>
                            </div>
                        ) : (
                            <Row className="g-4">
                                {jobs.length > 0 ? (
                                    jobs.map((job) => (
                                        <Col lg={6} key={job.id}>
                                            <Card className="border-0 shadow-sm hover-shadow-md transition-all rounded-4 overflow-hidden h-100">
                                                <Card.Body className="p-5 d-flex align-items-center justify-content-between">
                                                    <div>
                                                        <Badge bg="light" className="text-primary mb-2 px-3 py-1 border">{job.type}</Badge>
                                                        <h4 className="fw-bold mb-1">{job.title}</h4>
                                                        <p className="text-muted small mb-0">
                                                            <i className="fas fa-map-marker-alt me-2 text-info"></i> {job.location}
                                                            <span className="mx-2 text-light opacity-50">|</span>
                                                            <i className="far fa-calendar-alt me-2 text-info"></i> {new Date(job.published_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <Button variant="outline-primary" className="rounded-pill px-4 fw-bold" onClick={() => openApplyModal(job)}>
                                                        Postuler
                                                    </Button>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))
                                ) : (
                                    <Col className="text-center py-10">
                                        <p className="text-muted">Aucune offre d'emploi disponible pour le moment.</p>
                                    </Col>
                                )}
                            </Row>
                        )}
                    </Col>
                </Row>

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

            {/* Application Modal */}
            <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} centered size="lg">
                <Modal.Header closeButton className="border-0 pb-0">
                    <Modal.Title className="fw-bold">Postuler pour : {selectedJob?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-muted fw-bold mb-2">Prénom</Form.Label>
                                    <Form.Control type="text" required name="first_name" value={formData.first_name} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label className="small text-muted fw-bold mb-2">Nom</Form.Label>
                                    <Form.Control type="text" required name="last_name" value={formData.last_name} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small text-muted fw-bold mb-2">Email</Form.Label>
                                    <Form.Control type="email" required name="email" value={formData.email} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small text-muted fw-bold mb-2">Message / Lettre de motivation</Form.Label>
                                    <Form.Control as="textarea" rows={4} name="cover_letter" value={formData.cover_letter} onChange={handleInputChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label className="small text-muted fw-bold mb-2">Votre CV (PDF)</Form.Label>
                                    <Form.Control type="file" required accept=".pdf" onChange={handleFileChange} />
                                </Form.Group>
                            </Col>
                            <Col md={12} className="text-end">
                                <Button variant="secondary" className="me-2" onClick={() => setShowApplyModal(false)}>Annuler</Button>
                                <Button variant="primary" type="submit" disabled={submitting}>
                                    {submitting ? <Spinner size="sm" /> : "Envoyer ma candidature"}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>

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
