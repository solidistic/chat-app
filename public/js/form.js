console.log("form.js loaded..");

const $loginHeader = document.querySelector("#login");
const $loginForm = document.querySelector("#loginForm");
const $joinHeader = document.querySelector("#join");
const $joinForm = document.querySelector("#joinForm");

$loginHeader.addEventListener("click", () => {
  if ($loginForm.style.display === "none") {
    $joinForm.style.display = "none";
    $joinHeader.childNodes[2].style.transform = "rotateX(0deg)";

    $loginForm.style.maxHeight = "1000px";
    $loginForm.style.display = "block";
    $loginHeader.childNodes[2].style.transform = "rotateX(180deg)";
  } else {
    $loginHeader.childNodes[2].style.transform = "rotateX(0deg)";
    $loginForm.style.maxHeight = "0px";
    $loginForm.style.display = "none";
  }
});

$joinHeader.addEventListener("click", () => {
  if ($joinForm.style.display === "none") {
    $loginForm.style.display = "none";
    $loginHeader.childNodes[2].style.transform = "rotateX(0deg)";

    $joinForm.style.maxHeight = "1000px";
    $joinForm.style.display = "block";
    $joinHeader.childNodes[2].style.transform = "rotateX(180deg)";
  } else {
    $joinHeader.childNodes[2].style.transform = "rotateX(0deg)";
    $joinForm.style.maxHeight = "0px";
    $joinForm.style.display = "none";
  }
});

