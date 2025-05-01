export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black py-5">
      <div className="container mx-auto w-full max-w-full flex flex-col items-center gap-4 px-2">
        <div className="flex items-center gap-1 text-zinc-500">
          <p className="text-center text-sm leading-loose">
            © {new Date().getFullYear()} DPIN Uptime. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
