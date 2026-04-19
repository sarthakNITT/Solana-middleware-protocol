import { DocsContent } from "@/components/docs/docs-content";
import { DocsPageLayout } from "@/components/docs/docs-page-layout";
import { getDocBySlug, getAdjacentDocs } from "@/lib/docs";
import { notFound } from "next/navigation";

export default function DocsPage() {
  const slug = "";
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const { next } = getAdjacentDocs(slug);

  return (
    <DocsPageLayout toc={doc.toc} next={next}>
      <DocsContent content={doc.content} frontmatter={doc.frontmatter} />
    </DocsPageLayout>
  );
}
