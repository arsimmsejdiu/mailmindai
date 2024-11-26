import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ResponseMessageAndStatus = (message: string, status?: number) => {
  return NextResponse.json({ message: message }, { status: status });
};
