import React from 'react';

const Footer = () => {
  return (
    <div>
      <div className=" bg-blue-360 pt-4">
        <div className="w-full">
          <div className="flex flex-col  justify-around  px-6 sm:px-1 md:flex-row md:px-10">
            {/* A propos Section */}
            <div className="md:w-[316px] mb-8 md:mb-0">
              <div className="text-xl sm:text-base lg:text-lg font-normal text-white flex flex-col">
                <h1 className="text-white font-extrabold font-limon-milk line-clamp-1 mb-3">
                  A propos
                </h1>
                <div><hr className="text-white w-1/4 mb-2" /></div>
                <div><hr className="text-white w-1/2" /></div>
              </div>
              <div className="mt-[18px] sm:text-base lg:text-lg   font-normal text-white grid gap-3 sm:gap-1">
                <a href="#">Qui sommes-nous</a>
                <a href="#">Loyality deal</a>
                <a href="#">Conditions génerales de vente</a>
                <a href="#">Contactez-nous</a>
              </div>
            </div>

            {/* Service client & Livraison Section */}
            <div className="md:w-[316px] mb-8 md:mb-0">
              <p className="text-xl sm:text-base lg:text-lg font-normal text-white flex flex-col">
                <h1 className="text-white font-extrabold font-limon-milk mb-3">
                  Service client & Livraison
                </h1>
                <div><hr className="text-white w-1/4 mb-2" /></div>
                <div><hr className="text-white w-1/2" /></div>
              </p>
              <div className="mt-[18px]  sm:text-base lg:text-lg font-normal text-white grid gap-3 sm:gap-1">
                <a href="#">Service client</a>
                <a href="#">Livraison</a>
                <a href="#">Politique d'echange</a>
              </div>
            </div>

            {/* Contactez-nous Section */}
            <div className="md:w-[316px] mb-8 md:mb-0">
              <p className="text-xl sm:text-base lg:text-lg font-normal text-white flex flex-col">
                <h1 className="text-white font-extrabold font-limon-milk line-clamp-1 mb-3">
                  Contactez-nous
                </h1>
                <div><hr className="text-white w-1/4 mb-2" /></div>
                <div><hr className="text-white w-1/2" /></div>
              </p>
              <div className="mt-[18px] sm:text-base lg:text-lg font-normal text-white grid gap-3 sm:gap-1">
                <a href="#">Appelez nous</a>
                <a href="#">22 578 815</a>
                <a href="#">Rue du lac leman, immeuble MakCrown, 1 étage les berges du lac, tunis 1053</a>
              </div>
            </div>

            {/* Suivez-nous Section */}
            <div className="md:w-[316px] mb-8 md:mb-0">
              <p className="text-xl font-medium text-white flex flex-col">
                <h1 className="text-white font-extrabold font-limon-milk line-clamp-1 mb-3">
                  Suivez-nous
                </h1>
                <div><hr className="text-white w-1/4 mb-2" /></div>
                <div><hr className="text-white w-1/2" /></div>
              </p>
              <div className="mt-[18px] text-xl sm:text-base font-normal text-white flex flex-row gap-8 sm:gap-1">
                <i className="fa-brands fa-facebook"></i>
                <i className="fa-brands fa-instagram"></i>
                <i className="fa-brands fa-youtube"></i>
              </div>
            </div>
          </div>

          {/* Footer Bottom Section */}
          <hr className=" text-white" />
          <div className="flex items-center justify-center py-1 bg-orange-360">
            <p className="text-xl sm:text-base font-limon-milk  text-white  md:text-xl lg:text-lg">
              360 TN 2022 <i className="fa-regular fa-copyright"></i> Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
