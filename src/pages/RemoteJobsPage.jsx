import JobListPage from "./JobListPage";

/**
 * Dedicated listing of fully remote jobs. Reuses the full JobListPage
 * component but pre-filters on the Remote location and gives the page
 * its own heading.
 */
export default function RemoteJobsPage() {
  return <JobListPage defaultLocation="Remote" pageTitle="Remote Jobs" showHero />;
}