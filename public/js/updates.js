console.log("updates.js loaded..");

const [oldPw, newPw, repeatNewPw] = Array.from(
  document.querySelectorAll("input")
);
const inputs = Array.from(document.querySelectorAll("input"));

// inputs.forEach(node => {
//   node.addEventListener("input", e => {
//     if (newPw.value && repeatNewPw.value) {
//       if (newPw.value === repeatNewPw.value)
//         return document
//           .querySelector("input[type='submit']")
//           .removeAttribute("disabled");

//       document
//         .querySelector("input[type='submit']")
//         .setAttribute("disabled", "disabled");
//     }
//   });
// });

const validateNewPassword = () => {
  if (newPw.value && repeatNewPw.value) {
    if (newPw.value !== repeatNewPw.value) {
      document.querySelector("#error").innerHTML =
        "Please check your new password";
      return false;
    }
    return true;
  }
};

let sent = false;

// Trying fetch as patch with form
document.querySelector("form").addEventListener("submit", async function(e) {
  if (!validateNewPassword()) return e.preventDefault();

  this.querySelector("input[type='submit']").setAttribute(
    "disabled",
    "disabled"
  );

  const inputs = document.querySelectorAll("input[type='password']");
  console.log(inputs[0].value);
  // console.log(event);
  const url = "/users/account";
  const data = {
    oldPassword: inputs[0].value,
    password: inputs[1].value
  };

  if (!sent) {
    sent = true;
    await fetch(url, {
      headers: { "Content-Type": "application/json" },
      method: "PATCH",
      body: JSON.stringify(data)
    })
      .then(res => console.log(res))
      .catch(error => console.log(error));
  }
});
