import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { v4 as uuid } from 'uuid';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const typeDefs = `#graphql

enum Genre {
    NONE
    FANTASY
    DYSTOPIAN
    FICTION
    ROMANCE
    HORROR
    MYSTERY
    ADVENTURE
    SATIRE
    WAR
    TRAGEDY
}

type Author {
    id: ID!
    name: String!
    nationality: String
}

type Book {
    id: String!
    title: String!
    description: String
    isbn: String
    genre: Genre!
    publishYear: Int
    author: Author!
}

type Query {
    getAuthors: [Author]
    getAuthor(id: String!): Author

    getBooks: [Book]
    getBooksCount: Int!
    getBook(id: String): Book
}

type Mutation {
    addAuthor (
        name: String!
        nationality: String
    ): Author

    updateAuthor (
        id: ID!
        name: String
        nationality: String
    ): Author

    deleteAuthor (id: ID!): Author

    addBook (
        title: String!
        description: String
        isbn: String
        genre: Genre!
        publishYear: Int
        authorName: String!
        authorNacionality: String
    ): Book

    updateBook (
        id: String!
        title: String
        description: String
        isbn: String
        genre: Genre
        publishYear: Int
        authorName: String
        authorNacionality: String
    ): Book

    deleteBook (id: String!): Book
}
`;

const books = [
    {
        id: 'd26fd654-f4d4-4b98-91e5-6d8c9569aed6',
        title: 'The Awakening',
        description: 'The Awakening es una novela de la escritora estadounidense Kate Chopin.',
        publisher: 'W W Norton & Co Inc',
        genre: 'NONE',
        publishYear: 1899,
        authorName: 'Kate Chopin'
    },
    {
        id: '35b19ead-3aa9-415e-a46d-6621e1604119',
        title: 'City of Glass',
        description: 'Ciudad de cristal es el tercer libro de la saga Cazadores de Sombras, escrita por Cassandra Clare. Fue publicada originalmente en Estados Unidos.',
        isbn: '978-0140097313',
        publisher: 'Simon & Schuster',
        genre: 'FANTASY',
        publishYear: 2009,
        authorName: 'Paul Auster',
        authorNationality: 'Estadounidense'
    },
];

const resolvers = {
    Query: {
        getAuthors: async () => {
            try {
                const { data: authors } = await axios.get(process.env.API_URL + '/authors');
                console.log('obteniendo authors')
                return authors;
            } catch (error) {
                return null;
            }
        },
        getAuthor: async (root, args) => {
            try {
                const { data: author } = await axios.get(process.env.API_URL + '/authors/' + args.id);
                console.log('obteniendo author con ID: ' + args.id)
                return author;
            } catch (error) {
                return null;
            }
        },

        getBooks: () => books,
        getBooksCount: () => books.length,
        getBook: (root, args) => {
            const { id } = args;
            return books.find(book => book.id == id);
        }
    },

    Book: {
        author: (root) => {
            return {
                name: root.authorName,
                nationality: root.authorNationality
            }
        }
    },

    Mutation: {
        addAuthor: async (root, args) => {
            const newAuthor = {
                name: args.name,
                nationality: args.nationality
            }
            try {
                const { data: author } = await axios.post(process.env.API_URL + '/authors', newAuthor);
                console.log('creando author')
                return author;
            } catch (error) {
                return null;
            }
        },

        updateAuthor: async (root, args) => {
            const { data: author } = await axios.get(process.env.API_URL + '/authors/' + args.id);

            const updatedAuthorData = {
                name: args.name ? args.name : author.name,
                nationality: args.nationality ? args.nationality : author.nationality,
            };

            try {
                const { data: updatedAuthor } = await axios.patch(process.env.API_URL + '/authors/' + args.id, updatedAuthorData);
                console.log('actualizando author')
                return updatedAuthor;
            } catch (error) {
                return null;
            }
        },

        deleteAuthor: async (root, args) => {
            const { data: author } = await axios.get(process.env.API_URL + '/authors/' + args.id);

            try {
                const { data: deletedAuthor } = await axios.delete(process.env.API_URL + '/authors/' + args.id);
                console.log('actualizando author')
                return author;
            } catch (error) {
                return null;
            }
        },

        addBook: (root, args) => {
            const newBook = { ...args, id: uuid() };
            books.push(newBook);
            return newBook;
        },

        updateBook: (root, args) => {
            const updatedBookIndex = books.findIndex(book => book.id == args.id);

            if (updatedBookIndex == -1) return null;

            const book = books[updatedBookIndex];

            const updatedBook = {
                ...book,
                title: args.title ? args.title : book.title,
                description: args.description ? args.description : book.description,
                isbn: args.isbn ? args.isbn : book.isbn,
                genre: args.genre ? args.genre : book.genre,
                publishYear: args.publishYear ? args.publishYear : book.publishYear,
                authorName: args.authorName ? args.authorName : book.authorName,
                authorNationality: args.authorNationality ? args.authorNationality : book.authorNationality,
            };

            books[updatedBookIndex] = updatedBook;
            return updatedBook;
        },

        deleteBook: (root, args) => {
            const deletedBookIndex = books.findIndex(book => book.id == args.id);

            if (deletedBookIndex == -1) return null;

            const deleteBook = books.splice(deletedBookIndex, 1)[0];

            return deleteBook;
        }

    }
};

const server = new ApolloServer({
    typeDefs,
    resolvers
});

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }
});

console.log(`Server corriendo en: ${url}`);