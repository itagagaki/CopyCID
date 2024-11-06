( () => {

  let cid = '';
  let cidButtonBox = null;
  let alertBox = null;
  let alertTimer = null;
  let tooltipTransitionClass = null;
  let observer = null;

  const removeAlertBox = () => {
    if (alertBox) {
      document.body.removeChild(alertBox);
      alertBox = null;
    }
  };

  const alertCopied = () => {
    if (typeof alertTimer === 'number') {
      clearTimeout(alertTimer);
      alertTimer = null;
      removeAlertBox();
    }
    const text = document.createElement('span');
    text.innerHTML = chrome.i18n.getMessage('copied');
    text.style.fontSize = '13px';
    alertBox = document.createElement('div');
    alertBox.style.display = 'flex';
    alertBox.style.justifyContent = 'center';
    alertBox.style.alignItems = 'center';
    alertBox.style.backgroundColor = 'black';
    alertBox.style.color = 'white';
    alertBox.style.position = 'fixed';
    alertBox.style.borderRadius = '3px';
    if (cidButtonBox) {
      const bounds = cidButtonBox.getBoundingClientRect();
      alertBox.style.top = bounds.top + 'px';
      alertBox.style.left = bounds.right + 10 + 'px';
      alertBox.style.height = bounds.height + 'px';
      alertBox.style.width = '250px';
    }
    alertBox.appendChild(text);
    document.body.appendChild(alertBox);
    alertTimer = setTimeout(removeAlertBox, 1000);
  };

  const copyCID = () => {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.left = '-100%';
    textarea.value = cid;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alertCopied();
  };

  const copyCIDasHTML = () => {
    const textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.left = '-100%';
    const urlobj = new URL(document.location.href);
    const hostname = /\bgoogle\./.exec(urlobj.hostname) ? urlobj.hostname : 'www.google.com';
    textarea.value = 'https://'+hostname+'/maps?cid='+cid;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alertCopied();
  };

  const mouseEnter = (e) => {
    const tooltip = document.querySelector('.goog-tooltip');
    if (tooltip) {
      tooltip.innerHTML = e.target.getAttribute('data-tooltip');
      const bounds = e.target.getBoundingClientRect();
      tooltip.style.top = (bounds.top + bounds.bottom) / 2 + 20 + 'px';
      tooltip.style.left = bounds.left + 10 + 'px';
      tooltip.style.visibility = 'visible';
      if (tooltipTransitionClass) {
        tooltip.classList.remove(tooltipTransitionClass);
      }
      tooltip.dispatchEvent(new MouseEvent("mouseover"));
    }
  };

  const mouseLeave = (e) => {
    const tooltip = document.querySelector('.goog-tooltip');
    if (tooltip) {
      tooltip.style.visibility = 'hidden';
      if (tooltipTransitionClass) {
        tooltip.classList.add(tooltipTransitionClass);
      }
      tooltip.dispatchEvent(new MouseEvent("mouseout"));
    }
  };

  const build = () => {

    // Detect CID
    let matches = document.location.href.match(/[\?\&]cid=(\d+)/);
    if (matches && matches[1]) {
      cid = matches[1];
    } else {
      matches = [...document.location.href.matchAll(/!3m\d+!1s(?:0x[0-9A-Fa-f]+):(0x[0-9A-Fa-f]+)/g)];
      const hexcid = matches[matches.length - 1];
      if (hexcid && hexcid[1]) {
        cid = BigInt(hexcid[1]).toString(10);
      } else {
        return;
      }
    }

    // Find name of class for tooltip transition.
    if (!tooltipTransitionClass) {
      const tooltip = document.querySelector('.goog-tooltip');
      if (tooltip) {
        const cl = tooltip.classList;
        if (cl && cl.length >= 3) {
          tooltipTransitionClass = cl.item(2);
        }
      }
    }

    // Want to add a 'CID' button above the 'Your Maps activity' button.
    // CID button should have the same appearance and behavior as the phone number and plus code,
    // but the class name for this may be obfuscated, so let's duplicate the dynamically appearing DOM.
    // The reason for duplicating the DOM for addresses is that phone number or plus code may not be present.
    const addressButton = document.body.querySelector('button[data-item-id="address"]');
    const addressBox = addressButton?.parentNode;
    const placeInfoDiv = addressBox?.parentNode;
    const historyButton = placeInfoDiv?.querySelector('button[data-item-id="history"]');
    const historyBox = historyButton?.parentNode;
    if (!historyBox) {
      return;
    }
    // If the CID button has already been added, then do nothing.
    if (placeInfoDiv.querySelector('#cidbox')) {
      return;
    }
    // Build CID button.
    cidButtonBox = addressBox.cloneNode(true);
    cidButtonBox.setAttribute('id', 'cidbox');

    const cidButton = cidButtonBox.querySelector('button:first-of-type');
    cidButton.removeAttribute('jsaction');
    cidButton.removeAttribute('jslog');
    cidButton.removeAttribute('aria-label');
    cidButton.removeAttribute('data-item-id');
    cidButton.setAttribute('data-tooltip', chrome.i18n.getMessage('copy_CID'));
    cidButton.onclick = copyCID;
    cidButton.addEventListener('mouseenter', mouseEnter);
    cidButton.addEventListener('mouseleave', mouseLeave);

    const cidButtonIcon = cidButton.querySelector('div:first-of-type > div:nth-of-type(1) > span:first-of-type');
    cidButtonIcon.innerHTML = 'CID';
    cidButtonIcon.setAttribute('style', 'font-family: roboto; font-size: 15px; font-weight: bold; line-height: 24px; width: 24px; text-align: center;');

    const cidButtonText = cidButton.querySelector('div:first-of-type > div:nth-of-type(2) > div:first-of-type');
    cidButtonText.innerHTML = cid;
    cidButtonText.setAttribute('style', 'line-height: 24px;');

    // Add more sub-buttons.
    const subbuttonsContainer = cidButton.nextSibling?.firstChild;
    if (subbuttonsContainer) {
      // For the first sub-button, assume it is a copy button and reuse it.
      const button1Container = subbuttonsContainer.firstChild;
      const button1 = button1Container?.firstChild;
      if (button1) {
        button1.setAttribute('jsaction', 'focus:pane.focusTooltip;blur:pane.blurTooltip');
        button1.removeAttribute('jsaction');
        button1.removeAttribute('jslog');
        button1.removeAttribute('aria-label');
        button1.removeAttribute('data-item-id');
        button1.removeAttribute('data-value');
        button1.setAttribute('data-tooltip', chrome.i18n.getMessage('copy_CID'));
        button1.onclick = copyCID;
        button1.addEventListener('mouseenter', mouseEnter);
        button1.addEventListener('mouseleave', mouseLeave);
      }
      // Remove the second and subsequent ones.
      let bc = button1Container;
      while ((bc = bc.nextSibling) != null) {
        subbuttonsContainer.removeChild(bc);
      }
      // Add 'Copy as HTML code' button.
      const button2Container = button1Container.cloneNode(true);
      const button2 = button2Container?.firstChild;
      if (button2) {
        const button2Icon = button2.firstChild?.querySelector('span:first-of-type');
        if (button2Icon) {
          button2Icon.innerHTML = 'URL';
          button2Icon.setAttribute('style', 'font-size: 10px; line-height: 18px; width: 18px; height: 18px;');
        }
        button2.setAttribute('data-tooltip', chrome.i18n.getMessage('copy_URL'));
        button2.onclick = copyCIDasHTML;
        button2.addEventListener('mouseenter', mouseEnter);
        button2.addEventListener('mouseleave', mouseLeave);
      }
      subbuttonsContainer.insertBefore(button2Container, null);
    }

    // Add the CID button to the page.
    placeInfoDiv.insertBefore(cidButtonBox, historyBox);
  };

  /*
   *  Start.
   */
  window.onload = () => {
    observer = new MutationObserver(build);
    observer.observe(document.body, { childList: true, subtree: true });
  };

  /*
   *  Clean up and stop working if this extension is disabled or deleted.
   */
  const onDisabled = () => {
    observer?.disconnect();
    const cidbox = document.body.querySelector('#cidbox');
    cidbox?.parentNode?.removeChild(cidbox);
  }

  let pingTimer;
  const validityChecker = () => {
    if (chrome.runtime?.id) {
      return;
    }
    clearInterval(pingTimer);
    onDisabled();
  };
  pingTimer = setInterval(validityChecker, 1500);
})();
