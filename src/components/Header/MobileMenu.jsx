import React from 'react';
import { Offcanvas, Form, InputGroup, Button, Nav, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const MobileMenu = ({
    show,
    onHide,
    COMPANY_LOGO,
    handleSearchSubmit,
    searchQuery,
    handleSearchChange,
    NAV_LINKS,
    auth,
    handleLogout,
    cartCount
}) => {
    return (
        <Offcanvas show={show} onHide={onHide} placement="start">
            <Offcanvas.Header closeButton className="border-bottom">
                <Offcanvas.Title>
                    <img src={COMPANY_LOGO} height="22" alt="Logo" className="me-2" />
                    Menu
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Form onSubmit={handleSearchSubmit} className="mb-4">
                    <InputGroup>
                        <Form.Control placeholder="Rechercher..." value={searchQuery} onChange={handleSearchChange} />
                        <Button variant="primary" type="submit"><i className="fas fa-search"></i></Button>
                    </InputGroup>
                </Form>

                <Nav className="flex-column mb-4">
                    {NAV_LINKS.map((link) => {
                        if (link.label === "Crédit") {
                            return (
                                <div key="credit-mobile-group">
                                    <div className="py-3 d-flex align-items-center text-dark fw-bold px-3">
                                        <i className={`fas ${link.icon} me-3 text-primary`} style={{ width: '20px' }}></i>
                                        {link.label}
                                    </div>
                                    <div className="ps-5">
                                        <Nav.Link as={Link} to="/credit/simulation" className="py-2 text-dark" onClick={onHide}>
                                            Simulation
                                        </Nav.Link>
                                        <Nav.Link as={Link} to="/credit" className="py-2 text-dark" onClick={onHide}>
                                            Voir mes crédits
                                        </Nav.Link>
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <Nav.Link key={link.path} as={Link} to={link.path} className="py-3 d-flex align-items-center text-dark" onClick={onHide}>
                                <i className={`fas ${link.icon} me-3 text-primary`} style={{ width: '20px' }}></i>
                                {link.label}
                            </Nav.Link>
                        );
                    })}
                </Nav>

                <hr />
                {auth.isLoggedIn ? (
                    <div>
                        <p className="text-muted small mb-3">
                            <i className="fas fa-user-circle me-2"></i>
                            Connecté: <strong>{auth.user?.nom_et_prenom}</strong>
                        </p>
                        <Nav className="flex-column">
                            <Nav.Link as={Link} to="/profile" className="py-2 text-dark" onClick={onHide}>
                                <i className="fas fa-user me-3 text-primary" style={{ width: '20px' }}></i> Mon Profil
                            </Nav.Link>
                            <Nav.Link as={Link} to="/Mes-Commandes" className="py-2 text-dark" onClick={onHide}>
                                <i className="fas fa-shopping-bag me-3 text-primary" style={{ width: '20px' }}></i> Mes Commandes
                            </Nav.Link>
                            <Nav.Link as={Link} to="/credit" className="py-2 text-dark" onClick={onHide}>
                                <i className="fas fa-credit-card me-3 text-primary" style={{ width: '20px' }}></i> Voir mes crédits
                            </Nav.Link>
                            <Nav.Link as={Link} to="/reclamations" className="py-2 text-dark" onClick={onHide}>
                                <i className="fas fa-exclamation-circle me-3 text-primary" style={{ width: '20px' }}></i> Réclamations
                            </Nav.Link>
                            <Nav.Link onClick={handleLogout} className="py-2 text-danger">
                                <i className="fas fa-sign-out-alt me-3" style={{ width: '20px' }}></i> Déconnexion
                            </Nav.Link>
                        </Nav>
                    </div>
                ) : (
                    <div className="d-grid gap-2">
                        <Button variant="outline-primary" as={Link} to="/login" onClick={onHide}>
                            <i className="fas fa-right-to-bracket me-2"></i> Connexion
                        </Button>
                        <Button as={Link} to="/inscrire" onClick={onHide} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }} className="text-white">
                            <i className="fas fa-user-plus me-2"></i> S'inscrire
                        </Button>
                    </div>
                )}

                <hr />
                <div className="d-flex gap-2">
                    <Button variant="outline-danger" as={Link} to="/favoris" className="flex-fill" onClick={onHide}>
                        <i className="far fa-heart me-2"></i> Favoris
                    </Button>
                    <Button variant="outline-primary" as={Link} to="/cart-shopping" className="flex-fill position-relative" onClick={onHide}>
                        <i className="fas fa-shopping-cart me-2"></i> Panier
                        {cartCount > 0 && (
                            <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">
                                {cartCount}
                            </Badge>
                        )}
                    </Button>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default MobileMenu;
