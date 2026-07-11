import { BRAND } from '../../../config/brand';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-dark-6 py-12 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Terms of Service</h1>
        <p className="text-grey-60 text-sm mb-8">Last updated: July 11, 2026</p>

        <div className="space-y-8 text-grey-70">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">1. Acceptance</h2>
            <p className="mb-4">
              By accessing {BRAND.name} ({BRAND.siteUrl}), you agree to these Terms. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">2. Adult content and eligibility</h2>
            <p className="mb-4">
              The Service contains sexually explicit adult content. You represent that you are at least 18 years old
              (or the age of majority where you live), that you are not accessing the Service from a jurisdiction
              where adult content is illegal, and that you will not allow minors to access your account or device
              while using the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">3. License</h2>
            <p className="mb-4">
              We grant you a limited, personal, non-transferable license to stream content for private viewing.
              You may not copy, redistribute, scrape, reverse engineer, or commercially exploit the Service or content
              except as expressly allowed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">4. Subscriptions and payments</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Paid plans unlock premium content for the stated validity period.</li>
              <li>Payments may be processed via Razorpay (instant activation) or manual UPI verification (admin approval), depending on platform configuration.</li>
              <li>Fees are generally non-refundable except where required by law or as we expressly approve.</li>
              <li>You are responsible for taxes and for keeping payment credentials accurate.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">5. User and creator content</h2>
            <p className="mb-4">
              Creators retain ownership of their uploads but grant {BRAND.name} a worldwide license to host, stream,
              transcode, and display that content. You must have all rights and consents (including model releases)
              for anyone depicted. Prohibited content includes, without limitation: anyone under 18; non-consensual
              intimate imagery; illegal content; CSAM; extreme violence; or content that infringes IP.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">6. Moderation</h2>
            <p className="mb-4">
              We may remove content, suspend accounts, or refuse service at our discretion for Terms violations,
              legal risk, or reports. Automated thresholds (e.g. multiple reports) may deactivate content pending review.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">7. Disclaimers and liability</h2>
            <p className="mb-4">
              The Service is provided &quot;as is.&quot; To the fullest extent permitted by law, {BRAND.name} is not liable
              for indirect, incidental, or consequential damages arising from use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">8. Governing law</h2>
            <p className="mb-4">
              These Terms are governed by the laws applicable to the operator of {BRAND.name}. Disputes will be
              resolved in the competent courts of that jurisdiction, unless mandatory consumer protections apply otherwise.
            </p>
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
