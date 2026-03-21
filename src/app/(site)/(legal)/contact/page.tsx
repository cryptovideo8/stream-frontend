import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-dark-6 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Contact Support</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8 text-grey-70">
            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">Get in Touch</h2>
              <p className="text-grey-70 mb-6">
                We&apos;re here to help! Send us a message and we&apos;ll respond as soon as possible.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-primary font-medium mb-1">Email</h3>
                  <p className="text-grey-70">support@nightking.com</p>
                </div>
                
                <div>
                  <h3 className="text-primary font-medium mb-1">Response Time</h3>
                  <p className="text-grey-70">Within 24 hours</p>
                </div>

                <div>
                  <h3 className="text-primary font-medium mb-1">Hours</h3>
                  <p className="text-grey-70">24/7 Support</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-primary mb-4">FAQ</h2>
              <p className="text-grey-70">
                Before contacting support, you might find your answer in our{' '}
                <Link href="/faq" className="text-red-45 hover:text-red-55">
                  FAQ section
                </Link>
                .
              </p>
            </section>
          </div>

          {/* Contact Form */}
          <div className="bg-dark-8 p-6 rounded-lg">
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-primary font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full bg-dark-12 border border-dark-25 rounded-md py-2 px-3 text-primary focus:outline-none focus:ring-2 focus:ring-red-45 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-primary font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full bg-dark-12 border border-dark-25 rounded-md py-2 px-3 text-primary focus:outline-none focus:ring-2 focus:ring-red-45 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-primary font-medium mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full bg-dark-12 border border-dark-25 rounded-md py-2 px-3 text-primary focus:outline-none focus:ring-2 focus:ring-red-45 focus:border-transparent"
                  required
                >
                  <option value="">Select a topic</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="account">Account Help</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-primary font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="w-full bg-dark-12 border border-dark-25 rounded-md py-2 px-3 text-primary focus:outline-none focus:ring-2 focus:ring-red-45 focus:border-transparent"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-red-45 hover:bg-red-55 text-primary font-medium py-2 px-4 rounded-md transition duration-200"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 