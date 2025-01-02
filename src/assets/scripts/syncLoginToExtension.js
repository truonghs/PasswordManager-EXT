window.addEventListener('message', async function (event) {
  if (event.origin !== window.location.origin || !event.data) return

  if (event.data.message === 'syncLoginToExtension') {
    const { userId } = event.data
    const response = await fetch(`https://gopass.live/api/auth/get-token/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const { accessToken } = await response.json()
    if (accessToken) {
      this.chrome.storage.local.set({ accessToken: accessToken })
      chrome.runtime.sendMessage({ action: 'openPopup' })
    }
  }
})
