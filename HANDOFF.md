# Handoff

## Done (branch mahbub, uncommitted)
- LoginForm: server error moved from RHF root.serverError to useState; clears on email/PIN change and on submit.
- T&C page: Continue returns to origin page (state.from: "/" login or "/enroll"); links in login page.jsx and EnrollForm pass state.
- ForgotPinForm: DOB required message fixed (Zod v4 uses `error`, not `required_error`).
- ForgotPinForm: DOB calendar used removed v8 props (fromYear/toYear); react-day-picker is v10, so dropdown fell back to label. Now startMonth/endMonth/defaultMonth.
- Login email-required text: already overridden in LanguageProvider MERCHANT_LABEL_OVERRIDES; live portal needs rebuild/deploy.
- Issue 8 cont.: temp PIN login went straight to dashboard. Dashboard layout (pages/dashboard/layout.jsx) now calls getUserProfile; if data.forceChangePassword == 1 it shows Create PIN screen (reuses ChangePinView with onSuccess prop) before dashboard. ChangePinView also rejects new PIN == old PIN. Mirrors old-merchant-portal functions.js getUserProfile_response.
- Skipped on purpose: "no OTP email / resend OTP" issue (backend emails new PIN directly; unresolved, ask backend if forgot-PIN should send OTP).
- EnrollForm: validation mode onTouched; Store Name min 5 chars (old app rule, msg "Store Name length should be at least 5 characters"); other rules already matched old validateForm.
- EnrollForm: apiError (already-registered / OTP errors) now cleared by goToStep() on Cancel/Back, on any field change, and on OTP input change.
- EnrollForm: draft restored only when returning from T&C (sessionStorage flag enroll_restore_draft); Login->Enroll opens empty. Old-app keys used: term_cond, account_already, buttonBack, registeration_successful.
- Pushed to origin/mahbub (main merged in, no conflicts). docs/language-keys-to-add.md = server langpack keys to add (nl/fr/es).
- Open QA item: empty Country Code list on UAT. Cause = UAT /welcome metaData.COUNTRYCODE missing/empty (old app same behaviour). Needs backend check; optional frontend: error+Retry on /welcome failure. "No email on resend OTP" = backend.
- Enroll resend OTP: old app uses /resendMerchantOTP (empty body, session-based); added resendMerchantOTP in endpoints.js, EnrollForm uses it (login keeps resendOTP). Tested on localhost: register, resendMerchantOTP, verifyMerchantOTP all statusCode 0.
- Enroll-link email issues = BACKEND, not this repo: link is core1.moadbusglobal.com/walletmc/merchant-enroll/index.html?token= (empty token). That static page (docs upload form, Store Name blank, "Login Failed" on submit) is hosted by backend; not in src or old-merchant-portal. Root cause = empty token in email template.
- Open: register sends challenge:[] (old app sent 3 security Q/A); confirm with backend.
- i18n: src/lib/localTranslations.js (nl/fr/es, non-English only) used in LanguageProvider t(): overrides -> server -> local -> code fallback. Wrapped static pre-login text in t(): Uptime/Processed, copyright, contact page labels, theme aria-label. Login OTP modal title key -> otp.confirmation.
- Left as-is: example placeholders (merchant@example.com), date hint mm/dd/yyyy.

## Notes
- Unverified: flag name/location in new backend getUserProfile response; check in browser network tab.
- eslint broken locally (eslint-config-next missing); not run.
- Nothing browser-tested. Nothing committed.
- One-time kit project setup (prettier/vitest, CLAUDE.md marker) skipped on purpose.

## Next
- Commit + deploy; QA re-test the 4 items.
- Check GlobalDatePicker (other pages) uses startMonth/endMonth correctly (it does).
