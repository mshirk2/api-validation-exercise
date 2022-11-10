const db = require("../db");
const app = require("../app");
const Book = require("../models/book");
const request = require("supertest");

process.env.NODE_ENV = "test"

beforeEach(async () => {
    await db.query("DELETE FROM books")
    
    await Book.create({
        isbn: '111111111111',
        amazon_url: 'https://amazon.com/book',
        author: 'Myself',
        language: 'English',
        pages: 700,
        publisher: 'Publish & Publishers',
        title: 'Book Title',
        year: 2022
      });
    
})

describe("POST /books", () => {
    test("Creates a book", async () => {
        const resp = await request(app)
            .post('/books')
            .send({
                isbn: '222222222222',
                amazon_url: 'https://amazon.com/notherbook',
                author: 'Yourself',
                language: 'Spanish',
                pages: 800,
                publisher: 'Publish & Publishers',
                title: 'Another Book Title',
                year: 2023
            });
        
        expect(resp.statusCode).toBe(201);
        expect(resp.body.book).toHaveProperty("isbn");
        expect(resp.body.book.isbn).toBe('222222222222');
    });

    test("Does not create a book if required data is missing", async () => {
        const resp = await request(app)
            .post('/books')
            .send({isbn: '33333333333'});
        expect(resp.statusCode).toBe(400);
    })
})

describe("GET /books", () => {
    test("Gets a list of all books", async () =>{
        const resp = await request(app).get('/books');
        const bookList = resp.body.books;
        
        expect(bookList).toHaveLength(1);
        expect(bookList[0]).toHaveProperty('isbn');
        expect(bookList[0]).toHaveProperty('title');
        expect(bookList[0].isbn).toBe('111111111111');
    })
})

describe("GET /books/:isbn", () => {
    test("Gets a single book", async () =>{
        const resp = await request(app).get('/books/111111111111');
        const respBook = resp.body.book;
        
        expect(respBook).toHaveProperty('isbn');
        expect(respBook).toHaveProperty('title');
        expect(respBook.isbn).toBe('111111111111');
        expect(respBook.title).toBe('Book Title');
    });

    test("Responds 404 if book not found", async () => {
        const resp = await request(app).get('/books/86486184846558');
        expect(resp.statusCode).toBe(404);
    });
});

describe("PUT /books/:isbn", () => {
    test("Updates a single book", async () => {
        const resp = await request(app)
            .put('/books/111111111111')
            .send({
                isbn: 'new isbn',
                amazon_url: 'https://amazon.com/book2',
                author: 'Updated author',
                language: 'French',
                pages: 200,
                publisher: 'Updated Publisher',
                title: 'Updated Title',
                year: 2050
            });
        const updatedBook = resp.body.book;

        expect(updatedBook).toHaveProperty('isbn');
        expect(updatedBook.title).toBe('Updated Title')
    });

    test("Does not update with bad data", async () => {
        const resp = await request(app)
            .put('/books/111111111111')
            .send({
                notAField: 'Bad data',
                isbn: 'not executed',
                amazon_url: 'https://amazon.com/not-executed',
                author: 'Will Not-Execute',
                language: 'Nonexecutish',
                pages: 1,
                publisher: 'This will not execute',
                title: 'this isnt happening',
                year: 2020
            });
        expect(resp.statusCode).toBe(400);
    });

    test("Responds 404 if book not found", async () => {
        const resp = await request(app)
            .put('/books/86486184846558')
            .send({
                isbn: 'not executed',
                amazon_url: 'https://amazon.com/not-executed',
                author: 'Will Not-Execute',
                language: 'Nonexecutish',
                pages: 1,
                publisher: 'This will not execute',
                title: 'this isnt happening',
                year: 2020
            });

        expect(resp.statusCode).toBe(404);
    });
})

describe("DELETE /books/:isbn", () => {
    test("Deletes a single book", async () => {
        const resp = await request(app).delete('/books/111111111111')
        expect(resp.body).toEqual({message: "Book deleted"});
    });
});

afterAll(async function () {
    await db.end()
  });