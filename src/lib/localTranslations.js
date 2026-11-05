// Local fallback translations for keys the server langpack does not (yet) provide.
// Lookup order in t(): overrides -> server langpack -> this file -> English fallback.
// Source of truth for the server side: docs/language-keys-to-add.md
export const LOCAL_TRANSLATIONS = Object.freeze({
  en: {
    register_subtitle: "Register your business on mPay Merchant Portal",
    forgot_pin_subtitle:
      "Enter your registered email address and date of birth to reset your PIN.",
    remembered_pin: "Remembered your PIN?",
    store_name_required: "Store Name is required.",
    store_name_min_error: "Store Name length should be at least 5 characters",
    store_name_max_error: "Store Name cannot exceed 50 characters.",
    store_name_alphanumeric_error:
      "Store Name must contain letters, numbers, and spaces only.",
    email_required: "Business Email Address is required.",
    invalid_email: "Please enter a valid Email Address.",
    email_max_error: "Email Address cannot exceed 80 characters.",
    country_code_required: "Select a country code.",
    phone_required: "Business Phone Number is required.",
    merchant_phone_min_error:
      "Business Phone Number must be at least 7 digits.",
    merchant_phone_max_error: "Business Phone Number cannot exceed 11 digits.",
    merchant_phone_numeric_error:
      "Business Phone Number must contain digits only.",
    accept_terms_required: "You must accept the Terms and Conditions.",
    accept_device_required: "You must agree to the device account agreement.",
    app_consent_required: "Please select Yes or No to proceed.",
    registration_failed_try_again: "Registration failed. Please try again.",
    something_went_wrong_try_again: "Something went wrong. Please try again.",
    enter_complete_otp: "Please enter the complete 6-digit OTP code.",
    invalid_otp_code: "Invalid OTP code. Please try again.",
    otp_verification_failed: "OTP verification failed. Please try again.",
    otp_resent_success: "The OTP has been successfully resent.",
    failed_resend_otp: "Failed to resend OTP. Please try again.",
    verification_link_sent_email:
      "Merchant verification link has been sent to your registered email address. Please check your inbox to complete enrollment.",
    dob_required: "Please Enter Date of Birth",
    dob_min_age_error:
      "Date of birth cannot be a future date and must be at least 18 years from today.",
    request_submitted: "Request Submitted",
    forgot_pin_success_desc:
      "If the details match, instructions to reset your PIN have been sent to your email.",
    invalid_details_try_again: "Invalid details. Please try again",
    submitting: "Submitting…",
    verifying: "Verifying…",
    ph_search_country: "Search country...",
    no_country_found: "No country found",
    crossAppConsent:
      "Do you agree that your email and phone number may be used for both the Merchant and Consumer Wallet apps?",
    uptime: "Uptime",
    processed: "Processed",
    all_rights_reserved: "All rights reserved.",
    contact_us: "Contact Us",
    contact_phone: "Phone",
    contact_whatsapp: "Whatsapp",
    contact_fax: "Fax",
    contact_address: "Address",
    contact_website: "Website",
    back_to_dashboard: "Back To Dashboard",
    toggle_theme: "Toggle theme",
    privacy_policy: "Privacy Policy",
    last_updated: "Last updated: August 2026",
    privacy_statement_title: "mPay Network Privacy Statement",
    privacy_intro:
      "Your privacy and data protection are paramount. This Privacy Policy details how mPay Network collects, safeguards, and utilizes merchant and transaction information.",
    privacy_sec_1_title: "Information We Collect",
    privacy_sec_1_desc:
      "We collect store details, registered email address, phone number, and transaction logs required to provide secure settlement and merchant payment processing.",
    privacy_sec_2_title: "Data Protection & Encryption",
    privacy_sec_2_desc:
      "All sensitive communications and API payloads are encrypted using standard SHA-256 cryptographic signatures and HTTPS TLS protocols.",
    official_agreement: "Official Service & User Agreement",
  },
  nl: {
    register_subtitle: "Registreer uw bedrijf op het mPay Merchant Portal",
    forgot_pin_subtitle:
      "Voer uw geregistreerde e-mailadres en geboortedatum in om uw pincode opnieuw in te stellen.",
    remembered_pin: "Pincode herinnerd?",
    store_name_required: "Winkelnaam is verplicht.",
    store_name_min_error: "De winkelnaam moet minimaal 5 tekens bevatten",
    store_name_max_error: "De winkelnaam mag maximaal 50 tekens bevatten.",
    store_name_alphanumeric_error:
      "De winkelnaam mag alleen letters, cijfers en spaties bevatten.",
    email_required: "Zakelijk e-mailadres is verplicht.",
    invalid_email: "Voer een geldig e-mailadres in.",
    email_max_error: "Het e-mailadres mag maximaal 80 tekens bevatten.",
    country_code_required: "Selecteer een landcode.",
    phone_required: "Zakelijk telefoonnummer is verplicht.",
    merchant_phone_min_error:
      "Zakelijk telefoonnummer moet minimaal 7 cijfers bevatten.",
    merchant_phone_max_error:
      "Zakelijk telefoonnummer mag maximaal 11 cijfers bevatten.",
    merchant_phone_numeric_error:
      "Zakelijk telefoonnummer mag alleen cijfers bevatten.",
    accept_terms_required: "U moet de algemene voorwaarden accepteren.",
    accept_device_required:
      "U moet akkoord gaan met de apparaat-accountovereenkomst.",
    app_consent_required: "Selecteer Ja of Nee om door te gaan.",
    registration_failed_try_again: "Registratie mislukt. Probeer het opnieuw.",
    something_went_wrong_try_again:
      "Er is iets misgegaan. Probeer het opnieuw.",
    enter_complete_otp: "Voer de volledige OTP-code van 6 cijfers in.",
    invalid_otp_code: "Ongeldige OTP-code. Probeer het opnieuw.",
    otp_verification_failed: "OTP-verificatie mislukt. Probeer het opnieuw.",
    otp_resent_success: "De OTP is opnieuw verzonden.",
    failed_resend_otp: "OTP opnieuw verzenden mislukt. Probeer het opnieuw.",
    verification_link_sent_email:
      "De verificatielink voor handelaren is verzonden naar uw geregistreerde e-mailadres. Controleer uw inbox om de inschrijving te voltooien.",
    dob_required: "Voer uw geboortedatum in",
    dob_min_age_error:
      "Geboortedatum mag niet in de toekomst liggen en moet minimaal 18 jaar vanaf vandaag zijn.",
    request_submitted: "Verzoek ingediend",
    forgot_pin_success_desc:
      "Als de gegevens overeenkomen, zijn de instructies om uw pincode opnieuw in te stellen naar uw e-mailadres verzonden.",
    invalid_details_try_again: "Ongeldige gegevens. Probeer het opnieuw",
    submitting: "Bezig met verzenden…",
    verifying: "Bezig met verifiëren…",
    ph_search_country: "Zoek land...",
    no_country_found: "Geen land gevonden",
    crossAppConsent:
      "Gaat u ermee akkoord dat uw e-mailadres en telefoonnummer worden gebruikt voor zowel de Merchant- als de Consumer Wallet-apps?",
    uptime: "Beschikbaarheid",
    processed: "Verwerkt",
    all_rights_reserved: "Alle rechten voorbehouden.",
    contact_us: "Neem contact met ons op",
    contact_phone: "Telefoon",
    contact_whatsapp: "Whatsapp",
    contact_fax: "Fax",
    contact_address: "Adres",
    contact_website: "Website",
    back_to_dashboard: "Terug naar dashboard",
    toggle_theme: "Thema wisselen",
    privacy_policy: "Privacybeleid",
    last_updated: "Laatst bijgewerkt: augustus 2026",
    privacy_statement_title: "Privacyverklaring van mPay Network",
    privacy_intro:
      "Uw privacy en gegevensbescherming zijn van het grootste belang. Dit privacybeleid beschrijft hoe mPay Network handelaars- en transactiegegevens verzamelt, beveiligt en gebruikt.",
    privacy_sec_1_title: "Gegevens die wij verzamelen",
    privacy_sec_1_desc:
      "Wij verzamelen winkelgegevens, het geregistreerde e-mailadres, telefoonnummer en transactielogboeken die nodig zijn voor een veilige afwikkeling en de verwerking van handelaarsbetalingen.",
    privacy_sec_2_title: "Gegevensbescherming en versleuteling",
    privacy_sec_2_desc:
      "Alle gevoelige communicatie en API-payloads worden versleuteld met standaard cryptografische SHA-256-handtekeningen en HTTPS TLS-protocollen.",
    official_agreement: "Officiële service- en gebruikersovereenkomst",
  },
  fr: {
    register_subtitle:
      "Enregistrez votre entreprise sur le portail marchand mPay",
    forgot_pin_subtitle:
      "Saisissez votre adresse e-mail enregistrée et votre date de naissance pour réinitialiser votre code PIN.",
    remembered_pin: "Vous vous souvenez de votre code PIN ?",
    store_name_required: "Le nom du magasin est obligatoire.",
    store_name_min_error:
      "Le nom du magasin doit contenir au moins 5 caractères",
    store_name_max_error:
      "Le nom du magasin ne peut pas dépasser 50 caractères.",
    store_name_alphanumeric_error:
      "Le nom du magasin ne doit contenir que des lettres, des chiffres et des espaces.",
    email_required: "L'adresse e-mail professionnelle est obligatoire.",
    invalid_email: "Veuillez saisir une adresse e-mail valide.",
    email_max_error: "L'adresse e-mail ne peut pas dépasser 80 caractères.",
    country_code_required: "Sélectionnez un indicatif de pays.",
    phone_required: "Le numéro de téléphone professionnel est obligatoire.",
    merchant_phone_min_error:
      "Le numéro de téléphone professionnel doit contenir au moins 7 chiffres.",
    merchant_phone_max_error:
      "Le numéro de téléphone professionnel ne peut pas dépasser 11 chiffres.",
    merchant_phone_numeric_error:
      "Le numéro de téléphone professionnel ne doit contenir que des chiffres.",
    accept_terms_required: "Vous devez accepter les conditions générales.",
    accept_device_required:
      "Vous devez accepter l'accord relatif au compte de l'appareil.",
    app_consent_required: "Veuillez sélectionner Oui ou Non pour continuer.",
    registration_failed_try_again:
      "L'inscription a échoué. Veuillez réessayer.",
    something_went_wrong_try_again:
      "Une erreur s'est produite. Veuillez réessayer.",
    enter_complete_otp: "Veuillez saisir le code OTP complet à 6 chiffres.",
    invalid_otp_code: "Code OTP invalide. Veuillez réessayer.",
    otp_verification_failed:
      "La vérification du code OTP a échoué. Veuillez réessayer.",
    otp_resent_success: "Le code OTP a été renvoyé avec succès.",
    failed_resend_otp: "Échec du renvoi du code OTP. Veuillez réessayer.",
    verification_link_sent_email:
      "Le lien de vérification marchand a été envoyé à votre adresse e-mail enregistrée. Consultez votre boîte de réception pour finaliser l'inscription.",
    dob_required: "Veuillez saisir votre date de naissance",
    dob_min_age_error:
      "La date de naissance ne peut pas être future et doit être d'au moins 18 ans à compter d'aujourd'hui.",
    request_submitted: "Demande envoyée",
    forgot_pin_success_desc:
      "Si les informations correspondent, les instructions pour réinitialiser votre code PIN ont été envoyées à votre adresse e-mail.",
    invalid_details_try_again: "Informations invalides. Veuillez réessayer",
    submitting: "Envoi en cours…",
    verifying: "Vérification en cours…",
    ph_search_country: "Rechercher un pays...",
    no_country_found: "Aucun pays trouvé",
    crossAppConsent:
      "Acceptez-vous que votre adresse e-mail et votre numéro de téléphone soient utilisés pour les applications Marchand et Portefeuille consommateur ?",
    uptime: "Disponibilité",
    processed: "Traité",
    all_rights_reserved: "Tous droits réservés.",
    contact_us: "Contactez-nous",
    contact_phone: "Téléphone",
    contact_whatsapp: "Whatsapp",
    contact_fax: "Fax",
    contact_address: "Adresse",
    contact_website: "Site web",
    back_to_dashboard: "Retour au tableau de bord",
    toggle_theme: "Changer de thème",
    privacy_policy: "Politique de confidentialité",
    last_updated: "Dernière mise à jour : août 2026",
    privacy_statement_title: "Déclaration de confidentialité de mPay Network",
    privacy_intro:
      "Votre vie privée et la protection de vos données sont primordiales. Cette politique de confidentialité décrit comment mPay Network collecte, protège et utilise les informations des marchands et des transactions.",
    privacy_sec_1_title: "Informations que nous collectons",
    privacy_sec_1_desc:
      "Nous collectons les détails du magasin, l'adresse e-mail enregistrée, le numéro de téléphone et les journaux de transactions nécessaires à un règlement sécurisé et au traitement des paiements marchands.",
    privacy_sec_2_title: "Protection des données et chiffrement",
    privacy_sec_2_desc:
      "Toutes les communications sensibles et les charges utiles d'API sont chiffrées à l'aide de signatures cryptographiques SHA-256 standard et de protocoles HTTPS TLS.",
    official_agreement: "Contrat officiel de service et d'utilisation",
  },
  es: {
    register_subtitle: "Registre su negocio en el Portal de Comerciantes mPay",
    forgot_pin_subtitle:
      "Ingrese su correo electrónico registrado y su fecha de nacimiento para restablecer su PIN.",
    remembered_pin: "¿Recordó su PIN?",
    store_name_required: "El nombre de la tienda es obligatorio.",
    store_name_min_error:
      "El nombre de la tienda debe tener al menos 5 caracteres",
    store_name_max_error:
      "El nombre de la tienda no puede superar los 50 caracteres.",
    store_name_alphanumeric_error:
      "El nombre de la tienda solo puede contener letras, números y espacios.",
    email_required: "El correo electrónico comercial es obligatorio.",
    invalid_email: "Ingrese una dirección de correo electrónico válida.",
    email_max_error:
      "El correo electrónico no puede superar los 80 caracteres.",
    country_code_required: "Seleccione un código de país.",
    phone_required: "El número de teléfono comercial es obligatorio.",
    merchant_phone_min_error:
      "El número de teléfono comercial debe tener al menos 7 dígitos.",
    merchant_phone_max_error:
      "El número de teléfono comercial no puede superar los 11 dígitos.",
    merchant_phone_numeric_error:
      "El número de teléfono comercial solo puede contener dígitos.",
    accept_terms_required: "Debe aceptar los Términos y Condiciones.",
    accept_device_required:
      "Debe aceptar el acuerdo de cuenta del dispositivo.",
    app_consent_required: "Seleccione Sí o No para continuar.",
    registration_failed_try_again: "El registro falló. Inténtelo de nuevo.",
    something_went_wrong_try_again: "Algo salió mal. Inténtelo de nuevo.",
    enter_complete_otp: "Ingrese el código OTP completo de 6 dígitos.",
    invalid_otp_code: "Código OTP no válido. Inténtelo de nuevo.",
    otp_verification_failed:
      "La verificación del OTP falló. Inténtelo de nuevo.",
    otp_resent_success: "El OTP se ha reenviado correctamente.",
    failed_resend_otp: "No se pudo reenviar el OTP. Inténtelo de nuevo.",
    verification_link_sent_email:
      "El enlace de verificación del comerciante se envió a su correo electrónico registrado. Revise su bandeja de entrada para completar la inscripción.",
    dob_required: "Ingrese su fecha de nacimiento",
    dob_min_age_error:
      "La fecha de nacimiento no puede ser una fecha futura y debe ser de al menos 18 años a partir de hoy.",
    request_submitted: "Solicitud enviada",
    forgot_pin_success_desc:
      "Si los datos coinciden, se han enviado a su correo electrónico las instrucciones para restablecer su PIN.",
    invalid_details_try_again: "Datos no válidos. Inténtelo de nuevo",
    submitting: "Enviando…",
    verifying: "Verificando…",
    ph_search_country: "Buscar país...",
    no_country_found: "No se encontró ningún país",
    crossAppConsent:
      "¿Acepta que su correo electrónico y número de teléfono se utilicen tanto en la aplicación de Comerciante como en la de Billetera del consumidor?",
    uptime: "Disponibilidad",
    processed: "Procesado",
    all_rights_reserved: "Todos los derechos reservados.",
    contact_us: "Contáctenos",
    contact_phone: "Teléfono",
    contact_whatsapp: "Whatsapp",
    contact_fax: "Fax",
    contact_address: "Dirección",
    contact_website: "Sitio web",
    back_to_dashboard: "Volver al panel",
    toggle_theme: "Cambiar tema",
    privacy_policy: "Política de privacidad",
    last_updated: "Última actualización: agosto de 2026",
    privacy_statement_title: "Declaración de privacidad de mPay Network",
    privacy_intro:
      "Su privacidad y la protección de sus datos son fundamentales. Esta Política de privacidad detalla cómo mPay Network recopila, protege y utiliza la información de comerciantes y transacciones.",
    privacy_sec_1_title: "Información que recopilamos",
    privacy_sec_1_desc:
      "Recopilamos los datos de la tienda, el correo electrónico registrado, el número de teléfono y los registros de transacciones necesarios para una liquidación segura y el procesamiento de pagos de comerciantes.",
    privacy_sec_2_title: "Protección de datos y cifrado",
    privacy_sec_2_desc:
      "Todas las comunicaciones confidenciales y las cargas útiles de la API se cifran mediante firmas criptográficas SHA-256 estándar y protocolos HTTPS TLS.",
    official_agreement: "Acuerdo oficial de servicio y usuario",
  },
});
