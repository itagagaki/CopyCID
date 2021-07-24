chrome.runtime.onInstalled.addListener(()=>{
  const parent_menu = chrome.contextMenus.create({
    documentUrlPatterns: [
      '*://*/maps/*'
    ],
    title: chrome.i18n.getMessage('name'),
    id: 'CopyCID'
  });
  chrome.contextMenus.create({
    parentId: parent_menu,
    title: 'CID',
    id: 'CopyCID_CID'
  });
  chrome.contextMenus.create({
    parentId: parent_menu,
    title: 'URL (google.com)',
    id: 'CopyCID_URL_com'
  });
  chrome.contextMenus.create({
    parentId: parent_menu,
    title: 'URL (google.co.jp)',
    id: 'CopyCID_URL_co_jp'
  });
});

chrome.contextMenus.onClicked.addListener(item => {
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, tabs => {
    const url = tabs[0].url;
    const hexcid = /:(0x[\da-fA-F]+)!/.exec(url)[1];
    const deccid = BigInt(hexcid).toString(10);
    let textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.left = '-100%';
    switch (item.menuItemId) {
    case 'CopyCID_URL_com':
      textarea.value = 'https://www.google.com/maps?cid='+deccid;
      break;
    case 'CopyCID_URL_co_jp':
      textarea.value = 'https://www.google.co.jp/maps?cid='+deccid;
      break;
    case 'CopyCID_CID':
    default:
      textarea.value = deccid;
      break;
    }
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  });
});
