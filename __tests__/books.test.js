const db = require("../db");
const app = require("../app");
const Book = require("../models/book");
const request = require("supertest");

process.env.NODE_ENV = "test"

beforeEach(async () => {
    await db.query("DELETE FROM books")
    
    let b1 = await Book.create({
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

describe ("POST /books", () => {
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

    test("Does not create a book if title is missing", async () => {
        const resp = await request(app)
            .post('/books')
            .send({isbn: '33333333333'});
        expect(resp.statusCode).toBe(400);
    })
})

afterAll(async function () {
    await db.end()
  });