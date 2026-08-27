import { lazy, Suspense } from "react";
import { Outlet, createBrowserRouter, RouterProvider } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { Propeller } from "@/components/brand/Propeller";

// AuthProvider (and its session-bootstrap loader) is scoped to /admin/* only
// — anonymous visitors to the public site should never wait on a refresh-
// token check they don't need.
function AdminRoot() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

// Route-level code splitting per spec Section 11 — every page (including
// the entire admin panel) is its own chunk.
const Home = lazy(() => import("@/pages/public/Home"));
const Services = lazy(() => import("@/pages/public/Services"));
const ServiceDetail = lazy(() => import("@/pages/public/ServiceDetail"));
const InspectionProcess = lazy(() => import("@/pages/public/InspectionProcess"));
const Equipment = lazy(() => import("@/pages/public/Equipment"));
const EquipmentDetail = lazy(() => import("@/pages/public/EquipmentDetail"));
const Projects = lazy(() => import("@/pages/public/Projects"));
const ProjectDetailPublic = lazy(() => import("@/pages/public/ProjectDetail"));
const About = lazy(() => import("@/pages/public/About"));
const Resources = lazy(() => import("@/pages/public/Resources"));
const ResourceDetail = lazy(() => import("@/pages/public/ResourceDetail"));
const RequestInspection = lazy(() => import("@/pages/public/RequestInspection"));
const Contact = lazy(() => import("@/pages/public/Contact"));
const PrivacyPolicy = lazy(() => import("@/pages/public/PrivacyPolicy"));
const Terms = lazy(() => import("@/pages/public/Terms"));
const Report = lazy(() => import("@/pages/public/Report"));
const NotFound = lazy(() => import("@/pages/public/NotFound"));

const Login = lazy(() => import("@/pages/admin/Login"));
const ChangePassword = lazy(() => import("@/pages/admin/ChangePassword"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Leads = lazy(() => import("@/pages/admin/Leads"));
const LeadDetail = lazy(() => import("@/pages/admin/LeadDetail"));
const AdminServices = lazy(() => import("@/pages/admin/Services"));
const AdminEquipment = lazy(() => import("@/pages/admin/Equipment"));
const AdminProjects = lazy(() => import("@/pages/admin/Projects"));
const AdminProjectDetail = lazy(() => import("@/pages/admin/ProjectDetail"));
const AdminReports = lazy(() => import("@/pages/admin/Reports"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));

function PageFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Propeller size={32} />
    </div>
  );
}

function withSuspense(element: JSX.Element) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: withSuspense(<Home />) },
      { path: "/services", element: withSuspense(<Services />) },
      { path: "/services/:slug", element: withSuspense(<ServiceDetail />) },
      { path: "/inspection-process", element: withSuspense(<InspectionProcess />) },
      { path: "/equipment", element: withSuspense(<Equipment />) },
      { path: "/equipment/:slug", element: withSuspense(<EquipmentDetail />) },
      { path: "/projects", element: withSuspense(<Projects />) },
      { path: "/projects/:slug", element: withSuspense(<ProjectDetailPublic />) },
      { path: "/about", element: withSuspense(<About />) },
      { path: "/resources", element: withSuspense(<Resources />) },
      { path: "/resources/:slug", element: withSuspense(<ResourceDetail />) },
      { path: "/request-inspection", element: withSuspense(<RequestInspection />) },
      { path: "/contact", element: withSuspense(<Contact />) },
      { path: "/privacy-policy", element: withSuspense(<PrivacyPolicy />) },
      { path: "/terms", element: withSuspense(<Terms />) },
      { path: "/404", element: withSuspense(<NotFound />) },
      { path: "*", element: withSuspense(<NotFound />) },
    ],
  },
  { path: "/report/:secureToken", element: withSuspense(<Report />) },
  {
    element: <AdminRoot />,
    children: [
      { path: "/admin/login", element: withSuspense(<Login />) },
      { path: "/admin/change-password", element: withSuspense(<ChangePassword />) },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: withSuspense(<Dashboard />) },
              { path: "leads", element: withSuspense(<Leads />) },
              { path: "leads/:id", element: withSuspense(<LeadDetail />) },
              { path: "services", element: withSuspense(<AdminServices />) },
              { path: "equipment", element: withSuspense(<AdminEquipment />) },
              { path: "projects", element: withSuspense(<AdminProjects />) },
              { path: "projects/:id", element: withSuspense(<AdminProjectDetail />) },
              { path: "reports", element: withSuspense(<AdminReports />) },
              {
                element: <ProtectedRoute allowedRoles={["super-admin"]} />,
                children: [{ path: "settings", element: withSuspense(<AdminSettings />) }],
              },
            ],
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
