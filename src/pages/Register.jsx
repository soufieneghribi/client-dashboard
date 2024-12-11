import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess } from "../store/slices/authSlice";
import toast from 'react-hot-toast';
import { signUp } from '../store/slices/user';


const Register = () => {
  const dispatch =useDispatch();
  const navigate =useNavigate()
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState({
    nom_et_prenom: '',
    tel: '',
    email: '',
    password: '',
    civilite:'',
    dateN: '',
    adresse: '',
    profession: '',
    situation_familiale: '',
    enfants: '',
    nom_enfant_1:'',
    nom_enfant_2:'',
    nom_enfant_3:'',
    nom_enfant_4:'',
  });
  const [isAgreed, setIsAgreed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [show, setShow] = useState(false)


  // Handle input change
  const changeHandler = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
console.log(user)
  // Move to the next step
  const handleNextStep = () => {
   
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Go back to the previous step
  const handlePreviousStep =(e) => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      
    }
  };
 

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted:', user);
    dispatch(signUp({ user, navigate }))
  
    setCurrentStep(1); // Reset to the first step
  };
  const handleCheckboxChange = (e) => {
    setIsAgreed(e.target.checked);
    
  };

  // Open modal
  const handleShowModal = () => {
    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const showHandler= () => {
    setShow(!show)
    console.log(show)
  }


  return (
    <div>
      <section className="flex flex-col items-center pt-6">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
              {currentStep === 1 && (
                <div >
                <div className='pb-10'>
                  <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white font-limon-milk">
              Inscrivez-vous
            </h1>
            </div>
            <div>
                  <label htmlFor="nom_et_prenom" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Nom et Prénom
                  </label>
                  <input
                    type="text"
                    name="nom_et_prenom"
                    id="fullName"
                    required
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Nom et Prénom"
                    onChange={changeHandler}
                  />
                
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Télèphone
                  </label>
                  <input
                    type="text"
                    name="tel"
                    id="tel"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Télèphone"
                    onChange={changeHandler}
                    required
                  />
              
                
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Email"
                    required
                    onChange={changeHandler}
                  />
                
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Mot de passe
                  </label>
                  <div className='relative'>
                  <input
                    type={show===true? "text":"password"}
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    
                    onChange={changeHandler}
                  />
                  <button 
                  className='bottom-1'
                  onClick={showHandler}>
                    <div className='absolute right-3 top-1/3 transform -translate-y-1/2 p-2'>
                     {show === false?( <i class="fa-solid fa-eye-slash "></i>):(<i class="fa-solid fa-eye"></i>)}
                    </div>
                    
                   
                  </button>
                  </div>
              
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Civilité
                  </label>
                  <select
                    name="civilite"
                    id="civilite"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required 
                    value={user.civilite}
                    onChange={changeHandler}
                  >
                    <option value="Mr">Monsieur</option>
                    <option value="Md">Madame</option>
                    <option value="Mlle">Mademoiselle</option>
                  </select>
               
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    name="dateN"
                    id="dateN"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={user.dateN}
                    required
                    onChange={changeHandler}
                  />
                </div>
                </div>
                
              )}
              </div>
              <div>
              {currentStep === 2  && (
                <div>
                 <div class="pb-10">
                   <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white font-limon-milk">
                       Informations Complémentaires
                    </h1>
                    </div>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"> Adresse</label>
                    <select name="adresse"
                    id="adresse"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={user.adresse}
                    required
                    onChange={changeHandler}>
                      <option value=""></option>
                    <option value="ariana">Ariana</option>
                      <option value="beja">Béja</option>
                      <option value="ben arous">Ben Arous</option>
                      <option value="bizerte">Bizerte</option>
                      <option value="gabes">Gabès</option>
                      <option value="gafsa">Gafsa</option>
                      <option value="jendouba">Jendouba</option>
                      <option value="kairouan">Kairouan</option>
                      <option value="kasserine">Kasserine</option>
                      <option value="kebili">Kébili</option>
                      <option value="le kef">Le Kef</option>
                      <option value="mahdia">Mahdia</option>                      
                      <option value="la mannouba">La Mannouba</option>
                      <option value="medenine">Médenine</option>
                      <option value="monastir">Monastir</option>
                      <option value="nabeul">Nabeul</option>
                      <option value="sfax">Sfax</option>
                      <option value="sidi bouzid">Sidi Bouzid</option>
                      <option value="siliana">Siliana</option>
                      <option value="sousse">Sousse</option>
                      <option value="tataouine">Tataouine</option>
                      <option value="tozeur">Tozeur</option>
                      <option value="tunis">Tunis</option>
                      <option value="zaghouan">Zaghouan</option>
                    
                    </select>
                 
                  
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Profession                  </label>
                 <select  name="profession"
                    id="profession"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={user.profession}
                    required 
                    onChange={changeHandler}>
                      <option value=""></option>
                      <option value="Agriculture / Arisans">Agriculture / Arisans</option>
                      <option value="Commerçant">Commerçant</option>
                      <option value="Chef d'entreprise">Chef d'entreprise</option>
                      <option value="Profession libérale">Profession libérale</option>
                      <option value="Cadre supérieur">Cadre supérieur</option>
                      <option value="Cadre moyen">Cadre moyen</option>
                      <option value="Enseignant, Professeur, Professions scientifique">Enseignant, Professeur, Professions scientifique</option>
                      <option value="Ingénieurs / Cadre technique d'entreprise">Ingénieurs / Cadre technique d'entreprise</option>
                      <option value="Technicien / Agent de maîtrise">Technicien / Agent de maîtrise</option>
                      <option value="Policier / Militaire">Policier / Militaire</option>
                      <option value="Fonction publique">Fonction publique</option>
                      <option value="Employés administratifs d'entreprise">Employés administratifs d'entreprise</option>
                      <option value="Ouvriers / Chauffeur">Ouvriers / Chauffeur </option>
                      <option value="Femme au foyer">Femme au foyer</option>
                      <option value="Elèves, Etudiants">Elèves, Etudiants</option>
                      <option value="Sans emploi">Sans emploi</option>
                      <option value="Autres">Autres</option>
                 </select>  
                 
                 <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Situation</label>
                 <select  name="situation_familiale"
                    id="situation_familiale"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                    defaultValue={user.situation_familiale}
                    onChange={changeHandler}>
                      <option value=""></option>
                      <option value="celebataire">Célebataire</option>
                      <option value="marie" > Marié </option>
                      <option value="divorce" >Divorce</option>
                  
                      </select>
                    
                      {user.situation_familiale !== "celebataire" && user.situation_familiale !== "" ? (
                        <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Enfants</label>
                        <select  name="enfants"
                           id="enfants"
                           className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           required
                           defaultValue={user.enfants}
                           onChange={changeHandler}>
                             <option value=""></option>
                             <option value="0">0</option>
                             <option value="1" >1</option>
                             <option value="2" >2</option>
                             <option value="3" >3</option>
                             <option value="4" >4</option>
                         
                             </select>
                             </div>
                      ) : ("")}
                      </div>
                    )}
              </div>
              <div>
              {currentStep === 3  &&  (
                <div className='flex flex-col w-full py-8'>
                    <div class="pb-10">
                   <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white font-limon-milk">
                      Confirmation
                    </h1>
                    </div>
                    <h2>Vérifiez vos informations avant de soumettre.</h2>
                  {user.situation_familiale!=='celebataire' && (
                   user.enfants ==="1" ?(
                     <div className='flex flex-col  gap-3 pt-2 '>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"> Nom des enfants</label>
                    <input
                    type="text"
                    name="nom_enfant_1"
                    id="enfant1"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 "
                    placeholder="Nom de l'Enfant 1"
                    required
                    onChange={changeHandler}
                  /> 
                  </div>):
                  user.enfants ==="2" ? (
                    <div className='flex flex-col  gap-3 pt-2 '>
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"> Nom des enfants</label>
                    <input
                    type="text"
                    name="nom_enfant_1"
                    id="enfant1"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 "
                    placeholder="Nom de l'Enfant 1"
                    required
                    onChange={changeHandler}
                  />
                  <input
                    type="text"
                    name="nom_enfant_2"
                    id="enfant2"
                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="Nom de l'Enfant 2"
                    required
                    onChange={changeHandler}
                  />
                   </div>): 
                    user.enfants==="3"?( 
                    <div className='flex flex-col  gap-3 pt-2'>
                     <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"> Nom des enfants</label>
                     <input 
                   type="text"
                    name="nom_enfant_1"
                     id="enfant1"
                     className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                     placeholder="Nom de l'Enfant 1"
                     required
                     onChange={changeHandler}
                   />
                   <input 
                     type="text"
                     name="nom_enfant_2"
                     id="enfant2"
                     className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                     placeholder="Nom de l'Enfant 2"
                     required
                    onChange={changeHandler}
                  />
                   <input
                     type="text"
                     name="nom_enfant_3"
                     id="enfant3"
                     className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                     placeholder="Nom de l'Enfant 3"
                     required
                     onChange={changeHandler}
                   />
                  </div>):
                   user.enfants==="4" ?(
                     <div className='flex flex-col  gap-3 pt-2'>
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"> Nom des enfants</label>
                      <input 
                     type="text"
                      name="nom_enfant_1"
                      id="enfant1"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Nom de l'Enfant 1"
                      required
                      onChange={changeHandler}
                    />
                    <input 
                      type="text"
                      name="nom_enfant_2"
                      id="enfant2"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Nom de l'Enfant 2"
                      required
                      onChange={changeHandler}
                    />
                    <input 
                      type="text"
                      name="nom_enfant_3"
                      id="enfant3"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Nom de l'Enfant 3"
                      required
                      onChange={changeHandler}
                    />
                    <input
                      type="text"
                      name="nom_enfant_4"
                      id="enfant4"
                      className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Nom de l'Enfant 4"
                      required
                     onChange={changeHandler}
                   />
                   </div> 
                   ):"")}
                  
                  
               <div className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg px-2 py-2 mt-2 w-full'>
               <input
                  type="checkbox"
                  id="conditions"
                  name="conditions"
                  required
                  checked={isAgreed}
                  className='w-4 h-4 accent-blue-360'
                  onChange={handleCheckboxChange}
                />
                &nbsp; En cochant cette case, vous{" "}
                <button
                  type="button"
                  onClick={handleShowModal}
                  className="text-blue-500 hover:underline"
                >
                  déclarez avoir lu et accepté nos conditions générales de vente.
                </button>
              </div>

              {/* Modal for terms and conditions */}
              {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 ">
                  <div className="bg-white rounded-lg shadow-lg max-w-md w-full h-2/3 overflow-y-scroll">
                    <div className="flex justify-between items-center bg-orange-360 p-8 m-0">
                      <h2 className="font-semibold text-xl text-gray-800">
                        Conditions Générales
                      </h2>
                     
                      <button onClick={handleCloseModal} className="text-gray-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <p className="mt-2 px-5 text-sm text-gray-600 leading-relaxed">
                    Privacy Policy Template
This Privacy Policy Template is covers the general privacy concerns and regulations. I hope you find it useful and a good starting point in compiling your own privacy policy for use on your own website or app. Feel free to add stuff that I haven't added, and remove stuff that you don't like. If there are ways that I can do things better, you should absolutely report issues or send me a pull request because I love them so much.

What is a Privacy Policy
A privacy policy is a description of what you do with personal data. The critical things to describe in the policy are how you and your website or app collect, use, store, and share or disclose information about people. Providing a privacy policy also helps your users understand what happens to information about them.

Note: A Privacy Policy is not the same as the Terms and Conditions agreement. A Terms and Conditions is the agreement where you include the rules and guidelines that users must agree to in order to use your website or app.

What is a Personal Data
Personal data is any kind of data or information that can be considered personal (identifies an individual):

First and last name
Email address
Billing and shipping address
Credit card information
And so on
When is a Privacy Policy required
The Privacy Policy is required by law if you collect personal data. One should be provided where your website or app does anything with personal data. A Privacy Policy is required regardless of the type of platform your business operates on or what kind of industry you’re in:

Website
WordPress blog, or any other platform: Joomla, Drupal etc
E-commerce store
Mobile app: iOS, Android or Windows Phone
Facebook app
Desktop app
Digital product
How this Privacy Policy Template works
This document has been drafted in Markdown (MD) and in plain text (TXT), and can be converted to HTML using a huge number of open source and commercially available tools.

Elements that need to be filled in have been marked up with double brackets, as follows:

[["website" or "app"]]
[["we" or "I"]]
[["us" or "me"]]
[["our" or "my"]]
Make sure to find and fill in them all!

Disclaimer
You are free to use it on your own website or app. But before using this Privacy Policy Template you should be aware that you are responsible for its contents when published to your own website or app and that includes the accuracy of information.

This Privacy Policy Template is not legal advice, and is no substitute for a real live lawyer. Some places legally require that you have a privacy policy, and require that you describe certain things in it. Some places have (very specific) rules about what you are and aren't allowed to do with info about users. You should definitely talk with a lawyer about all this stuff, and they should definitely read and review your policy.

You should also know that this Privacy Policy Template is provided without any warranty, express or implied, to the fullest extent possible.

License
This Privacy Policy Template is licensed under the GNU General Public License, version 3 (GPLv3) and is distributed free of charge.
                      
                    </p>
                    <div className="flex justify-end mt-4">
                      <button
                        onClick={handleCloseModal}
                        className="px-4 py-2 mb-5 bg-blue-360 text-white text-sm font-medium rounded-md"
                      >
                        Fermer
                      </button>
                   </div>
                  </div>
                </div>
              )}
             </div>
              )}
              </div>
              
                {currentStep <3 ? (
                  <div className="flex flex-row justify-between content-center">
                   <button
                   type="button"
                   className="w-1/3 text-white bg-orange-360 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                   onClick={handlePreviousStep}
                   hidden={currentStep===1}
                 >
                   Précédent
                 </button>
                  <button
                    type="button"
                    className="w-1/3 text-white bg-blue-360 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                    onClick={handleNextStep}
                  >
                    Suivant
                  </button>
                  </div>
                ) : (
                  <div className="flex flex-row justify-between content-center">
                   <button
                   type="button"
                   className="w-1/3 text-white bg-orange-360 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
                   onClick={handlePreviousStep}
                   hidden={currentStep===1}
                 >
                   Précédent
                 </button>
                  <button 
                  type="submit"
                  className="w-1/3 text-white bg-blue-360 font-medium rounded-lg text-sm px-5 py-2.5 text-center ">
                  Soumettre
                  </button>
                  </div>
                )}
              
              
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
