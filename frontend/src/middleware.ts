import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookie } from "cookies-next";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  console.log({ token: req });

  // const response = await axios.post(
  //   process.env.NEXT_PUBLIC_API_RESOURCE + "/auth/refresh",
  //   {},
  //   { withCredentials: true }
  // );

  // console.log({ response });

  // Get the token from the cookies
  const token = await getCookie("token", { req });

  console.log({ token });

  // Check if the token exists
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: "/",
};
