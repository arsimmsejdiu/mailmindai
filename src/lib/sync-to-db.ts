import { create, insert, search, save, load, type AnyOrama } from "@orama/orama";
import { persist, restore } from "@orama/plugin-data-persistence";
import { db } from "@/server/db";

export class OramaManager {
  // @ts-ignore
  private orama: AnyOrama;
  private accountId: string;

  constructor(accountId: string) {
    this.accountId = accountId;
  }

  async initialize() {
    const account = await db.account.findUnique({
      where: { id: this.accountId },
      select: { binaryIndex: true }
    });

    if (!account) throw new Error('Account not found');

    if (account.binaryIndex) {
      this.orama = await restore('json', account.binaryIndex as any);
    } else {
      this.orama = create({
        schema: {
          title: "string",
          body: "string",
          rawBody: "string",
          from: "string",
          to: "string[]",
          sentAt: "string",
          embeddings: "vector[1536]",
          threadId: "string",
        },
      });

    }
  }
}
