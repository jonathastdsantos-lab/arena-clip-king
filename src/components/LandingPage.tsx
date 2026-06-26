import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Scissors,
  Captions,
  Sparkles,
  Share2,
  Wand2,
  Zap,
  Play,
  Gamepad2,
  Music4,
  Crop,
  ArrowRight,
} from "lucide-react";
import editorMockup from "@/assets/editor-mockup.jpg";
import heroBg from "@/assets/hero-bg.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

function Logo() {
  return (
    <span className="flex items-center gap-2 font-display text-2xl tracking-wide">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-gradient-hero text-primary-foreground shadow-glow">
        <Play className="h-4 w-4 fill-current" />
      </span>
      <span>
        Arena<span className="text-primary text-glow">Clips</span>
      </span>
    </span>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#recursos" className="transition-colors hover:text-foreground">
            Recursos
          </a>
          <a href="#fluxo" className="transition-colors hover:text-foreground">
            Como funciona
          </a>
          <a href="#precos" className="transition-colors hover:text-foreground">
            Preços
          </a>
        </nav>
        <a
          href="#precos"
          className="rounded-lg bg-gradient-hero px-4 py-2 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
        >
          Começar grátis
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img
          src={heroBg}
          alt=""
          width={1536}
          height={1024}
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 grid-noise opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-20 text-center md:pt-28">
        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Editor de clipes para gamers
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.08 }}
          className="mx-auto max-w-4xl text-6xl leading-[0.92] sm:text-7xl md:text-8xl"
        >
          Transforme partidas em{" "}
          <span className="bg-gradient-hero bg-clip-text text-transparent">highlights virais</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.16 }}
          className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground"
        >
          Corte, legende, adicione efeitos e exporte seus melhores momentos no formato certo para
          cada rede — em segundos, sem timeline complicada.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.24 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href="#precos"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-7 py-3.5 text-base font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
          >
            Editar meu primeiro clipe
            <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#fluxo"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-surface"
          >
            <Play className="h-4 w-4 fill-current text-primary" />
            Ver demonstração
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.32 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            <img
              src={editorMockup}
              alt="Interface do editor ArenaClips com timeline e preview de clipe de jogo"
              width={1280}
              height={896}
              className="w-full"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: Scissors,
    title: "Corte instantâneo",
    desc: "Marque o início e o fim com um clique. Sem arrastar timeline interminável.",
    className: "md:col-span-2 md:row-span-2",
    big: true,
  },
  {
    icon: Captions,
    title: "Legendas automáticas",
    desc: "Transcrição com IA e legendas estilizadas que prendem a atenção.",
    className: "md:col-span-1",
  },
  {
    icon: Crop,
    title: "Formatos prontos",
    desc: "9:16, 1:1 e 16:9 com reenquadramento inteligente.",
    className: "md:col-span-1",
  },
  {
    icon: Wand2,
    title: "Detecção de momentos",
    desc: "A IA encontra abates, vitórias e reações épicas pra você.",
    className: "md:col-span-2",
  },
  {
    icon: Music4,
    title: "Trilhas & efeitos",
    desc: "Biblioteca de sons e batidas sincronizadas com a ação.",
    className: "md:col-span-1",
  },
  {
    icon: Share2,
    title: "Exporte e poste",
    desc: "Direto para TikTok, Shorts e Reels em alta qualidade.",
    className: "md:col-span-1",
  },
];

function Features() {
  return (
    <section id="recursos" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <div className="mb-12 max-w-2xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
          Tudo num só lugar
        </p>
        <h2 className="text-5xl md:text-6xl">Feito para a velocidade do gamer</h2>
      </div>

      <div className="grid auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-gradient-surface p-6 shadow-card transition-colors hover:border-primary/50 ${f.className}`}
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary/25">
                <Icon className="h-6 w-6" />
              </div>
              <div className="mt-6">
                <h3 className={f.big ? "text-3xl md:text-4xl" : "text-2xl"}>{f.title}</h3>
                <p className="mt-2 max-w-sm text-muted-foreground">{f.desc}</p>
              </div>
              {f.big && (
                <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

const steps = [
  {
    icon: Gamepad2,
    step: "01",
    title: "Importe a gravação",
    desc: "Arraste seu replay ou conecte sua captura. ArenaClips organiza tudo.",
  },
  {
    icon: Zap,
    step: "02",
    title: "A IA acha os momentos",
    desc: "Abates, clutchs e reações são marcados automaticamente.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Finalize e exporte",
    desc: "Legendas, trilha, formato — e está pronto para postar.",
  },
];

function Flow() {
  return (
    <section id="fluxo" className="border-y border-border bg-surface/30">
      <div className="mx-auto max-w-6xl px-5 py-20 md:py-28">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            Do replay ao post
          </p>
          <h2 className="text-5xl md:text-6xl">Três passos, zero complicação</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-7 shadow-card"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-display text-5xl text-border">{s.step}</span>
                </div>
                <h3 className="mt-6 text-3xl">{s.title}</h3>
                <p className="mt-2 text-muted-foreground">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const plans = [
  {
    name: "Rookie",
    price: "R$0",
    period: "/mês",
    desc: "Para começar a clipar.",
    features: ["5 clipes por mês", "Exportação 720p", "Legendas automáticas", "Marca d'água ArenaClips"],
    cta: "Começar grátis",
    highlight: false,
  },
  {
    name: "Pro",
    price: "R$29",
    period: "/mês",
    desc: "Para criadores que postam todo dia.",
    features: [
      "Clipes ilimitados",
      "Exportação 4K",
      "Detecção de momentos com IA",
      "Sem marca d'água",
      "Biblioteca de trilhas premium",
    ],
    cta: "Assinar o Pro",
    highlight: true,
  },
  {
    name: "Squad",
    price: "R$79",
    period: "/mês",
    desc: "Para times e equipes de conteúdo.",
    features: ["Tudo do Pro", "5 assentos", "Pastas compartilhadas", "Branding personalizado"],
    cta: "Falar com vendas",
    highlight: false,
  },
];

function Pricing() {
  return (
    <section id="precos" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
      <div className="mb-12 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Planos</p>
        <h2 className="text-5xl md:text-6xl">Escolha sua arena</h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`relative flex flex-col rounded-2xl border p-7 shadow-card ${
              p.highlight
                ? "border-primary bg-gradient-surface shadow-glow"
                : "border-border bg-card"
            }`}
          >
            {p.highlight && (
              <span className="absolute -top-3 left-7 rounded-full bg-gradient-hero px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
                Mais popular
              </span>
            )}
            <h3 className="text-3xl">{p.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            <div className="mt-5 flex items-end gap-1">
              <span className="font-display text-5xl text-foreground">{p.price}</span>
              <span className="mb-1.5 text-muted-foreground">{p.period}</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {p.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-foreground/90">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feat}
                </li>
              ))}
            </ul>
            <button
              className={`mt-7 rounded-xl px-5 py-3 text-sm font-bold transition-transform hover:scale-[1.02] ${
                p.highlight
                  ? "bg-gradient-hero text-primary-foreground shadow-glow"
                  : "border border-border bg-surface/60 text-foreground hover:bg-surface"
              }`}
            >
              {p.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-surface px-6 py-16 text-center shadow-glow">
        <div className="pointer-events-none absolute inset-0 grid-noise opacity-30" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <h2 className="relative text-5xl md:text-7xl">Seu próximo clipe viral começa agora</h2>
        <p className="relative mx-auto mt-4 max-w-md text-muted-foreground">
          Junte-se a milhares de gamers que transformam partidas em conteúdo todos os dias.
        </p>
        <a
          href="#precos"
          className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-hero px-8 py-4 text-base font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
        >
          Começar de graça
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
        <Logo />
        <p>© {new Date().getFullYear()} ArenaClips. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Features />
        <Flow />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
