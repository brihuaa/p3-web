import { Handlers, PageProps } from "$fresh/server.ts";

type AuthorPageProps = {
  name: string;
  bio?: string;
  books: {
    id: string;
    title: string;
    coverId?: number;
  }[];
};

export const handler: Handlers = {
  async GET(_, ctx) {
    const { id } = ctx.params;

    const [authorRes, worksRes] = await Promise.all([
      fetch(`https://openlibrary.org/authors/${id}.json`),
      fetch(`https://openlibrary.org/authors/${id}/works.json`),
    ]);

    const authorData = await authorRes.json();
    const worksData = await worksRes.json();

    const books = (worksData.entries || []).slice(0, 6).map((work: any) => ({
      id: work.key.replace("/works/", ""),
      title: work.title,
      coverId: work.covers?.[0],
    }));

    return ctx.render({
      name: authorData.name,
      bio: typeof authorData.bio === "string" ? authorData.bio : authorData.bio?.value,
      books,
    });
  },
};

export default function AuthorPage({ data }: PageProps<AuthorPageProps>) {
  return (
    <div>
      <head>
        <title>{data.name}</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <header><h1>{data.name}</h1></header>
        <main>
          {data.bio && <p>{data.bio}</p>}
          <div class="grid">
            {data.books.map((book) => (
              <a href={`/book/${book.id}`} class="card">
                <img
                  src={book.coverId
                    ? `https://covers.openlibrary.org/b/id/${book.coverId}-M.jpg`
                    : "https://via.placeholder.com/150x220?text=No+Cover"}
                  alt={book.title}
                />
                <h3>{book.title}</h3>
              </a>
            ))}
          </div>
          <a href="/" class="back-to-home">🔙 Volver a la página principal</a>
        </main>
      </body>
    </div>
  );
}
