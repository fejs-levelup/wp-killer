;(function() {
  "use strict";

  // let form = document.querySelector("#create-user");

  // form.addEventListener("submit", (ev) => {
  //   ev.preventDefault();

  //   let name = document.querySelector("#name").value;
  //   let age = document.querySelector("#age").value;
  //   let gender = document.querySelector("[name='gender']:checked").value;
  //   let role = document.querySelector("#role").value;

  //   fetch("user", {
  //     method: "post",
  //     body: JSON.stringify({ name, age: parseInt(age, 10), gender, role }),
  //     headers: {
  //       "Content-Type": "application/json"
  //     }
  //   }).
  //   then(res => res.json()).
  //   then(res => {
  //     console.log(res);
  //   }).
  //   catch(e => {
  //     console.log(res);
  //   });
  // });

  // let postCollection = document.querySelectorAll("article");

  // for(let i = 0; i < postCollection.length; i++){
  //   let postContent = postCollection[i].getElementsByTagName("div")[0];
  //   let postPreviewPic = postContent.getElementsByTagName("img")[0];
  //   console.log(postPreviewPic);
  //   let div = document.createElement('div');
    
  //   if(postPreviewPic){
  //     div.appendChild(postPreviewPic);
  //     postCollection[i].insertBefore(div, postCollection[i].firstChild);
  //   }else{postCollection[i].insertBefore(div, postCollection[i].firstChild);}
    
  //   console.log(postCollection[i]);

  // }
  // console.log(postCollection)

})();