import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
      {/* Section principale */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* À propos */}
          <div>
            <h3 className="text-2xl font-bold mb-6 relative inline-block">
              À propos
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="flex items-center text-blue-100 hover:text-white hover:translate-x-2 transition-all duration-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                  Qui sommes-nous
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-blue-100 hover:text-white hover:translate-x-2 transition-all duration-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                  Loyalty Deal
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-blue-100 hover:text-white hover:translate-x-2 transition-all duration-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                  Conditions générales de vente
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-blue-100 hover:text-white hover:translate-x-2 transition-all duration-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                  Contactez-nous
                </a>
              </li>
            </ul>
          </div>

          {/* Service client & Livraison */}
          <div>
            <h3 className="text-2xl font-bold mb-6 relative inline-block">
              Service client & Livraison
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="flex items-center text-blue-100 hover:text-white hover:translate-x-2 transition-all duration-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                  Service client
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-blue-100 hover:text-white hover:translate-x-2 transition-all duration-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                  Livraison
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center text-blue-100 hover:text-white hover:translate-x-2 transition-all duration-200">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                  Politique d'échange
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-2xl font-bold mb-6 relative inline-block">
              Contactez-nous
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start text-blue-100">
                <svg className="w-5 h-5 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                <div>
                  <p className="font-semibold text-white">Appelez-nous</p>
                  <a href="tel:22578815" className="hover:text-yellow-300 transition-colors">22 578 815</a>
                </div>
              </li>
              <li className="flex items-start text-blue-100">
                <svg className="w-5 h-5 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <div>
                  <p className="text-sm leading-relaxed">
                    Rue du lac leman, immeuble MakCrown<br />
                    1er étage, Les berges du lac<br />
                    Tunis 1053
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Suivez-nous */}
          <div>
            <h3 className="text-2xl font-bold mb-6 relative inline-block">
              Suivez-nous
              <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-gradient-to-r from-yellow-400 to-orange-500"></span>
            </h3>
            
            <div className="flex space-x-4 mb-6">
              <a href="#" className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-200 transform hover:-translate-y-1 hover:scale-110">
                <i className="fa-brands fa-facebook text-xl"></i>
              </a>
              <a href="#" className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-200 transform hover:-translate-y-1 hover:scale-110">
                <i className="fa-brands fa-instagram text-xl"></i>
              </a>
              <a href="#" className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-200 transform hover:-translate-y-1 hover:scale-110">
                <i className="fa-brands fa-youtube text-xl"></i>
              </a>
              <a href="#" className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all duration-200 transform hover:-translate-y-1 hover:scale-110">
                <i className="fa-brands fa-linkedin-in text-xl"></i>
              </a>
            </div>

            <div className="mt-6">
              <p className="text-sm text-blue-100 mb-3">Inscrivez-vous à notre newsletter</p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Votre email"
                  className="flex-1 px-4 py-2 rounded-l-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 backdrop-blur-sm"
                />
                <button className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 rounded-r-lg font-semibold text-gray-900 transition-all duration-200 transform hover:scale-105">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      
      </div>

      {/* Barre de copyright */}
      <div className="bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                TN360
              </span>
              <span className="text-sm text-blue-100">
                © 2024 Tous droits réservés
              </span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-blue-100">
              <a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a>
              <span className="text-blue-300">•</span>
              <a href="#" className="hover:text-white transition-colors">Mentions légales</a>
              <span className="text-blue-300">•</span>
              <a href="#" className="hover:text-white transition-colors">CGU</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;