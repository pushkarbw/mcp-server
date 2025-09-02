import { uploadApp } from "../native-execution/appautomate.js";
import {
  AppSDKSupportedTestingFramework,
  AppSDKSupportedTestingFrameworkEnum,
  createStep,
} from "./index.js";
import { SUPPORTED_CONFIGURATIONS } from "./types.js";

export function isBrowserStackAppUrl(appPath: string): boolean {
  return appPath.startsWith("bs://");
}

export function generateBuildName(baseName: string = "app-automate"): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, "");
  return `${baseName}-${timestamp}`;
}

export function createError(
  message: string,
  context?: Record<string, any>,
): Error {
  const error = new Error(message);
  if (context) {
    (error as any).context = context;
  }
  return error;
}

// Platform utilities for cross-platform support
export const PLATFORM_UTILS = {
  isWindows: process.platform === "win32",
  isMac: process.platform === "darwin",
  isAppleSilicon: process.platform === "darwin" && process.arch === "arm64",
  getPlatformLabel: () => {
    switch (process.platform) {
      case "win32":
        return "Windows";
      case "darwin":
        return "macOS";
      default:
        return "macOS";
    }
  },
};

export async function getAppUploadInstruction(
  appPath: string,
  username: string,
  accessKey: string,
  detectedTestingFramework: AppSDKSupportedTestingFramework,
): Promise<string> {
  if (
    detectedTestingFramework ===
      AppSDKSupportedTestingFrameworkEnum.nightwatch ||
    detectedTestingFramework ===
      AppSDKSupportedTestingFrameworkEnum.webdriverio ||
    detectedTestingFramework ===
      AppSDKSupportedTestingFrameworkEnum.cucumberRuby
  ) {
    const app_url = await uploadApp(appPath, username, accessKey);
    if (app_url) {
      return createStep(
        "Updating app_path with app_url",
        `Replace the value of app_path in your configuration with: ${app_url}`,
      );
    }
  }
  return "";
}

export type SupportedFramework = keyof typeof SUPPORTED_CONFIGURATIONS;
type SupportedLanguage =
  keyof (typeof SUPPORTED_CONFIGURATIONS)[SupportedFramework];
type SupportedTestingFramework = string;

export function validateSupportforAppAutomate(
  framework: SupportedFramework,
  language: SupportedLanguage,
  testingFramework: SupportedTestingFramework,
) {
  const frameworks = Object.keys(
    SUPPORTED_CONFIGURATIONS,
  ) as SupportedFramework[];
  if (!SUPPORTED_CONFIGURATIONS[framework]) {
    throw new Error(
      `Unsupported framework '${framework}'. Supported frameworks: ${frameworks.join(", ")}`,
    );
  }

  const languages = Object.keys(
    SUPPORTED_CONFIGURATIONS[framework],
  ) as SupportedLanguage[];
  if (!SUPPORTED_CONFIGURATIONS[framework][language]) {
    throw new Error(
      `Unsupported language '${language}' for framework '${framework}'. Supported languages: ${languages.join(", ")}`,
    );
  }

  const testingFrameworks = SUPPORTED_CONFIGURATIONS[framework][language];
  if (!testingFrameworks.includes(testingFramework)) {
    throw new Error(
      `Unsupported testing framework '${testingFramework}' for language '${language}' and framework '${framework}'. Supported testing frameworks: ${testingFrameworks.join(", ")}`,
    );
  }
}
