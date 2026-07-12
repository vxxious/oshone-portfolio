import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import '../styles/about.css';

gsap.registerPlugin(ScrollTrigger);

const skills = [
  { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', category: 'framework' },
  { name: 'TypeScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg', category: 'language' },
  { name: 'JavaScript', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', category: 'language' },
  { name: 'HTML5', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', category: 'language' },
  { name: 'CSS3', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', category: 'language' },
  { name: 'Tailwind CSS', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', category: 'framework' },
  { name: 'Next.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg', category: 'framework' },
  { name: 'Redux', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg', category: 'framework' },
  { name: 'Git', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', category: 'tool' },
  { name: 'GitHub', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', category: 'tool' },
  { name: 'VS Code', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg', category: 'tool' },
  { name: 'Figma', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', category: 'tool' },
  { name: 'Sass', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg', category: 'framework' },
  { name: 'Node.js', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', category: 'tool' },
  { name: 'npm', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg', category: 'tool' },
  { name: 'Vite', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg', category: 'tool' },
];

const About = () => {
  const aboutRef = useRef<HTMLElement>(null);
  const skillsRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const proSkillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (aboutRef.current) {
        gsap.from(aboutRef.current, { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out' });
      }

      if (skillsRef.current) {
        gsap.from(skillsRef.current.querySelector('.about-heading'), {
          y: 20, opacity: 0, duration: 0.5, ease: 'power3.out',
          scrollTrigger: { trigger: skillsRef.current, start: 'top 85%' },
        });
        gsap.from(skillsRef.current.querySelectorAll('.category-badge'), {
          scale: 0.8, opacity: 0, duration: 0.4, stagger: 0.1, ease: 'back.out(1.7)',
          scrollTrigger: { trigger: skillsRef.current, start: 'top 85%' },
        });
      }

      if (cardsRef.current) {
        gsap.from(cardsRef.current.querySelectorAll('.skill-card'), {
          y: 40, opacity: 0, scale: 0.9, duration: 0.5,
          stagger: { each: 0.06, grid: 'auto', from: 'start' },
          ease: 'power3.out',
          scrollTrigger: { trigger: cardsRef.current, start: 'top 80%' },
        });
      }

      if (proSkillsRef.current) {
        gsap.from(proSkillsRef.current.querySelectorAll('.pro-skill-card'), {
          y: 30, opacity: 0, scale: 0.95, duration: 0.5, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: proSkillsRef.current, start: 'top 85%' },
        });
      }
    });
    return () => ctx.revert();
  }, []);

  const categoryColors: Record<string, string> = {
    language: 'secondary',
    framework: 'default',
    tool: 'outline',
  };

  return (
    <>
      <section className="about-section" ref={aboutRef}>
        <h2 className="about-heading">About Me</h2>
        <Card className="about-card">
          <CardContent className="pt-6">
            <p className="bio" style={{ marginBottom: 0 }}>
              I'm Oshone a Frontend Developer with years of professional experience crafting high-quality user interfaces. My journey in UI spans a full decade, driven by a deep appreciation for detail, motion, and thoughtful design. I specialize in building performant, accessible web applications with React and modern frontend tools. When I'm not writing code, you'll find me watching football, exploring new movies, or sketching out ideas for my next project.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-8" />

      <section className="skills-section">
        <h2 className="about-heading">Core Skills</h2>
        <div className="pro-skills-grid" ref={proSkillsRef}>
          {[
            { title: 'Problem Solving', desc: 'Breaking down complex challenges into elegant, maintainable solutions.' },
            { title: 'Creativity', desc: 'Designing unique, visually compelling interfaces that stand out.' },
            { title: 'Collaboration', desc: 'Thriving in cross-functional teams with designers, PMs, and backend engineers.' },
            { title: 'Communication', desc: 'Translating technical concepts into clear, accessible language.' },
            { title: 'Product Metrics', desc: 'Driving decisions with data on performance, engagement, and conversion.' },
            { title: 'Performance', desc: 'Optimizing load times, bundle sizes, and runtime efficiency.' },
          ].map((skill) => (
            <Card className="pro-skill-card" key={skill.title}>
              <CardContent className="pro-skill-content">
                <h3 className="pro-skill-title">{skill.title}</h3>
                <p className="pro-skill-desc">{skill.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      <section className="skills-section" ref={skillsRef}>
        <h2 className="about-heading">Skills & Tools</h2>
        <div className="category-badges">
          <Badge variant="default" className="category-badge">Frameworks</Badge>
          <Badge variant="secondary" className="category-badge">Languages</Badge>
          <Badge variant="outline" className="category-badge">Tools</Badge>
        </div>
        <div className="skills-grid" ref={cardsRef}>
          {skills.map((skill) => (
            <Card className="skill-card" key={skill.name}>
              <CardContent className="skill-card-content">
                <img
                  src={skill.logo}
                  alt={`${skill.name} logo`}
                  width="40"
                  height="40"
                  loading="lazy"
                  className={`skill-logo${skill.name === 'GitHub' || skill.name === 'Next.js' ? ' invert-in-dark' : ''}`}
                />
                <span className="skill-name">{skill.name}</span>
                <Badge
                  variant={categoryColors[skill.category] as 'default' | 'secondary' | 'outline'}
                  className="skill-badge"
                >
                  {skill.category}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
};

export default About;
