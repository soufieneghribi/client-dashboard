import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup, Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';

const INITIAL_ARTICLES = [
    {
        id: 1,
        title: "MG élue Meilleure Marque de l'année 2026",
        date: "2026-01-24",
        category: "Distinction",
        image: "https://mg.tn/blog/wp-content/uploads/2026/01/MG-ELUE-MEILLEURE-MARQUE-2026.jpg",
        excerpt: "Magasin Général confirme sa position de leader en Tunisie en remportant le prix de la Meilleure Marque de l'année 2026."
    },
    {
        id: 2,
        title: "Dynamic de redressement confirmée en 2024",
        date: "2025-12-15",
        category: "Finance",
        image: "https://mg.tn/blog/wp-content/uploads/2025/12/redressement-mg.jpg",
        excerpt: "Les résultats financiers affichent une nette amélioration, illustrant le succès du nouveau plan stratégique."
    }
];

const CATEGORIES = ["Toutes", "Distinction", "Finance", "Innovation", "RSE", "Social"];

const PressSpace = () => {
    const [articles, setArticles] = useState(INITIAL_ARTICLES);
    const [selectedCategory, setSelectedCategory] = useState("Toutes");
    const [searchTerm, setSearchTerm] = useState("");
    const [showAdmin, setShowAdmin] = useState(false);

    // Form State for Add/Edit
    const [showModal, setShowModal] = useState(false);
    const [currentArticle, setCurrentArticle] = useState(null);
    const [formData, setFormData] = useState({ title: '', category: 'Distinction', excerpt: '', image: '' });

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSave = () => {
        if (currentArticle) {
            setArticles(articles.map(a => a.id === currentArticle.id ? { ...a, ...formData } : a));
            toast.success("Article modifié !");
        } else {
            const newArticle = { ...formData, id: Date.now(), date: new Date().toISOString().split('T')[0] };
            setArticles([newArticle, ...articles]);
            toast.success("Nouvel article ajouté !");
        }
        setShowModal(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Supprimer cet article ?")) {
            setArticles(articles.filter(a => a.id !== id));
            toast.error("Article supprimé");
        }
    };

    const openModal = (article = null) => {
        if (article) {
            setCurrentArticle(article);
            setFormData({ title: article.title, category: article.category, excerpt: article.excerpt, image: article.image });
        } else {
            setCurrentArticle(null);
            setFormData({ title: '', category: 'Distinction', excerpt: '', image: 'https://via.placeholder.com/400x250' });
        }
        setShowModal(true);
    };

    const filteredArticles = articles.filter(article => {
        const matchesCategory = selectedCategory === "Toutes" || article.category === selectedCategory;
        const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-white min-vh-100">
            {/* Header Section */}
            <div className="py-12 bg-light border-bottom">
                <Container>
                    <div className="text-center max-w-2xl mx-auto">
                        <Badge bg="primary" className="mb-3 px-3 py-2 text-uppercase fw-bold">Presse</Badge>
                        <h1 className="display-5 fw-bold text-dark">Espace Presse</h1>
                        <p className="text-muted">Gestion des actualités et communiqués.</p>

                        <Button
                            variant={showAdmin ? "danger" : "outline-dark"}
                            size="sm"
                            className="mt-3"
                            onClick={() => setShowAdmin(!showAdmin)}
                        >
                            {showAdmin ? "Quitter Mode Admin" : "Simuler Mode Admin (CRUD)"}
                        </Button>
                    </div>
                </Container>
            </div>

            <Container className="py-12">
                {/* Search and Filter Bar */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-10 gap-4">
                    <div className="d-flex gap-2 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategory === cat ? "primary" : "outline-secondary"}
                                size="sm"
                                className="rounded-pill px-4"
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>
                    <div className="d-flex gap-3 align-items-center">
                        {showAdmin && (
                            <Button variant="success" className="rounded-pill" onClick={() => openModal()}>
                                <i className="fas fa-plus me-2"></i> Ajouter
                            </Button>
                        )}
                        <InputGroup className="rounded-pill overflow-hidden border" style={{ maxWidth: '300px' }}>
                            <Form.Control
                                placeholder="Rechercher..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border-0 px-4"
                            />
                        </InputGroup>
                    </div>
                </div>

                {/* Articles List */}
                <Row className="g-10">
                    {filteredArticles.map((article) => (
                        <Col lg={12} key={article.id}>
                            <div className="press-article-row hover-shadow-lg transition-all rounded-4 p-4 border mb-4">
                                <Row className="align-items-center">
                                    <Col md={3}>
                                        <div className="overflow-hidden rounded-3" style={{ height: '160px' }}>
                                            <img src={article.image} alt={article.title} className="w-100 h-100 object-fit-cover" />
                                        </div>
                                    </Col>
                                    <Col md={7}>
                                        <div className="d-flex align-items-center gap-2 mb-2">
                                            <Badge bg="info">{article.category}</Badge>
                                            <span className="text-muted small">{article.date}</span>
                                        </div>
                                        <h3 className="h5 fw-bold mb-2">{article.title}</h3>
                                        <p className="text-muted small mb-0">{article.excerpt}</p>
                                    </Col>
                                    <Col md={2} className="text-end">
                                        {showAdmin ? (
                                            <div className="d-flex flex-column gap-2">
                                                <Button variant="outline-primary" size="sm" onClick={() => openModal(article)}>Modifier</Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(article.id)}>Supprimer</Button>
                                            </div>
                                        ) : (
                                            <Button variant="link" className="p-0 text-primary fw-bold text-decoration-none small">
                                                LIRE LA SUITE <i className="fas fa-arrow-right ms-2"></i>
                                            </Button>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* CRUD Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{currentArticle ? "Modifier Article" : "Nouvel Article"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Titre</Form.Label>
                            <Form.Control value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Catégorie</Form.Label>
                            <Form.Select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Résumé</Form.Label>
                            <Form.Control as="textarea" rows={3} value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>URL Image</Form.Label>
                            <Form.Control value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
                    <Button variant="primary" onClick={handleSave}>Enregistrer</Button>
                </Modal.Footer>
            </Modal>

            <style>{`.press-article-row:hover { border-color: #004D95 !important; background-color: #f8fbff; } .max-w-2xl { max-width: 42rem; }`}</style>
        </div>
    );
};

export default PressSpace;
