# Language keys to add on server (getLangPack)

Portal reads `labelId` -> `labelValue` per language from the server. A key missing there falls back to English.
Add these keys for **en / nl / fr / es**. Numbers (5, 7, 11, 50, 80) are fixed text: the server has no placeholders.

| Key | English | Dutch (nl) | French (fr) | Spanish (es) |
|---|---|---|---|---|
| register_subtitle | Register your business on mPay Merchant Portal | Registreer uw bedrijf op het mPay Merchant Portal | Enregistrez votre entreprise sur le portail marchand mPay | Registre su negocio en el Portal de Comerciantes mPay |
| forgot_pin_subtitle | Enter your registered email address and date of birth to reset your PIN. | Voer uw geregistreerde e-mailadres en geboortedatum in om uw pincode opnieuw in te stellen. | Saisissez votre adresse e-mail enregistrée et votre date de naissance pour réinitialiser votre code PIN. | Ingrese su correo electrónico registrado y su fecha de nacimiento para restablecer su PIN. |
| remembered_pin | Remembered your PIN? | Pincode herinnerd? | Vous vous souvenez de votre code PIN ? | ¿Recordó su PIN? |
| store_name_required | Store Name is required. | Winkelnaam is verplicht. | Le nom du magasin est obligatoire. | El nombre de la tienda es obligatorio. |
| store_name_min_error | Store Name length should be at least 5 characters | De winkelnaam moet minimaal 5 tekens bevatten | Le nom du magasin doit contenir au moins 5 caractères | El nombre de la tienda debe tener al menos 5 caracteres |
| store_name_max_error | Store Name cannot exceed 50 characters. | De winkelnaam mag maximaal 50 tekens bevatten. | Le nom du magasin ne peut pas dépasser 50 caractères. | El nombre de la tienda no puede superar los 50 caracteres. |
| store_name_alphanumeric_error | Store Name must contain letters, numbers, and spaces only. | De winkelnaam mag alleen letters, cijfers en spaties bevatten. | Le nom du magasin ne doit contenir que des lettres, des chiffres et des espaces. | El nombre de la tienda solo puede contener letras, números y espacios. |
| email_required | Business Email Address is required. | Zakelijk e-mailadres is verplicht. | L'adresse e-mail professionnelle est obligatoire. | El correo electrónico comercial es obligatorio. |
| invalid_email | Please enter a valid Email Address. | Voer een geldig e-mailadres in. | Veuillez saisir une adresse e-mail valide. | Ingrese una dirección de correo electrónico válida. |
| email_max_error | Email Address cannot exceed 80 characters. | Het e-mailadres mag maximaal 80 tekens bevatten. | L'adresse e-mail ne peut pas dépasser 80 caractères. | El correo electrónico no puede superar los 80 caracteres. |
| country_code_required | Select a country code. | Selecteer een landcode. | Sélectionnez un indicatif de pays. | Seleccione un código de país. |
| phone_required | Business Phone Number is required. | Zakelijk telefoonnummer is verplicht. | Le numéro de téléphone professionnel est obligatoire. | El número de teléfono comercial es obligatorio. |
| merchant_phone_min_error | Business Phone Number must be at least 7 digits. | Zakelijk telefoonnummer moet minimaal 7 cijfers bevatten. | Le numéro de téléphone professionnel doit contenir au moins 7 chiffres. | El número de teléfono comercial debe tener al menos 7 dígitos. |
| merchant_phone_max_error | Business Phone Number cannot exceed 11 digits. | Zakelijk telefoonnummer mag maximaal 11 cijfers bevatten. | Le numéro de téléphone professionnel ne peut pas dépasser 11 chiffres. | El número de teléfono comercial no puede superar los 11 dígitos. |
| merchant_phone_numeric_error | Business Phone Number must contain digits only. | Zakelijk telefoonnummer mag alleen cijfers bevatten. | Le numéro de téléphone professionnel ne doit contenir que des chiffres. | El número de teléfono comercial solo puede contener dígitos. |
| accept_terms_required | You must accept the Terms and Conditions. | U moet de algemene voorwaarden accepteren. | Vous devez accepter les conditions générales. | Debe aceptar los Términos y Condiciones. |
| accept_device_required | You must agree to the device account agreement. | U moet akkoord gaan met de apparaat-accountovereenkomst. | Vous devez accepter l'accord relatif au compte de l'appareil. | Debe aceptar el acuerdo de cuenta del dispositivo. |
| app_consent_required | Please select Yes or No to proceed. | Selecteer Ja of Nee om door te gaan. | Veuillez sélectionner Oui ou Non pour continuer. | Seleccione Sí o No para continuar. |
| registration_failed_try_again | Registration failed. Please try again. | Registratie mislukt. Probeer het opnieuw. | L'inscription a échoué. Veuillez réessayer. | El registro falló. Inténtelo de nuevo. |
| something_went_wrong_try_again | Something went wrong. Please try again. | Er is iets misgegaan. Probeer het opnieuw. | Une erreur s'est produite. Veuillez réessayer. | Algo salió mal. Inténtelo de nuevo. |
| enter_complete_otp | Please enter the complete 6-digit OTP code. | Voer de volledige OTP-code van 6 cijfers in. | Veuillez saisir le code OTP complet à 6 chiffres. | Ingrese el código OTP completo de 6 dígitos. |
| invalid_otp_code | Invalid OTP code. Please try again. | Ongeldige OTP-code. Probeer het opnieuw. | Code OTP invalide. Veuillez réessayer. | Código OTP no válido. Inténtelo de nuevo. |
| otp_verification_failed | OTP verification failed. Please try again. | OTP-verificatie mislukt. Probeer het opnieuw. | La vérification du code OTP a échoué. Veuillez réessayer. | La verificación del OTP falló. Inténtelo de nuevo. |
| otp_resent_success | The OTP has been successfully resent. | De OTP is opnieuw verzonden. | Le code OTP a été renvoyé avec succès. | El OTP se ha reenviado correctamente. |
| failed_resend_otp | Failed to resend OTP. Please try again. | OTP opnieuw verzenden mislukt. Probeer het opnieuw. | Échec du renvoi du code OTP. Veuillez réessayer. | No se pudo reenviar el OTP. Inténtelo de nuevo. |
| verification_link_sent_email | Merchant verification link has been sent to your registered email address. Please check your inbox to complete enrollment. | De verificatielink voor handelaren is verzonden naar uw geregistreerde e-mailadres. Controleer uw inbox om de inschrijving te voltooien. | Le lien de vérification marchand a été envoyé à votre adresse e-mail enregistrée. Consultez votre boîte de réception pour finaliser l'inscription. | El enlace de verificación del comerciante se envió a su correo electrónico registrado. Revise su bandeja de entrada para completar la inscripción. |
| dob_required | Please Enter Date of Birth | Voer uw geboortedatum in | Veuillez saisir votre date de naissance | Ingrese su fecha de nacimiento |
| request_submitted | Request Submitted | Verzoek ingediend | Demande envoyée | Solicitud enviada |
| forgot_pin_success_desc | If the details match, instructions to reset your PIN have been sent to your email. | Als de gegevens overeenkomen, zijn de instructies om uw pincode opnieuw in te stellen naar uw e-mailadres verzonden. | Si les informations correspondent, les instructions pour réinitialiser votre code PIN ont été envoyées à votre adresse e-mail. | Si los datos coinciden, se han enviado a su correo electrónico las instrucciones para restablecer su PIN. |
| invalid_details_try_again | Invalid details. Please try again | Ongeldige gegevens. Probeer het opnieuw | Informations invalides. Veuillez réessayer | Datos no válidos. Inténtelo de nuevo |
| submitting | Submitting… | Bezig met verzenden… | Envoi en cours… | Enviando… |
| verifying | Verifying… | Bezig met verifiëren… | Vérification en cours… | Verificando… |
| ph_search_country | Search country... | Zoek land... | Rechercher un pays... | Buscar país... |
| no_country_found | No country found | Geen land gevonden | Aucun pays trouvé | No se encontró ningún país |

Notes
- Keys not listed (storeName, merCrEmail, merCrPhoneNo, agreement, yes, no, next, buttonContinue, ...) already come translated from the server (visible in the Dutch screenshots).
- The list covers keys that are new in the merchant portal v2; if the server already has some, only the missing ones need adding.
- Server-returned API error messages (e.g. "This merchant is already registered") are not in this list; the backend must translate those itself.

- Added 21 more keys (uptime, processed, all_rights_reserved, contact_*, back_to_dashboard, toggle_theme, privacy_*, last_updated, official_agreement): same values live in src/lib/localTranslations.js (nl/fr/es); server may add them later.
