import axios from "axios";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL); // ex: redis://localhost:6379

const CAILUN_BASE_URL = process.env.CAILUN_URL;
const CAILUN_EMAIL = process.env.CAILUN_EMAIL;
const CAILUN_PASSWORD = process.env.CAILUN_PASSWORD;

async function loginCailun() {
  try {
    const { data } = await axios.post(`${CAILUN_BASE_URL}/login`, {
      email: CAILUN_EMAIL,
      password: CAILUN_PASSWORD,
    });

    const token = data.accessToken.token;
    const expireAt = data.accessToken.expireAt; // timestamp em segundos

    // calcula TTL (expiração - agora)
    const now = Math.floor(Date.now() / 1000);
    const ttl = expireAt - now - 60; // menos 1 min de segurança

    await redis.set("cailun:token", token, "EX", ttl);

    console.log("Novo token Cailun salvo no Redis.");
    return token;
  } catch (err) {
    console.error("Erro ao autenticar no Cailun:", err.message);
    throw err;
  }
}

async function getToken() {
  let token = await redis.get("cailun:token");

  if (!token) {
    token = await loginCailun();
  }

  return token;
}

async function callCailun(path, method = "GET", body = null) {
  const token = await getToken();

  const config = {
    url: `${CAILUN_BASE_URL}${path}`,
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: body,
  };

  const { data } = await axios(config);
  return data;
}

export default {
  loginCailun,
  getToken,
  callCailun,
};
