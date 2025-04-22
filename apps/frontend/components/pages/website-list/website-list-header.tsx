import { Download, HelpCircle, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function WebsiteListHeader() {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Websites</h1>
        <p className="text-sm text-zinc-500">Manage and monitor all your websites in one place.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 border-zinc-800 bg-zinc-950">
                <UploadCloud className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Import</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Import websites from CSV or JSON</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 border-zinc-800 bg-zinc-950">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export websites to CSV or JSON</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1 border-zinc-800 bg-zinc-950">
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Help</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Learn how to manage your websites</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
