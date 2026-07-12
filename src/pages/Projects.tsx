import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CustomCursor from '@/components/CustomCursor';
import '../styles/projects.css';

gsap.registerPlugin(ScrollTrigger);

type Project = {
  name: string;
  domain: string;
  description: string;
  url: string;
};

const projects: Project[] = [
  {
    name: '247Swift Logistics',
    domain: '247swiftlogistics.com',
    description: 'A bold, dark-themed marketing site for a logistics company.',
    url: 'https://247swiftlogistics.com',
  },
  {
    name: 'Aunty Burgers',
    domain: 'auntyburgers.vercel.app',
    description: 'A sleek restaurant site for a burger joint.',
    url: 'https://auntyburgers.vercel.app',
  },
  {
    name: 'LMRSTUDIO',
    domain: 'lmrstudio.vercel.app',
    description: 'A makeup studio website for a beauty brand.',
    url: 'https://lmrstudio.vercel.app',
  },
  {
    name: "Adoree Bakes 'n' Cakes",
    domain: 'adoreebakesncakes.vercel.app',
    description: 'A warm landing page for a custom cake business.',
    url: 'https://adoreebakesncakes.vercel.app',
  },
];

const Projects = () => {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (!prefersReduced) {
        gsap.utils.toArray<HTMLElement>('.project-item').forEach((el, i) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'expo.out',
              delay: 0.05 * i,
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            }
          );
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <CustomCursor />
      <section className="projects-simple" ref={rootRef}>
        <h1 className="projects-heading">Projects</h1>
        <ul className="projects-list">
          {projects.map((p) => (
            <li key={p.name} className="project-item">
              <a href={p.url} target="_blank" rel="noopener noreferrer" className="project-link">
                <span className="project-name">{p.name}</span>
                <span className="project-domain">{p.domain}</span>
                <span className="project-desc">{p.description}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Projects;
