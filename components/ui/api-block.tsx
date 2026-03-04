"use client";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink, Server } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type ApiBlockProps = {
  title: string;
  description: string;
  variant: "public" | "admin";
  type?: "endpoint" | "env";
};

const methodConfig: Record<
  string,
  { solid: string; leftBar: string; urlText: string }
> = {
  GET: {
    solid: "bg-emerald-500 text-white",
    leftBar: "before:bg-emerald-500",
    urlText: "group-hover:border-emerald-500/30",
  },
  POST: {
    solid: "bg-blue-500 text-white",
    leftBar: "before:bg-blue-500",
    urlText: "group-hover:border-blue-500/30",
  },
  PATCH: {
    solid: "bg-amber-400 text-black",
    leftBar: "before:bg-amber-400",
    urlText: "group-hover:border-amber-400/30",
  },
  DELETE: {
    solid: "bg-red-500 text-white",
    leftBar: "before:bg-red-500",
    urlText: "group-hover:border-red-500/30",
  },
};

function ParsedUrl({ url }: { url: string }) {
  // Split on protocol+host vs path
  const match = url.match(/^(https?:\/\/[^/]+)(\/.*)?$/);
  if (!match) return <span className="text-slate-300">{url}</span>;

  const [, base, path = ""] = match;
  const pathParts = path.split(/(\{[^}]+\})/);

  return (
    <>
      <span className="text-slate-500">{base}</span>
      {pathParts.map((part, i) =>
        part.startsWith("{") && part.endsWith("}") ? (
          <span
            key={i}
            className="text-amber-300 font-semibold underline decoration-dotted decoration-amber-400/50"
          >
            {part}
          </span>
        ) : (
          <span key={i} className="text-slate-200">
            {part}
          </span>
        )
      )}
    </>
  );
}

const ApiBlock = ({
  title,
  description,
  variant,
  type = "endpoint",
}: ApiBlockProps) => {
  const [copied, setCopied] = useState(false);
  const hasParams = description.includes("{");
  const isPublicGet = variant === "public" && title === "GET";
  const cfg = methodConfig[title] ?? {
    solid: "bg-zinc-600 text-white",
    leftBar: "before:bg-zinc-600",
    urlText: "group-hover:border-zinc-500/30",
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(description);
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  if (type === "env") {
    return (
      <div className="group relative rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-200 hover:border-border hover:shadow-sm">
        <div className="flex items-center gap-4 px-5 py-4">
          <Server className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              {title}
            </p>
            <div className="rounded-lg bg-zinc-950/80 border border-white/5 px-4 py-2.5">
              <code className="text-sm font-mono text-slate-200 break-all">
                {description}
              </code>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            onClick={onCopy}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-black/20
        before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.75 ${cfg.leftBar}`}
    >
      <div className="pl-5 pr-4 pt-4 pb-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {/* Solid method badge */}
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-0.75 text-[11px] font-black font-mono tracking-widest shadow-sm ${cfg.solid}`}
            >
              {title}
            </span>

            {/* Access badge */}
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.75 rounded-md border ${
                variant === "public"
                  ? "text-emerald-400 bg-emerald-500/8 border-emerald-500/25"
                  : "text-rose-400 bg-rose-500/8 border-rose-500/25"
              }`}
            >
              {variant === "public" ? "Public" : "Admin"}
            </span>

            {/* Param badge */}
            {hasParams && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-300/80 bg-amber-500/10 border border-amber-400/20 rounded-md px-1.5 py-0.75 font-medium">
                <span className="h-1 w-1 rounded-full bg-amber-400 inline-block" />
                requires ID
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5">
            {isPublicGet && !hasParams && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                title="Open in browser"
                asChild
              >
                <a href={description} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              title="Copy URL"
              onClick={onCopy}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* URL block — terminal style */}
        <div
          className={`rounded-lg bg-zinc-950/70 border border-white/5 px-4 py-3 transition-colors duration-200 ${cfg.urlText}`}
        >
          <code className="text-sm font-mono leading-relaxed break-all">
            <ParsedUrl url={description} />
          </code>
        </div>
      </div>
    </div>
  );
};

export default ApiBlock;


