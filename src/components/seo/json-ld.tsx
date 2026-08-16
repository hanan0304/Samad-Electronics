/**
 * Renders a JSON-LD structured-data script tag. Safe: the object is our own
 * server-built data, serialized with a script-injection guard.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
