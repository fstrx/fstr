import { ConsoleHello } from "@/components/console-hello";
import {
  AboutRender,
  ExperienceRender,
  InterestsRender,
  NowRender,
  ProjectsRender,
  SecurityRender,
} from "@/components/renders";
import { SiteHeader } from "@/components/site-header";
import { LastLogin } from "@/components/term/last-login";
import { Shell } from "@/components/term/shell";
import { TmuxBar } from "@/components/term/tmux-bar";
import { Workspace } from "@/components/workspace";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <SiteHeader />
      <main id="main" className="flex min-h-0 flex-1 flex-col">
        <Workspace
          renders={{
            about: <AboutRender />,
            projects: <ProjectsRender />,
            experience: <ExperienceRender />,
            interests: <InterestsRender />,
            now: <NowRender />,
            security: <SecurityRender />,
          }}
          shell={
            <>
              <LastLogin />
              <div className="mt-4">
                <Shell />
              </div>
            </>
          }
        />
      </main>
      <TmuxBar />
      <ConsoleHello />
    </div>
  );
}
