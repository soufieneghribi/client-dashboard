import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const UserMenu = ({ auth, handleLogout }) => {
    if (auth.isLoggedIn) {
        return (
            <Dropdown align="end" className="d-none d-lg-block">
                <Dropdown.Toggle variant="link" className="text-secondary text-decoration-none p-2 border-0">
                    <i className="fas fa-user-circle fs-4 me-1"></i>
                    <i className="fas fa-chevron-down small"></i>
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow border-0">
                    <Dropdown.Header className="small">
                        <strong>{auth.user?.nom_et_prenom?.split(' ')[0] || "Utilisateur"}</strong>
                    </Dropdown.Header>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/profile"><i className="fas fa-user me-2"></i> Paramètres</Dropdown.Item>

                    <Dropdown.Item as={Link} to="/Mes-Commandes"><i className="fas fa-shopping-bag me-2"></i> Mes Commandes</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/credit"><i className="fas fa-credit-card me-2"></i> Voir mes crédits</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/reclamations"><i className="fas fa-exclamation-circle me-2"></i> Réclamations</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                        <i className="fas fa-sign-out-alt me-2"></i> Déconnexion
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    return (
        <div className="d-none d-lg-flex align-items-center gap-2">
            <Link
                to="/login"
                className="text-decoration-none text-secondary fw-bold px-3 py-1 small hover:text-primary transition-colors"
                style={{ fontSize: '0.85rem' }}
            >
                Connexion
            </Link>
            <Link
                to="/inscrire"
                className="text-decoration-none text-white fw-bold px-3 py-1.5 small shadow-sm hover:shadow-md transition-shadow"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '20px',
                    fontSize: '0.85rem'
                }}
            >
                S'inscrire
            </Link>
        </div>
    );
};

export default UserMenu;
