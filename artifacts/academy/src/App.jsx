import { lazy, Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { Layout } from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Skeleton } from '@/components/ui-kit';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';

const Programs = lazy(() => import('@/pages/Programs'));
const Compare = lazy(() => import('@/pages/Compare'));
const Universities = lazy(() => import('@/pages/Universities'));
const Courses = lazy(() => import('@/pages/Courses'));
const ProgramDetail = lazy(() => import('@/pages/Details').then((m) => ({ default: m.ProgramDetail })));
const UniversityDetail = lazy(() => import('@/pages/Details').then((m) => ({ default: m.UniversityDetail })));
const CourseDetail = lazy(() => import('@/pages/Details').then((m) => ({ default: m.CourseDetail })));
const Certifications = lazy(() => import('@/pages/Certifications'));
const Career = lazy(() => import('@/pages/Career'));
const Careers = lazy(() => import('@/pages/Careers'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const PartnerWithUs = lazy(() => import('@/pages/PartnerWithUs'));
const Legal = lazy(() => import('@/pages/Legal'));
const KindPage = lazy(() => import('@/pages/Content').then((m) => ({ default: m.KindPage })));
const Blogs = lazy(() => import('@/pages/Content').then((m) => ({ default: m.Blogs })));
const BlogDetail = lazy(() => import('@/pages/Content').then((m) => ({ default: m.BlogDetail })));
const Faq = lazy(() => import('@/pages/Content').then((m) => ({ default: m.Faq })));
const FormPage = lazy(() => import('@/pages/Content').then((m) => ({ default: m.FormPage })));

const AdminLayout = lazy(() => import('@/admin/AdminLayout').then((m) => ({ default: m.AdminLayout })));
const Login = lazy(() => import('@/admin/Login'));
const Dashboard = lazy(() => import('@/admin/Dashboard'));
const ContentManager = lazy(() => import('@/admin/ContentManager'));
const HomepageManager = lazy(() => import('@/admin/HomepageManager'));
const Leads = lazy(() => import('@/admin/Leads'));
const Settings = lazy(() => import('@/admin/Settings'));
const AdminProfiles = lazy(() => import('@/admin/AdminProfiles'));

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, refetchOnWindowFocus: false, refetchOnMount: true, retry: 1 } } });

const ADMIN = [
  ['dashboard', 'Dashboard', () => <Dashboard />],
  ['universities', 'Universities', () => <ContentManager kind="universities" />],
  ['programs', 'Programs', () => <ContentManager kind="programs" />],
  ['courses', 'Courses', () => <ContentManager kind="courses" />],
  ['blogs', 'Blogs', () => <ContentManager kind="blogs" />],
  ['faqs', 'FAQs', () => <ContentManager kind="faqs" />],
  ['homepage', 'Homepage', () => <HomepageManager />],
  ['industry-companies', 'Industry companies', () => <ContentManager kind="industry_companies" />],
  ['certifications', 'Certifications', () => <ContentManager kind="certifications" />],
  ['testimonials', 'Testimonials', () => <ContentManager kind="testimonials" />],
  ['media', 'Media', () => <ContentManager kind="media" />],
  ['seo', 'SEO', () => <ContentManager kind="seo" />],
  ['pages', 'Pages', () => <ContentManager kind="pages" />],
  ['leads', 'All leads', () => <Leads />],
  ['contact-leads', 'Contact Us leads', () => <Leads onlyCategory="contact" />],
  ['counselling-leads', 'Counselling booking leads', () => <Leads onlyCategory="counselling" />],
  ['partner-leads', 'Partner With Us leads', () => <Leads onlyCategory="partnership" />],
  ['careers-leads', 'Careers enquiries', () => <Leads onlyCategory="careers" />],
  ['callback-leads', 'Chatbot callback leads', () => <Leads onlyCategory="chatbot" />],
  ['applications', 'Legacy applications', () => <Leads onlyCategory="application" />],
  ['settings', 'Settings', () => <Settings />],
  ['profiles', 'Admin profiles', () => <AdminProfiles />],
];

const Fallback = () => <div className="container-x space-y-3 py-10"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-64" /></div>;

function AdminApp() {
  return (
    <Suspense fallback={<Fallback />}>
      <Switch>
        <Route path="/admin/login"><Login /></Route>
        {ADMIN.map(([p, t, el]) => <Route key={p} path={`/admin/${p}`}><AdminLayout title={t}>{el()}</AdminLayout></Route>)}
        <Route path="/admin/companies"><Redirect to="/admin/industry-companies" /></Route>
        <Route path="/admin"><Redirect to="/admin/dashboard" /></Route>
        <Route><NotFound /></Route>
      </Switch>
    </Suspense>
  );
}
function Redirect({ to }) { const [, nav] = useLocation(); useEffect(() => { nav(to, { replace: true }); }, [nav, to]); return null; }

function PublicApp() {
  return (
    <Layout>
      <Suspense fallback={<Fallback />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/programs" component={Programs} />
        <Route path="/programs/undergraduate"><Programs key="undergraduate" level="Undergraduate" /></Route>
        <Route path="/programs/postgraduate"><Programs key="postgraduate" level="Postgraduate" /></Route>
        <Route path="/programs/:slug" component={ProgramDetail} />
        <Route path="/compare" component={Compare} />
        <Route path="/universities" component={Universities} />
        <Route path="/universities/:slug" component={UniversityDetail} />
        <Route path="/courses"><Courses variant="all" /></Route>
        <Route path="/courses/short-term"><Courses variant="short" /></Route>
        <Route path="/courses/long-term"><Courses variant="long" /></Route>
        <Route path="/courses/:slug" component={CourseDetail} />
        <Route path="/professional-courses"><Courses variant="all" /></Route>
        <Route path="/professional-courses/short-term"><Courses variant="short" /></Route>
        <Route path="/professional-courses/long-term"><Courses variant="long" /></Route>
        <Route path="/professional-courses/:slug" component={CourseDetail} />
        <Route path="/certifications" component={Certifications} />
        <Route path="/blog/:slug" component={BlogDetail} />
        <Route path="/book-counselling"><FormPage kind="book" /></Route>
        <Route path="/about" component={AboutPage} />
        <Route path="/careers" component={Careers} />
        <Route path="/career" component={Career} />
        <Route path="/career-industry" component={Career} />
        <Route path="/privacy"><Legal slug="privacy" title="Privacy Policy" /></Route>
        <Route path="/terms"><Legal slug="terms" title="Terms and Conditions" /></Route>
        <Route path="/student-life"><KindPage slug="student-life" /></Route>
        <Route path="/for-universities"><Redirect to="/partner-with-us" /></Route>
        <Route path="/partner-with-us" component={PartnerWithUs} />
        <Route path="/blogs" component={Blogs} />
        <Route path="/blogs/:slug" component={BlogDetail} />
        <Route path="/faq" component={Faq} />
        <Route path="/contact"><FormPage kind="contact" /></Route>
        <Route path="/apply"><Redirect to={`/book-counselling${window.location.search}`} /></Route>
        <Route path="/counselling"><FormPage kind="book" /></Route>
        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </Layout>
  );
}

function Routes() {
  const [loc] = useLocation();
  return <ErrorBoundary resetKey={loc}>{loc.startsWith('/admin') ? <AdminApp /> : <PublicApp />}</ErrorBoundary>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Routes />
        </WouterRouter>
      </MotionConfig>
    </QueryClientProvider>
  );
}
