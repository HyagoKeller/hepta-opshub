import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import { Manifesto } from "@/components/site/Manifesto";
import { OrgStructure } from "@/components/site/OrgStructure";
import { Cores } from "@/components/site/Cores";
import { DataModel } from "@/components/site/DataModel";
import { Modules } from "@/components/site/Modules";
import { Differential } from "@/components/site/Differential";
import { CTA, SiteFooter } from "@/components/site/CTA";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Manifesto />
        <OrgStructure />
        <Cores />
        <DataModel />
        <Modules />
        <Differential />
        <CTA />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
