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
    upload = multer({ storage });

app.set('views', './views');
app.set("view engine", "pug");
app.use(express.static('./public'));
app.use(bodyParser.json());

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
  gender: {
    type: String,
    required: true
  },
  role: {
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
  }
});

let User = mongoose.model("Users", UserSchema);
let Post = mongoose.model("Posts", PostSchema);

app.get("/", (request, response) => {

  Post.find({}, (err, data) => {
    if(err) {
      response.render({ links, posts: [] });
    }

    let posts = data;

    response.render("index", { links, posts });
  });
});

app.post("/post", (request, response) => {
  const content = request.body;

  if(!content) response.status(400).send({ error: "Aaaaaa" });

  Post.create(content, (err, data) => {
    if(err) {
      response.status(400).send({ error: "Unable to create new post" });
      return;
    }

    console.log(data);

    response.send({
      status: "Ok",
      data: {
        postId: data._id
      }
    });
  });
});

app.get("/post/:postid", (request, response) => {
  console.log(request.params);

  Post.findById(request.params.postid, (err, data) => {
    if(err) {
      response.sendStatus(404);
      return;
    }

    if(!data.title) data.title = "Without title";

    response.render("post", { post: data });
  });
});

app.get("/login", (request, response) => {
  response.render("login");
});

app.get("/admin", (request, response) => {
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

app.listen("8888", () => {
  console.log("Listen 8888");
});
