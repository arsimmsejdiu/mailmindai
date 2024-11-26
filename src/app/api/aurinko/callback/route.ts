import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getAccountDetails, getAurinkoToken } from "@/lib/aurinko";
import { ResponseMessageAndStatus } from "@/lib/utils";
import { db } from "@/server/db";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) return ResponseMessageAndStatus("Unauthorized", 401);

  const params = req.nextUrl.searchParams;

  const status = params.get("status");
  if (status !== "success") return ResponseMessageAndStatus("Failed to link account with Aurinko", 400);

  const code = params.get("code");
  if (!code) return NextResponse.json({ message: "No code provided" }, { status: 400 });

  const token = await getAurinkoToken(code);
  if (!token) return ResponseMessageAndStatus("Failed to exchange code for access token",400);

  const accountDetails = await getAccountDetails(token.accessToken);

  await db.account.upsert({
    where: { id: token.accountId.toString() },
    create: {
      id: token.accountId.toString(),
      userId,
      token: token.accessToken,
      provider: 'Aurinko',
      emailAddress: accountDetails.email,
      name: accountDetails.name
    },
    update: {
      token: token.accessToken,
    }
  })

  return NextResponse.redirect(new URL("/mail", req.url));
};
