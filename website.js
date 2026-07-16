(() => {
  const cp1252 = new Map([
    [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84],
    [0x2026, 0x85], [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88],
    [0x2030, 0x89], [0x0160, 0x8a], [0x2039, 0x8b], [0x0152, 0x8c],
    [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92], [0x201c, 0x93],
    [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
    [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b],
    [0x0153, 0x9c], [0x017e, 0x9e], [0x0178, 0x9f]
  ]);
  const decoder = new TextDecoder('utf-8');
  const repairEncoding = (value) => {
    if (!/[ÂÃâ]/.test(value)) return value;
    const bytes = [];
    for (const char of value) {
      const code = char.codePointAt(0);
      if (cp1252.has(code)) bytes.push(cp1252.get(code));
      else if (code <= 255) bytes.push(code);
      else return value;
    }
    return decoder.decode(new Uint8Array(bytes));
  };
  const repairTree = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) node.nodeValue = repairEncoding(node.nodeValue);
  };
  document.title = repairEncoding(document.title);
  repairTree(document.body);
  new MutationObserver((records) => records.forEach((record) => {
    record.addedNodes.forEach((node) => repairTree(node));
  })).observe(document.body, { childList: true, subtree: true });

  const dialog = document.querySelector('#lightbox');
  if (!dialog) return;

  const fullImage = dialog.querySelector('img');
  const caption = dialog.querySelector('p');
  const closeButton = dialog.querySelector('.close');

  document.querySelectorAll('[data-full]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const preview = trigger.querySelector('img');
      fullImage.src = trigger.dataset.full;
      fullImage.alt = preview?.alt || 'CDL Mastery app screen';
      caption.textContent = preview?.alt || '';
      dialog.showModal();
    });
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });

  const signupForm = document.querySelector('.access form');
  signupForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = signupForm.querySelector('button');
    const input = signupForm.querySelector('input');
    if (!input.value.trim()) {
      input.focus();
      return;
    }
    button.textContent = 'You’re on the list';
    button.disabled = true;
    input.disabled = true;
  });
})();

const interactiveUi = document.createElement('script');
interactiveUi.src = '/interactive-ui.js';
document.body.appendChild(interactiveUi);

const footerLinks = document.querySelector('footer > div');
if (footerLinks && !footerLinks.querySelector('[href="/privacy.html"]')) {
  const privacyLink = document.createElement('a');
  privacyLink.href = '/privacy.html';
  privacyLink.textContent = 'Privacy Policy';
  footerLinks.appendChild(privacyLink);
}

const topNavigation = document.querySelector('.topbar nav');
if (topNavigation && !topNavigation.querySelector('[href="/blog/"]')) {
  const blogLink = document.createElement('a');
  blogLink.href = '/blog/';
  blogLink.textContent = 'Blog';
  topNavigation.appendChild(blogLink);
}

if (footerLinks && !footerLinks.querySelector('[href="/blog/"]')) {
  const blogLink = document.createElement('a');
  blogLink.href = '/blog/';
  blogLink.textContent = 'CDL Blog';
  footerLinks.appendChild(blogLink);
}

const homepageArticles = [
  {
    href: '/blog/air-brakes.html',
    tag: 'AIR BRAKES · 9 MIN',
    title: 'Air Brakes: Understand the System, Not Just the Answers',
    description: 'Learn how pressure, warning devices, spring brakes, brake lag, and inspection routines fit together.'
  },
  {
    href: '/blog/hours-of-service.html',
    tag: 'HOURS OF SERVICE · 8 MIN',
    title: 'The Core Hours-of-Service Limits Property-Carrying Drivers Must Know',
    description: 'Build a clear mental model of the driving limit, duty window, break rule, and weekly limits.'
  },
  {
    href: '/blog/pre-trip.html',
    tag: 'PRE-TRIP · 8 MIN',
    title: 'A Practical Pre-Trip Inspection Study Method',
    description: 'Use a repeatable inspection route and a simple condition, security, and function framework.'
  }
];

document.querySelectorAll('.article-grid article').forEach((article, index) => {
  const content = homepageArticles[index];
  if (!content) return;
  const tag = article.querySelector('span');
  const title = article.querySelector('h3');
  const description = article.querySelector('p');
  const link = article.querySelector('a');
  if (tag) tag.textContent = content.tag;
  if (title) title.textContent = content.title;
  if (description) description.textContent = content.description;
  if (link) {
    link.href = content.href;
    link.textContent = 'Read article →';
  }
});

const articleHeading = document.querySelector('.articles .section-head');
if (articleHeading && !articleHeading.querySelector('[href="/blog/"]')) {
  const allArticlesLink = document.createElement('a');
  allArticlesLink.href = '/blog/';
  allArticlesLink.className = 'article-all-link';
  allArticlesLink.textContent = 'View all CDL articles →';
  articleHeading.appendChild(allArticlesLink);
}
