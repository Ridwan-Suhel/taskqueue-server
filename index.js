const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kbbq9.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productsCollection = client.db("taskqueue").collection("products");
    const cartCollection = client.db("taskqueue").collection("cart_products");
    const todosCollection = client.db("taskqueue").collection("todos");

    // get all products
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    // get single product by collection id
    app.get("/products/:id", async (req, res) => {
      const id = req?.params?.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    //add to cart produc
    // app.post("/products/cart", async (req, res) => {
    //   const cart = req.body;
    //   const result = await cartCollection.insertOne(cart);
    //   res.send(result);
    // });

    // all todos
    app.post("/todos", async (req, res) => {
      const query = req.body;
      const result = await todosCollection.insertOne(query);
      res.send(result);
    });

    app.put("/products/cart/:id", async (req, res) => {
      const id = req.params.id;
      const cart = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: cart,
      };
      const result = await cartCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    app.get("/cart", async (req, res) => {
      const query = {};
      const cursor = cartCollection.find(query);
      const carts = await cursor.toArray();
      res.send(carts);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from taskQueue!");
});

app.listen(port, () => {
  console.log(`taskQueue app is listening on ${port}`);
});
