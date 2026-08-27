import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Propeller } from "@/components/brand/Propeller";
import NotFound from "./NotFound";

interface Post {
  title: string;
  content: string;
}

export default function ResourceDetail() {
  const { slug = "" } = useParams();
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["public", "posts", slug],
    queryFn: () => api.get<Post>(`/public/posts/${slug}`),
    enabled: Boolean(slug),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Propeller size={32} />
      </div>
    );
  }

  if (isError || !post) return <NotFound />;

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-heading text-[clamp(2rem,4vw,2.75rem)] font-semibold text-brand-black">{post.title}</h1>
      <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-brand-graphite">{post.content}</p>
    </article>
  );
}
