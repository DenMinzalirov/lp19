import {
  initAppAndGetActiveDomain,
  RegisterPlayer,
  getLinkToNavigate,
  LoginType,
} from 'apuesta-cloud-landing-utils'

const REDIRECTOR_ORIGIN = 'https://htzbtz.cc'
const REDIRECTOR_CAMPAIGN_ID = '686a47af'

const TEXTS = {
  registration: 'Registration',
  emailPlaceholder: 'Enter your email',
  passwordPlaceholder: 'Enter password',
  registerButton: 'Register',
  loading: 'Loading...',
  waiting: 'Waiting for data...',
  domainLoading: 'Loading domain data...',
  domainError: 'Error:',
  registrationError: 'Registration error. Please try again later.',
  domainNotLoaded: 'Domain data not loaded. Please try later.',
  registrationSuccess: 'Registration successful!',
  emailError: 'Enter a valid email',
  passwordError: 'Password must contain at least 6 characters',
  termsError: 'You must accept the terms of use',
}

function getApuestaLanguage() {
  return 'en'
}

function runRegistration() {
  const texts = TEXTS

  let domainData = null
  let domainError = null
  let isLoading = true

  const form = document.getElementById('regForm')
  const submitBtn = document.getElementById('registration-submit-btn')
  const submitErrorEl = document.getElementById('registration-submit-error')
  const emailInput = document.getElementById('reg-email')
  const emailErrorEl = document.getElementById('reg-email-error')
  const passwordInput = document.getElementById('passwordInput')
  const passwordErrorEl = document.getElementById('reg-password-error')
  const termsCheckbox = document.getElementById('reg-terms')
  const termsErrorEl = document.getElementById('reg-terms-error')
  const passwordToggle = document.getElementById('togglePassword')
  const currencySelect = document.getElementById('reg-currency')
  const signInLink = document.querySelector('.form-signin')

  function setSubmitButton(state) {
    if (!submitBtn) return
    if (state === 'loading') {
      submitBtn.disabled = true
      submitBtn.textContent = texts.loading
    } else if (state === 'waiting') {
      submitBtn.disabled = true
      submitBtn.textContent = texts.waiting
    } else if (domainData) {
      submitBtn.disabled = false
      submitBtn.textContent = texts.registerButton
    } else {
      submitBtn.disabled = true
      submitBtn.textContent = texts.domainLoading
    }
  }

  function showSubmitError(message) {
    if (submitErrorEl) {
      submitErrorEl.textContent = message || ''
    }
  }

  function clearFieldErrors() {
    if (emailErrorEl) emailErrorEl.textContent = ''
    if (passwordErrorEl) passwordErrorEl.textContent = ''
    if (termsErrorEl) termsErrorEl.textContent = ''
    showSubmitError('')
  }

  async function initDomain() {
    try {
      domainData = await initAppAndGetActiveDomain(
        REDIRECTOR_ORIGIN,
        REDIRECTOR_CAMPAIGN_ID,
      )
      domainError = null
      showSubmitError('')
    } catch (err) {
      domainData = null
      domainError = err instanceof Error ? err.message : String(err)
      showSubmitError(
        domainError ? `${texts.domainError} ${domainError}` : texts.domainError,
      )
    } finally {
      isLoading = false
      setSubmitButton(domainData ? 'ready' : 'waiting')
    }
  }

  function validateForm() {
    let valid = true
    const email = emailInput?.value?.trim() || ''
    const password = passwordInput?.value || ''
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (emailErrorEl) emailErrorEl.textContent = ''
    if (passwordErrorEl) passwordErrorEl.textContent = ''
    if (termsErrorEl) termsErrorEl.textContent = ''

    if (!emailRegex.test(email)) {
      if (emailErrorEl) emailErrorEl.textContent = texts.emailError
      valid = false
    }
    if (password.length < 6) {
      if (passwordErrorEl) passwordErrorEl.textContent = texts.passwordError
      valid = false
    }
    if (!termsCheckbox?.checked) {
      if (termsErrorEl) termsErrorEl.textContent = texts.termsError
      valid = false
    }
    return valid
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!domainData) {
      showSubmitError(texts.domainNotLoaded)
      return
    }
    if (!validateForm()) return

    setSubmitButton('loading')
    showSubmitError('')
    clearFieldErrors()

    const selectedCurrency =
      (currencySelect && currencySelect.value) || 'EUR'

    const registerData = {
      email: emailInput?.value?.trim() || '',
      phone: null,
      password: passwordInput?.value || '',
      currency: selectedCurrency,
      language: getApuestaLanguage(),
      promoCode: undefined,
      loginType: LoginType.Email,
      region: 'de',
    }

    try {
      const response = await RegisterPlayer(domainData.domain, registerData)
      const linkToNavigate = getLinkToNavigate({
        activeDomainData: domainData,
        refreshToken: response.refresh_token,
      })
      if (linkToNavigate) {
        localStorage.setItem('was-registered', 'true')
        window.location.href = linkToNavigate
      } else {
        alert(texts.registrationSuccess)
      }
    } catch (err) {
      if (domainData) {
        const errorLink = getLinkToNavigate({
          activeDomainData: domainData,
          isError: true,
        })
        if (errorLink) {
          window.location.href = errorLink
          return
        }
      }
      showSubmitError(texts.registrationError)
      setSubmitButton('ready')
    }
  }

  if (form) {
    form.addEventListener('submit', handleSubmit)
  }

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password'
      passwordInput.type = isPassword ? 'text' : 'password'
      passwordToggle.setAttribute(
        'aria-label',
        isPassword ? 'Hide password' : 'Show password',
      )
    })
  }

  if (signInLink && submitBtn && form) {
    signInLink.addEventListener('click', (e) => {
      e.preventDefault()
      submitBtn.click()
    })
  }

  setSubmitButton(isLoading ? 'loading' : domainData ? 'ready' : 'waiting')
  initDomain()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runRegistration)
} else {
  runRegistration()
}

