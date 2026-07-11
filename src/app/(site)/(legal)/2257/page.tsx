import { BRAND } from '../../../config/brand';

export default function RecordKeeping2257Page() {
  return (
    <div className="min-h-screen bg-dark-6 text-white pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">18 U.S.C. § 2257 Record-Keeping Statement</h1>
        <p className="text-grey-70 text-sm mb-8">Last updated: July 11, 2026</p>

        <p className="text-grey-60 leading-relaxed mb-4">
          {BRAND.name} is not the primary producer (as defined in 18 U.S.C. § 2257 and 28 C.F.R. 75)
          of the visual content uploaded by independent third-party creators. Content appearing on this
          website is uploaded by users who represent that all persons depicted were 18 years of age or older
          at the time of creation and that required records are maintained where legally mandated.
        </p>

        <p className="text-grey-60 leading-relaxed mb-4">
          For content where {BRAND.name} acts as a secondary producer or platform host, age-verification
          and record-keeping obligations remain with the uploading creator. Creators must be able to produce
          government-issued identification records upon lawful request.
        </p>

        <p className="text-grey-60 leading-relaxed mb-4">
          Questions regarding this statement or requests related to records may be directed to:{' '}
          <a className="text-red-45" href={`mailto:${BRAND.supportEmail}`}>
            {BRAND.supportEmail}
          </a>
        </p>

        <p className="text-grey-60 leading-relaxed text-sm">
          This page is provided for transparency. It is not legal advice. Operators and creators should
          consult counsel regarding applicable record-keeping duties in their jurisdictions.
        </p>
      </div>
    </div>
  );
}
