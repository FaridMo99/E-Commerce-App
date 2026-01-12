import path from "path";
import maxmind from "maxmind";

const dbPath = path.join(import.meta.dirname, "../data", "ip-to-country.mmdb");
export const lookup = await maxmind.open(dbPath);
