;(function() {
  "use strict";

  let form = document.querySelector("#create-user");

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();

    let name = document.querySelector("#name").value;
    let age = document.querySelector("#age").value;
    let gender = document.querySelector("[name='gender']:checked").value;
    let role = document.querySelector("#role").value;

    fetch("user", {
      method: "post",
      body: JSON.stringify({ name, age: parseInt(age, 10), gender, role }),
      headers: {
        "Content-Type": "application/json"
      }
    }).
    then(res => res.json()).
    then(res => {
      console.log(res);
    }).
    catch(e => {
      console.log(res);
    });
  });


})();