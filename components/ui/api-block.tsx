"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckIcon, CopyIcon, ExternalLinkIcon, ServerIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

function ParsedUrl({ url, copied }: { url: string; copied: boolean }) {
  const match = url.match(/^(https?:\/\/[^/]+)(\/.*)?$/);
  if (!match) return <span className="text-slate-300">{url}</span>;

  const [, base, path = ""] = match;
  const pathParts = path.split(/(\{[^}]+\})/);

  return (
    <div
      className={cn(
        "text-slate-500 w-fit px-2.5 py-0.5 rounded",
        copied && "bg-violet-950"
      )}
    >
      <span className={"text-slate-500"}>{base}</span>
      {pathParts.map((part, i) =>
        part.startsWith("{") && part.endsWith("}") ? (
          <span
            key={i}
            className="text-amber-300 font-semibold decoration-amber-400/50"
          >
            {part}
          </span>
        ) : (
          <span key={i} className="text-slate-200">
            {part}
          </span>
        )
      )}
    </div>
  );
}

type CopyState = "idle" | "flash" | "copied";

const ApiBlock = ({
  title,
  description,
  variant,
  type = "endpoint",
}: ApiBlockProps) => {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, []);

  const hasParams = description.includes("{");
  const isPublicGet = variant === "public" && title === "GET";
  const cfg = methodConfig[title] ?? {
    solid: "bg-zinc-600 text-white",
    leftBar: "before:bg-zinc-600",
    urlText: "group-hover:border-zinc-500/30",
  };

  const copied = copyState === "copied";

  const onCopy = () => {
    if (copyState !== "idle") return;
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    setCopyState("flash");
    copyTimeoutRef.current = setTimeout(async () => {
      try {
        await navigator.clipboard.writeText(description);
        setCopyState("copied");
        idleTimeoutRef.current = setTimeout(() => setCopyState("idle"), 2000);
        toast.success("Copied to clipboard");
      } catch {
        setCopyState("idle");
        toast.error("Failed to copy");
      }
    }, 160);
  };

  if (type === "env") {
    return (
      <div className="group relative rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-200 hover:border-border hover:shadow-sm">
        <div className="flex items-center gap-4 px-5 py-4">
          <ServerIcon className="size-4 text-muted-foreground shrink-0" />
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
            className="size-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            onClick={onCopy}
            aria-label={copied ? "Copied!" : "Copy to clipboard"}
          >
            {copied ? (
              <CheckIcon className="size-3.5 text-emerald-400" />
            ) : (
              <CopyIcon className="size-3.5" />
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
                <span className="size-1 rounded-full bg-amber-400 inline-block" />
                requires ID
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5">
            {isPublicGet && !hasParams && (
              <a
                href={description}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in browser"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center justify-center size-7 rounded-lg text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
              >
                <ExternalLinkIcon className="size-3.5" />
              </a>
            )}
            <Button
              variant="ghost"
              size="icon"
              title={copied ? "Copied!" : "Copy URL"}
              onClick={e => {
                e.stopPropagation();
                onCopy();
              }}
              className={`size-7 rounded-lg transition-all ${
                copyState === "copied"
                  ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/10"
                  : copyState === "flash"
                    ? "text-sky-400 bg-sky-500/10 hover:bg-sky-500/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {copied ? (
                <CheckIcon className="size-3.5" />
              ) : (
                <CopyIcon className="size-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* URL block */}
        <div
          onClick={onCopy}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onCopy();
            }
          }}
          role="button"
          tabIndex={0}
          title={copied ? "Copied!" : "Click to copy"}
          aria-label={copied ? "Copied!" : "Click to copy URL"}
          className={`rounded-lg border px-4 py-3 transition-all duration-300 cursor-pointer select-none overflow-x-auto scrollbar-none ${
            copyState === "flash"
              ? "bg-white/6 border-white/15 shadow-sm"
              : copyState === "copied"
                ? "bg-emerald-500/8 border-emerald-500/20"
                : `bg-zinc-950/70 border-white/5 ${cfg.urlText}`
          }`}
        >
          <code className="text-sm leading-relaxed pointer-events-none whitespace-nowrap">
            <ParsedUrl url={description} copied={copied} />
          </code>
        </div>
      </div>
    </div>
  );
};

export default ApiBlock;
