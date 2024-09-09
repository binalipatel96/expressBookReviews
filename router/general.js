const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  // Check if the username already exists
  const existingUser = users.find((user) => user.username === username);

  if (existingUser) {
    return res.status(409).json({
      message: "Username already exists. Please choose a different username.",
    });
  }

  // Register the new user
  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //getting the list of books available in the shop
  res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  // getting the book details based on ISBN
  const isbn = req.params.isbn;
  res.send(books[isbn]);
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const booksByAuthor = [];

  // Obtain all the keys for the 'books' object
  const bookKeys = Object.keys(books);

  // Iterate through the 'books' array and check if the author matches the one provided
  bookKeys.forEach((key) => {
    const book = books[key];
    if (book.author === author) {
      booksByAuthor.push(book);
    }
  });

  // If no books are found, return a message
  if (booksByAuthor.length > 0) {
    res.status(200).json({ books: booksByAuthor });
  } else {
    res.status(404).json({ message: "No books found for the given author." });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];

  // Obtain all the keys for the 'books' object
  const bookKeys = Object.keys(books);

  // Iterate through the 'books' array and check if the title matches the one provided
  bookKeys.forEach((key) => {
    const book = books[key];
    if (book.title === title) {
      booksByTitle.push(book);
    }
  });

  // If no books are found, return a message
  if (booksByTitle.length > 0) {
    res.status(200).json({ books: booksByTitle });
  } else {
    res.status(404).json({ message: "No books found for the given title." });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  // Check if the book with the given ISBN exists
  const book = books[isbn];

  if (book) {
    // Return the reviews for the book
    res.status(200).json({ reviews: book.reviews });
  } else {
    // If the book is not found, return a 404 message
    res.status(404).json({ message: "Book not found for the given ISBN." });
  }
});

// Function to get the list of books using Promises
function getBooksPromise() {
  return new Promise((resolve, reject) => {
    axios
      .get("http://localhost:5000/") // Replace with actual API endpoint
      .then((response) => {
        resolve(response.data); // Resolve the promise with the book data
      })
      .catch((error) => {
        reject(error); // Reject the promise in case of an error
      });
  });
}

// Usage example with Promise callbacks
getBooksPromise()
  .then((data) => {
    console.log("Books available in the shop:", data);
  })
  .catch((error) => {
    console.error("Error fetching books:", error);
  });

// Function to get book details based on ISBN using Promises
function getBookDetailsByISBNPromise(isbn) {
  return new Promise((resolve, reject) => {
    axios
      .get(`http://localhost:5000/isbn/${isbn}`) // Replace with actual API endpoint
      .then((response) => {
        resolve(response.data); // Resolve the promise with the book details
      })
      .catch((error) => {
        reject(error); // Reject the promise in case of an error
      });
  });
}

// Usage example with Promise callbacks
getBookDetailsByISBNPromise(2) // Replace '1234567890' with actual ISBN
  .then((data) => {
    console.log("Book details:", data);
  })
  .catch((error) => {
    console.error("Error fetching book details:", error);
  });

// Function to get book details based on author using Promises
function getBooksByAuthorPromise(author) {
  return new Promise((resolve, reject) => {
    axios
      .get(`http://localhost:5000/author/${author}`) // Replace with actual API endpoint
      .then((response) => {
        resolve(response.data); // Resolve the promise with the books data
      })
      .catch((error) => {
        reject(error); // Reject the promise in case of an error
      });
  });
}

// Usage example with Promise callbacks
getBooksByAuthorPromise("Dante Alighieri") // Replace 'J.K. Rowling' with the actual author name
  .then((data) => {
    console.log("Books by author:", data);
  })
  .catch((error) => {
    console.error("Error fetching books by author:", error);
  });

// Function to get book details based on title using Promises
function getBooksByTitlePromise(title) {
  return new Promise((resolve, reject) => {
    axios
      .get(`http://localhost:5000/title/${title}`) // Replace with actual API endpoint
      .then((response) => {
        resolve(response.data); // Resolve the promise with the book data
      })
      .catch((error) => {
        reject(error); // Reject the promise in case of an error
      });
  });
}

// Usage example with Promise callbacks
getBooksByTitlePromise("Pride and Prejudice") // Replace 'Harry Potter' with the actual book title
  .then((data) => {
    console.log("Book details:", data);
  })
  .catch((error) => {
    console.error("Error fetching book details:", error);
  });
module.exports.general = public_users;
