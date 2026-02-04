import MG_LOGO_OFFICIAL from "../assets/images/mg_logo_official.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-800">
      <div className="container mx-auto px-4 py-10">
        {/* Main Sections - Combined & Simplified */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">

          <div className="col-span-2 lg:col-span-1">
            <img src={MG_LOGO_OFFICIAL} alt="MG Logo" className="h-8 mb-4 bg-white rounded p-1" />
            <div className="space-y-2 text-xs text-gray-400">
              <p><i className="fas fa-phone-alt me-2"></i> +216 50963367</p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="hover:text-primary"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="hover:text-primary"><i className="fab fa-instagram"></i></a>
                <a href="#" className="hover:text-primary"><i className="fab fa-twitter"></i></a>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase text-gray-200">Navigation</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="/" className="hover:text-white">Accueil</a></li>
              <li><a href="/products" className="hover:text-white">Produits</a></li>
              <li><a href="/recrutement" className="hover:text-white">Recrutement</a></li>
              <li><a href="/espace-presse" className="hover:text-white">Presse</a></li>
            </ul>
          </div>

          {/* Bien Manger & Être */}
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase text-gray-200">Univers MG</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#" className="hover:text-white">Bien Manger</a></li>
              <li><a href="#" className="hover:text-white">Bien Être</a></li>
              <li><a href="#" className="hover:text-white">Bien Chez Soi</a></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase text-gray-200">Services</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#" className="hover:text-white">Carte Club MG</a></li>
              <li><a href="#" className="hover:text-white">Espace Crédit</a></li>
              <li><a href="#" className="hover:text-white">Application MyMG</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase text-gray-200">Support</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="/contact" className="hover:text-white">Contact</a></li>
              <li><a href="/faq" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Livraison</a></li>
            </ul>
          </div>

          {/* Responsabilité */}
          <div>
            <h4 className="text-sm font-bold mb-4 uppercase text-gray-200">Engagements</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><a href="#" className="hover:text-white">Consommi Watani</a></li>
              <li><a href="#" className="hover:text-white">RSE</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© 2026 MG Tunisie. Tous droits réservés.</p>
          <div className="flex gap-4 items-center">
            <img src="https://mg.tn/themes/mg-tunisie/assets/img/visa.png" alt="Visa" className="h-3 opacity-50" />
            <img src="https://mg.tn/themes/mg-tunisie/assets/img/mastercard.png" alt="Mastercard" className="h-3 opacity-50" />
            <span className="mx-2">|</span>
            <a href="/mentions-legales" className="hover:text-white">Mentions Légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
