const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn; // Get the ISBN from the route parameters
  const review = req.query.review; // Get the review from the query parameters
  const username = req.session.username; // Get the logged-in user's username from the session

  if (!username) {
    return res
      .status(401)
      .json({ message: "You must be logged in to post a review" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review content missing" });
  }

  // If the user has already posted a review, modify it. Otherwise, add a new review.
  if (books[isbn].reviews[username]) {
    books[isbn].reviews[username] = review; // Modify the existing review
    res.status(200).json({
      message: `Review updated for ISBN: ${isbn}`,
      reviews: books[isbn].reviews,
    });
  } else {
    books[isbn].reviews[username] = review; // Add a new review
    res.status(200).json({
      message: `Review added for ISBN: ${isbn}`,
      reviews: books[isbn].reviews,
    });
  }
});

// Delete review route
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;

  if (!username) {
    return res
      .status(401)
      .json({ message: "You must be logged in to delete a review" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews[username]) {
    return res
      .status(404)
      .json({ message: "Review not found for the current user" });
  }

  // Delete the user's review
  delete books[isbn].reviews[username];

  res.status(200).json({
    message: `Review deleted for ISBN: ${isbn}`,
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
