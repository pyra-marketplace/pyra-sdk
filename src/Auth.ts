import { Connector, SYSTEM_CALL } from "@meteor-web3/connector";
import { http } from "./utils";

export class Auth {
  static async login({
    connector,
    redirectUrl
  }: {
    connector: Connector;
    redirectUrl?: string;
  }) {
    const codeRes: any = await http.request({
      url: "code",
      method: "post"
    });
    const sigObj = await connector.runOS({
      method: SYSTEM_CALL.signWithSessionKey,
      params: {
        code: codeRes.code,
        requestPath: "/api/v1/twitter/login"
      }
    });
    const { siweMessage, jws } = sigObj;
    const res = await http.request({
      url: `twitter/login?redirect_url=${redirectUrl}`,
      method: "post",
      headers: {
        Authorization: `Bearer ${(jws as any).signatures[0].protected}.${
          (jws as any).payload
        }.${(jws as any).signatures[0].signature}`,
        "x-pyra-siwe": btoa(JSON.stringify(siweMessage))
      }
    });
    return res;
  }

  static async bind({ state, code }: { state?: string; code?: string }) {
    const res = await http.request({
      url: `twitter/bind?state=${state}&code=${code}`,
      method: "post"
    });
    return res;
  }

  static async info({
    address,
    twitterId
  }: {
    address?: string;
    twitterId?: string;
  }) {
    const res = await http.request({
      url: `twitter/info`,
      method: "get",
      params: {
        address,
        twitter_id: twitterId
      }
    });
    return res;
  }
}
