const sidebar = document.getElementById("sidebar");
const toggle = document.getElementById("menu-toggle");
const overlay = document.getElementById("overlay");

function openSidebar() {
  sidebar?.classList.remove("-translate-x-full");
  sidebar?.classList.add("translate-x-0");
  overlay?.classList.remove("hidden");
  toggle?.setAttribute("aria-expanded", "true");
}

function closeSidebar() {
  sidebar?.classList.add("-translate-x-full");
  sidebar?.classList.remove("translate-x-0");
  overlay?.classList.add("hidden");
  toggle?.setAttribute("aria-expanded", "false");
}

toggle?.addEventListener("click", () => {
  const isExpanded = toggle.getAttribute("aria-expanded") === "true";
  if (isExpanded) {
    closeSidebar();
  } else {
    openSidebar();
  }
});

overlay?.addEventListener("click", () => {
  closeSidebar();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeSidebar();
  }
});
