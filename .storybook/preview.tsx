import type { Preview } from "@storybook/react";
import React, { useEffect } from "react";
import { DESIGN_VERSION } from "../src/config/designVersion";

void import(`../src/themes/${DESIGN_VERSION}/tokens.css`);
import "../src/styles/index.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Remove the default backgrounds addon — theme is controlled by the toolbar above
    backgrounds: { disable: true },
    options: {
      // Serializable form only — Storybook evals this; no arrow functions here.
      storySort: {
        method: "alphabetical",
        order: ["Design System", "UI", "App", "Content"],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const isDark = (context.globals.theme ?? "light") === "dark";
      const isFullscreen = context.parameters.layout === "fullscreen";

      // Sync the <html> element class so CSS variables resolve correctly
      useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
          root.classList.add("dark");
        } else {
          root.classList.remove("dark");
        }
        return () => root.classList.remove("dark");
      }, [isDark]);

      if (isFullscreen) {
        return (
          <div style={{ height: "100vh", overflow: "hidden", fontSize: "var(--font-size, 13px)" }}>
            <Story />
          </div>
        );
      }

      return (
        <div
          style={{
            minHeight: "100vh",
            padding: "1.5rem",
            background: isDark ? "#13161b" : "#f5f5f7",
            fontSize: "var(--font-size, 13px)",
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
