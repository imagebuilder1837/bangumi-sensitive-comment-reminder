// ==UserScript==
// @name         Bangumi 简评敏感词提醒
// @namespace    bangumi-sensitive-comment-reminder
// @version      0.1.1
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
    "HhxLI8CkHJRvCkVY.GYy1wkQxeVc9AVdmzkzQ8EGrGEbB0dPz+ZDsRY2bJjscsVRqEvCAoTs3dt0EBHRUWMhov/4zX6bz5vxdJEvyqqYmQnlcs0f7hU+2FaPa7tUiJXUjCTh8mYDXh0NaPzFuaOXZaaN2RmlEotXg+GCPxs6NN7sVftChG/PuhzmZznzG3LZZ8ip2bBkP5ETHJwRperkSERALXWouWAhrRfpJb7ExTuZRHbTqouP+gaEI+0YWXqo6nlJOVTkq01JkqOjb1K/glGIAaYlxPu5mH9lv0KOcz2gv8f3ZtI3uzv5G5oYwDUpYGrrrWpnb5iTSRSyFiyEOgOmmKRSHmEwy2pDBkgcGRt4AM3qdsX/uQf7NBHor3PPCkLAX9or3FEAmIqYTSx7ZEq4iARpMcnDi0op3QO8QlF6tS+QFB5Waq+c/s+hLzezTbdYcCSyGKShHqqTsCk9rZWOAQlEWfsowgXUiN0IxItdOyYo2EeSLIRR65wDFrQmLRh4+vUD2Qk/olJqkFYy93fHWc12V1/K3KH/SY23krtZaWHvwUhqXpO7IhD/27kgNtyq620a5l9IYLqrzbHg85bkJZLIKGxZcXBo9TZgojcxkqofMQ2ofZQ31sGw6ngtP5/Yo2Q0q1zx8Kgxr+UG/euGRl602dyII12UwJ999zPNNIwSWN54EAuKOjcO8HLbW8vo/roUCICxtyBG4O0tdNYjJ16uXE0WlQhhnoTJaCjSyt07pF4nC51dbljBIScMFfMXsJ92c8fewuny0v1qdgBF7GYnVIl1HXWIgc98eOvayzOQhk3npL1Uh6VYiFCOzK0zhZZ+RHJnQeiaumAp7Te99pseusXQR7ERwHanU5im2YqL/nbVQr3Q1mZ0lboa16LYHaIf96Ftuksu5RWAXfX7/nhkxC5SSLq9oPwakLEA3UrUDAIu8Bf62XRv3GFjQddZQ6i8+nCkaFdNZ/30LtMb2Z+s+tqXrLTkd6ifqzxd5l2jhMJC9kKWiNQT0HR+EPGRdlnBTfUEoQw+Kn2JNnQ5QThkGKXR4iB2rxTsu9JbnX8NSiESmSvYu+k/MQsDrXEzQHmhhoodm/enbxaDXjc5bI6d420R96cfa4jeaO98E/kcUMXA/z5M3EY7tfrYauYp4fr6QGQcWUnHYw967X2wCeFvxWqn32Q7ymWW0loAFOpS5tl8g4CKU17rTHLAVUls71+Mq1LIcLSCFddbeko44Z912y1rLcWyTFNMUe+F2TgvrohgUb79gXwydEk4fejQU8BQdRNuSueumxw2RSgGt5jX/VD62J88e3BxWi/8OtbnSFVzsaCVac0sUzQEtwZUXifi7ybKR/TgRAjjzi0AjiFk3m79+qymTBBUMFZIzLDGaNnlPWeAPIqUbqW0T7F/YiiUU4LxtBAmA2nTSpwt9Vy+YtYcQbB+peJO3Zz8lci8fL5pCW33+25E+xgkXFaNZPmEmHWy3b+wJy1qQo6Z0zUDgDjOgCUy0pElu19yCClK/ddgZyMGEtSFNwrQhU8elGFkI+Tlk13cBZ5No7M/6eym1cRhT/P5K2GQzQfFrqDyDeJJLLOTkysyZzyZsoYsHgzO+5PbkYGulohANOinwR0b3IZnksFSd/PHCWi7c+T+c1AZR";

  const INFO_TEXT =
    "若简评中存在敏感词，保存后公开状态可能会被强制设置为「私密」。因官方词库会动态变化，结果不一定准确，仅供参考。";

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
