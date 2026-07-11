import Link from 'next/link';
import { BRAND } from '../../../config/brand';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-dark-6 py-12 px-4 pt-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Frequently Asked Questions</h1>

        <div className="space-y-8 text-grey-70">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">General</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl text-primary mb-2">What is {BRAND.name}?</h3>
                <p>
                  {BRAND.name} is a premium adult streaming platform for exclusive content, available only to adults
                  18+ in jurisdictions where adult entertainment is legal.
                </p>
              </div>
              <div>
                <h3 className="text-xl text-primary mb-2">Why do I see an age gate?</h3>
                <p>
                  We require confirmation that you are 18 or older before showing adult content. This choice is stored
                  locally so you are not asked on every visit from the same browser.
                </p>
              </div>
              <div>
                <h3 className="text-xl text-primary mb-2">How do I get started?</h3>
                <p>
                  Create an account, confirm your email with OTP, then choose a subscription plan on the{' '}
                  <Link href="/subscriptions" className="text-red-45 hover:text-red-55">
                    subscriptions
                  </Link>{' '}
                  page.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">Subscription &amp; billing</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl text-primary mb-2">What payment methods do you accept?</h3>
                <p>
                  Depending on platform configuration: <strong className="text-primary">online payment via Razorpay</strong>{' '}
                  (instant plan activation) or <strong className="text-primary">manual UPI</strong> (pay via QR, submit UTR,
                  admin approves). Card and UPI options inside Razorpay depend on your Razorpay account settings.
                </p>
              </div>
              <div>
                <h3 className="text-xl text-primary mb-2">Can I cancel my subscription?</h3>
                <p>
                  Yes. Cancel from the subscriptions page. Access continues until your current period ends unless otherwise stated.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">Safety</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl text-primary mb-2">How do I report content?</h3>
                <p>
                  Open a video and use Report. You must be signed in. Our team reviews reports in the moderation queue.
                </p>
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-dark-20">
            <p>
              Still have questions?{' '}
              <Link href="/support" className="text-red-45 hover:text-red-55">
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
