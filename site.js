// Shared header and footer. Edit the nav or social links here once instead of on every page.
// Pages include <header id="site-header"></header> and <footer id="site-footer"></footer>.

const NAV = [
  ["/About", "About"],
  ["/Events", "Events"],
  ["/Officers", "Officers"],
  ["/Sponsorship", "Sponsorship"],
  ["/Contact", "Contact"]
];

const SOCIALS = [
  ["https://jagsync.tamusa.edu/organization/ieee", "Jagsync"],
  ["https://discord.gg/X2ucbghawh", "Discord"],
  ["https://www.instagram.com/ieee.tamusa", "Instagram"]
];

const here = location.pathname.replace(/\/(index\.html)?$/, "") || "/";
const current = href => href === here ? ' aria-current="page"' : "";

const header = document.getElementById("site-header");
header.className = "site-header";
header.innerHTML = `
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="container">
    <a class="brand" href="/">
      <img src="/001_TAMUSA-Logo_Updated_Horizontal-Black.png" alt="Texas A&amp;M University-San Antonio" width="160" height="40">
      <span>IEEE Student<br>Branch</span>
    </a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav class="nav" id="site-nav" aria-label="Main">
      ${NAV.map(([href, label]) => `<a href="${href}"${current(href)}>${label}</a>`).join("")}
      <a class="button" href="/Membership"${current("/Membership")}>Join</a>
    </nav>
  </div>`;

header.querySelector(".menu-toggle").addEventListener("click", e => {
  const open = header.classList.toggle("nav-open");
  e.currentTarget.setAttribute("aria-expanded", open);
});

const footer = document.getElementById("site-footer");
footer.className = "site-footer";
footer.innerHTML = `
  <div class="container">
    <div>
      <p class="footer-name">IEEE TAMUSA Student Branch</p>
      <p>Texas A&amp;M University-San Antonio<br>One University Way, San Antonio, TX 78224</p>
      <p><a href="mailto:ieeetamusa@gmail.com">ieeetamusa@gmail.com</a></p>
    </div>
    <div>
      <h2>Get involved</h2>
      <ul>
        <li><a href="/Membership">Membership</a></li>
        <li><a href="/Events">Events</a></li>
        <li><a href="/Newsletter">Newsletter</a></li>
        <li><a href="/Sponsorship">Sponsor us</a></li>
      </ul>
    </div>
    <div>
      <h2>Connect</h2>
      <ul>
        ${SOCIALS.map(([href, label]) => `<li><a href="${href}" target="_blank" rel="noopener">${label}</a></li>`).join("")}
        <li><a href="https://www.ieee.org" target="_blank" rel="noopener">IEEE.org</a></li>
      </ul>
    </div>
    <p class="legal">© ${new Date().getFullYear()} IEEE TAMUSA Student Branch. A student organization of Texas A&amp;M University-San Antonio.</p>
  </div>`;
