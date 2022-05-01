chrome.runtime.onInstalled.addListener(()=>{
  const parent_menu = chrome.contextMenus.create({
    documentUrlPatterns: ['*://*/maps/*'],
    title: chrome.i18n.getMessage('name'),
    id: 'CopyCID',
    contexts: ['all']
  });
  chrome.contextMenus.create({
    parentId: parent_menu,
    title: chrome.i18n.getMessage('only_CID'),
    id: 'CopyCID_CID',
    contexts: ['all']
  });
  chrome.contextMenus.create({
    parentId: parent_menu,
    title: 'URL (google.com)',
    id: 'CopyCID_URL_com',
    contexts: ['all']
  });
  chrome.contextMenus.create({
    parentId: parent_menu,
    title: 'URL (google.co.jp)',
    id: 'CopyCID_URL_co_jp',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info,tab)=>{
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: copyCID,
    args: [info.menuItemId, tab.url]
  });
});

function copyCID(id, url)
{
  let hexcid = /:(0x[\da-fA-F]+)!/.exec(url);
  if (!hexcid || !hexcid[1]) {
    alert(chrome.i18n.getMessage('no_CID'));
  } else {
    const deccid = BigInt(hexcid[1]).toString(10);
    let textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.left = '-100%';
    switch (id) {
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
  }
}
