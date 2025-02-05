import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Depense from './Depense.jsx';

const DepenseDetails = () => {
  const [depenseDeal, setDepenseDeal] = useState([]); // Initially an empty array
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [dealValues, setDealValues] = useState({}); // Store deal-specific values
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user")); // Parse user if it's a stringified JSON
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("Vous devez être connecté pour voir vos deals.");
      navigate("/login"); // Redirect to login page if not authenticated
      return;
    }

    const fetchDepenseDeal = async () => {
      try {
        const response = await axios.get(
          "https://tn360-122923924979.europe-west1.run.app/api/v1/dealDepense"
        );
        setDepenseDeal(response.data); // Assuming the response contains an array of depenses
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des deal depenses.");
        setLoading(false);
      }
    };

    fetchDepenseDeal();
  }, [token, navigate]);

  if (loading) return <div>Loading...</div>; // Show loading state
  if (error) return <div>{error}</div>; // Show error state

  // Handling setting objectif, gain, and percent dynamically for each deal
  const handleSetValues = (dealDepense) => {
    // Only update if the client matches
    if (dealDepense.ID_client === user.ID_client) {
      const values = {};
      if (dealDepense.compteur_objectif === dealDepense.objectif_1) {
        values.objectif = "1";
        values.percent = 25;
        values.gain = dealDepense.gain_objectif_1;
      } else if (dealDepense.compteur_objectif === dealDepense.objectif_2) {
        values.objectif = "2";
        values.percent = 50;
        values.gain = dealDepense.gain_objectif_2;
      } else if (dealDepense.compteur_objectif === dealDepense.objectif_3) {
        values.objectif = "3";
        values.percent = 100;
        values.gain =dealDepense.gain_objectif_3;
      }
      
      // Update state with values for this specific deal (by ID_deal_offre)
      setDealValues(prevValues => ({
        ...prevValues,
        [dealDepense.ID_deal_offre]: values
      }));
    }
  };

  return (
    <div>
      {depenseDeal?.map((deal) => {
        // Call handleSetValues for each deal and update the state dynamically
        handleSetValues(deal);

        // Retrieve the dynamically set values for this deal
        const values = dealValues[deal.ID_deal_offre] || {};

        return (
          <div key={deal.ID_deal_offre}>
            {/* Render the Depense component with the current values */}
            <Depense 
              objectif={values.objectif} 
              gain={values.gain} 
              percent={values.percent} 
            />
          </div>
        );
      })}
    </div>
  );
};

export default DepenseDetails;
