import React, { useEffect, useState } from 'react'; 
import { fetchUserProfile, updateCagnotteInDB } from '../store/slices/user';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast'; // Si vous utilisez toast pour afficher les messages.

const DealEnded = ({ gain, image }) => {
  const [show, setShow] = useState(true);
  const [clicked, setClicked] = useState(false); // État pour gérer si l'utilisateur a cliqué
  const { Userprofile } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  // Fetch user profile on component mount
  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  // Vérifier si le gain a déjà été ajouté lors du chargement du composant
  useEffect(() => {
    const hasAlreadyAdded = localStorage.getItem('gainAdded');
    if (hasAlreadyAdded) {
      setShow(false); // Si le gain a déjà été ajouté, on cache la carte
      setClicked(true); // Marquer comme cliqué pour ne pas le refaire
    }
  }, []);

  // Fonction qui gère l'envoi à la cagnotte lors du clic
  const toCagnotte = () => {
    if (clicked) return; // Si l'utilisateur a déjà cliqué, ne rien faire

    setClicked(true); // Marquer comme cliqué
    setShow(false); // Masquer le message de félicitations

    const updatedBalance = parseFloat(gain); // Calcul du gain à ajouter à la cagnotte

    // Envoi de la mise à jour de la cagnotte dans la base de données
    dispatch(updateCagnotteInDB(updatedBalance))
      .then(() => {
        // Mettre à jour le profil pour marquer que le gain a été ajouté
        dispatch(fetchUserProfile());
        // Persister l'état dans localStorage pour empêcher d'ajouter à nouveau le gain
        localStorage.setItem('gainAdded', 'true');
        toast.success('Cagnotte mise à jour avec succès!');
      })
      .catch((error) => {
        toast.error('Une erreur est survenue lors de la mise à jour de la cagnotte.');
        console.error(error);
      });
  };

  return (
    <div
      className="flex justify-start m-8 items-center bg-gray-100 cursor-pointer"
      onClick={toCagnotte}
    >
      {show && !clicked && ( // Afficher le message seulement si ce n'est pas cliqué
        <div className="w-full rounded-lg overflow-hidden shadow-lg bg-green-950">
          <div className="flex flex-row justify-evenly">
            {/* Image Section */}
            <img
              src={image}
              alt="Deal"
              className="w-48 h-48 object-cover p-2"
            />

            {/* Text Section */}
            <div className="pt-10 px-4 font-semibold text-lg text-white">
              <p>Félicitations, mission accomplie !</p>
              <p>Vous avez gagné {gain} DT</p>
              <p>Cliquez sur moi pour envoyer l'argent gagné à la cagnotte</p>
            </div>
          </div>
        </div>
      )}

      {/* Après le clic, on affiche un message de confirmation */}
      {!show && clicked && (
        <div className="w-full rounded-lg overflow-hidden shadow-lg bg-green-950">
          <div className="flex flex-row justify-evenly">
            {/* Image Section */}
            <img
              src={image}
              alt="Deal"
              className="w-48 h-48 object-cover p-2"
            />

            {/* Text Section */}
            <div className="pt-10 px-4 font-semibold text-lg text-white">
              <p>Félicitations, votre cagnotte a été mise à jour avec succès !</p>
              <p>Vous avez ajouté {gain} DT à votre cagnotte.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealEnded;
