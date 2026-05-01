import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/CTA";
import { ProjectsHero } from "@/components/projects/ProjectsHero";
import { Capabilities } from "@/components/projects/Capabilities";
import { Visualizations } from "@/components/projects/Visualizations";
import { ProjectsCTA } from "@/components/projects/ProjectsCTA";

const ProjectsSquads = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <ProjectsHero />
        <div id="capacidades"><Capabilities /></div>
        <Visualizations />
        <ProjectsCTA />
      </main>
      <SiteFooter />
    </div>
  );
};

export default ProjectsSquads;
