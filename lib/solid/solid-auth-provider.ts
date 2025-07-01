import { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth"

export interface SolidProfile {
  sub: string
  webid: string
  name?: string
  email?: string
  picture?: string
  iss: string
  aud: string
  exp: number
  iat: number
}

export default function SolidProvider<P extends SolidProfile>(
  options: OAuthUserConfig<P> & {
    issuer: string
  }
): OAuthConfig<P> {
  return {
    id: "solid",
    name: "Solid",
    type: "oauth",
    wellKnown: `${options.issuer}/.well-known/openid-configuration`,
    authorization: {
      params: {
        scope: "openid profile offline_access",
        grant_type: "authorization_code",
      },
    },
    idToken: true,
    checks: ["pkce", "state"],
    profile(profile) {
      return {
        id: profile.sub,
        webid: profile.webid,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }
    },
    style: {
      logo: "/solid-logo.svg",
      bg: "#7C4DFF",
      text: "#fff",
    },
    options,
  }
}