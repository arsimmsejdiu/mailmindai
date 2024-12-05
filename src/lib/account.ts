import {
  EmailMessage,
  SendEmailsProps,
  SyncResponse,
  SyncUpdatedResponse,
  Response,
} from "@/lib/types";
import { db } from "@/server/db";
import axios from "axios";
import { syncEmailsToDatabase } from "@/lib/sync-to-db";

const API_BASE_URL = "https://api.aurinko.io/v1";

class Account {
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async startSync(daysWithin: number): Promise<SyncResponse> {
    const response = await axios.post<SyncResponse>(
      `${API_BASE_URL}/email/sync`,
      {},
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
        params: {
          daysWithin,
          bodyType: "html",
        },
      },
    );
    return response.data;
  } // end of StartSync

  async createSubscription() {
    const webhookUrl =
      process.env.NODE_ENV === "development"
        ? "https://potatoes-calculator-reports-crisis.trycloudflare.com"
        : process.env.NEXT_PUBLIC_URL;
    const res = await axios.post(
      "https://api.aurinko.io/v1/subscriptions",
      {
        resource: "/email/messages",
        notificationUrl: webhookUrl + "/api/aurinko/webhook",
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      },
    );
    return res.data;
  } // end of createSubscription

  async syncEmails() {
    const account = await db.account.findUnique({
      where: {
        token: this.token,
      },
    });
    if (!account) throw new Error("Invalid Token");
    if (account.nextDeltaToken) throw new Error("No delta token found");
    let response = await this.getUpdatedEmails({
      deltaToken: account.nextDeltaToken || undefined,
    });
    let allEmails: EmailMessage[] = response.records;
    let storedDeltaToken = account.nextDeltaToken;
    if (response.nextDeltaToken) {
      storedDeltaToken = response.nextDeltaToken;
    }
    while (response.nextPageToken) {
      response = await this.getUpdatedEmails({
        pageToken: response.nextPageToken,
      });
      allEmails = allEmails.concat(response.records);
      if (response.nextDeltaToken) {
        storedDeltaToken = response.nextDeltaToken;
      }
    }

    if (!response) throw new Error("Failed to sync emails");

    try {
      await syncEmailsToDatabase(allEmails, account.id);
    } catch (error) {
      console.log("Error in syncEmail", error);
    }

    await db.account.update({
      where: {
        id: account.id,
      },
      data: {
        nextDeltaToken: storedDeltaToken,
      },
    });
  } // end of syncEmails

  async getUpdatedEmails({
    deltaToken,
    pageToken,
  }: {
    deltaToken?: string;
    pageToken?: string;
  }): Promise<SyncUpdatedResponse> {
    // console.log('getUpdatedEmails', { deltaToken, pageToken });
    let params: Record<string, string> = {};
    if (deltaToken) {
      params.deltaToken = deltaToken;
    }
    if (pageToken) {
      params.pageToken = pageToken;
    }
    const response = await axios.get<SyncUpdatedResponse>(
      `${API_BASE_URL}/email/sync/updated`,
      {
        params,
        headers: { Authorization: `Bearer ${this.token}` },
      },
    );
    return response.data;
  } // end of getUpdatedEmails

  async performInitialSync() {
    try {
      const daysWithin = 3;
      let syncResponse = await this.startSync(daysWithin); // sync email from the last 7 days

      //Wait until sync is ready
      while (!syncResponse.ready) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second
        syncResponse = await this.startSync(daysWithin);
      }

      // Perform initial sync of updated emails
      let storedDeltaToken: string = syncResponse.syncUpdatedToken;
      let updatedResponse = await this.getUpdatedEmails({
        deltaToken: syncResponse.syncUpdatedToken,
      });
      if (updatedResponse.nextDeltaToken) {
        storedDeltaToken = updatedResponse.nextDeltaToken;
      }
      let allEmails: EmailMessage[] = updatedResponse.records;

      // Fetch all pages if there are more
      while (updatedResponse.nextPageToken) {
        updatedResponse = await this.getUpdatedEmails({
          pageToken: updatedResponse.nextPageToken,
        });
        allEmails = allEmails.concat(updatedResponse.records);
        if (updatedResponse.nextDeltaToken) {
          storedDeltaToken = updatedResponse.nextDeltaToken;
        }
      }

      // TODO: Store the nextDeltaToken for future incremental syncs
      // Example of using the stored delta token for an incremental sync
      // await this.performIncrementalSync(storedDeltaToken);
      return {
        emails: allEmails,
        deltaToken: storedDeltaToken,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Error during sync:",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.error("Error during sync:", error);
      }
    }
  }

  async sendEmail({
    from,
    subject,
    body,
    inReplyTo,
    references,
    threadId,
    to,
    cc,
    bcc,
    replyTo,
  }: SendEmailsProps) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/email/messages`,
        {
          from,
          subject,
          body,
          inReplyTo,
          references,
          threadId,
          to,
          cc,
          bcc,
          replyTo: [replyTo],
        },
        {
          params: {
            returnIds: true,
          },
          headers: { Authorization: `Bearer ${this.token}` },
        },
      );

      console.log("sendmail", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(
          "Error sending email: ",
          JSON.stringify(error.response?.data, null, 2),
        );
      } else {
        console.log("Error sending email: ", error);
      }
    }
  } // end of sendEmail

  async getWebhooks() {
    const res = await axios.get<Response>(`${API_BASE_URL}/subscriptions`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
    });

    return res.data;
  } // end of getWebhooks

  async createWebhook(resource: string, notificationUrl: string) {
    const res = await axios.post(
      `${API_BASE_URL}/subscriptions`,
      {
        resource,
        notificationUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.data;
  } // end of createWebhook

  async deleteWebhook(subscriptionId: string) {
    const res = await axios.delete(
      `${API_BASE_URL}/subscriptions/${subscriptionId}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.data;
  }
} // end of class Account

type EmailAddress = {
  name: string;
  address: string;
};

export default Account;
