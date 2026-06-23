import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
} from './aem.js';

if (window.trustedTypes && window.trustedTypes.createPolicy) {

  const innerTT = window.trustedTypes.createPolicy('tt-inner', {
    // avoid stack overflow
    createHTML: (s) => s,
  });

  window.trustedTypes.createPolicy('default', {
    /**
     * All HTML creation goes through this function, so we can sanitize it for known attack vectors.
     * @param {string} input The HTML input string
     * @param {string} type The type of HTML being created
     * @param {string} sink The sink where the HTML will be used
     * @returns {undefined|string} The sanitized HTML string or undefined if the input is unsafe
     */
    createHTML: (input, type, sink) => {
      // DOMPurify or similar sanitization library may be implemented here if a harder policy is desired, with a tradeoff on performance.
      let processedInput = input;
      if (/srcdoc\s*=/i.test(processedInput)) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('[srcdoc]').forEach((el) => el.removeAttribute('srcdoc'));
        processedInput = doc.body.innerHTML;
      }

      if (sink.includes('createContextualFragment') || sink.includes('Document write')) {
        const doc = new DOMParser().parseFromString(innerTT.createHTML(processedInput), 'text/html');
        doc.querySelectorAll('script').forEach((el) => el.remove());
        processedInput = doc.body.innerHTML;
      }
      return processedInput;
    },

    /**
     * All script URL creation goes through this function, so we can sanitize it for known attack vectors.
     * @param {string} input The script URL input string
     * @returns {string} The sanitized script URL string
     */
    createScriptURL: (input) => {
      // a trusted origin allowlist approach may be implemented here if a harder policy is desired
      return input;
    },

    /**
     * All script creation goes through this function, so we can sanitize it for known attack vectors.
     * @param {string} input The script input string
     * @returns {string} The sanitized script string
     */
    createScript: (input) => {
      // Uncomment to block eval and script.text= assignments entirely (needs testing with your website code and martech stack):
      // throw new TypeError('Inline script execution blocked by policy');
      return input;
    },
  });
}

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildHeroBlock(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * TEMPORARY — Trusted Types test harness. DO NOT COMMIT / DO NOT SHIP.
 * Reads `?exploit=<payload>` and injects it UNSANITISED at the start of <main>
 * via innerHTML, so the default Trusted Types policy can be exercised with
 * prepared payloads. Remove before merging.
 * @param {Element} main The main element
 */
function injectExploitParam(main) {
  const payload = new URLSearchParams(window.location.search).get('exploit');
  if (!payload) return;
  const probe = document.createElement('div');
  probe.className = 'tt-exploit-probe';
  probe.innerHTML = payload;
  main.prepend(probe);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    injectExploitParam(main);
    decorateMain(main);
    document.body.classList.add('appear');
    await loadSection(main.querySelector('.section'), waitForFirstImage);
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();
