import { ConsoleHello } from "@/components/console-hello";
import { Editor } from "@/components/editor/editor";
import { Elsewhere } from "@/components/elsewhere";
import { Hero } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-[1160px] px-4 sm:px-6">
      <SiteHeader />
      <main id="main">
        <Hero />
        <Editor />
        <Elsewhere />
      </main>
      <SiteFooter />
      <ConsoleHello />
    </div>
  );
}
