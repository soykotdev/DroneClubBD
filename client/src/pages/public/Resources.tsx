import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
}

export default function Resources() {
  const { data: posts } = useQuery({ queryKey: ["public", "posts"], queryFn: () => api.get<Post[]>("/public/posts") });

  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <Helmet>
        <title>Resources — Drone Club Bangladesh</title>
      </Helmet>
      <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-semibold text-brand-black">Resources</h1>

      {posts && posts.length > 0 ? (
        <ul className="mt-10 space-y-6">
          {posts.map((post) => (
            <li key={post._id} className="border-b border-brand-border pb-6">
              <h2 className="font-heading text-lg font-semibold text-brand-black">{post.title}</h2>
              {post.excerpt && <p className="mt-1 text-sm text-brand-graphite">{post.excerpt}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-16 rounded-2xl border border-dashed border-brand-border bg-brand-light p-12 text-center">
          <h2 className="font-heading text-lg font-semibold text-brand-black">No articles published yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-brand-graphite">
            Technical articles and updates will appear here once published from the admin panel.
          </p>
        </div>
      )}
    </div>
  );
}
