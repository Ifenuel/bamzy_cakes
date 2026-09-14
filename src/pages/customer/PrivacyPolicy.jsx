import SEO from '../../components/common/SEO.jsx'
import LegalLayout from '../../components/layout/LegalLayout.jsx'

const SECTIONS = [
  {
    title: 'Information We Collect',
    content: 'When you use Bamzy Cakes & Confectionery, we may collect:',
    points: [
      'Account Information — your full name, email address, and phone number when you create an account.',
      'Order Information — delivery addresses, order preferences, and payment references when you place an order.',
      'Booking Information — event details, guest counts, and service requirements when you submit a booking.',
      'Payment Information — transaction references processed through Paystack. We do not store your card details.',
      'Communication — messages you send through our contact form or newsletter subscriptions.',
    ],
  },
  {
    title: 'How We Use Your Information',
    content: 'We use the information we collect to:',
    points: [
      'Process and fulfil your orders, bookings, and training registrations.',
      'Communicate with you about your orders, bookings, and account activity.',
      'Send newsletter updates (only if you have subscribed).',
      'Improve our products, services, and website experience.',
      'Respond to your enquiries and provide customer support.',
      'Process payments securely through our payment partner, Paystack.',
    ],
  },
  {
    title: 'Information Sharing',
    content: 'We do not sell, trade, or rent your personal information to third parties. We may share limited information with:',
    points: [
      'Paystack — for payment processing. Your payment details are handled by Paystack\u2019s secure infrastructure.',
      'Delivery Partners — your name, phone number, and delivery address for order fulfilment.',
      'Legal Requirements — if required by law or to protect our legal rights.',
    ],
  },
  {
    title: 'Data Security',
    content: 'We take appropriate security measures to protect your personal information:',
    points: [
      'Passwords are encrypted and never stored in plain text.',
      'Payment processing is handled by PCI-compliant Paystack.',
      'Our website uses HTTPS encryption for all data transmission.',
      'Access to personal data is restricted to authorised personnel only.',
    ],
  },
  {
    title: 'Cookies & Tracking',
    content: 'Our website uses essential cookies to maintain your login session and shopping cart. We may also use analytics tools to understand how visitors use our website. You can control cookie settings through your browser preferences. Disabling essential cookies may affect website functionality.'
  },
  {
    title: 'Your Rights',
    content: 'You have the right to:',
    points: [
      'Access the personal information we hold about you.',
      'Request correction of inaccurate information.',
      'Request deletion of your account and personal data.',
      'Unsubscribe from our newsletter at any time.',
      'Opt out of non-essential data collection.',
    ],
  },
  {
    title: 'Data Retention',
    content: 'We retain your personal information for as long as your account is active or as needed to provide our services. Order and transaction records are retained for legal and accounting purposes. If you request account deletion, we will remove your personal data within 30 days, except where retention is required by law.'
  },
  {
    title: 'Children\u2019s Privacy',
    content: 'Our services are not directed to individuals under 18 years of age. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided personal information, please contact us to have it removed.'
  },
  {
    title: 'Changes to This Policy',
    content: 'We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. We encourage you to review this policy periodically.'
  },
  {
    title: 'Contact Us',
    content: 'If you have questions about this Privacy Policy or your personal data, please contact us:',
    points: [
      'Email: bamzycakes621@gmail.com',
      'Phone: +234 703 337 4470',
      'WhatsApp: +234 703 337 4470',
    ],
  },
]

export default function PrivacyPolicy() {
  return (
    <>
      <SEO title="Privacy Policy" description="How Bamzy Cakes & Confectionery collects, uses and protects your personal information." />
      <LegalLayout
        kind="privacy"
        title="Privacy Policy"
        description="Your privacy matters. Here is exactly what we collect, why we collect it, and how we keep it safe."
        updated="September 2026"
        intro="At Bamzy Cakes & Confectionery, your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website and services."
        sections={SECTIONS}
        footerNote="We are committed to keeping your data safe and being transparent about how it is used. Questions? We are always happy to help."
        crossLink={{ to: '/terms', label: 'Read our Terms & Conditions' }}
      />
    </>
  )
}
