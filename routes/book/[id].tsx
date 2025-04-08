import { Handlers, PageProps } from "$fresh/server.ts";

type BookDetails = {
  title: string;
  description?: string;
  year?: string;
  pages?: number;
  coverId?: number;
  authorName?: string;
  authorId?: string;
};

export const handler: Handlers = {
  async GET(_, ctx) {
    const { id } = ctx.params;
    const res = await fetch(`https://openlibrary.org/works/${id}.json`);
    const data = await res.json();

    const title = data.title || "Sin título";
    const description =
      typeof data.description === "string"
        ? data.description
        : data.description?.value;

    const year = data.first_publish_date || data.created?.value?.slice(0, 10);

    const pages = data.pagination ? parseInt(data.pagination) : undefined;
    const coverId = data.covers?.[0];

    const authorKey = data.authors?.[0]?.author?.key; // "/authors/OL123A"
    const authorId = authorKey?.replace("/authors/", "");
    let authorName;

    if (authorId) {
      const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`);
      const authorData = await authorRes.json();
      authorName = authorData.name;
    }

    const book: BookDetails = {
      title,
      description,
      year,
      pages,
      coverId,
      authorName,
      authorId,
    };

    return ctx.render(book);
  },
};

export default function BookPage({ data }: PageProps<BookDetails>) {
  const coverUrl = data.coverId
    ? `https://covers.openlibrary.org/b/id/${data.coverId}-L.jpg`
    : "https://via.placeholder.com/300x450?text=No+Cover";

  return (
    <div>
      <head>
        <title>{data.title}</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <header>
          <h1>{data.title}</h1>
        </header>
        <main class="book-detail">
          <img src={coverUrl} alt={data.title} class="detail-cover" />
          <div class="book-info">
            {data.description && <p><strong>Descripción:</strong> {data.description}</p>}
            {data.year && <p><strong>Año de publicación:</strong> {data.year}</p>}
            {data.pages && <p><strong>Páginas:</strong> {data.pages}</p>}
            {data.authorId && (
              <p>
                <strong>Autor:</strong>{" "}
                <a href={`/author/${data.authorId}`}>{data.authorName}</a>
              </p>
            )}
          </div>
          <a href="/" class="back-to-home">🔙 Volver a la página principal</a>
        </main>
      </body>
    </div>
  );
}
