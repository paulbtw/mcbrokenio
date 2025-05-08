export function Header() {
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-red-500 p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5.7 21a2 2 0 0 1-3.4-1.4L4 13" />
              <path d="M18 21a2 2 0 0 0 3.4-1.4L19.6 13" />
              <path d="M12 12c-1.3 0-2.5-.5-3.4-1.4A4.8 4.8 0 0 1 7 7a4.3 4.3 0 0 1 1-3A4.3 4.3 0 0 1 12 3a4.3 4.3 0 0 1 4 1 4.3 4.3 0 0 1 1 3 4.8 4.8 0 0 1-1.6 3.6c-.9.9-2.1 1.4-3.4 1.4Z" />
              <path d="M6 16.5a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v5H6Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            McBroken
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/yourusername/mcbroken"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            Source Code
          </a>
        </div>
      </div>
    </header>
  );
}
