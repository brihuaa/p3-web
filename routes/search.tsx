import { Handlers, PageProps } from "$fresh/server.ts";

type Book = {
  id: string;
  title: string;
  author: string;
  coverId?: number;
};

export const handler: Handlers = {
  async GET(req, ctx) {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";
    let books: Book[] = [];

    if (query) {
      const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      books = (data.docs || []).slice(0, 12).map((book: any) => ({
        id: book.key.replace("/works/", ""),
        title: book.title,
        author: book.author_name?.[0] || "Desconocido",
        coverId: book.cover_i,
      }));
    }

    return ctx.render({ books, query });
  },
};

export default function SearchPage({ data }: PageProps<{ books: Book[]; query: string }>) {
  const { books, query } = data;

  return (
    <div>
      <head>
        <title>Buscar Libros</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <header>
          <h1>Buscar Libros</h1>
        </header>
        <main class="search-container">
          <form method="GET" class="search-form">
            <input
              type="text"
              name="q"
              placeholder="Buscar por título..."
              value={query}
              class="search-input"
            />
            <button type="submit" class="search-button">Buscar</button>
          </form>

          <a href="/" class="back-to-home">🔙 Volver a la página principal</a>

          {query && books.length === 0 && (
            <p class="no-results">No se encontraron libros con ese título.</p>
          )}

          {books.length > 0 && (
            <div class="grid">
              {books.map((book) => {
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
            </div>
          )}
        </main>
      </body>
    </div>
  );
}
