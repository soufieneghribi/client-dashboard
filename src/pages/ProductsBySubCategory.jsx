import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchProduct, fetchAttributes } from '../store/slices/product';

import Cookies from "js-cookie";
import { Container, Row, Col, Card, Button, Breadcrumb, Badge, Pagination, Offcanvas } from 'react-bootstrap';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import WishlistButton from '../components/WishlistButton';
import { FaFilter, FaTimes } from 'react-icons/fa';

const ProductsBySubCategory = () => {
  const location = useLocation();
  const { product = {}, availableAttributes = [], loading, error } = useSelector((state) => state.product);
  const { categories = [] } = useSelector((state) => state.categorie);

  // Extract products safely from wrapped or flat responses
  const allProducts = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product)) return product;
    if (product.data && Array.isArray(product.data)) return product.data;
    if (product.data?.data && Array.isArray(product.data.data)) return product.data.data;
    if (product.products && Array.isArray(product.products)) return product.products;
    return [];
  }, [product]);
  const dispatch = useDispatch();

  const subId = location.state?.subId;
  const [subTitle, setSubTitle] = useState(location.state?.subTitle || "Produits");

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const itemsPerPage = 12;

  // New states for server-side filters
  const [tempPriceRange, setTempPriceRange] = useState([0, 5000]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showAllAttributes, setShowAllAttributes] = useState(false);
  const [expandedValues, setExpandedValues] = useState({}); // { attrId: boolean }
  const [selectedAttributes, setSelectedAttributes] = useState({}); // { attrId: [val1, val2] }
  const [isAvailable, setIsAvailable] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');

  // Calculer l'objet parent pour afficher son titre dynamiquement
  const parentCategory = useMemo(() => {
    if (!subId || !categories || categories.length === 0) return null;
    const currentCat = categories.find(cat => cat.id === parseInt(subId));
    if (!currentCat) return null;
    return categories.find(cat => cat.id === currentCat.parent_id);
  }, [subId, categories]);

  const isElectronic = useMemo(() => {
    if (!subId || !categories || categories.length === 0) return false;
    const currentCat = categories.find(cat => cat.id === parseInt(subId));
    if (!currentCat) return false;
    return currentCat.universe_id === 2 ||
      currentCat.id === 144 ||
      currentCat.parent_id === 144 ||
      (currentCat.parent_id !== 0 && categories.find(c => c.id === currentCat.parent_id)?.universe_id === 2);
  }, [subId, categories]);

  // Image URL Helper is now centralized
  const getProductImageUrl = (p) => getImageUrl(p, 'product');

  useEffect(() => {
    if (subId) {
      dispatch(fetchAttributes(subId));
      if (!location.state?.subTitle && categories && categories.length > 0) {
        const category = categories.find((cat) => cat.id === parseInt(subId));
        if (category) {
          setSubTitle(category.title);
        }
      }
      setIsInitialized(true);
    }
  }, [dispatch, subId, categories, location.state]);

  // Debounce price filter
  useEffect(() => {
    const handler = setTimeout(() => {
      setPriceRange(tempPriceRange);
    }, 800);
    return () => clearTimeout(handler);
  }, [tempPriceRange]);

  // Handle product fetching when filters or page change
  useEffect(() => {
    if (subId && isInitialized) {
      const params = {
        page: currentPage,
        min_price: priceRange[0],
        max_price: priceRange[1],
        price_min: priceRange[0], // Alias for backend consistency
        price_max: priceRange[1], // Alias for backend consistency
        is_available: isAvailable ? 1 : 0,
        attributes: selectedAttributes,
      };

      dispatch(fetchProduct({ id_type: subId, params }));
    }
  }, [dispatch, subId, currentPage, priceRange, selectedAttributes, isAvailable, isInitialized]);



  // No changes needed to the helper, but we might want to use backend's max price
  const maxPrice = 5000; // Default or from API if possible

  // Logique de filtrage et tri (en local pour garantir le prix)
  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filtrage par prix explicitement en local
    result = result.filter(p => {
      const pPrice = parseFloat(p.price) || 0;
      return pPrice >= priceRange[0] && pPrice <= priceRange[1];
    });

    if (sortBy === 'price-asc') result.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
    if (sortBy === 'price-desc') result.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));

    return result;
  }, [allProducts, sortBy, priceRange]);

  const totalPages = product.data?.last_page || product.last_page || Math.ceil((product.data?.total || product.total || filteredProducts.length) / itemsPerPage);

  // If server-side paginated, allProducts is already the current page
  const isServerPaginated = !!(product.last_page || product.data?.last_page);
  const currentProducts = isServerPaginated ? filteredProducts : filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAttributeChange = (attrId, value) => {
    setSelectedAttributes(prev => {
      const currentValues = prev[attrId] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];

      const newState = { ...prev, [attrId]: newValues };
      if (newValues.length === 0) delete newState[attrId];
      return newState;
    });
    setCurrentPage(1);
  };

  const toggleExpandValues = (attrId) => {
    setExpandedValues(prev => ({
      ...prev,
      [attrId]: !prev[attrId]
    }));
  };

  const handlePageClick = (page) => setCurrentPage(page);
  const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  const handleDetails = (id, subId) => {
    navigate(`/product/${id}`, { state: { subId } });
  };

  const addToCartHandler = (product) => {
    const quantity = 1;
    const price = parseFloat(product.price) || 0;
    const finalPrice = price.toFixed(3);
    const total = (finalPrice * quantity).toFixed(3);
    const cart = Cookies.get("cart") ? JSON.parse(Cookies.get("cart")) : [];

    const newItem = {
      id: product.id,
      name: product.name,
      Initialprice: price.toFixed(3),
      price: finalPrice,
      total,
      quantity,
      category_id: product.category_id || subId,
      isElectronic: isElectronic
    };

    const existingItemIndex = cart.findIndex((el) => el.id === newItem.id);
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += newItem.quantity;
      cart[existingItemIndex].total = (
        parseFloat(cart[existingItemIndex].total) + parseFloat(newItem.total)
      ).toFixed(3);
    } else {
      cart.push(newItem);
    }
    Cookies.set("cart", JSON.stringify(cart), { expires: 7 });
  };

  // Local state for manual inputs to prevent auto-refresh while typing
  const [manualPrices, setManualPrices] = useState([0, 5000]);

  // Sync manual inputs when tempPriceRange changes (e.g. via slider or reset)
  useEffect(() => {
    setManualPrices(tempPriceRange);
  }, [tempPriceRange]);

  const renderFilterContent = () => {
    // Calculer le nombre de filtres actifs
    const activeFiltersCount = Object.keys(selectedAttributes).reduce((count, attrId) => {
      return count + (selectedAttributes[attrId]?.length || 0);
    }, 0);

    return (
      <>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom d-lg-none">
          <div className="d-flex align-items-center gap-2">
            <h3 className="text-lg font-bold text-gray-800 mb-0">Filtrer</h3>
            {activeFiltersCount > 0 && (
              <Badge bg="primary" className="rounded-pill">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <Button variant="link" className="p-0 text-gray-400 d-lg-none" onClick={() => setShowMobileFilters(false)}>
            <FaTimes />
          </Button>
        </div>

        {/* Prix */}
        <div className="mb-6">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="text-sm font-bold text-gray-800">Gamme de prix</label>
            <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded-lg">
              {tempPriceRange[0]} - {tempPriceRange[1]} DT
            </span>
          </div>
          <div className="d-flex gap-2 align-items-center mb-3">
            <input
              type="number"
              className="form-control form-control-sm rounded-lg text-xs"
              placeholder="Min"
              min="0"
              max={manualPrices[1]}
              value={manualPrices[0]}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = parseInt(e.target.value) || 0;
                  if (val <= manualPrices[1]) {
                    setTempPriceRange([val, manualPrices[1]]);
                  }
                }
              }}
              onBlur={(e) => {
                const val = parseInt(e.target.value) || 0;
                if (val <= manualPrices[1]) {
                  setTempPriceRange([val, manualPrices[1]]);
                } else {
                  setManualPrices([tempPriceRange[0], manualPrices[1]]);
                }
              }}
              onChange={(e) => {
                setManualPrices([parseInt(e.target.value) || 0, manualPrices[1]])
              }}
              style={{ padding: '8px' }}
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              className="form-control form-control-sm rounded-lg text-xs"
              placeholder="Max"
              min={manualPrices[0]}
              max="5000"
              value={manualPrices[1]}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = parseInt(e.target.value) || 0;
                  if (val >= manualPrices[0]) {
                    setTempPriceRange([manualPrices[0], val]);
                  }
                }
              }}
              onBlur={(e) => {
                const val = parseInt(e.target.value) || 0;
                if (val >= manualPrices[0]) {
                  setTempPriceRange([manualPrices[0], val]);
                } else {
                  setManualPrices([manualPrices[0], tempPriceRange[1]]);
                }
              }}
              onChange={(e) => {
                setManualPrices([manualPrices[0], parseInt(e.target.value) || 0])
              }}
              style={{ padding: '8px' }}
            />
          </div>
          <input
            type="range"
            className="form-range"
            min="0"
            max="5000"
            step="10"
            value={tempPriceRange[1]}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (val >= tempPriceRange[0]) {
                setTempPriceRange([tempPriceRange[0], val]);
              }
            }}
          />
        </div>
        {/* Catégories */}
        <div className="mb-6">
          <label className="text-sm font-bold text-gray-800 mb-2 d-block">Catégorie</label>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-gray-100 text-gray-700 border border-gray-200 px-3 py-2 rounded-lg text-xs font-bold">
              {subTitle}
            </span>
          </div>
        </div>

        {/* Attributs dynamiques - Style Chips avec formatage amélioré */}
        {
          availableAttributes.slice(0, showAllAttributes ? undefined : 4).map(attr => {
            const sortedValues = [...(attr.possible_values || [])].sort((a, b) => {
              const numA = parseFloat(a);
              const numB = parseFloat(b);
              if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
              return String(a).localeCompare(String(b));
            });

            const formatValue = (val) => {
              const unit = attr.unit || '';
              if (unit && !String(val).includes(unit)) return `${val} ${unit}`;
              return val;
            };

            const isExpanded = expandedValues[attr.id];
            const visibleValues = isExpanded ? sortedValues : sortedValues.slice(0, 6);

            return (
              <div key={attr.id} className="mb-6 animate-fade-in">
                <label className="text-base font-bold text-gray-800 mb-3 d-block">
                  {attr.attribute_name || attr.title || attr.name}
                </label>
                <div className="d-flex flex-wrap gap-2">
                  {visibleValues.map(val => {
                    const isSelected = (selectedAttributes[attr.id] || []).includes(val);
                    return (
                      <button
                        key={val}
                        onClick={() => handleAttributeChange(attr.id, val)}
                        className={`btn btn-sm text-sm font-medium rounded-xl px-3 py-2 transition-all
                      ${isSelected
                            ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                            : 'bg-gray-50 text-gray-700 border-0 hover:bg-gray-100'
                          }`}
                        style={{ borderRadius: '12px' }}
                      >
                        {formatValue(val)}
                      </button>
                    );
                  })}
                  {!isExpanded && sortedValues.length > 6 && (
                    <button
                      onClick={() => toggleExpandValues(attr.id)}
                      className="btn btn-sm text-xs font-bold text-blue-600 border-0 bg-transparent p-2 hover:underline"
                    >
                      + {sortedValues.length - 6} de plus
                    </button>
                  )}
                  {isExpanded && sortedValues.length > 6 && (
                    <button
                      onClick={() => toggleExpandValues(attr.id)}
                      className="btn btn-sm text-xs font-bold text-blue-600 border-0 bg-transparent p-2 hover:underline"
                    >
                      Réduire
                    </button>
                  )}
                </div>
              </div>
            );
          })
        }

        {availableAttributes.length > 4 && (
          <Button
            variant="link"
            className="w-100 mb-4 text-blue-700 font-black tracking-wider uppercase text-[10px] decoration-none hover:bg-gray-50 py-2 rounded-xl"
            onClick={() => setShowAllAttributes(!showAllAttributes)}
          >
            {showAllAttributes ? "Afficher moins d'options" : `Voir ${availableAttributes.length - 4} autres filtres`}
          </Button>
        )}

        {/* Disponibilité - Style Toggle Switch */}
        <div className="mb-6 d-flex justify-content-between align-items-center">
          <label className="text-sm font-bold text-gray-800">Disponibles uniquement</label>
          <div className="form-check form-switch custom-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              style={{ width: '40px', height: '20px', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div className="d-flex gap-3 mt-8">
          <Button
            variant="light"
            onClick={() => {
              setPriceRange([0, 5000]);
              setTempPriceRange([0, 5000]);
              setSelectedAttributes({});
              setIsAvailable(true);
            }}
            className="flex-fill rounded-xl font-bold py-3 text-gray-700 bg-gray-100 border-0 hover:bg-gray-200 d-lg-none"
          >
            Réinitialiser
          </Button>
          <Button
            className="flex-fill rounded-xl font-bold py-3 bg-blue-900 border-0 shadow-lg text-white hover:brightness-110 d-lg-none"
            onClick={() => setShowMobileFilters(false)}
          >
            Appliquer
          </Button>
        </div>

        {/* Desktop Reset Button */}
        <Button
          variant="link"
          onClick={() => {
            setPriceRange([0, 5000]);
            setTempPriceRange([0, 5000]);
            setSelectedAttributes({});
            setIsAvailable(true);
          }}
          className="w-100 mt-4 text-blue-600 font-bold decoration-none text-sm d-none d-lg-block"
        >
          Réinitialiser tous les filtres
        </Button>
      </>
    );
  };

  if (error) return (
    <Container className="py-12 text-center">
      <div className="alert alert-danger shadow-sm rounded-2xl">
        Erreur : {typeof error === 'object' ? (error.message || error.error || JSON.stringify(error)) : error}
      </div>
    </Container>
  );

  if (!subId) return (
    <Container className="py-12 text-center">
      <p className="text-gray-500 font-medium">Aucune catégorie sélectionnée</p>
    </Container>
  );

  if (loading) return (
    <Container className="d-flex justify-content-center align-items-center min-vh-100">
      <div className="spinner-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    </Container>
  );

  return (
    <Container fluid className="py-4 bg-gray-50 min-vh-100">
      {/* Breadcrumbs Top */}
      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumb className="mb-4 custom-breadcrumb">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Accueil</Breadcrumb.Item>
          {parentCategory && (
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/categories?categoryId=${parentCategory.id}` }}>
              {parentCategory.title}
            </Breadcrumb.Item>
          )}
          <Breadcrumb.Item active>{subTitle}</Breadcrumb.Item>
        </Breadcrumb>

        <div className="mb-6 d-none d-lg-block">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="text-2xl font-black text-gray-800 mb-0">{subTitle}</h1>
            <div className="d-flex align-items-center gap-3">
              <span className="text-gray-500 text-sm">Trier par:</span>
              <select
                className="form-select border-0 shadow-sm rounded-lg text-sm font-medium"
                style={{ width: '180px' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Pertinence</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>
        </div>

        <div className="d-lg-none mb-3">
          <h1 className="text-xl font-black text-gray-800 mb-0">{subTitle}</h1>
        </div>

        <Row>
          {/* Sidebar FILTRES Desktop */}
          <Col lg={3} className="d-none d-lg-block">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky-top" style={{ top: '100px', zIndex: 10 }}>
              <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                <h3 className="text-lg font-bold text-gray-800 mb-0">Filtrer</h3>
                {Object.keys(selectedAttributes).reduce((count, attrId) => count + (selectedAttributes[attrId]?.length || 0), 0) > 0 && (
                  <Badge bg="primary" className="rounded-pill">
                    {Object.keys(selectedAttributes).reduce((count, attrId) => count + (selectedAttributes[attrId]?.length || 0), 0)}
                  </Badge>
                )}
              </div>
              {renderFilterContent()}
            </div>
          </Col>

          {/* Offcanvas FILTRES Mobile */}
          <Offcanvas
            show={showMobileFilters}
            onHide={() => setShowMobileFilters(false)}
            placement="start"
            className="mobile-filter-offcanvas"
            style={{ width: '85%', maxWidth: '320px' }}
          >
            <Offcanvas.Body className="p-4">
              {renderFilterContent()}
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Grid Content */}
          <Col lg={9}>
            {/* Mobile Tool Bar - Only Visible on Small screens */}
            <div className="d-lg-none mb-4 d-flex gap-2 sticky-top bg-gray-50/80 backdrop-blur-md py-2 px-1" style={{ top: '60px', zIndex: 50 }}>
              <Button
                variant="white"
                className="flex-fill shadow-sm border rounded-xl py-2.5 d-flex align-items-center justify-content-center gap-2 text-sm font-bold text-gray-700 bg-white position-relative"
                onClick={() => setShowMobileFilters(true)}
              >
                <FaFilter className="text-blue-600" /> FILTRER
                {Object.keys(selectedAttributes).reduce((count, attrId) => count + (selectedAttributes[attrId]?.length || 0), 0) > 0 && (
                  <Badge
                    bg="danger"
                    className="position-absolute rounded-circle"
                    style={{ top: '-5px', right: '-5px', fontSize: '0.65rem', minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {Object.keys(selectedAttributes).reduce((count, attrId) => count + (selectedAttributes[attrId]?.length || 0), 0)}
                  </Badge>
                )}
              </Button>
              <div className="flex-fill bg-white shadow-sm border rounded-xl px-2">
                <select
                  className="form-select border-0 text-sm font-bold h-100 bg-transparent text-gray-700"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">PERTINENCE</option>
                  <option value="price-asc">PRIX ↑</option>
                  <option value="price-desc">PRIX ↓</option>
                </select>
              </div>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-gray-800">Aucun produit trouvé</h3>
                <p className="text-gray-500">Essayez de modifier vos filtres pour voir plus de résultats.</p>
                <Button variant="link" onClick={() => { setPriceRange([0, 5000]); setSelectedAttributes({}); setIsAvailable(true); }} className="text-blue-600 font-bold decoration-none">
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <>
                <Row xs={2} sm={2} md={3} lg={3} xl={4} className="g-3 g-md-4 mb-4">
                  {currentProducts.map((p) => (
                    <Col key={p.id}>
                      <Card
                        className="h-100 shadow-sm border-0 product-card-premium overflow-hidden"
                        onClick={() => handleDetails(p.id, subId)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="position-relative bg-white p-3">
                          <Card.Img
                            variant="top"
                            src={getProductImageUrl(p)}
                            alt={p.name}
                            style={{ height: '180px', objectFit: 'contain' }}
                            onError={handleImageError}
                            className="transition-all duration-500 hover:scale-110"
                            loading="lazy"
                          />

                          {/* Wishlist floating */}
                          <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 10 }}>
                            <div
                              className="bg-white/90 backdrop-blur-md shadow-sm rounded-full p-1 border border-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <WishlistButton productId={p.id} size="small" />
                            </div>
                          </div>

                          {/* Action Panier Rapide */}
                          <div className="position-absolute bottom-0 end-0 m-2" style={{ zIndex: 10 }}>
                            <Button
                              onClick={(e) => { e.stopPropagation(); addToCartHandler(p); }}
                              className="cart-btn-floating shadow-lg"
                            >
                              <i className="fa fa-plus text-white"></i>
                            </Button>
                          </div>
                        </div>

                        <Card.Body className="d-flex flex-column p-3 bg-white">
                          <Card.Title className="text-sm font-bold text-gray-800 mb-2 leading-snug line-clamp-2" title={p.name} style={{ height: '40px' }}>
                            {p.name}
                          </Card.Title>

                          <div className="mt-auto">
                            <div className="mb-3">
                              <span className="text-xs text-gray-500 font-medium block">Prix</span>
                              <span className="text-lg font-black text-red-600">{(parseFloat(p.price) || 0).toFixed(3)} DT</span>
                            </div>

                            <Button
                              onClick={(e) => { e.stopPropagation(); handleDetails(p.id, subId); }}
                              className="w-100 py-2 border-0 rounded-xl font-bold transition-all duration-300 shadow-sm hover:brightness-110"
                              style={{
                                fontSize: '0.75rem',
                                background: isElectronic ? 'linear-gradient(90deg, #4F46E5, #6366F1)' : '#4F46E5',
                                color: 'white'
                              }}
                            >
                              Voir détails
                            </Button>

                            {isElectronic && parseFloat(p.price) > 300 && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="mt-2 w-100 py-1.5 font-bold transition-all duration-300 hover:bg-blue-50 border-2"
                                onClick={(e) => { e.stopPropagation(); navigate('/credit/simulation', { state: { product: p } }); }}
                                style={{ fontSize: '0.65rem', borderRadius: '10px', color: '#4F46E5', borderColor: '#4F46E5' }}
                              >
                                💰 SIMULER CRÉDIT
                              </Button>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>

                {totalPages > 1 && (
                  <div className="d-flex justify-content-center py-4">
                    <Pagination className="custom-pagination">
                      <Pagination.Prev onClick={handlePreviousPage} disabled={currentPage === 1} />
                      {[...Array(totalPages).keys()].map(page => (
                        <Pagination.Item
                          key={page}
                          active={currentPage === page + 1}
                          onClick={() => handlePageClick(page + 1)}
                        >
                          {page + 1}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next onClick={handleNextPage} disabled={currentPage === totalPages} />
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </div>

      <style jsx>{`
        .bg-gray-50 { background-color: #f9fafb; }
        .product-card-premium {
          border-radius: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .product-card-premium:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        .cart-btn-floating {
          width: 35px;
          height: 35px;
          border-radius: 10px;
          background: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          transition: all 0.2s;
        }
        .cart-btn-floating:hover { transform: scale(1.1); background: #059669; }
        .custom-checkbox .form-check-input {
          border-radius: 4px;
          border-color: #d1d5db;
        }
        .custom-checkbox .form-check-input:checked {
          background-color: #4F46E5;
          border-color: #4F46E5;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-pagination .page-link {
          border-radius: 8px;
          margin: 0 4px;
          border: none;
          font-weight: bold;
          color: #4b5563;
        }
        .custom-pagination .page-item.active .page-link {
          background-color: #4f46e5;
          color: white;
        }
        .custom-breadcrumb .breadcrumb-item a {
          color: #6366f1;
          text-decoration: none;
          font-weight: 600;
        }
        .custom-breadcrumb .breadcrumb-item.active { color: #9ca3af; }
        .mb-6 { margin-bottom: 1.5rem; }
        .bg-white\/90 { background-color: rgba(255, 255, 255, 0.9); }
        .bg-blue-900 { background-color: #1e3a8a; }
        .text-blue-900 { color: #1e3a8a; }
        .border-blue-900 { border-color: #1e3a8a; }
        .custom-switch .form-check-input:checked {
          background-color: #1e3a8a;
          border-color: #1e3a8a;
        }
      `}</style>
    </Container>
  );
};

export default ProductsBySubCategory;


