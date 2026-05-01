import { Building2, ShieldCheck, Users, FolderArchive, Gauge, Stamp, MessagesSquare, Plug, BellRing } from "lucide-react";

const modules = [
  { icon: Building2, k: "Estrutura organizacional" },
  { icon: ShieldCheck, k: "Usuários, papéis e permissões" },
  { icon: Users, k: "Capacidade & resource pool" },
  { icon: FolderArchive, k: "Documentos e anexos" },
  { icon: Gauge, k: "Dashboards" },
  { icon: Stamp, k: "Aprovações" },
  { icon: MessagesSquare, k: "Comentários e histórico" },
  { icon: Plug, k: "Integrações" },
  { icon: BellRing, k: "Notificações" },
];

export const Modules = () => {
  return (
    <section id="plataforma" className="py-24 lg:py-28 bg-background border-b-2 border-foreground">
      <div className="container">
        <div className="max-w-3xl mb-14">
          <div className="inline-block border-2 border-foreground bg-primary text-primary-foreground px-3 py-1 mb-5 text-[11px] font-bold uppercase tracking-widest shadow-brutal-sm">
            Módulos transversais
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight">
            Camada comum a <span className="text-primary">todos os núcleos</span>.
          </h2>
          <p className="mt-6 text-lg font-medium text-muted-foreground">
            Os três núcleos compartilham governança, dados e colaboração — uma única base operacional.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map(({ icon: Icon, k }) => (
            <article key={k} className="border-2 border-foreground bg-card p-6 shadow-brutal-sm hover-brutal flex items-center gap-4">
              <div className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="font-display text-lg leading-tight">{k}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
