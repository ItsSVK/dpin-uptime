"use client"

import { useState } from "react"
import { ChevronDown, Filter, Search, SortAsc, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function WebsiteListFilters() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])

  // Mock tags for the filter
  const availableTags = ["production", "staging", "development", "e-commerce", "blog", "api", "internal", "client"]

  // Status options
  const statusOptions = [
    { value: "online", label: "Online" },
    { value: "offline", label: "Offline" },
    { value: "degraded", label: "Degraded" },
  ]

  // Sort options
  const sortOptions = [
    { value: "name-asc", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "uptime-asc", label: "Uptime (Low to High)" },
    { value: "uptime-desc", label: "Uptime (High to Low)" },
    { value: "response-asc", label: "Response Time (Fast to Slow)" },
    { value: "response-desc", label: "Response Time (Slow to Fast)" },
    { value: "last-checked", label: "Last Checked" },
  ]

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  // Toggle status selection
  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status))
    } else {
      setSelectedStatuses([...selectedStatuses, status])
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedTags([])
    setSelectedStatuses([])
  }

  // Check if any filters are applied
  const hasFilters = selectedTags.length > 0 || selectedStatuses.length > 0

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input type="search" placeholder="Search websites..." className="w-full border-zinc-800 bg-zinc-950 pl-8" />
        </div>
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 border-zinc-800 bg-zinc-950">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {hasFilters && (
                  <Badge className="ml-1 bg-emerald-500 text-white">
                    {selectedTags.length + selectedStatuses.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-950">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              {statusOptions.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status.value}
                  checked={selectedStatuses.includes(status.value)}
                  onCheckedChange={() => toggleStatus(status.value)}
                >
                  {status.label}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator className="bg-zinc-800" />

              <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
              {availableTags.map((tag) => (
                <DropdownMenuCheckboxItem
                  key={tag}
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => toggleTag(tag)}
                >
                  {tag}
                </DropdownMenuCheckboxItem>
              ))}

              {hasFilters && (
                <>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-500 hover:text-red-600"
                    onClick={clearFilters}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Clear filters
                  </Button>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 border-zinc-800 bg-zinc-950">
                <SortAsc className="h-4 w-4" />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-950">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              {sortOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={option.value === "name-asc"} // Default sort
                >
                  {option.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1 border-zinc-800 bg-zinc-950">
                <Tag className="h-4 w-4" />
                <span>Group</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-zinc-800 bg-zinc-950">
              <DropdownMenuCheckboxItem checked>None</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Group by Status</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Group by Tag</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Group by Check Frequency</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active filters display */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-zinc-400">Active filters:</span>
          {selectedStatuses.map((status) => (
            <Badge key={status} variant="outline" className="gap-1 border-zinc-700 bg-zinc-900">
              Status: {status}
              <button onClick={() => toggleStatus(status)}>
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          ))}
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 border-zinc-700 bg-zinc-900">
              Tag: {tag}
              <button onClick={() => toggleTag(tag)}>
                <X className="h-3 w-3" />
                <span className="sr-only">Remove filter</span>
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-xs text-zinc-400 hover:text-zinc-300"
            onClick={clearFilters}
          >
            <X className="h-3 w-3" />
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
