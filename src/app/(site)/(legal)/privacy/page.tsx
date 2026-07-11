import { BRAND } from '../../../config/brand';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark-6 py-12 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>
        <p className="text-grey-60 text-sm mb-8">Last updated: July 11, 2026</p>

        <div className="space-y-8 text-grey-70">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">1. Adults only</h2>
            <p className="mb-4">
              {BRAND.name} is an adult entertainment service intended solely for persons who are 18 years of age
              or older (or the age of majority in their jurisdiction). We do not knowingly collect personal
              information from anyone under 18. If we learn that we have collected data from a minor, we will
              delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">2. Information We Collect</h2>
            <p className="mb-4">We collect information you provide when you:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create an account or verify your email (OTP)</li>
              <li>Subscribe or pay for access (payment processors may receive billing data)</li>
              <li>Contact support or submit content reports</li>
              <li>Upload or manage creator content</li>
            </ul>
            <p className="mt-4">This may include name, email, account preferences, payment references (e.g. UTR / transaction IDs), IP address, device identifiers, and usage analytics.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide streaming, subscriptions, and creator tools</li>
              <li>Process payments and prevent fraud</li>
              <li>Enforce our Terms, moderate content, and respond to legal requests</li>
              <li>Improve the service and communicate important account notices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">4. Payment processors</h2>
            <p className="mb-4">
              Payments may be processed by third parties such as Razorpay or via manual UPI verification.
              Those providers process payment data under their own privacy policies. We receive confirmation
              of payment and limited transaction metadata needed to activate your plan.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">5. Information Sharing</h2>
            <p className="mb-4">We do not sell your personal information. We may share information with:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Infrastructure and email service providers that help operate the platform</li>
              <li>Payment processors and banks involved in your transaction</li>
              <li>Law enforcement or regulators when required by law</li>
              <li>Other users when you publish content or profile information publicly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">6. Cookies</h2>
            <p className="mb-4">
              We use essential cookies and local storage for authentication, age verification, and preferences.
              See our <a className="text-red-45" href="/cookies">Cookie Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">7. Data retention and security</h2>
            <p className="mb-4">
              We retain account and payment records as needed to operate the service, comply with law, and
              resolve disputes. We use reasonable technical measures to protect data, but no online system is
              perfectly secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">8. Your rights</h2>
            <p className="mb-4">Subject to applicable law, you may request access, correction, or deletion of your personal data by contacting us.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">9. Contact</h2>
            <p className="text-red-45">{BRAND.supportEmail}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
