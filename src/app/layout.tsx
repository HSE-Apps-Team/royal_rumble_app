import type { Metadata } from "next";
import Link from "next/link";
import "bootstrap/dist/css/bootstrap.min.css";
import "./css/globals.css";
import { AlertProvider } from "./context/AlertContext";
import AlertMessage from "./components/AlertMessage";
import { ToastProvider } from "./context/ToastContext";
import ToastStack from "./components/ToastStack";
import Providers from "./components/Providers";
import { getAllJobs } from "@/actions/job";

export const dynamic = "force-dynamic";
const DEV_MODE = process.env.DEV_MODE === "true";

export const metadata: Metadata = {
  title: "HSE Royal Rumble",
  description: "The hub for all things Royal Rumble!",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jobs = DEV_MODE ? await getAllJobs() : [];
  return (
    <html lang="en">
      <meta
        name="google-site-verification"
        content="4qQNMiu8SYv85Vqc-QJVUjQ7bkKEUOK4FExDoKsMUQQ"
      />
      <body>
        <Providers>
          <AlertProvider>
            <ToastProvider>
              {DEV_MODE && (
                <nav
                  style={{
                    textAlign: "center",
                    padding: "30px",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "4px 8px",
                  }}
                >
                  <Link href="/">Home</Link> | <Link href="/faq">FAQ</Link> |{" "}
                  {jobs.map((job) => (
                    <span key={job.slug}>
                      <Link href={`/mentor/${job.slug}`}>{job.label}</Link> |{" "}
                    </span>
                  ))}
                  <Link href="/admin">Admin</Link>
                </nav>
              )}

              {/* The alert UI that appears at the top of the screen */}
              <AlertMessage />

              {/* The toast stack that appears in the bottom-right corner */}
              <ToastStack />

              {children}
            </ToastProvider>
          </AlertProvider>
        </Providers>
      </body>
    </html>
  );
}
