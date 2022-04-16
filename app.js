const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.set('view engine', 'ejs');
const day = date.getDate();

mongoose.connect("mongodb+srv://admin-takin:Shadow13@cluster0.sqdqv.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const defaultItems = [];

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems) {


    if (!err) {

      res.render("list", {
        listTitle: day,
        newListItem: foundItems
      });
    }

  });

});

app.get("/:customListName", function(req, res) {

  const customListName = _.capitalize(req.params.customListName);


  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);

      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItem: foundList.items
        });
      }
    }
  });
});



app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });

  }

});

app.post("/delete", function(req, res) {


  const idForDeleting = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(idForDeleting, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted.");
        res.redirect("/");
      }
    });


  } else {

    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: idForDeleting
        }
      }
    }, function(err, foundItem) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });

  }

});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}



app.listen(port, function() {
  console.log("Server started.")
});
