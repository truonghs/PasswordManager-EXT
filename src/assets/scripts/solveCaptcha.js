chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'solveCaptcha') {
    const recaptchaIframe = document.querySelector('iframe[title="reCAPTCHA"]');

    if (recaptchaIframe) {
      const src = recaptchaIframe.getAttribute('src');
      const urlParams = new URLSearchParams(new URL(src).search);
      const siteKey = urlParams.get('k');
      if(siteKey) {
        chrome.runtime.sendMessage(
          {
            action: 'getResponseSolveCaptcha',
            pageUrl: window.location.href,
            siteKey,
          },
          (response) => {
            if (response.success) {
              const captchaInput = document.querySelector('[name="g-recaptcha-response"]');
              if (captchaInput) {
                captchaInput.value = response.result.data;
  
                const inputEvent = new Event('change', { bubbles: true });
                captchaInput.dispatchEvent(inputEvent);
  
                const submitForm = document.querySelector('[field-temp-label="submitForm"]');
                const submitButton = submitForm.querySelector('[type="submit"]');
                submitButton.disabled = false;
                submitButton.click();
  
                sendResponse({ status: 'success' });
              } else {
                console.error('Không tìm thấy captcha input');
                sendResponse({ status: 'error', message: 'Không tìm thấy captcha input' });
              }
            } else {
              console.error('Error:', response.error);
              sendResponse({ status: 'error', message: response.error });
            }
          }
        );
      }
    } else {
      console.error('Không tìm thấy phần tử reCAPTCHA.');
      sendResponse({ status: 'error', message: 'Không tìm thấy phần tử reCAPTCHA' });
    }
  } else {
    sendResponse({ status: 'error', message: 'Invalid action' });
  }

  return true;
});
