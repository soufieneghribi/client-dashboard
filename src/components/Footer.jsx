import React from 'react'

const Footer = () => {
  return (
    <div><div class="mt-8 bg-blue-360 pt-9">
    <div class=" w-full ">
      <div class="flex flex-col justify-around sm:px-[18px] md:flex-row md:px-10">
        <div class="md:w-[316px]">
          <p class="text-2xl font-medium text-white flex flex-col ">
          <h1 class="text-white font-extrabold font-limon-milk line-clamp-1 mb-3">
           A propos</h1>
           <div><hr className='text-white w-1/4 mb-2'></hr></div>
           <div><hr className='text-white w-1/2'></hr></div>
          </p>
          <div class="mt-[18px] text-xl font-normal text-white grid gap-3">
           <a href='#'>Qui sommes-nous</a>
           <a href='#'>Loyality deal</a>
           <a href='#'>Conditions génerales de vente</a>
           <a href='#'>Contactez-nous</a>
          </div>
         
        </div>
        <div class="md:w-[316px]">
          <p class="text-2xl font-medium text-white flex flex-col ">
          <h1 class="text-white font-extrabold font-limon-milk  mb-3">
           Service client & Livraison </h1>
           <div><hr className='text-white w-1/4 mb-2'></hr></div>
           <div><hr className='text-white w-1/2'></hr></div>
          </p>
          <div class="mt-[18px] text-xl font-normal text-white grid gap-3">
           <a href='#'>Service client</a>
           <a href='#'>Livraison</a>
           <a href='#'>Politique d'echange </a>
           
          </div>
          </div>
          <div class="md:w-[316px]">
          <p class="text-2xl font-medium text-white flex flex-col ">
          <h1 class="text-white font-extrabold font-limon-milk line-clamp-1 mb-3">
           Contactez-nous</h1>
           <div><hr className='text-white w-1/4 mb-2'></hr></div>
           <div><hr className='text-white w-1/2'></hr></div>
          </p>
          <div class="mt-[18px] text-xl font-normal text-white grid gap-3">
           <a href='#'>Appelez nous</a>
           <a href='#' >22 578 815</a>
           <a href='#'>Rue du lac leman, immeuble 
                MakCrown, 1 étage les berges 
                du lac, tunis 1053</a>
          </div>
          </div>
          <div class="md:w-[316px]">
          <p class="text-2xl font-medium text-white flex flex-col ">
          <h1 class="text-white font-extrabold font-limon-milk line-clamp-1 mb-3">
           Suivez-nous</h1>
           <div><hr className='text-white w-1/4 mb-2'></hr></div>
           <div><hr className='text-white w-1/2'></hr></div>
          </p>
          <div class="mt-[18px] text-xl font-normal text-white flex flex-row gap-8">
          <i class="fa-brands fa-facebook"></i>
          <i class="fa-brands fa-instagram"></i>
          <i class="fa-brands fa-youtube"></i>
          </div>
          </div>
      </div>
      <hr class="mt-[30px] text-white" />
      <div class="flex items-center justify-center py-5 bg-orange-360">
        <p class="text-3xl font-limon-milk font-normal text-white md:text-2xl">
         360 TN 2022 <i class="fa-regular fa-copyright"></i> Tous doits réservés        </p>
      </div>
    </div>
</div>
  </div>
  )
}

export default Footer