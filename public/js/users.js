;(function() {
  "use strict";

  let [ ...buttons ] = document.querySelectorAll("button[data-user]");

  const form = document.getElementById("create-user");

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();

    let name = document.getElementById("name").value;
    let age = document.getElementById("age").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    fetch("/user", {
      method: "POST",
      body: JSON.stringify({ name, age, username, password }),
      headers: {
        "content-type": "application/json"
      }
    }).
    then(res => res.json()).
    then(res => {
      console.log(res);

      let p = document.createElement("p");
      p.textContent = JSON.stringify(res);
      p.style = "color: green;";

      form.appendChild(p);
    }).
    catch(e => {
      alert(JSON.stringify(e));
    });
  });

  const removeUser = function() {
    let name = this.dataset.user;

    fetch("user", {
      method: "DELETE",
      body: JSON.stringify({ name }),
      headers: {
        "Content-Type": "application/json"
      }
    }).
    then(res => res.json()).
    then(res => {
      this.removeEventListener("click", removeUser);
      document.querySelector(`div[data-name="${name}"]`).remove();
    }).
    catch(e => {
      console.log(e);
    });
  }

  buttons.forEach((button) => {
    button.addEventListener("click", removeUser);
  });
})();