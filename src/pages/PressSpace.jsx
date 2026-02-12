import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Badge, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchAllPosts } from '../store/slices/blog';
import { toast } from 'react-hot-toast';

const PressSpace = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { posts: articles, loading, error } = useSelector((state) => state.blog);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        window.scrollTo(0, 0);
        dispatch(fetchAllPosts());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error("Erreur lors de la récupération des articles.");
        }
    }, [error]);

    const filteredArticles = articles.filter(article => {
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white min-vh-100">
            {/* Header Section */}
            <div className="py-12 bg-light border-bottom">
                <Container>
                    <div className="text-center max-w-2xl mx-auto">
                        <Badge bg="primary" className="mb-3 px-3 py-2 text-uppercase fw-bold">Presse</Badge>
                        <h1 className="display-5 fw-bold text-dark">Espace Presse</h1>
                        <p className="text-muted">Retrouvez toutes les actualités et les communiqués de presse officiels de Magasin Général.</p>
                    </div>
                </Container>
            </div>

            <Container className="py-12">
                {/* Search Bar */}
                <div className="d-flex justify-content-end mb-10">
                    <div className="w-100" style={{ maxWidth: '300px' }}>
                        <InputGroup className="rounded-pill overflow-hidden border">
                            <Form.Control
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-0 px-4"
                            />
                            <Button variant="white" className="border-0">
                                <i className="fas fa-search text-muted"></i>
                            </Button>
                        </InputGroup>
                    </div>
                </div>

                {/* Articles List */}
                {loading ? (
                    <div className="text-center py-12">
                        <Spinner animation="border" variant="primary" />
                        <p className="mt-3 text-muted">Chargement des articles...</p>
                    </div>
                ) : (
                    <Row className="g-10">
                        {filteredArticles.length > 0 ? (
                            filteredArticles.map((article) => (
                                <Col lg={12} key={article.id}>
                                    <div className="press-article-row hover-shadow-lg transition-all rounded-4 p-4 border mb-4">
                                        <Row className="align-items-center">
                                            <Col md={3}>
                                                <div className="overflow-hidden rounded-3" style={{ height: '160px' }}>
                                                    <img
                                                        src={article.image || "https://placehold.co/600x400?text=No+Image"}
                                                        alt={article.title}
                                                        className="w-100 h-100 object-fit-cover transition-all hover-scale"
                                                    />
                                                </div>
                                            </Col>
                                            <Col md={9} className="mt-4 mt-md-0">
                                                <div className="d-flex align-items-center gap-2 mb-2">
                                                    {article.tags && article.tags.length > 0 && (
                                                        <Badge bg="info" className="text-white fw-medium">{article.tags[0]}</Badge>
                                                    )}
                                                    <span className="text-muted small">
                                                        {article.tags && article.tags.length > 0 && "| "}
                                                        {formatDate(article.published_at)}
                                                    </span>
                                                </div>
                                                <h3 className="h5 fw-bold text-dark mb-2">{article.title}</h3>
                                                <p className="text-muted small mb-3">{article.excerpt}</p>
                                                <Button
                                                    variant="link"
                                                    className="p-0 text-primary fw-bold text-decoration-none small"
                                                    onClick={() => {
                                                        navigate(`/espace-presse/${article.slug || article.id}`);
                                                    }}
                                                >
                                                    LIRE LA SUITE <i className="fas fa-arrow-right ms-2"></i>
                                                </Button>
                                            </Col>
                                        </Row>
                                    </div>
                                </Col>
                            ))
                        ) : (
                            <Col className="text-center py-12">
                                <i className="fas fa-search-minus display-1 text-light mb-4 d-block"></i>
                                <p className="text-muted">Aucun article ne correspond à votre recherche.</p>
                            </Col>
                        )}
                    </Row>
                )}
            </Container>

            <style>{`.press-article-row:hover { border-color: #004D95 !important; background-color: #f8fbff; } .max-w-2xl { max-width: 42rem; }`}</style>
        </div>
    );
};

export default PressSpace;

