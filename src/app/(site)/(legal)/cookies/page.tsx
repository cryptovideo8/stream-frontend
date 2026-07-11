import { BRAND } from '../../../config/brand';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-dark-6 text-primary pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-grey-70 text-sm mb-8">Last updated: July 11, 2026</p>
        <p className="text-grey-60 leading-relaxed mb-4">
          {BRAND.name} uses essential cookies and similar storage (including local browser storage) to keep you signed in,
          remember 18+ age verification and cookie preferences, and protect the service. We do not sell personal data.
        </p>
        <ul className="list-disc pl-6 text-grey-60 space-y-2 mb-4">
          <li>
            <span className="text-primary">Essential:</span> authentication, security, age gate, cookie consent choice
          </li>
          <li>
            <span className="text-primary">Optional analytics:</span> only if you choose &quot;Accept all&quot; on the consent banner
          </li>
        </ul>
        <p className="text-grey-60 leading-relaxed mb-4">
          You can clear cookies and site data in your browser settings. Doing so will sign you out and may show the age gate again.
        </p>
        <p className="text-grey-60 leading-relaxed">
          Contact:{' '}
          <a className="text-red-45" href={`mailto:${BRAND.supportEmail}`}>
            {BRAND.supportEmail}
          </a>
        </p>
      </div>
    </div>
  );
}
