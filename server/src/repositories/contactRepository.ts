import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../database/mongoClient.js";
import type { ContactMessageDoc, NewsletterSubscriberDoc } from "../types/models.js";
import type { ContactMessageInput } from "@droneclub/shared";

function contactCollection(): Collection<ContactMessageDoc> {
  return getDb().collection<ContactMessageDoc>("contactMessages");
}

function newsletterCollection(): Collection<NewsletterSubscriberDoc> {
  return getDb().collection<NewsletterSubscriberDoc>("newsletterSubscribers");
}

export async function createContactMessage(input: ContactMessageInput): Promise<ContactMessageDoc> {
  const doc: ContactMessageDoc = {
    _id: new ObjectId(),
    name: input.name,
    email: input.email.toLowerCase(),
    subject: input.subject || undefined,
    message: input.message,
    createdAt: new Date(),
    handled: false,
  };
  await contactCollection().insertOne(doc);
  return doc;
}

export async function subscribeToNewsletter(email: string): Promise<{ alreadySubscribed: boolean }> {
  const normalized = email.toLowerCase();
  const existing = await newsletterCollection().findOne({ email: normalized });
  if (existing) {
    if (existing.unsubscribedAt) {
      await newsletterCollection().updateOne({ email: normalized }, { $set: { unsubscribedAt: null, subscribedAt: new Date() } });
    }
    return { alreadySubscribed: !existing.unsubscribedAt };
  }
  await newsletterCollection().insertOne({ _id: new ObjectId(), email: normalized, subscribedAt: new Date(), unsubscribedAt: null });
  return { alreadySubscribed: false };
}
