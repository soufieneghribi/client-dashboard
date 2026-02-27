import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Badge, Button, Spinner, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPostDetails, fetchFeaturedPosts, clearCurrentPost } from '../store/slices/blog';
import { toast } from 'react-hot-toast';

const PressDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentPost: article, detailsLoading: loading, featuredPosts, error } = useSelector((state) => state.blog);

    useEffect(() => {
        window.scrollTo(0, 0);
        dispatch(fetchPostDetails(slug));
        dispatch(fetchFeaturedPosts());

        return () => {
            dispatch(clearCurrentPost());
        };
    }, [slug, dispatch]);

    useEffect(() => {
        if (error) {
            toast.error("Erreur lors du chargement de l'article.");
            navigate('/espace-presse');
        }
    }, [error, navigate]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
                <div className="text-center">
                    <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-3 text-muted fw-medium">Chargement de l'article...</p>
                </div>
            </div>
        );
    }

    if (!article) return null;

    const relatedPosts = featuredPosts.filter(p => p.slug !== slug).slice(0, 3);

    return (
        <div className="bg-light min-vh-100 pb-20">
            {/* Admin-like Header */}
            <div className="py-6 bg-white border-bottom mb-8">
                <Container>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <nav className="mb-2">
                                <span className="text-muted small">Détails de l'article</span>
                                <h2 className="h5 fw-bold text-dark mb-0">Détails de l'article</h2>
                            </nav>
                        </div>
                        <div className="d-flex gap-3">
                            <Button variant="outline-dark" size="sm" className="rounded-3 px-3" onClick={() => navigate('/espace-presse')}>
                                <i className="fas fa-chevron-left me-2"></i> Retour
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            <Container>
                <Row className="g-8">
                    {/* Left Column: Image & Meta */}
                    <Col lg={4}>
                        <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-6">
                            <div className="position-relative">
                                <img
                                    src={article.image || "https://placehold.co/800x600?text=Presse+Article"}
                                    alt={article.title}
                                    className="w-100 object-fit-cover"
                                    style={{ height: '300px' }}
                                />
                                {article.is_published && (
                                    <Badge bg="success" className="position-absolute top-0 end-0 m-4 px-3 py-2">
                                        PUBLIÉ
                                    </Badge>
                                )}
                            </div>
                            <div className="p-5 border-top bg-white">
                                <div className="mb-4 pb-4 border-bottom">
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted small text-uppercase">Auteur</span>
                                        <span className="fw-bold text-dark">{article.author_name || 'MG'}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-3">
                                        <span className="text-muted small text-uppercase">Date de publication</span>
                                        <span className="fw-bold text-dark">{formatDate(article.published_at)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted small text-uppercase">Temps de lecture</span>
                                        <span className="fw-bold text-dark">1 min</span>
                                    </div>
                                </div>

                                {article.external_link && (
                                    <div className="bg-primary bg-opacity-10 rounded-4 p-5 border border-primary border-opacity-25">
                                        <div className="d-flex align-items-center gap-2 mb-3">
                                            <i className="fas fa-external-link-alt text-primary"></i>
                                            <h6 className="fw-bold text-primary mb-0">Source Externe</h6>
                                        </div>
                                        <p className="text-muted small mb-4">Cet article est hébergé sur une plateforme tierce.</p>
                                        <Button
                                            variant="primary"
                                            className="w-100 rounded-3 fw-bold"
                                            onClick={() => window.open(article.external_link, '_blank')}
                                        >
                                            Consulter l'original
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>

                    {/* Right Column: Content */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm rounded-4 p-6 p-md-8 bg-white mb-6">
                            <div className="mb-8">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <h1 className="h2 fw-bold text-dark mb-0">{article.title}</h1>
                                </div>
                                <p className="text-muted">Aperçu de l'article de presse</p>
                            </div>

                            <hr className="my-8 opacity-10" />

                            <div className="mb-8">
                                <h5 className="fw-bold text-dark mb-6">Contenu De L'Article</h5>

                                {article.excerpt && (
                                    <div className="bg-light rounded-3 p-5 border-start border-primary border-4 mb-8">
                                        <p className="text-muted small text-uppercase fw-bold mb-2">Résumé / Extrait</p>
                                        <p className="fst-italic text-dark-emphasis mb-0">"{article.excerpt}"</p>
                                    </div>
                                )}

                                <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
                            </div>

                            <div className="d-flex justify-content-between align-items-center pt-8 border-top">
                                <span className="text-muted small">Dernière mise à jour : {formatDate(article.updated_at || article.published_at)}</span>
                                <Badge bg="info" className="text-white px-3 py-2 rounded-pill">ACTIF SUR LE SITE</Badge>
                            </div>
                        </Card>

                        {/* Social Share */}
                        <div className="d-flex align-items-center gap-4 mb-10">
                            <span className="fw-bold text-muted small">Partager cet article</span>
                            <div className="d-flex gap-2">
                                <Button variant="outline-primary" size="sm" className="rounded-circle p-2" style={{ width: '35px', height: '35px' }}>
                                    <i className="fab fa-facebook-f"></i>
                                </Button>
                                <Button variant="outline-primary" size="sm" className="rounded-circle p-2" style={{ width: '35px', height: '35px' }}>
                                    <i className="fab fa-linkedin-in"></i>
                                </Button>
                                <Button variant="outline-primary" size="sm" className="rounded-circle p-2" style={{ width: '35px', height: '35px' }}>
                                    <i className="fab fa-x-twitter"></i>
                                </Button>
                            </div>
                        </div>

                        {/* Suggestions */}
                        {relatedPosts.length > 0 && (
                            <div className="mt-12">
                                <h4 className="fw-bold text-dark mb-6">Articles recommandés</h4>
                                <Row className="g-4">
                                    {relatedPosts.map((post) => (
                                        <Col md={4} key={post.id}>
                                            <Card
                                                className="h-100 border-0 shadow-sm rounded-4 overflow-hidden hover-shadow transition-all cursor-pointer"
                                                onClick={() => navigate(`/espace-presse/${post.slug || post.id}`)}
                                            >
                                                <Card.Img variant="top" src={post.image || "https://placehold.co/600x400?text=Image"} style={{ height: '140px', objectFit: 'cover' }} />
                                                <Card.Body className="p-4">
                                                    <h6 className="fw-bold text-dark mb-0 fs-7 line-clamp-2">{post.title}</h6>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>

            <style>{`
                .bg-light { background-color: #f8f9fa !important; }
                .article-content { color: #4a5568; line-height: 1.8; font-size: 1.05rem; }
                .article-content p { margin-bottom: 1.5rem; }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .hover-shadow:hover { 
                    transform: translateY(-5px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1) !important;
                }
                .fs-7 { font-size: 0.9rem; }
            `}</style>
        </div>
    );
};

export default PressDetails;

