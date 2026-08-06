import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminGate } from '@/components/AdminGate';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AppShell } from '@/components/layout/AppShell';

import { Landing } from '@/pages/public/Landing';
import { WhySIH } from '@/pages/public/WhySIH';
import { WhyJoin } from '@/pages/public/WhyJoin';
import { Timeline } from '@/pages/public/Timeline';
import { ProblemStatements } from '@/pages/public/ProblemStatements';
import { People } from '@/pages/public/People';
import { Gallery } from '@/pages/public/Gallery';
import { Developers } from '@/pages/public/Developers';
import { Updates } from '@/pages/public/Updates';
import { Rules } from '@/pages/public/Rules';
import { Results } from '@/pages/public/Results';
import { FAQ } from '@/pages/public/FAQ';
import { Contact } from '@/pages/public/Contact';
import { SparkStory } from '@/pages/public/SparkStory';
import { SpreadTheSpark } from '@/pages/public/SpreadTheSpark';
import { Login } from '@/pages/public/Login';
import { Register } from '@/pages/public/Register';
import { PrivacyPolicy } from '@/pages/public/PrivacyPolicy';

import { DashboardHome } from '@/pages/dashboard/DashboardHome';
import { Submissions } from '@/pages/dashboard/Submissions';
import { TeamMembers } from '@/pages/dashboard/TeamMembers';
import { DashboardAnnouncements } from '@/pages/dashboard/DashboardAnnouncements';

import { AdminHome } from '@/pages/admin/AdminHome';
import { TeamLock } from '@/pages/admin/TeamLock';
import { Registrations } from '@/pages/admin/Registrations';
import { ScreeningConsole } from '@/pages/admin/ScreeningConsole';
import { PromotionComposer } from '@/pages/admin/PromotionComposer';
import { PromoPostDetails } from '@/pages/admin/PromoPostDetails';
import { UpdatesComposer } from '@/pages/admin/UpdatesComposer';
import { ContentEditor } from '@/pages/admin/ContentEditor';

import { ScrollToTop } from '@/components/ScrollToTop';

const queryClient = new QueryClient();

const DASHBOARD_NAV = [
  { to: '/dashboard', label: 'Team status' },
  { to: '/dashboard/members', label: 'Team members' },
  { to: '/dashboard/submissions', label: 'Submissions' },
  { to: '/dashboard/announcements', label: 'Announcements' },
  { to: '/spread-the-spark', label: 'Spread the Spark' },
];

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/teams', label: 'Finalise teams' },
  { to: '/admin/registrations', label: 'Registrations' },
  { to: '/admin/screening', label: 'Screening console' },
  { to: '/admin/promotions', label: 'Promotion composer' },
  { to: '/admin/updates', label: 'Updates composer' },
  { to: '/admin/content', label: 'Content editor' },
];

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Landing />} />
              <Route path="why-sih" element={<WhySIH />} />
              <Route path="why-join" element={<WhyJoin />} />
              <Route path="timeline" element={<Timeline />} />
              <Route path="problem-statements" element={<ProblemStatements />} />
              <Route path="rules" element={<Rules />} />
              <Route path="spark-story" element={<SparkStory />} />
              <Route path="people" element={<People />} />
              <Route path="gallery" element={<Gallery />} />
              <Route path="developers" element={<Developers />} />
              <Route path="updates" element={<Updates />} />
              <Route path="spread-the-spark" element={<SpreadTheSpark />} />
              <Route path="results" element={<Results />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="contact" element={<Contact />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
            </Route>

            <Route element={<ProtectedRoute minimumRole="participant" />}>
              <Route element={<AppShell title="Dashboard" navItems={DASHBOARD_NAV} />}>
                <Route path="dashboard" element={<DashboardHome />} />
                <Route path="dashboard/members" element={<TeamMembers />} />
                <Route path="dashboard/submissions" element={<Submissions />} />
                <Route path="dashboard/announcements" element={<DashboardAnnouncements />} />
              </Route>
            </Route>

            <Route path="admin" element={<AdminGate />}>
              <Route element={<AppShell title="Admin" navItems={ADMIN_NAV} />}>
                <Route index element={<AdminHome />} />
                <Route path="teams" element={<TeamLock />} />
                <Route path="registrations" element={<Registrations />} />
                <Route path="screening" element={<ScreeningConsole />} />
                <Route path="promotions" element={<PromotionComposer />} />
                <Route path="promotions/:postId" element={<PromoPostDetails />} />
                <Route path="updates" element={<UpdatesComposer />} />
                <Route path="content" element={<ContentEditor />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
