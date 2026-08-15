"use client";

import Link from "next/link";

import {
  ArrowRight,
  FileText,
  FolderOpen,
} from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

const actions = [
  {
    title: "Upload Document",
    description:
      "Upload PDF or image documents for AI processing.",
    href: "/analyze",
    icon: FileText,
  },
  {
    title: "Documents",
    description:
      "Browse and manage all uploaded documents.",
    href: "/documents",
    icon: FolderOpen,
  },
];

export default function QuickActions() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Quick Actions
        </h2>

        <p className="mt-2 text-muted-foreground">
          Frequently used workflows.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
            >
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-xl">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-lg font-semibold">
                    {action.title}
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
                    {action.description}
                  </p>

                  <div className="mt-6 flex items-center text-sm font-medium text-primary">
                    Open

                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}