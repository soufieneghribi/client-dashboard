import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPopular } from '../store/slices/Popular';


const Popular = () => {
  const { popular= [], loading, error } = useSelector(state => state.popular);
  const products=popular.products
  const dispatch = useDispatch();
  console.log(products)
  const [idproduct , setIdproduct] =useState("")
  const [type, setType] =useState("")
  const navigate = useNavigate();
  console.log(idproduct)

  useEffect(() => {
    dispatch(fetchPopular());
   
  }, [dispatch  ]);
   const productHandler =(id , type_id)=>{
    navigate(`/product/${id}`,{state : {subId : type_id}}); 
    
  }  

  // const handleAddToCart = (product) => {
  //   dispatch(addToCart(product));
  // };

  if (loading) return <p>Loading recommended products...</p>;
  if (error) return <p>Failed to load recommended products. Please try again.</p>;

  return (
    <div>
       <h1 className="m-10 text-blue-360 font-bold text-3xl mb-8">Populaire</h1>
       <div className="grid grid-cols-4 md:grid-cols-4 gap-8 mb-8 m-8">
        {products?.map((product ,index) => {
            return (
              <div className='grid grid-cols-1 border rounded-xl p-4 shadow hover:shadow-lg transition'>
            <div
              key={product.id}
              
            >
            
              <img key={index} src={product.img} className='w-auto h-auto '></img>
              <h1 className="text-lg font-semibold">{product.name}</h1>
              <h2> Avec remise</h2>
              </div>
              <div className='flex flex-row m-2 justify-around'>
               <div  className="text-orange-360 grid"> 
                <i class="fa-regular fa-money-bill-1"></i>
                <p className=" top-1/2 -my-1 font-medium text-lg"><del>{product.price}</del></p>
                </div>
              
              <div className='text-green-600 grid'>
               <i class="fa-solid fa-tags text-green-600"></i>
               <span className='top-1/2 -my-1 font-bold text-xl'>10%</span>
               </div>
                <div  className="text-orange-360 grid"> 
                <i class="fa-regular fa-money-bill-1"></i> 
                <p className=" top-1/2 -my-1 font-bold text-lg">{(product.price*0.9).toFixed(2)} dt</p>
                </div>
              </div>
              <div className=" bg-blue-360 text-white text-center px-2 py-2 rounded hover:bg-blue-700 w-1/2 ">
              <button onClick={()=>productHandler(product.id , product.type_id)}>
              Voir détails
            </button>
              </div>
             
            </div>
          )})}
       
      </div>
    </div>
  );
};

export default Popular;
