import { ObjectId, type Collection } from "mongodb";
import { getDb } from "../database/mongoClient.js";
import type { SiteSettingsDoc } from "../types/models.js";

function collection(): Collection<SiteSettingsDoc> {
  return getDb().collection<SiteSettingsDoc>("siteSettings");
}

const DEFAULT_SETTINGS: Omit<SiteSettingsDoc, "_id" | "updatedAt" | "updatedBy"> = {
  key: "global",
  companyName: "Drone Club Bangladesh",
  contact: {},
  social: {},
  footerDescription:
    "Drone-powered solar asset care — thermal and RGB inspection, georeferenced mapping and aerial cleaning support.",
  seoDefaults: {
    titleSuffix: "Drone Club Bangladesh",
    description:
      "Thermal and RGB drone inspections, georeferenced orthomosaic analysis and aerial cleaning solutions for solar asset maintenance in Bangladesh.",
  },
};

export async function getSiteSettings(): Promise<SiteSettingsDoc> {
  const existing = await collection().findOne({ key: "global" });
  if (existing) return existing;

  const doc: SiteSettingsDoc = { _id: new ObjectId(), ...DEFAULT_SETTINGS, updatedAt: new Date(), updatedBy: null };
  await collection().insertOne(doc);
  return doc;
}

export async function updateSiteSettings(
  update: Partial<Omit<SiteSettingsDoc, "_id" | "key">>,
  updatedBy: ObjectId
): Promise<SiteSettingsDoc> {
  const result = await collection().findOneAndUpdate(
    { key: "global" },
    { $set: { ...update, updatedAt: new Date(), updatedBy } },
    { returnDocument: "after", upsert: true }
  );
  if (!result) throw new Error("Failed to update site settings");
  return result;
}
