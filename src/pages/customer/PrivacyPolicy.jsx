import { Shield } from 'lucide-react'
import Section from '../../components/layout/Section.jsx'
import PageContainer from '../../components/layout/PageContainer.jsx'

const SECTIONS = [
  {
    title: 'Information We Collect',
    content: `When you use Bamzy Cakes & Confectionery, we may collect the following information:

Account Information: Your full name, email address, and phone number when you create an account.
Order Information: Delivery addresses, order preferences, and payment references when you place an order.
Booking Information: Event details, guest counts, and service requirements when you submit a booking.
Payment Information: Transaction references processed through Paystack. We do not store your card details.
Communication: Messages you send through our contact form or newsletter subscriptions.`,
  },
  {
    title: 'How We Use Your Information',
    content: `We use the information we collect to:

Process and fulfil your orders, bookings, and training registrations.
Communicate with you about your orders, bookings, and account activity.
Send newsletter updates (only if you have subscribed).
Improve our products, services, and website experience.
Respond to your enquiries and provide customer support.
Process payments securely through our payment partner, Paystack.`,
  },
  {
    title: 'Information Sharing',
    content: `We do not sell, trade, or rent your personal information to third parties.

We may share limited information with:
Paystack: For payment processing. Your payment details are handled by Paystack's secure infrastructure.
Delivery Partners: Your name, phone number, and delivery address for order fulfilment.
Legal Requirements: If required by law or to protect our legal rights.`,
  },
  {
    title: 'Data Security',
    content: `We take appropriate security measures to protect your personal information:

Passwords are encrypted and never stored in plain text.
Payment processing is handled by PCI-compliant Paystack.
Our website uses HTTPS encryption for all data transmission.
Access to personal data is restricted to authorised personnel only.`,
  },
  {
    title: 'Cookies & Tracking',
    content: `Our website uses essential cookies to maintain your login session and shopping cart. We may also use analytics tools to understand how visitors use our website.

You can control cookie settings through your browser preferences. Disabling essential cookies may affect website functionality.`,
  },
  {
    title: 'Your Rights',
    content: `You have the right to:

Access the personal information we hold about you.
Request correction of inaccurate information.
Request deletion of your account and personal data.
Unsubscribe from our newsletter at any time.
Opt out of non-essential data collection.

To exercise any of these rights, please contact us at the details provided below.`,
  },
  {
    title: 'Data Retention',
    content: `We retain your personal information for as long as your account is active or as needed to provide our services.

Order and transaction records are retained for legal and accounting purposes. If you request account deletion, we will remove your personal data within 30 days, except where retention is required by law.`,
  },
  {
    title: 'Children\'s Privacy',
    content: `Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided personal information, please contact us to have it removed.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. We encourage you to review this policy periodically.`,
  },
]

export default function PrivacyPolicy() {
  return (
    <>
      <Section background="gradient" className="pt-10 pb-8 sm:pt-14 sm:pb-10">
        <PageContainer>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-pink shadow-soft">
              <Shield size={24} />
            </span>
            <div>
              <h1 className="font-heading text-3xl font-bold sm:text-4xl lg:text-5xl">Privacy Policy</h1>
              <p className="mt-1 text-ink-muted">How we collect, use and protect your information.</p>
            </div>
          </div>
        </PageContainer>
      </Section>

      <Section className="pt-8 pb-14 sm:pt-10 sm:pb-20">
        <PageContainer>
          <div className="mx-auto max-w-3xl">
            <p className="mb-8 text-sm text-ink-muted">
              Last updated: August 2026
            </p>

            <p className="mb-6 leading-relaxed text-ink-muted">
              At Bamzy Cakes & Confectionery, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services.
            </p>

            <div className="space-y-8">
              {SECTIONS.map((section) => (
                <div key={section.title}>
                  <h2 className="font-heading text-xl font-bold text-ink">{section.title}</h2>
                  <div className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-muted">
                    {section.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-xl2 border border-lilac-soft bg-brand-gradient-soft p-6">
              <h3 className="font-heading text-lg font-bold text-ink">Contact Us</h3>
              <p className="mt-2 text-sm text-ink-muted">
                If you have questions about this Privacy Policy or your personal data, please contact us:
              </p>
              <ul className="mt-3 space-y-1 text-sm text-ink-muted">
                <li><strong>Email:</strong> hello@bamzycakes.com</li>
                <li><strong>Phone:</strong> +234 703 337 4470</li>
                <li><strong>WhatsApp:</strong> +234 703 337 4470</li>
              </ul>
            </div>
          </div>
        </PageContainer>
      </Section>
    </>
  )
}
