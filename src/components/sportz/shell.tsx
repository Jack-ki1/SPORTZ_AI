import type { ReactNode } from "react";
import { Nav } from "./top";
import { Footer } from "./bottom";

export function Shell({
  title,
  sub,
  children,
}: {
  title?: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="pb-4">
        {title && (
          <div className="mx-auto max-w-[1560px] px-4 pb-2 pt-8 md:px-8">
            <h1 className="text-4xl font-black text-navy md:text-5xl">{title}</h1>
            {sub && <p className="mt-2 text-muted-foreground">{sub}</p>}
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}

export const Wrap = ({ children, cols = "" }: { children: ReactNode; cols?: string }) => (
  <section className={`mx-auto mt-6 grid max-w-[1560px] gap-5 px-4 md:px-8 ${cols}`}>
    {children}
  </section>
);
