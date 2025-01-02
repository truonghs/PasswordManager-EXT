const fieldMappings = {
  firstName: ['fname', 'firstName', 'first_name'],
  midName: ['midname', 'middleName'],
  lastName: ['lname', 'lastName', 'last_name'],
  fullName: ['name', 'fname', 'fullName'],
  postalCode: ['zipCode', 'code', 'postalcode', 'post_code_free'],
  phoneNumber: ['phone', 'phoneNumber'],
  street: ['street'],
  city: ['city', 'city_free'],
  country: ['country'],
  email: ['mail', 'email', 'email_address'],
  address: ['address', 'address_free']
}
const helperFunction = {
  createElement: (tag, id, styles, parent = null) => {
    const element = document.createElement(tag)
    if (id) element.id = id
    if (styles) element.style = styles
    if (parent) parent.appendChild(element)
    return element
  },
  handleIconPosition: (modalDiv, icon, passwordField) => {
    const rect = passwordField.getBoundingClientRect()
    const iconHeight = 22
    const top = rect.height / 2 - iconHeight / 2
    modalDiv.style.left = `${rect.left}px`
    modalDiv.style.top = `${rect.top + rect.height + window.scrollY}px`
    icon.style.top = `${top}px`
  },
  updateIframeDisplay: (id, translateY) => {
    const iframeForm = document.getElementById('go-pass-root').shadowRoot.getElementById(id)
    if (iframeForm) {
      iframeForm.style.transform = translateY
      return { status: 'success' }
    } else {
      return { status: 'error', message: 'Iframe not found' }
    }
  },
  updateHeight: (height) => {
    const goPassModalContainer = document
      .getElementById('go-pass-root')
      .shadowRoot.getElementById('go-pass-modal-container')
    if (goPassModalContainer) {
      goPassModalContainer.style.height = height
      return { status: 'success' }
    } else {
      return { status: 'error', message: 'goPassModalContainer not found' }
    }
  },
  sendRequestConfirmSaveAccount: (credential, password, isReload) => {
    setTimeout(() => {
      chrome.runtime.sendMessage({
        action: 'formSubmit',
        credential: credential,
        password: password,
        isReload: isReload
      })
    }, 2500)
  },
  fillAccountToInputFields: (request) => {
    const { username, password } = request

    const credentialField = document.querySelector('[field-temp-label="credential"]')
    const passwordField = document.querySelector('[field-temp-label="password"]')

    if (credentialField && passwordField) {
      credentialField.value = username
      passwordField.value = password

      const inputEvent = new Event('input', { bubbles: true })
      credentialField.dispatchEvent(inputEvent)
      passwordField.dispatchEvent(inputEvent)
    }
  },
  fillContactInfo: (request) => {
    const { contactInfo } = request
    const inputFields = document.querySelectorAll(
      'input:not([type="password"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"])'
    )
    if (!inputFields.length) return

    inputFields.forEach((inputField) => {
      const inputName = inputField.getAttribute('name')
      if (!inputName) return
      Object.keys(fieldMappings).forEach((key) => {
        if (contactInfo[key] && fieldMappings[key].includes(inputName)) {
          inputField.value = contactInfo[key]
          const inputEvent = new Event('input', { bubbles: true })
          inputField.dispatchEvent(inputEvent)
        }
      })
    })
  },
  fillPassword: (request) => {
    const { password } = request
    document.querySelectorAll('[field-temp-label="password"]').forEach((passwordField) => {
      if (passwordField) {
        passwordField.value = password
        const inputEvent = new Event('input', { bubbles: true })
        passwordField.dispatchEvent(inputEvent)
      }
    })
  },
  checkCurrentSubmitFormInDom: (request) => {
    setTimeout(() => {
      const submitForm = document.querySelector('[field-temp-label="submitForm"]')
      if (!submitForm) {
        const iframeFormSaveAccount = document
          .getElementById('go-pass-root')
          .shadowRoot.getElementById('go-pass-form-save-account')
        if (iframeFormSaveAccount) {
          iframeFormSaveAccount.style.transform = 'translateY(0px)'
        }
      }
    }, 2500)
  },
  getTabId: () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          resolve(tabs[0].id)
        } else {
          reject('No active tab found')
        }
      })
    })
  }
}
const actions = {
  showFormCreateAccountIframe: (request) =>
    helperFunction.updateIframeDisplay('go-pass-form-save-account', 'translateY(0px)'),
  closeFormCreateAccountIframe: (request) =>
    helperFunction.updateIframeDisplay('go-pass-form-save-account', 'translateY(-1100px)'),

  openFormCreateContactInfo: (request) =>
    helperFunction.updateIframeDisplay('go-pass-form-save-contact-info', 'translateY(0px)'),
  closeFormCreateContactInfo: (request) =>
    helperFunction.updateIframeDisplay('go-pass-form-save-contact-info', 'translateY(-1500px)'),

  updateHeight: (request) => helperFunction.updateHeight(request.height),
  fillForm: (request) => helperFunction.fillAccountToInputFields(request),
  fillPassword: (request) => helperFunction.fillPassword(request),
  fillContactInfo: (request) => helperFunction.fillContactInfo(request),
  checkCurrentSubmitFormInDom: (request) => helperFunction.checkCurrentSubmitFormInDom(request),
  syncLoginToWeb: (request) => {
    console.log('request', request)
    window.postMessage(request, window.location.origin)
  }
}

const initDomTree = (modalDiv, modalIframe) => {
  const goPassIconRoot = helperFunction.createElement(
    'div',
    'go-pass-icon-root',
    `
      position: relative !important; height: 0px !important; width: 0px !important; float: right !important;
    `
  )

  const goPassIconRootShadow = goPassIconRoot.attachShadow({ mode: 'open' })

  const icon = helperFunction.createElement(
    'img',
    null,
    `
      position: absolute; cursor: pointer; height: 22px; width: 22px; z-index: auto;
    `,
    goPassIconRootShadow
  )
  icon.src = chrome.runtime.getURL('icons/icon48.png')
  icon.style.left = '-40px'
  icon.addEventListener('click', () => {
    chrome.storage.local.get('accessToken', (result) => {
      if (result.accessToken) {
        modalDiv.style.display = modalDiv.style.display === 'none' || modalDiv.style.display === '' ? 'block' : 'none'
        if (modalDiv.style.display === 'block') {
          const handleClickOutside = (event) => {
            if (!modalDiv.contains(event.target) && event.target !== icon) {
              modalDiv.style.display = 'none'
              window.removeEventListener('click', handleClickOutside)
            }
          }
          window.addEventListener('click', handleClickOutside)
        }
      } else {
        chrome.runtime.sendMessage({ action: 'openPopup' })
      }
    })
  })

  const passwordFields = this.document.querySelectorAll('input[type="password"]')
  if (passwordFields.length > 0) {
    const firstPasswordField = passwordFields[0]
    if (passwordFields.length > 1) {
      passwordFields[1].setAttribute('field-temp-label', 'password')
    }
    if (firstPasswordField) {
      const formField = firstPasswordField.closest('form')

      if (formField) {
        formField.setAttribute('field-temp-label', 'submitForm')
        const inputFields = formField.querySelectorAll(
          'input:not([type="password"]):not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="submit"])'
        )
        let credentialField = inputFields[inputFields.length - 1]
        if (inputFields?.length > 2) {
          credentialField = inputFields[1]
        }
        if (credentialField) {
          credentialField.setAttribute('field-temp-label', 'credential')
        }
        firstPasswordField.setAttribute('field-temp-label', 'password')

        formField.addEventListener('submit', (e) => {
          if (credentialField?.value && firstPasswordField?.value) {
            helperFunction.sendRequestConfirmSaveAccount(credentialField.value, firstPasswordField.value, false)

            const authData = {
              credential: credentialField.value,
              password: firstPasswordField.value
            }
            this.chrome.storage.local.set({ authData: authData })
          }
        })
      }
      const parentNode = firstPasswordField.parentElement
      parentNode.insertBefore(goPassIconRoot, firstPasswordField.nextSibling)

      helperFunction.handleIconPosition(modalDiv, icon, firstPasswordField)
      window.addEventListener('resize', () => helperFunction.handleIconPosition(modalDiv, icon, firstPasswordField))
    }

    modalIframe.src = chrome.runtime.getURL('index.html#/webclient-infield')
  } else {
    let inputFields = Array.from(
      document.querySelectorAll(
        'input[type]:not([type="hidden"], [type="checkbox"], [type="radio"], [type="submit"], [type="image"], [type="file"], [type="search"])'
      )
    )

    inputFields = inputFields.filter((inputField) => inputField.hasAttribute('name'))

    if (inputFields.length >= 2) {
      const firstField = inputFields[0]
      const parentNode = firstField.parentElement
      parentNode.insertBefore(goPassIconRoot, firstField.nextSibling)
      helperFunction.handleIconPosition(modalDiv, icon, firstField)
      window.addEventListener('resize', () => helperFunction.handleIconPosition(modalDiv, icon, firstField))
    }

    modalIframe.src = chrome.runtime.getURL('index.html#/webclient-infield-contact')
  }
}

window.addEventListener('load', async function () {
  const goPassRoot = helperFunction.createElement(
    'div',
    'go-pass-root',
    `
    position: absolute !important;
    top: 0px !important;
    left: 0px !important;
    height: 0px !important;
    width: 0px !important;
  `,
    document.body
  )
  const goPassShadowRoot = goPassRoot.attachShadow({ mode: 'open' })

  const modalDiv = helperFunction.createElement(
    'div',
    'go-pass-modal-container',
    `
    position: absolute;
    display: none;
    width: 100vw;
    height: 387px;
    max-height: 400px;
    z-index: 2147483647;
    border-radius: 4px;
    max-width: 280px;
    background: radial-gradient(circle at 146.297px 0%, rgb(251, 235, 235) 1.47%, rgb(249, 250, 251) 20.77%);
    border: 1px solid rgb(213, 217, 222);
    box-shadow: rgba(29, 48, 73, 0.08) 0px 2px 4px, rgba(29, 48, 73, 0.08) 0px 2px 4px, rgba(29, 48, 73, 0.04) 0px 4px 8px;
  `,
    goPassShadowRoot
  )

  const modalIframe = helperFunction.createElement(
    'iframe',
    'go-pass-modal-option',
    `
    border: none;
    height: 100%;
    width: 100%;
  `,
    modalDiv
  )
  modalIframe.allow = 'clipboard-write'

  const formSaveAccount = helperFunction.createElement(
    'iframe',
    'go-pass-form-save-account',
    `
    position: fixed;
    top: 0px;
    right: 0px;
    z-index: 2147483647;
    border: none;
    height: 100vh;
    width: 100vw;
    max-height: 500px;
    max-width: 430px;
    transform: translateY(-1100px);
    transition: transform 800ms cubic-bezier(0.99, 1.2, 0.8, 1);
  `,
    goPassShadowRoot
  )
  formSaveAccount.src = chrome.runtime.getURL('index.html#/create-account')

  const formSaveContactInfo = helperFunction.createElement(
    'iframe',
    'go-pass-form-save-contact-info',
    `
    position: fixed;
    top: 0px;
    right: 0px;
    z-index: 2147483647;
    border: none;
    height: 100vh;
    width: 100vw;
    max-width: 435px;
    transform: translateY(-1500px);
    transition: transform 800ms cubic-bezier(0.99, 1.2, 0.8, 1);
  `,
    goPassShadowRoot
  )
  formSaveContactInfo.src = chrome.runtime.getURL('index.html#/create-contactinfo')

  initDomTree(modalDiv, modalIframe)
  const response = await this.chrome.storage.local.get('authData')
  if (response && response?.authData) {
    const { credential, password } = response.authData

    if (credential && password) {
      const submitForm = document.querySelector('[field-temp-label="submitForm"]')
      if (!submitForm) {
        helperFunction.sendRequestConfirmSaveAccount(credential, password, true)
      }
    }
    this.chrome.storage.local.remove('authData')
  }
})
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const actionHandler =
    actions[message.action] ||
    (() => {
      const goPassModalContainer = document
        .getElementById('go-pass-root')
        .shadowRoot.getElementById('go-pass-modal-container')
      if (goPassModalContainer) goPassModalContainer.style.display = 'none'
    })
  sendResponse(actionHandler(message))
  return true
})

const observer = new MutationObserver(async (mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' || mutation.type === 'subtree') {
      const goPassRoot = document.getElementById('go-pass-root')
      const goPassIconRoot = document.getElementById('go-pass-icon-root')

      try {
        if (goPassRoot && goPassRoot.shadowRoot && !goPassIconRoot) {
          const modalDiv = goPassRoot.shadowRoot.getElementById('go-pass-modal-container')
          const modalIframe = modalDiv.querySelector('iframe')
          initDomTree(modalDiv, modalIframe)
        }
      } catch (error) {
        if (error.message.includes('Extension context invalidated')) {
          observer.disconnect()
          setTimeout(() => observer.observe(targetNode, observerConfig), 1000)
        }
      }
    }
  }
})

const observerConfig = { childList: true, subtree: true }
const targetNode = document.body
observer.observe(targetNode, observerConfig)
