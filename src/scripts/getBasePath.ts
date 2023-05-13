const { BASE_PATH } = process.env;

export function getBasePath() {
  return BASE_PATH ?? "";
}
