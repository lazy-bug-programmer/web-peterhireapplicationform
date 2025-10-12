import { ApplicationForm } from "@/components/application-form";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,rgba(255,255,255,0.5),rgba(255,255,255,0.8))] -z-10"></div>
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10 text-center">
            <div className="inline-block p-2 bg-purple-100 rounded-lg mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-600"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">
              Join Our Team
            </h1>
            <div className="h-1 w-20 bg-purple-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              We&apos;re looking for talented individuals to help us build the
              future. Please provide your details including name, contact
              information, age, gender, nationality, and eligibility to start
              your journey with us.
            </p>
          </div>
          <ApplicationForm />
        </div>
      </div>
    </div>
  );
}
