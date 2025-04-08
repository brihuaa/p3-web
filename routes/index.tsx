import { Handlers, PageProps } from "$fresh/server.ts";

const featuredBooks = [
  "To Kill a Mockingbird",
  "1984",
  "The Great Gatsby",
  "Pride and Prejudice",
  "The Hobbit",
  "Moby-Dick",
  "Jane Eyre",
  "War and Peace",
  "The Catcher in the Rye",
  "Brave New World",
  "The Lord of the Rings",
  "Crime and Punishment",
  "The Alchemist",
  "The Picture of Dorian Gray",
  "Harry Potter and the Sorcerer's Stone",
];

type Book = {
  id: string;
  title: string;
  author: string;
  coverId?: number;
};

export const handler: Handlers = {
  async GET(_, ctx) {
    const books: Book[] = [];

    for (const title of featuredBooks) {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(title)}`);
      const data = await res.json();
      const book = data.docs?.[0];
      if (book) {
        books.push({
          id: book.key.replace("/works/", ""),
          title: book.title,
          author: book.author_name?.[0] || "Desconocido",
          coverId: book.cover_i,
        });
      }
    }

    return ctx.render({ books });
  },
};

export default function Home({ data }: PageProps<{ books: Book[] }>) {
  return (
    <div>
      <head>
        <title>Libros Destacados</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <header>
          <h1>Libros Destacados</h1>
        </header>
        <main class="grid">
          {data.books.map((book) => {
            const coverUrl = book.coverId
              ? `https://covers.openlibrary.org/b/id/${book.coverId}-L.jpg`
              : "https://via.placeholder.com/150x220?text=No+Cover";

            return (
              <a href={`/book/${book.id}`} class="book-card">
                <img src={coverUrl} alt={book.title} />
                <div class="info">
                  <h2>{book.title}</h2>
                  <p>{book.author}</p>
                </div>
              </a>
            );
          })}
        </main>
      </body>
    </div>
  );
}

