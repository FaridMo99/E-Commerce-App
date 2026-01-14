import { Card } from "@/components/ui/card";

function TestingDisclaimer() {
  return (
    <Card className="mt-4 bg-backgroundBright p-6 text-center text-foreground">
      <div className="mb-4">
        <h2 className="text-white text-2xl font-extrabold uppercase tracking-tight">
          Disclaimer:
        </h2>
        <p className="mx-auto max-w-md text-sm text-red-500 font-medium">
          This is a Mock environment. No real payments will be processed.
        </p>
      </div>

      <div className="grid gap-6 text-sm text-left sm:grid-cols-2">
        {/* Success Case */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="mb-2 font-bold text-green-400">Success Input:</h3>
          <ul className="space-y-1 text-zinc-300">
            <li>
              <span className="text-white font-mono">Card:</span> 4242 4242 4242
              4242
            </li>
            <li>
              <span className="text-white font-mono">Expiry:</span> Any future
              date (e.g., 12/30)
            </li>
            <li>
              <span className="text-white font-mono">CVC:</span> 123
            </li>
            <li>
              <span className="text-white font-mono">Zip:</span> 90210
            </li>
          </ul>
        </div>

        {/* Failure Case */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <h3 className="mb-2 font-bold text-red-600">
            Failure Input:
          </h3>
          <ul className="space-y-1 text-zinc-300">
            <li>
              <span className="text-white font-mono">Card:</span> 4000 0000 0000
              0002
            </li>
          </ul>
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        You can use any name and valid email format.
      </p>
    </Card>
  );
}

export default TestingDisclaimer;
