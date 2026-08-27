/**
 * Database seed script, per spec Section 25.
 *
 * Populates: site settings, verified services, verified equipment, and
 * leaves projects empty (the spec explicitly requires a real "empty project
 * state" rather than fictional case studies). Safe to re-run — every insert
 * is guarded by a slug-existence check.
 *
 * Content below is drawn only from the facts given directly in the platform
 * spec (Section 4) — no invented statistics, clients or history.
 */
import { connectToDatabase, closeDatabaseConnection } from "../src/database/mongoClient.js";
import { ensureIndexes } from "../src/database/indexes.js";
import { getDb } from "../src/database/mongoClient.js";
import { logger } from "../src/utils/logger.js";
import type { ServiceDoc, EquipmentDoc } from "../src/types/models.js";
import { ObjectId } from "mongodb";

const IMG = "/assets/images";

// The full 12-card professional service portfolio. Five entries
// (UAV Survey & Mapping, UAV LiDAR Survey, Drone Photogrammetry, Aerial
// Image Acquisition, 3D Mapping & Modeling) reuse the best-available
// existing photography as an interim placeholder — the entire supplied
// image library is solar-context, so none of it is a genuine photo of
// those services. Flagged in PROGRESS.md; replace with real photography
// before this is considered final.
const services: Array<Omit<ServiceDoc, "_id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt">> = [
  {
    title: "Solar Panel Inspection",
    slug: "solar-panel-inspection",
    category: "solar-panel-inspection",
    summary: "Thermal and RGB drone inspection for hotspot detection, damaged modules and performance assessment.",
    description:
      "Thermal and RGB drone inspection for hotspot detection, damaged modules, electrical anomalies and performance assessment across utility-scale solar plants. Findings are compiled into georeferenced maps with AI-assisted anomaly detection to locate faulty panels and prioritise maintenance.",
    heroImage: { url: `${IMG}/03-solar-inspection-service.png`, alt: "Drone thermal inspection of solar panels across a utility-scale plant" },
    icon: "scan-search",
    displayOrder: 1,
    status: "published",
  },
  {
    title: "Solar Panel Cleaning",
    slug: "solar-panel-cleaning",
    category: "solar-panel-cleaning",
    summary: "Drone-assisted and tethered aerial cleaning for large-scale solar installations.",
    description:
      "Drone-assisted and tethered aerial cleaning solutions for efficient maintenance of large-scale solar installations with reduced manual intervention, delivering high-pressure cleaning at a capacity of up to approximately 800 square metres per hour.",
    heroImage: { url: `${IMG}/08-drone-solar-cleaning.png`, alt: "Tethered drone performing high-pressure aerial cleaning of solar panels" },
    icon: "spray-can",
    displayOrder: 2,
    status: "published",
  },
  {
    title: "Operation & Maintenance",
    slug: "operation-maintenance",
    category: "operation-maintenance",
    summary: "Inspection-driven solar asset maintenance, defect prioritisation and recurring performance assessment.",
    description:
      "Inspection-driven solar asset maintenance including defect prioritisation, condition monitoring, reporting and recurring performance assessment — keeping solar assets operating at their intended output over their operating life.",
    heroImage: { url: `${IMG}/09-operation-maintenance.png`, alt: "Engineers reviewing drone thermal inspection data beside a solar facility" },
    icon: "wrench",
    displayOrder: 3,
    status: "published",
  },
  {
    title: "UAV Survey & Mapping",
    slug: "uav-survey-mapping",
    category: "uav-survey-mapping",
    summary: "High-resolution UAV surveying for topographic mapping, land assessment and engineering surveys.",
    description:
      "High-resolution UAV surveying for topographic mapping, land assessment, engineering surveys, contour generation and geospatial data collection, processed into georeferenced orthomosaics and terrain models for planning and design.",
    heroImage: { url: `${IMG}/04-rgb-solar-inspection.png`, alt: "UAV topographic survey and aerial mapping flight over a site" },
    icon: "map-pinned",
    displayOrder: 4,
    status: "published",
  },
  {
    title: "UAV LiDAR Survey",
    slug: "lidar-survey",
    category: "lidar-survey",
    summary: "Drone-mounted LiDAR data acquisition for high-accuracy terrain modelling and 3D analysis.",
    description:
      "Drone-mounted LiDAR data acquisition for high-accuracy terrain modelling, infrastructure mapping, vegetation penetration and detailed 3D analysis, capturing dense point clouds even through partial vegetation cover where camera-based mapping alone is less effective.",
    heroImage: { url: `${IMG}/06-orthomosaic-solar-map.png`, alt: "Drone LiDAR survey data used for 3D terrain mapping" },
    icon: "radar",
    displayOrder: 5,
    status: "published",
  },
  {
    title: "Drone Photogrammetry",
    slug: "drone-photogrammetry",
    category: "drone-photogrammetry",
    summary: "Overlapping aerial imagery processed into orthomosaics, point clouds and elevation models.",
    description:
      "Overlapping aerial imagery processed into accurate orthomosaics, point clouds, elevation models and measurable 3D spatial datasets, supporting engineering, planning and survey deliverables that require precise ground measurement.",
    heroImage: { url: `${IMG}/05-thermal-solar-inspection.png`, alt: "Aerial imagery processed into an orthomosaic through drone photogrammetry" },
    icon: "boxes",
    displayOrder: 6,
    status: "published",
  },
  {
    title: "Aerial Image Acquisition",
    slug: "aerial-image-acquisition",
    category: "aerial-image-acquisition",
    summary: "High-resolution RGB, oblique, thermal and multispectral aerial imagery acquisition.",
    description:
      "High-resolution RGB, oblique, thermal and multispectral aerial imagery acquisition for engineering, planning, inspection and environmental applications, captured on enterprise UAV platforms.",
    heroImage: { url: `${IMG}/02-enterprise-drone-cutout.png`, alt: "Professional enterprise UAV used for high-resolution aerial image acquisition" },
    icon: "camera",
    displayOrder: 7,
    status: "published",
  },
  {
    title: "3D Mapping & Modeling",
    slug: "3d-mapping-modeling",
    category: "3d-mapping-modeling",
    summary: "3D point clouds, textured models and digital terrain representations from UAV and LiDAR data.",
    description:
      "Generation of 3D point clouds, textured models, digital surface models, digital terrain models and digital terrain representations from UAV and LiDAR datasets, for engineering, BIM and visualisation use.",
    heroImage: { url: `${IMG}/10-equipment-showcase-background.png`, alt: "3D point cloud and digital terrain model generated from UAV and LiDAR data" },
    icon: "layers-3",
    displayOrder: 8,
    status: "published",
  },
  {
    title: "Power Line & Tower Inspection",
    slug: "power-line-tower-inspection",
    category: "power-line-tower-inspection",
    summary: "Thermal and visual UAV inspection of transmission lines, towers and telecom infrastructure.",
    description:
      "Thermal and visual UAV inspection of transmission lines, distribution networks, towers and telecommunication infrastructure, identifying overheating connections, corrosion and structural damage without powering down lines or requiring climbing crews.",
    heroImage: { url: `${IMG}/07-hotspot-identification.png`, alt: "Drone thermal inspection of a power transmission tower and line" },
    icon: "zap",
    displayOrder: 9,
    status: "published",
  },
  {
    title: "Construction Progress Monitoring",
    slug: "construction-progress-monitoring",
    category: "construction-progress-monitoring",
    summary: "Repeatable aerial documentation, site mapping and earthwork measurement for construction projects.",
    description:
      "Repeatable aerial documentation, site mapping, earthwork measurement and progress comparison for construction and infrastructure projects, supporting developers, contractors and project stakeholders with an up-to-date aerial record.",
    heroImage: { url: `${IMG}/13-project-case-study.png`, alt: "Active construction site captured from an elevated drone perspective" },
    icon: "building-2",
    displayOrder: 10,
    status: "published",
  },
  {
    title: "Flood & Disaster Assessment",
    slug: "disaster-assessment",
    category: "disaster-assessment",
    summary: "Rapid UAV mapping of flood-affected and disaster-damaged areas for emergency response planning.",
    description:
      "Rapid UAV mapping of flood-affected and disaster-damaged areas for damage assessment, emergency response planning and recovery analysis, supporting government agencies, development organisations and affected communities.",
    heroImage: { url: `${IMG}/14-final-cta-background.png`, alt: "Aerial drone mapping of a flood-affected landscape for disaster assessment" },
    icon: "cloud-rain-wind",
    displayOrder: 11,
    status: "published",
  },
  {
    title: "Drone Equipment & Training",
    slug: "equipment-training",
    category: "equipment-training",
    summary: "Professional drone platforms, payload solutions and practical UAV training.",
    description:
      "Professional drone platforms, payload solutions, technical support and practical UAV training covering mission planning, field operation and safety, including the DJI Matrice 400, Zenmuse H30T, DJI Matrice 4T and the P3 T50 tethered drone cleaning system.",
    heroImage: { url: `${IMG}/11-drone-training.png`, alt: "Drone operators receiving practical field training with professional UAV equipment" },
    icon: "graduation-cap",
    displayOrder: 12,
    status: "published",
  },
];

const equipment: Array<Omit<EquipmentDoc, "_id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt">> = [
  {
    name: "DJI Matrice 400",
    slug: "dji-matrice-400",
    category: "inspection",
    image: { url: `${IMG}/10-equipment-showcase-background.png`, alt: "DJI Matrice 400 enterprise drone platform" },
    shortDescription: "Enterprise drone platform used for both solar inspection and cleaning missions.",
    useCase: "Primary aerial platform for thermal/RGB inspection flights and for operating the P3 T50 tethered cleaning system.",
    specifications: [],
    availability: "in-service",
    displayOrder: 1,
    status: "published",
  },
  {
    name: "Zenmuse H30T",
    slug: "zenmuse-h30t",
    category: "inspection",
    image: { url: `${IMG}/05-thermal-solar-inspection.png`, alt: "Thermal inspection payload in use over a solar array" },
    shortDescription: "Thermal and RGB imaging payload used for solar panel inspection.",
    useCase: "Captures thermal and RGB imagery used for hotspot identification and defect detection.",
    specifications: [],
    availability: "in-service",
    displayOrder: 2,
    status: "published",
  },
  {
    name: "DJI Matrice 4T",
    slug: "dji-matrice-4t",
    category: "inspection",
    image: { url: `${IMG}/04-rgb-solar-inspection.png`, alt: "Nadir solar panel array inspection drone" },
    shortDescription: "Inspection drone platform for RGB and thermal data collection.",
    useCase: "Used for nadir and oblique inspection flights across solar panel arrays.",
    specifications: [],
    availability: "in-service",
    displayOrder: 3,
    status: "published",
  },
  {
    name: "P3 T50 Tethered Drone Cleaning System",
    slug: "p3-t50-tethered-cleaning-system",
    category: "cleaning",
    image: { url: `${IMG}/08-drone-solar-cleaning.png`, alt: "P3 T50 tethered drone washing solar panels" },
    shortDescription: "Tethered high-pressure aerial cleaning system for solar panels.",
    useCase: "Delivers high-pressure aerial cleaning at up to approximately 800 m² per hour with reduced manual access requirements.",
    specifications: [],
    availability: "in-service",
    displayOrder: 4,
    status: "published",
  },
];

async function main(): Promise<void> {
  const db = await connectToDatabase();
  await ensureIndexes(db);
  const now = new Date();

  const servicesCollection = db.collection<ServiceDoc>("services");
  for (const service of services) {
    const existing = await servicesCollection.findOne({ slug: service.slug });
    if (existing) continue;
    await servicesCollection.insertOne({ _id: new ObjectId(), ...service, createdAt: now, updatedAt: now, isDeleted: false, deletedAt: null });
    logger.info(`Seeded service: ${service.title}`);
  }

  const equipmentCollection = db.collection<EquipmentDoc>("equipment");
  for (const item of equipment) {
    const existing = await equipmentCollection.findOne({ slug: item.slug });
    if (existing) continue;
    await equipmentCollection.insertOne({ _id: new ObjectId(), ...item, createdAt: now, updatedAt: now, isDeleted: false, deletedAt: null });
    logger.info(`Seeded equipment: ${item.name}`);
  }

  const settingsCollection = getDb().collection("siteSettings");
  const defaultFooterDescription =
    "Professional UAV solutions for surveying, LiDAR mapping, aerial imaging, infrastructure inspection and solar asset care.";
  const defaultSeoDescription =
    "UAV survey and mapping, LiDAR survey, photogrammetry, aerial data acquisition, infrastructure inspection, construction monitoring, disaster assessment, solar inspection and professional drone training.";

  const existingSettings = await settingsCollection.findOne({ key: "global" });
  if (!existingSettings) {
    await settingsCollection.insertOne({
      _id: new ObjectId(),
      key: "global",
      companyName: "Drone Club Bangladesh",
      contact: {},
      social: {},
      footerDescription: defaultFooterDescription,
      seoDefaults: { titleSuffix: "Drone Club Bangladesh", description: defaultSeoDescription },
      updatedAt: now,
      updatedBy: null,
    });
    logger.info("Seeded default site settings");
  } else {
    // Refresh only the general positioning copy — never touch contact info,
    // social links or anything an admin may have already customised.
    await settingsCollection.updateOne(
      { key: "global" },
      { $set: { footerDescription: defaultFooterDescription, "seoDefaults.description": defaultSeoDescription, updatedAt: now } }
    );
    logger.info("Refreshed default site-settings copy (footer description, SEO description)");
  }

  logger.info("Seeding complete. Projects were intentionally left empty — add real projects through the admin panel.");
  await closeDatabaseConnection();
}

main().catch(async (err) => {
  logger.error({ err }, "Seed script failed");
  await closeDatabaseConnection();
  process.exit(1);
});
