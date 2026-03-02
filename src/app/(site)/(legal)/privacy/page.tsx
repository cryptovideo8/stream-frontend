export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-dark-6 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-grey-70">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">1. Information We Collect</h2>
            <p className="mb-4">
              We collect information you provide directly to us when you:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Create an account</li>
              <li>Subscribe to our service</li>
              <li>Contact us for support</li>
              <li>Fill out forms on our website</li>
            </ul>
            <p className="mt-4">This information may include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name and email address</li>
              <li>Billing information</li>
              <li>User preferences and settings</li>
              <li>Content you upload or share</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">2. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain our services</li>
              <li>Process your payments and subscriptions</li>
              <li>Send you important updates and notifications</li>
              <li>Improve our services and develop new features</li>
              <li>Protect against fraud and unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">3. Information Sharing</h2>
            <p className="mb-4">
              We do not sell your personal information. We may share your information with:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Service providers who assist in our operations</li>
              <li>Law enforcement when required by law</li>
              <li>Other users when you choose to share content publicly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">4. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your
              personal information. However, no method of transmission over the Internet is
              100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">5. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Export your data in a portable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">6. Cookies and Tracking</h2>
            <p className="mb-4">
              We use cookies and similar tracking technologies to collect information about
              your browsing behavior and preferences. You can control cookie settings through
              your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">7. Children&apos;s Privacy</h2>
            <p className="mb-4">
              Our services are not intended for children under 13. We do not knowingly collect
              personal information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">8. Changes to Privacy Policy</h2>
            <p className="mb-4">
              We may update this privacy policy from time to time. We will notify you of any
              changes by posting the new policy on this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">9. Contact Us</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-red-45">support@nightking.com</p>
          </section>

          <div className="pt-8 border-t border-dark-20">
            <p className="text-grey-70">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 