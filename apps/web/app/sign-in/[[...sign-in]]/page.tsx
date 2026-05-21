import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div id="auth-root" className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative gradient blur background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="relative z-10">
        <SignIn appearance={{
          elements: {
            formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
            card: 'border border-border/50 shadow-xl bg-card rounded-2xl',
          }
        }} />
      </div>
    </div>
  );
}
