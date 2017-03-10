const mongoose = require("mongoose"),
    url = "mongodb://localhost:27017/levelup",
    express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    uploadPath = "./public/upload",
    multer = require("multer"),
    storage = multer.diskStorage({
      destination(req, file, cb) {
        let url = req.path === "/upload-thumb" ?
          `${uploadPath}/thumbs` :
          uploadPath;

        cb(null, url);
      },
      filename(req, file, cb) {
        cb(null, file.originalname);
      }
    }),
    upload = multer({ storage }),
    speakingurl = require("speakingurl"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    cookieParser = require("cookie-parser");

app.set('views', './views');
app.set("view engine", "pug");
app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieParser());

app.use(require('express-session')({ secret: 'keyboard cat' }));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(url);

const links = [
  { path: "/users", title: "Users" },
  { path: "/", title: "Add new user" }
];

mongoose.connection.on("open", () => {
  console.log("Connected");
});

let Schema = mongoose.Schema;

let UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  // role: {
  //   type: String,
  //   required: true
  // },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

let PostSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  thumb: {
    type: String,
    required: true
  },
  shorthand: {
    type: String,
    required: true
  },
  createDate: {
    type: Number
  },
  lastUpdate: {
    type: Number
  },
  url: {
    type: String,
    required: true
  }
});

let User = mongoose.model("Users", UserSchema);
let Post = mongoose.model("Posts", PostSchema);



// PASSPORT 


passport.serializeUser(function(user, done) {
  console.log("SERIALIZE: ", user.username);
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  User.findOne({ username }, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.password === password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

const users = [];


 // PASSPORT

 app.route("/login")
  .get((request, response) => {
    response.render("login");
  })
  .post(passport.authenticate('local'), (request, response) => {
    if(!request.user) {
      return response.redirect("/login");
    }

    let user = {};

    user.username = request.user.username;
    user.timerId = setTimeout((user) => {
      user.status = "loggedout";
    }, 10000, user);

    users.push(user);


    return response.redirect("/admin");
  });


app.get("/", (request, response) => {

  if(request.user) {
    let user = users.find(user => user.username === request.user.username);
    // if(user) console.log(user, "Is logged out", user.status === "loggedout");
    console.log(users[0], request.user, user);
    if(user && user.status === "loggedout") {
      request.logout();
      console.log("?????");
    }
  }

  Post.find({}).sort( "-createDate" ).exec((err, data) => {
    if(err) {
      response.render("index", { links, posts: [] });
    }

    let posts = data;

    response.render("index", { links, posts });
  });
});

app.route("/post")
  .post((request, response) => {
    const content = request.body;

    console.log("USER: ", request.user);

    if(!content) response.status(400).send({ error: "Aaaaaa" });

    content.createDate = Date.now();
    content.lastUpdate = Date.now();

    let slug = speakingurl.createSlug({
      lang: "ru"
    });
    let url = slug(content.title);

    console.log(url);

    Post.find({ url }, (err, data) => {
      if(err) {
        console.log(err);
        return response.status(400).send({
          error: "Unable to save post",
          data: null
        });
      }

      if(data.length) return response.status(400).send({
        error: `Post with url ${url} already exist`,
        data: null
      });

      content.url = url;

      Post.create(content, (err, data) => {
        if(err) {
          response.status(400).send({ error: "Unable to create new post" });
          return;
        }

        console.log(data);

        response.send({
          status: "Ok",
          data: {
            postId: data._id,
            url: data.url
          }
        });
      });
    });
  })
  .put((request, response) => {
    let postId = request.body.postId;

    const content = request.body;
    content.lastUpdate = Date.now();

    Post.updateOne({ _id: postId }, content, (err, data) => {
      if(err) {
        console.log(err);
        return response.status(400).send();
      }
      response.send({ data });
    });
  }).
  delete((request, response) => {
    let postId = request.body.postId;

    Post.remove({ _id: postId }, (err, data) => {
      if(err) {
        console.log(err);
        return response.status(400).send();
      }

      response.send({ data: "ok" });
    });
  });

app.get("/post/:url", (request, response) => {
  console.log(request.params);

  Post.findOne({ url: request.params.url }, (err, data) => {
    if(err) {
      response.sendStatus(404);
      return;
    }

    if(!data.title) data.title = "Without title";

    response.render("post", { post: data });
  });
});

// app.get("/login", (request, response) => {
//   response.render("login");
// });

app.get("/admin", (request, response) => {

  if(!request.user) {
    return response.redirect("/");
  }

  let links = [
    { href: "/", text: "Main" }
  ];
  response.render("admin", { links });
});

app.route("/user").
  post((request, response) => {
    console.log(request.body);
    let user = request.body;

    User.create(user, (err, data) => {
      if(err) {
        console.log(err);
        response.status(400).send({error: err.message});
        return;
      }

      let { name, age, gender, role } = data;

      response.send({
        status: "ok",
        data: {
          name, age, gender, role
        }
      });
    });
  }).
  delete((request, response) => {
    let { name } = request.body;

    if(!name) {
      response.
        status(400).
        send({ error: "'name' can not be empty" });
      return;
    }

    User.findOneAndRemove({ name }, (err, data) => {
      if(err) {
        response.
          status(404).
          send({ error: err.message });
        return;
      }

      response.send({ error: null, data: { name } });
    });
  }).
  get((request, response) => {
    User.find({}, function(err, data) {
      if(err) return;

      response.render("users", { users: data, links });
    })
  });

app.get("/users", (request, response) => {
  User.find({}, function(err, data) {
    if(err) return;

    response.render("users", { users: data, links });
  });
});

app.post("/upload-image", upload.single("post-image"), (request, response) => {
  if(!request.file) {
    response.status(400).send({ error: "Empty file", data: null });
    return;
  }

  response.send({
    error: null,
    data: `/upload/${request.file.originalname}`
  });
});

app.post("/upload-thumb", upload.single("post-thumbnail"), (request, response) => {
  if(!request.file) {
    response.status(400).send({ error: "Empty file", data: null });
    return;
  }

  response.send({
    error: null,
    data: `/upload/thumbs/${request.file.originalname}`
  });
});

app.get("/edit/:id", (request, response) => {
  Post.findById(request.params.id, (err, data) => {
    if(err) {
      console.log(err);
      response.status(404).send();
      return;
    }

    response.render("edit", { post: data });
  });
});

app.get("/post-content/:id", (request, response) => {
  Post.findById(request.params.id, (err, data) => {
    if(err) {
      console.log(err);
      response.status(404).send();
      return;
    }

    response.send({ data });
  });
});

app.listen("8888", () => {
  console.log("Listen 8888");
});
