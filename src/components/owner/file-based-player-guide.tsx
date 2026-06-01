"use client";

interface FileBasedPlayerGuideProps {
  nationSlug?: string;
  nationName?: string;
}

export function FileBasedPlayerGuide({ nationSlug = "portugal", nationName }: FileBasedPlayerGuideProps) {
  const nationLabel = nationName ?? nationSlug;

  return (
    <div className="space-y-3 rounded-2xl bg-white/95 p-4 shadow-lg ring-1 ring-black/5">
      <h3 className="font-bold text-[#081120]">Add players via files</h3>
      <p className="text-sm text-[#081120]/65">
        Save images under{" "}
        <code className="rounded bg-[#081120]/5 px-1">public/players/{"{nation-slug}"}/</code>.
        The folder sets the player&apos;s nation automatically
        {nationName ? ` (${nationLabel})` : ""}.
      </p>

      <ol className="list-decimal space-y-2 pl-4 text-sm text-[#081120]/70">
        <li>
          Save the image, e.g.{" "}
          <code className="rounded bg-[#081120]/5 px-1">public/players/{nationSlug}/diogocosta.png</code>
        </li>
        <li>
          Tell Cursor or run in terminal:
          <pre className="mt-1 overflow-x-auto rounded-lg bg-[#081120]/5 p-2 text-[11px]">
            {`npm run player:add -- ${nationSlug} diogocosta.png "Diogo Costa" Goalkeeper`}
          </pre>
        </li>
        <li>Player appears in Draft → Initial Draft and Redraft until assigned.</li>
      </ol>

      <p className="text-xs text-[#081120]/45">
        Optional: add <code className="rounded bg-[#081120]/5 px-1">name.meta.json</code> next to
        the image, then run <code className="rounded bg-[#081120]/5 px-1">npm run players:sync</code>
      </p>
    </div>
  );
}
