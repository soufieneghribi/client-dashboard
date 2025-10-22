import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Section principale */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo et description */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                TN360
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Votre destination shopping préférée. Des produits de qualité, un service exceptionnel.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Produits
                </a>
              </li>
              <li>
                <a href="/categories" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Catégories
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                  À propos
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="/shipping" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Livraison
                </a>
              </li>
              <li>
                <a href="/returns" className="text-gray-300 hover:text-white transition-colors text-sm">
                  Retours
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-300 hover:text-white transition-colors text-sm">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact et réseaux sociaux */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-300 text-sm">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <a href="tel:22578815" className="hover:text-white transition-colors">+216 50963367 </a>
              </div>
              
              <div className="flex space-x-4 mt-4">
                <a href="#" className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-blue-600 rounded-full transition-colors">
                  <i className="fab fa-facebook-f text-sm"></i>
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-pink-600 rounded-full transition-colors">
                  <i className="fab fa-instagram text-sm"></i>
                </a>
                <a href="#" className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-blue-400 rounded-full transition-colors">
                  <i className="fab fa-twitter text-sm"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

       
      </div>

    
    </footer>
  );
}

export default Footer;