const actions = {
  openPopup: ({ tabs, sendResponse, request }) => {
    chrome.action.openPopup()
    sendResponse({ status: 'success' })
  },
  openForm: ({ tabs, sendResponse, request }) => {
    chrome.tabs.sendMessage(tabs[0]?.id, { action: 'showFormCreateAccountIframe' }, () => {
      sendResponse({ status: 'success' })
    })
  },
  closeForm: ({ tabs, sendResponse, request }) => {
    chrome.tabs.sendMessage(tabs[0]?.id, { action: 'closeFormCreateAccountIframe' }, () => {
      sendResponse({ status: 'success' })
    })
  },

  openFormCreateContactInfo: ({ tabs, sendResponse, request }) => {
    chrome.tabs.sendMessage(tabs[0]?.id, { action: 'openFormCreateContactInfo' }, () => {
      sendResponse({ status: 'success' })
    })
  },

  closeFormCreateContactInfo: ({ tabs, sendResponse, request }) => {
    chrome.tabs.sendMessage(tabs[0]?.id, { action: 'closeFormCreateContactInfo' }, () => {
      sendResponse({ status: 'success' })
    })
  },
  updateHeight: ({ tabs, sendResponse, request }) => {
    chrome.tabs.sendMessage(tabs[0]?.id, { action: 'updateHeight', height: request.height }, () => {
      sendResponse({ status: 'success' })
    })
  },
  fillForm: ({ tabs, sendResponse, request }) => {
    const { username, password } = request
    chrome.tabs.sendMessage(tabs[0]?.id, { action: 'fillForm', username, password }, () => {
      sendResponse({ status: 'success' })
    })
  },
  fillContactInfo: ({ tabs, sendResponse, request }) => {
    const { contactInfo } = request
    chrome.tabs.sendMessage(tabs[0]?.id, { action: 'fillContactInfo', contactInfo }, () => {
      sendResponse({ status: 'success' })
    })
  },
  fillPassword: ({ tabs, sendResponse, request }) => {
    const { password } = request
    chrome.tabs.sendMessage(tabs[0]?.id, { action: 'fillPassword', password }, () => {
      sendResponse({ status: 'success' })
    })
  },
  getCurrentTabUrl: ({ tabs, sendResponse, request }) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0]
      sendResponse({ url: currentTab?.url })
    })
  },
  formSubmit: ({ tabs, sendResponse, request }) => {
    console.log('background form submit')
  },
  checkCurrentSubmitFormInDom: ({ tabs, sendResponse, request }) => {
    chrome.tabs.sendMessage(tabs[0]?.id, { action: 'checkCurrentSubmitFormInDom' }, () => {
      sendResponse({ status: 'success' })
    })
  },
  syncLoginToWeb: ({ tab, sendResponse, request }) => {
    chrome.tabs.query({}, (tabs) => {
      const targetTab = tabs.find((tab) => {
        return tab.url.includes(request.targetUrl)
      })

      if (targetTab) {
        chrome.tabs.sendMessage(targetTab.id, request)
      } else {
        chrome.tabs.create({ url: request.targetUrl }, (newTab) => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === newTab.id && info.status === 'complete') {
              chrome.tabs.sendMessage(newTab.id, request)
              chrome.tabs.onUpdated.removeListener(listener)
            }
          })
        })
      }
    })
  },
  solveCaptcha: ({ tabs, sendResponse, request }) => {},
  getResponseSolveCaptcha: async ({ tabs, sendResponse, request, sender }) => {
    if (tabs[0].url.includes(request.pageUrl)) {
      try {
        const response = await fetch(
          `https://gopass.live/api/captcha?pageurl=${request.pageUrl}&googlekey=${request.siteKey}`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          }
        )
        const result = await response.json()
        sendResponse({ success: true, result })
      } catch (error) {
        console.error('Lỗi khi gửi yêu cầu giải quyết CAPTCHA:', error)
        sendResponse({ success: false, error })
      }
    }
  }
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const actionHandler = actions[request.action]
    actionHandler({ tabs, sendResponse, request, sender })
  })

  return true
})
