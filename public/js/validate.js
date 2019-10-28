const [oldPw, newPw, repeatNewPw] = Array.from(document.querySelectorAll("input"));
const inputs = Array.from(document.querySelectorAll("input"));

console.log(inputs);

inputs.forEach(node => {
  node.addEventListener("input", e => {
    if (newPw.value && repeatNewPw.value) {
      if (newPw.value === repeatNewPw.value) return console.log("ok");
      console.log("new password doesn match");
    }
  });
});
