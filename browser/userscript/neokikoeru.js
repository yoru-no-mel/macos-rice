// ==UserScript==
// @name         Neokikoeru Download Button
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Vibecoded script for neokikoeru
// @author       Yoru Melancholia
// @match        http://*:5233/*
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        buttonClass: 'download-btn',
        insertPosition: 'append'
    };

    function createDownloadButton(fileUrl, fileName) {
        const btn = document.createElement('button');
        btn.className = CONFIG.buttonClass;
        btn.innerHTML = '⬇️ Download';
        btn.title = `Download ${fileName}`;

        btn.style.cssText = `
            margin-left: 8px;
            padding: 4px 12px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.3s;
        `;

        btn.addEventListener('mouseenter', () => {
            btn.style.background = '#45a049';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = '#4CAF50';
        });

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            downloadFile(fileUrl, fileName);
        });

        return btn;
    }

    function downloadFile(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || '';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function addDownloadButtons() {
        const fileRows = document.querySelector('div.q-list--separator.q-list--dark.scroll').childNodes ?? [];

        fileRows.forEach(row => {
            if (row.data == "") {
                return
            }

            const [name, size] = row.innerText.trim().split('\n');

            if (!size || size.trim() === "") {
                return
            }

            const url = new URL(row.baseURI);
            const folderKey = url.searchParams.get("folder_key");
            const decodedFolderKey = decodeURIComponent(folderKey)+"/"+name;
            const token = unsafeWindow.localStorage.getItem("auth.token").trim().split('|')[1];

            if (row.querySelector(`.${CONFIG.buttonClass}`)) return;
            const baseUrl = window.location.origin;

            const fileUrl = baseUrl+"/api/v1/fs/download?storage_id=1&file_key="+decodedFolderKey+"&token="+token;

            const btn = createDownloadButton(fileUrl, name);

            switch(CONFIG.insertPosition) {
                case 'before':
                    row.insertBefore(btn, row.firstChild);
                    break;
                case 'after':
                    row.parentNode.insertBefore(btn, row.nextSibling);
                    break;
                case 'prepend':
                    row.insertBefore(btn, row.firstChild);
                    break;
                case 'append':
                default:
                    row.appendChild(btn);
                    break;
            }
        });
    }


    const observer = new MutationObserver(() => {
        addDownloadButtons();
    });

    function init() {
        console.log('start');
        addDownloadButtons();

        const container = document.body;
        observer.observe(container, {
            childList: true,
            subtree: true
        });
    }

    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(addDownloadButtons, 500);
        }
    }).observe(document, { subtree: true, childList: true });

})();