import { lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/templates/Layout'
import { AuthProvider } from '@/providers/AuthProvider'
import { ToastProvider } from '@/providers/ToastProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { ProtectedRoute, StaffRoute } from '@/components/ProtectedRoute'
import { ScrollManager } from '@/components/ScrollManager'

const HomePage = lazy(() => import('@/pages/HomePage'))
const DiscoverPage = lazy(() => import('@/pages/DiscoverPage'))
const MajorDetailPage = lazy(() => import('@/pages/MajorDetailPage'))
const UniversityPage = lazy(() => import('@/pages/UniversityPage'))
const UniversitiesPage = lazy(() => import('@/pages/UniversitiesPage'))
const ComparePage = lazy(() => import('@/pages/ComparePage'))
const SearchPage = lazy(() => import('@/pages/SearchPage'))
const FavoritesPage = lazy(() => import('@/pages/FavoritesPage'))
const AuthPage = lazy(() => import('@/pages/AuthPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const NewsPage = lazy(() => import('@/pages/NewsPage'))
const NewsDetailPage = lazy(() => import('@/pages/NewsDetailPage'))
const ArticlesPage = lazy(() => import('@/pages/ArticlesPage'))
const FaqPage = lazy(() => import('@/pages/FaqPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const TermsPage = lazy(() => import('@/pages/TermsPage'))
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminCertificates = lazy(() => import('@/pages/admin/AdminCertificates'))
const AdminUniversities = lazy(() => import('@/pages/admin/AdminUniversities'))
const AdminColleges = lazy(() => import('@/pages/admin/AdminColleges'))
const AdminMajors = lazy(() => import('@/pages/admin/AdminMajors'))
const AdminAdmissions = lazy(() => import('@/pages/admin/AdminAdmissions'))
const AdminNews = lazy(() => import('@/pages/admin/AdminNews'))
const AdminArticles = lazy(() => import('@/pages/admin/AdminArticles'))
const AdminFaq = lazy(() => import('@/pages/admin/AdminFaq'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminTestimonials = lazy(() => import('@/pages/admin/AdminTestimonials'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))
const AdminMedia = lazy(() => import('@/pages/admin/AdminMedia'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

export default function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollManager />
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/major/:slug" element={<MajorDetailPage />} />
                <Route path="/university/:slug" element={<UniversityPage />} />
                <Route path="/universities" element={<UniversitiesPage />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:slug" element={<NewsDetailPage />} />
                <Route path="/articles" element={<ArticlesPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<TermsPage />} />

                <Route path="/admin" element={<StaffRoute><AdminLayout /></StaffRoute>}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="certificates" element={<AdminCertificates />} />
                  <Route path="universities" element={<AdminUniversities />} />
                  <Route path="colleges" element={<AdminColleges />} />
                  <Route path="majors" element={<AdminMajors />} />
                  <Route path="admissions" element={<AdminAdmissions />} />
                  <Route path="news" element={<AdminNews />} />
                  <Route path="articles" element={<AdminArticles />} />
                  <Route path="faq" element={<AdminFaq />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="media" element={<AdminMedia />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  )
}
