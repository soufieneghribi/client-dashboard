// Utils.js
import { FORM_CONFIG } from '../Constants/Constants';

export class FormUtils {
  static getPasswordStrength(password) {
    const value = password || "";
    let score = 0;
    
    if (value.length >= 8) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;
    
    return { 
      score, 
      label: FORM_CONFIG.PASSWORD_STRENGTH.LABELS[score] 
    };
  }

  static validateStep1(user, confirmPassword) {
    const errors = {};
    const { MIN_PHONE_DIGITS, MIN_PASSWORD_LENGTH, EMAIL_PATTERN, PHONE_DIGITS_PATTERN } = FORM_CONFIG.VALIDATION;

    // Nom et prénom
    if (!user.nom_et_prenom?.trim()) {
      errors.nom_et_prenom = 'Nom et prénom requis';
    }

    // Téléphone
    const phoneDigits = (user.tel || '').replace(PHONE_DIGITS_PATTERN, '');
    if (!user.tel) {
      errors.tel = 'Téléphone requis';
    } else if (phoneDigits.length < MIN_PHONE_DIGITS) {
      errors.tel = 'Numéro invalide (min 8 chiffres)';
    }

    // Email
    const isEmailValid = EMAIL_PATTERN.test(user.email || '');
    if (!user.email) {
      errors.email = 'Email requis';
    } else if (!isEmailValid) {
      errors.email = 'Email invalide';
    }

    // Mot de passe
    if (!user.password) {
      errors.password = 'Mot de passe requis';
    } else if (user.password.length < MIN_PASSWORD_LENGTH) {
      errors.password = 'Au moins 8 caractères';
    }

    // Confirmation mot de passe
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirmation requise';
    } else if (confirmPassword !== user.password) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    // Civilité
    if (!user.civilite) {
      errors.civilite = 'Civilité requise';
    }

    // Date de naissance
    if (!user.dateN) {
      errors.dateN = 'Date de naissance requise';
    } else {
      try {
        const selectedDate = new Date(user.dateN);
        const today = new Date();
        selectedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
          errors.dateN = 'La date ne doit pas dépasser la date du jour';
        }
      } catch {
        errors.dateN = 'Date invalide';
      }
    }

    return errors;
  }

  static isValidPhone(phone) {
    const digits = (phone || '').replace(FORM_CONFIG.VALIDATION.PHONE_DIGITS_PATTERN, '');
    return digits.length >= FORM_CONFIG.VALIDATION.MIN_PHONE_DIGITS;
  }

  static isValidEmail(email) {
    return FORM_CONFIG.VALIDATION.EMAIL_PATTERN.test(email || '');
  }

  static getTodayDate() {
    return new Date().toISOString().split('T')[0];
  }

  static async handleGeolocationConsent(checked, setGeoStatus) {
    if (!checked) {
      setGeoStatus(null);
      return;
    }

    try {
      if (navigator?.permissions && navigator?.geolocation) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          setGeoStatus(permission.state);
          permission.onchange = () => setGeoStatus(permission.state);
        } catch (_) {}
      }
      
      if (navigator?.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => setGeoStatus((prev) => prev || 'granted'),
          () => setGeoStatus('denied')
        );
      }
    } catch (err) {
      setGeoStatus('error');
    }
  }
}