import type { Request, Response } from "express";
import { sendSuccess } from "../../utils/apiResponse.js";
import { countAll, countByStatus, countByService, monthlyLeadCounts, recentInspectionRequests } from "../../repositories/inspectionRequestsRepository.js";
import { countPublished as countPublishedProjects, countByProjectStatus } from "../../repositories/projectsRepository.js";
import { countPublishedServices } from "../../repositories/servicesRepository.js";
import { countActiveReportLinks } from "../../repositories/secureReportLinksRepository.js";

/**
 * Every figure here comes straight from MongoDB. Per spec Section 13:
 * "When the database is empty, display zero rather than fake data" —
 * there is no synthetic fallback anywhere in this handler.
 */
export async function getDashboard(_req: Request, res: Response): Promise<void> {
  const [totalEnquiries, newRequests, requestsByService, pendingQuotations, activeProjects, completedProjects, publishedProjects, publishedServices, reportsUploaded, recentEnquiries, monthlyLeads] =
    await Promise.all([
      countAll(),
      countByStatus("new"),
      countByService(),
      countByStatus("quotation-prepared"),
      countByProjectStatus("in-progress"),
      countByProjectStatus("completed"),
      countPublishedProjects(),
      countPublishedServices(),
      countActiveReportLinks(),
      recentInspectionRequests(5),
      monthlyLeadCounts(6),
    ]);

  sendSuccess(res, {
    totalEnquiries,
    newRequests,
    requestsByService,
    pendingQuotations,
    activeProjects,
    completedProjects,
    publishedProjects,
    publishedServices,
    reportsUploaded,
    monthlyLeads,
    recentEnquiries: recentEnquiries.map((r) => ({
      id: r._id.toString(),
      referenceNumber: r.referenceNumber,
      fullName: r.fullName,
      companyName: r.companyName,
      service: r.service,
      status: r.status,
      createdAt: r.createdAt,
    })),
  });
}
