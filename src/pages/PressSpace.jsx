import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, InputGroup } from 'react-bootstrap';

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
    },
    {
        id: 3,
        title: "Magasin Général couronné Produit de l'Année 2025",
        date: "2025-11-05",
        category: "Innovation",
        image: "https://mg.tn/blog/wp-content/uploads/2025/11/produit-de-l-annee-2025.jpg",
        excerpt: "Plusieurs produits de la marque propre MG ont été plébiscités par les consommateurs tunisiens."
    }
];

const CATEGORIES = ["Toutes", "Distinction", "Finance", "Innovation", "RSE", "Social"];

const PressSpace = () => {
    const [selectedCategory, setSelectedCategory] = useState("Toutes");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const filteredArticles = INITIAL_ARTICLES.filter(article => {
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
                        <p className="text-muted">Retrouvez toutes les actualités et les communiqués de presse officiels de Magasin Général.</p>
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
                <Row className="g-10">
                    {filteredArticles.length > 0 ? (
                        filteredArticles.map((article) => (
                            <Col lg={12} key={article.id}>
                                <div className="press-article-row hover-shadow-lg transition-all rounded-4 p-4 border mb-4">
                                    <Row className="align-items-center">
                                        <Col md={3}>
                                            <div className="overflow-hidden rounded-3" style={{ height: '160px' }}>
                                                <img src={article.image} alt={article.title} className="w-100 h-100 object-fit-cover transition-all hover-scale" />
                                            </div>
                                        </Col>
                                        <Col md={9} className="mt-4 mt-md-0">
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <Badge bg="info" className="text-white fw-medium">{article.category}</Badge>
                                                <span className="text-muted small">| {article.date}</span>
                                            </div>
                                            <h3 className="h5 fw-bold text-dark mb-2">{article.title}</h3>
                                            <p className="text-muted small mb-3">{article.excerpt}</p>
                                            <Button variant="link" className="p-0 text-primary fw-bold text-decoration-none small">
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
            </Container>

            <style>{`.press-article-row:hover { border-color: #004D95 !important; background-color: #f8fbff; } .max-w-2xl { max-width: 42rem; }`}</style>
        </div>
    );
};

export default PressSpace;
