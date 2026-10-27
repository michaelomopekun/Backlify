import Conf from "conf";

export interface GlobalCredentials {
  apiKey?: string;
  apiUrl?: string;
  userEmail?: string;
  defaultOrgId?: string;
}

const conf = new Conf<GlobalCredentials>({
  projectName: "backlify",
  defaults: {
    apiUrl: process.env.BACKLIFY_API_URL || "http://localhost:3000",
  },
});

export const globalConfig = {
  get: (): GlobalCredentials => {
    return {
      apiKey: process.env.BACKLIFY_API_KEY || conf.get("apiKey"),
      apiUrl:
        process.env.BACKLIFY_API_URL ||
        conf.get("apiUrl") ||
        "http://localhost:3000",
      userEmail: conf.get("userEmail"),
      defaultOrgId: conf.get("defaultOrgId"),
    };
  },

  set: (creds: Partial<GlobalCredentials>) => {
    if (creds.apiKey !== undefined) conf.set("apiKey", creds.apiKey);
    if (creds.apiUrl !== undefined) conf.set("apiUrl", creds.apiUrl);
    if (creds.userEmail !== undefined) conf.set("userEmail", creds.userEmail);
    if (creds.defaultOrgId !== undefined) conf.set("defaultOrgId", creds.defaultOrgId);
  },

  clear: () => {
    conf.clear();
  },

  getPath: () => conf.path,
};
