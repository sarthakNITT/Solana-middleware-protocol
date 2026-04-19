import { DocsConfig } from "@/types/docs";

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "Docs",
      href: "/docs",
    },
    {
      title: "Github",
      href: "https://github.com/sendra-protocol",
      external: true,
    },
  ],
  sidebarNav: [
    {
      title: "Introduction",
      items: [
        {
          title: "Getting Started",
          href: "/docs/getting-started",
        },
        {
          title: "Quickstart",
          href: "/docs/quickstart",
          dot: true,
        },
        {
          title: "Installation",
          href: "/docs/installation",
        },
      ],
    },
    {
      title: "Core",
      items: [
        {
          title: "Core Concepts",
          href: "/docs/core-concepts",
        },
        {
          title: "Execution Model",
          href: "/docs/execution-model",
        },
        {
          title: "Reliability Engine",
          href: "/docs/reliability-engine",
          dot: true,
        },
      ],
    },
    {
      title: "SDK",
      items: [
        {
          title: "API Reference",
          href: "/docs/sdk",
        },
        {
          title: "Params vs Built TX",
          href: "/docs/params-vs-built-tx",
        },
        {
          title: "Signer Pattern",
          href: "/docs/signer",
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          title: "Transaction Lifecycle",
          href: "/docs/transaction-lifecycle",
        },
        {
          title: "Architecture",
          href: "/docs/architecture",
        },
      ],
    },
    {
      title: "Guides",
      items: [
        {
          title: "Swap Integration",
          href: "/docs/swap-integration",
        },
        {
          title: "Backend Usage",
          href: "/docs/backend-usage",
        },
        {
          title: "Wallet Usage",
          href: "/docs/wallet-usage",
        },
      ],
    },
    {
      title: "Resources",
      items: [
        {
          title: "FAQ",
          href: "/docs/faq",
        },
      ],
    },
  ],
};

export const sidebarItems = docsConfig.sidebarNav;
