import { createFileRoute, redirect } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { Play, Mail, Lock, Eye, EyeOff, Loader2, Chrome, User } from "lucide-react";
import { signUpWithEmail, signInWithGoogle, isMockMode } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth/signup")({
  beforeLoad: async () => {
    if (isMockMode) throw redirect({ to: "/dashboard" });
  },
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const result = await signUpWithEmail(email, password);
      if ("error" in result && result.error) {
        setError(result.error.message);
      } else {
        setSuccess(true);
        setTimeout(() => navigate({ to: "/dashboard" }), 1500);
      }
    } catch {
      setError("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute inset-0 grid-noise opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-2 font-display text-2xl tracking-wide">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-glow">
              <Play className="h-5 w-5 fill-current" />
            </span>
            Arena<span className="text-primary text-glow">Clips</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-primary fill-current" />
              </div>
              <h2 className="font-display text-3xl mb-2">Conta criada!</h2>
              <p className="text-muted-foreground">Redirecionando para o dashboard…</p>
            </motion.div>
          ) : (
            <>
              <h1 className="font-display text-4xl mb-1">Crie sua conta</h1>
              <p className="text-muted-foreground text-sm mb-8">
                Comece grátis. Sem cartão de crédito.
              </p>

              <button
                id="btn-google-signup"
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm font-semibold transition-colors hover:bg-surface mb-6"
              >
                <Chrome className="h-4 w-4" />
                Cadastrar com Google
              </button>

              <div className="relative flex items-center gap-3 mb-6">
                <div className="flex-1 border-t border-border" />
                <span className="text-xs text-muted-foreground">ou com e-mail</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Nome
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="input-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full rounded-xl bg-surface/50 border border-border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="input-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full rounded-xl bg-surface/50 border border-border pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      id="input-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      className="w-full rounded-xl bg-surface/50 border border-border pl-10 pr-12 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <button
                  id="btn-signup-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-hero px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Criar conta grátis
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Já tem conta?{" "}
                <Link to="/auth/login" className="text-primary hover:underline font-semibold">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
