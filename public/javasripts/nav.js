const openBtn = document.getElementById("openMenu");
const closeBtn = document.getElementById("closeMenu");
const mobileMenu = document.getElementById("mobileMenu");

openBtn.addEventListener("click", () => {
  mobileMenu.classList.remove("hidden");
  openBtn.classList.add("hidden");
  closeBtn.classList.remove("hidden");

  document.body.style.overflow = "hidden";
});

closeBtn.addEventListener("click", () => {
  mobileMenu.classList.add("hidden");
  openBtn.classList.remove("hidden");
  closeBtn.classList.add("hidden");

  document.body.style.overflow = "auto";
});
