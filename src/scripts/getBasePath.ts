import getConfig from "next/config";

export function getBasePath() {
  return getConfig().publicRuntimeConfig.basePath as string;
}
