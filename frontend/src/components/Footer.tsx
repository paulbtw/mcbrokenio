import { type PropsWithChildren } from 'react'

function ListItem({ href, children }: PropsWithChildren<{ href: string }>) {
  return (
    <li>
      <a href={href} className="mr-4 hover:underline md:mr-6" rel="noreferrer noopener" target="_blank">
        {children}
      </a>
    </li>
  )
}

export function Footer() {
  return (
    <footer className="my-4">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 sm:text-center">
          This site is no way affiliated with McD&apos;s
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
        <ListItem href="https://github.com/paulbtw/mcbrokenio">Sourcecode</ListItem>
        <ListItem href="https://mcbroken.com">Inspired by McBroken.com</ListItem>

        </ul>
      </div>
    </footer>
  )
}
