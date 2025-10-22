import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile } from "../store/slices/user";
import { fetchClientDeals } from "../store/slices/deals";

const Cagnotte = () => {
  const { Userprofile, loading: userLoading } = useSelector((state) => state.user);
  const { depense, marque, frequence, anniversaire, loading: dealsLoading } = useSelector((state) => state.deals);
  const { isLoggedIn } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [offerHistory, setOfferHistory] = useState([]);
  const [dealHistory, setDealHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchUserProfile());
      if (Userprofile?.ID_client) {
        dispatch(fetchClientDeals(Userprofile.ID_client));
        fetchHistories();
      }
    }
  }, [dispatch, isLoggedIn, Userprofile?.ID_client]);

  const fetchHistories = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Fetch offer history
      const offerResponse = await fetch(
        'https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/customer/offer-history',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (offerResponse.ok) {
        const offerData = await offerResponse.json();
        setOfferHistory(offerData.data || []);
      }

      // Fetch deal history
      const dealResponse = await fetch(
        'https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/customer/deal-history',
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (dealResponse.ok) {
        const dealData = await dealResponse.json();
        setDealHistory(dealData.data || []);
      }
    } catch (error) {
      console.error('Error fetching histories:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const allDeals = [
    ...depense.map(d => ({ ...d, type: 'depense' })),
    ...marque.map(d => ({ ...d, type: 'marque' })),
    ...frequence.map(d => ({ ...d, type: 'frequence' })),
    ...anniversaire.map(d => ({ ...d, type: 'anniversaire' }))
  ];

  const totalEarned = dealHistory.reduce((sum, deal) => 
    sum + (parseFloat(deal.amount_earned_total) || 0), 0
  );

  const totalCagnotteUsed = offerHistory.reduce((sum, offer) => 
    sum + (parseFloat(offer.cagnotte_used) || 0), 0
  );

  if (userLoading || dealsLoading || historyLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{
          textAlign: 'center',
          color: '#667eea'
        }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>⏳</div>
          <div style={{ fontSize: '18px', fontWeight: '600' }}>Chargement...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{fontSize: '80px', marginBottom: '20px'}}>💰</div>
        <h2 style={{color: 'white', fontSize: '32px', marginBottom: '15px'}}>
          Connectez-vous pour voir votre cagnotte
        </h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#F7FAFC', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '30px', color: '#2D3748' }}>
        Ma Cagnotte
      </h1>

      {/* Cagnotte Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '30px',
        color: 'white',
        marginBottom: '30px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '16px', opacity: 0.9, marginBottom: '10px' }}>
          Solde disponible
        </div>
        <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>
          {Userprofile?.cagnotte_balance || 0} DT
        </div>
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          Total gagné: {totalEarned.toFixed(2)} DT
        </div>
      </div>

      {/* Statistics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>
            Deals Actifs
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2D3748' }}>
            {allDeals.length}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>
            Cagnotte Utilisée
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2D3748' }}>
            {totalCagnotteUsed.toFixed(2)} DT
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>
            Transactions
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2D3748' }}>
            {offerHistory.length + dealHistory.length}
          </div>
        </div>
      </div>

      {/* Offer History */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', color: '#2D3748' }}>
          Historique des Offres
        </h2>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          {offerHistory.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontSize: '14px' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontSize: '14px' }}>Montant Utilisé</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontSize: '14px' }}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {offerHistory.map((offer, index) => (
                    <tr key={offer.id || index} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#2D3748' }}>
                        {new Date(offer.date_debut || offer.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '14px', color: '#2D3748' }}>
                        {offer.cagnotte_used} DT
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          backgroundColor: '#D4EDDA',
                          color: '#155724',
                          fontWeight: '600'
                        }}>
                          Complété
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
              Aucun historique d'offres
            </div>
          )}
        </div>
      </div>

      {/* Deal History */}
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', color: '#2D3748' }}>
          Historique des Deals
        </h2>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
        }}>
          {dealHistory.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontSize: '14px' }}>ID</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontSize: '14px' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontSize: '14px' }}>Montant Gagné</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#718096', fontSize: '14px' }}>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {dealHistory.map((deal, index) => (
                    <tr key={deal.ID_deal_historique || index} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#2D3748' }}>
                        #{deal.ID_deal_historique}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#2D3748' }}>
                        {new Date(deal.date_debut || deal.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#48BB78', fontSize: '14px' }}>
                        +{deal.amount_earned_total} DT
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          backgroundColor: deal.deal_type === 'marque' ? '#E3F2FD' : 
                                         deal.deal_type === 'depense' ? '#FFF3E0' :
                                         deal.deal_type === 'frequence' ? '#F3E5F5' : '#E8F5E9',
                          color: deal.deal_type === 'marque' ? '#1565C0' : 
                                 deal.deal_type === 'depense' ? '#E65100' :
                                 deal.deal_type === 'frequence' ? '#6A1B9A' : '#2E7D32',
                          fontWeight: '600'
                        }}>
                          {deal.deal_type || 'Deal'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#718096' }}>
              Aucun historique de deals
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cagnotte;