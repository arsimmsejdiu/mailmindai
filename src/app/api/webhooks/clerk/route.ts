import { db } from "@/server/db";

export const POST = async (req: Request) => {
  const { data } = await req.json();
  const emailAddress = data.email_addresses[0].email_address;
  const firstName = data.firstName;
  const lastName = data.lastName;
  const imageUrl = data.image_url;
  const id = data.id;

  await db.user.upsert({
    where: {
      id: id,
    },
    update: {
      emailAddress,
      firstName,
      lastName,
      imageUrl,
    },
    create: {
      id,
      emailAddress,
      firstName,
      lastName,
      imageUrl,
    },
  });

  return new Response("Webhook received", { status: 200 });
};
