// app/sitemap.js
export default async function sitemap() {
  const base = "https://hast-kari.com";

  // static routes
  const staticRoutes = ["", "about", "contact", "products"].map(path => ({
    url: `${base}/${path}`,
    lastModified: new Date(),
  }));

  let productRoutes = [];
  try {
    const res = await fetch(`${base}/api/products`, {
      // During build you may need to allow revalidation/cache settings:
      // Next.js build will run this server-side. If your API expects auth or DB,
      // better to import DB access directly (Option A).
      cache: "no-store",
    });

    if (!res.ok) {
      // fetch returned 404/500; capture text for debugging but don't throw
      const body = await res.text();
      console.error("Products API returned non-OK. Status:", res.status, "Body preview:", body.slice(0,200));
    } else {
      // try parse safely
      try {
        const products = await res.json();
        if (Array.isArray(products)) {
          productRoutes = products.map(p => ({
            url: `${base}/products/${p.slug}`,
            lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          }));
        } else {
          console.error("Products API returned JSON but not an array:", products);
        }
      } catch (parseErr) {
        const text = await res.text().catch(()=>"<could not read body>");
        console.error("Failed to parse JSON from products API. Body preview:", text.slice(0,200));
      }
    }
  } catch (err) {
    console.error("Error fetching products API at build:", err);
    // proceed with empty productRoutes so build doesn't fail
  }

  return [...staticRoutes, ...productRoutes];
}
