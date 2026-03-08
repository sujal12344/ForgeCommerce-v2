"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Category, Color, Size } from "@prisma/client";
import axios from "axios";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import * as z from "zod";

import ImageUpload from "@/components/ui/Image-upload";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Heading from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  Image: z.object({ url: z.string() }).array().min(1),
  price: z.number().min(0),
  categoryId: z.string().min(1),
  colorId: z.string().min(1),
  sizeId: z.string().min(1),
  Featured: z.boolean().default(false).optional(),
  Archived: z.boolean().default(false).optional(),
  ytURL: z.string().url().optional().or(z.literal("")),
});

const bulkFormSchema = z.object({
  products: z.array(formSchema),
});

type BulkProductFormValues = z.infer<typeof bulkFormSchema>;

const BulkProductForm = () => {
  const params = useParams();
  const { storeId } = params;
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const [loading, setLoading] = useState(false);
  const syntaxHighlighterRef = useRef<SyntaxHighlighter>(null);

  const form = useForm<BulkProductFormValues>({
    resolver: zodResolver(bulkFormSchema),
    defaultValues: {
      products: [
        {
          name: "",
          description: "",
          Image: [],
          price: 0,
          categoryId: "",
          colorId: "",
          sizeId: "",
          Featured: false,
          Archived: false,
          ytURL: "",
        },
      ],
    },
  });

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, colorsRes, sizesRes] = await Promise.all([
          axios.get(`/api/${storeId}/categories`),
          axios.get(`/api/${storeId}/colors`),
          axios.get(`/api/${storeId}/sizes`),
        ]);
        setCategories(categoriesRes.data);
        setColors(colorsRes.data);
        setSizes(sizesRes.data);
      } catch (error) {
        console.error("Failed to load form data:", error);
        toast.error("Failed to load form data.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, [storeId]);

  const { fields, append, remove } = useFieldArray({
    name: "products",
    control: form.control,
  });

  if (initialLoading) {
    return <div>Loading form data...</div>;
  }

  const onSubmit = async (data: BulkProductFormValues) => {
    try {
      setLoading(true);
      await axios.post(`/api/${storeId}/products/multiadd`, data.products);
      router.refresh();
      router.push(`/${storeId}/products`);
      toast.success("Products created.");
    } catch (error) {
      console.error("Failed to create products:", error);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex-1 py-6 px-8">
        <div className="flex items-center justify-between">
          <Heading
            title="Add Multiple Products"
            description="Create multiple products at once."
          />
          <Button
            type="button"
            onClick={() =>
              append({
                name: "",
                description: "",
                Image: [],
                price: 0,
                categoryId: "",
                colorId: "",
                sizeId: "",
                Featured: false,
                Archived: false,
                ytURL: "",
              })
            }
            className="flex items-center"
          >
            <PlusIcon className="mr-2 size-4" /> Add Product
          </Button>
        </div>
        <Separator />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="space-y-8 p-4 border rounded-lg relative"
              >
                <Button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2 p-2"
                  variant="destructive"
                  disabled={fields.length === 1}
                >
                  <MinusIcon className="size-4" />
                </Button>
                <Heading
                  title={`Product ${index + 1}`}
                  description={`Enter details for product ${index + 1}`}
                />
                <div className="md:grid md:grid-cols-3 gap-8">
                  <FormField
                    control={form.control}
                    name={`products.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={loading}
                            placeholder="Product name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`products.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            disabled={loading}
                            placeholder="9.99"
                            {...field}
                            onChange={e =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`products.${index}.categoryId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                defaultValue={field.value}
                                placeholder="Select a category"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`products.${index}.sizeId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Size</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                defaultValue={field.value}
                                placeholder="Select a size"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sizes.map(size => (
                              <SelectItem key={size.id} value={size.id}>
                                {size.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`products.${index}.colorId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <Select
                          disabled={loading}
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                defaultValue={field.value}
                                placeholder="Select a color"
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colors.map(color => (
                              <SelectItem key={color.id} value={color.id}>
                                {color.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`products.${index}.Featured`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Featured</FormLabel>
                          <FormDescription>
                            This product will appear on the home page
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`products.${index}.Archived`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Archived</FormLabel>
                          <FormDescription>
                            This product will not appear anywhere in the store.
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`products.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <textarea
                            className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={loading}
                            placeholder="Product description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                        {field.value && (
                          <div className="mt-2">
                            <FormLabel>Markdown Preview:</FormLabel>
                            <div className="p-4 border rounded-md bg-gray-50 prose prose-sm max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code({
                                    inline,
                                    className,
                                    children,
                                    ...props
                                  }: ComponentPropsWithoutRef<"code"> & {
                                    inline?: boolean;
                                    node?: unknown;
                                  }) {
                                    const match = /language-(\w+)/.exec(
                                      className || ""
                                    );
                                    return !inline && match ? (
                                      <SyntaxHighlighter
                                        ref={syntaxHighlighterRef}
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        style={vscDarkPlus as any}
                                        language={match[1]}
                                        PreTag="div"
                                        {...props}
                                      >
                                        {String(children).replace(/\n$/, "")}
                                      </SyntaxHighlighter>
                                    ) : (
                                      <code className={className} {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                }}
                              >
                                {field.value}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`products.${index}.ytURL`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>YouTube URL</FormLabel>
                        <FormControl>
                          <Input
                            disabled={loading}
                            placeholder="https://www.youtube.com/watch?v=..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`products.${index}.Image`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Images</FormLabel>
                        <FormControl>
                          <ImageUpload
                            values={field.value.map(image => image.url)}
                            disabled={loading}
                            onChange={url =>
                              field.onChange([...field.value, { url }])
                            }
                            onRemove={url =>
                              field.onChange([
                                ...field.value.filter(
                                  current => current.url !== url
                                ),
                              ])
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button disabled={loading} type="submit">
                Create Products
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default BulkProductForm;
