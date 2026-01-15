import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchProduct } from '../store/slices/product';

import Cookies from "js-cookie";
import { Container, Row, Col, Card, Button, Breadcrumb, Badge, Pagination, Offcanvas } from 'react-bootstrap';
import { getImageUrl, handleImageError } from '../utils/imageHelper';
import WishlistButton from '../components/WishlistButton';
import { FaFilter, FaTimes } from 'react-icons/fa';

const ProductsBySubCategory = () => {
  const location = useLocation();
  const { product = {}, loading, error } = useSelector((state) => state.product);
  const { categories = [] } = useSelector((state) => state.categorie);
  const allProducts = product.products || [];
  const dispatch = useDispatch();

  const subId = location.state?.subId;
  const [subTitle, setSubTitle] = useState(location.state?.subTitle || "Produits");

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const itemsPerPage = 12;

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
      dispatch(fetchProduct(subId));

      if (!location.state?.subTitle && categories && categories.length > 0) {
        const category = categories.find((cat) => cat.id === parseInt(subId));
        if (category) {
          setSubTitle(category.title);
        }
      }
    }
  }, [dispatch, subId, categories, location.state]);



  // State pour les filtres
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSpecs, setSelectedSpecs] = useState({}); // { RAM: ['8GB'], Stockage: [] }
  const [sortBy, setSortBy] = useState('relevance');

  // Définir les types de spécifications par thématique de catégorie
  const specMapping = useMemo(() => {
    const title = subTitle.toLowerCase();
    if (title.includes('téléphone') || title.includes('smartphone') || title.includes('pc') || title.includes('ordinateur') || title.includes('portable')) {
      return ['RAM', 'Stockage', 'Processeur', 'Réseau'];
    }
    if (title.includes('tv') || title.includes('téléviseur')) {
      return ['Taille', 'Résolution', 'Type Ecran'];
    }
    if (title.includes('climatiseur') || title.includes('climatisation')) {
      return ['Puissance', 'Type'];
    }
    if (title.includes('machine à laver') || title.includes('lave-linge') || title.includes('réfrigérateur')) {
      return ['Capacité', 'Classe Energétique'];
    }
    if (title.includes('alimentaire') || title.includes('poids') || title.includes('épicerie') || title.includes('lessive')) {
      return ['Poids', 'Volume'];
    }
    return []; // Pas de specs spécifiques pour les autres
  }, [subTitle]);

  // Extraire les marques et les valeurs de spécifications uniques
  const { brands, maxPrice, availableSpecs } = useMemo(() => {
    if (!allProducts.length) return { brands: [], maxPrice: 2000, availableSpecs: {} };

    // Détection des marques améliorée : si p.brand est vide, on prend le premier mot du nom
    const b = [...new Set(allProducts.map(p => {
      if (p.brand && p.brand.trim()) return p.brand.trim();
      return p.name.split(' ')[0]; // ex: "Samsung Galaxy" -> "Samsung"
    }).filter(Boolean))];

    const max = Math.max(...allProducts.map(p => parseFloat(p.price) || 0));

    // Simuler l'extraction de specs depuis le nom ou la description si elles ne sont pas structurées
    // Dans un vrai projet, ces données viendraient d'un champ "attributes" de l'API
    const specs = {};
    specMapping.forEach(spec => {
      const values = new Set();
      allProducts.forEach(p => {
        // Extraction naïve pour la démo (on cherche des motifs comme "8GB", "128GB", "55\"", etc.)
        const content = (p.name + " " + (p.description || "")).toUpperCase();

        if (spec === 'RAM') {
          // Support Go et GB avec détection plus fine
          const ramMatch = content.match(/(\d+)\s?G[BO]\s?RAM/i) || content.match(/RAM\s?:?\s?(\d+)\s?G[BO]/i) || content.match(/\b(4|6|8|12|16|32|64)\s?G[BO]\b/i);
          if (ramMatch) {
            const val = ramMatch[0].toUpperCase().replace('RAM', '').replace(/\s/g, '').replace('GO', 'GB');
            if (parseInt(val) <= 64) values.add(val); // RAM excède rarement 64GB
          }
        }
        else if (spec === 'Stockage') {
          const storageMatch = content.match(/\b(64|128|256|512)\s?G[BO]\b/i) || content.match(/\b(1|2)\s?T[BO]\b/i);
          if (storageMatch) values.add(storageMatch[0].toUpperCase().replace(/\s/g, '').replace('GO', 'GB').replace('TO', 'TB'));
        }
        else if (spec === 'Taille') {
          const match = content.match(/\d+(\.\d+)?\s?(POUCES|["''])/i) || content.match(/\d{2}["'']/) || content.match(/\b(32|40|43|50|55|65|75|85)\b/);
          if (match) {
            let val = match[0].toUpperCase().replace('POUCES', '"').replace(/\s/g, '');
            if (!val.includes('"')) val += '"';
            values.add(val);
          }
        }
        else if (spec === 'Résolution') {
          if (content.includes('4K') || content.includes('UHD')) values.add('4K UHD');
          else if (content.includes('FHD') || content.includes('1080P')) values.add('Full HD');
          else if (content.includes('HD')) values.add('HD Ready');
        }
        else if (spec === 'Type Ecran') {
          if (content.includes('OLED')) values.add('OLED');
          else if (content.includes('QLED')) values.add('QLED');
          else if (content.includes('LED')) values.add('LED');
          if (content.includes('SMART')) values.add('Smart TV');
          if (content.includes('AMOLED')) values.add('AMOLED');
        }
        else if (spec === 'Puissance') {
          const match = content.match(/\d+\s?BTU/i);
          if (match) values.add(match[0]);
        }
        else if (spec === 'Capacité' || spec === 'Poids' || spec === 'Volume') {
          const match = content.match(/\d+(\.\d+)?\s?(KG|G|L|ML)\b/i);
          if (match) values.add(match[0].toUpperCase());
        }
        else if (spec === 'Classe Energétique') {
          const match = content.match(/\b[A-G]\+{0,3}\b/);
          if (match && content.includes('CLASSE')) values.add('Classe ' + match[0]);
        }
        else if (spec === 'Processeur') {
          if (content.includes('CORE I3')) values.add('Core i3');
          if (content.includes('CORE I5')) values.add('Core i5');
          if (content.includes('CORE I7')) values.add('Core i7');
          if (content.includes('RYZEN 3')) values.add('Ryzen 3');
          if (content.includes('RYZEN 5')) values.add('Ryzen 5');
          if (content.includes('RYZEN 7')) values.add('Ryzen 7');
          if (content.includes('SNAPDRAGON')) values.add('Snapdragon');
          if (content.includes('M1') || content.includes('M2') || content.includes('M3')) values.add('Apple Silicon (M)');
          if (content.match(/A(15|16|17|18)/)) values.add('Apple A-Series');
          if (content.includes('HELIO') || content.includes('DIMENSITY')) values.add('MediaTek');
        }
        else if (spec === 'Réseau') {
          if (content.includes('5G')) values.add('5G');
          else if (content.includes('4G') || content.includes('LTE')) values.add('4G / LTE');
        }
      });
      if (values.size > 0) specs[spec] = [...values].sort();
    });

    return { brands: b.sort(), maxPrice: Math.ceil(max), availableSpecs: specs };
  }, [allProducts, specMapping]);

  useEffect(() => {
    setPriceRange([0, maxPrice]);
  }, [maxPrice]);

  // Logique de filtrage et tri
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      const price = parseFloat(p.price) || 0;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      const productBrand = (p.brand && p.brand.trim()) ? p.brand.trim() : p.name.split(' ')[0];
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(productBrand);

      // Filtrage par specs : Normaliser le contenu pour la comparaison (Go -> GB, To -> TB, pas d'espaces)
      const rawContent = (p.name + " " + (p.description || "")).toUpperCase();
      const normalizedContent = rawContent.replace(/\s/g, '').replace(/G[O]/g, 'GB').replace(/T[O]/g, 'TB');

      const matchesSpecs = Object.keys(selectedSpecs).every(specKey => {
        const activeValues = selectedSpecs[specKey];
        if (!activeValues || activeValues.length === 0) return true;
        // Vérifier si au moins une valeur sélectionnée est présente dans le contenu normalisé
        return activeValues.some(val => {
          const normalizedVal = val.toUpperCase().replace(/\s/g, '');
          return normalizedContent.includes(normalizedVal) || rawContent.includes(val.toUpperCase());
        });
      });

      return matchesPrice && matchesBrand && matchesSpecs;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
      if (sortBy === 'price-desc') return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
      return 0;
    });
  }, [allProducts, priceRange, selectedBrands, selectedSpecs, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleBrandChange = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const handleSpecChange = (specKey, value) => {
    setSelectedSpecs(prev => {
      const currentValues = prev[specKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [specKey]: newValues };
    });
    setCurrentPage(1);
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

  const FilterContent = () => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-b lg:d-none">
        <h3 className="text-lg font-bold text-gray-800 mb-0">Filtrer</h3>
        <Button variant="link" className="p-0 text-gray-400 d-lg-none" onClick={() => setShowMobileFilters(false)}>
          <FaTimes />
        </Button>
      </div>

      {/* Prix */}
      <div className="mb-6">
        <label className="text-sm font-bold text-gray-600 mb-3 d-block uppercase tracking-wider">Prix</label>
        <div className="px-2">
          <div className="d-flex justify-content-between text-xs font-bold text-blue-600 mb-2">
            <span>{priceRange[0]} DT</span>
            <span>{priceRange[1]} DT</span>
          </div>
          <input
            type="range"
            className="form-range"
            min="0"
            max={maxPrice}
            step="1"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
          />
        </div>
      </div>

      {/* Catégories */}
      <div className="mb-6">
        <label className="text-sm font-bold text-gray-600 mb-3 d-block uppercase tracking-wider">Catégorie</label>
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
          <div className="form-check custom-checkbox">
            <input className="form-check-input" type="checkbox" checked readOnly />
            <label className="form-check-label text-sm text-gray-700">{subTitle}</label>
          </div>
        </div>
      </div>

      {/* Marques */}
      {brands.length > 0 && (
        <div className="mb-6">
          <label className="text-sm font-bold text-gray-600 mb-3 d-block uppercase tracking-wider">Marque</label>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {brands.map(brand => (
              <div key={brand} className="form-check custom-checkbox">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`mobile-brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onChange={() => handleBrandChange(brand)}
                />
                <label className="form-check-label text-sm text-gray-700" htmlFor={`mobile-brand-${brand}`}>
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres Spécifiques */}
      {Object.keys(availableSpecs).map(specKey => (
        <div key={specKey} className="mb-6">
          <label className="text-sm font-bold text-gray-600 mb-3 d-block uppercase tracking-wider">{specKey}</label>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {availableSpecs[specKey].map(value => (
              <div key={value} className="form-check custom-checkbox">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`mobile-spec-${specKey}-${value}`}
                  checked={(selectedSpecs[specKey] || []).includes(value)}
                  onChange={() => handleSpecChange(specKey, value)}
                />
                <label className="form-check-label text-sm text-gray-700" htmlFor={`mobile-spec-${specKey}-${value}`}>
                  {value}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Disponibilité */}
      <div className="mb-4">
        <label className="text-sm font-bold text-gray-600 mb-3 d-block uppercase tracking-wider">Disponibilité</label>
        <div className="space-y-2">
          <div className="form-check custom-checkbox">
            <input className="form-check-input" type="checkbox" defaultChecked />
            <label className="form-check-label text-sm text-gray-700">En stock</label>
          </div>
          <div className="form-check custom-checkbox">
            <input className="form-check-input" type="checkbox" />
            <label className="form-check-label text-sm text-gray-700">En arrivage</label>
          </div>
        </div>
      </div>

      <Button
        className="w-100 mt-4 rounded-xl font-bold py-2 bg-red-600 border-0 shadow-lg text-white hover:brightness-110 d-lg-none"
        onClick={() => setShowMobileFilters(false)}
      >
        Voir les résultats ({filteredProducts.length})
      </Button>

      <Button
        variant="link"
        onClick={() => { setPriceRange([0, maxPrice]); setSelectedBrands([]); setSelectedSpecs({}); }}
        className="w-100 mt-2 text-blue-600 font-bold decoration-none text-sm"
      >
        Réinitialiser
      </Button>
    </>
  );

  if (error) return (
    <Container className="py-12 text-center">
      <div className="alert alert-danger shadow-sm rounded-2xl">Erreur : {error}</div>
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
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Filtrer</h3>
              <FilterContent />
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
              <FilterContent />
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Grid Content */}
          <Col lg={9}>
            {/* Mobile Tool Bar - Only Visible on Small screens */}
            <div className="d-lg-none mb-4 d-flex gap-2 sticky-top bg-gray-50/80 backdrop-blur-md py-2 px-1" style={{ top: '60px', zIndex: 50 }}>
              <Button
                variant="white"
                className="flex-fill shadow-sm border rounded-xl py-2.5 d-flex align-items-center justify-content-center gap-2 text-sm font-bold text-gray-700 bg-white"
                onClick={() => setShowMobileFilters(true)}
              >
                <FaFilter className="text-blue-600" /> FILTRER
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
                <Button variant="link" onClick={() => { setPriceRange([0, maxPrice]); setSelectedBrands([]); setSelectedSpecs({}); }} className="text-blue-600 font-bold decoration-none">
                  Réinitialiser les filtres
                </Button>
              </div>
            ) : (
              <>
                <Row xs={2} sm={2} md={3} lg={3} xl={4} className="g-3 g-md-4 mb-4">
                  {currentProducts.map((p) => (
                    <Col key={p.id}>
                      <Card className="h-100 shadow-sm border-0 product-card-premium overflow-hidden">
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
                            <div className="bg-white/90 backdrop-blur-md shadow-sm rounded-full p-1 border border-gray-100">
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
                              onClick={() => handleDetails(p.id, subId)}
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
                                onClick={() => navigate('/credit/simulation', { state: { product: p } })}
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
      `}</style>
    </Container>
  );
};

export default ProductsBySubCategory;


