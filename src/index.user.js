// ==UserScript==
// @name         Bangumi 简评敏感词提醒
// @namespace    https://github.com/imagebuilder1837/bangumi-sensitive-comment-reminder
// @version      0.1.2
// @description  撰写 Bangumi 条目简评时实时检测疑似敏感词并提醒
// @author       imagebuilder1837
// @match        https://bgm.tv/*
// @match        https://bangumi.tv/*
// @match        https://chii.in/*
// @run-at       document-end
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/imagebuilder1837/bangumi-sensitive-comment-reminder/refs/heads/main/src/index.user.js
// @updateURL    https://raw.githubusercontent.com/imagebuilder1837/bangumi-sensitive-comment-reminder/refs/heads/main/src/index.user.js
// ==/UserScript==

"use strict";

(async function () {
  const PASSPHRASE = "bangumi-sensitive-comment-reminder";

  const ENCRYPTED_WORDS =
    "Gs9N4xyrs5ZZetCf.TmYJlSWiEhoKMCP2LY+ZaO+fniFYMp5owu1TgM5Hfc/FW4wFmPwrJukg3jEN1kqD/sDYej8WQ/rfKiWnn3IzT2/fAAl5XuB1BTgWQDU8dbT37r8VWm83kcl/H+2V7kq/KAX5Hin3EC6K8Gola9h+WYA8BM4vdZ+r2BwbqELPUxKgxJkIxZ1y0Y7s5Ac5Q3mYescWtbsK3EEftKfoF7nTHFiUAccX85Xabvngo06uPs9pDM90VBWD6n2lmV40if7j7tN+vaOqu68SU3U8gOVD7Pf9lHY0BbmXiXXsLBht5C2p+sXg1r98LrboLLNVlWaWo3dRQdOavqMVkTzJsSbMhtsmGTX1EQJlUpg2vJ/hf5l+VFXh+UU4VaXA2xIErvghwxUYNR0X/c0u0ZT4qEPODEQYcuuGzOvnQZbgjC6D/VSYv2HaYB6MYO7eK0yOH7NHFcJigkrul7BkPyYR3kX34KhuDwlelf4hcgnDWN5j6XtQO+Zar3tH0DUGE6u3IfGQS/LXI2OkXlJhVOMm7YB81/rh90tlFUu9trbuGDixW/KhkqLRNvZ6mlWcB8w97hovxscVNr9NWfxZAG1HnkNkqKiM5Ez814SjQjEyIemlr7uWDCvZ3Uhv5QnjR9qk3YYsBIoBX1htZ9RGG1p3GwUZY+KeovKTNVJ8nxjbCfaa3iQhbcsu7wQHi1Bdysz8/ZDZ3mJAQdnSpK1gmBpCG5He5KchC+BJxJWC5qDOT7i/s4zS7fgHjCVQAWtMSLudMMk4ssD0nf/gzjx4cuEv5Dv87VpDBqt7XOxwwGgiiO5ty/3j9DjQtN8BdrPJQ0ybPuUxPBo8hOoMQm3Zzl+sVwsy000+Vx5t1lBXi196+J1tp/i33lhy+1rB8VGax1ZrXvE9XjI1ir75j4BoKo4gd/w17bhBfHZhJYgtk8f9Zz+0T/Gkbthqj4Htbgczuc8Du82PGygqKbww06P53XvbgBkswFFmxvvtEw+2RIIfdjxrQ0dX6NTgc0CPMDT5rUwdk5KbYPwCkzZpwsed7VbTSg/DS7JQaY1pX3JH13bApAiFsRdcAOHjxmePy2Wb68wAzGSzxo3yr830RwPbYxR47b8DS5MbbRDCDkeffgaafPm9bfpHiIYTJYCecphq4oEtrvsjzj3YV7SJ8EU4gTn9DSw6PtIdhDC+RS1sDRi5i9HNb5IJzc5ds12mTQMlLj5qqsbJbzuLdhEiVV9fn3EK/jXvZedmOsWJ/XACNnF+BZpaeBPjJMiipFFZZFPTZHUMtMscY2419XmwNgno48itYl65Xkq5ulK6HRZ+RK9F2KzANKn6DHleYIoMDBwx7lNAHzI0wSLlNtnZRJ/1eH6LhgUeCZPBKHOiB+gAX4KHA+LhwWtlXAstJ6Xmv6O6LhcgXiwRJF7fxl58lnJjyTFy1mFJ3Zm9Wwe1SXIuOPGvj3UWnBgs2Gcjf0KEbhzBwi2HwdKRGCbhyb5BC/gTS2ABg+16ca6oVp7Eqmh/8g2vaXQ8i8Ykcu+r8bI=";

  const INFO_TEXT =
    "若简评中存在敏感词，保存后公开状态可能会被强制设置为「私密」。因官方词库会动态变化，结果不一定准确，仅供参考";

  let SENSITIVE_WORDS = await decryptWords(ENCRYPTED_WORDS, PASSPHRASE);

  function detectSensitiveWords(input) {
    if (!input) return [];

    const result = [];
    for (const word of SENSITIVE_WORDS) {
      if (word && input.includes(word)) result.push(word);
    }
    return result;
  }

  function mount(dom = document) {
    const comment = dom.querySelector("#comment");
    if (!comment || comment.dataset.sensitiveReminderMounted) return;

    comment.dataset.sensitiveReminderMounted = "1";

    const wrapper = dom.createElement("div");
    wrapper.className = "bscr";
    wrapper.hidden = true;

    const head = dom.createElement("button");
    head.type = "button";
    head.className = "bscr-head";
    head.textContent = "敏感词 ⓘ";
    head.addEventListener("click", () => alert(INFO_TEXT));

    const list = dom.createElement("span");
    list.className = "bscr-list";

    wrapper.append(head, list);
    comment.insertAdjacentElement("afterend", wrapper);

    function render() {
      const words = detectSensitiveWords(comment.value);

      wrapper.hidden = words.length === 0;
      list.textContent = "";

      words.forEach((word) => {
        const item = dom.createElement("button");
        item.type = "button";
        item.className = "bscr-word";
        item.textContent = word;
        item.addEventListener("click", () => selectWord(comment, word));
        list.append(item);
      });
    }

    comment.addEventListener("input", render);
    render();
  }

  function selectWord(textarea, word) {
    const start = textarea.value.indexOf(word);
    if (start === -1) return;

    textarea.focus();
    textarea.setSelectionRange(start, start + word.length);

    setTimeout(() => {
      textarea.setSelectionRange(start + word.length, start + word.length);
    }, 120);
  }

  function observeThickbox() {
    new MutationObserver(() => {
      const iframe = document.querySelector("#TB_iframeContent");
      const body =
        iframe && iframe.contentDocument && iframe.contentDocument.body;
      if (body && body.querySelector("#comment")) mount(body);
    }).observe(document.body, { childList: true, subtree: true });
  }

  function bindThickboxEntrypoints() {
    document
      .querySelectorAll("a.thickbox, .progress_percent_text > a")
      .forEach((a) =>
        a.addEventListener("click", observeThickbox, { once: true }),
      );
  }

  function injectStyle() {
    const style = document.createElement("style");
    style.textContent = `
      .bscr {
        margin: 6px 0 0;
        font-size: 12px;
        line-height: 1.8;
      }

      .bscr-head,
      .bscr-word {
        border: 0;
        padding: 0;
        background: transparent;
        font: inherit;
        cursor: pointer;
      }

      .bscr-head {
        margin-right: 8px;
        color: #888;
      }

      .bscr-word {
        margin-right: 8px;
        color: #f09199;
        font-weight: bold;
      }

      .bscr-word:hover {
        text-decoration: underline;
      }
    `;
    document.head.append(style);
  }

  async function decryptWords(payload, passphrase) {
    const [ivBase64, dataBase64] = payload.split(".");
    const key = await deriveKey(passphrase);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: base64ToBytes(ivBase64) },
      key,
      base64ToBytes(dataBase64),
    );

    return JSON.parse(new TextDecoder().decode(plain));
  }

  async function deriveKey(passphrase) {
    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(passphrase),
    );

    return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, [
      "decrypt",
    ]);
  }

  function base64ToBytes(base64) {
    return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  }

  injectStyle();
  mount(document);
  bindThickboxEntrypoints();
})();
