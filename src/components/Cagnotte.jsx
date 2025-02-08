import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { fetchOffre } from '../store/slices/offre';
import { fetchDealDepense } from '../store/slices/deal';
import { fetchDealFrequence } from '../store/slices/frequence';
import { fetchDealMarque } from '../store/slices/dealMarque';
import { fetchAnniversaire } from '../store/slices/anniversaire';
import { fetchUserProfile } from "../store/slices/user";







const Cagnotte = () => {
    const { offre = [] } = useSelector((state) => state.offre);
    const { deal = [] } = useSelector((state) => state.deal);
    const { Userprofile } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchOffre());
        dispatch(fetchUserProfile());
        dispatch(fetchDealDepense())
      }, [dispatch]);
    
      const dealOffre = offre.data || [];

  return (
    <div>
      
      

    </div>
  )
}

export default Cagnotte