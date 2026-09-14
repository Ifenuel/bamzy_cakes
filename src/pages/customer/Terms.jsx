import SEO from '../../components/common/SEO.jsx'
import LegalLayout from '../../components/layout/LegalLayout.jsx'

const sections = [
  {
    title: '1. Introduction',
    content: `Welcome to Bamzy Cakes & Confectionery. These Terms and Conditions govern your use of our website and services. By accessing or using our website, placing an order, or using any of our services, you agree to be bound by these terms. If you do not agree, please do not use our website.`
  },
  {
    title: '2. About Us',
    content: `Bamzy Cakes & Confectionery is a bakery and confectionery business based in Ibadan, Nigeria, offering cakes, pastries, small chops, event catering, and baking training services. These Terms apply to all customers, visitors, and users of our website and services.`
  },
  {
    title: '3. Products & Availability',
    content: `All products displayed on our website are subject to availability. We make every effort to ensure product descriptions, images, and prices are accurate. However, slight variations in colour, size, or appearance may occur due to the handmade nature of our products. Prices are subject to change without notice, though changes will not affect orders already confirmed.`
  },
  {
    title: '4. Orders & Payment',
    content: `When you place an order, you are making an offer to purchase a product. All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason, including product unavailability, errors in pricing, or suspected fraudulent activity.`,
    points: [
      'Payment is processed securely through Paystack — we never store your card details.',
      'An order is only confirmed after successful payment verification.',
    ]
  },
  {
    title: '5. Pricing',
    content: `All prices displayed on the website are in Nigerian Naira (₦) and include applicable taxes unless stated otherwise. Delivery fees are calculated at checkout based on your location and delivery zone. We reserve the right to change prices at any time, but confirmed orders will not be affected.`
  },
  {
    title: '6. Delivery',
    content: `We deliver across Southwest Nigeria, including Ibadan, Lagos, Ogun, Ondo, Ekiti, and Osun states. Delivery times are estimates and may vary due to traffic, weather, or other circumstances beyond our control. Delivery fees are calculated based on your delivery zone and are shown at checkout before you confirm your order. Please refer to our Delivery page for detailed information.`
  },
  {
    title: '7. Cancellations & Refunds',
    content: `Orders may be cancelled within 1 hour of placement if they have not yet been prepared. Once an order is being prepared or has been dispatched, cancellation is no longer possible. Refunds for failed or cancelled payments are processed automatically by Paystack.`,
    points: [
      'For other refund requests, please contact us within 24 hours of receiving your order with a valid reason.',
      'Custom cake orders and event bookings are non-refundable once preparation has begun.',
    ]
  },
  {
    title: '8. Events & Bookings',
    content: `Event bookings require a deposit to secure your date. The deposit amount and payment schedule will be communicated at the time of booking.`,
    points: [
      'Cancellations made more than 7 days before the event date may receive a partial refund of the deposit.',
      'Cancellations made within 7 days of the event are non-refundable.',
      'Event details (date, venue, guest count) can be modified up to 3 days before the event, subject to availability.',
    ]
  },
  {
    title: '9. Training & Workshops',
    content: `Training registrations are confirmed upon payment.`,
    points: [
      'Cancellations made at least 48 hours before the training date are eligible for a full refund.',
      'Cancellations within 48 hours are non-refundable but may be transferred to a future session, subject to availability.',
      'We reserve the right to reschedule or cancel a training session due to low enrollment or unforeseen circumstances. In such cases, registered participants will be offered a full refund or transfer to the next available session.',
    ]
  },
  {
    title: '10. Customer Accounts',
    content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration. We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity. One account per person — duplicate accounts may be removed.`
  },
  {
    title: '11. Reviews & Content',
    content: `When you submit a review or any content on our website, you grant us a non-exclusive, royalty-free licence to use, display, and reproduce that content. Reviews must be genuine and must not contain offensive, defamatory, or misleading information. We reserve the right to remove reviews that violate our guidelines.`
  },
  {
    title: '12. Intellectual Property',
    content: `All content on this website, including text, images, logos, graphics, and design elements, is the property of Bamzy Cakes & Confectionery and is protected by copyright laws. You may not reproduce, distribute, or create derivative works from any content without our written permission.`
  },
  {
    title: '13. Limitation of Liability',
    content: `Bamzy Cakes & Confectionery shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or services. Our total liability shall not exceed the total amount paid for the order or service in question. We are not responsible for delays caused by force majeure events, including natural disasters, strikes, or government actions.`
  },
  {
    title: '14. Privacy',
    content: `Your use of our website is also governed by our Privacy Policy, which describes how we collect, use, and protect your personal information. Please review our Privacy Policy to understand our practices.`
  },
  {
    title: '15. Changes to Terms',
    content: `We may update these Terms and Conditions from time to time. Changes will be posted on this page with an updated effective date. Continued use of the website after changes constitutes acceptance of the new terms. We encourage you to review this page periodically.`
  },
  {
    title: '16. Governing Law',
    content: `These Terms and Conditions are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be resolved in the courts of competent jurisdiction in Oyo State, Nigeria.`
  },
  {
    title: '17. Contact',
    content: `If you have any questions about these Terms and Conditions, please contact us through our Contact page or via WhatsApp. We are happy to clarify any points for you.`
  },
]

export default function Terms() {
  return (
    <>
      <SEO title="Terms & Conditions" description="Terms and Conditions for using the Bamzy Cakes & Confectionery website and services." />
      <LegalLayout
        kind="terms"
        title="Terms & Conditions"
        description="The rules and expectations that keep every Bamzy order, booking and training delightful and worry-free."
        updated="September 2026"
        intro="These Terms form the agreement between you and Bamzy Cakes & Confectionery whenever you browse, order, book an event, or register for a training on this website. Please read them carefully — they are written to be clear, fair, and easy to follow."
        sections={sections}
        footerNote="By using the Bamzy Cakes & Confectionery website, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. Thank you for choosing Bamzy — we look forward to serving you."
        crossLink={{ to: '/terms', label: 'Read our Terms & Conditions' }}
      />
    </>
  )
}
