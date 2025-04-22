"use client"

import type React from "react"

import { useState } from "react"
import { AlertTriangle, Globe, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface WebsiteAddDialogProps {
  children: React.ReactNode
}

export function WebsiteAddDialog({ children }: WebsiteAddDialogProps) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [checkFrequency, setCheckFrequency] = useState("60")
  const [alertThreshold, setAlertThreshold] = useState("3")
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate URL
    if (!url) {
      setValidationError("Please enter a valid URL")
      return
    }

    // Simulate validation
    setIsValidating(true)
    setValidationError(null)

    // Mock API call
    setTimeout(() => {
      setIsValidating(false)

      // Close dialog on success
      setOpen(false)

      // Reset form
      setUrl("")
      setName("")
      setTags([])
      setTagInput("")
      setCheckFrequency("60")
      setAlertThreshold("3")
    }, 1500)
  }

  // Add a tag
  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput])
      setTagInput("")
    }
  }

  // Remove a tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Handle tag input keydown
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add New Website</DialogTitle>
          <DialogDescription>Enter the details of the website you want to monitor.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {validationError && (
            <div className="mb-4 flex items-start gap-2 rounded-md bg-red-500/10 p-3 text-sm text-red-500">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>{validationError}</div>
            </div>
          )}

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  // Auto-generate name from URL if name is empty
                  if (!name) {
                    try {
                      const urlObj = new URL(e.target.value)
                      setName(urlObj.hostname)
                    } catch (e) {
                      // Invalid URL, ignore
                    }
                  }
                }}
                className="border-zinc-800 bg-zinc-900"
              />
              <p className="text-xs text-zinc-500">Enter the full URL including https:// or http://</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                placeholder="My Website"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-zinc-800 bg-zinc-900"
              />
              <p className="text-xs text-zinc-500">A friendly name to identify this website</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="tags"
                  placeholder="Add tags (e.g., production, blog)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  className="border-zinc-800 bg-zinc-900"
                />
                <Button type="button" variant="outline" onClick={addTag} className="border-zinc-800 bg-zinc-900">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="gap-1 border-zinc-700 bg-zinc-900">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {tag} tag</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="check-frequency">Check Frequency</Label>
                <Select value={checkFrequency} onValueChange={setCheckFrequency}>
                  <SelectTrigger id="check-frequency" className="border-zinc-800 bg-zinc-900">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-800 bg-zinc-950">
                    <SelectItem value="30">Every 30 seconds</SelectItem>
                    <SelectItem value="60">Every 60 seconds</SelectItem>
                    <SelectItem value="300">Every 5 minutes</SelectItem>
                    <SelectItem value="600">Every 10 minutes</SelectItem>
                    <SelectItem value="1800">Every 30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="alert-threshold">Alert Threshold</Label>
                <Select value={alertThreshold} onValueChange={setAlertThreshold}>
                  <SelectTrigger id="alert-threshold" className="border-zinc-800 bg-zinc-900">
                    <SelectValue placeholder="Select threshold" />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-800 bg-zinc-950">
                    <SelectItem value="1">After 1 failure</SelectItem>
                    <SelectItem value="2">After 2 failures</SelectItem>
                    <SelectItem value="3">After 3 failures</SelectItem>
                    <SelectItem value="5">After 5 failures</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this website"
                className="border-zinc-800 bg-zinc-900"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-zinc-800 bg-zinc-900"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={isValidating}>
              {isValidating ? (
                <>
                  <Globe className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>Add Website</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
