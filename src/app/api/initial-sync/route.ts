import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";

export const maxDuration = 300;

export const POST = async (req: NextRequest) => {
  const body = await req.json();
  const {accountId, userId} = body;
  if(!accountId || !userId) return NextResponse.json({error: "Invalid request"}, {status: 400});

  // const dbAccount = await db.account.findUnique({
  //   where: {
  //     id: accountId,
  //     userId: userId,
  //   }
  // });
  //
  // if(!dbAccount) return NextResponse.json({error: "Account not found"}, {status: 404});

  return NextResponse.json({success: true});
}