import React from 'react';
import { Form, InputGroup, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const SearchSection = ({
    searchQuery,
    handleSearchChange,
    handleSearchSubmit,
    searchLoading,
    showSearchResults,
    searchResults,
    handleProductClick,
    formatPrice,
    ProductImage,
    searchRef
}) => {
    return (
        <div className="d-none d-lg-block flex-grow-1 mx-4 position-relative" style={{ maxWidth: '500px' }} ref={searchRef}>
            <Form onSubmit={handleSearchSubmit}>
                <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                    <Form.Control
                        placeholder="Rechercher un produit..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchQuery && searchResults.length > 0 && setShowSearchResults(true)}
                        className="border-0 px-4 py-2"
                        style={{ boxShadow: 'none' }}
                    />
                    <Button variant="white" type="submit" disabled={searchLoading} className="border-0 px-3 text-secondary">
                        {searchLoading ? <span className="spinner-border spinner-border-sm"></span> : <i className="fas fa-search"></i>}
                    </Button>
                </InputGroup>
            </Form>

            {showSearchResults && searchQuery && Array.isArray(searchResults) && searchResults.length > 0 && (
                <div
                    className="position-absolute bg-white shadow-lg rounded mt-1 w-100 border"
                    style={{ zIndex: 1000, maxHeight: '450px', overflowY: 'auto' }}
                >
                    <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-light">
                        <span className="text-muted small">
                            {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                        </span>
                        {searchResults.length > 5 && (
                            <Button
                                variant="link"
                                size="sm"
                                className="text-decoration-none p-0"
                                onClick={handleSearchSubmit}
                            >
                                Voir tout
                            </Button>
                        )}
                    </div>

                    {searchResults.slice(0, 5).map((product) => (
                        <div
                            key={product.id}
                            className="d-flex align-items-center p-3 border-bottom cursor-pointer"
                            onClick={() => handleProductClick(product.id, product.type_id)}
                            style={{
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                            <ProductImage product={product} />

                            <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                <p className="mb-0 fw-medium text-dark text-truncate">
                                    {product.name}
                                </p>
                                {product.description && (
                                    <p className="mb-0 text-muted small text-truncate" style={{ maxWidth: '300px' }}>
                                        {product.description}
                                    </p>
                                )}
                                {(product.category || product.brand) && (
                                    <div className="d-flex gap-1 mt-1">
                                        {product.category && (
                                            <Badge bg="secondary" className="text-white" style={{ fontSize: '0.7rem' }}>
                                                {product.category}
                                            </Badge>
                                        )}
                                        {product.brand && (
                                            <Badge bg="info" className="text-white" style={{ fontSize: '0.7rem' }}>
                                                {product.brand}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>

                            {product.price && (
                                <div className="text-success fw-bold ms-2" style={{ whiteSpace: 'nowrap' }}>
                                    {formatPrice(product.price)} DT
                                </div>
                            )}
                        </div>
                    ))}

                    {searchResults.length > 5 && (
                        <div
                            className="text-center py-3 text-primary fw-medium cursor-pointer"
                            onClick={handleSearchSubmit}
                            style={{
                                cursor: 'pointer',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                            Voir les {searchResults.length - 5} autres résultats
                        </div>
                    )}
                </div>
            )}

            {showSearchResults && searchQuery && Array.isArray(searchResults) && searchResults.length === 0 && !searchLoading && (
                <div
                    className="position-absolute bg-white shadow-lg rounded mt-1 w-100 border text-center py-4"
                    style={{ zIndex: 1000 }}
                >
                    <i className="fas fa-search text-muted mb-2" style={{ fontSize: '2rem' }}></i>
                    <p className="text-muted mb-0">Aucun produit trouvé</p>
                    <p className="text-muted small">pour "{searchQuery}"</p>
                </div>
            )}
        </div>
    );
};

export default SearchSection;
