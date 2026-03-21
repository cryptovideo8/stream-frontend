import Link from 'next/link';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-dark-6 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Frequently Asked Questions</h1>
        
        <div className="space-y-8 text-grey-70">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">General Questions</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl text-primary mb-2">What is NightKing?</h3>
                <p className="text-grey-70">
                  NightKing is a premium streaming platform that offers high-quality content and exclusive features for our subscribers.
                </p>
              </div>

              <div>
                <h3 className="text-xl text-primary mb-2">How do I get started?</h3>
                <p className="text-grey-70">
                  Simply create an account and choose a subscription plan that best suits your needs. You can start watching immediately after subscribing.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">Subscription & Billing</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl text-primary mb-2">What payment methods do you accept?</h3>
                <p className="text-grey-70">
                  We accept all major credit cards, PayPal, and selected cryptocurrency payments.
                </p>
              </div>

              <div>
                <h3 className="text-xl text-primary mb-2">Can I cancel my subscription?</h3>
                <p className="text-grey-70">
                  Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">Technical Support</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl text-primary mb-2">What devices are supported?</h3>
                <p className="text-grey-70">
                  Our platform works on all modern web browsers, mobile devices, and smart TVs.
                </p>
              </div>

              <div>
                <h3 className="text-xl text-primary mb-2">Having technical issues?</h3>
                <p className="text-grey-70">
                  Please visit our <Link href="/support" className="text-red-45 hover:text-red-55">support page</Link> for immediate assistance.
                </p>
              </div>
            </div>
          </section>

          <div className="pt-8 border-t border-dark-20">
            <p className="text-grey-70">
              Still have questions? <Link href="/support" className="text-red-45 hover:text-red-55">Contact our support team</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 