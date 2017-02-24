;(function() {
  "use strict";

  const quill = new Quill('#post-editor', {
    theme: 'snow'
  });

  const saveButton = document.querySelector("#save-post");
  const savePost = () => {
    let content = document.querySelector("#post-editor .ql-editor").innerHTML;
    let title = document.querySelector("#post-title").value.trim();

    if(title.length < 1) return;

    console.log(content);
    fetch("post", {
      method: "POST",
      body: JSON.stringify({ content, title }),
      headers: {
        "Content-Type": "application/json"
      }
    }).
    then(res => res.json()).
    then(res => {
      console.log(res);
    }).
    catch(e => {
      console.error(e);
    });
  };

  saveButton.addEventListener("click", savePost);
})();