//This will initiate the npm package
var mysql = require("mysql");
var inquirer = require("inquirer");
require("console.table");

//This will initiate the connection and sync mySQL database
var connection = mysql.createConnection({
    host:"127.0.0.1",
    port: 3306,

    //my username
    user: "root",

    //my password
    password:"",
    database: "bamazon"
});
//This will create the connection with the server and load the product upon successful connection
connection.connect(function(err){
    if(err) {
        console.error("error connecting: " + err.stack);
    }
    loadProducts();
});




//THis block of code is for loading products from the database and printing the results the console
function loadProducts() {
    //This will select all the data from the SQL products table
    connection.query("SELECT * FROM products", function(err, res){
        if(err) throw err;

        //This will draw the table in the terminal using the response
        console.table(res);

        //This will prompt the customer for thier choice of product, pass all the products
        //to promptCustomerForItem
        promptCustomerForItem(res);
    });
}


//This will prompt the customer for a product ID and what they would like to purchase
function promptCustomerForItem(inventory) {
    inquirer
    .prompt([
        {
            type:"input",
            name:"choice",
            message: "Please name the ID of the item. [Quit with Q]",
            // validate: function(val) {
            //     return !isNaN(val) || val.toLowerCase() === "q";
            // }
        }
    ])

    //The .then function will allow the user to quit the program
    .then(function(val) { 
        console.log (val.choice);

        checkIfShouldExit(val.choice);
        var choiceId = parseInt(val.choice);
        var product = checkInventory(choiceId, inventory);

        //Prompt the customer for a desired quantity of the product they want to purchase
        if (product) {
            //if else statement will ask for quantity of product
            promptCustomerForQuantity(product);
        }
        else {
            console.log("\nThat item is not in the inventory.");
            loadProducts();
        }
    });
}




//Block of code that prompts the customer for the quantity of the product
function promptCustomerForQuantity(product){
    inquirer
    .prompt([
        {
            type:"input",
            name:"quantity",
            message:"How many would you like? [Quit with Q]",
            validate: function(val) {
                return val > 0 || val.toLowerCase() === "q";
            }
        }
    ])

    //the .then method will check if the user wants to quit the program
    .then(function(val) {
        checkIfShouldExit(val.quantity);
        var quantity = parseInt(val.quantity);

    //re-run the function "loadProducts"
    if (quantity > product.stock_quantity) {
        console.log("\nInsufficient quantity!");
        loadProducts();
    }
    else {
        //making the purchase function
        makePurchase(product, quantity);
    }
    });
}

//This block of code will have the user purchase items
function makePurchase(product, quantity) {
    connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
        [quantity, product.item_id],
        function(err, res) {
            console.log("\nSuccessfully purchased " + quantity + " " + product.product_name + "'s!");
            loadProducts();
        }
    );
}


//This block of code is for checking if the product is in the inventory
function checkInventory(choiceId, inventory) {
    for (var i = 0; i < inventory.length; i++) {
        if(inventory[i].item_id === choiceId) {
            //This should return if the product is available
            return inventory[i];
        }
    }
    //otherwise show a null return
    return null;
}

//This block of code is to see if the user wants to stop searching
function checkIfShouldExit(choice) {
    if (choice.toLowerCase() === "q") {
        console.log("Goodbye!");
        process.exit(0);
    }
}