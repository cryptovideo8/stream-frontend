import { BRAND } from '../../../config/brand';

export default function DmcaPage() {
  return (
    <div className="min-h-screen bg-dark-6 text-white pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">DMCA / Copyright</h1>
        <p className="text-grey-70 text-sm mb-8">Last updated: July 11, 2026</p>
        <p className="text-grey-60 leading-relaxed mb-4">
          {BRAND.name} respects intellectual property rights. If you believe content on the platform infringes your copyright,
          please send a notice including: your contact details, identification of the work, the URL of the allegedly
          infringing material, a statement of good faith belief, and your signature (physical or electronic).
        </p>
        <p className="text-grey-60 leading-relaxed mb-4">
          Send notices to:{' '}
          <a className="text-red-45" href={`mailto:${BRAND.supportEmail}`}>
            {BRAND.supportEmail}
          </a>
        </p>
        <p className="text-grey-60 leading-relaxed">
          We may remove or disable access to material and, where appropriate, terminate repeat infringers.
        </p>
      </div>
    </div>
  );
}
