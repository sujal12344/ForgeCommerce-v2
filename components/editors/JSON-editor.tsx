"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertCircleIcon,
  BracesIcon,
  CheckIcon,
  CopyIcon,
  RotateCcwIcon,
} from "lucide-react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

interface JsonEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const JsonEditor = ({ label, value, onChange, error }: JsonEditorProps) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  const isValid = !error;
  const lineCount = value ? value.split("\n").length : 1;
  const charCount = value ? value.length : 0;

  // Restore cursor after state-driven value changes (e.g. Tab insert)
  useEffect(() => {
    if (editorRef.current && cursorPosition !== null) {
      editorRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [value, cursorPosition]);

  // Cleanup copy timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setCursorPosition(e.target.selectionStart);
    onChange(e.target.value);
  };

  // Tab inserts 2 spaces instead of shifting focus
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = editorRef.current!;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      onChange(value.substring(0, start) + "  " + value.substring(end));
      setCursorPosition(start + 2);
    }
    // Ctrl+F → format
    if (e.key === "f" && e.ctrlKey) {
      e.preventDefault();
      handleFormat();
    }
  };

  const handleFormat = () => {
    try {
      onChange(JSON.stringify(JSON.parse(value), null, 2));
    } catch {
      // No-op — button is disabled when JSON is invalid
    }
  };

  const handleMinify = () => {
    try {
      onChange(JSON.stringify(JSON.parse(value)));
    } catch {
      // No-op
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => onChange("{}");

  const fieldId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {/* Header: label + valid badge + action buttons */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Label htmlFor={fieldId} className="text-sm font-medium">
            {label}
          </Label>
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border select-none",
              isValid
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : "bg-destructive/10 text-destructive border-destructive/20"
            )}
          >
            {isValid ? (
              <CheckIcon className="size-2.5" />
            ) : (
              <AlertCircleIcon className="size-2.5" />
            )}
            {isValid ? "Valid" : "Invalid"}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFormat}
            disabled={!isValid}
            className="h-7 px-2.5 text-xs gap-1.5"
            title="Prettify JSON (Ctrl+F)"
          >
            <BracesIcon className="size-3.5" />
            Format
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMinify}
            disabled={!isValid}
            className="h-7 px-2.5 text-xs"
            title="Minify JSON"
          >
            Minify
          </Button>
          <div className="w-px h-4 bg-border mx-0.5" aria-hidden />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="size-8 sm:p-0 text-muted-foreground hover:text-primary transition-colors"
            title={copied ? "Copied!" : "Copy to clipboard"}
            aria-label={copied ? "Copied!" : "Copy to clipboard"}
          >
            {copied ? (
              <CheckIcon className="size-4 text-emerald-500" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="size-8 sm:p-0 text-muted-foreground hover:text-primary transition-colors"
            title="Reset to {}"
            aria-label="Reset to empty object"
          >
            <RotateCcwIcon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Editor container */}
      <div
        className={cn(
          "rounded-md border overflow-hidden transition-shadow",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0",
          error
            ? "border-destructive/60 focus-within:ring-destructive/40"
            : "border-border"
        )}
      >
        <textarea
          ref={editorRef}
          id={fieldId}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full h-[50vh] bg-muted/20 font-mono text-sm leading-relaxed py-3 px-4 resize-none outline-none"
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={'{\n  "key": "value"\n}'}
        />

        {/* Status bar */}
        <div className="flex items-center justify-end gap-4 px-4 py-1 border-t bg-muted/30">
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {lineCount} {lineCount === 1 ? "line" : "lines"}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {charCount} chars
          </span>
        </div>
      </div>

      {/* Inline error */}
      {error && (
        <p className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertCircleIcon className="size-3.5 mt-0.5 shrink-0" />
          <span className="font-mono break-all">{error}</span>
        </p>
      )}
    </div>
  );
};

interface Field {
  name: string;
  label: string;
  defaultValue?: string;
}
type OnSubmitProps = Record<string, unknown>;

interface JsonEditorModalProps {
  title: string;
  description: string;
  triggerButtonText: string;
  fields: Field[];
  onSubmit: (data: OnSubmitProps) => Promise<void>;
}

const JsonEditorModal = ({
  title,
  description,
  triggerButtonText,
  fields,
  onSubmit,
}: JsonEditorModalProps) => {
  const [jsonData, setJsonData] = useState<Record<string, string>>(() =>
    fields.reduce(
      (acc, field) => {
        acc[field.name] = field.defaultValue || "{}";
        return acc;
      },
      {} as Record<string, string>
    )
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const [jsonErrors, setJsonErrors] = useState<Record<string, string>>(() =>
    fields.reduce(
      (acc, field) => {
        acc[field.name] = "";
        return acc;
      },
      {} as Record<string, string>
    )
  );

  // Reset state if fields change after mount (e.g. dynamic field sets)

  const fieldsKey = JSON.stringify(fields);
  useEffect(() => {
    setJsonData(
      fields.reduce(
        (acc, field) => {
          acc[field.name] = field.defaultValue || "{}";
          return acc;
        },
        {} as Record<string, string>
      )
    );
    setJsonErrors(
      fields.reduce(
        (acc, field) => {
          acc[field.name] = "";
          return acc;
        },
        {} as Record<string, string>
      )
    );
    // fieldsKey is a stable serialized representation of fields
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldsKey]);

  const validateJson = (json: string, fieldName: string) => {
    try {
      JSON.parse(json);
      setJsonErrors(prev => ({ ...prev, [fieldName]: "" }));
    } catch (error) {
      setJsonErrors(prev => ({
        ...prev,
        [fieldName]: `Invalid JSON: ${(error as Error).message}`,
      }));
    }
  };

  const handleJsonChange = (newValue: string, fieldName: string) => {
    setJsonData(prev => ({ ...prev, [fieldName]: newValue }));
    validateJson(newValue, fieldName);
  };

  const handleSubmit = async () => {
    if (Object.values(jsonErrors).some(error => error !== "")) {
      toast({
        title: "Validation Error",
        description: "Please fix JSON errors before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const parsedData = Object.fromEntries(
        Object.entries(jsonData).map(([key, value]) => [key, JSON.parse(value)])
      );
      await onSubmit(parsedData);
      setIsOpen(false);
      toast({
        title: "Quick Data was Added !! Bzzzing out.....🚀",
      });
    } catch (e) {
      console.error("Error submitting JSON data:", e);
      toast({
        title: "Error Submitting Data",
        description: "There was an error submitting the JSON data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[92vw] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className={cn("grid gap-6 py-2", getGridColumns(fields.length))}>
          {fields.map(field => (
            <JsonEditor
              key={field.name}
              label={field.label}
              value={jsonData[field.name]}
              onChange={newValue => handleJsonChange(newValue, field.name)}
              error={jsonErrors[field.name]}
            />
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              Object.values(jsonErrors).some(e => e !== "") || isLoading
            }
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const getGridColumns = (fieldCount: number) => {
  switch (fieldCount) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 md:grid-cols-2";
    case 3:
      return "grid-cols-1 md:grid-cols-3";
    default:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
  }
};

export default JsonEditorModal;
