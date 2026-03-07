"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import { AlertCircleIcon } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";

interface JsonEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  label,
  value,
  onChange,
  error,
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);

  useEffect(() => {
    if (editorRef.current && cursorPosition !== null) {
      editorRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [value, cursorPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setCursorPosition(e.target.selectionStart);
    onChange(newValue);
  };

  const fieldId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col space-y-2">
      <Label htmlFor={fieldId}>{label}</Label>
      <Textarea
        ref={editorRef}
        id={fieldId}
        value={value}
        onChange={handleChange}
        className="font-mono text-sm h-[60vh] resize-none"
        placeholder={`Enter JSON for ${label}`}
      />
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircleIcon className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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

const JsonEditorModal: React.FC<JsonEditorModalProps> = ({
  title,
  description,
  triggerButtonText,
  fields,
  onSubmit,
}) => {
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
    } catch (error) {
      console.log("Error submitting JSON data:", error);
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
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          {triggerButtonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[80vh] h-full w-full overflow-y-scroll">
        <div className="">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className={`grid gap-6 mt-10 ${getGridColumns(fields.length)}`}>
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
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={
                Object.values(jsonErrors).some(error => error !== "") ||
                isLoading
              }
              className="relative"
            >
              {isLoading ? "Saving Changes..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </div>
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
