"use client";
import { useStoreModal } from "@/hooks/use-store-modal";
import { Store } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import React from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  CheckIcon,
  ChevronsUpDownIcon,
  PlusCircleIcon,
  Store as StoreIcon,
} from "lucide-react";
import { Button } from "../ui/button";

type StoreDropdownItems = {
  items: Store[];
};

const StoreDropdown = ({ items = [] }: StoreDropdownItems) => {
  const [open, setOpen] = React.useState(false);
  const storemodal = useStoreModal();
  const params = useParams();
  const { storeId } = params;
  const router = useRouter();

  const formattedItems = items.map(item => ({
    label: item.name,
    value: item.id,
  }));

  const currentStore = formattedItems.find(item => item.value === storeId);

  const onStoreSelect = (store: { label: string; value: string }) => {
    setOpen(false);
    router.push(`/${store.value}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {/* Mobile: icon-only button */}
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
          className="border-border/60 bg-background hover:bg-accent hover:text-accent-foreground transition-colors h-9 w-9 p-0 sm:w-47.5 sm:px-3 sm:justify-between sm:gap-2"
        >
          <StoreIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="hidden sm:block truncate flex-1 text-left text-sm font-medium">
            {currentStore?.label ?? "Select store"}
          </span>
          <ChevronsUpDownIcon className="hidden sm:block size-3.5 shrink-0 text-muted-foreground/60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="min-w-52 w-47.5 sm:w-57.5 p-0 border-border/60 shadow-lg shadow-black/20"
      >
        <Command>
          <CommandInput placeholder="Search store..." className="h-9 text-sm" />
          <CommandList className="max-h-52 overflow-y-auto">
            <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">
              No store found.
            </CommandEmpty>
            <CommandGroup heading="Stores">
              {formattedItems.map(item => (
                <CommandItem
                  key={item.value}
                  onSelect={() => onStoreSelect(item)}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <StoreIcon className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate flex-1">{item.label}</span>
                  <CheckIcon
                    className={cn(
                      "size-4 shrink-0 text-primary transition-opacity",
                      currentStore?.value === item.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  storemodal.onOpen();
                }}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <PlusCircleIcon className="size-4 shrink-0 text-muted-foreground" />
                <span>Create Store</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default StoreDropdown;
