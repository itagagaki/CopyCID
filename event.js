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
    title: 'URL',
    id: 'CopyCID_URL',
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
  let hexcid = /!3m\d+!1s(?:0x[0-9A-Fa-f]+):(0x[0-9A-Fa-f]+)!8m2/.exec(url);
  if (!hexcid || !hexcid[1]) {
    alert(chrome.i18n.getMessage('no_CID'));
  } else {
    const deccid = BigInt(hexcid[1]).toString(10);
    const urlobj = new URL(url);
    let hostname = /\bgoogle\./.exec(urlobj.hostname) ? urlobj.hostname : 'www.google.com';
    let textarea = document.createElement('textarea');
    textarea.style.position = 'fixed';
    textarea.style.left = '-100%';
    switch (id) {
    case 'CopyCID_URL':
      textarea.value = 'https://'+hostname+'/maps?cid='+deccid;
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
