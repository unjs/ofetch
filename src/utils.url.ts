/* eslint-disable unicorn/prefer-at */
export type QueryValue =
  | string
  | number
  | boolean
  | QueryValue[]
  | Record<string, any>
  | null
  | undefined;
export type QueryObject = Record<string, QueryValue | QueryValue[]>;

/**
 * Joins the given base URL and path, ensuring that there is only one slash between them.
 */
export function joinURL(base?: string, path?: string): string {
  if (!base || base === "/") {
    return path || "/";
  }

  if (!path || path === "/") {
    return base || "/";
  }

  const baseHasTrailing = base[base.length - 1] === "/";
  const pathHasLeading = path[0] === "/";
  if (baseHasTrailing && pathHasLeading) {
    return base + path.slice(1);
  }

  if (!baseHasTrailing && !pathHasLeading) {
    return `${base}/${path}`;
  }

  return base + path;
}

/**
 * Adds the base path to the input path, if it is not already present.
 */
export function withBase(input = "", base = ""): string {
  if (!base || base === "/") {
    return input;
  }

  if (!base.includes("?") && !base.includes("#")) {
    const _base = withoutTrailingSlash(base);
    if (input.startsWith(_base)) {
      return input;
    }

    return joinURL(_base, input);
  }

  const baseHashIndex = base.indexOf("#");
  const baseHash = baseHashIndex === -1 ? "" : base.slice(baseHashIndex);
  const baseWithoutHash =
    baseHashIndex === -1 ? base : base.slice(0, baseHashIndex);

  const baseQueryIndex = baseWithoutHash.indexOf("?");
  const baseQuery =
    baseQueryIndex === -1 ? "" : baseWithoutHash.slice(baseQueryIndex + 1);
  const basePath =
    baseQueryIndex === -1
      ? baseWithoutHash
      : baseWithoutHash.slice(0, baseQueryIndex);

  const inputHashIndex = input.indexOf("#");
  const inputHash = inputHashIndex === -1 ? "" : input.slice(inputHashIndex);
  const inputWithoutHash =
    inputHashIndex === -1 ? input : input.slice(0, inputHashIndex);

  const inputQueryIndex = inputWithoutHash.indexOf("?");
  const inputQuery =
    inputQueryIndex === -1 ? "" : inputWithoutHash.slice(inputQueryIndex + 1);
  const inputPath =
    inputQueryIndex === -1
      ? inputWithoutHash
      : inputWithoutHash.slice(0, inputQueryIndex);

  const _basePath = withoutTrailingSlash(basePath);
  const joinedPath = inputPath.startsWith(_basePath)
    ? inputPath
    : joinURL(_basePath, inputPath);

  let query = "";
  if (baseQuery && inputQuery) {
    const searchParams = new URLSearchParams(baseQuery);
    const inputParams = new URLSearchParams(inputQuery);
    const seen = new Set<string>();
    for (const [key, value] of inputParams) {
      if (seen.has(key)) {
        searchParams.append(key, value);
      } else {
        seen.add(key);
        searchParams.set(key, value);
      }
    }
    query = searchParams.toString();
  } else if (baseQuery || inputQuery) {
    query = baseQuery || inputQuery;
  }

  const hash = inputHash || baseHash;

  return `${joinedPath}${query ? `?${query}` : ""}${hash}`;
}

function withoutTrailingSlash(path?: string): string {
  if (!path || path === "/") {
    return "/";
  }

  return path[path.length - 1] === "/" ? path.slice(0, -1) : path;
}

/**
 * Returns the URL with the given query parameters. If a query parameter is undefined, it is omitted.
 */
export function withQuery(input: string, query?: QueryObject): string {
  if (!query || Object.keys(query).length === 0) {
    return input;
  }

  const searchIndex = input.indexOf("?");

  if (searchIndex === -1) {
    const normalizedQuery = Object.entries(query)
      .filter(([, value]) => value !== undefined)
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map((item) => [key, normalizeQueryValue(item)]);
        }

        return [[key, normalizeQueryValue(value)]];
      });
    const searchParams = new URLSearchParams(normalizedQuery);
    const queryString = searchParams.toString();
    return queryString ? `${input}?${queryString}` : input;
  }

  const searchParams = new URLSearchParams(input.slice(searchIndex + 1));
  const base = input.slice(0, searchIndex);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      searchParams.delete(key);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, normalizeQueryValue(item));
      }
    } else {
      searchParams.set(key, normalizeQueryValue(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${base}?${queryString}` : base;
}

function normalizeQueryValue(value: QueryValue): string {
  if (value === null) {
    return "";
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
