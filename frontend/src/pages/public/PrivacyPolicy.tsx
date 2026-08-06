import { Reveal } from '@/components/Reveal';

export function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-[760px] px-5 pb-28 pt-32 sm:px-8">
      <Reveal>
        <div className="eyebrow mb-5">Legal</div>
        <h1 className="text-[clamp(2rem,5vw,3rem)]">Privacy Policy &amp; Disclaimer</h1>
        <p className="mt-5 text-ink-soft">Last updated: 2026.</p>
      </Reveal>

      <div className="mt-12 grid gap-9 text-ink-soft">
        <section>
          <h2 className="mb-2 text-[1.15rem] font-bold text-ink">This site belongs to the college</h2>
          <p>
            This portal is an official internal tool of Nagarjuna College of Engineering &amp; Technology for
            its Smart India Hackathon 2026 cycle, and is connected to and operated under the college's own
            domain and institutional identity.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[1.15rem] font-bold text-ink">Where the content comes from</h2>
          <p>
            The information published on this site — SIH details, timelines, problem statements, announcements,
            principal and coordinator messages, and any other institutional content — is provided by Nagarjuna
            College of Engineering &amp; Technology. The developers have only built the platform that displays
            and manages this content; we did not author it and are not responsible for its accuracy.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[1.15rem] font-bold text-ink">Who decides the results</h2>
          <p>
            Screening decisions, scores, feedback, and the final list of selected teams are determined entirely
            by the college's coordinators, SPOC, and management team through the review process built into this
            portal. The developers do not review submissions, do not influence scoring, and are not responsible
            for the outcome of any team's screening or selection.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[1.15rem] font-bold text-ink">Ownership of the platform</h2>
          <p>
            The design, code, and technical implementation of this portal were built by Partha Shankar and
            Nirmith M Jain. All rights to the platform itself belong to its developer, Partha Shankar. This is
            separate from the institutional content described above, which remains the college's own.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[1.15rem] font-bold text-ink">What data we collect</h2>
          <p>
            To run registration and screening, the portal stores the information you provide when you sign up
            or submit work: your name, college email, department, year, team details, and any links you submit
            for Level 1 / Level 2 review or for "Spread the Spark." Uploaded files are stored with our object
            storage provider (Cloudinary); everything else is stored in our database. This data is used only to
            run the SIH screening process at this college and is not sold or shared with unrelated third
            parties.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[1.15rem] font-bold text-ink">Questions</h2>
          <p>
            For questions about screening or your data, contact a coordinator via the Contact page. For
            technical issues with the portal itself, reach out to a developer through the LinkedIn links in the
            footer.
          </p>
        </section>
      </div>
    </div>
  );
}
