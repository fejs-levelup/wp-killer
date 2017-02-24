;(function() {
  "use strict";

  let [ ...buttons ] = document.querySelectorAll("button[data-user]");

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