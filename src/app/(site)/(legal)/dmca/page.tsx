import { BRAND } from '../../../config/brand';

export default function DmcaPage() {
  return (
    <div className="min-h-screen bg-dark-6 text-primary pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">DMCA / Copyright Policy</h1>
        <p className="text-grey-70 text-sm mb-8">Last updated: July 11, 2026</p>

        <p className="text-grey-60 leading-relaxed mb-4">
          {BRAND.name} respects intellectual property rights. We respond to notices of alleged copyright
          infringement consistent with the Digital Millennium Copyright Act (17 U.S.C. § 512) and similar laws.
        </p>

        <h2 className="text-xl font-semibold text-primary mt-8 mb-3">Designated agent</h2>
        <p className="text-grey-60 leading-relaxed mb-4">
          Send copyright notices to our designated agent at:{' '}
          <a className="text-red-45" href={`mailto:${BRAND.supportEmail}`}>
            {BRAND.supportEmail}
          </a>
          <br />
          Subject line: <span className="text-primary">DMCA Notice — {BRAND.name}</span>
        </p>

        <h2 className="text-xl font-semibold text-primary mt-8 mb-3">Notice requirements</h2>
        <p className="text-grey-60 leading-relaxed mb-2">Your notice should include:</p>
        <ul className="list-disc pl-6 text-grey-60 space-y-2 mb-4">
          <li>Your physical or electronic signature</li>
          <li>Identification of the copyrighted work claimed to be infringed</li>
          <li>The URL or precise location of the allegedly infringing material on {BRAND.name}</li>
          <li>Your name, address, telephone number, and email</li>
          <li>A statement that you have a good-faith belief the use is not authorized</li>
          <li>A statement under penalty of perjury that the information is accurate and that you are authorized to act</li>
        </ul>

        <h2 className="text-xl font-semibold text-primary mt-8 mb-3">Counter-notification</h2>
        <p className="text-grey-60 leading-relaxed mb-4">
          If your content was removed and you believe it was a mistake or misidentification, you may send a
          counter-notification to the same address including your contact details, identification of the removed
          material, a statement under penalty of perjury of good-faith belief that removal was a mistake, consent
          to jurisdiction of the appropriate courts, and your signature. We may restore content after the statutory
          waiting period unless the complainant files an action.
        </p>

        <h2 className="text-xl font-semibold text-primary mt-8 mb-3">Repeat infringers</h2>
        <p className="text-grey-60 leading-relaxed">
          We may terminate accounts of users who are determined to be repeat infringers in appropriate circumstances.
        </p>
      </div>
    </div>
  );
}
