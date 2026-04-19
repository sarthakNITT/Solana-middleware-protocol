import { notFound } from "next/navigation";
import { DocsContent } from "@/components/docs/docs-content";
import { DocsPageLayout } from "@/components/docs/docs-page-layout";
import { getDocBySlug, getAdjacentDocs } from "@/lib/docs";
import type { DocPageProps } from "@/types/docs";

export async function generateMetadata({ params }: DocPageProps) {
  const slug = params.slug?.join("/") ?? "";
  const doc = getDocBySlug(slug);
  if (!doc) return {};
  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description,
  };
}

export default function DocPage({ params }: DocPageProps) {
  const slug = params.slug?.join("/") ?? "";
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  const { prev, next } = getAdjacentDocs(slug);

  return (
    <DocsPageLayout toc={doc.toc} prev={prev} next={next}>
      <DocsContent content={doc.content} frontmatter={doc.frontmatter} />
    </DocsPageLayout>
  );
}
