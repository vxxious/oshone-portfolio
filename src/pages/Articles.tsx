import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import "../styles/articles.css";

gsap.registerPlugin(ScrollTrigger);

type Article = {
  title: string;
  excerpt: string;
  date: string;
  url: string;
  cover: string;
};

const Articles = () => {
  const articlesRef = useRef<HTMLDivElement>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      const { data, error } = await supabase.functions.invoke("substack-posts");

      if (!error && data) {
        setArticles(data);
      }

      setLoading(false);
    };

    loadArticles();
  }, []);

  useEffect(() => {
    if (!articles.length) return;

    const ctx = gsap.context(() => {
      if (articlesRef.current) {
        gsap.from(
          articlesRef.current.querySelectorAll(".article-card"),
          {
            y: 30,
            opacity: 0,
            scale: 0.95,
            duration: 0.5,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: articlesRef.current,
              start: "top 85%",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [articles]);

  if (loading) {
    return (
      <section className="articles-section">
        <h2 className="articles-heading">Articles</h2>

        <p className="articles-subtitle">
          Loading latest articles...
        </p>
      </section>
    );
  }

  return (
    <section className="articles-section">
      <h2 className="articles-heading">Articles</h2>

      <p className="articles-subtitle">
        Recent notes from my{" "}
        <a
          href="https://1oshone.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          className="substack-link"
        >
          Substack
        </a>
      </p>

      <div className="articles-grid" ref={articlesRef}>
        {articles.map((article) => (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            key={article.url}
            className="article-card-link"
          >
            <Card className="article-card">
              <CardContent className="article-card-content">

                {article.cover && (
                  <img
                    src={article.cover}
                    alt={article.title}
                    className="article-cover"
                  />
                )}

                <span className="article-date">
                  {new Date(article.date).toLocaleDateString()}
                </span>

                <h3 className="article-title">
                  {article.title}
                </h3>

                <p className="article-excerpt">
                  {article.excerpt}
                </p>

                <span className="article-read-more">
                  Read on Substack →
                </span>

              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </section>
  );
};

export default Articles;