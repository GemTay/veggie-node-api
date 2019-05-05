
let express = require("express");  // creating Web API routes
let bodyParser = require("body-parser"); //  parse incoming request parameters
let mongodb = require("mongodb"); //  communicate with your Mongo database

let RESTAURANTS_DB = "mongodb://localhost:27017/VegRestaurants";
let PORT_NO = 2000;
let RESTAURANTS_COLLECTION = "vegRestaurants";
let ObjectID = mongodb.ObjectID;
let db;


let app = express();

app.use(bodyParser.json());


// Connect to the database before starting the application server.
mongodb.MongoClient.connect(RESTAURANTS_DB, function (err, client)
{
    if (err)
    {
        console.log(err);
        process.exit(1);
    }

    // Save database object from the callback for reuse.
    db = client.db();
    console.log("Database connection ready");

    // Initialize the app.
    var server = app.listen(PORT_NO, function ()
    {
        var port = server.address().port;
        var baseURL = "http://localhost:" + port;
        var exampleEndPoint = "/api/veggierestaurants";
        console.log("App now running at localhost on port " + port)
        console.log("Use " + baseURL + exampleEndPoint + " , etc, to access");
    });
});

// API ROUTES

// create a generic error handler to be used by all endpoints.
function handleError(res, reason, message, code)
{
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
}


app.get("/api/veggierestaurants/:restName", function (request, response)
{
    db.collection(RESTAURANTS_COLLECTION).find({"name" : (request.params.restName)}).toArray(function(err, docs)
    {

        if (err) {
            handleError(response, err.message, "Failed to get restaurants from collection.");
        }
        else
        {
            // respond with the raw JSON from the movies collection
            response.status(200).json(docs);
        }

    });
});

app.get("/api/veggierestaurants", function(req, res)
{
    // find({}) with no filter applied effectively does a 'find all' on the movies collection
    db.collection(RESTAURANTS_COLLECTION).find({}).toArray(function(err, docs)
    {
        if (err)
        {
            handleError(res, err.message, "Failed to get restaurants from collection.");
        }
        else
        {
            // respond with the raw JSON from the movies collection
            res.status(200).json(docs);
        }
    });
});


app.post("/api/veggierestaurants/create", function(req, res)
{

    let newRestaurant = req.body;

    db.collection(RESTAURANTS_COLLECTION).insertOne(newRestaurant, function(err, doc)
    {
        if (err)
        {
            handleError(res, err.message, "Failed to create new restaurant.");
        } else {
                // send a response to say that the insertion was successful
                res.status(201).json(doc.ops[0]);
            }
        });

});


app.delete("/api/veggierestaurants/delete", function (req, res) {

    let input = req.body;

    db.collection(RESTAURANTS_COLLECTION).deleteOne(input, function(err, doc){
        if (err)
            res.send(err);
        else{
            res.json({message: "Restaurant Deleted"});
        }
    });
});

app.put("/api/veggierestaurants/update/:id", function(req, res)
{
    let change = req.body;

    db.collection(RESTAURANTS_COLLECTION).update({"_id":ObjectID(req.params.id)}, { $set: change }, function(err, docs)
    {
        if (err)
        {
            handleError(res, err.message, "Failed to update restaurant.");
        }
        else
        {
            console.log("1 record updated");
            res.status(200).json(docs);
        }
    });
});


