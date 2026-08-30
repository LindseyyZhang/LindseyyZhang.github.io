import BreathingApp from "./components/BreathingApp";

export default function App() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-cream px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-3">
        <header className="text-center">
          <h1 className="text-lg font-semibold tracking-tight text-charcoal">Cat Wave Breathing</h1>
          <p className="mt-1 text-sm text-charcoal/55">
            Three science-backed rhythms to soften a tight chest, on a lazy cat's breath.
          </p>
        </header>
        <div className="h-[560px] overflow-hidden rounded-3xl border border-charcoal/10 bg-white/40 shadow-sm">
          <BreathingApp />
        </div>
      </div>
    </div>
  );
}
