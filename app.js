const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

mongoose.set("strictQuery", false);
mongoose.connect(
  "mongodb+srv://admin-eriqhbal:admin123@cluster0.6vqhesu.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
  }
);

const app = express();

const itemSchema = new mongoose.Schema({
  name: String,
});

const item1 = {
  name: "makan siang",
};
const item2 = {
  name: "makan sore",
};

const item3 = {
  name: "makan malam",
};

const defaultItem = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const Item = mongoose.model("item", itemSchema);

const List = mongoose.model("list", listSchema);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// save Data
let answerForm = [];
let workList = [];

app.get("/", (req, res) => {
  Item.find({}, function (err, item) {
    if (err) {
      console.log(err.message);
    } else {
      res.render("list", {
        listTitle: "Today",
        dataTodo: item,
      });
    }
  });
});

app.post("/", function (req, res) {
  let dataName = req.body.newItem;
  let listName = req.body.list;

  const item = new Item({
    name: dataName,
  });

  if (listName == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, data) => {
      if (!err) {
        data.items.push(item);
        data.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.get("/:customListName", (req, res) => {
  const listName = _.capitalize(req.params.customListName);

  List.findOne({ name: listName }, (err, dataList) => {
    if (!err) {
      if (!dataList) {
        const list = new List({
          name: listName,
          items: [],
        });

        list.save();
        res.redirect("/" + listName);
      } else {
        res.render("list", {
          listTitle: dataList.name,
          dataTodo: dataList.items,
        });
      }
    }
  });
});

app.post("/delete", (req, res) => {
  const itemId = req.body.checkbox;
  const nameList = req.body.namelist;

  if (nameList == "Today") {
    Item.findByIdAndRemove(itemId, (err) => {
      if (!err) {
        console.log("Success delete Data");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: nameList },
      { $pull: { items: { _id: itemId } } },
      function(err, foundList){
        if(!err){
          console.log("success Delete");
          res.redirect("/"+nameList);
        }
      }
    );
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", dataTodo: workList });
});

let port = process.env.PORT;

if(port == "" || port == null){
  port = 3000;
}
app.listen(port, () => {
  console.log("run on port : 3000");
});
